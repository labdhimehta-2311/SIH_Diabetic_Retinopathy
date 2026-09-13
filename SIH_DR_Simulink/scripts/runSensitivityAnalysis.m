function rankedSensitivity = runSensitivityAnalysis()
% RUNSENSITIVITYANALYSIS Local Sensitivity Analysis & Parameter Elasticity
%
% Perturbs key operational parameters around nominal operating values (30 pts/hr)
% to quantify relative impact on screening latency, throughput, and queue depth:
%   1. Doctor Review Time (+-30%)
%   2. Patient Arrival Rate (+-25%)
%   3. AI Processing Time (+-50%)
%   4. Network Delay (+-100%)
%   5. Number of Doctors (+1)
%   6. Number of AI Workers (+2)
%
% Generates a ranked engineering table showing which parameters exert the
% greatest leverage on system responsiveness and clinical capacity.
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    fprintf('========================================================================\n');
    fprintf('  RUNNING SENSITIVITY ANALYSIS & PARAMETER IMPACT RANKING\n');
    fprintf('========================================================================\n');

    baseCfg = simulationConfig('arrivalRate', 30);
    [baseRes, ~, ~] = runSimulation(baseCfg);
    baseLat = baseRes.avgLatency;
    baseThr = baseRes.throughputPerHour;

    % Parameter perturbation specifications
    perturbations = {
        'Doctor Review Time',  'doctorReviewTime',  baseCfg.doctorReviewTime * 1.30,  '+30%';
        'Doctor Review Time',  'doctorReviewTime',  baseCfg.doctorReviewTime * 0.70,  '-30%';
        'Patient Arrival Rate','arrivalRate',       baseCfg.arrivalRate * 1.25,       '+25%';
        'Patient Arrival Rate','arrivalRate',       baseCfg.arrivalRate * 0.75,       '-25%';
        'AI Processing Time',  'aiProcessingTime',  baseCfg.aiProcessingTime * 1.50,  '+50%';
        'AI Processing Time',  'aiProcessingTime',  baseCfg.aiProcessingTime * 0.50,  '-50%';
        'Network Delay',       'networkDelay',      baseCfg.networkDelay * 2.00,      '+100%';
        'Network Delay',       'networkDelay',      baseCfg.networkDelay * 0.50,      '-50%';
        'Doctor Count',        'numberOfDoctors',   baseCfg.numberOfDoctors + 1,      '+1 Doctor';
        'AI Workers Count',    'numberOfAIWorkers', baseCfg.numberOfAIWorkers + 2,    '+2 Workers';
    };

    numPert = size(perturbations, 1);
    paramNames = cell(numPert, 1);
    deltaLabels= cell(numPert, 1);
    newLatVec  = zeros(numPert, 1);
    deltaLatPct= zeros(numPert, 1);
    newThrVec  = zeros(numPert, 1);
    deltaThrPct= zeros(numPert, 1);
    impactRank = zeros(numPert, 1);

    for i = 1:numPert
        pName  = perturbations{i, 1};
        pField = perturbations{i, 2};
        pVal   = perturbations{i, 3};
        pLabel = perturbations{i, 4};

        cfgPert = simulationConfig(pField, pVal);
        [resPert, ~, ~] = runSimulation(cfgPert);

        paramNames{i}  = pName;
        deltaLabels{i} = pLabel;
        newLatVec(i)   = resPert.avgLatency;
        deltaLatPct(i) = ((resPert.avgLatency - baseLat) / baseLat) * 100;
        newThrVec(i)   = resPert.throughputPerHour;
        deltaThrPct(i) = ((resPert.throughputPerHour - baseThr) / baseThr) * 100;

        fprintf('[%20s | %10s] Latency: %6.1fs (%+5.1f%%) | Thr: %4.1f (%+5.1f%%)\n', ...
            pName, pLabel, resPert.avgLatency, deltaLatPct(i), resPert.throughputPerHour, deltaThrPct(i));
    end

    % Sort by absolute latency impact
    [~, sortIdx] = sort(abs(deltaLatPct), 'descend');
    for r = 1:numPert
        impactRank(sortIdx(r)) = r;
    end

    rankedSensitivity = table(impactRank, paramNames, deltaLabels, newLatVec, deltaLatPct, ...
        newThrVec, deltaThrPct, ...
        'VariableNames', {'SensitivityRank', 'ParameterName', 'Perturbation', ...
                          'ResultingLatency_s', 'LatencyImpact_pct', ...
                          'ResultingThroughput_pts_hr', 'ThroughputImpact_pct'});

    rankedSensitivity = sortrows(rankedSensitivity, 'SensitivityRank');

    % Save results
    scriptDir = fileparts(mfilename('fullpath'));
    resultsDir = fullfile(scriptDir, '..', 'results');
    if ~isfolder(resultsDir), mkdir(resultsDir); end
    writetable(rankedSensitivity, fullfile(resultsDir, 'sensitivity_report.csv'));

end
