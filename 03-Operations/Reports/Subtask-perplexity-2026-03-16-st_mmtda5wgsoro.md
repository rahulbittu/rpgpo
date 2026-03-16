# Subtask Output — Research 3-2-1 Backup Strategy
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Implementing the 3-2-1 Backup Rule: Current Guidance (March 2026)

The **3-2-1 backup rule** requires maintaining **3 copies of your data, on 2 different storage types, with 1 copy offsite**—a strategy that protects against hardware failure, site disasters, and data corruption.[1][2]

## Core Components

**Copy 1: Primary Data**
Your live data on your main device or server.[3]

**Copy 2: Local Backup (Different Media)**
A backup on a separate physical storage type, such as an external drive, NAS device, or dedicated backup disk.[2][3] This protects against primary drive failure while remaining locally accessible for quick recovery.

**Copy 3: Offsite Backup**
A copy stored in a different physical location—typically cloud storage or a remote server—protecting against fires, floods, theft, or other site-wide disasters.[2]

## Implementation Tools for Linux Systems

For **RHEL servers**, automated implementation uses:
- **rsync** with hard links for incremental local backups to NAS devices[1]
- **ReaR (Relax-and-Recover)** for disaster recovery images[1]
- Cron scheduling for nightly automation (local backup at 1 AM, offsite at 3 AM, weekly disaster recovery on Sundays)[1]

For **Ubuntu systems**, the recommended stack includes:
- **BorgBackup** for local and remote backups with deduplication[3]
- **Cloud storage** or remote servers for offsite copies[3]
- **Verification scripts** to test backup integrity weekly[3]

## Practical Considerations

The 3-2-1 approach appears complex initially but becomes straightforward once configured.[4] Key data to prioritize includes personal documents (tax files, contracts), photos/videos, work files (spreadsheets, presentations, code), and browser/app configurations.[2]

An emerging enhancement, **3-2-1-1-0**, adds an additional requirement: one copy must be **offline or air-gapped** to protect against ransomware attacks.[5]

**Source:** [1] https://oneuptime.com/blog/post/2026-03-04-implement-3-2-1-backup-strategy-rhel-servers/view | [2] https://www.techtimes.com/articles/314910/20260303/how-back-your-data-right-way-2026-321-backup-rule-explained.htm | [3] https://oneuptime.com/blog/post/2026-03-02-how-to-implement-3-2-1-backup-strategy-on-ubuntu/view | [4] https://www.xda-developers.com/off-site-backups-for-your-nas-are-easier-to-set-up-than-you-think/ | [5] https://www.asustor.com/news/news_detail?id=35926
