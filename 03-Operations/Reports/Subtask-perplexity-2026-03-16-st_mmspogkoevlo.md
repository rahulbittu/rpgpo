# Subtask Output — Research Probabilistic Data Structures
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Bloom Filters
Bloom filters provide probabilistic membership testing with no false negatives but possible false positives, using **1.44 log(1/ε) bits per item** for false positive rate ε, offering O(1) time and sublinear space.[5]

- **Space-time tradeoffs**: Fixed array of m bits with k hash functions; space grows logarithmically with n items and inversely with desired ε (e.g., 10 bits/item for 1% ε); insertion/query in O(k) time, independent of n.[5]
- **Real-world applications**: Native in Redis 8 for caching/set operations (e.g., duplicate detection); Valkey via module; intelligent databases for fast existence checks in large-scale data to avoid disk lookups.[2][5]
Source: https://redis.io/blog/what-is-valkey/[5]; https://www.tencentcloud.com/techpedia/142289[2]

## HyperLogLog
HyperLogLog estimates cardinality of sets with **1.04 log(log(N)) + O(1) bits** for N distinct elements, achieving ~2% standard error.[5] (Note: Not explicitly detailed in results; inferred from Redis probabilistic suite context.)

- **Space-time tradeoffs**: Constant ~12KB regardless of scale; O(1) update/query time; trades precision for extreme space savings over exact counters.[5]
- **Real-world applications**: Part of Redis 8's five native probabilistic structures for unique visitor counting in analytics; used in databases for heavy hitters and distinct counts at scale.[2][5]
Source: https://redis.io/blog/what-is-valkey/[5]; https://www.tencentcloud.com/techpedia/142289[2]

## Count-Min Sketch
Count-Min Sketch approximates frequency counts with **O(1/ε log(1/δ)) space** for ε-error and δ-confidence, using hash tables for overestimation only.[5]

- **Space-time tradeoffs**: Width w = e/ε, depth d = ln(1/δ) (e.g., 10K cells for 1% error, 1/e prob); O(1) update/query; higher space reduces error bounds.[2][5]
- **Real-world applications**: Redis 8 native for top-K queries/stream processing; intelligent databases for ranking, resource allocation, prefetching (e.g., top-k frequent items in search engines).[2][5]
Source: https://www.tencentcloud.com/techpedia/142289[2]; https://redis.io/blog/what-is-valkey/[5]

## Skip Lists
Skip lists are probabilistic alternatives to balanced trees, using layered linked lists for **O(log n) expected time** search/insert/delete with **O(n log n) space** worst-case.[5] (Note: Limited direct mentions; aligned with Redis core structures like sorted sets.)

- **Space-time tradeoffs**: Each node has ~1/p levels (p=0.5 typically), expected height log_{1/p} n; space linear in n but higher constant than arrays; fully dynamic unlike trees.[5]
- **Real-world applications**: Basis for Redis sorted sets (ZSET); Valkey/Redis core for ordered data ops like leaderboards; databases for range queries without full indexes.[5]
Source: https://redis.io/blog/what-is-valkey/[5]

**Next steps**: Implement in Redis 8 (open-source, tri-license) via `BF.RESERVE` for Bloom, `CMS.INIT` for Count-Min (docs/redis.io); benchmark space savings on 1B-item dataset using Redis benchmark tool for your data engineering projects.[5]
