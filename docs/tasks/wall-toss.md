# Wall Toss — underwater capsule transfer

A ROV must dynamically throw a sealed sample capsule through an opening in a
submerged wall. The capsule starts between the fingers. The robot builds
momentum, opens the gripper outside the wall, then brakes and withdraws. The scene contains only the wall and sand;
after passage the capsule freely sinks to the seabed.

The wall reuses the project's existing green bulkhead PBR asset; the solid slab
is replaced by separate colliding panels and a 64-sector aperture insert. The
aperture has a 360 mm clear diameter and an 8 mm plate depth. The capsule remains
50 mm / 100 g, with the same physical gripper, actuator limits and geometry-v2
camera mounts as the preceding prototype. The physical expert changes the grip
orientation so that a finger supports the capsule during acceleration.

## Delivery rule

The capsule must be intentionally released, with forward speed >0.25 m/s, at
least 80 mm clear of the wall (sphere surface). It must travel freely >100 mm
and pass completely through the plate. The base must be at least 0.70 m behind
the front wall at release and at the first complete crossing. Completion requires
10 consecutive control frames completely behind the wall, away from the tool and without
finger contact. The crossing condition is latched at the first crossing; waiting
for the base to retreat cannot repair a stand-off violation at delivery.

The distance is checked at those events, following the delivery-time structure
of [AM-Bench Toss Ball](https://github.com/ambench/ambench/blob/60bf5b73041df4eab571f7d9f0a297aeecbf2e0d/source/ambench/ambench/tasks/toss_ball/toss_ball_env.py).
It is **not** an all-time exclusion zone: the base can transiently get closer
while braking. The audit also reports the minimum gap over the entire trajectory.

## Water mechanics

Seawater density is 1025 kg/m³; capsule volume is 65.4498 cm³. Buoyancy is about
0.658 N against 0.981 N dry weight. The capsule is negatively buoyant.

The translational model in a steady uniform current u is:

```
(m + ma) dv/dt = (rho V - m) g ez
                - 0.5 rho Cd A |v-u| (v-u) - 6 pi mu r (v-u) + contact
ma = 0.5 rho V = 0.033543 kg
Cd = 0.47; mu = 0.00105 Pa s
```

Here ez points upward and g is the positive acceleration magnitude. The added
mass of an isolated sphere in ideal fluid is half the displaced fluid mass:
[MIT derivation](https://ocw.mit.edu/courses/2-016-hydrodynamics-13-012-fall-2005/resources/add_mass_sphere/).
The simulator uses 0.133543 kg translational inertia and adds ma*g upward to cancel
the fictitious gravitational weight of that added inertia. Dry rotational inertia
remains 0.000025 kg m² per axis, verified from the simulator. This is not a change
to capsule dry mass or buoyancy. Rotational Stokes damping is also applied.

The [quadratic drag relation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/)
uses an approximate constant coefficient. [Sphere drag depends on Reynolds number](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-of-a-sphere/).
Physics runs at 480 Hz and control at 30 Hz. No object pose/velocity writes occur
after reset, and there is no grasp attachment, target force or throw impulse.

This is a hydrodynamic simulation experiment, not a real-water validation.
The model does not solve CFD, local flow through the port, thruster wakes,
near-wall variation in added mass, lift or wake-history forces. It also treats
sand as a rigid surface. These limitations apply to the reported results.

## Comparison protocol

Record the state-feedback expert in still water, freeze its eight-channel
absolute command sequence, then replay those exact commands with a uniform
0.2 m/s current along world +Y. Initial scene and random seed remain the same.
The current affects both the vehicle and the capsule. The low-level station keeper
remains active in both conditions; the high-level commands are identical.

A separate free-flight calculation starts from the **same measured release state**
to isolate drag/buoyancy/inertia effects. Counterfactual curves omit contacts and
are labelled as calculations, not additional simulated expert successes.

```bash
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 \
  .venv/bin/python scripts/record_wall_toss_demo.py \
  --output-dir artifacts/wall_toss/new-still --steps 420

OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 \
  .venv/bin/python scripts/record_wall_toss_demo.py \
  --output-dir artifacts/wall_toss/new-current --steps 420 --current-y 0.2 \
  --replay artifacts/wall_toss/new-still/trajectory.npz
```

No learned-policy benchmark or randomized success rate is claimed. The preceding
basket prototype remains historical at commit `3f8a5fb`; its water model did not
include the capsule's added mass. Its results are not merged with this task.

Scene v2 removes the receiver, its support legs and all their colliders. The goal
is passage through the wall, with no container bounds or retention condition.
The original wall/receiver recording is historical at commit `59b0297`; current
videos and evidence are in `benchmarks/wall-toss-v2`.
