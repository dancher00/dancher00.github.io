// Underwater-native task suite. AM-Bench informs the structure, not literal task content.
import modelBenchmarks from "./modelBenchmarks.json";

const hatchBenchmarked = modelBenchmarks.rows.some((row) => row.task === "OpenHatch");
export const groups = [
  "Instantaneous interaction",
  "Object transport",
  "Articulated objects and constrained contact",
] as const;
export const groupDescriptions = [
  "Brief, precise contact.",
  "Visual grounding, payload changes and multi-stage completion.",
  "Sustained contact along constrained trajectories.",
] as const;
export const tasks = [
  {
    id: "HotStab",
    group: 1,
    name: "Recover & Insert Hot-Stab",
    status: "Benchmarked",
    description: "Recover a protective dummy connector from the sand, insert it into an isolated service receptacle, release and withdraw.",
    success: "Verified opposing-finger grasp and lift above 15 cm; seating nose x=1.280–1.318 m, radial error <3 mm and axis alignment >0.996. Release, withdraw >19 cm and hold unsupported seating below 1 cm/s for 2 s. Expert 28/30, ACT 2/30, DP 0/30; all 90 sampled geometric audits pass.",
    randomization: "Plug reset x ±4 cm, y ±2.5 cm, yaw ±5°. Fixed base/wrist cameras and water conditions; 59 accepted demonstrations from 64 attempts, eight development states and 30 held-out tests.",
    adaptation: "Physical pick-and-insert under negative buoyancy. Rigid sand; pressurization, sealing and electrical connection are not modeled. Separate observation/training protocol outside the core average.",
  },
  {
    id: "TossBall",
    group: 1,
    name: "Wall Aperture Toss",
    status: "Expert demo",
    description: "Throw a sample capsule through an opening in a submerged wall. Compare still water and cross-current under identical high-level commands.",
    success: "Release above 0.25 m/s, travel freely over 10 cm, pass fully through the 360 mm aperture and remain contact-free beyond the wall for 10 control frames. Base stand-off ≥0.70 m at release and first full crossing.",
    randomization: "One paired nominal state (seed 42), 0 versus +Y 0.2 m/s current. Still-water success at 7.80 s; current replay strikes the aperture edge. No ACT/DP or randomized success-rate estimate.",
    adaptation: "A preloaded 50 mm / 100 g capsule with physical finger contact, buoyancy, drag and 33.543 g sphere added mass. No receiver or attachment. Hydrodynamic approximation, not water-tank validation.",
  },
  {
    id: "CutRope",
    group: 2,
    name: "Release a Sample Case",
    status: "Benchmarked",
    description:
      "Cut the securing line of a sample container in a dark, flooded cargo hold, then open and withdraw the cutter for the recovery operation.",
    success:
      "Native severance; cut ends separated by more than 8 cm; cutter open and withdrawn more than 12 cm, with total rope contact below 0.1 mN and tool speed below 1.5 cm/s for 1 second.",
    randomization:
      "Seeded robot poses and hydrodynamics in one fixed 12°-tilted cargo hold; calm water. New-layout and current generalization are not evaluated.",
    adaptation:
      "A 6 mm segmented nylon securing line and contact-triggered native joint release. The 8 N failure threshold is an engineering assumption. Rack and case are static; subsequent case extraction is outside the task.",
  },
  {
    id: "RecoverData",
    group: 2,
    name: "Recover a Shipwreck Hard Drive",
    status: "Benchmarked",
    description:
      "Open an unlocked fallen cabinet in a dark, flooded captain’s cabin and recover a bare 3.5-inch hard drive using only the robot’s flashlights.",
    success:
      "Open ≥80° with ≥65° accumulated under opposing finger contact; extract the entire HDD clear of the cabinet and hold it with opposing gripper contacts, low object speed and a stable vehicle for 2 s. No object attachment or pose drive.",
    randomization:
      "Seeded robot resets in one fixed 25°-heeled cabin; calm water. Layout and current generalization are not evaluated.",
    adaptation:
      "Multi-stage articulated opening and contact-based retrieval. The negatively buoyant HDD rests against original cabinet panels. Corrected-scene ACT/DP: 0/30 each after training on 80 fresh accepted demonstrations. Door/HDD–hinge audits pass 27/30 ACT and 30/30 DP episodes; failures remain counted. Historical collision-defective data are excluded.",
  },
  {
    id: "PressButton",
    group: 0,
    name: "Press Button",
    status: "Validated",
    description:
      "Swim to the panel, settle the vehicle, then align the arm and press a spring-loaded button while holding station.",
    success:
      "Travel ≥ 4 mm, distance < 13 cm, alignment > 0.70, attitude < 0.25 rad and angular speed < 0.35 rad/s. Legacy: four policy steps. Smooth: 30 steps (1 s), travel ≤ 7 mm and tool speed ≤ 3.5 cm/s. Folded approach: 90 steps (3 s); releasing below 3 mm before success fails the attempt.",
    randomization:
      "Button placement, initial pose, current, buoyancy, drag and added mass.",
    adaptation: "Direct underwater counterpart of AM-Bench PressButton.",
  },
  {
    id: "InsertConnector",
    group: 0,
    name: "Insert into Socket",
    status: "Planned",
    description:
      "Align a grasped connector or sample cartridge and insert it into a subsea socket under current.",
    success:
      "Planned: insertion depth and lateral error tolerances, with stable engagement.",
    randomization: "Receptacle placement, clearance, friction and current.",
    adaptation:
      "Adapts PegInHole to an underwater connector and a grasped object; requires a compatible end-effector fixture.",
  },
  {
    id: "SamplePlacement",
    group: 1,
    name: "Sample Rack Placement",
    status: "Planned",
    description:
      "Transport a recovered sample cartridge and seat it in a subsea collection rack.",
    success:
      "Planned: grasped transport, correct rack slot, stable seating and release.",
    randomization: "Cartridge mass, buoyancy, rack clearance and current.",
    adaptation:
      "Retains FrameAssembly's transport-and-seat structure with a subsea sampling fixture.",
  },
  {
    id: "SeabedRecovery",
    group: 1,
    name: "Seabed Object Recovery",
    status: "Planned",
    description:
      "Grasp an object resting on the seabed, lift it clear and transfer it into a recovery basket.",
    success:
      "Planned: verified grasp, clearance above the seabed, delivery and stable release in the basket.",
    randomization: "Object pose, bed friction, mass, buoyancy and current.",
    adaptation:
      "Underwater pick-and-place with bottom contact and changing apparent weight; no airborne cabinet scene.",
  },
  {
    id: "CollectShell",
    group: 1,
    name: "Collect Shell into a Hoop",
    status: "Validated",
    description:
      "Pick a shell from a sandy seabed with seagrass, algae and coral groups, then place it inside a hoop on the sand.",
    success:
      "Physically grasp, lift and carry the shell; release it fully inside the hoop, settled on the seabed for 1 s. Drift, pushing and held objects do not count. Expert verified; fixed-budget ACT 0/30 and DP 28/30 on unseen reset seeds.",
    randomization:
      "Initial prototype: shell position and yaw. Planned splits: size, hoop position, mass, friction and current.",
    adaptation:
      "Physical pickup and placement with the existing gripper. Fixed hoop and textured rigid seabed for the first version; no granular-sand or biological-damage claim.",
  },
  {
    id: "DebrisClearance",
    group: 1,
    name: "Clear Subsea Debris",
    status: "Planned",
    description:
      "Remove a loose obstruction from a subsea work area and deposit it in a designated collection zone.",
    success:
      "Planned: obstacle removed from the protected region and settled in the collection zone after release.",
    randomization: "Debris geometry, density, drag, bed friction and current.",
    adaptation:
      "A submerged transport-and-release problem. Ballistic tossing is intentionally excluded from this setup.",
  },
  {
    id: "RotateValve",
    group: 2,
    name: "Rotate Valve",
    status: "Benchmarked",
    description:
      "Swim in with the arm folded, grasp the valve, turn against resistance, hold, then release and withdraw.",
    success:
      "Signed valve rotation ≥170°. ACT and Diffusion Policy evaluated in calm water with a fixed valve position and a 75 s horizon. The expert film shows the full approach, turn and withdrawal sequence.",
    randomization:
      "Placement, initial robot pose and hydrodynamics. Radius and resistance randomization planned.",
    adaptation:
      "Same intervention objective; coupled arm–vehicle dynamics underwater.",
  },
  {
    id: "PushSlider",
    group: 2,
    name: "Push Slider",
    status: modelBenchmarks.rows.some(r=>r.task==="PushSlider") ? "Benchmarked" : "In development",
    description:
      "Move a captive handle along its rail while following the contact trajectory.",
    success:
      "27 cm signed travel on a 30 cm rail, tool engagement and a stable base. Marine-v1 uses a grounded panel and passive mechanism.",
    randomization:
      "Placement, initial robot pose and hydrodynamics. Travel and friction randomization planned.",
    adaptation: "Same prismatic constraint as AM-Bench PushSlider.",
  },
  {
    id: "PullLever",
    group: 2,
    name: "Pull Lever",
    status: modelBenchmarks.rows.some(r=>r.task==="PullLever") ? "Benchmarked" : "In development",
    description:
      "Acquire a lever and pull through its constrained arc while rejecting reaction torque.",
    success:
      "40° lever angle, tool within 6 cm of the moving tip and a stable base. Marine-v1 uses a grounded panel and passive mechanism.",
    randomization:
      "Placement, initial robot pose and hydrodynamics. Stiffness and damping randomization planned.",
    adaptation: "Same revolute interaction as AM-Bench PullLever.",
  },
  {
    id: "OpenHatch",
    group: 2,
    name: "Open Submarine Hatch",
    status: hatchBenchmarked ? "Benchmarked" : "Benchmark in progress",
    description:
      "Approach a horizontal hatch embedded in sand, grasp the lifting handle and raise the hinged lid while holding station.",
    success:
      "Opening 80–105°, with ≥75° signed motion under opposing finger contact and ≤5° motion outside the grasp. Hold near the handle for 1 s with lid speed ≤0.05 rad/s, tool speed ≤0.04 m/s and stable vehicle. The recording is separate from the learned-policy benchmark.",
    randomization:
      "Initial robot pose and hydrodynamics. Fixed horizontal hatch; resistance and burial-depth variation planned.",
    adaptation:
      "Flooded compartment, pressure equalized and already unlatched. A 55 cm original marine fixture with buoyancy-assisted lid. Sand is a textured rigid surface. Visual ACT/DP policies use wrist RGB and measured robot state, with absolute base, joint and jaw targets.",
  },
  {
    id: "OpenChest",
    group: 2,
    name: "Open a Submerged Chest",
    status: "Planned",
    description:
      "Acquire the handle of a submerged chest, release its latch and lift the lid against hinge resistance and water drag.",
    success:
      "Planned: latch disengaged, lid angle reached and opening held long enough to access the contents.",
    randomization:
      "Latch resistance, lid inertia and buoyancy, hinge friction and current.",
    adaptation:
      "Adapts articulated opening to a submerged chest with a lifting lid, not an aerial doorway.",
  },
  {
    id: "CutKelp",
    group: 2,
    name: "Cut Kelp",
    status: "Planned",
    description:
      "Bring a cutting tool to a designated kelp strand and sever it without contacting protected cables or structures.",
    success:
      "Planned: target strand connection physically released by tool engagement; protected connections remain intact.",
    randomization:
      "Strand pose, tension, break threshold, compliance and current.",
    adaptation:
      "Underwater-specific extension, not renamed window wiping. Requires a cutter attachment and an explicit, validated breakable-connection model.",
  },
  {
    id: "CutNet",
    group: 2,
    name: "Cut an Entangling Net",
    status: "Planned",
    description:
      "Cut selected strands of a net to release a trapped object while keeping the vehicle and arm clear of entanglement.",
    success:
      "Planned: required strand connections broken, target freed, forbidden strands intact and no robot entanglement.",
    randomization:
      "Net topology, tension, strand strength, object pose and current.",
    adaptation:
      "Underwater-specific topology-changing manipulation. Requires cutter geometry and strand-level contact/breakage; not currently simulated.",
  },
] as const;
export const effects = [
  {
    title: "Currents",
    equation: "νᵣ = νbody − νwater",
    text: "The underwater counterpart to wind: relative-water velocity drives per-link drag and added mass. Uniform flow plus bounded Ornstein–Uhlenbeck disturbances, not an arbitrary constant force or CFD.",
    range: "Existing task flow: 0–0.22 m/s · sensitivity below: ±0.30 m/s",
    state: "Implemented",
  },
  {
    title: "Seabed proximity",
    equation: "T′ᵢ = (1 − ℓᵢ) Tᵢ",
    text: "Down-going thruster jets can recirculate at a boundary. An optional per-motor loss surrogate uses actual mount orientation, signed thrust and rotor-to-bottom distance. This is not a drone ground-effect lift multiplier.",
    range: "Experimental · default OFF · assumed c = 0.20, range = 10 diameters",
    state: "Experimental",
  },
  {
    title: "Near-wall effect",
    equation: "ℓ = c cos²θ [1 − (s/L)²]²₊",
    text: "A bounded rear-jet loss hypothesis for the finite panel. Reversing thrust reverses exhaust direction; jets that miss the panel receive no wall correction. Underwater rear-wall experiments motivate the mechanism, not T200 calibration.",
    range: "Experimental · default OFF · no wall-attraction force",
    state: "Experimental",
  },
  {
    title: "Actuator response",
    equation: "RPMₖ₊₁ = RPMₖ + α(RPMdelayed − RPMₖ)",
    text: "Existing T200 allocation, asymmetric limits, PWM deadband, command delay and first-order RPM response. Surface corrections are downstream of realized motor thrust. Static curves are manufacturer data; dynamic timing remains an engineering assumption.",
    range: "T200 tasks only · τ = 80 ms assumed · delay = 2 physics steps",
    state: "Implemented",
  },
  {
    title: "Buoyancy",
    equation: "Fᵦ = ρVg",
    text: "Per-link displaced volume and centre-of-buoyancy torque. Eleven bodies include the vehicle and articulated manipulator.",
    range: "Volume: 0.97–1.03 × nominal",
    state: "Implemented",
  },
  {
    title: "Drag",
    equation: "τᴅ = −D₁νᵣ − D₂|νᵣ|νᵣ",
    text: "Linear and quadratic resistance in six degrees of freedom, relative to local water velocity.",
    range: "Damping: 0.85–1.15 × nominal",
    state: "Implemented",
  },
  {
    title: "Added mass",
    equation: "τₐ = −Mₐν̇ᵣ − Cₐ(νᵣ)νᵣ",
    text: "Filtered acceleration reaction and added-mass Coriolis terms. Coefficients are engineering estimates, not experimentally identified parameters.",
    range: "Added mass: 0.90–1.10 × nominal",
    state: "Implemented",
  },
  {
    title: "Visibility",
    equation: "I(d) = I₀ e⁻ᵝᵈ + B(1 − e⁻ᵝᵈ)",
    text: "Depth-dependent RGB attenuation and backscatter, with independently switchable scene lighting and vehicle-mounted lamps. Controlled camera comparisons below; coefficients are illustrative, not calibrated water measurements. No policy robustness result yet.",
    range: "Clear / coastal / harbor · controlled sensor comparisons",
    state: "Experimental",
  },
] as const;
