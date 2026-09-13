function [loadResultsTable, detailedRuns] = runExperiments(arrivalRates)
% RUNEXPERIMENTS Patient Load Sweeps for SIH DR Screening DES
%
% Evaluates system behavior across a broad spectrum of patient arrival rates
% (default: 10, 20, 30, 40, 50, 60, 70, 80, 100, 120 patients/hour).
%
% Calculates throughput, latencies (mean, median, P95), queue dynamics,
% resource utilizations, and automated bottleneck detection for each load.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1 || isempty(arrivalRates)
        arrivalRates = [10, 20, 30, 40, 50, 60, 70, 80, 100, 120];
    end

    fprintf('========================================================================\n');
    fprintf('  RUNNING PATIENT-LOAD EXPERIMENTS (10 to 120 patients/hour)\n');
    fprintf('========================================================================\n');

    numLoads = length(arrivalRates);
    detailedRuns = cell(numLoads, 1);

    % Preallocate table arrays
    arrRateVec    = zeros(numLoads, 1);
    arrivedVec    = zeros(numLoads, 1);
    completedVec  = zeros(numLoads, 1);
    remainingVec  = zeros(numLoads, 1);
    throughputVec = zeros(numLoads, 1);
    avgLatVec     = zeros(numLoads, 1);
    medLatVec     = zeros(numLoads, 1);
    p95LatVec     = zeros(numLoads, 1);
    maxLatVec     = zeros(numLoads, 1);
    ptQueueVec    = zeros(numLoads, 1);
    aiQueueVec    = zeros(numLoads, 1);
    docQueueVec   = zeros(numLoads, 1);
    aiUtilVec     = zeros(numLoads, 1);
    docUtilVec    = zeros(numLoads, 1);
    captUtilVec   = zeros(numLoads, 1);
    netContribVec = zeros(numLoads, 1);
    bottleneckVec = cell(numLoads, 1);

    for k = 1:numLoads
        lambda = arrivalRates(k);
        fprintf('[LOAD %2d/%2d] Simulating arrival rate: %3d patients/hour ... ', k, numLoads, lambda);

        cfg = simulationConfig('arrivalRate', lambda);
        [res, pLog, tSeries] = runSimulation(cfg);

        detailedRuns{k} = struct('cfg', cfg, 'results', res, 'patientLog', pLog, 'timeSeries', tSeries);

        arrRateVec(k)    = lambda;
        arrivedVec(k)    = res.totalArrived;
        completedVec(k)  = res.totalCompleted;
        remainingVec(k)  = res.totalRemaining;
        throughputVec(k) = res.throughputPerHour;
        avgLatVec(k)     = res.avgLatency;
        medLatVec(k)     = res.medianLatency;
        p95LatVec(k)     = res.p95Latency;
        maxLatVec(k)     = res.maxLatency;
        ptQueueVec(k)    = res.avgPatientQueue;
        aiQueueVec(k)    = res.avgAIQueue;
        docQueueVec(k)   = res.avgDoctorQueue;
        aiUtilVec(k)     = res.aiUtilization * 100;
        docUtilVec(k)    = res.doctorUtilization * 100;
        captUtilVec(k)   = res.captureUtilization * 100;
        netContribVec(k) = res.networkDelayContributionPct;
        bottleneckVec{k} = res.bottleneckStage;

        fprintf('Done. Completed: %3d | Avg Lat: %6.1fs | Bottleneck: %s\n', ...
            res.totalCompleted, res.avgLatency, res.bottleneckStage);
    end

    loadResultsTable = table(arrRateVec, arrivedVec, completedVec, remainingVec, ...
        throughputVec, avgLatVec, medLatVec, p95LatVec, maxLatVec, ...
        ptQueueVec, aiQueueVec, docQueueVec, ...
        aiUtilVec, docUtilVec, captUtilVec, netContribVec, bottleneckVec, ...
        'VariableNames', {'ArrivalRate_pts_hr', 'TotalArrived', 'TotalCompleted', 'TotalRemaining', ...
                          'Throughput_pts_hr', 'AvgLatency_s', 'MedianLatency_s', 'P95Latency_s', 'MaxLatency_s', ...
                          'AvgPatientQueue', 'AvgAIQueue', 'AvgDoctorQueue', ...
                          'AI_Utilization_pct', 'Doctor_Utilization_pct', 'Capture_Utilization_pct', ...
                          'NetworkContribution_pct', 'BottleneckStage'});

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end

    csvPath = fullfile(resultsDir, 'summary_metrics.csv');
    writetable(loadResultsTable, csvPath);
    fprintf('\nSummary metrics successfully written to: %s\n', csvPath);

end
