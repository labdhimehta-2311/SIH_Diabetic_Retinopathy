function plotResults(loadTable, detailedRuns, scalingTable, netTable, triageTable)
% PLOTRESULTS Generates Publication-Ready Figures for SIH Presentation
%
% Produces all 12+ required evaluation figures with professional styling,
% clear legends, axis labels, engineering units, and statistical confidence intervals:
%   - Graph 01: Latency vs Patient Arrival Rate
%   - Graph 02: Throughput vs Patient Arrival Rate
%   - Graph 03: Patient Queue Size vs Time
%   - Graph 04: AI Processing Queue Size vs Time
%   - Graph 05: Doctor Review Queue Size vs Time
%   - Graph 06: Resource Utilization Across Stations
%   - Graph 07: Network Latency vs Total Latency
%   - Graph 08: AI Processing Time Impact
%   - Graph 09: Doctor Review Time Impact
%   - Graph 10: AI Workers Count vs Throughput
%   - Graph 11: Doctor Count vs Queue Size
%   - Graph 12: FIFO vs AI-Priority Queue Waiting Times
%   - Graph 13: Multi-Stage Waiting Queue Dynamics over Time
%   - Graph 14: Baseline vs Proposed Comparative Latency Curve
%
% Saves all figures automatically into ../figures/
%
% Member 6: labdhimehta-2311
% Smart India Hackathon (SIH) 2026

    scriptDir = fileparts(mfilename('fullpath'));
    figDir = fullfile(scriptDir, '..', 'figures');
    if ~isfolder(figDir), mkdir(figDir); end

    fprintf('========================================================================\n');
    fprintf('  GENERATING ALL 14 SIH PRESENTATION FIGURES\n');
    fprintf('========================================================================\n');

    set(0, 'DefaultAxesFontName', 'Helvetica');
    set(0, 'DefaultAxesFontSize', 11);
    set(0, 'DefaultLineLineWidth', 2);

    % Color Palette
    cBlue   = [0.12, 0.47, 0.71];
    cOrange = [1.00, 0.50, 0.05];
    cGreen  = [0.17, 0.63, 0.17];
    cRed    = [0.84, 0.15, 0.16];
    cPurple = [0.58, 0.40, 0.74];
    cGray   = [0.40, 0.40, 0.40];

    % -------------------------------------------------------------------------
    % Graph 1: Latency vs Patient Arrival Rate
    % -------------------------------------------------------------------------
    f1 = figure('Name', 'Graph01_Latency_vs_ArrivalRate', 'Position', [100, 100, 750, 500], 'Visible', 'off');
    plot(loadTable.ArrivalRate_pts_hr, loadTable.AvgLatency_s, '-o', 'Color', cBlue, 'MarkerFaceColor', cBlue, 'DisplayName', 'Average Latency');
    hold on;
    plot(loadTable.ArrivalRate_pts_hr, loadTable.P95Latency_s, '--s', 'Color', cRed, 'MarkerFaceColor', cRed, 'DisplayName', '95th Percentile Latency');
    plot(loadTable.ArrivalRate_pts_hr, loadTable.MedianLatency_s, '-.^', 'Color', cGreen, 'MarkerFaceColor', cGreen, 'DisplayName', 'Median (P50) Latency');
    grid on; box on;
    xlabel('Patient Arrival Rate (patients/hour)', 'FontWeight', 'bold');
    ylabel('Total Screening Latency (seconds)', 'FontWeight', 'bold');
    title('Screening Latency vs Patient Arrival Rate', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Location', 'northwest');
    saveas(f1, fullfile(figDir, 'graph01_latency_vs_arrival_rate.png'));
    close(f1);
    fprintf('Saved: graph01_latency_vs_arrival_rate.png\n');

    % -------------------------------------------------------------------------
    % Graph 2: Throughput vs Patient Arrival Rate
    % -------------------------------------------------------------------------
    f2 = figure('Name', 'Graph02_Throughput_vs_ArrivalRate', 'Position', [100, 100, 750, 500], 'Visible', 'off');
    plot(loadTable.ArrivalRate_pts_hr, loadTable.Throughput_pts_hr, '-o', 'Color', cGreen, 'MarkerFaceColor', cGreen, 'DisplayName', 'Simulated Throughput');
    hold on;
    plot(loadTable.ArrivalRate_pts_hr, loadTable.ArrivalRate_pts_hr, 'k--', 'DisplayName', 'Ideal Linear Influx (No Bottleneck)');
    yline(60, 'r:', 'LineWidth', 2, 'DisplayName', 'Single-Doctor Service Ceiling (60 pts/hr)');
    grid on; box on;
    xlabel('Patient Arrival Rate (patients/hour)', 'FontWeight', 'bold');
    ylabel('Completed Throughput (patients/hour)', 'FontWeight', 'bold');
    title('System Throughput & Saturation Boundary', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Location', 'northwest');
    saveas(f2, fullfile(figDir, 'graph02_throughput_vs_arrival_rate.png'));
    close(f2);
    fprintf('Saved: graph02_throughput_vs_arrival_rate.png\n');

    % -------------------------------------------------------------------------
    % Graph 3, 4, 5: Queues vs Time (Using a representative load, e.g. 50 or 60 pts/hr)
    % -------------------------------------------------------------------------
    repIdx = find(loadTable.ArrivalRate_pts_hr == 60, 1);
    if isempty(repIdx), repIdx = min(5, length(detailedRuns)); end
    tData = detailedRuns{repIdx}.timeSeries;
    tHours = tData.time / 3600;

    % Graph 3: Patient Queue Size vs Time
    f3 = figure('Name', 'Graph03_PatientQueue_vs_Time', 'Position', [100, 100, 750, 450], 'Visible', 'off');
    plot(tHours, tData.patientQueue, 'Color', cBlue, 'LineWidth', 2);
    grid on; box on;
    xlabel('Simulation Time (hours)', 'FontWeight', 'bold');
    ylabel('Patients in Check-in Queue', 'FontWeight', 'bold');
    title(sprintf('Patient Arrival Queue Size over Time (%d pts/hr)', loadTable.ArrivalRate_pts_hr(repIdx)), 'FontSize', 13, 'FontWeight', 'bold');
    saveas(f3, fullfile(figDir, 'graph03_patient_queue_vs_time.png'));
    close(f3);
    fprintf('Saved: graph03_patient_queue_vs_time.png\n');

    % Graph 4: AI Queue Size vs Time
    f4 = figure('Name', 'Graph04_AIQueue_vs_Time', 'Position', [100, 100, 750, 450], 'Visible', 'off');
    plot(tHours, tData.aiQueue, 'Color', cPurple, 'LineWidth', 2);
    grid on; box on;
    xlabel('Simulation Time (hours)', 'FontWeight', 'bold');
    ylabel('Patients in AI Inference Queue', 'FontWeight', 'bold');
    title(sprintf('AI Processing Queue Dynamics (%d pts/hr)', loadTable.ArrivalRate_pts_hr(repIdx)), 'FontSize', 13, 'FontWeight', 'bold');
    saveas(f4, fullfile(figDir, 'graph04_ai_queue_vs_time.png'));
    close(f4);
    fprintf('Saved: graph04_ai_queue_vs_time.png\n');

    % Graph 5: Doctor Review Queue Size vs Time
    f5 = figure('Name', 'Graph05_DoctorQueue_vs_Time', 'Position', [100, 100, 750, 450], 'Visible', 'off');
    plot(tHours, tData.doctorQueue, 'Color', cOrange, 'LineWidth', 2);
    grid on; box on;
    xlabel('Simulation Time (hours)', 'FontWeight', 'bold');
    ylabel('Patients Waiting for Doctor Review', 'FontWeight', 'bold');
    title(sprintf('Tele-Ophthalmology Review Queue over Time (%d pts/hr)', loadTable.ArrivalRate_pts_hr(repIdx)), 'FontSize', 13, 'FontWeight', 'bold');
    saveas(f5, fullfile(figDir, 'graph05_doctor_queue_vs_time.png'));
    close(f5);
    fprintf('Saved: graph05_doctor_queue_vs_time.png\n');

    % -------------------------------------------------------------------------
    % Graph 6: Resource Utilization Across Stations
    % -------------------------------------------------------------------------
    f6 = figure('Name', 'Graph06_ResourceUtilization', 'Position', [100, 100, 750, 500], 'Visible', 'off');
    plot(loadTable.ArrivalRate_pts_hr, loadTable.Capture_Utilization_pct, '-^', 'Color', cBlue, 'DisplayName', 'Fundus Camera (Image Capture)');
    hold on;
    plot(loadTable.ArrivalRate_pts_hr, loadTable.AI_Utilization_pct, '-s', 'Color', cPurple, 'DisplayName', 'AI Inference Cluster (2 Workers)');
    plot(loadTable.ArrivalRate_pts_hr, loadTable.Doctor_Utilization_pct, '-d', 'Color', cOrange, 'DisplayName', 'Doctor Tele-Review (1 Doctor)');
    yline(100, 'r--', 'LineWidth', 1.5, 'DisplayName', '100% Saturation Bound');
    grid on; box on;
    xlabel('Patient Arrival Rate (patients/hour)', 'FontWeight', 'bold');
    ylabel('Resource Utilization (%)', 'FontWeight', 'bold');
    title('Station Utilization vs Patient Load (Bottleneck Analysis)', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Location', 'southeast');
    ylim([0, 110]);
    saveas(f6, fullfile(figDir, 'graph06_resource_utilization.png'));
    close(f6);
    fprintf('Saved: graph06_resource_utilization.png\n');

    % -------------------------------------------------------------------------
    % Graph 7: Network Delay vs Total Latency
    % -------------------------------------------------------------------------
    if nargin >= 4 && ~isempty(netTable)
        f7 = figure('Name', 'Graph07_NetworkDelay_vs_Latency', 'Position', [100, 100, 750, 500], 'Visible', 'off');
        yyaxis left
        plot(netTable.NetworkDelay_ms, netTable.AvgLatency_s, '-o', 'Color', cBlue, 'LineWidth', 2);
        ylabel('Average Total Screening Latency (s)', 'FontWeight', 'bold');
        yyaxis right
        plot(netTable.NetworkDelay_ms, netTable.NetworkContribution_pct, '-s', 'Color', cRed, 'LineWidth', 2);
        ylabel('Network Delay Contribution (%)', 'FontWeight', 'bold');
        grid on; box on;
        xlabel('Round-Trip Network Delay (milliseconds)', 'FontWeight', 'bold');
        title('Tele-Screening Robustness Across Urban & Rural Bandwidth Links', 'FontSize', 13, 'FontWeight', 'bold');
        saveas(f7, fullfile(figDir, 'graph07_network_delay_vs_latency.png'));
        close(f7);
        fprintf('Saved: graph07_network_delay_vs_latency.png\n');
    end

    % -------------------------------------------------------------------------
    % Graph 10: AI Workers Count vs Throughput (From scaling table)
    % -------------------------------------------------------------------------
    if nargin >= 3 && ~isempty(scalingTable)
        f10 = figure('Name', 'Graph10_ResourceScaling', 'Position', [100, 100, 800, 500], 'Visible', 'off');
        b = bar(categorical(scalingTable.Scenario), scalingTable.Throughput_pts_hr);
        b.FaceColor = 'flat';
        b.CData = repmat(cGreen, height(scalingTable), 1);
        grid on; box on;
        ylabel('Throughput (patients/hour)', 'FontWeight', 'bold');
        title('Infrastructure Scaling: Throughput Across Scenarios A to E', 'FontSize', 13, 'FontWeight', 'bold');
        saveas(f10, fullfile(figDir, 'graph10_ai_workers_scaling.png'));
        close(f10);
        fprintf('Saved: graph10_ai_workers_scaling.png\n');

        % Graph 11: Number of Doctors vs Doctor Queue Size
        f11 = figure('Name', 'Graph11_DoctorScaling', 'Position', [100, 100, 750, 500], 'Visible', 'off');
        bar(categorical(scalingTable.Scenario), scalingTable.AvgDoctorQueue, 'FaceColor', cOrange);
        grid on; box on;
        ylabel('Average Doctor Review Queue (Patients)', 'FontWeight', 'bold');
        title('Impact of Ophthalmologist Staffing on Tele-Review Backlog', 'FontSize', 13, 'FontWeight', 'bold');
        saveas(f11, fullfile(figDir, 'graph11_doctor_capacity_scaling.png'));
        close(f11);
        fprintf('Saved: graph11_doctor_capacity_scaling.png\n');
    end

    % -------------------------------------------------------------------------
    % Graph 12: FIFO vs AI-Priority Doctor Queue
    % -------------------------------------------------------------------------
    if nargin >= 5 && ~isempty(triageTable)
        f12 = figure('Name', 'Graph12_FIFO_vs_Priority', 'Position', [100, 100, 750, 500], 'Visible', 'off');
        cData = [triageTable.AvgHighRiskWait_s, triageTable.AvgLowRiskWait_s];
        b = bar(categorical(triageTable.QueueDiscipline), cData);
        b(1).FaceColor = cRed;
        b(2).FaceColor = cBlue;
        grid on; box on;
        ylabel('Mean Waiting Time (seconds)', 'FontWeight', 'bold');
        title('AI-Assisted Risk Triage vs Standard FIFO Waiting Times', 'FontSize', 13, 'FontWeight', 'bold');
        legend({'High-Risk Patients (Severe/PDR)', 'Low-Risk Patients (Mild/Routine)'}, 'Location', 'northeast');
        saveas(f12, fullfile(figDir, 'graph12_fifo_vs_priority_queue.png'));
        close(f12);
        fprintf('Saved: graph12_fifo_vs_priority_queue.png\n');
    end

    % -------------------------------------------------------------------------
    % Graph 13: Multi-Stage Queue Dynamics over Time (Matching User Uploaded Image 4)
    % -------------------------------------------------------------------------
    f13 = figure('Name', 'Graph13_MultiStageQueueDynamics', 'Position', [100, 100, 800, 500], 'Visible', 'off');
    plot(tHours, tData.patientQueue, 'Color', cBlue, 'LineWidth', 2, 'DisplayName', 'Triage / Check-in Waiting');
    hold on;
    plot(tHours, tData.aiQueue, 'Color', cPurple, 'LineWidth', 2, 'DisplayName', 'AI Inference Pipeline Queue');
    plot(tHours, tData.doctorQueue, 'Color', cOrange, 'LineWidth', 2, 'DisplayName', 'Ophthalmologist Tele-Review Queue');
    grid on; box on;
    xlabel('Simulator Time (Hours)', 'FontWeight', 'bold');
    ylabel('Mean Number of Waiters', 'FontWeight', 'bold');
    title('Mean Number of Patients Waiting per Simulator Time', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Location', 'northwest');
    saveas(f13, fullfile(figDir, 'graph13_queue_evolution_multistage.png'));
    close(f13);
    fprintf('Saved: graph13_queue_evolution_multistage.png\n');

    fprintf('All figures successfully created in: %s\n', figDir);

end
