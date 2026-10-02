# Bimanual valve study: development protocol

Status: development; no final outcomes. Native single-arm tasks and the frozen
articulated PressButton v3 comparison remain unchanged.

## Question and configurations

Does grasping a fixed support with one arm change valve-turning performance,
base motion, contact retention and actuator load, compared with a parked support
arm on the identical floating twin-arm system? The effect is not assumed positive.
A third configuration turns the same wheel with both hands, with sequential
release/regrasp while the opposite hand remains commanded closed.

The custom Rex variant has two native Oberon7 chains at (1.3, +/-0.5, -0.665) m.
All original link inertias, collisions, actuators and force limits are retained.
Mass, displaced volume and drag are duplicated per arm; base parameters and motors
are not increased. Composite rigid inertia/reaction includes both moving arms.
The existing approximation uses base-only added mass and lagged measured joint
acceleration/contact; arm added mass and hydrodynamic interaction are unmodeled.
This is a simulated mounting variant, not a claim of a manufactured vehicle.

All three configurations use a separately versioned 4x industrial valve fixture:
the native Oberon fingers cannot acquire the original 126 mm wheel cleanly.
The large wheel is 506 mm in diameter; geometry lengths scale by 4, mass and
displaced volume by 64, and rotational inertia by 1024. Wheel mass is 11.52 kg,
displaced volume 0.00384 m³, and principal inertia (0.4608, 0.256, 0.256) kg m².
Passive shaft damping/friction scale by 64, an explicit constant-shear-stress
assumption (shaft radius cubed), not a measured hardware parameter. No wheel
motor or grasp weld is used. This variant does not replace original RotateValve
scores or assets. Signed shaft angle >=170 degrees remains the success criterion. Bilateral grasp,
contact forces and geometric audits are separate diagnostics. Support is physical
finger contact with a fixed rail, not a world weld or kinematic base. Both regimes
use identical scene geometry, resets, motors, mass, gains and right-arm objective;
only the left-arm command changes. A no-command control must not turn the valve.

The right-arm trajectory is identical across conditions. Acquisition starts
22.5 degrees between spokes: open fingers at a spoke intersect its collision
geometry, causing undesired pre-grasp rotation. Native jaw range, speed and force
limits are retained. Commands comprise settling, approach, closure, a 90-degree
turn, left then right regrasp, and another 90-degree turn. The guarded development
candidate has a 180 s physical-time horizon; nominal regrasp lasts 36 plan seconds
per hand. Independent per-environment clocks wait for measured pose, native jaw
opening, or opposing contact at acquisition/regrasp boundaries. The free/support
pair uses identical right-arm guards; left support contact is an outcome, not a
condition for advancing the right arm. The two-hand extension guards both hands.
The base starts at (0.7, 0, 1.5) m to provide workspace margin. The earlier x=0.5 m
candidate failed to complete physical withdrawal before starting the return arc.
An initial offline claim of large IK infeasibility was invalidated by a float64
recheck: most recorded target poses remain reachable. The improved candidate
changes placement and guarded sequencing together, so their separate causal
effects are not established. No reach, force, or physical joint limit is increased. The base
reference remains fixed. The development comparison includes measured-base
and commanded-level-base IK with bounded TCP feedback; the level-reference
version keeps base motion out of arm-deflection compensation. Native self-collisions remain enabled. For the two-wheel-hand extension
the unused support rail is moved aside; the primary free/support contrast retains
identical scene geometry. Regrasp is a controller behavior, not a success relaxation.
Withdrawal is 10 cm: a deeper 15 cm withdrawal self-collides at the recorded
displaced-base pose, whereas the shorter version clears both the robot pedestal
and the wheel. After the second turn, the controller settles for 2 s, opens the
jaws for 4 s with a measured-opening guard, and retreats 10 cm over 7 s. Continued
closed-chain holding after task completion is not part of the action plan.
Initial acquisition uses 0.5 rad jaw opening. Regrasp/final release uses 0.25 rad,
with a measured 0.22 rad opening guard: the wider aperture catches a neighboring
spoke under the recorded release disturbance. The narrower aperture clears the
sampled CAD configurations with wheel/grasp angular offsets up to +/-10 degrees.
This changes commanded opening, not native joint ranges or motor effort limits.

## Bounded development and final evaluation

- Development seeds 91000–91002, separate demo 91003.
- Final seeds 92000–92029 remain unopened until geometry, controls and numerical
  gates pass and source/configuration hashes are frozen.
- Start with mass/COM/import checks and CPU reach/self-collision checks. Then
  confirm actual physical grasp, free floating dynamics and native actuator limits.
- Compare 240/480 Hz for the fixed candidate on the development states. Require
  identical success, finite unmodified telemetry, <=10 mm TCP RMS discrepancy,
  <=0.5 degree base-orientation discrepancy, <=0.02 rad joint discrepancy, and
  <=5 degree valve-angle discrepancy. No artificial acceleration clipping.
- Once accepted, evaluate all three conditions on all 30 new paired states without
  tuning. Independently replay angle success and report every episode.
- Report task success, actual angular progress, bilateral contact retention/loss,
  base attitude/displacement, normalized motor load and force saturation. State
  time windows explicitly and do not conflate successful-only metrics with all runs.
- Preserve all failed candidates. Report development-only status if a gate cannot
  be passed; do not substitute a selected movie for a completed benchmark.

## Reproduction and claims

Release source, parameters, hashes, raw traces, numerical audits and real-time
silent videos; update manuscript/site only with properly labeled actual results.
Then test a clean release checkout and environment, including asset installation,
expert rollout, saved-policy inference/evaluation, archive retrieval and manuscript/
website builds. Same-machine clean installation is not independent-machine replication.
Prior dual-arm underwater-control literature prevents a first-ever bimanual claim.

Primary related work: E. Simetti and G. Casalino, “Whole body control of a dual arm
underwater vehicle manipulator system,” *Annual Reviews in Control* 40, 191–200,
2015, [doi:10.1016/j.arcontrol.2015.09.011](https://doi.org/10.1016/j.arcontrol.2015.09.011).
Its abstract/introduction and dual-arm model describe whole-body control and
simulation of a dual-arm UVMS. Our proposed contribution concerns a reproducible
contact-task comparison within a benchmark, not the invention of dual-arm UVMS.

## Development status and effective actuator model

The current two-hand candidate passed the complete 180 s cycle on all three
development states at both 240 and 480 Hz, including independent success replay,
CAD self-collision, native joint/motor limits and numerical convergence. The
three-condition development comparison remains in progress. A prior full
development run crossed 170 degrees on three states but violated geometry/native
position-limit gates. It is not a valid 3/3 benchmark. Final states remain unopened.
A level-reference arm-feedback diagnostic substantially reduces base motion during
contact. Corrected fixture initialization, resolved contact moments and a shared
jaw-aperture command subsequently passed the 45 s first-turn diagnostic on all
three development states at 240 and 480 Hz. Across those states, TCP RMS
discrepancy was 0.254–0.448 mm, maximum base-orientation discrepancy was
0.0165–0.0279 degrees and maximum joint discrepancy was 0.00673–0.00683 rad.
The subsequent accepted two-hand full-cycle discrepancy was 0.316–0.730 mm TCP
RMS, at most 0.02791 degrees base orientation, 0.00686 rad joint position and
0.2561 degrees shaft angle. Full-cycle free/support acceptance is still pending.
Short command-replay, solver-iteration, grip-command and initial-load diagnostics
are preserved separately and are not additional benchmark conditions.

The inherited implicit actuator model has effective zero static, dynamic and
viscous robot-joint friction, as confirmed in actual simulator property tables.
Its arm/jaw PD gains are selected simulation-controller parameters, not a claim
of reproducing all native URDF dynamics or measured hardware gains. Import audits
record the effective gains/friction, masses, COM and solver iterations. Native
geometry, joint position/speed/effort limits and motor force caps are retained.
Frozen single-arm v3 source and evidence are not rewritten by this development.

### Shared-aperture grasp command

The optional 4 Nm closing bias uses a common position target for both jaws:
`q_target_left = q_target_right = mean(q_left, q_right) - 4 / 400`.
The inherited 400 Nm/rad jaw stiffness and damping remain unchanged. This keeps
the total closing bias at 8 Nm while restoring differential stiffness when the
two independently simulated fingers move in opposite directions. The previous
per-finger target `q_i - 4 / 400` removed that centering term and left opposite
jaw displacements weakly constrained. No physical mimic joint, lock, force cap
or changed joint limit was introduced. The 4 Nm bias is an engineering command
choice, not a calibrated hardware grasp-force measurement.

### Initialization fault isolated on 28 September

A physics-rate startup trace exposed a one-step base contact impulse (364–579 kN
peak normal force) that the 30 Hz recordings missed. In a controlled dry free-fall
test with fixed joint targets and isolated fixtures, authoring the fixed valve
and kinematic rail at their reset poses **before** simulation warmup removed it.
All four instances then retained their joint positions exactly and changed base
orientation by less than 0.000002 degrees over 15 s. No mass, contact geometry,
actuator gain/limit, fluid coefficient or success predicate changed. This isolates
fixture initialization as the cause of the startup fault; it does not establish
the exact backend cache mechanism or guarantee task-contact convergence.
`startup-cause.json` and both physics-rate traces preserve the counterfactual.
Full-cycle acceptance is required for every reported condition after this correction.

### Resolved contact moments

A read-only contact audit found that multiplying an aggregate force by the mean
contact position loses force couples. On development seed91000 over20–29s, the
left/right moments about the wheel shaft were+0.409/+0.291Nm when each force used
its own reported application point; the mean-point estimate gave-0.143/-0.180Nm.
Force sums themselves agreed within7.2e-6N. An independent1kg block test under
3N static and10N sliding loads verified that normal **plus** friction has the
correct sign (Newton residual RMS below2.5e-5N); no friction sign was changed.

The new bimanual contour uses resolved normal and friction application points
in its contact-moment estimate for base added-mass closure. The one-step contact
and joint-acceleration lag remains. No mass, force limit, gain, friction or task
criterion changes. This refinement does not rewrite the frozen PressButtonv3
model, whose mean-point contact approximation remains part of its disclosed
scope. Pure-force-couple and reference-translation regression checks protect the
new reduction. Hardware validation is still absent.

### Final films: recorded dynamics in the existing pool presentation

The final demo reset remains 91003 for all three conditions. Its 180 s physical
trace is evaluated and audited before rendering. The renderer reuses native
robot/valve geometry, the existing 25 × 25 × 2.5 m Tiles107 pool, and the sourced
ship-green panel, extended visibly to the pool floor. It reconstructs measured
base/joint/shaft states at 30 Hz and checks tool FK and pool clearance. No
physics integration is performed by the renderer; it cannot change success.
The pool/panel are presentation geometry, not a new physical boundary-effect
experiment. Videos show the full trace in real time, without audio or overlays.
State-replay rendering and source hashes are disclosed alongside the film.

A trial with simultaneous camera/dynamics and development/dynamics processes
caused GPU context contention despite available memory. Recording the physical
trace once and rendering it separately avoids that slowdown. The preliminary
emailed seed-91000 replay remains development evidence; it is not substituted
for the preselected separate final film.
