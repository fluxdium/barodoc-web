#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
바로문서 (BaroDoc) — Automated SEO, AdSense Readiness & Integrity Auditor
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CONFIG = json.loads((ROOT / "site-config.json").read_text(encoding="utf-8"))
DOMAIN = CONFIG["domain"].rstrip("/")


class PageInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.in_h1 = False
        self.in_main = False
        self.skip_depth = 0
        self.in_ld = False
        self.title = ""
        self.h1s = []
        self.current_h1 = ""
        self.metas = {}
        self.og = {}
        self.canonical = ""
        self.links = []
        self.assets = []
        self.ld_raws = []
        self.current_ld = ""
        self.main_text_parts = []
        self.faq_count = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
            self.current_h1 = ""
        elif tag == "main":
            self.in_main = True
        elif tag in ("script", "style", "noscript"):
            self.skip_depth += 1
            if tag == "script" and a.get("type") == "application/ld+json":
                self.in_ld = True
                self.current_ld = ""
            if tag == "script" and a.get("src"):
                self.assets.append(a["src"])
        elif tag == "meta":
            if a.get("name"):
                self.metas[a["name"].lower()] = a.get("content", "")
            if a.get("property"):
                self.og[a["property"].lower()] = a.get("content", "")
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            if rel == "canonical":
                self.canonical = a.get("href", "")
            if a.get("href", "").startswith("/assets/"):
                self.assets.append(a["href"])
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "img" and a.get("src", "").startswith("/assets/"):
            self.assets.append(a["src"])
        elif tag == "details" and "faq-item" in (a.get("class") or ""):
            self.faq_count += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False
            self.h1s.append(self.current_h1.strip())
        elif tag == "main":
            self.in_main = False
        elif tag in ("script", "style", "noscript"):
            if tag == "script" and self.in_ld:
                self.in_ld = False
                self.ld_raws.append(self.current_ld.strip())
            self.skip_depth = max(0, self.skip_depth - 1)

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.current_h1 += data
        if self.in_ld:
            self.current_ld += data
        if self.in_main and self.skip_depth == 0:
            cleaned = re.sub(r"\s+", " ", data).strip()
            if cleaned:
                self.main_text_parts.append(cleaned)


def resolve_local_path(href):
    clean = href.split("#")[0].split("?")[0]
    if not clean or not clean.startswith("/"):
        return None
    if clean == "/":
        return PUBLIC / "index.html"
    if clean.endswith("/"):
        return PUBLIC / clean.lstrip("/") / "index.html"
    return PUBLIC / clean.lstrip("/")


def run_audit():
    errors = []
    warnings = []

    expected_routes = [
        "/",
        "/sajikseo/",
        "/chayongjeung/",
        "/wiimjang/",
        "/jaejik/",
        "/gyeonjeokseo/",
        "/geunro/",
        "/georae/",
        "/stamp/",
        "/calc/vat/",
        "/calc/annual-leave/",
        "/calc/brokerage/",
        "/guide/",
        "/guide/resignation-checklist/",
        "/guide/iou-legal-validity/",
        "/guide/labor-contract-2026/",
        "/guide/vat-quotation-statement/",
        "/guide/poa-documents/",
        "/guide/electronic-stamp-guide/",
        "/guide/family-loan-gift-tax/",
        "/guide/resignation-notice-period/",
        "/guide/parttime-contract-checklist/",
        "/guide/poa-seal-certificate/",
        "/guide/simplified-taxpayer-quotation/",
        "/guide/certificate-employment-vs-career/",
        "/guide/severance-pay-annual-leave/",
        "/about/",
        "/privacy/",
        "/terms/",
        "/contact/",
    ]

    titles = {}
    descs = {}
    summary_rows = []

    for route in expected_routes:
        fpath = resolve_local_path(route)
        if not fpath or not fpath.exists():
            errors.append(f"Missing page file for route {route}: {fpath}")
            continue

        html = fpath.read_text(encoding="utf-8")
        p = PageInspector()
        p.feed(html)

        title = p.title.strip()
        desc = p.metas.get("description", "").strip()
        main_text = " ".join(p.main_text_parts)
        char_count = len(re.sub(r"\s+", "", main_text))

        # Title & description checks
        if not title:
            errors.append(f"[{route}] Empty <title>")
        elif title in titles:
            errors.append(f"[{route}] Duplicate <title> with {titles[title]}: {title}")
        else:
            titles[title] = route

        if not desc or len(desc) < 40:
            errors.append(f"[{route}] Missing or too short meta description ({len(desc)} chars)")
        elif desc in descs:
            errors.append(f"[{route}] Duplicate meta description with {descs[desc]}")
        else:
            descs[desc] = route

        # Canonical
        expected_canonical = f"{DOMAIN}{route}"
        if p.canonical != expected_canonical:
            errors.append(f"[{route}] Canonical mismatch: got '{p.canonical}', expected '{expected_canonical}'")

        # OpenGraph
        for req_og in ("og:title", "og:description", "og:url", "og:image"):
            if not p.og.get(req_og):
                errors.append(f"[{route}] Missing {req_og}")

        # Exactly 1 H1
        if len(p.h1s) != 1:
            errors.append(f"[{route}] Expected exactly 1 <h1>, found {len(p.h1s)}: {p.h1s}")

        # JSON-LD validity
        ld_types = []
        for idx, raw in enumerate(p.ld_raws):
            try:
                parsed = json.loads(raw)
                ld_types.append(parsed.get("@type", "?"))
            except Exception as exc:
                errors.append(f"[{route}] Invalid JSON-LD #{idx + 1}: {exc}")

        if route in (
            "/sajikseo/", "/chayongjeung/", "/wiimjang/", "/jaejik/",
            "/gyeonjeokseo/", "/geunro/", "/georae/", "/stamp/",
            "/calc/vat/", "/calc/annual-leave/", "/calc/brokerage/",
        ):
            for req_type in ("WebApplication", "BreadcrumbList", "FAQPage"):
                if req_type not in ld_types:
                    errors.append(f"[{route}] Missing JSON-LD {req_type}")
            if char_count < 900:
                warnings.append(f"[{route}] Tool page editorial text is short ({char_count} chars without spaces)")
            if p.faq_count < 5:
                warnings.append(f"[{route}] Only {p.faq_count} FAQs (recommend >= 5)")

        # Internal link & asset resolution
        for href in p.links + p.assets:
            if href.startswith(("http://", "https://", "mailto:", "tel:", "#")):
                continue
            target = resolve_local_path(href)
            if target and not target.exists():
                errors.append(f"[{route}] Broken local link/asset: {href} -> {target}")

        summary_rows.append((route, len(title), len(desc), char_count, p.faq_count, ",".join(ld_types)))

    # Check 404.html
    if not (PUBLIC / "404.html").exists():
        errors.append("Missing public/404.html")

    # Check sitemap.xml
    sm_path = PUBLIC / "sitemap.xml"
    if not sm_path.exists():
        errors.append("Missing public/sitemap.xml")
    else:
        tree = ET.parse(sm_path)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        locs = [el.text.strip() for el in tree.getroot().findall("s:url/s:loc", ns)]
        expected_locs = [f"{DOMAIN}{r}" for r in expected_routes]
        if set(locs) != set(expected_locs):
            errors.append(f"sitemap.xml URL mismatch. Extra={set(locs)-set(expected_locs)}, Missing={set(expected_locs)-set(locs)}")

    # Check robots.txt
    rb_path = PUBLIC / "robots.txt"
    if not rb_path.exists():
        errors.append("Missing public/robots.txt")
    else:
        rb = rb_path.read_text(encoding="utf-8")
        for token in ("Yeti", "Googlebot", "AdsBot-Google", f"Sitemap: {DOMAIN}/sitemap.xml"):
            if token not in rb:
                errors.append(f"robots.txt missing expected directive: {token}")

    # Check ads.txt & _headers
    if not (PUBLIC / "ads.txt").exists():
        errors.append("Missing public/ads.txt")
    if not (PUBLIC / "_headers").exists():
        errors.append("Missing public/_headers")

    # Strict Zero-Email & mailto: audit across ALL generated HTML files
    email_pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
    for html_file in PUBLIC.rglob("*.html"):
        raw = html_file.read_text(encoding="utf-8")
        if "mailto:" in raw.lower():
            errors.append(f"[{html_file.relative_to(PUBLIC)}] Found forbidden 'mailto:' link")
        # Ignore CDN package version strings like pretendard@v1.3.9 (no domain TLD)
        found_emails = [m.group(0) for m in email_pattern.finditer(raw) if not m.group(0).startswith("pretendard@")]
        if found_emails:
            errors.append(f"[{html_file.relative_to(PUBLIC)}] Found exposed email address(es): {found_emails}")

    # Verify Web3Forms contact form essentials
    contact_html = (PUBLIC / "contact" / "index.html").read_text(encoding="utf-8")
    for required_token in ("https://api.web3forms.com/submit", 'name="access_key"', 'name="botcheck"', "[바로문서 문의]"):
        if required_token not in contact_html:
            errors.append(f"[/contact/] Missing Web3Forms token: {required_token}")

    print("=" * 92)
    print(f"{'Route':<18} {'Title':>5} {'Desc':>5} {'Chars(no ws)':>12} {'FAQs':>5}  JSON-LD Schemas")
    print("-" * 92)
    for r, tlen, dlen, chars, faqs, lds in summary_rows:
        print(f"{r:<18} {tlen:>5} {dlen:>5} {chars:>12} {faqs:>5}  {lds}")
    print("=" * 92)

    if warnings:
        print("\n[WARNINGS]")
        for w in warnings:
            print("  -", w)

    if errors:
        print("\n[ERRORS]")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    print(f"\n[PASS] All {len(expected_routes)} pages, sitemap.xml, robots.txt, ads.txt, JSON-LD, and links verified cleanly!")


if __name__ == "__main__":
    run_audit()
