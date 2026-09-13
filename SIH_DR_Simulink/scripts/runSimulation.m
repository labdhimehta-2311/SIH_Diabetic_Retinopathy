function [results, patientLog, timeSeries] = runSimulation(cfg)
% RUNSIMULATION Discrete-Event Simulation (DES) Engine for DR Screening Workflow
%
% Implements a discrete-event simulation of the diabetic retinopathy screening
% workflow: Patient Arrival -> Triage/Check-in -> Image Capture (+ Recapture)
% -> Network Transmission -> AI Inference (Multi-Worker) -> Doctor Review
% (Multi-Doctor, optional AI-priority) -> Screening Output -> Exit.
%
% Fully self-contained: Uses robust local random generators (safeExpRnd,
% safeNormRnd, safeBetaRnd) built on base MATLAB rand/randn to eliminate
% dependencies on optional toolboxes and avoid script shadowing issues.
%
% Inputs:
%   cfg - Simulation configuration struct (from simulationConfig.m)
%
% Outputs:
%   results    - Summary performance metrics structure
%   patientLog - Comprehensive per-patient execution timeline table
%   timeSeries - Continuous time-series of queue sizes and resource utilizations
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    if nargin < 1
        cfg = simulationConfig();
    end

    % Set reproducible random seed
    rng(cfg.randomSeed, 'twister');

    simDuration = cfg.simulationTime;

    % -------------------------------------------------------------------------
    % Step 1: Generate Patient Arrival Times and Profiles
    % -------------------------------------------------------------------------
    meanInterArrival = 3600 / cfg.arrivalRate; % Mean inter-arrival time in seconds

    arrivalTimes = [];
    tCurr = 0;
    while tCurr < simDuration
        if strcmpi(cfg.arrivalPattern, 'poisson')
            dt = safeExpRnd(meanInterArrival);
        else
            dt = meanInterArrival; % Deterministic
        end
        tCurr = tCurr + dt;
        if tCurr < simDuration
            arrivalTimes(end+1) = tCurr; %#ok<AGROW>
        end
    end

    numPatients = length(arrivalTimes);
    if numPatients == 0
        warning('runSimulation:noArrivals', 'No patients arrived during simulation duration.');
        results = struct(); patientLog = table(); timeSeries = struct();
        return;
    end

    % Preallocate patient record structures
    % Fields: ID, ArrivalTime, CheckinStart, CheckinEnd, CaptureStart, CaptureEnd,
    % NetworkStart, NetworkEnd, AIQueueEntry, AIStart, AIEnd, DocQueueEntry,
    % DocStart, DocEnd, ExitTime, TotalLatency, RiskScore, IsHighRisk, IsEmergency
    patients = repmat(struct(...
        'ID', 0, 'ArrivalTime', 0, ...
        'CheckinStart', NaN, 'CheckinEnd', NaN, ...
        'CaptureStart', NaN, 'CaptureEnd', NaN, ...
        'NetworkStart', NaN, 'NetworkEnd', NaN, ...
        'AIQueueEntry', NaN, 'AIStart', NaN, 'AIEnd', NaN, ...
        'DocQueueEntry', NaN, 'DocStart', NaN, 'DocEnd', NaN, ...
        'ExitTime', NaN, 'TotalLatency', NaN, ...
        'RiskScore', 0, 'IsHighRisk', false, 'IsEmergency', false, ...
        'Completed', false), numPatients, 1);

    for i = 1:numPatients
        patients(i).ID = i;
        patients(i).ArrivalTime = arrivalTimes(i);
        patients(i).IsEmergency = (rand() < cfg.emergencyProb);
        % Simulated AI Risk Score: Beta distribution skewed towards lower risk, with moderate/severe tail
        patients(i).RiskScore = safeBetaRnd(1.8, 3.5);
        patients(i).IsHighRisk = (patients(i).RiskScore >= cfg.highRiskThreshold) || patients(i).IsEmergency;
    end

    % -------------------------------------------------------------------------
    % Discrete Event Tracking Setup
    % Stations:
    % 1. Check-in Desk (1 server)
    % 2. Image Capture Camera (cfg.numberOfCaptureDev servers)
    % 3. Network Transmission (delay pipe)
    % 4. AI Inference Server (cfg.numberOfAIWorkers servers)
    % 5. Doctor Review Station (cfg.numberOfDoctors servers)
    % -------------------------------------------------------------------------

    % Servers busy-until timestamps
    checkinBusyUntil = 0;
    captureBusyUntil = zeros(1, max(1, cfg.numberOfCaptureDev));
    aiBusyUntil      = zeros(1, max(1, cfg.numberOfAIWorkers));
    doctorBusyUntil  = zeros(1, max(1, cfg.numberOfDoctors));

    % Event list / queue structures
    % 1. Stage: Check-in
    for i = 1:numPatients
        arrT = patients(i).ArrivalTime;
        % Service time for check-in
        sCheckin = max(5, safeNormRnd(cfg.checkinTime, cfg.checkinStd));
        tStart = max(arrT, checkinBusyUntil);
        tEnd = tStart + sCheckin;
        checkinBusyUntil = tEnd;

        patients(i).CheckinStart = tStart;
        patients(i).CheckinEnd   = tEnd;
    end

    % 2. Stage: Image Capture
    for i = 1:numPatients
        readyT = patients(i).CheckinEnd;
        % Find earliest available camera
        [earliestFree, devIdx] = min(captureBusyUntil);
        tStart = max(readyT, earliestFree);
        % Image capture duration with possible retry
        sCapture = max(10, safeNormRnd(cfg.imageCaptureTime, cfg.imageCaptureStd));
        if rand() < cfg.imageRecaptureProb
            sCapture = sCapture + max(10, safeNormRnd(cfg.imageCaptureTime * 0.7, cfg.imageCaptureStd));
        end
        tEnd = tStart + sCapture;
        captureBusyUntil(devIdx) = tEnd;

        patients(i).CaptureStart = tStart;
        patients(i).CaptureEnd   = tEnd;
    end

    % 3. Stage: Network Transmission (Cloud Uplink)
    for i = 1:numPatients
        readyT = patients(i).CaptureEnd;
        patients(i).NetworkStart = readyT;
        if strcmpi(cfg.networkMode, 'fixed')
            netDelaySec = cfg.networkDelay / 1000;
        else
            % Stochastic delay (normal with jitter)
            meanDelay = cfg.networkDelay / 1000;
            jitter = cfg.networkJitter / 1000;
            netDelaySec = max(0.005, safeNormRnd(meanDelay, jitter));
        end
        patients(i).NetworkEnd = readyT + netDelaySec;
        patients(i).AIQueueEntry = patients(i).NetworkEnd;
    end

    % 4. Stage: AI Inference Server (Modules M1-M4)
    if strcmpi(cfg.workflowType, 'proposed') && cfg.numberOfAIWorkers > 0
        % Sort by AI queue arrival
        aiArrivals = [patients.AIQueueEntry];
        [~, aiOrder] = sort(aiArrivals);

        for k = 1:numPatients
            idx = aiOrder(k);
            readyT = patients(idx).AIQueueEntry;

            [earliestFree, wIdx] = min(aiBusyUntil);
            tStart = max(readyT, earliestFree);
            sAI = max(0.1, safeNormRnd(cfg.aiProcessingTime, cfg.aiProcessingStd));
            tEnd = tStart + sAI;
            aiBusyUntil(wIdx) = tEnd;

            patients(idx).AIStart = tStart;
            patients(idx).AIEnd   = tEnd;
            patients(idx).DocQueueEntry = tEnd;
        end
    else
        % Baseline manual mode (no AI inference stage)
        for i = 1:numPatients
            patients(i).AIStart = patients(i).AIQueueEntry;
            patients(i).AIEnd   = patients(i).AIQueueEntry;
            patients(i).DocQueueEntry = patients(i).AIQueueEntry;
        end
    end

    % 5. Stage: Doctor Review Station
    % Priority logic: if cfg.enablePriorityQueue is true, high risk patients jump ahead of low risk
    % We simulate this using an event calendar for doctor review
    doctorReadyPatients = [patients.DocQueueEntry];
    [~, docEntryOrder] = sort(doctorReadyPatients);

    if ~cfg.enablePriorityQueue
        % Standard FIFO
        for k = 1:numPatients
            idx = docEntryOrder(k);
            readyT = patients(idx).DocQueueEntry;
            [earliestFree, dIdx] = min(doctorBusyUntil);
            tStart = max(readyT, earliestFree);
            sDoc = max(10, safeNormRnd(cfg.doctorReviewTime, cfg.doctorReviewStd));
            tEnd = tStart + sDoc;
            doctorBusyUntil(dIdx) = tEnd;

            patients(idx).DocStart = tStart;
            patients(idx).DocEnd   = tEnd;
            patients(idx).ExitTime = tEnd;
            patients(idx).TotalLatency = tEnd - patients(idx).ArrivalTime;
            if tEnd <= simDuration
                patients(idx).Completed = true;
            end
        end
    else
        % AI-Assisted Priority Queue
        % High-risk patients are scheduled before normal patients when both wait in queue
        pendingPatients = docEntryOrder;
        curSimTime = 0;

        while ~isempty(pendingPatients)
            [earliestDocFree, dIdx] = min(doctorBusyUntil);
            curSimTime = max(curSimTime, earliestDocFree);

            % Patients that have arrived at doctor queue by min(curSimTime, earliestDocFree)
            availMask = arrayfun(@(p) patients(p).DocQueueEntry <= curSimTime, pendingPatients);
            if ~any(availMask)
                % Advance time to next patient arrival at doctor queue
                nextArrivals = arrayfun(@(p) patients(p).DocQueueEntry, pendingPatients);
                [minNextArr, nextIdxInPending] = min(nextArrivals);
                curSimTime = minNextArr;
                chosenPatient = pendingPatients(nextIdxInPending);
                pendingPatients(nextIdxInPending) = [];
            else
                % Candidates currently waiting
                candidateIndices = pendingPatients(availMask);
                % Prioritize: HighRisk first, then earliest DocQueueEntry
                isHigh = arrayfun(@(p) patients(p).IsHighRisk, candidateIndices);
                if any(isHigh)
                    highCandidates = candidateIndices(isHigh);
                    [~, earIdx] = min(arrayfun(@(p) patients(p).DocQueueEntry, highCandidates));
                    chosenPatient = highCandidates(earIdx);
                else
                    [~, earIdx] = min(arrayfun(@(p) patients(p).DocQueueEntry, candidateIndices));
                    chosenPatient = candidateIndices(earIdx);
                end
                pendingPatients(pendingPatients == chosenPatient) = [];
            end

            readyT = patients(chosenPatient).DocQueueEntry;
            tStart = max(readyT, earliestDocFree);
            sDoc = max(10, safeNormRnd(cfg.doctorReviewTime, cfg.doctorReviewStd));
            tEnd = tStart + sDoc;
            doctorBusyUntil(dIdx) = tEnd;

            patients(chosenPatient).DocStart = tStart;
            patients(chosenPatient).DocEnd   = tEnd;
            patients(chosenPatient).ExitTime = tEnd;
            patients(chosenPatient).TotalLatency = tEnd - patients(chosenPatient).ArrivalTime;
            if tEnd <= simDuration
                patients(chosenPatient).Completed = true;
            end
        end
    end

    % -------------------------------------------------------------------------
    % Step 6: Convert to Patient Log Table & Apply Warm-Up Filtering
    % -------------------------------------------------------------------------
    patientLog = struct2table(patients);

    % Warm-up filtering for steady-state evaluation
    warmupTime = simDuration * cfg.warmupFraction;
    steadyStateMask = patientLog.ArrivalTime >= warmupTime & patientLog.Completed;
    completedPatients = patientLog(patientLog.Completed, :);
    ssPatients = patientLog(steadyStateMask, :);

    % -------------------------------------------------------------------------
    % Step 7: Continuous Time-Series Sampling (Queue Lengths over Time)
    % -------------------------------------------------------------------------
    tSample = 0:30:simDuration; % Sample every 30 seconds
    numSamples = length(tSample);
    qPatient = zeros(1, numSamples);
    qAI      = zeros(1, numSamples);
    qDoctor  = zeros(1, numSamples);

    for s = 1:numSamples
        t = tSample(s);
        % Waiting in Patient/Checkin Queue: Arrived <= t & CheckinStart > t
        qPatient(s) = sum(patientLog.ArrivalTime <= t & (patientLog.CheckinStart > t | isnan(patientLog.CheckinStart)));
        % Waiting in AI Queue: AIQueueEntry <= t & AIStart > t
        qAI(s)      = sum(patientLog.AIQueueEntry <= t & (patientLog.AIStart > t | isnan(patientLog.AIStart)));
        % Waiting in Doctor Queue: DocQueueEntry <= t & DocStart > t
        qDoctor(s)  = sum(patientLog.DocQueueEntry <= t & (patientLog.DocStart > t | isnan(patientLog.DocStart)));
    end

    timeSeries = struct(...
        'time', tSample, ...
        'patientQueue', qPatient, ...
        'aiQueue', qAI, ...
        'doctorQueue', qDoctor);

    % -------------------------------------------------------------------------
    % Step 8: Calculate Performance Metrics
    % -------------------------------------------------------------------------
    results = calculateMetrics(patientLog, cfg, timeSeries, steadyStateMask);
    results.cfg = cfg;

end

% =========================================================================
% ROBUST LOCAL RANDOM GENERATORS (Independent of Statistics Toolbox)
% =========================================================================

function r = safeExpRnd(mu)
    % Exponential distribution generator via inverse transform
    r = -mu * log(max(1e-12, rand()));
end

function r = safeNormRnd(mu, sigma)
    % Normal distribution generator via core MATLAB randn
    r = mu + sigma * randn();
end

function r = safeBetaRnd(a, b)
    % Beta distribution generator via Gamma ratio
    g1 = sampleGamma(a);
    g2 = sampleGamma(b);
    if (g1 + g2) > 0
        r = g1 / (g1 + g2);
    else
        r = rand();
    end
end

function g = sampleGamma(alpha)
    % Marsaglia & Tsang method for generating Gamma(alpha, 1) using core rand & randn
    if alpha < 1
        g = sampleGamma(alpha + 1) * (rand()^(1 / alpha));
        return;
    end
    d = alpha - 1/3;
    c = 1 / sqrt(9 * d);
    while true
        z = randn();
        v = (1 + c * z)^3;
        if v <= 0, continue; end
        u = rand();
        if u < 1 - 0.0331 * (z^4)
            g = d * v;
            return;
        end
        if log(u) < 0.5 * (z^2) + d * (1 - v + log(v))
            g = d * v;
            return;
        end
    end
end
