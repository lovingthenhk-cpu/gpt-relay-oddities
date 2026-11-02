#!/usr/bin/env python3
"""Zero-dependency checks for local HTML references, IDs and script/style links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.rglob("*.html"))


class Inspect(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.refs = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        self._handle(tag, attrs)

    def handle_startendtag(self, tag, attrs):
        self._handle(tag, attrs)

    def _handle(self, tag, attrs):
        attributes = dict(attrs)
        key = attributes.get("id")
        if key:
            if key in self.ids:
                self.errors.append(f"duplicate id #{key}")
            self.ids.add(key)
        for attribute in ("href", "src"):
            if attribute in attributes:
                self.refs.append((tag, attribute, attributes[attribute]))


def inspect_site():
    docs = {}
    errors = []
    for page in PAGES:
        parser = Inspect()
        parser.feed(page.read_text(encoding="utf-8"))
        docs[page.resolve()] = parser
        errors.extend(f"{page.relative_to(ROOT)}: {e}" for e in parser.errors)

    for page, parser in docs.items():
        for tag, attr, value in parser.refs:
            if not value:
                continue
            url = urlsplit(value)
            if url.scheme in {"https", "http", "mailto", "tel"} or url.netloc:
                continue
            if url.scheme or value.startswith("javascript:"):
                errors.append(f"{page.relative_to(ROOT)}: forbidden link {value}")
                continue
            target = (page.parent / unquote(url.path)).resolve() if url.path else page
            if not target.is_relative_to(ROOT):
                errors.append(f"{page.relative_to(ROOT)}: local reference escapes site root {value}")
                continue
            if not target.is_file():
                errors.append(f"{page.relative_to(ROOT)}: missing {tag}[{attr}] target {value}")
            elif url.fragment and target.suffix.lower() == ".html":
                if target in docs and unquote(url.fragment) not in docs[target].ids:
                    errors.append(f"{page.relative_to(ROOT)}: missing anchor {value}")
    return errors


if __name__ == "__main__":
    if not PAGES:
        print("No HTML pages found", file=sys.stderr)
        raise SystemExit(1)
    faults = inspect_site()
    if faults:
        for fault in faults:
            print("ERROR:", fault, file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {len(PAGES)} HTML pages, no duplicate ids, broken local assets or anchors")
