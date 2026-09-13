function mcSummary = runMonteCarlo(numReplications, testLoads)
% RUNMONTECARLO Multi-Seed Statistical Validation & 95% Confidence Intervals
%
% Executes stochastic Monte Carlo replications across patient loads to ensure
% statistical robustness and eliminate random-seed variance.
%
% Computes:
%   - Sample Mean
%   - Standard Deviation (sigma)
%   - 95% Confidence Interval (CI95 = mean +- 1.96 * s / sqrt(N))
% for Latency, Throughput, and Doctor Queue Length.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1 || isempty(numReplications)
        numReplications = 15; % Number of independent random seed trials
    end
    if nargin < 2 || isempty(testLoads)
        testLoads = [20, 40, 60, 80]; % Evaluated arrival loads
    end

    fprintf('========================================================================\n');
    fprintf('  RUNNING MONTE CARLO SIMULATION (%d Replications per Load)\n', numReplications);
    fprintf('========================================================================\n');

    numLoads = length(testLoads);

    loadVec       = zeros(numLoads, 1);
    latMeanVec    = zeros(numLoads, 1);
    latStdVec     = zeros(numLoads, 1);
    latCI95Vec    = zeros(numLoads, 1);
    thrMeanVec    = zeros(numLoads, 1);
    thrStdVec     = zeros(numLoads, 1);
    thrCI95Vec    = zeros(numLoads, 1);
    docQMeanVec   = zeros(numLoads, 1);
    docQStdVec    = zeros(numLoads, 1);
    docQCI95Vec   = zeros(numLoads, 1);

    for i = 1:numLoads
        lam = testLoads(i);
        fprintf('[LOAD %3d pts/hr] Running %d stochastic replications ... ', lam, numReplications);

        latTrials  = zeros(numReplications, 1);
        thrTrials  = zeros(numReplications, 1);
        docQTrials = zeros(numReplications, 1);

        for rep = 1:numReplications
            seed = 1000 * i + rep;
            cfg = simulationConfig('arrivalRate', lam, 'randomSeed', seed);
            [res, ~, ~] = runSimulation(cfg);

            latTrials(rep)  = res.avgLatency;
            thrTrials(rep)  = res.throughputPerHour;
            docQTrials(rep) = res.avgDoctorQueue;
        end

        loadVec(i)     = lam;
        latMeanVec(i)  = mean(latTrials);
        latStdVec(i)   = std(latTrials);
        latCI95Vec(i)  = 1.96 * (latStdVec(i) / sqrt(numReplications));

        thrMeanVec(i)  = mean(thrTrials);
        thrStdVec(i)   = std(thrTrials);
        thrCI95Vec(i)  = 1.96 * (thrStdVec(i) / sqrt(numReplications));

        docQMeanVec(i) = mean(docQTrials);
        docQStdVec(i)  = std(docQTrials);
        docQCI95Vec(i) = 1.96 * (docQStdVec(i) / sqrt(numReplications));

        fprintf('Mean Lat: %5.1f +- %4.1fs | Mean Thr: %4.1f +- %3.1f pts/hr\n', ...
            latMeanVec(i), latCI95Vec(i), thrMeanVec(i), thrCI95Vec(i));
    end

    mcSummary = table(loadVec, latMeanVec, latStdVec, latCI95Vec, ...
        thrMeanVec, thrStdVec, thrCI95Vec, docQMeanVec, docQStdVec, docQCI95Vec, ...
        'VariableNames', {'ArrivalRate_pts_hr', 'MeanLatency_s', 'StdLatency_s', 'CI95_Latency_s', ...
                          'MeanThroughput_pts_hr', 'StdThroughput_pts_hr', 'CI95_Throughput_pts_hr', ...
                          'MeanDoctorQueue', 'StdDoctorQueue', 'CI95_DoctorQueue'});

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(mcSummary, fullfile(resultsDir, 'monte_carlo_results.csv'));

end
