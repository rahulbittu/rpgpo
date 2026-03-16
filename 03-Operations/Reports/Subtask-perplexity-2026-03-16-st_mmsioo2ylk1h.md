# Subtask Output — Research PostgreSQL Backup Strategies
## Model: sonar
## Stage: report
## Date: 2026-03-16

## WAL Archiving
WAL (Write-Ahead Logging) archiving continuously copies WAL segments to a repository, enabling point-in-time recovery (PITR) by replaying changes from a base backup. To enable it, set `wal_level` to `replica` or higher, `archive_mode=on`, and configure `archive_command` or `archive_library`; if archiving fails, WAL files accumulate in `pg_wal`.[4] pgBackRest integrates with WAL archiving for full, differential, and incremental backups, storing them in a repository with retention policies.[3][7]

**Example pgBackRest WAL setup for PITR** (from dev.to guide, published ~2026):
```
# Full backup weekly at 02:00, differential daily
0 2 * * 0 pgbackrest --stanza=main backup --type=full
0 2 * * 1-6 pgbackrest --stanza=main backup --type=diff
```
PostgreSQL recovery is "greedy" by default, replaying all WAL to the latest state; use `--type=immediate` to stop at a consistent point, ignoring later changes like accidental DELETEs.[3]

Source: https://dev.to/mohhddhassan/postgresql-backups-and-point-in-time-recovery-with-pgbackrest-13gp[3]

Source: https://simplyblock.io/blog/point-in-time-recovery-for-postgresql-on-kubernetes/[4]

## Point-in-Time Recovery (PITR)
PITR combines a base backup with archived WAL to restore to any specific moment. Minimum requirements: recoverable base backup (e.g., pg_basebackup or operator-driven), continuous WAL archiving to object storage, and a tested restore replaying WAL to a recovery target.[4] On Kubernetes, use regular physical base backups, WAL to object storage, and CSI snapshots for acceleration; restore to a new cluster and validate before promotion.[4] pgBackRest supports PITR with full/differential/incremental backups and efficient WAL replay.[3]

**PITR retention example** (Yandex Cloud Managed PostgreSQL, docs updated ~2026): Automatic backup retention 7-60 days (default 7); Terraform timeouts: cluster restore 30 minutes.[5]

Source: https://simplyblock.io/blog/point-in-time-recovery-for-postgresql-on-kubernetes/[4]

Source: https://dev.to/mohhddhassan/postgresql-backups-and-point-in-time-recovery-with-pgbackrest-13gp[3]

Source: https://yandex.cloud/en/docs/managed-postgresql/operations/cluster-backups[5]

## pg_basebackup
pg_basebackup creates a physical base backup for PITR, serving as a recoverable starting point alongside WAL archiving.[4] It's recommended for binary copies of the entire database cluster, often automated in Kubernetes workflows or scripts.[1][4]

**Automated script example** (Oneuptime blog, Feb 20, 2026) uses pg_dump (logical) but notes pg_basebackup for physical; retention 7 days, compression `-Z 6`, verifies with pg_restore.[1]
```
pg_dump -h localhost -U postgres -d myapp -Fc -Z 6 -f /backups/myapp_20260316_0141.dump
```
For physical: Combine with WAL for PITR; test by starting a new cluster from the backup.[4]

Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-backup-restore/view[1]

Source: https://simplyblock.io/blog/point-in-time-recovery-for-postgresql-on-kubernetes/[4]

## Integrated Strategies and Scripts
**Full backup script** (Oneuptime, retention 7 days, verifies size post-backup):
- Dumps to `/backups/postgresql`, removes >7-day-old files via `find`.[1]
**pg_dump variants** (Oneuptime Ubuntu guide, Mar 2, 2026):
- Custom: `pg_dump -Fc myapp > myapp.dump` (compressed, selective restore).
- Directory: `pg_dump -Fd myapp -f myapp-dir/` (parallel restore).
- All DBs: `pg_dumpall > postgresql-all.sql`.
- Restore parallel: `pg_restore --jobs=4 --dbname=myapp file.dump`.[2]
**pgBackRest strategy**: Weekly full (e.g., Sundays 02:00), daily differential; balances storage and recovery speed.[3]

**Next steps**:
- Test WAL archiving: Run `SELECT * FROM pg_stat_archiver;` to check archive status.
- Automate with cron: `0 2 * * 0 /usr/local/bin/pg_backup.sh`.
- Validate PITR: Restore base + WAL to target time=YYYY-MM-DDTHH:MM:SS, type=immediate.

Source: https://oneuptime.com/blog/post/2026-03-02-backup-mysql-postgresql-automatically-ubuntu/view[2]

Source: https://oneuptime.com/blog/post/2026-02-20-postgresql-backup-restore/view[1]

Source: https://dev.to/mohhddhassan/postgresql-backups-and-point-in-time-recovery-with-pgbackrest-13gp[3]
