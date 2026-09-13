function scalingTable = runResourceScaling(testArrivalRate)
% RUNRESOURCESCALING Resource Allocation & Infrastructure Optimization (Scenarios A-E)
%
% Compares 5 distinct architectural deployment profiles to identify the optimal
% allocation of AI compute instances vs specialist doctor staffing:
%   Scenario A: 1 AI Worker  + 1 Doctor  (Minimalist / Entry Tier)
%   Scenario B: 2 AI Workers + 1 Doctor  (Baseline AI Cluster)
%   Scenario C: 4 AI Workers + 1 Doctor  (High AI Compute, Doctor-constrained)
%   Scenario D: 4 AI Workers + 2 Doctors (Balanced Tele-ophthalmology Center)
%   Scenario E: 8 AI Workers + 3 Doctors (Regional Hub / Hospital Tier)
%
% Evaluates: Latency, Throughput, Queue Dynamics, Resource Utilizations.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1 || isempty(testArrivalRate)
        testArrivalRate = 60; % Stress arrival rate to highlight resource limits
    end

    fprintf('========================================================================\n');
    fprintf('  RUNNING RESOURCE SCALING EXPERIMENT (Scenarios A through E at %d pts/hr)\n', testArrivalRate);
    fprintf('========================================================================\n');

    scenarios = {
        'Scenario A (1 AI, 1 Doc)', 1, 1;
        'Scenario B (2 AI, 1 Doc)', 2, 1;
        'Scenario C (4 AI, 1 Doc)', 4, 1;
        'Scenario D (4 AI, 2 Doc)', 4, 2;
        'Scenario E (8 AI, 3 Doc)', 8, 3;
    };

    numScenarios = size(scenarios, 1);
    scenarioNames = cell(numScenarios, 1);
    aiWorkersVec  = zeros(numScenarios, 1);
    doctorsVec    = zeros(numScenarios, 1);
    throughputVec = zeros(numScenarios, 1);
    avgLatVec     = zeros(numScenarios, 1);
    p95LatVec     = zeros(numScenarios, 1);
    avgAIQueueVec = zeros(numScenarios, 1);
    avgDocQueueVec= zeros(numScenarios, 1);
    aiUtilVec     = zeros(numScenarios, 1);
    docUtilVec    = zeros(numScenarios, 1);
    bottleneckVec = cell(numScenarios, 1);

    for s = 1:numScenarios
        sName = scenarios{s, 1};
        numAI = scenarios{s, 2};
        numDoc = scenarios{s, 3};

        fprintf('[%s] Simulating with %d AI workers and %d doctors ... ', sName, numAI, numDoc);

        cfg = simulationConfig(...
            'arrivalRate', testArrivalRate, ...
            'numberOfAIWorkers', numAI, ...
            'numberOfDoctors', numDoc);

        [res, ~, ~] = runSimulation(cfg);

        scenarioNames{s}  = sName;
        aiWorkersVec(s)   = numAI;
        doctorsVec(s)     = numDoc;
        throughputVec(s)  = res.throughputPerHour;
        avgLatVec(s)      = res.avgLatency;
        p95LatVec(s)      = res.p95Latency;
        avgAIQueueVec(s)  = res.avgAIQueue;
        avgDocQueueVec(s) = res.avgDoctorQueue;
        aiUtilVec(s)      = res.aiUtilization * 100;
        docUtilVec(s)     = res.doctorUtilization * 100;
        bottleneckVec{s}  = res.bottleneckStage;

        fprintf('Throughput: %5.1f pts/hr | Avg Lat: %6.1fs | Bottleneck: %s\n', ...
            res.throughputPerHour, res.avgLatency, res.bottleneckStage);
    end

    scalingTable = table(scenarioNames, aiWorkersVec, doctorsVec, throughputVec, ...
        avgLatVec, p95LatVec, avgAIQueueVec, avgDocQueueVec, aiUtilVec, docUtilVec, bottleneckVec, ...
        'VariableNames', {'Scenario', 'AI_Workers', 'Doctors', 'Throughput_pts_hr', ...
                          'AvgLatency_s', 'P95Latency_s', 'AvgAIQueue', 'AvgDoctorQueue', ...
                          'AI_Utilization_pct', 'Doctor_Utilization_pct', 'BottleneckStage'});

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(scalingTable, fullfile(resultsDir, 'scaling_comparison.csv'));

end
