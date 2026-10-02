# Add a task

Work on a development branch; keep the published runtime and test cohort fixed.
A task is complete when its physical contract, expert and recorded evidence agree,
not when its name appears in the environment registry.

## Follow an existing task through the code

For a constrained-contact task, start with
`src/wasman/tasks/underwater_panel/linear_cfg.py` and its package registration.
Follow the mechanism state through `marine_mechanism.py` and `marine_evidence.py`
in `src/wasman/controllers/`, then inspect `scripts/rollout_marine_visual.py`.
Use the original files as a map, not as a reason to reuse a success threshold.

## Implement the contract

1. Define units, reset distribution, articulation limits, collisions and physical goal.
2. Separate success predicates, failure conditions and progress diagnostics. Specify any hold duration.
3. Register a new versioned task ID and config without replacing an existing ID.
4. Implement an expert that acts through the declared robot/controller interface.
5. Record privileged audit channels separately from learner observations.
6. Check feasibility and expert-command replay on development states before collecting training data.

Inspect grasp, contact and release geometrically where the task depends on them.
A model or expert must not pass through an object and still receive success.
Record the scope and sampling rate of any geometric audit rather than claiming
unobserved substeps have been verified.

## Integrate learning and reporting

Declare ordered observation/action fields, normalization, camera mounts, rates
and chunk execution. Add a loader and evaluation adapter only when existing ones
are incompatible. The public router in `src/wasman/benchmark.py` explicitly lists
supported tasks; adding a task there requires matching backend routing.

Use independent collection, development and test states. Preserve failed runs.
Add task-specific logic tests and a bounded simulator check that exercise the
physical criterion, then save configs, source hashes, checkpoint selection,
outcomes and representative films. Update the catalog status and result registry
only after the corresponding evidence exists. See [training](train-policies.md).
