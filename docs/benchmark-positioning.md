# Benchmark contribution and literature scope

To our knowledge, WasserMan is the first multi-task simulation benchmark focused on visuomotor policy learning for manipulating articulated underwater mechanisms.

The scope is a shared learning benchmark for image-conditioned interaction with
articulated mechanisms, including valves, hatches, levers and sliders. Versioned
contact tasks, demonstrations, fixed training and evaluation protocols, physical
completion tests and paired execution studies support this comparison.

## Closest prior work

- [USIM/U0](https://arxiv.org/html/2510.07869v4) provides simulation data and closed-loop VLA evaluation for grasping, navigation, transport and tracking. Its reported task set does not include the articulated-mechanism suite evaluated here.
- [DAVE](https://arxiv.org/html/2209.02862v1) provides underwater intervention scenarios, including bimanual manipulation. Its published evaluation demonstrates simulation infrastructure and scenarios rather than a shared multi-task visuomotor-learning comparison.
- [AquaCap](https://arxiv.org/html/2609.23133) evaluates a Code-as-Policy agent for underwater navigation, grasping and transport.
- [Earlier intervention research](https://skoge.folk.ntnu.no/prost/proceedings/ifac2014/media/files/2819.pdf) includes learned valve turning and underwater manipulation benchmarks. Our priority statement concerns the specialized multi-task simulation benchmark for visuomotor policy learning.
- [Bi-AQUA](https://mertcookimg.github.io/bi-aqua/), [UMI-Underwater](https://arxiv.org/abs/2603.27012) and [ULOHA](https://arxiv.org/abs/2609.19200) study underwater robot learning on physical platforms.

The literature comparison uses primary papers and project descriptions checked
on 14 October 2026. The priority statement is qualified by “to our knowledge”
and applies to the scope above.

The paired studies connect full-episode physical completion with contact,
tracking and actuator measurements over a common observation interval, including
unsuccessful trials. Matched expert references and complete candidate streams
make feasibility and demonstration selection inspectable.
