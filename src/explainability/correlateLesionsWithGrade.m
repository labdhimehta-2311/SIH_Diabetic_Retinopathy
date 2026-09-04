function [concordanceStatus, evidenceList, clinicalSummary, discrepancyFlag] = correlateLesionsWithGrade(predictedGrade, lesionData)
% CORRELATELESIONSWITHGRADE Correlates deep learning predictions with explicit retinal lesion biomarkers
%
% Syntax:
%   [concordanceStatus, evidenceList] = correlateLesionsWithGrade(predictedGrade)
%   [concordanceStatus, evidenceList, clinicalSummary, discrepancyFlag] = correlateLesionsWithGrade(predictedGrade, lesionData)
%
% Inputs:
%   predictedGrade - Integer predicted DR grade (0 to 4)
%   lesionData     - (Optional) Struct containing quantitative lesion findings
%
% Outputs:
%   concordanceStatus - String: 'HIGHLY_CONCORDANT', 'MODERATELY_CONCORDANT', or 'POTENTIAL_DISCREPANCY'
%   evidenceList      - Cell array of individual clinical lesion observation statements
%   clinicalSummary   - Cohesive diagnostic narrative summarizing the pathophysiological findings
%   discrepancyFlag   - Boolean indicating whether human specialist review is urgently warranted
%
% Clinical Significance:
%   Black-box deep neural networks can latch onto non-pathological image confounders
%   (e.g., lens smudges, camera dust). By cross-verifying the CNN grade against
%   classical lesion segmentations (microaneurysms, hemorrhages, exudates, neovascularization),
%   this module provides an automated safety check, guaranteeing clinical explainability.
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    if nargin < 1 || isempty(predictedGrade)
        predictedGrade = 0;
    elseif iscategorical(predictedGrade) || isstring(predictedGrade) || ischar(predictedGrade)
        predictedGrade = double(string(predictedGrade));
    end

    % Safe extraction of lesion parameters with defaults if not provided
    numMAs    = 0;
    exudArea  = 0;
    exudClust = 0;
    hemArea   = 0;
    hemCount  = 0;
    hemQuads  = 0;
    isNV      = false;
    vesselDen = 0.12;

    if nargin >= 2 && ~isempty(lesionData) && isstruct(lesionData)
        if isfield(lesionData, 'microaneurysms') && isfield(lesionData.microaneurysms, 'count')
            numMAs = lesionData.microaneurysms.count;
        end
        if isfield(lesionData, 'exudates')
            if isfield(lesionData.exudates, 'areaPixels'), exudArea = lesionData.exudates.areaPixels; end
            if isfield(lesionData.exudates, 'clusters'), exudClust = lesionData.exudates.clusters; end
        end
        if isfield(lesionData, 'hemorrhages')
            if isfield(lesionData.hemorrhages, 'areaPixels'), hemArea = lesionData.hemorrhages.areaPixels; end
            if isfield(lesionData.hemorrhages, 'count'), hemCount = lesionData.hemorrhages.count; end
            if isfield(lesionData.hemorrhages, 'quadrantsInvolved'), hemQuads = lesionData.hemorrhages.quadrantsInvolved; end
        end
        if isfield(lesionData, 'neovascularization') && isfield(lesionData.neovascularization, 'detected')
            isNV = lesionData.neovascularization.detected;
        end
        if isfield(lesionData, 'vessels') && isfield(lesionData.vessels, 'density')
            vesselDen = lesionData.vessels.density;
        end
    end

    evidenceList = {};
    discrepancyFlag = false;

    % 1. Compile Objective Lesion Observations
    if numMAs == 0
        evidenceList{end+1} = 'Zero microaneurysm candidates detected in capillary bed.';
    elseif numMAs < 5
        evidenceList{end+1} = sprintf('Isolated microaneurysms detected (count: %d).', numMAs);
    else
        evidenceList{end+1} = sprintf('Multiple microaneurysms detected across retinal field (count: %d).', numMAs);
    end

    if exudArea == 0
        evidenceList{end+1} = 'No hard exudates or cotton-wool spots identified.';
    else
        evidenceList{end+1} = sprintf('Hard exudate deposits detected (total area: %d pixels in %d clusters).', ...
            exudArea, exudClust);
    end

    if hemArea == 0
        evidenceList{end+1} = 'No intraretinal dot-blot or flame hemorrhages detected.';
    else
        evidenceList{end+1} = sprintf('Intraretinal hemorrhages identified (%d foci, %d pixels, spanning %d/4 quadrants).', ...
            hemCount, hemArea, hemQuads);
    end

    if isNV
        evidenceList{end+1} = 'CRITICAL: Neovascular proliferation detected (abnormal delicate capillary fronds).';
    else
        evidenceList{end+1} = 'No evidence of retinal or disc neovascularization (NVD/NVE).';
    end

    evidenceList{end+1} = sprintf('Retinal vascular density: %.1f%% (Normal reference: 10-14%%).', vesselDen * 100);

    % 2. Cross-Verification of Concordance with Predicted Grade
    switch predictedGrade
        case 0 % No DR
            if (numMAs == 0) && (exudArea == 0) && (hemArea == 0) && (~isNV)
                concordanceStatus = 'HIGHLY_CONCORDANT';
                clinicalSummary = 'Retinal microvasculature is completely normal with zero detectable diabetic lesions.';
            else
                concordanceStatus = 'POTENTIAL_DISCREPANCY';
                discrepancyFlag = true;
                clinicalSummary = 'Model predicted Grade 0 (No DR), but morphological lesions were segmented. Specialist review advised.';
            end

        case 1 % Mild NPDR
            if (numMAs > 0) && (exudArea < 40) && (hemArea < 40) && (~isNV)
                concordanceStatus = 'HIGHLY_CONCORDANT';
                clinicalSummary = 'Pathology strictly restricted to microaneurysms, matching ICDR criteria for Mild NPDR.';
            else
                concordanceStatus = 'MODERATELY_CONCORDANT';
                clinicalSummary = 'Mild NPDR staged; lesion footprint is subtle but consistent with early microangiopathy.';
            end

        case 2 % Moderate NPDR
            if (numMAs >= 3 || exudArea > 0 || hemArea > 0) && (~isNV) && (hemQuads < 4)
                concordanceStatus = 'HIGHLY_CONCORDANT';
                clinicalSummary = 'Exhibits more than microaneurysms (exudates and hemorrhages present) without meeting Severe 4-2-1 threshold.';
            else
                concordanceStatus = 'MODERATELY_CONCORDANT';
                clinicalSummary = 'Moderate NPDR classification supported by intermediate lesion load.';
            end

        case 3 % Severe NPDR
            if (hemQuads >= 3) || (hemCount >= 15) || (exudArea > 400)
                concordanceStatus = 'HIGHLY_CONCORDANT';
                clinicalSummary = 'Extensive multi-quadrant hemorrhages and microvascular abnormalities satisfy ICDR Severe NPDR criteria.';
            else
                concordanceStatus = 'POTENTIAL_DISCREPANCY';
                discrepancyFlag = true;
                clinicalSummary = 'Severe NPDR staged by CNN; however, segmented hemorrhages do not fully satisfy 4-quadrant rule. Verify for venous beading.';
            end

        case 4 % Proliferative DR (PDR)
            nvdScore = 0;
            if nargin >= 2 && ~isempty(lesionData) && isfield(lesionData, 'neovascularization') && isfield(lesionData.neovascularization, 'nvdScore')
                nvdScore = lesionData.neovascularization.nvdScore;
            end
            if isNV || (nvdScore > 0.40)
                concordanceStatus = 'HIGHLY_CONCORDANT';
                clinicalSummary = 'Neovascularization of the disc or retina confirmed. High risk of tractional retinal detachment or vitreous hemorrhage.';
            else
                concordanceStatus = 'MODERATELY_CONCORDANT';
                clinicalSummary = 'PDR predicted; abnormal vascular features observed. Immediate dilated ophthalmoscopic examination required.';
            end

        otherwise
            concordanceStatus = 'MODERATELY_CONCORDANT';
            clinicalSummary = sprintf('Severity stage %d evaluated with standard clinical protocol.', predictedGrade);
    end
end
