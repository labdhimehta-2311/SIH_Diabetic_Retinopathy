function metrics = calculateMetrics(patientLog, cfg, timeSeries, steadyStateMask)
% CALCULATEMETRICS Comprehensive metrics calculation & bottleneck detection
%
% Computes throughput, latency statistics (mean, median, P95, max),
% queue lengths, resource utilizations, stage-wise delay contributions,
% and automatically diagnoses the binding system bottleneck.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 4 || isempty(steadyStateMask)
        steadyStateMask = true(height(patientLog), 1);
    end

    metrics = struct();

    % Patient counts
    totalArrived   = height(patientLog);
    completedMask  = patientLog.Completed;
    totalCompleted = sum(completedMask);
    totalRemaining = totalArrived - totalCompleted;

    metrics.totalArrived   = totalArrived;
    metrics.totalCompleted = totalCompleted;
    metrics.totalRemaining = totalRemaining;

    % Throughput
    simTimeSec = cfg.simulationTime;
    simTimeHours = simTimeSec / 3600;
    metrics.throughputPerHour = totalCompleted / simTimeHours;
    metrics.throughputPerMin  = totalCompleted / (simTimeSec / 60);

    % Latencies for completed patients
    validLog = patientLog(completedMask, :);
    if isempty(validLog)
        metrics.avgLatency = NaN;
        metrics.medianLatency = NaN;
        metrics.p95Latency = NaN;
        metrics.maxLatency = NaN;
        metrics.bottleneckStage = 'System Overloaded (No Completions)';
        return;
    end

    latencies = validLog.TotalLatency;
    metrics.avgLatency    = mean(latencies);
    metrics.medianLatency = median(latencies);
    metrics.p95Latency    = prctile(latencies, 95);
    metrics.maxLatency    = max(latencies);
    metrics.stdLatency    = std(latencies);

    % Stage-wise Delays
    % 1. Patient Queue Waiting Time
    patientWait = validLog.CheckinStart - validLog.ArrivalTime;
    checkinServ = validLog.CheckinEnd - validLog.CheckinStart;

    % 2. Image Capture
    captureWait = validLog.CaptureStart - validLog.CheckinEnd;
    captureServ = validLog.CaptureEnd - validLog.CaptureStart;

    % 3. Network Delay
    networkDelay = validLog.NetworkEnd - validLog.NetworkStart;

    % 4. AI Queue & Service
    aiWait = validLog.AIStart - validLog.AIQueueEntry;
    aiServ = validLog.AIEnd - validLog.AIStart;

    % 5. Doctor Queue & Review
    docWait = validLog.DocStart - validLog.DocQueueEntry;
    docServ = validLog.DocEnd - validLog.DocStart;

    metrics.avgPatientQueueWait = mean(patientWait);
    metrics.avgCheckinService   = mean(checkinServ);
    metrics.avgCaptureWait      = mean(captureWait);
    metrics.avgCaptureService   = mean(captureServ);
    metrics.avgNetworkDelay     = mean(networkDelay);
    metrics.avgAIQueueWait      = mean(aiWait);
    metrics.avgAIService        = mean(aiServ);
    metrics.avgDoctorQueueWait  = mean(docWait);
    metrics.avgDoctorService    = mean(docServ);

    % Verification: Stage sum vs total latency
    stageSum = mean(patientWait + checkinServ + captureWait + captureServ + ...
                    networkDelay + aiWait + aiServ + docWait + docServ);
    metrics.stageSumDelay       = stageSum;
    metrics.latencyResidual     = abs(stageSum - metrics.avgLatency);

    % Queue lengths (from continuous time-series)
    if nargin >= 3 && ~isempty(timeSeries)
        metrics.avgPatientQueue = mean(timeSeries.patientQueue);
        metrics.maxPatientQueue = max(timeSeries.patientQueue);
        metrics.avgAIQueue      = mean(timeSeries.aiQueue);
        metrics.maxAIQueue      = max(timeSeries.aiQueue);
        metrics.avgDoctorQueue  = mean(timeSeries.doctorQueue);
        metrics.maxDoctorQueue  = max(timeSeries.doctorQueue);
    else
        metrics.avgPatientQueue = mean(patientWait) * (cfg.arrivalRate / 3600); % Little's Law approx
        metrics.maxPatientQueue = NaN;
        metrics.avgAIQueue      = mean(aiWait) * (cfg.arrivalRate / 3600);
        metrics.maxAIQueue      = NaN;
        metrics.avgDoctorQueue  = mean(docWait) * (cfg.arrivalRate / 3600);
        metrics.maxDoctorQueue  = NaN;
    end

    % Resource Utilizations
    % rho = Total Service Time / (Simulation Duration * Number of Servers)
    metrics.checkinUtilization = min(1.0, sum(checkinServ) / (simTimeSec * 1.0));
    metrics.captureUtilization = min(1.0, sum(captureServ) / (simTimeSec * max(1, cfg.numberOfCaptureDev)));
    if cfg.numberOfAIWorkers > 0
        metrics.aiUtilization  = min(1.0, sum(aiServ) / (simTimeSec * cfg.numberOfAIWorkers));
    else
        metrics.aiUtilization  = 0.0;
    end
    metrics.doctorUtilization  = min(1.0, sum(docServ) / (simTimeSec * max(1, cfg.numberOfDoctors)));

    % Network Delay Contribution Percentage
    metrics.networkDelayContributionPct = (metrics.avgNetworkDelay / metrics.avgLatency) * 100;

    % Automated Bottleneck Diagnosis
    % Identify stage with highest utilization and growing queue
    utilizations = [
        metrics.checkinUtilization, ...
        metrics.captureUtilization, ...
        metrics.aiUtilization, ...
        metrics.doctorUtilization
    ];
    stageNames = {'Check-in Desk', 'Fundus Image Capture', 'AI Processing Cluster', 'Doctor Review Station'};
    [maxUtil, bIdx] = max(utilizations);

    if maxUtil >= 0.85
        metrics.bottleneckStage = stageNames{bIdx};
    elseif maxUtil >= 0.70
        metrics.bottleneckStage = sprintf('%s (Sub-critical saturation)', stageNames{bIdx});
    else
        metrics.bottleneckStage = 'None (Balanced Flow / Well-Dimensioned)';
    end

    % AI-Assisted Risk Prioritization Metrics
    highRiskMask = validLog.IsHighRisk;
    if any(highRiskMask) && any(~highRiskMask)
        metrics.avgHighRiskDocWait = mean(docWait(highRiskMask));
        metrics.avgLowRiskDocWait  = mean(docWait(~highRiskMask));
        metrics.maxHighRiskDocWait = max(docWait(highRiskMask));
        metrics.p95HighRiskDocWait = prctile(docWait(highRiskMask), 95);
        metrics.priorityBenefitPct = ((metrics.avgLowRiskDocWait - metrics.avgHighRiskDocWait) / ...
                                       max(1e-3, metrics.avgLowRiskDocWait)) * 100;
    else
        metrics.avgHighRiskDocWait = mean(docWait);
        metrics.avgLowRiskDocWait  = mean(docWait);
        metrics.maxHighRiskDocWait = max(docWait);
        metrics.p95HighRiskDocWait = prctile(docWait, 95);
        metrics.priorityBenefitPct = 0;
    end

end
