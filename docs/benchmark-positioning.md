# Benchmark contribution and literature scope

WasserMan provides a multi-task simulation benchmark for visuomotor learning
of floating-base underwater contact manipulation: versioned tasks, physical
experts, RGB demonstrations, fixed learning/evaluation contracts and controlled
policy–controller–environment interventions.

**To our knowledge, it is the first benchmark in this scope.** This priority
statement concerns the combination above, not the invention of underwater
simulation, manipulation, imitation learning or bimanual robots.

## Closest prior work

- [Sanz et al., 2015](https://doi.org/10.1016/j.ifacol.2015.06.002) present underwater intervention benchmarking with tracking under visibility/current variations and reconstruction. This establishes prior underwater benchmarking, while addressing a different evaluation scope.
- [MarineGym](https://marine-gym.com/) provides GPU reinforcement-learning simulation for underwater robots, including station keeping and trajectory tracking.
- [Bi-AQUA](https://mertcookimg.github.io/bi-aqua/) studies bilateral imitation learning and lighting variation on underwater hardware.
- [UMI-Underwater](https://arxiv.org/abs/2603.27012) studies grasping with demonstration collection and affordance-conditioned diffusion policies on a physical platform.
- [ULOHA](https://arxiv.org/abs/2609.19200) introduces underwater bimanual hardware and evaluates ACT, DP and SmolVLA.

The related-work comparison was refreshed on 1 October 2026 using primary papers
and project pages, with searches for underwater manipulation benchmarks,
visuomotor benchmarks and underwater simulation learning suites. No matching
multi-task simulation benchmark was identified in this bounded search; a search
cannot prove an exhaustive global absence. The manuscript therefore uses
“to our knowledge” with an explicit scope.

The benchmark is extensible through task and platform contracts. New versions
retain past data, scores and scientific provenance; adding tasks does not change
the denominator or rules of an already reported comparison.
