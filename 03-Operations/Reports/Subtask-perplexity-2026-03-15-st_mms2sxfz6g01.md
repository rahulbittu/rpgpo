# Subtask Output — Research Bayesian Scoring Fundamentals
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Bayesian Scoring in Recommendation Systems

Bayesian scoring in recommendation systems uses probabilistic models to estimate user-item relevance by combining prior beliefs with observed data, producing posterior probabilities or scores that account for uncertainty. This approach handles sparse data and cold starts effectively, as seen in streaming services where priors initialize recommendations before personal data accumulates[4].

### Mathematical Explanation
Bayesian scoring relies on Bayes' theorem to update beliefs: posterior probability \( P(\theta | D) \propto P(D | \theta) \cdot P(\theta) \), where \( \theta \) is a parameter (e.g., user preference), \( D \) is data (e.g., interactions), \( P(\theta) \) is the prior, and \( P(D | \theta) \) is the likelihood.

- In streaming recsys, **Bayesian priors** start with popularity as a default belief (e.g., widely watched titles), updated to posteriors via interactions; this "borrows strength" from crowds for sparse users[4].
- For binary outcomes (e.g., click/no-click), Dirichlet priors model categorical success probabilities, yielding closed-form posterior means and credible intervals: under uniform prior, posterior mean equals average accuracy (Pass@1 equivalent)[1].
- Calibration step optimizes prior parameters (e.g., alpha/beta via gradient descent on labels) for calibrated probabilities, essential for hybrid search combining lexical and embedding scores[3].

No direct matrix factorization formulas found in results, but Bayesian updates pair with it for latent taste spaces[4].

### Python Implementation Examples
- **Scorio library** (GitHub: https://github.com/mohsenhariri/scorio, released with ICLR 2025 submission on 2025-01-15): Implements Dirichlet priors for posterior means/credible intervals in LLM evaluation (adaptable to recsys binary ratings). Example usage:
  ```python
  from scorio import Score
  scores = Score.from_logits(logits)  # Input model outputs
  posterior_mean = scores.mean  # Bayesian posterior mean
  credible_interval = scores.hdi()  # Highest density interval
  ```
  Achieves faster convergence than Pass@k on AIME'24/'25 benchmarks (e.g., stable rankings at 10-20 samples vs. 100+)[1].
- **Bayesian BM25 calibration** (notebook example on Wayfair WANDS dataset, March 6, 2026): Converts BM25 scores to probabilities with Beta prior, optimizes via gradient descent.
  ```python
  import numpy as np
  from scipy.optimize import minimize  # For alpha/beta optimization
  def bayesian_bm25_score(tf, df, N, alpha=0.1, beta=1.0):  # Prior params
      prior = alpha / (alpha + beta)
      likelihood = 1 / (1 + np.exp(-bm25_raw_score))  # Sigmoid on BM25
      posterior = (alpha + tf * likelihood) / (alpha + beta + tf)
      return posterior
  # Calibrate: minimize log-loss on labels, max P(R) ~0.5 on product_name field[3]
  ```
  Source code in Doug Turnbull's blog notebook (linked in post)[3].

No full production recsys Python repos found in last 30 days (Feb 13 - Mar 15, 2026 searches).

### Real-World Applications
- **Streaming services** (e.g., Netflix/Spotify equivalents): Bayesian priors + matrix factorization for cold-start users; reduces random suggestions in first session by starting with popularity priors, updating posteriors on 1-2 watches. Multi-armed bandits balance exploration (5-10% diverse recs)[4].
  - Table of cold-start tactics:
    | Situation          | Bayesian Approach              | Impact (Practice)                  |
    |--------------------|--------------------------------|------------------------------------|
    | New user           | Popularity priors             | Safe defaults, quick updates[4]   |
    | Sparse clicks      | Posterior shifts via factorization | Latent space placement[4]         |
    | New titles         | Content embeddings + priors   | Theme/cast similarity[4]          |
- **Search/retrieval hybrids** (Wayfair WANDS dataset, 2026): Bayesian BM25 probabilities calibrated for AND with embeddings; lexical max P=0.5 avoids dominance[3].
- **LLM evaluation proxy** (AIME'24/'25 math contests): Posterior scoring ranks models stably at low samples (e.g., non-overlapping CIs detect 5% gaps with 10 trials)[1].

**Next Steps:**
- Clone https://github.com/mohsenhariri/scorio; test on MovieLens 1M dataset (adapt Score.from_ratings).
- Run Turnbull's notebook (https://softwaredoug.com/blog/2026/03/06/probabilistic-bm25-utopia) on your recsys data; calibrate k1=1.2, b=0.75 baseline.
- Prototype streaming cold-start: Use pymc (PyMC v5.17.0) for Dirichlet priors on 100-user subset.

Sources:  
[1] https://openreview.net/forum?id=PTXi3Ef4sT (ICLR 2025 submission, accessed Mar 2026)  
[3] https://softwaredoug.com/blog/2026/03/06/probabilistic-bm25-utopia (Mar 6, 2026)  
[4] https://mathsfor.fun/blog-news/industries/maths-in-technology/streaming-recommendation-system-maths/ (2026 publish, exact date unavailable)
