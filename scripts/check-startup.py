#!/usr/bin/env python3
"""Parse startup HTML as HTML before checking embedded JavaScript."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile


class InlineScripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = None
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs = dict(attrs)
            self.active = [] if not attrs.get('src') else None

    def handle_data(self, data):
        if self.active is not None:
            self.active.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.active is not None:
            self.scripts.append(''.join(self.active))
            self.active = None


def check(path):
    parser = InlineScripts()
    parser.feed(path.read_text())
    if parser.active is not None or len(parser.scripts) != 1:
        raise SystemExit(f'{path}: expected one complete startup script')
    with tempfile.TemporaryDirectory() as directory:
        script = Path(directory) / 'startup.js'
        script.write_text(parser.scripts[0])
        result = subprocess.run(['node', '--check', str(script)], capture_output=True, text=True)
        if result.returncode:
            raise SystemExit(f'{path}: invalid embedded JavaScript\n{result.stderr}')
    print(f'{path}: startup HTML and JavaScript passed')


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    for name in ('index.html', 'router-v2.html'):
        check(root / name)
