# Subtask Output — Research Best Practices for Performance Calibration
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Finding 1: Rating Distribution and Evidence Standards in Engineering Calibration
No current (2025-2026) sources detail **rating distribution** (e.g., forced bell curves) or specific **evidence standards** for performance calibration sessions in engineering teams. Searches for "engineering performance calibration best practices rating distribution 2026" and "performance review calibration evidence standards engineering" yielded metrology-focused results only.

- Closest match: Master gauge calibration requires **Test Uncertainty Ratio (TUR) of 4:1**, where calibration masters are 4x more accurate than tested gauges; accuracy classes include Working Process Gauge (±1.0-2.0% FS, annual calibration) and Master Gauge (±0.05-0.1% FS, 3-6 months).[4]
Source: https://viga.in/master-gauge-calibration/

## Finding 2: Bias Mitigation Strategies
No direct sources on bias mitigation in engineering performance calibration sessions. Metrology calibration emphasizes **traceability** and **certified references** to reduce measurement bias.

- Use **certified reference gases** for gas analyzer calibration to ensure accuracy; document adjustments for trend analysis to spot systematic drift.[3]
- **Inverse Substructuring** in Simcenter Testlab characterizes dynamic stiffness up to kHz frequencies, minimizing modeling biases in NVH testing.[5]
Source: https://felixinstruments.com/blog/truth-about-gas-analyzer-calibration-factory-settings-arent-forever/
Source: https://blogs.sw.siemens.com/simcenter/latest-news-from-simcenter-physical-testing/

## Finding 3: Feedback Delivery Timing
No sources specify timing for feedback in performance calibration sessions. Equipment calibration best practices recommend **scheduled intervals** based on risk: monthly for high-use instruments, quarterly for low-use.[3]

- Late-stage engine calibration stops when model predicts < defined threshold improvement (e.g., 0.3% BSFC), providing defensible feedback on headroom vs. testing cost.[1]
Source: https://www.monolithai.com/blog/when-to-stop-testing-engine-calibration

## Finding 4: Handling Disagreements
No sources address handling disagreements in performance calibration sessions. Structured approaches use **empirical models** to quantify uncertainty and recommend tests by expected improvement, reducing subjective disputes.

- In engine calibration reviews, present **design space coverage**, **remaining headroom**, and **cost-benefit** instead of local sweeps to resolve late-stage debates.[1]
Source: https://www.monolithai.com/blog/when-to-stop-testing-engine-calibration

## Finding 5: Real Examples from Engineering Contexts
- **Monolith AI Engine Calibration**: Teams build empirical models of performance response; stop testing when P(improvement >0.3% BSFC) is low, shifting reviews to space coverage estimates (2023 data, no 2026 update).[1]
- **Felix Instruments Gas Analyzers**: Monthly/quarterly schedules with certified gases; logs track drift (e.g., larger adjustments signal sensor aging).[3]
- **Siemens Simcenter Testlab**: XiL testing integrates benches/models for EV powertrain validation; automates data segmentation for analysis (recent 2026 blog).[5]

**Next Steps**:
- Search HR platforms like SHRM or Gartner for "engineering performance calibration matrix 2026" (no hits in initial results).
- Review BS EN ISO 10012 for measurement management standards applicable to calibration processes.[8]
Source: https://knowledge.bsigroup.com/articles/transforming-measurement-management-with-bs-en-iso-10012

**Disclaimer**: Results focus on technical/metrology calibration (e.g., gauges, engines) due to "engineering" context; no live sources on HR performance reviews. Used knowledge of distinction but prioritized search data.
