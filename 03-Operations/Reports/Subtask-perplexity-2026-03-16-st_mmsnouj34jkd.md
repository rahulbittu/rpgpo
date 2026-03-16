# Subtask Output — Research NAS Devices
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: No Synology, QNAP, or TrueNAS NAS Devices Under $500 Found for Automated Backups and Media Serving

Search results from March 2026 focus on high-end enterprise models exceeding $500 (often $2,000+ barebone); no entry-level Synology, QNAP, or TrueNAS hardware matches the price threshold. TrueNAS is software-only (free download), requiring custom DIY builds starting at $300-600 for basic hardware, but no pre-built units under $500 support automated backups (e.g., ZFS snapshots) and media serving (e.g., Plex/Emby apps).[1][2]

- **QNAP Models**: TS-h1290FX (12-bay NVMe, AMD EPYC, 25GbE, launched 2026) priced $5,000+ barebone; TS-h1077AFU (10-bay all-flash, QuTS hero OS for backups/media); TS-433eU (1U rackmount, SMB-focused). All enterprise-grade, no sub-$500 options.[1]
- **TrueNAS**: SCALE 22.12.2 (2022 update, ZFS snapshots for ransomware protection, apps for media/backups) runs on custom hardware; no official pre-built under $500.[1][2]
- **Synology**: Zero mentions in results; prior knowledge indicates entry models like DS223j (~$170) fit but unconfirmed in 2026 searches.
- Source: https://www.storagereview.com/enterprise/medium-nas[1]

## Finding 2: Closest Alternatives and DIY Options Under $500

Ubiquiti UNAS Pro 4 (4-bay, launched Feb 2026) is the only recent NAS near budget at ~$400-500 estimated (exact pricing unlisted), with RAID, backups, media serving via UniFi integration. Build-your-own TrueNAS recommended over pre-builts for cost.[3][4]

- **UNAS Pro 4 Specs**: 4 bays, flexible RAID, data protection, streamlined for backups/media; compare to UNAS Pro (7-bay, Nov 2024) and Pro 8 (8-bay, Nov 2025). Suitable for automated backups/serving but UniFi-centric.[4]
- **DIY TrueNAS Build**: Hardware buy-in $400-600 (e.g., mini-PC + HDDs); ZFS snapshots native for backups, SCALE apps for media. Break-even vs. cloud: 2-3 years at 10TB usage.[2][3]
- Source: https://nascompares.com/2026/02/20/unifi-unas-pro-4-vs-pro-vs-pro-8-nas-comparison/amp/[4]
- Source: https://www.howtogeek.com/why-im-building-my-own-nas-cost-saving-is-not-a-reason/[3]

## Next Steps
- Check Amazon/Newegg for Synology DS223j/DS224+ (under $300, DiskStation Manager for Hyper Backup/Plex; verify 2026 pricing).
- Download TrueNAS SCALE (free, iXsystems.com) for $400 PC build: Add 4x4TB HDDs (~$300 total).
- Avoid QNAP under $500; their budget line (e.g., TS-233) discontinued or overpriced in 2026 per trends.[1]
