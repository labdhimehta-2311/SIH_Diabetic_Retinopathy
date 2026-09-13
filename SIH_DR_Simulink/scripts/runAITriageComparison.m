function triageTable = runAITriageComparison(arrivalRate)
% RUNAITRIAGECOMPARISON FIFO vs AI-Risk Priority Queue Evaluation
%
% Compares standard First-In-First-Out (FIFO) queueing with an AI-Assisted
% Risk Prioritization Queue where patients graded as high risk (severe/PDR or
% urgent lesions) are prioritized for ophthalmologist tele-review.
%
% Calculates:
%   - High-risk patient waiting time
%   - Low-risk patient waiting time
%   - Maximum and 95th percentile waiting times
%   - Safety metric: Wait time reduction for emergent/critical pathology
%
% NOTE: This is an operational workflow simulation feature evaluating scheduling
% dynamics, NOT a clinical trial claim.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1 || isempty(arrivalRate)
        arrivalRate = 45; % Moderate/high load to observe queue prioritization dynamics
    end

    fprintf('========================================================================\n');
    fprintf('  RUNNING AI-ASSISTED TRIAGE / PRIORITY QUEUE COMPARISON (%d pts/hr)\n', arrivalRate);
    fprintf('========================================================================\n');

    % 1. Standard FIFO Run
    fprintf('[MODE 1] Simulating Standard FIFO Queueing ... ');
    cfgFIFO = simulationConfig('arrivalRate', arrivalRate, 'enablePriorityQueue', false);
    [resFIFO, pLogFIFO, ~] = runSimulation(cfgFIFO);
    fprintf('Done. High-Risk Wait: %5.1fs | Low-Risk Wait: %5.1fs\n', ...
        resFIFO.avgHighRiskDocWait, resFIFO.avgLowRiskDocWait);

    % 2. AI-Priority Run
    fprintf('[MODE 2] Simulating AI-Assisted Priority Queueing ... ');
    cfgPriority = simulationConfig('arrivalRate', arrivalRate, 'enablePriorityQueue', true);
    [resPriority, pLogPriority, ~] = runSimulation(cfgPriority);
    fprintf('Done. High-Risk Wait: %5.1fs | Low-Risk Wait: %5.1fs\n', ...
        resPriority.avgHighRiskDocWait, resPriority.avgLowRiskDocWait);

    % Metric comparisons
    queueModes = {'Standard FIFO'; 'AI-Assisted Priority Queue'};
    avgHighRiskWait = [resFIFO.avgHighRiskDocWait; resPriority.avgHighRiskDocWait];
    p95HighRiskWait = [resFIFO.p95HighRiskDocWait; resPriority.p95HighRiskDocWait];
    maxHighRiskWait = [resFIFO.maxHighRiskDocWait; resPriority.maxHighRiskDocWait];
    avgLowRiskWait  = [resFIFO.avgLowRiskDocWait; resPriority.avgLowRiskDocWait];
    overallAvgLat   = [resFIFO.avgLatency; resPriority.avgLatency];
    overallThrough  = [resFIFO.throughputPerHour; resPriority.throughputPerHour];
    doctorUtil      = [resFIFO.doctorUtilization * 100; resPriority.doctorUtilization * 100];

    highRiskReductionPct = ((resFIFO.avgHighRiskDocWait - resPriority.avgHighRiskDocWait) / ...
                            max(1e-3, resFIFO.avgHighRiskDocWait)) * 100;

    benefitText = {
        'Baseline FIFO (No Triage)';
        sprintf('High-Risk Wait Reduced by %.1f%%', highRiskReductionPct)
    };

    triageTable = table(queueModes, avgHighRiskWait, p95HighRiskWait, maxHighRiskWait, ...
        avgLowRiskWait, overallAvgLat, overallThrough, doctorUtil, benefitText, ...
        'VariableNames', {'QueueDiscipline', 'AvgHighRiskWait_s', 'P95HighRiskWait_s', 'MaxHighRiskWait_s', ...
                          'AvgLowRiskWait_s', 'OverallAvgLatency_s', 'Throughput_pts_hr', ...
                          'DoctorUtilization_pct', 'ClinicalWorkflowImpact'});

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(triageTable, fullfile(resultsDir, 'ai_triage_comparison.csv'));

end
