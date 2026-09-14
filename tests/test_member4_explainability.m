function results = test_member4_explainability()
% TEST_MEMBER4_EXPLAINABILITY Comprehensive unit test suite for Member 4
%
% Tests:
%   1. Central Configuration & Clinical Mappings
%   2. Temperature-Scaled Confidence Calibration
%   3. Grad-CAM Activation Saliency Generation
%   4. Colormap Alpha Blending Overlay
%   5. Pathophysiological Lesion-Grade Concordance
%   6. Clinical Evidence Synthesis
%   7. Telemedicine Screening Report Generation
%
% Usage:
%   results = test_member4_explainability()
%
% Authors: SIH 2026 Team (Member 4: labdhimehta-2311)

    clc;
    fprintf('========================================================================\n');
    fprintf('  RUNNING MEMBER 4 (EXPLAINABLE AI & REPORTING) TEST SUITE\n');
    fprintf('  Author: labdhimehta-2311\n');
    fprintf('========================================================================\n\n');

    thisDir = fileparts(mfilename('fullpath'));
    rootDir = fileparts(thisDir);
    addpath(rootDir);
    addpath(fullfile(rootDir, 'config'));
    addpath(fullfile(rootDir, 'src', 'explainability'));

    passCount = 0;
    failCount = 0;

    % Create synthetic test fundus image
    synthImg = uint8(repmat(linspace(50, 200, 224), 224, 1));
    synthImg = cat(3, synthImg, uint8(synthImg * 0.6), uint8(synthImg * 0.2));

    %% TEST 1: Project Configuration & Clinical Mappings
    try
        cfg = projectConfig();
        assert(isstruct(cfg), 'projectConfig must return a struct');
        assert(isfield(cfg, 'explainability'), 'Missing explainability config');
        assert(cfg.explainability.tempScaleT > 1.0, 'Temperature parameter must be > 1.0');

        mapping = getClinicalMappings();
        assert(length(mapping) == 5, 'Must provide exactly 5 clinical levels (Grades 0-4)');
        m2 = getClinicalMappings(2);
        assert(m2.referableDR == true, 'Grade 2 must be marked referable');

        fprintf('[PASS] Test 1: Configuration & ICDR Clinical Mappings verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 1: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 2: Temperature-Scaled Probability Calibration
    try
        rawProbs = [0.02, 0.05, 0.88, 0.03, 0.02];
        [calProbs, calConf, ece, info] = calibrateConfidence(rawProbs, 1.35);

        assert(abs(sum(calProbs) - 1.0) < 1e-4, 'Calibrated probabilities must sum to 1.0');
        assert(calConf < max(rawProbs), 'Temperature scaling (T > 1) must soften overconfidence');
        [~, rawIdx] = max(rawProbs);
        [~, calIdx] = max(calProbs);
        assert(rawIdx == calIdx, 'Temperature scaling must preserve argmax prediction');
        assert(info.calibratedEntropy > info.rawEntropy, 'Calibrated entropy must increase');

        fprintf('[PASS] Test 2: Probability Calibration (T=1.35) mathematically verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 2: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 3: Grad-CAM Activation Saliency Generation
    try
        [camMap, layerUsed] = generateGradCAM(synthImg, [], 2);
        assert(all(size(camMap) == [224, 224]), 'camMap must match input spatial dimensions');
        assert(min(camMap(:)) >= 0.0 && max(camMap(:)) <= 1.0, 'camMap values must be in [0.0, 1.0]');
        assert(~isempty(layerUsed), 'Must report feature layer used');

        % Test gradCAM wrapper with reversed argument order
      camMapWrapper = projectGradCAM([], synthImg, 2);
        assert(all(size(camMapWrapper) == [224, 224]), 'Wrapper must handle reversed arguments');

        fprintf('[PASS] Test 3: Grad-CAM Saliency Engine verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 3: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 4: Alpha-Blended Clinical Heatmap Overlay
    try
        camMap = rand(224, 224);
        overlay = overlayGradCAM(synthImg, camMap, 0.45, 'jet');

        assert(isa(overlay, 'uint8'), 'Overlay must be uint8 array');
        assert(all(size(overlay) == [224, 224, 3]), 'Overlay must be 3-channel RGB image');

        fprintf('[PASS] Test 4: Alpha-blended visual overlay verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 4: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 5: Pathophysiological Lesion Concordance
    try
        % Normal fundus without lesions
        [conc0, ev0, ~, flag0] = correlateLesionsWithGrade(0);
        assert(strcmp(conc0, 'HIGHLY_CONCORDANT'), 'Grade 0 with no lesions must be highly concordant');
        assert(flag0 == false, 'Grade 0 with no lesions should not trigger discrepancy');

        % Discrepancy test: Grade 0 with high lesion count
        badLesion = struct();
        badLesion.microaneurysms.count = 15;
        badLesion.exudates.areaPixels = 500;
        badLesion.exudates.clusters = 4;
        badLesion.hemorrhages.areaPixels = 300;
        badLesion.hemorrhages.count = 10;
        badLesion.hemorrhages.quadrantsInvolved = 3;
        badLesion.neovascularization.detected = false;
        badLesion.vessels.density = 0.12;

        [concDisc, ~, ~, flagDisc] = correlateLesionsWithGrade(0, badLesion);
        assert(flagDisc == true, 'Discrepancy flag must trigger on mismatch');
        assert(strcmp(concDisc, 'POTENTIAL_DISCREPANCY'), 'Status must be POTENTIAL_DISCREPANCY');

        fprintf('[PASS] Test 5: Multi-modal lesion concordance & safety checks verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 5: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 6: Clinical Evidence Synthesis
    try
        classRes = struct('grade', 2, 'confidence', 0.84, 'referableDR', true, ...
                          'probabilities', [0.02, 0.08, 0.84, 0.04, 0.02]);
        evidence = generateClinicalEvidence(synthImg, [], [], classRes);

        assert(isstruct(evidence), 'Evidence must be a struct');
        assert(isfield(evidence, 'gradCAMMap'), 'Must contain gradCAMMap');
        assert(isfield(evidence, 'referralRecommendation'), 'Must contain referral recommendation');
        assert(isfield(evidence, 'statutoryDisclaimer'), 'Must contain statutory disclaimer');

        fprintf('[PASS] Test 6: Clinical evidence synthesis verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 6: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% TEST 7: Telemedicine Screening Report Generation
    try
        testReportDir = fullfile(rootDir, 'reports');
        [reportPath, reportText] = generateDRReport('TEST_PATIENT_001', [], [], classRes, evidence, testReportDir);

        assert(isfile(reportPath), 'Report file must exist on disk');
        assert(~isempty(reportText), 'Report text must not be empty');
        assert(contains(reportText, 'TEST_PATIENT_001'), 'Report must contain patient ID');
        assert(contains(reportText, 'REFERABLE DIABETIC RETINOPATHY'), 'Report must state referable status');
        assert(contains(reportText, 'STATUTORY DISCLAIMER'), 'Report must include statutory disclaimer');

        fprintf('[PASS] Test 7: Telemedicine screening report generation verified.\n');
        passCount = passCount + 1;
    catch ME
        fprintf('[FAIL] Test 7: %s\n', ME.message);
        failCount = failCount + 1;
    end

    %% SUMMARY
    fprintf('\n------------------------------------------------------------------------\n');
    fprintf('TEST SUITE COMPLETE: %d PASSED, %d FAILED\n', passCount, failCount);
    fprintf('========================================================================\n');

    results = struct('passCount', passCount, 'failCount', failCount, 'success', (failCount == 0));
end
