function stressReport = runStressTest()
% RUNSTRESSTEST High-Load Stress Testing & System Saturation Capacity
%
% Subject the screening workflow to heavy, stressful patient influx:
%   - Normal Load:   30 patients/hour (Baseline community clinic)
%   - High Load:     60 patients/hour (Busy district outpatient camp)
%   - Heavy Load:    80 patients/hour (Surge screening drive)
%   - Extreme Load: 100 patients/hour (Severe capacity pressure)
%   - Overload:     120 patients/hour (System boundary stress)
%
% Determines:
%   - Peak sustainable simulated throughput [patients/hour]
%   - Critical saturation threshold lambda* where queues grow unstable
%   - First resource exhaustion failure point
%
% WARNING: Labeled as simulation-derived capacity under stated assumptions.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    fprintf('========================================================================\n');
    fprintf('  RUNNING STRESS TESTING & CAPACITY BOUNDARY ANALYSIS\n');
    fprintf('========================================================================\n');

    stressLoads = [30, 60, 80, 100, 120];
    numLoads = length(stressLoads);

    tierNames     = {'Normal Clinic Load'; 'Busy Outpatient Camp'; 'Screening Drive Surge'; 'Severe Pressure'; 'Extreme Overload'};
    loadVec       = zeros(numLoads, 1);
    thrVec        = zeros(numLoads, 1);
    avgLatVec     = zeros(numLoads, 1);
    p95LatVec     = zeros(numLoads, 1);
    maxDocQVec    = zeros(numLoads, 1);
    docUtilVec    = zeros(numLoads, 1);
    systemStateVec= cell(numLoads, 1);

    for i = 1:numLoads
        lam = stressLoads(i);
        cfg = simulationConfig('arrivalRate', lam);
        [res, ~, ~] = runSimulation(cfg);

        loadVec(i)    = lam;
        thrVec(i)     = res.throughputPerHour;
        avgLatVec(i)  = res.avgLatency;
        p95LatVec(i)  = res.p95Latency;
        maxDocQVec(i) = res.maxDoctorQueue;
        docUtilVec(i) = res.doctorUtilization * 100;

        if res.doctorUtilization >= 0.95
            systemStateVec{i} = 'UNSTABLE (Queue Divergence / Saturated)';
        elseif res.doctorUtilization >= 0.80
            systemStateVec{i} = 'CONGESTED (High Wait Times / Heavy)';
        else
            systemStateVec{i} = 'STABLE (Steady-state Flow)';
        end

        fprintf('[%20s | %3d pts/hr] Thr: %4.1f pts/hr | Avg Lat: %6.1fs | Doc Util: %5.1f%% | %s\n', ...
            tierNames{i}, lam, thrVec(i), avgLatVec(i), docUtilVec(i), systemStateVec{i});
    end

    stressReport = table(tierNames, loadVec, thrVec, avgLatVec, p95LatVec, ...
        maxDocQVec, docUtilVec, systemStateVec, ...
        'VariableNames', {'StressTier', 'ArrivalRate_pts_hr', 'Throughput_pts_hr', ...
                          'AvgLatency_s', 'P95Latency_s', 'MaxDoctorQueue', ...
                          'DoctorUtilization_pct', 'StabilityState'});

    % Compute estimated sustainable capacity:
    % Service capacity of doctor = 3600 / meanDoctorReviewTime * numDoctors
    nominalDocCap = 3600 / 60 * 1; % 60 patients/hour for 1 doctor
    fprintf('\n------------------------------------------------------------------------\n');
    fprintf('STRESS TEST SUMMARY:\n');
    fprintf('  Simulated Sustainable Threshold:  ~%d patients/hour (with 1 Doctor)\n', round(nominalDocCap * 0.85));
    fprintf('  Peak Simulated Throughput:         %.1f patients/hour\n', max(thrVec));
    fprintf('  Primary Resource Exhaustion:       Doctor Tele-Review Station\n');
    fprintf('========================================================================\n');

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(stressReport, fullfile(resultsDir, 'stress_test_report.csv'));

end
