# Contact and actuator diagnostics

The benchmark reads full-horizon completion together with paired measurements
of contact, mechanism progress, vehicle attitude, joint tracking and actuator
use. Continuous measurements use the same first 20 seconds in each reset pair;
completion is scored over the entire task horizon.

| Intervention | Observed response | What the records distinguish |
|---|---|---|
| Hold the first action chunk | No completion or opposing grasp on either tested task; negligible mechanism progress | Continued action updates and interaction progress |
| Reduce valve-arm mass and inertia to 0.8× | Policy and expert completion decrease; policy attitude error and motor effort increase | A physical change affecting both reference and learned execution |
| Delay hatch actuators by 12 physics steps | DP completion stays unchanged while motor-force RMS and force-realization error rise | Execution demand that completion alone does not show |
| Translate the hatch by +4 cm along Y | More early grasp, but no full-horizon completion | Contact acquisition versus completion of the mechanism motion |
| Halve thruster capacity | Hatch completion is preserved with measurable allocation saturation | Actuator use and task completion as separate measurements |

The stale-action and capacity comparisons use one checkpoint; the other listed
policy contrasts use three independent training runs. Each condition has matched
reset identities and its own native reference. These are measured responses to
declared interventions, not an automatic diagnosis of an unobserved network fault.

Full-trajectory hatch analysis checks opening angle, motion accumulated under
opposing grasp, ungrasped motion and the final stable hold. The translated
episodes do not reach the required opening-angle window, explaining why early
grasp does not produce a completed task.

[Policy studies](policy-studies.md) · [Evaluation traces](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/evaluations/diagnostic)
· [Full-episode contract analysis](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/ras-closure-v4-20261012/analysis/analysis-existing)
