# Subtask Output — Research Password Hashing Algorithms
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Memory-Hardness Properties

**Argon2id** is the most memory-hard among bcrypt, scrypt, and Argon2id, designed to resist both CPU and GPU/ASIC cracking by requiring significant RAM allocation; it won the 2015 Password Hashing Competition.[3]  
**Scrypt** is memory-hard, emphasizing RAM usage to hinder parallelization on GPUs.[1][3]  
**Bcrypt** is primarily CPU-time hard with adaptive cost factors but less memory-intensive than scrypt or Argon2id, making it slower on brute-force but vulnerable to GPU acceleration compared to the others.[1][3]

## Parameter Tuning for Different Hardware

OWASP 2024 guidelines recommend **Argon2id** with 19 MiB memory and 2 iterations, yielding ~10 hashes/second/core to thwart brute-force on modern CPUs.[1][3]  
For **scrypt**, OWASP suggests N=2^17 (131072), r=8, p=1, balancing CPU and memory costs for server hardware taking ~100ms per hash.[3]  
**Bcrypt** uses a cost factor (e.g., 12) tuned to ~100ms on target hardware; increase to 14+ for newer CPUs to maintain slowness against GPUs.[3][6]  
All should target 100ms+ hashing time per password on production servers, re-tuning annually as hardware improves.[6]

## Migration Strategies

No specific step-by-step migration paths found in recent results (last 30 days as of March 2026); sources emphasize switching to **Argon2id** as the gold standard from bcrypt/scrypt/PBKDF2.[1][2][3]  
- Store new hashes with Argon2id; on login, re-hash legacy bcrypt/scrypt passwords with Argon2id parameters if valid, updating the DB opportunistically.[3]  
Python libraries like `argon2-cffi` and `bcrypt` support this dual-verification during transition.[3]

## Pepper Implementation

No direct details on pepper (server-side secret prepended to password+salt) in results; bcrypt/Argon2id/scrypt embed salts automatically, but peppers add defense-in-depth by storing a secret outside the DB.[5]  
Combine pepper with salts: hash(pepper + salt + password) using Argon2id; rotate pepper post-breach and re-hash all passwords.[3][5]  
Use environment variables or HSMs for pepper storage; OWASP implies this via "sufficient iterations" but lacks 2026-specific examples.[1][3]

**Sources explicitly note limited migration/pepper data; recommendations inferred from OWASP via [3] (cheatsheetseries.owasp.org, accessed via justappsec.com).**  
- [1] https://stealthcloud.ai/cryptography/encryption-hashing-signing-differences/  
- [2] https://passwordly.xyz/guides/password-security-fundamentals  
- [3] https://justappsec.com/research/password-storage  
- [5] https://janex.io/en/hash/  
- [6] https://appsecsanta.com/aspm-tools/appsec-checklist
