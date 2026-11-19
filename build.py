#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
바로문서 (BaroDoc) — Static Site Generator
Reads site-config.json and generates all 13 static HTML pages, 404.html,
sitemap.xml, robots.txt, and ads.txt inside public/.

Usage:
  python build.py
  python build.py --domain https://mydomain.kr --adsense ca-pub-1234567890123456
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
PUBLIC_DIR = ROOT / "public"
CONFIG_PATH = ROOT / "site-config.json"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from content.pages_data import TOOLS  # noqa: E402
from content.guides_data import GUIDES  # noqa: E402
from content.calculators_data import CALCULATORS  # noqa: E402
from content.static_pages import (  # noqa: E402
    render_404_body,
    render_about_body,
    render_contact_body,
    render_home_body,
    render_privacy_body,
    render_terms_body,
)
from templates.layout import (  # noqa: E402
    build_base_html,
    build_calculator_page_body,
    build_form_page_body,
    build_guide_article_body,
    build_guide_index_body,
    build_stamp_page_body,
)


def make_faq_ld(faqs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in faqs
        ],
    }


def make_breadcrumb_ld(domain, name, path):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "홈", "item": f"{domain}/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": f"{domain}{path}"},
        ],
    }


def make_webapp_ld(cfg, tool, path):
    domain = cfg["domain"].rstrip("/")
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": f"{cfg['site_name']} {tool['h1']}",
        "url": f"{domain}{path}",
        "description": tool["description"],
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "inLanguage": "ko-KR",
        "isAccessibleForFree": True,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW",
        },
        "provider": {
            "@type": "Organization",
            "name": cfg["site_name"],
            "url": f"{domain}/",
        },
    }


def write_text(rel_path, content):
    out_path = PUBLIC_DIR / rel_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(content, encoding="utf-8", newline="\n")
    return out_path


def build(cfg):
    domain = cfg["domain"].rstrip("/")
    lastmod = cfg.get("last_modified", "2026-11-19")
    sitemap_entries = []

    # 1. Home page (/)
    home_body, home_faqs = render_home_body(cfg)
    home_ld = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": cfg["site_name"],
            "alternateName": cfg["site_name_en"],
            "url": f"{domain}/",
            "description": cfg["tagline"],
            "inLanguage": "ko-KR",
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": cfg["site_name"],
            "url": f"{domain}/",
            "logo": f"{domain}/assets/img/favicon.svg",
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "url": f"{domain}/contact/",
                "availableLanguage": "Korean",
            },
        },
        make_faq_ld(home_faqs),
    ]
    write_text(
        "index.html",
        build_base_html(
            cfg,
            path="/",
            title=f"{cfg['site_name']} — 무료 A4 서식 7종 작성 & 온라인 투명 도장 만들기",
            description="회원가입 없이 무료로 사직서·차용증·위임장·재직증명서·견적서·근로계약서·거래명세서를 작성하고, 한글 투명 도장을 바로 찍어 깨지지 않는 A4 PDF로 저장하세요.",
            keywords="무료 서식, 사직서 양식, 차용증 양식, 위임장 양식, 재직증명서 양식, 견적서 양식, 근로계약서 양식, 거래명세서 양식, 무료 온라인 도장 만들기",
            active_slug="",
            body_html=home_body,
            json_ld_items=home_ld,
        ),
    )
    sitemap_entries.append(("/", "weekly", "1.0"))

    # 2. 8 Core Tool Pages (7 Forms + 1 Stamp Maker)
    for tool in TOOLS:
        path = f"/{tool['slug']}/"
        if tool["kind"] == "stamp":
            body_html = build_stamp_page_body(tool)
            extra_scripts = [
                "/assets/js/stamp-engine.js",
                "/assets/js/stamp-page.js",
            ]
        else:
            body_html = build_form_page_body(tool)
            extra_scripts = [
                "/assets/js/stamp-engine.js",
                "/assets/js/stamp-widget.js",
                "/assets/js/forms-core.js",
                "/assets/js/forms-personal.js",
                "/assets/js/forms-business.js",
            ]

        ld_items = [
            make_webapp_ld(cfg, tool, path),
            make_breadcrumb_ld(domain, tool["h1"], path),
            make_faq_ld(tool["faqs"]),
        ]

        write_text(
            f"{tool['slug']}/index.html",
            build_base_html(
                cfg,
                path=path,
                title=tool["title"],
                description=tool["description"],
                keywords=tool["keywords"],
                active_slug=tool["slug"],
                body_html=body_html,
                extra_scripts=extra_scripts,
                json_ld_items=ld_items,
            ),
        )
        sitemap_entries.append((path, "monthly", "0.9"))

    # 2.4 Free Calculators (3 High-Search-Volume Practical Calculators)
    for calc in CALCULATORS:
        cpath = calc["path"]
        c_ld = [
            make_webapp_ld(cfg, calc, cpath),
            make_breadcrumb_ld(domain, calc["short_name"], cpath),
            make_faq_ld(calc["faqs"]),
        ]
        write_text(
            f"calc/{calc['slug']}/index.html",
            build_base_html(
                cfg,
                path=cpath,
                title=calc["title"],
                description=calc["description"],
                keywords=calc["keywords"],
                active_slug="calc",
                body_html=build_calculator_page_body(calc, CALCULATORS),
                extra_scripts=["/assets/js/calculators.js"],
                json_ld_items=c_ld,
            ),
        )
        sitemap_entries.append((cpath, "monthly", "0.9"))

    # 2.5 Editorial Practical Guides (/guide/ + 13 deep articles for AdSense & SEO)
    write_text(
        "guide/index.html",
        build_base_html(
            cfg,
            path="/guide/",
            title=f"실무 가이드 모음 — 퇴사·차용증·근로계약·부가세·위임장·도장 | {cfg['site_name']}",
            description="2026년 최신 법령 기준으로 사직서, 차용증, 표준근로계약서, 견적서·거래명세서 부가세, 위임장 준비물, 전자 도장 활용법을 정리한 무료 실무 가이드 모음입니다.",
            keywords="서식 작성 가이드, 퇴사 체크리스트, 차용증 법적 효력, 2026 최저임금, 부가세 계산, 위임장 준비물, 전자 도장",
            active_slug="guide",
            body_html=build_guide_index_body(cfg, GUIDES),
            json_ld_items=[
                {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": f"{cfg['site_name']} 실무 가이드",
                    "url": f"{domain}/guide/",
                    "inLanguage": "ko-KR",
                },
                make_breadcrumb_ld(domain, "실무 가이드", "/guide/"),
            ],
        ),
    )
    sitemap_entries.append(("/guide/", "weekly", "0.8"))

    for guide in GUIDES:
        gpath = f"/guide/{guide['slug']}/"
        article_ld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": guide["title"],
            "description": guide["description"],
            "url": f"{domain}{gpath}",
            "datePublished": lastmod,
            "dateModified": lastmod,
            "inLanguage": "ko-KR",
            "author": {"@type": "Organization", "name": cfg["site_name"]},
            "publisher": {
                "@type": "Organization",
                "name": cfg["site_name"],
                "logo": {"@type": "ImageObject", "url": f"{domain}/assets/img/og-image.png"},
            },
            "image": f"{domain}/assets/img/og-image.png",
        }
        crumb_ld = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "홈", "item": f"{domain}/"},
                {"@type": "ListItem", "position": 2, "name": "실무 가이드", "item": f"{domain}/guide/"},
                {"@type": "ListItem", "position": 3, "name": guide["title"], "item": f"{domain}{gpath}"},
            ],
        }
        guide_lds = [article_ld, crumb_ld]
        if guide.get("faqs"):
            guide_lds.append(make_faq_ld(guide["faqs"]))
        write_text(
            f"guide/{guide['slug']}/index.html",
            build_base_html(
                cfg,
                path=gpath,
                title=guide["title"],
                description=guide["description"],
                keywords=guide["keywords"],
                active_slug="guide",
                body_html=build_guide_article_body(cfg, guide, GUIDES),
                json_ld_items=guide_lds,
            ),
        )
        sitemap_entries.append((gpath, "monthly", "0.8"))

    # 3. Trust & Policy Pages (AdSense Essential)
    static_defs = [
        (
            "about",
            f"사이트 소개 | {cfg['site_name']}",
            f"{cfg['site_name']}의 무료 A4 서식 및 온라인 투명 도장 서비스 소개, 100% 브라우저 로컬 처리 보안 원칙을 안내합니다.",
            render_about_body(cfg),
        ),
        (
            "privacy",
            f"개인정보처리방침 | {cfg['site_name']}",
            f"{cfg['site_name']}의 개인정보 비수집·서버 비저장 원칙, localStorage 안내 및 Google AdSense 쿠키 정책입니다.",
            render_privacy_body(cfg),
        ),
        (
            "terms",
            f"이용약관 및 법적 면책고지 | {cfg['site_name']}",
            f"{cfg['site_name']} 무료 서식 및 온라인 도장 이용약관과 법적 면책고지 안내입니다.",
            render_terms_body(cfg),
        ),
        (
            "contact",
            f"문의하기 | {cfg['site_name']}",
            f"{cfg['site_name']} 오류 제보, 신규 무료 서식 요청, 제휴 및 광고 문의 안내 페이지입니다.",
            render_contact_body(cfg),
        ),
    ]

    for slug, title, desc, body in static_defs:
        path = f"/{slug}/"
        ld_items = [
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": title,
                "url": f"{domain}{path}",
                "description": desc,
                "inLanguage": "ko-KR",
            },
            make_breadcrumb_ld(domain, title.split("|")[0].strip(), path),
        ]
        extra_scripts = ["/assets/js/contact.js"] if slug == "contact" else None
        write_text(
            f"{slug}/index.html",
            build_base_html(
                cfg,
                path=path,
                title=title,
                description=desc,
                active_slug=slug,
                body_html=body,
                extra_scripts=extra_scripts,
                json_ld_items=ld_items,
            ),
        )
        sitemap_entries.append((path, "yearly", "0.5"))

    # 4. 404 Page
    write_text(
        "404.html",
        build_base_html(
            cfg,
            path="/404.html",
            title=f"페이지를 찾을 수 없습니다 | {cfg['site_name']}",
            description="요청하신 페이지를 찾을 수 없습니다. 바로문서의 무료 A4 서식과 온라인 도장 도구로 이동해 보세요.",
            body_html=render_404_body(cfg),
            noindex=True,
        ),
    )

    # 5. sitemap.xml (Google Search Console & Naver Search Advisor Ready)
    url_nodes = []
    for path, freq, prio in sitemap_entries:
        url_nodes.append(
            f"""  <url>
    <loc>{domain}{path}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{prio}</priority>
  </url>"""
        )
    sitemap_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(url_nodes)
        + "\n</urlset>\n"
    )
    write_text("sitemap.xml", sitemap_xml)

    # 6. robots.txt (Googlebot, Naver Yeti, Daumoa, AdsBot-Google)
    robots_txt = (
        "User-agent: *\n"
        "Allow: /\n\n"
        "User-agent: Yeti\n"
        "Allow: /\n\n"
        "User-agent: Googlebot\n"
        "Allow: /\n\n"
        "User-agent: AdsBot-Google\n"
        "Allow: /\n\n"
        f"Sitemap: {domain}/sitemap.xml\n"
    )
    write_text("robots.txt", robots_txt)

    # 7. ads.txt (Google AdSense Ready)
    raw_pub = (cfg.get("adsense_client_id") or "").strip()
    if raw_pub:
        pub_id = raw_pub.replace("ca-", "")
        ads_txt = f"google.com, {pub_id}, DIRECT, f08c47fec0942fa0\n"
    else:
        ads_txt = (
            "# Google AdSense ads.txt 준비 템플릿\n"
            "# 애드센스 계정 생성 후 site-config.json의 adsense_client_id에\n"
            "# 'ca-pub-XXXXXXXXXXXXXXXX' 값을 입력하고 `python build.py`를 실행하면\n"
            "# 아래 형식으로 자동 갱신됩니다:\n"
            "# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n"
        )
    write_text("ads.txt", ads_txt)

    print(f"[OK] Built {len(sitemap_entries)} indexed pages + 404.html + sitemap.xml + robots.txt + ads.txt")
    print(f"     Domain : {domain}")
    print(f"     Output : {PUBLIC_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Build BaroDoc static site")
    parser.add_argument("--domain", help="Override site domain (e.g. https://barodoc.pe.kr)")
    parser.add_argument("--adsense", help="Override AdSense client ID (e.g. ca-pub-1234567890123456)")
    parser.add_argument("--web3forms-key", help="Override Web3Forms access key")
    parser.add_argument("--google-verify", help="Google Search Console verification token")
    parser.add_argument("--naver-verify", help="Naver Search Advisor verification token")
    parser.add_argument("--save-config", action="store_true", help="Save CLI overrides back to site-config.json")
    args = parser.parse_args()

    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if args.domain:
        cfg["domain"] = args.domain.rstrip("/")
    if args.adsense is not None:
        cfg["adsense_client_id"] = args.adsense.strip()
    if args.web3forms_key is not None:
        cfg["web3forms_access_key"] = args.web3forms_key.strip()
    if args.google_verify is not None:
        cfg["google_site_verification"] = args.google_verify.strip()
    if args.naver_verify is not None:
        cfg["naver_site_verification"] = args.naver_verify.strip()

    if args.save_config:
        CONFIG_PATH.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"[OK] Updated {CONFIG_PATH}")

    build(cfg)


if __name__ == "__main__":
    main()
