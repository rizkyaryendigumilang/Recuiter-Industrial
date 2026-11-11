# Domain Glossary: Recruiter Industrial Platform

This glossary establishes canonical terminology across frontend, backend, test suites, and documentation.

---

### Psychometrics & Assessment
- **Kraepelin / Pauli Test**: Industrial endurance and speed assessment where operators continuously add adjacent vertical single digits and type only the unit digit (e.g., $7 + 8 = 15 \rightarrow 5$).
- **Panker (Kecepatan Kerja)**: Working speed metric representing average additions completed per minute across all columns.
- **Tianker (Ketelitian Kerja)**: Accuracy percentage calculated as $\frac{\text{Total Benar}}{\text{Total Dikerjakan}} \times 100\%$.
- **Hanker (Ketahanan Kerja / Work Slope)**: Endurance curve gradient across consecutive columns. A positive or horizontal slope indicates resilience, while a steep negative slope signals monotonic exhaustion.
- **Janker (Stabilitas Emosi / Emotional Fluctuation)**: Standard deviation of column outputs. Lower deviation indicates emotional and operational stability under repetitive pressure.
- **HIMPSI**: Himpunan Psikologi Indonesia. The official Indonesian psychological association whose testing standards and psychogram norm tables are implemented in the platform.

### Architecture & Integrations
- **SSO JIT Handoff**: Single Sign-On Just-In-Time ticket creation where candidate and operator credentials (`uid`, `name`, `role`, `from_url`) are handed off securely to the centralized VPS Helpdesk (`https://43.156.236.102/helpdesk/handoff`) without re-authentication.
- **Offline Assessment Queue**: Local storage backed sync pipeline (`pending_offline_assessments`) that ensures candidates in factory blank-spots can complete psychometric tests without data loss, synchronizing automatically when connectivity is restored.
- **Industrial Norm Benchmark**: Minimum psychometric thresholds per job role (e.g. QC Inspector requires Tianker $\ge 94\%$, Operator requires Hanker $\ge -0.05$).
