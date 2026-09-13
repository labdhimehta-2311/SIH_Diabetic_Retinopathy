function runAllExperiments()
% RUNALLEXPERIMENTS Master Automated Experimentation Suite for SIH 2026
%
% Executes the complete Member 6 simulation, queueing analysis, and system
% validation battery in one command:
%   1. Configures baseline and proposed operational models
%   2. Simulates Baseline Manual vs Proposed AI-Assisted workflows
%   3. Executes patient-load sweeps (10 to 120 patients/hour)
%   4. Conducts resource-scaling experiments (Scenarios A through E)
%   5. Evaluates network latency degradation (10ms to 1000ms)
%   6. Evaluates AI-assisted risk triage vs standard FIFO queueing
%   7. Computes local sensitivity analysis and parameter impact rankings
%   8. Executes high-load stress testing & saturation boundary analysis
%   9. Performs Monte Carlo replications with 95% confidence intervals
%  10. Exports comprehensive CSV and MAT result packages
%  11. Generates all 14 publication-grade presentation figures
%  12. Renders the SIH performance dashboard and engineering findings
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    clc;
    fprintf('========================================================================\n');
    fprintf('   SMART INDIA HACKATHON 2026: DIABETIC RETINOPATHY SCREENING           \n');
    fprintf('   MEMBER 6: DISCRETE-EVENT SIMULATION & QUEUE PERFORMANCE VALIDATION   \n');
    fprintf('========================================================================\n\n');

    scriptDir = fileparts(mfilename('fullpath'));
    addpath(scriptDir);
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end

    % 1. Baseline Traditional Workflow (Manual Doctor Grading, No AI)
    fprintf('[STEP 1/9] Simulating Baseline Manual Screening Workflow ...\n');
    cfgBaseline = simulationConfig('workflowType', 'baseline', 'arrivalRate', 30);
    [resBaseline, pLogBaseline, ~] = runSimulation(cfgBaseline);

    % 2. Proposed AI-Assisted Screening Workflow (M1-M4 AI Pipeline + Triage)
    fprintf('[STEP 2/9] Simulating Proposed AI-Assisted Screening Workflow ...\n');
    cfgProposed = simulationConfig('workflowType', 'proposed', 'arrivalRate', 30);
    [resProposed, pLogProposed, tSeriesProposed] = runSimulation(cfgProposed);

    % 3. Comprehensive Patient Load Experiments
    fprintf('\n[STEP 3/9] Executing Patient Load Sweeps (10 to 120 pts/hr) ...\n');
    [loadTable, detailedRuns] = runExperiments([10, 20, 30, 40, 50, 60, 70, 80, 100, 120]);

    % 4. Infrastructure & Resource Scaling (Scenarios A-E)
    fprintf('\n[STEP 4/9] Evaluating Resource Allocation (Scenarios A through E) ...\n');
    scalingTable = runResourceScaling(60);

    % 5. Tele-Ophthalmology Network Latency Analysis
    fprintf('\n[STEP 5/9] Evaluating Network Communication Latencies ...\n');
    netTable = runNetworkAnalysis([10, 50, 100, 200, 500, 1000]);

    % 6. AI-Assisted Priority Triage vs FIFO Scheduling
    fprintf('\n[STEP 6/9] Evaluating AI Risk Prioritization Queue ...\n');
    triageTable = runAITriageComparison(45);

    % 7. Sensitivity Analysis & Stress Capacity Testing
    fprintf('\n[STEP 7/9] Running Sensitivity Analysis & Stress Tests ...\n');
    rankedSensitivity = runSensitivityAnalysis();
    stressReport = runStressTest();

    % 8. Monte Carlo Statistical Validation
    fprintf('\n[STEP 8/9] Executing Monte Carlo Statistical Validation ...\n');
    mcSummary = runMonteCarlo(15, [20, 40, 60, 80]);

    % Save complete structured MAT workspace
    matFilePath = fullfile(resultsDir, 'simulation_results.mat');
    save(matFilePath, 'resProposed', 'resBaseline', 'loadTable', 'scalingTable', ...
         'netTable', 'triageTable', 'rankedSensitivity', 'stressReport', 'mcSummary');
    fprintf('Complete results archive saved to: %s\n', matFilePath);

    % 9. Plotting & Dashboard Rendering
    fprintf('\n[STEP 9/9] Generating Presentation Visualizations & Dashboard ...\n');
    plotResults(loadTable, detailedRuns, scalingTable, netTable, triageTable);
    generateDashboard(resProposed, resBaseline);

    fprintf('========================================================================\n');
    fprintf('           MEMBER 6 SIMULATION SUITE COMPLETED SUCCESSFULLY             \n');
    fprintf('========================================================================\n');

end
