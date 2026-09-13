function cfg = simulationConfig(varargin)
% SIMULATIONCONFIG Central parameter configuration for SIH DR Screening DES
%
% Defines all operational parameters for the Diabetic Retinopathy screening
% workflow simulation, including arrival rates, service stations, network
% latency, resource counts, queue capacities, and random seeds.
%
% Usage:
%   cfg = simulationConfig();                       % Default configuration
%   cfg = simulationConfig('arrivalRate', 45);      % Override arrival rate
%   cfg = simulationConfig('numberOfDoctors', 2);   % Override doctor count
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    % Initialize default parameter structure
    cfg = struct();

    % -------------------------------------------------------------------------
    % 1. Patient Arrival Configuration
    % -------------------------------------------------------------------------
    cfg.arrivalRate         = 30;           % Patient arrival rate [patients/hour]
    cfg.arrivalPattern      = 'poisson';    % 'poisson' (exponential inter-arrival) or 'deterministic'
    cfg.simulationTime      = 28800;        % Total simulation duration [seconds] (8-hour clinic shift)
    cfg.warmupFraction      = 0.10;         % Transient warm-up fraction to discard for steady-state (10%)
    cfg.randomSeed          = 42;           % Master random seed for reproducible Monte Carlo runs

    % -------------------------------------------------------------------------
    % 2. Triage & Check-in Station
    % -------------------------------------------------------------------------
    cfg.checkinTime         = 30;           % Mean check-in time [seconds]
    cfg.checkinDistribution = 'lognormal';  % Service time distribution ('lognormal', 'gamma', 'fixed')
    cfg.checkinStd          = 5;            % Standard deviation of check-in time [seconds]
    cfg.patientQueueCapacity= Inf;          % Maximum capacity of waiting room queue (Inf = unconstrained)

    % -------------------------------------------------------------------------
    % 3. Retinal / Fundus Image Capture Station
    % -------------------------------------------------------------------------
    cfg.imageCaptureTime    = 25;           % Fundus image acquisition time [seconds]
    cfg.imageCaptureStd     = 6;            % Standard deviation [seconds]
    cfg.imageRecaptureProb  = 0.05;         % Probability of poor image quality triggering recapture (5%)
    cfg.numberOfCaptureDev  = 1;            % Number of fundus cameras / technician booths

    % -------------------------------------------------------------------------
    % 4. Network Transmission Channel (Field/PHC to Cloud AI Server)
    % -------------------------------------------------------------------------
    cfg.networkDelay        = 100;          % Nominal round-trip network latency [milliseconds]
    cfg.networkJitter       = 20;           % Network jitter / stochastic latency deviation [ms]
    cfg.networkMode         = 'stochastic'; % 'fixed' or 'stochastic' (gamma/normal distribution)

    % -------------------------------------------------------------------------
    % 5. AI Inference Server (Modules M1-M4)
    % -------------------------------------------------------------------------
    cfg.aiProcessingTime    = 2.0;          % AI pipeline inference latency [seconds] (calibrated M1-M4)
    cfg.aiProcessingStd     = 0.3;          % AI variance due to GPU batching/payload size [seconds]
    cfg.numberOfAIWorkers   = 2;            % Parallel AI processing server instances/threads
    cfg.aiQueueCapacity     = Inf;          % AI submission queue capacity

    % -------------------------------------------------------------------------
    % 6. Ophthalmologist Doctor Review Station
    % -------------------------------------------------------------------------
    cfg.doctorReviewTime    = 60;           % Mean doctor tele-review time with AI assistance [seconds]
    cfg.doctorReviewStd     = 15;           % Doctor review variability [seconds]
    cfg.numberOfDoctors     = 1;            % Number of licensed ophthalmologists available
    cfg.doctorQueueCapacity = Inf;          % Tele-ophthalmology queue capacity

    % -------------------------------------------------------------------------
    % 7. Triage & Risk Prioritization
    % -------------------------------------------------------------------------
    cfg.enablePriorityQueue = false;        % false = Standard FIFO; true = AI-assisted priority queue
    cfg.emergencyProb       = 0.02;         % Probability of acute ocular emergency requiring fast-track ED (2%)
    cfg.highRiskThreshold   = 0.70;         % AI confidence threshold for high-risk priority escalation
    cfg.referralRate        = 0.35;         % Expected proportion of referable DR cases requiring doctor review

    % -------------------------------------------------------------------------
    % 8. Baseline vs Proposed Mode Flag
    % -------------------------------------------------------------------------
    cfg.workflowType        = 'proposed';   % 'proposed' (AI-assisted) or 'baseline' (traditional manual)
    % For 'baseline', doctorReviewTime is typically 180s and no AI triage is used.

    % -------------------------------------------------------------------------
    % Parse User Overrides (Name-Value pairs)
    % -------------------------------------------------------------------------
    if nargin > 0
        for i = 1:2:length(varargin)
            paramName = varargin{i};
            paramValue = varargin{i+1};
            if isfield(cfg, paramName)
                cfg.(paramName) = paramValue;
            else
                warning('simulationConfig:unknownParam', 'Unknown configuration parameter "%s" ignored.', paramName);
            end
        end
    end

    % If baseline mode selected, apply traditional healthcare assumptions
    if strcmpi(cfg.workflowType, 'baseline')
        cfg.aiProcessingTime  = 0;          % No AI assistance
        cfg.numberOfAIWorkers = 0;
        cfg.doctorReviewTime  = 180;        % Full manual evaluation: 3 minutes per patient
        cfg.doctorReviewStd   = 35;
        cfg.enablePriorityQueue = false;    % No automated triage
    end

end
