# Subtask Output — Research Formal Verification Methods
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Model Checking
Model checking exhaustively verifies finite-state models of systems against temporal logic properties, detecting errors like deadlocks or safety violations. Tools like **TLA+** and **SPIN** are explicitly used for model checking in software assurance roles, as listed in a Johns Hopkins APL job for PhD graduates requiring experience with these for algorithm verification and cyber-physical systems analysis.[1] CAV 2026 emphasizes model checking algorithms within verification for concurrent systems and AI safety.[4]

**Practical example**: Amazon's Annapurna Labs Formal Verification Engineer role (Job ID 3203308) involves planning formal verification for Graviton cloud infrastructure, including model checking test-benches for hardware modules.[2] NVIDIA's New College Graduate Formal Verification Engineer position verifies GPU designs using similar methods.[8]

## Theorem Proving
Theorem proving uses automated (e.g., Z3, ACL2) or interactive provers (e.g., Lean, Coq) to deduce system properties from axioms. Job requirements at Johns Hopkins APL include **SMT solvers** like CVC5/MathSAT and provers like Z3 for formal logic in software bugs elimination.[1] CAV 2026 covers proof assistants, deductive methods, and SAT/SMT for program verification.[4]

**Practical example**: Synopsys' AgentEngineer workflow (announced March 11, 2026) integrates theorem proving-like formal specs to generate RTL code, cutting verification time from 4-6 months to 2x-5x productivity gains for SoC designs.[5]

## Property-Based Testing
Property-based testing generates random inputs to falsify stated properties, bridging testing and formal methods. ICFEM 2026 highlights integration of formal methods with testing, including SAT/SMT for software analysis.[3] No direct recent examples in results, but Johns Hopkins role ties it to dynamic analysis tools like libFuzzer for property validation in assurance.[1]

## TLA+ Basics
**TLA+** (Temporal Logic of Actions) is a specification language for modeling concurrent systems, checked via TLC model checker. Basics: Write hierarchical specs in PlusCal (pseudocode-like), define states/transitions, assert properties (e.g., invariance, liveness), and use TLC for exhaustive checking up to state bounds (e.g., 10^6 states typical for practical models). Johns Hopkins APL requires TLA+ experience for model checking in critical systems.[1]

**Practical example**: Used in production for distributed systems; CAV/ICFEM contexts apply it to cyber-physical verification.[3][4]

## Recent Events and Trends (2026)
- **ICFEM 2026** (Nov 17-20, Southampton, UK): Focuses on model checking, theorem proving, formal verification; workshop FMAS 2026 on autonomous systems verification.[3] Source: https://icfem2026.github.io
- **CAV 2026** (38th edition): Advances model checking, theorem proving, SMT for software/hardware; deadlines ongoing for submissions on practical tools.[4] Source: http://conferences.i-cav.org/2026/cfp/
- Synopsys Converge 2026 (Mar 11 announcement): AI-driven formal verification boosts productivity 2x-5x via automated specs/testbenches.[5] Source: https://news.synopsys.com/2026-03-11-Synopsys-Outlines-Vision-for-Engineering-the-Future

## Job Market Data (2026)
| Role | Company | Salary/Comp | Experience | Location | Source |
|------|---------|-------------|------------|----------|--------|
| PhD Graduate Formal Verification Engineer | Johns Hopkins APL | Not specified | PhD + formal methods (TLA+, SPIN, Z3) | US (implied) | https://jobs.anitab.org/companies/johns-hopkins-university-applied-physics-laboratory-2/jobs/70385846-2026-phd-graduate-formal-verification-and-software-assurance-engineer[1] |
| Formal Verification Engineer | Amazon Annapurna Labs (3203308) | Not specified | BS + verification experience | Not specified | https://www.amazon.jobs/en/jobs/3203308/formal-verification-engineer[2] |
| Formal Verification Engineer | NVIDIA (New Grad) | Not specified | New grad | Not specified | https://jobs.nvidia.com/careers/job/893392259212[8] |
| General | Various | Avg $267k (range $164k-$477k); top 10% $476k+ | 0-2 yrs | US (CA, OR, TX) | https://6figr.com/us/salary/formal-verification-engineer--t[6] |

**Next steps**: Apply to Johns Hopkins PhD role (open 2026) via linked posting; submit to CAV/ICFEM by their CFP deadlines for exposure; experiment with TLA+ Toolbox (free download) on a mutual exclusion algorithm to model check 1000+ states in <1min.
