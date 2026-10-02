"""Assemble the project overview from recorded media, without running physics.

Source films and measured results are read only. The storyboard records every
editorial cut and playback rate. Render into a maintenance directory first;
promote the reviewed master, poster and manifest to the website afterwards.
Requires Pillow and imageio-ffmpeg. --font is a TTF export of the project's
Manrope WOFF2; --logo is a transparent rendering of its existing dark SVG.
"""

import argparse
import concurrent.futures
import contextlib
import hashlib
import json
import math
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "website"
WIDTH, HEIGHT, FPS = 1920, 1080, 30
NAVY, SURFACE, INK, CYAN, TEAL, AMBER = "#071c2b", "#112f43", "#edf7ff", "#69c5ff", "#52e0ce", "#ffd17c"
MODEL_COLORS = {"ACT": "#679cf3", "DP": "#ffc46b", "BC": "#c0a2ff", "SmolVLA": "#ff8896"}
NAMES = {
    "PressButton": "Press button",
    "RotateValve": "Rotate valve",
    "OpenHatch": "Open hatch",
    "CollectShell": "Collect shell",
    "PushSlider": "Push slider",
    "PullLever": "Pull lever",
    "HotStab": "Hot stab",
    "CabinRecovery": "Cabin recovery",
    "CargoRelease": "Cargo release",
    "WallToss": "Wall toss",
}


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


class Overview:
    def __init__(self, args):
        self.args, self.output = args, args.output_dir.resolve()
        self.output.mkdir(parents=True, exist_ok=True)
        self.ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        self.public = args.public_dir.resolve()
        self.story = json.loads((SITE / "overview-storyboard.json").read_text())
        self.views = json.loads((SITE / "src/taskDemonstrations.json").read_text())
        self.primary = json.loads((ROOT / "research/revision-v2-primary-results.json").read_text())
        self.total = sum(clip["duration"] for clip in self.story["clips"])
        self.inputs, self.metadata = {}, {}
        self.annotations = json.loads((args.annotations_dir / "annotations-manifest.json").read_text())
        self.annotation_rows = {row["id"]: row for row in self.annotations["rows"]}
        for field, relative in (
            ("component_sha256", "src/ProjectedEffects.tsx"),
            ("stylesheet_sha256", "src/styles.css"),
        ):
            if digest(SITE / relative) != self.annotations[field]:
                raise ValueError("Website annotation source changed: " + relative)
        self.logo = Image.open(args.logo).convert("RGBA")

    def font(self, size, weight=500):
        font = ImageFont.truetype(str(self.args.font), size)
        with contextlib.suppress(OSError, ValueError):
            font.set_variation_by_axes([weight])
        return font

    def text(self, draw, xy, text, size=30, color=INK, weight=500, max_width=None):
        font = self.font(size, weight)
        if max_width and draw.textlength(text, font=font) > max_width:
            raise ValueError(f"Text exceeds its reserved width: {text}")
        draw.text(xy, text, fill=color, font=font)

    def source(self, relative):
        path = self.public / relative.removeprefix("./")
        if not path.is_file():
            raise FileNotFoundError(path)
        if relative not in self.inputs:
            self.inputs[relative] = {"sha256": digest(path), "bytes": path.stat().st_size}
        return path

    def media(self, relative, start, duration, rate=1, box=None, label="", crop_to_panel=False):
        path = self.source(relative)
        if relative not in self.metadata:
            reader = imageio_ffmpeg.read_frames(str(path))
            self.metadata[relative] = next(reader)
            reader.close()
        # Half a frame tolerates container duration rounding, never a missing tail.
        metadata = self.metadata[relative]
        if start < 0 or start + duration * rate > metadata["duration"] + 0.5 / metadata["fps"]:
            raise ValueError(f"Editorial range exceeds source duration: {relative}")
        crop = None
        if box is not None and crop_to_panel:
            _, _, w, h = box
            source_w, source_h = metadata["size"]
            crop_w = min(source_w, source_h * w // h) // 2 * 2
            crop_h = min(source_h, source_w * h // w) // 2 * 2
            crop = ((source_w - crop_w) // 2, (source_h - crop_h) // 2, crop_w, crop_h)
        elif box is not None:
            x, y, available_w, available_h = box
            source_w, source_h = metadata["size"]
            divisor = math.gcd(source_w, source_h)
            unit_w, unit_h = source_w // divisor, source_h // divisor
            multiple = min(available_w // unit_w, available_h // unit_h) // 2 * 2
            if multiple < 2:
                raise ValueError(f"Native aspect ratio cannot fit the panel: {relative}")
            w, h = unit_w * multiple, unit_h * multiple
            box = (x + (available_w - w) // 2, y + (available_h - h) // 2, w, h)
        return {
            "path": path,
            "source": relative,
            "start": start,
            "rate": rate,
            "box": box,
            "label": label,
            "native_size": metadata["size"],
            "crop": crop,
        }

    def effect(self, name, duration, box, label):
        row = self.annotation_rows[name]
        if row["duration"] != duration or (row["width"], row["height"]) != box[2:]:
            raise ValueError("Annotation timeline or panel size mismatch: " + name)
        for path_key, hash_key in (("source", "source_sha256"), ("trace", "trace_sha256")):
            if digest(self.source(row[path_key])) != row[hash_key]:
                raise ValueError("Recorded physics input changed: " + name)
        overlay = self.args.annotations_dir / row["movie"]
        if digest(overlay) != row["movie_sha256"]:
            raise ValueError("Annotation movie changed: " + name)
        stream = self.media(row["source"], 0, duration, box=box, label=label)
        stream["annotation"] = row
        stream["overlay_path"] = overlay
        return stream

    def plate(self, clip, transparent=False):
        image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0) if transparent else NAVY)
        draw = ImageDraw.Draw(image)
        hero, outro = clip["layout"] == "hero", clip["layout"] == "outro"
        if hero:
            draw.rectangle((0, 786, WIDTH, HEIGHT), fill=(7, 28, 43, 237))
        elif outro:
            draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(7, 28, 43, 218))
        elif transparent:
            # A native title plate, leaving the recorded image ungraded.
            draw.rectangle((0, 0, WIDTH, 210), fill=(7, 28, 43, 235))
            draw.rectangle((0, 946, WIDTH, HEIGHT), fill=(7, 28, 43, 240))
        if not outro:
            self.text(draw, (48, 843 if hero else 45), clip["title"], 60, weight=800, max_width=1760)
            self.text(draw, (48, 923 if hero else 129), clip["caption"], 28, max_width=1780)
        rate = clip.get("rate", 1)
        if rate != 1:
            self.text(draw, (WIDTH - 125, 129), f"{rate}×", 24, weight=700)
        return image

    def panels(self, image, streams):
        draw = ImageDraw.Draw(image)
        # Validate actual glyph bounds against every image, including the other
        # camera. Caption baselines alone missed the previous overlap.
        rectangles = [(s["box"][0], s["box"][1], s["box"][0] + s["box"][2], s["box"][1] + s["box"][3]) for s in streams]
        for stream in streams:
            x, y, w, h = stream["box"]
            if not (x >= 0 and y >= 0 and x + w <= WIDTH and y + h <= HEIGHT):
                raise ValueError(f"Image outside canvas: {stream['source']}")
            native_w, native_h = stream["crop"][2:] if stream["crop"] else stream["native_size"]
            if abs(w / h - native_w / native_h) > 2 / min(w, h):
                raise ValueError(f"Image aspect ratio changed: {stream['source']}")
            draw.rectangle((x - 1, y - 1, x + w, y + h), outline="#345268", width=2)
            if not stream["label"]:
                continue
            bounds = draw.textbbox((x, y - 34), stream["label"], font=self.font(23, 650))
            if bounds[0] < 0 or bounds[1] < 0 or bounds[2] > WIDTH or bounds[3] > HEIGHT:
                raise ValueError(f"Caption outside canvas: {stream['label']}")
            for left, top, right, bottom in rectangles:
                if bounds[0] < right and bounds[2] > left and bounds[1] < bottom and bounds[3] > top:
                    raise ValueError(f"Caption overlaps recorded image: {stream['label']}")
            self.text(draw, (x, y - 34), stream["label"], 23, CYAN, 650)

    def streams(self, clip):
        layout, duration, start, rate = clip["layout"], clip["duration"], clip.get("start", 0), clip.get("rate", 1)
        streams = []
        if layout == "task":
            boxes = [(24, 234, 1408, 792), (1496, 234, 376, 376), (1496, 650, 376, 376)]
            for name, box in zip(("external", "base", "gripper"), boxes, strict=True):
                streams.append(self.media(self.views[clip["task"]][name]["src"], start, duration, rate, box))
        elif layout in ("hero", "outro"):
            streams.append(self.media(clip["source"], start, duration, rate, (0, 0, WIDTH, HEIGHT)))
        elif layout == "suite":
            starts = {
                "PressButton": 20,
                "RotateValve": 32,
                "OpenHatch": 35,
                "CollectShell": 57,
                "PushSlider": 12,
                "PullLever": 16,
                "HotStab": 26,
                "CabinRecovery": 25,
                "CargoRelease": 61,
                "WallToss": 1,
            }
            for i, task in enumerate(NAMES):
                box = (48 + i % 5 * 368, 300 + i // 5 * 348, 352, 198)
                streams.append(
                    self.media(
                        self.views[task]["external"]["src"],
                        starts[task],
                        duration,
                        box=box,
                        label=NAMES[task],
                        crop_to_panel=True,
                    )
                )
        elif layout == "optics":
            for row, camera in enumerate(("base", "gripper")):
                for column, (condition, label) in enumerate(
                    (("clear", "CLEAR"), ("coastal", "COASTAL"), ("silt", "SILTY"))
                ):
                    box = (256 + column * 512, 234 + row * 416, 376, 376)
                    path = f"static/wreck-water/cabin/{camera}_{condition}.mp4"
                    streams.append(self.media(path, start, duration, box=box, label=label))
        elif layout == "current":
            for i, name in enumerate(("current-still", "current-flow", "current-overload")):
                data = json.loads(self.source(f"static/effects/v3/{name}.json").read_text())["frames"]
                speed = max(math.sqrt(sum(v * v for v in row["current_w_m_s"])) for row in data)
                box = (48 + i * 624, 328, 576, 324)
                streams.append(self.effect(name, duration, box, f"CURRENT · {speed:.1f} m/s"))
        elif layout == "proximity":
            for i, (name, label) in enumerate(
                (
                    ("wall-far", "WALL · FAR"),
                    ("wall-near", "WALL · NEAR"),
                    ("seabed-far", "POOL FLOOR · FAR"),
                    ("seabed-near", "POOL FLOOR · NEAR"),
                )
            ):
                box = (232 + i % 2 * 752, 224 + i // 2 * 444, 704, 396)
                streams.append(self.effect(name, duration, box, label))
        elif layout == "actuators":
            for i, (name, label) in enumerate(
                (("actuator-instant", "INSTANTANEOUS"), ("actuator-lag", "MOTOR LAG + DELAY"))
            ):
                box = (48 + i * 928, 312, 896, 504)
                streams.append(self.effect(name, duration, box, label))
        if layout == "task":
            external, base, gripper = (stream["box"] for stream in streams)
            if not (
                base[0] == gripper[0]
                and base[2:] == gripper[2:]
                and base[1] == external[1]
                and gripper[1] + gripper[3] == external[1] + external[3]
            ):
                raise ValueError(f"Camera edges do not align: {clip['id']}")
        if layout == "suite":
            for i, stream in enumerate(streams):
                if stream["box"] != (48 + i % 5 * 368, 300 + i // 5 * 348, 352, 198):
                    raise ValueError("Task mosaic tiles do not align")
        return streams

    def chart(self, clip, progress=1):
        image = self.plate(clip)
        draw = ImageDraw.Draw(image)
        if clip["layout"] == "policies":
            tasks = [r["task"] for r in self.primary["rows"] if r["model"] == "ACT"]
            series = ["ACT", "DP", "BC"]
            values = [
                [
                    next(r for r in self.primary["rows"] if r["task"] == task and r["model"] == model)["successes"]
                    for model in series
                ]
                for task in tasks
            ]
            footer = "Bars: mean success · dots: seeds 17, 43, 101 · 30 evaluation resets per seed"
        else:
            paths = [
                "research/button-lever-smolvla-5090/PressButton/summary.json",
                "research/pushslider-smolvla-5090/summary.json",
                "research/button-lever-smolvla-5090/PullLever/summary.json",
            ]
            tasks, values, series = [], [], ["SmolVLA", "DP"]
            for path in paths:
                result = json.loads((ROOT / path).read_text())
                self.inputs[path] = {"sha256": digest(ROOT / path), "kind": "frozen measured outcomes"}
                tasks.append(result["task"])
                counts = [
                    next(r for r in result["runs"] if r["training_seed"] == seed and r["purpose"] == "test")[
                        "successes"
                    ]
                    for seed in result["training_seeds"]
                ]
                values.append(
                    [
                        counts,
                        next(r for r in self.primary["rows"] if r["task"] == result["task"] and r["model"] == "DP")[
                            "successes"
                        ],
                    ]
                )
            footer = "Bars: mean success · dots: all three trainings · 30 test resets per training"
        y0, height, x0, chart_width = 852, 540, 132, 1736
        self.text(draw, (48, 252), "Success (%)", 28, weight=700)
        for tick in (0, 25, 50, 75, 100):
            y = y0 - tick / 100 * height
            draw.line((x0, y, 1872, y), fill="#345268", width=2)
            self.text(draw, (55, int(y) - 17), str(tick), 26)
        for j, name in enumerate(series):
            x = 1190 + j * 226
            draw.rectangle((x, 253, x + 25, 278), fill=MODEL_COLORS[name])
            self.text(draw, (x + 38, 246), name, 28, weight=700)
        group_width = chart_width / len(tasks)
        bar_width = 44 if len(tasks) == 6 else 92
        for i, task in enumerate(tasks):
            cx = x0 + (i + 0.5) * group_width
            for j, counts in enumerate(values[i]):
                assert len(counts) == 3 and all(0 <= n <= 30 for n in counts)
                x = cx + (j - (len(series) - 1) / 2) * (bar_width + 13) - bar_width / 2
                mean = sum(counts) / 90
                top = y0 - mean * height * progress
                draw.rectangle((x, top, x + bar_width, y0), fill=MODEL_COLORS[series[j]])
                if progress >= 0.999:
                    for k, n in enumerate(counts):
                        dx = x + 7 + k * (bar_width - 14) / 2
                        dy = y0 - n / 30 * height
                        draw.ellipse((dx - 6, dy - 6, dx + 6, dy + 6), fill=INK, outline=NAVY, width=2)
            words = NAMES[task].split(" ", 1)
            for line, word in enumerate(words):
                font = self.font(27, 650)
                width = draw.textlength(word, font=font)
                self.text(draw, (int(cx - width / 2), 876 + line * 38), word, 27, weight=650)
        self.text(draw, (48, 947), footer, 27)
        return image

    def artwork(self, clip, streams):
        layout = clip["layout"]
        if layout in ("policies", "vla"):
            return self.chart(clip)
        image = self.plate(clip, transparent=layout in ("hero", "outro"))
        if layout not in ("hero", "outro"):
            self.panels(image, streams)
        draw = ImageDraw.Draw(image)
        if layout not in ("hero", "outro"):
            for stream in streams:
                x, y, w, h = stream["box"]
                draw.rectangle((x, y, x + w - 1, y + h - 1), fill=(0, 0, 0, 0))
        if layout == "identity":
            image.alpha_composite(self.logo, (56, 352))
            self.text(draw, (310, 363), "WasserMan", 136, weight=800)
            self.text(draw, (320, 555), "Underwater manipulation", 58, weight=700)
            self.text(draw, (320, 646), "Policy learning benchmark", 40)
            for i, (name, detail) in enumerate(
                (
                    ("TASKS", "10 environments"),
                    ("OBSERVATIONS", "2 robot cameras + state"),
                    ("EVALUATION", "Versioned physical criteria"),
                )
            ):
                x = 64 + i * 616
                draw.line((x, 795, x + 564, 795), fill=CYAN, width=3)
                self.text(draw, (x, 818), name, 24, CYAN, 700)
                self.text(draw, (x, 863), detail, 32, weight=650)
        elif layout == "architecture":
            cards = [
                (
                    "POLICY",
                    "Action targets",
                    ["ACT · DP · BC · SmolVLA", "End-effector pose", "or base pose + arm joints"],
                ),
                (
                    "CONTROL",
                    "Robot control",
                    ["Inverse kinematics", "Vehicle pose + joint tracking", "Bounded thruster actuation"],
                ),
                (
                    "ENVIRONMENT",
                    "Dynamics",
                    ["Contact + coupled robot motion", "Buoyancy, drag + added mass", "Current + actuator response"],
                ),
            ]
            for i, (name, title, lines) in enumerate(cards):
                x = 48 + i * 624
                draw.rectangle((x, 352, x + 568, 754), fill=SURFACE)
                self.text(draw, (x + 26, 389), name, 25, CYAN, 700)
                self.text(draw, (x + 26, 451), title, 38, weight=800)
                for j, line in enumerate(lines):
                    self.text(draw, (x + 26, 550 + j * 55), line, 27, max_width=515)
                if i < 2:
                    draw.line((x + 581, 540, x + 609, 540), fill=CYAN, width=3)
                    draw.polygon(((x + 605, 532), (x + 615, 540), (x + 605, 548)), fill=CYAN)
            draw.line(((328, 754), (328, 820), (1592, 820), (1592, 754)), fill=CYAN, width=3)
            draw.polygon(((970, 820), (984, 811), (984, 829)), fill=CYAN)
            self.text(draw, (538, 852), "Base camera + gripper camera + robot state", 34, weight=700)
        elif layout == "outro":
            image.alpha_composite(self.logo, (70, 355))
            self.text(draw, (332, 370), "WasserMan", 128, weight=800)
            self.text(draw, (340, 557), "Underwater manipulation policy learning", 44, weight=650)
            self.text(draw, (340, 680), "dancher00.github.io/wasserman", 42, CYAN, 650)
        elif layout == "current":
            # The metrics come from the same archived frames used by the films.
            for i, name in enumerate(("current-still", "current-flow", "current-overload")):
                rows = json.loads(self.source(f"static/effects/v3/{name}.json").read_text())["frames"]
                error = rows[-1]["position_error_m"]
                error = math.sqrt(sum(x * x for x in error)) if isinstance(error, list) else float(error)
                x = 48 + i * 624
                self.text(draw, (x, 746), f"{error * 1000:.0f} mm", 67, weight=800)
                self.text(draw, (x, 844), "Position error at 8 s", 26)
            self.text(draw, (48, 937), "Reduced-order current model", 27)
        elif layout == "suite":
            self.text(
                draw,
                (48, 937),
                "Panel contact · object transport and delivery · articulated and constrained contact",
                28,
            )
        return image

    def render(self, item):
        index, clip, offset = item
        destination = self.output / f"shot-{index:02d}-{clip['id']}.mp4"
        streams = self.streams(clip)
        plate = self.output / f"shot-{index:02d}.png"
        self.artwork(clip, streams).save(plate)
        cmd = [self.ffmpeg, "-y", "-hide_banner", "-loglevel", "error"]
        for stream in streams:
            cmd += ["-threads", "2", "-ss", str(stream["start"]), "-i", str(stream["path"])]
        overlay_indices = {}
        for stream_index, stream in enumerate(streams):
            if "overlay_path" in stream:
                overlay_indices[stream_index] = len(streams) + len(overlay_indices)
                cmd += ["-i", str(stream["overlay_path"])]
        plate_index = len(streams) + len(overlay_indices)
        cmd += ["-loop", "1", "-framerate", str(FPS), "-i", str(plate)]
        graph = []
        if streams:
            graph.append(f"color=c={NAVY}:s={WIDTH}x{HEIGHT}:r={FPS}:d={clip['duration']}[bg]")
            base = "bg"
            for i, stream in enumerate(streams):
                x, y, w, h = stream["box"]
                crop = ""
                if stream["crop"]:
                    crop_x, crop_y, crop_w, crop_h = stream["crop"]
                    crop = f"crop={crop_w}:{crop_h}:{crop_x}:{crop_y},"
                graph.append(
                    f"[{i}:v]setpts=(PTS-STARTPTS)/{stream['rate']},fps={FPS},{crop}scale={w}:{h},setsar=1[v{i}]"
                )
                recorded = f"v{i}"
                if i in overlay_indices:
                    overlay_index = overlay_indices[i]
                    graph.append(f"[{overlay_index}:v]setpts=PTS-STARTPTS,fps={FPS},format=rgba[anno{i}]")
                    graph.append(f"[v{i}][anno{i}]overlay=0:0:shortest=1[annotated{i}]")
                    recorded = f"annotated{i}"
                next_base = f"composite{i}"
                graph.append(f"[{base}][{recorded}]overlay={x}:{y}:shortest=1[{next_base}]")
                base = next_base
            graph.append(f"[{base}][{plate_index}:v]overlay=0:0:shortest=1[plate]")
        else:
            graph.append("[0:v]format=yuv420p,setsar=1[plate]")
        graph.append("[plate]format=yuv420p[out]")
        cmd += [
            "-filter_complex_threads",
            "1",
            "-filter_complex",
            ";".join(graph),
            "-map",
            "[out]",
            "-t",
            str(clip["duration"]),
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "19",
            "-threads",
            "3",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(destination),
        ]
        with (self.output / f"shot-{index:02d}.log").open("w") as log:
            subprocess.run(cmd, check=True, stderr=log)
        print(f"Rendered {index + 1}/{len(self.story['clips'])}: {clip['id']}", flush=True)
        return destination, {
            **clip,
            "timeline_start": offset,
            "timeline_end": offset + clip["duration"],
            "streams": [{k: v for k, v in s.items() if k not in ("path", "overlay_path")} for s in streams],
        }

    def run(self):
        offset, items = 0, []
        for index, clip in enumerate(self.story["clips"]):
            items.append((index, clip, offset))
            offset += clip["duration"]
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.args.workers) as pool:
            rendered = list(pool.map(self.render, items))
        concat = self.output / "concat.txt"
        concat.write_text("".join(f"file '{path.name}'\n" for path, _ in rendered))
        # Original project score is reused from the preserved previous overview.
        # It is synthesized sound design, not audio captured by the simulator.
        audio = self.source("static/publication/overview/WasserMan-overview.mp4")
        master = self.output / f"WasserMan-{self.story['version']}.mp4"
        subprocess.run(
            [
                self.ffmpeg,
                "-y",
                "-loglevel",
                "error",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat),
                "-i",
                str(audio),
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "copy",
                "-af",
                f"afade=t=out:st={self.total - 2.8}:d=2.8",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-t",
                str(self.total),
                "-movflags",
                "+faststart",
                str(master),
            ],
            check=True,
        )
        # Decode every frame and both streams; metadata alone cannot reveal a
        # truncated cut, unsupported profile or corrupt packet.
        subprocess.run([self.ffmpeg, "-v", "error", "-i", str(master), "-f", "null", "-"], check=True)
        frames, seconds = imageio_ffmpeg.count_frames_and_secs(str(master))
        if frames != self.total * FPS or abs(seconds - self.total) > 0.05:
            raise ValueError(f"Unexpected completed timeline: {frames} frames, {seconds} seconds")
        poster = self.output / "poster.jpg"
        subprocess.run(
            [
                self.ffmpeg,
                "-y",
                "-loglevel",
                "error",
                "-ss",
                "2",
                "-i",
                str(master),
                "-frames:v",
                "1",
                "-q:v",
                "2",
                str(poster),
            ],
            check=True,
        )
        self.inputs["research/revision-v2-primary-results.json"] = {
            "sha256": digest(ROOT / "research/revision-v2-primary-results.json"),
            "kind": "frozen measured outcomes",
        }
        manifest = {
            "version": self.story["version"],
            "scope": self.story["scope"],
            "width": WIDTH,
            "height": HEIGHT,
            "fps": FPS,
            "duration_seconds": seconds,
            "frames": frames,
            "full_audio_video_decode": "passed",
            "master_sha256": digest(master),
            "master_bytes": master.stat().st_size,
            "poster_sha256": digest(poster),
            "storyboard_sha256": digest(SITE / "overview-storyboard.json"),
            "renderer_sha256": digest(Path(__file__)),
            "font_sha256": digest(SITE / "src/assets/fonts/manrope-latin.woff2"),
            "logo_svg_sha256": digest(SITE / "public/static/wasserman-logo-dark.svg"),
            "inputs": dict(sorted(self.inputs.items())),
            "editing": (
                "Editorial cuts with explicitly marked playback rates. "
                "Camera streams in each task cut share the same source interval and rate. "
                "Native camera ratios retained. The task mosaic uses equal 16:9 tiles, "
                "with centered crops of the two 3:2 external views; crop rectangles are recorded per stream. "
                "No footage color filters or generated robot motion."
            ),
            "audio": {
                "source": "Preserved overview's original procedural composition, seed 20261001",
                "external_samples": False,
                "recorded_simulation_audio": False,
                "edit": f"First {self.total} seconds; final 2.8-second fade",
            },
            "physics_annotations": self.annotations,
            "chart_palette": MODEL_COLORS,
            "cabin_geometry": json.loads(self.source("static/task-demos/cabin/summary.json").read_text()).get(
                "source_sha256",
                json.loads(self.source("static/task-demos/cabin/summary.json").read_text()).get(
                    "task_files_sha256", {}
                ),
            ),
            "water_recording_version": json.loads(self.source("static/wreck-water/results.json").read_text())["model"],
            "clips": [row for _, row in rendered],
        }
        (self.output / "edit-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
        captions = "WEBVTT\n\n"
        for _, row in rendered:

            def stamp(t):
                return f"00:{int(t) // 60:02d}:{int(t) % 60:02d}.000"

            captions += (
                f"{stamp(row['timeline_start'])} --> {stamp(row['timeline_end'])}\n{row['title']}\n{row['caption']}\n\n"
            )
        (self.output / "overview.vtt").write_text(captions)
        print(
            json.dumps({"master": str(master), "seconds": seconds, "frames": frames, "bytes": master.stat().st_size}),
            flush=True,
        )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--public-dir", type=Path, default=SITE / "public")
    parser.add_argument("--font", type=Path, default=SITE / "src/assets/fonts/manrope-latin.ttf")
    parser.add_argument("--logo", type=Path, default=SITE / "src/assets/overview-logo-dark.png")
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--annotations-dir", type=Path, required=True)
    Overview(parser.parse_args()).run()


if __name__ == "__main__":
    main()
