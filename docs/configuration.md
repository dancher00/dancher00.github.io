# Robots, control and physical effects

The benchmark separates task geometry and scoring, policy interpretation,
tracking control, motor allocation, physics and image formation. A completed
comparison changes a declared factor while retaining its recorded task contract.

The current open-core [protocol](revision-v2-protocol.md) pins its runtime through
`research/revision-v2-runtime.json`; per-model configs travel with the
[task packages](revision-v2-packages.md). Paths under `benchmarks/core/configs/`
and the completed comparisons described below belong to the historical release.
The new controller study uses three DP trainings on each of Hatch and Valve and
is still in progress.

## Where settings live

| Component | Source |
|---|---|
| Task registration and panel variants | `src/wasman/tasks/underwater_panel/` |
| PressButton environment and configs | `src/wasman/tasks/underwater_press_button/` |
| Robot assets and cameras | `src/wasman/assets/` |
| Command interpretation and expert controllers | `src/wasman/controllers/` |
| ACT/DP data adapters | `src/wasman/learning/` |
| Recorded configurations | `benchmarks/core/configs/` |
| Exact evaluation commands | `research/paper-results-index.json` |

## Keep completed comparisons separate

The core uses task-specific EE or native actuator actions. The interface study
compares both on PushSlider and PullLever after expert replay passes. OpenHatch's
PID/PD study retains one DP checkpoint and removes integral terms. It is not a
comparison of every possible PD tuning. MPC and adaptive-control extensions are
not completed benchmark configurations.

The current/motor study uses RotateValve and OpenHatch with one frozen DP each:
calm water, three uniform transverse currents and two calm-water motor caps.
Stochastic turbulence is disabled. Its test resets differ from the core table.
The final two-robot PressButton study uses articulated arms and compares native
robot/controller systems, not isolated morphology or learned-policy transfer.
The historical held-arm comparison is retained separately.

## Physics and appearance

Per-link reduced-order hydrodynamic forces, buoyancy and motor response act on
rigid-body dynamics. Optional seabed/wall effects have separate matched-command
replays. These are model-sensitivity demonstrations, not CFD or hardware calibration.

Clear/coastal/silted render variants change image formation along a recorded
physical episode. Expert replay under those renderings does not establish RGB
policy robustness. Changing presentation geometry or cameras can also change
policy inputs; retain version labels and do not silently replace test scenes.

For a new study, version the changed configuration and evaluate declared matched
states. Do not modify the saved runtime to improve an old score. See [benchmark scope](benchmark.md).

See the [study-by-study physical model map](physical-model-scope.md) for coefficient
assumptions, model variants and the scope of numerical checks.
