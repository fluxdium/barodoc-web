# -*- coding: utf-8 -*-
"""
바로서식 (BaroDoc) — HTML5 Page Layout, SEO Meta, JSON-LD, Workbench & Stamp Templates
"""

import json
from content.pages_data import TOOLS
from content.calculators_data import CALCULATORS


def json_ld_tag(obj):
    return f'<script type="application/ld+json">{json.dumps(obj, ensure_ascii=False, separators=(",", ":"))}</script>'


def build_base_html(
    cfg,
    *,
    path,
    title,
    description,
    keywords="",
    active_slug="",
    body_html="",
    extra_scripts=None,
    json_ld_items=None,
    noindex=False,
):
    domain = cfg["domain"].rstrip("/")
    canonical = f"{domain}{path}"
    full_title = title if cfg["site_name"] in title else f"{title} | {cfg['site_name']}"
    og_image = f"{domain}/assets/img/og-image.png"

    verification_tags = []
    if cfg.get("google_site_verification"):
        verification_tags.append(
            f'<meta name="google-site-verification" content="{cfg["google_site_verification"]}">'
        )
    if cfg.get("naver_site_verification"):
        verification_tags.append(
            f'<meta name="naver-site-verification" content="{cfg["naver_site_verification"]}">'
        )

    adsense_tag = ""
    if cfg.get("adsense_client_id"):
        adsense_tag = (
            f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
            f'?client={cfg["adsense_client_id"]}" crossorigin="anonymous"></script>'
        )

    ga4_tag = ""
    ga4_id = (cfg.get("ga4_measurement_id") or "").strip()
    if ga4_id:
        ga4_tag = (
            f'\n  <!-- Google Analytics 4 (hash #d= stripped to prevent share-link leakage) -->\n'
            f'  <script async src="https://www.googletagmanager.com/gtag/js?id={ga4_id}"></script>\n'
            f'  <script>\n'
            f'    window.dataLayer = window.dataLayer || [];\n'
            f'    function gtag(){{dataLayer.push(arguments);}}\n'
            f'    gtag(\'js\', new Date());\n'
            f'    gtag(\'config\', \'{ga4_id}\', {{\n'
            f'      page_location: window.location.origin + window.location.pathname + window.location.search\n'
            f'    }});\n'
            f'  </script>'
        )

    robots_content = "noindex, follow" if noindex else "index, follow, max-image-preview:large, max-snippet:-1"

    form_slugs = {t["slug"] for t in TOOLS if t["kind"] == "form"}
    forms_active = " active" if active_slug in form_slugs else ""
    stamp_active = " active" if active_slug == "stamp" else ""
    calc_active = " active" if active_slug == "calc" else ""
    guide_active = " active" if active_slug == "guide" else ""

    nav_links = [
        f'<a class="nav-link{forms_active}" href="/#tools">무료 서식</a>',
        f'<a class="nav-link nav-stamp{stamp_active}" href="/stamp/">도장 만들기</a>',
        f'<a class="nav-link{calc_active}" href="/#calculators">실무 계산기</a>',
        f'<a class="nav-link{guide_active}" href="/guide/">실무 가이드</a>',
    ]

    mobile_links = [
        f'<a class="mobile-drawer-link{forms_active}" href="/#tools">무료 서식 52종</a>',
        f'<a class="mobile-drawer-link{stamp_active}" href="/stamp/">도장 만들기</a>',
        f'<a class="mobile-drawer-link{calc_active}" href="/#calculators">실무 계산기 6종</a>',
        f'<a class="mobile-drawer-link{guide_active}" href="/guide/">실무 가이드</a>',
    ]

    popular_footer_keys = {
        "sajikseo", "chayongjeung", "wiimjang", "jaejik", "gyeonjeokseo", "geunro",
        "georae", "baljuseo", "cheongguseo", "imdaecha", "naeyong", "habuiseo", "stamp",
    }
    footer_tool_links = "".join(
        f'<li><a href="/{t["slug"]}/">{t["short_name"] if t["kind"] == "stamp" else t["short_name"] + " 양식"}</a></li>'
        for t in TOOLS
        if t["key"] in popular_footer_keys
    ) + '<li><a href="/#tools"><strong>전체 52종 무료 서식 →</strong></a></li>' + "".join(
        f'<li><a href="{c["path"]}">{c["short_name"]}</a></li>'
        for c in CALCULATORS
    )

    ld_html = "\n  ".join(json_ld_tag(item) for item in (json_ld_items or []))
    scripts_html = "\n  ".join(f'<script src="{src}" defer></script>' for src in (extra_scripts or []))

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{full_title}</title>
  <meta name="description" content="{description}">
  {f'<meta name="keywords" content="{keywords}">' if keywords else ''}
  <meta name="robots" content="{robots_content}">
  <meta name="author" content="{cfg['site_name']}">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <meta name="theme-color" content="#1B365D">

  <!-- Open Graph / KakaoTalk / Naver -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="{cfg['site_name']}">
  <meta property="og:title" content="{full_title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{full_title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">

  {"".join(verification_tags)}
  {adsense_tag}{ga4_tag}

  <!-- Fonts: Pretendard (UI) + Korean Formal & Seal Fonts -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Hahmlet:wght@700&family=Nanum+Brush+Script&family=Noto+Serif+KR:wght@400;600;700;800&family=Song+Myung&display=swap">

  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/forms.css">
  {ld_html}
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand-logo" href="/">
        <img src="/assets/img/favicon.svg" alt="{cfg['site_name']} 로고" width="28" height="28">
        <span>{cfg['site_name']}</span>
      </a>
      <nav class="main-nav" aria-label="주요 서식 및 도구 메뉴">
        {"".join(nav_links)}
      </nav>
      <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="전체 메뉴 열기" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="mobile-drawer" id="mobileDrawer">
      <div class="mobile-drawer-grid">
        {"".join(mobile_links)}
      </div>
    </div>
  </header>

  <main>
    {body_html}
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">{cfg['site_name']} ({cfg['site_name_en']})</div>
          <p class="footer-desc">
            회원가입 없이 웹 브라우저에서 바로 작성하고, 투명 도장을 찍어 깨지지 않는 A4로 인쇄·PDF 저장하는 한국 표준 무료 문서 도구입니다.
            서식·도장·계산기 입력 데이터는 서버에 저장되지 않고 브라우저 내에서만 처리됩니다. (문의하기 폼 접수 내용 제외 · <a href="/privacy/" style="color:inherit;text-decoration:underline;">개인정보처리방침</a>)
          </p>
        </div>
        <div class="footer-col">
          <h4>무료 서식 &amp; 도장 도구</h4>
          <ul class="footer-links">
            {footer_tool_links}
          </ul>
        </div>
        <div class="footer-col">
          <h4>사이트 안내</h4>
          <ul class="footer-links single-col">
            <li><a href="/guide/">실무 가이드 모음</a></li>
            <li><a href="/about/">사이트 소개</a></li>
            <li><a href="/privacy/">개인정보처리방침</a></li>
            <li><a href="/terms/">이용약관 및 법적 면책고지</a></li>
            <li><a href="/contact/">문의하기</a></li>
            <li><a href="/sitemap.xml">사이트맵 (XML)</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {cfg['copyright_year']} {cfg['site_name']}. All rights reserved.</span>
        <span>본 사이트의 서식 및 가이드는 실무 참고용이며, 중요한 법률·세무 사안은 전문가 검토를 권장합니다.</span>
      </div>
    </div>
  </footer>

  <script src="/assets/js/utils.js" defer></script>
  {scripts_html}
</body>
</html>
"""


def build_review_meta_box(last_modified="2026-11-23"):
    return f"""
    <div class="review-meta-box">
      <div class="review-meta-head">
        <strong>콘텐츠 검수 및 출처 기준 안내</strong>
        <span class="review-meta-date">최종 검토일: {last_modified}</span>
      </div>
      <p>본 페이지의 서식·계산식·실무 안내는 <strong>바로서식 편집·검수팀</strong>이 국가법령정보센터·고용노동부·국세청·최저임금위원회 등 공공기관 공식 고시 원문을 대조하여 작성·점검합니다. 일반 실무 참고용 자료이며, 개별 법률·노무·세무 분쟁은 고용노동부(1350)·국세상담센터(126)·대한법률구조공단(132) 또는 전문가 확인을 권장합니다. 법령 개정이나 오류 발견 시 <a href="/contact/">법령·내용 정정 제보</a>로 알려주시면 확인 후 반영합니다.</p>
    </div>
    """


def build_editorial_section(tool, last_modified="2026-11-23"):
    cur_cat = tool.get("category", "")
    same_cat = [t for t in TOOLS if t["kind"] == "form" and t["key"] != tool["key"] and t.get("category") == cur_cat]
    other_pop = [t for t in TOOLS if t["kind"] == "form" and t["key"] != tool["key"] and t.get("category") != cur_cat]
    related_list = (same_cat[:10] + other_pop[: max(0, 11 - len(same_cat[:10]))])
    related_links = "".join(
        f'<li><a href="/{t["slug"]}/"><span>{t["short_name"]} 양식</span><span>→</span></a></li>'
        for t in related_list
    ) + '<li><a href="/#tools"><span><strong>전체 52종 서식 보기</strong></span><span>→</span></a></li>'
    faqs_html = "".join(
        f"""
        <details class="faq-item">
          <summary>{q}</summary>
          <div class="faq-answer">{a}</div>
        </details>
        """
        for q, a in tool["faqs"]
    )

    stamp_aside = (
        """
        <div class="aside-card aside-stamp-cta">
          <h3>● 한글 투명 도장이 필요하신가요?</h3>
          <p>원형 막도장·회사 사각 직인을 5초 만에 만들어 투명 PNG로 저장하고 52종 모든 서식에 바로 찍을 수 있습니다.</p>
          <a href="/stamp/" class="btn btn-seal btn-block btn-sm">무료 도장 만들기 →</a>
        </div>
        """
        if tool["kind"] != "stamp"
        else """
        <div class="aside-card aside-stamp-cta">
          <h3>바로 날인 가능한 52종 무료 서식</h3>
          <p>도장을 저장한 뒤 사직서·차용증·견적서 등 원하는 서식을 열면 자동으로 날인됩니다.</p>
          <a href="/sajikseo/?stamp=auto" class="btn btn-navy btn-block btn-sm">사직서에 바로 찍어보기 →</a>
        </div>
        """
    )

    # Multi-calculator contextual links per form / category
    calc_pairs = {
        "sajikseo": [
            ("/calc/severance/", "무료 퇴직금 계산기"),
            ("/calc/unemployment/", "무료 실업급여 계산기"),
            ("/calc/annual-leave/", "무료 연차수당 계산기"),
        ],
        "toejik": [
            ("/calc/severance/", "무료 퇴직금 계산기"),
            ("/calc/unemployment/", "무료 실업급여 계산기"),
        ],
        "gyeongryeok": [
            ("/calc/severance/", "무료 퇴직금 계산기"),
            ("/calc/annual-leave/", "무료 연차수당 계산기"),
        ],
        "insu": [
            ("/calc/severance/", "무료 퇴직금 계산기"),
            ("/calc/annual-leave/", "무료 연차수당 계산기"),
        ],
        "hyuga": [("/calc/annual-leave/", "무료 연차 · 연차수당 계산기")],
        "jaejik": [("/calc/annual-leave/", "무료 연차 · 연차수당 계산기")],
        "hyujik": [("/calc/annual-leave/", "무료 연차 계산기"), ("/calc/unemployment/", "무료 실업급여 계산기")],
        "bokjik": [("/calc/annual-leave/", "무료 연차 계산기")],
        "geunro": [("/calc/weekly-holiday/", "무료 주휴수당 계산기"), ("/calc/annual-leave/", "무료 연차 계산기")],
        "alba-geunro": [("/calc/weekly-holiday/", "무료 주휴수당 계산기"), ("/calc/severance/", "무료 퇴직금 계산기")],
        "gyeyak-geunro": [("/calc/weekly-holiday/", "무료 주휴수당 계산기"), ("/calc/severance/", "무료 퇴직금 계산기")],
        "ilyong-geunro": [("/calc/weekly-holiday/", "무료 주휴수당 계산기")],
        "yeonbong": [("/calc/severance/", "무료 퇴직금 계산기"), ("/calc/annual-leave/", "무료 연차수당 계산기")],
        "geubyeo": [("/calc/weekly-holiday/", "무료 주휴수당 계산기"), ("/calc/annual-leave/", "무료 연차수당 계산기")],
        "yongyeok": [("/calc/vat/", "무료 부가세 · 3.3% 계산기")],
        "haechok": [("/calc/vat/", "무료 부가세 · 3.3% 계산기")],
        "imdaecha": [("/calc/brokerage/", "무료 부동산 중개수수료(복비) 계산기")],
        "maemae": [("/calc/brokerage/", "무료 부동산 중개수수료(복비) 계산기")],
        "imdae-tongji": [("/calc/brokerage/", "무료 부동산 중개수수료(복비) 계산기")],
        "imdaeryo-yeongsujeung": [("/calc/brokerage/", "무료 부동산 중개수수료(복비) 계산기")],
    }
    cat_default_calcs = {
        "hr": [("/calc/annual-leave/", "무료 연차 계산기"), ("/calc/severance/", "무료 퇴직금 계산기")],
        "labor": [("/calc/weekly-holiday/", "무료 주휴수당 계산기"), ("/calc/severance/", "무료 퇴직금 계산기")],
        "biz": [("/calc/vat/", "무료 부가세(VAT) 계산기")],
        "money": [("/calc/brokerage/", "무료 부동산 중개수수료 계산기"), ("/calc/vat/", "무료 부가세 계산기")],
        "legal": [("/calc/brokerage/", "무료 중개수수료 계산기"), ("/calc/vat/", "무료 부가세 계산기")],
    }
    linked_calcs = calc_pairs.get(tool["key"]) or cat_default_calcs.get(cur_cat, [])
    related_calc_card = ""
    if linked_calcs:
        calc_btns = "".join(
            f'<a href="{href}" class="btn {"btn-primary" if i == 0 else "btn-outline"} btn-block btn-sm" style="margin-top:{0 if i == 0 else 6}px;">{label} →</a>'
            for i, (href, label) in enumerate(linked_calcs)
        )
        related_calc_card = f"""
        <div class="aside-card" style="background:var(--brand-blue-soft);border-color:#bfdbfe;">
          <h3>함께 쓰면 좋은 실무 계산기</h3>
          <p style="margin:0 0 10px;font-size:13.5px;color:var(--text-secondary);">이 서식과 관련된 2026년 최신 법령 기준 금액을 1초 만에 미리 계산해 보세요.</p>
          {calc_btns}
        </div>
        """

    return f"""
    <div class="container"><div class="ad-slot" data-ad-position="tool-below"></div></div>
    <section class="editorial-section">
      <div class="container editorial-grid">
        <article class="guide-article">
          {tool['guide_html']}

          <h3>자주 묻는 질문 (FAQ)</h3>
          <div class="faq-list">
            {faqs_html}
          </div>
          {build_review_meta_box(last_modified)}
        </article>

        <aside class="editorial-aside" aria-label="관련 무료 서식 및 계산기">
          {related_calc_card}
          {stamp_aside}
          <div class="aside-card">
            <h3>다른 무료 서식 바로가기</h3>
            <ul class="aside-links">
              {related_links}
            </ul>
          </div>
        </aside>
      </div>
    </section>
    """


def build_form_page_body(tool, last_modified="2026-11-23"):
    return f"""
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <span aria-current="page">{tool['short_name']} 양식</span>
        </nav>
        <div class="page-hero-row">
          <div>
            <h1>{tool['h1']}</h1>
            <p class="page-subtitle">{tool['subtitle']}</p>
          </div>
          <div class="privacy-pill" title="모든 입력 내용은 사용자 브라우저에서만 처리됩니다">
            🔒 서버 저장 없음 · 100% 브라우저 처리
          </div>
        </div>
      </div>
    </section>

    <section class="workbench-section" id="formWorkbench" data-form-key="{tool['key']}">
      <div class="container">
        <div id="sharedLinkBanner" class="shared-link-banner no-print" style="display:none;"></div>

        <div class="mobile-tabs" role="tablist" aria-label="작성 및 미리보기 전환">
          <button type="button" class="mobile-tab-btn active" data-mobile-tab-btn="edit">1. 내용 입력하기</button>
          <button type="button" class="mobile-tab-btn" data-mobile-tab-btn="preview">2. A4 미리보기 · 인쇄</button>
        </div>

        <div class="workbench-grid" id="workbenchGrid" data-mobile-tab="edit">
          <div class="editor-panel">
            <div class="editor-toolbar">
              <div class="editor-toolbar-left">
                <button type="button" class="btn btn-outline btn-sm" id="fillSampleBtn">예시 채우기</button>
                <button type="button" class="btn btn-ghost btn-sm" id="resetFormBtn">초기화</button>
              </div>
              <div class="editor-toolbar-right">
                <button type="button" class="btn btn-primary btn-sm" data-print-trigger>A4 인쇄 / PDF</button>
              </div>
            </div>

            <div class="editor-quick-bar no-print">
              <div class="quick-bar-group">
                <button type="button" class="btn-quick-profile" id="profileFillBtn" title="브라우저에 저장한 내 개인·회사 정보를 자동으로 입력합니다">내 정보 불러오기</button>
                <button type="button" class="btn-quick-icon" id="profileConfigBtn" title="내 개인·회사 프로필 설정">⚙ 설정</button>
              </div>
              <button type="button" class="btn-quick-share" id="shareLinkBtn" data-share-trigger title="입력 내용을 링크 해시(#d=)에 담아 서버 저장 없이 상대방에게 전달합니다">🔗 상대방 입력 요청 링크 복사</button>
            </div>

            <div id="tradeChainBar" class="trade-chain-bar no-print" style="display:none;"></div>

            <div class="editor-body">
              <div id="liveValidationBar" class="live-validation-wrap no-print"></div>
              <div id="stampWidgetContainer"></div>
              <div id="editorFormFields"></div>
            </div>

            <div class="editor-sticky-footer">
              <div class="sticky-footer-btns">
                <button type="button" class="btn btn-primary btn-lg" style="flex:1;" data-print-trigger>
                  A4 인쇄 / PDF 저장
                </button>
                <button type="button" class="btn btn-outline btn-lg" data-png-export title="고해상도 A4 PNG 이미지로 다운로드">
                  PNG 저장
                </button>
              </div>
              <p class="editor-pdf-hint">인쇄 창에서 대상을 <strong>'PDF로 저장'</strong>으로 선택하고 <strong>'배경 그래픽'</strong>을 켜세요.</p>
            </div>
          </div>

          <div class="preview-panel">
            <div class="preview-toolbar">
              <div class="preview-toolbar-info">
                <span>실시간 A4 미리보기 (210×297mm)</span>
              </div>
              <div class="preview-toolbar-controls">
                <div class="font-toggle" role="group" aria-label="문서 서체 선택">
                  <button type="button" class="active" data-font-mode="serif">명조체</button>
                  <button type="button" data-font-mode="gothic">고딕체</button>
                </div>
                <button type="button" class="btn btn-outline btn-sm" id="exportPngBtn" data-png-export title="고해상도 PNG 이미지 저장">PNG</button>
                <button type="button" class="btn btn-navy btn-sm" data-print-trigger>인쇄 / PDF 저장</button>
              </div>
            </div>

            <div class="pdf-save-hint">
              <span>PDF 저장 팁: 인쇄 창에서 대상을 <strong>'PDF로 저장'</strong>으로 선택하고 <strong>'배경 그래픽'</strong> 옵션을 켜면 도장·자필서명과 표가 선명하게 저장됩니다.</span>
            </div>

            <div class="preview-stage" id="previewStage">
              <div class="a4-scale-container" id="a4ScaleContainer">
                <div id="a4PreviewTarget"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mobile-floating-bar no-print" id="mobileFloatingBar">
        <div class="mobile-floating-hint">대상을 <strong>'PDF로 저장'</strong> 선택 · 링크 공유 가능</div>
        <div class="mobile-floating-actions">
          <button type="button" class="btn btn-outline btn-sm" id="mobileFloatingTabToggle">미리보기</button>
          <button type="button" class="btn btn-outline btn-sm" data-share-trigger>링크</button>
          <button type="button" class="btn btn-primary btn-sm" data-print-trigger>A4 PDF</button>
        </div>
      </div>
    </section>

    {build_editorial_section(tool, last_modified)}
    """


def build_stamp_page_body(tool, last_modified="2026-11-23"):
    flagship_keys = {"sajikseo", "chayongjeung", "wiimjang", "jaejik", "gyeonjeokseo", "geunro", "georae", "baljuseo", "cheongguseo", "imdaecha", "naeyong", "habuiseo"}
    jump_links = "".join(
        f'<a href="/{t["slug"]}/?stamp=auto">{t["short_name"]}에 바로 찍기 →</a>'
        for t in TOOLS
        if t["kind"] == "form" and t["key"] in flagship_keys
    ) + '<a href="/#tools" style="font-weight:800;color:var(--brand-blue);">전체 52종 서식 보기 →</a>'
    return f"""
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <span aria-current="page">무료 온라인 도장 만들기</span>
        </nav>
        <div class="page-hero-row">
          <div>
            <h1>{tool['h1']}</h1>
            <p class="page-subtitle">{tool['subtitle']}</p>
          </div>
          <div class="privacy-pill">🔒 서버 저장 없음 · 600×600 고화질 투명 PNG</div>
        </div>
      </div>
    </section>

    <section class="workbench-section">
      <div class="container">
        <div class="stamp-maker-grid">
          <div class="editor-panel">
            <div class="editor-toolbar">
              <strong style="font-size:14px;color:var(--brand-navy);">도장 설정</strong>
              <div class="chip-row" style="margin:0;">
                <button type="button" class="chip-btn" data-stamp-preset="personal">개인 인감</button>
                <button type="button" class="chip-btn" data-stamp-preset="oval">타원 막도장</button>
                <button type="button" class="chip-btn" data-stamp-preset="company">회사 직인</button>
                <button type="button" class="chip-btn" data-stamp-preset="approval">결재 도장</button>
              </div>
            </div>

            <div class="editor-body" style="max-height:none;">
              <div class="form-group-card">
                <div class="form-group-title">1. 도장 모양 및 문구</div>
                <div class="field">
                  <label>도장 형태 선택</label>
                  <div class="shape-btn-grid">
                    <button type="button" class="shape-btn active" data-shape="circle">● 원형 도장</button>
                    <button type="button" class="shape-btn" data-shape="oval">⬮ 타원 막도장</button>
                    <button type="button" class="shape-btn" data-shape="square">■ 사각 회사직인</button>
                    <button type="button" class="shape-btn" data-shape="approval">◎ 3단 결재도장</button>
                  </div>
                </div>
                <div class="field">
                  <label for="stampText">도장 이름 / 상호 (최대 9자)</label>
                  <input type="text" id="stampText" maxlength="9" value="홍길동" placeholder="예: 홍길동 또는 바로상사대표이사인">
                </div>

                <div id="approvalExtraFields" style="display:none;">
                  <div class="field-row">
                    <div class="field">
                      <label for="approvalDept">상단 부서/직함</label>
                      <input type="text" id="approvalDept" maxlength="5" value="담당" placeholder="예: 담당, 팀장, 승인">
                    </div>
                    <div class="field">
                      <label for="approvalDate">중앙 날짜</label>
                      <input type="text" id="approvalDate" maxlength="10" value="26.11.19" placeholder="26.11.19">
                    </div>
                  </div>
                </div>

                <div id="inMarkWrap" class="field">
                  <div class="field-row" style="align-items:center;">
                    <label class="checkbox-row" style="white-space:nowrap;">
                      <input type="checkbox" id="stampAddIn" checked>
                      3글자 印 자동 추가
                    </label>
                    <select id="stampInChar" aria-label="인 글자 선택">
                      <option value="印" selected>한자 '印'</option>
                      <option value="인">한글 '인'</option>
                    </select>
                  </div>
                </div>

                <div id="layoutOptionWrap" class="field">
                  <label for="stampLayout">글자 배치 방향</label>
                  <select id="stampLayout">
                    <option value="auto" selected>자동 (전통 2×2 / 3×3 인감 배치)</option>
                    <option value="vertical">세로 일렬 배치</option>
                    <option value="horizontal">가로 일렬 배치</option>
                  </select>
                </div>
              </div>

              <div class="form-group-card">
                <div class="form-group-title">2. 서체 · 인주 색상 · 질감</div>
                <div class="field">
                  <label for="stampFont">한글 인장 서체</label>
                  <select id="stampFont">
                    <option value="songmyung" selected>전통 인장체 (송명)</option>
                    <option value="batang">단정 명조체 (고운바탕)</option>
                    <option value="hahmlet">판본 정자체 (함렛 · 직인 추천)</option>
                    <option value="brush">붓글씨체 (나눔손글씨)</option>
                    <option value="gothic">현대 고딕체 (노토산스)</option>
                  </select>
                </div>
                <div class="field">
                  <label>인주 색상</label>
                  <div class="color-swatch-row">
                    <button type="button" class="color-swatch active" data-color="#C81E1E" style="background:#C81E1E" title="전통 주홍"></button>
                    <button type="button" class="color-swatch" data-color="#DC2626" style="background:#DC2626" title="선명 인주"></button>
                    <button type="button" class="color-swatch" data-color="#991B1B" style="background:#991B1B" title="진한 적색"></button>
                    <button type="button" class="color-swatch" data-color="#1D4ED8" style="background:#1D4ED8" title="청색 스탬프"></button>
                    <button type="button" class="color-swatch" data-color="#1F2937" style="background:#1F2937" title="흑색 도장"></button>
                  </div>
                </div>
                <div class="field">
                  <label>테두리 굵기: <strong id="valBorder">14px</strong></label>
                  <input type="range" id="stampBorder" min="6" max="24" value="14" style="width:100%;">
                </div>
                <div class="field">
                  <label>글자 크기 비율: <strong id="valScale">100%</strong></label>
                  <input type="range" id="stampScale" min="75" max="120" value="100" style="width:100%;">
                </div>
                <div class="field">
                  <label>인주 번짐 질감 (자연스러운 빈티지 효과): <strong id="valVintage">20%</strong></label>
                  <input type="range" id="stampVintage" min="0" max="55" value="20" style="width:100%;">
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="stamp-preview-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <strong style="font-size:15px;color:var(--brand-navy);">투명 배경 실시간 미리보기</strong>
                <span style="font-size:12.5px;color:var(--text-muted);">체크무늬 영역은 실제 투명 배경입니다</span>
              </div>

              <div class="checker-stage">
                <canvas id="stampCanvas" width="600" height="600" aria-label="생성된 투명 도장 미리보기"></canvas>
              </div>

              <div class="stamp-paper-demo">
                <span style="font-size:13px;font-weight:700;color:var(--text-secondary);">실제 서류 날인 예시</span>
                <div class="stamp-paper-demo-doc">
                  <span>작성자 :</span>
                  <strong id="paperDemoName">홍길동</strong>
                  <span class="stamp-paper-demo-seal">
                    <span class="in-mark">(인)</span>
                    <img id="paperDemoSealImg" src="" alt="서류 날인 예시">
                  </span>
                </div>
              </div>

              <div class="stamp-action-bar">
                <button type="button" class="btn btn-seal btn-lg" id="downloadStampBtn">투명 PNG 다운로드</button>
                <button type="button" class="btn btn-navy btn-lg" id="saveStampBtn">내 도장함에 저장</button>
              </div>

              <div class="stamp-jump-box">
                <h3>저장한 도장을 서식에 바로 찍어보세요</h3>
                <div class="stamp-jump-links">
                  {jump_links}
                </div>
              </div>
            </div>

            <div class="saved-tray-card">
              <strong style="font-size:15px;color:var(--brand-navy);">내 도장함 (이 브라우저에만 안전하게 보관)</strong>
              <div class="saved-tray-grid" id="savedTrayGrid"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {build_editorial_section(tool, last_modified)}
    """


def build_guide_index_body(cfg, guides):
    cards = "".join(
        f"""
        <a class="guide-simple-card" href="/guide/{g['slug']}/">
          <h2>{g['title']}</h2>
          <p>{g['summary']}</p>
        </a>
        """
        for g in guides
    )
    return f"""
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <span aria-current="page">실무 가이드</span>
        </nav>
        <h1>한국 표준 서식 · 법령 실무 가이드</h1>
        <p class="page-subtitle">2026년 최신 법령 기준으로 퇴사·차용증·근로계약·부가세·위임장·전자 도장 작성 시 반드시 알아야 할 핵심 규정을 정리했습니다.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="guide-simple-grid">
          {cards}
        </div>
      </div>
    </section>
    """


def build_guide_article_body(cfg, guide, all_guides):
    other_links = "".join(
        f'<li><a href="/guide/{g["slug"]}/"><span>{g["title"]}</span><span>→</span></a></li>'
        for g in all_guides
        if g["slug"] != guide["slug"]
    )
    faqs_block = ""
    if guide.get("faqs"):
        faq_items = "".join(
            f"""
            <details class="faq-item">
              <summary>{q}</summary>
              <div class="faq-answer">{a}</div>
            </details>
            """
            for q, a in guide["faqs"]
        )
        faqs_block = f"""
        <h3>자주 묻는 질문 (FAQ)</h3>
        <div class="faq-list">
          {faq_items}
        </div>
        """

    sec_btn = ""
    if guide.get("secondary_link"):
        s_href, s_label = guide["secondary_link"]
        sec_btn = f' <a href="{s_href}" class="btn btn-outline btn-sm">{s_label} →</a>'

    return f"""
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <a href="/guide/">실무 가이드</a>
          <span>›</span>
          <span aria-current="page">{guide['category']}</span>
        </nav>
        <h1>{guide['title']}</h1>
        <p class="page-subtitle">카테고리: {guide['category']} · 읽는 시간 {guide['read_time']} · 기준일 {cfg['last_modified']}</p>
      </div>
    </section>

    <section class="editorial-section" style="border-top:none;padding-top:32px;">
      <div class="container editorial-grid">
        <article class="guide-article">
          {guide['body_html']}
          {faqs_block}

          <div class="guide-callout" style="margin-top:28px;">
            <strong>지금 바로 무료 A4 서식·도구를 이용해 보세요</strong>
            <p style="margin:6px 0 12px;">회원가입 없이 브라우저에서 빈칸만 채우고 도장을 찍어 깨끗한 A4 PDF로 저장할 수 있습니다.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <a href="/{guide['related_tool']}/" class="btn btn-primary btn-sm">{guide['related_tool_name']} 바로가기 →</a>{sec_btn}
            </div>
          </div>
          {build_review_meta_box(cfg['last_modified'])}
        </article>

        <aside class="editorial-aside" aria-label="관련 도구 및 가이드">
          <div class="aside-card aside-stamp-cta">
            <h3>관련 무료 작성 도구</h3>
            <p>이 가이드의 내용을 바탕으로 바로 문서를 작성하고 A4 PDF로 저장할 수 있습니다.</p>
            <a href="/{guide['related_tool']}/" class="btn btn-navy btn-block btn-sm">{guide['related_tool_name']} →</a>
          </div>
          <div class="aside-card">
            <h3>다른 실무 가이드</h3>
            <ul class="aside-links">
              {other_links}
            </ul>
          </div>
        </aside>
      </div>
    </section>
    """


def build_calculator_page_body(calc, all_calcs, last_modified="2026-11-23"):
    faqs_html = "".join(
        f"""
        <details class="faq-item">
          <summary>{q}</summary>
          <div class="faq-answer">{a}</div>
        </details>
        """
        for q, a in calc["faqs"]
    )
    other_calcs = "".join(
        f'<li><a href="{c["path"]}"><span>{c["short_name"]}</span><span>→</span></a></li>'
        for c in all_calcs
        if c["key"] != calc["key"]
    )
    form_links = "".join(
        f'<li><a href="{href}"><span>{label.replace(" →", "")}</span><span>→</span></a></li>'
        for href, label in calc["related_forms"]
    )
    return f"""
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <a href="/#calculators">무료 계산기</a>
          <span>›</span>
          <span aria-current="page">{calc['short_name']}</span>
        </nav>
        <div class="page-hero-row">
          <div>
            <h1>{calc['h1']}</h1>
            <p class="page-subtitle">{calc['subtitle']}</p>
          </div>
          <div class="privacy-pill">🔒 서버 저장 없음 · 100% 브라우저 즉시 계산</div>
        </div>
      </div>
    </section>

    <section class="workbench-section">
      <div class="container">
        {calc['app_html']}
      </div>
    </section>

    <div class="container"><div class="ad-slot" data-ad-position="calc-below"></div></div>

    <section class="editorial-section">
      <div class="container editorial-grid">
        <article class="guide-article">
          {calc['guide_html']}

          <h3>자주 묻는 질문 (FAQ)</h3>
          <div class="faq-list">
            {faqs_html}
          </div>
          {build_review_meta_box(last_modified)}
        </article>

        <aside class="editorial-aside" aria-label="연계 서식 및 계산기">
          <div class="aside-card aside-stamp-cta">
            <h3>연계 무료 A4 서식</h3>
            <p>계산한 금액과 기준을 바탕으로 서식을 바로 작성하고 A4 PDF로 저장하세요.</p>
            <ul class="aside-links">
              {form_links}
            </ul>
          </div>
          <div class="aside-card">
            <h3>다른 무료 실무 계산기</h3>
            <ul class="aside-links">
              {other_calcs}
            </ul>
          </div>
        </aside>
      </div>
    </section>
    """

