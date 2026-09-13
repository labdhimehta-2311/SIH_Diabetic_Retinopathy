function netTable = runNetworkAnalysis(networkDelays)
% RUNNETWORKANALYSIS Telemedicine Network Latency Impact on Screening Workflow
%
% Tests network communication delays between remote rural primary health centres
% (PHCs) and central cloud/edge AI servers.
%
% Delays evaluated (default):
%   10 ms   - High-speed Urban Fiber
%   50 ms   - Urban 5G/4G Broadband
%   100 ms  - Typical Semi-Urban 4G
%   200 ms  - Remote Wireless / Rural 4G
%   500 ms  - Rural Satellite / Congested VSAT
%   1000 ms - High-latency Remote Satellite Link
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1 || isempty(networkDelays)
        networkDelays = [10, 50, 100, 200, 500, 1000];
    end

    fprintf('========================================================================\n');
    fprintf('  RUNNING NETWORK DELAY SENSITIVITY EXPERIMENT (10 ms to 1000 ms)\n');
    fprintf('========================================================================\n');

    numDelays = length(networkDelays);
    delayVec       = zeros(numDelays, 1);
    avgLatVec      = zeros(numDelays, 1);
    p95LatVec      = zeros(numDelays, 1);
    throughputVec  = zeros(numDelays, 1);
    netContribVec  = zeros(numDelays, 1);
    statusVec      = cell(numDelays, 1);

    for k = 1:numDelays
        dMs = networkDelays(k);
        fprintf('[NET DELAY %4d ms] Running simulation ... ', dMs);

        cfg = simulationConfig('networkDelay', dMs, 'arrivalRate', 30);
        [res, ~, ~] = runSimulation(cfg);

        delayVec(k)      = dMs;
        avgLatVec(k)     = res.avgLatency;
        p95LatVec(k)     = res.p95Latency;
        throughputVec(k) = res.throughputPerHour;
        netContribVec(k) = res.networkDelayContributionPct;

        if netContribVec(k) < 2.0
            statusVec{k} = 'Negligible Impact (< 2% latency)';
        elseif netContribVec(k) < 10.0
            statusVec{k} = 'Acceptable Rural Latency (< 10%)';
        else
            statusVec{k} = 'Significant Delay (> 10% total latency)';
        end

        fprintf('Avg Latency: %6.1fs | Net Contribution: %5.2f%% | %s\n', ...
            res.avgLatency, res.networkDelayContributionPct, statusVec{k});
    end

    netTable = table(delayVec, avgLatVec, p95LatVec, throughputVec, netContribVec, statusVec, ...
        'VariableNames', {'NetworkDelay_ms', 'AvgLatency_s', 'P95Latency_s', ...
                          'Throughput_pts_hr', 'NetworkContribution_pct', 'ClinicalFeasibility'});

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(netTable, fullfile(resultsDir, 'network_analysis.csv'));

end
