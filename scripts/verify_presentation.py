"""Check shared publication content without simulator, browser or network access."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    errors = []
    nav = json.loads((ROOT / 'website/src/docsNavigation.json').read_text())
    assert len({p['id'] for p in nav}) == len(nav)
    files = [ROOT / 'README.md', ROOT / 'CONTRIBUTING.md'] + [ROOT / 'docs' / (p['id'] + '.md') for p in nav]
    links = 0
    for file in files:
        if not file.is_file():
            errors.append('Missing documentation: ' + str(file.relative_to(ROOT)))
            continue
        for target in re.findall(r'\]\(([^)]+)\)', file.read_text()):
            if target.startswith(('https:', 'http:', '#', 'mailto:')):
                continue
            links += 1
            if not (file.parent / target.split('#')[0]).exists():
                errors.append(f'Broken local link: {file.relative_to(ROOT)} → {target}')
    core = json.loads((ROOT / 'benchmarks/core/model-benchmarks.json').read_text())
    site = json.loads((ROOT / 'website/src/modelBenchmarks.json').read_text())
    assert site == core, 'Website core results differ from frozen snapshot'
    for name in ['model-benchmarks', 'hatch-act-correction', 'policy-control-study', 'research-core-studies', 'water-motor-study', 'embodiment-study']:
        assert (ROOT / f'paper/data/{name}.json').read_bytes() == (ROOT / f'benchmarks/core/{name}.json').read_bytes(), name
    hotstab = json.loads((ROOT / 'website/src/hotstabStudy.json').read_text())
    for name, expected in hotstab['source_sha256'].items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == expected, name
    results_document = (ROOT / 'docs/benchmark-results.md').read_text()
    for row in core['rows']:
        if row['model'] == 'PPO':
            continue
        line = next((line for line in results_document.splitlines() if line.startswith('| ' + row['task'] + ' |') and f"{row['successes']}/{row['episodes']}" in line), None)
        assert line is not None, 'Historical result missing from the results guide: ' + row['task']
        column = 2 if row['model'] == 'ACT' else 3
        assert line.split('|')[column].strip() == f"{row['successes']}/{row['episodes']}", row['task']
    primary = json.loads((ROOT / 'research/revision-v2-primary-results.json').read_text())
    for row in primary['rows']:
        line = next(line for line in results_document.splitlines() if line.startswith('| ' + row['task'] + ' |'))
        column = {'ACT': 2, 'DP': 3, 'BC': 4}[row['model']]
        expected = f"{row['mean'] * 100:.1f} ± {row['training_run_sd'] * 100:.1f}"
        assert line.split('|')[column].strip() == expected, (row['task'], row['model'])
    app = (ROOT / 'website/src/App.tsx').read_text()
    for stale in ['/home/aida/', 'comparisons are being completed', '"PPO state baseline"']:
        assert stale not in app, stale
    result = {'documentation_pages':len(nav), 'local_links_checked':links, 'frozen_core_rows':12, 'hotstab_source_files':len(hotstab['source_sha256']), 'paper_site_snapshot_agreement':True, 'errors':errors, 'scope':'Publication consistency only; no second-workstation or training check'}
    print(json.dumps(result, indent=2))
    return not errors


if __name__ == '__main__':
    raise SystemExit(0 if main() else 1)
