# -*- coding: utf-8 -*-
"""
바로서식 (BaroDoc) — 홈, 사이트 소개, 개인정보처리방침, 이용약관, 문의하기, 404 콘텐츠
구글 애드센스 필수 신뢰 페이지(E-E-A-T) 완비
"""

from content.pages_data import TOOLS
from content.guides_data import GUIDES
from content.calculators_data import CALCULATORS

TOOL_DISPLAY_NAMES = {
    "simal": "시말서",
    "wiimjang": "표준위임장",
    "habuiseo": "합의서(일반·민사)",
    "geunro": "표준근로계약서",
    "imdaecha": "부동산 임대차계약서(전세·월세)",
    "imdae-tongji": "임대차 계약 갱신·해지 통지서",
}

TOOL_SHORT_DESCS = {
    "sajikseo": "퇴사 의사 · 퇴직일 작성",
    "chayongjeung": "금액 한글·한자 · 연 20% 검증",
    "wiimjang": "민원 · 은행 · 부동산 대리",
    "jaejik": "재직기간 계산 · 회사 직인",
    "gyeonjeokseo": "품목 · 부가세 · 발주서 이어쓰기",
    "geunro": "2026 최저임금 · 주휴 자동 점검",
    "georae": "적색 · 청색 2매 · 청구서 이어쓰기",
    "gyeongryeok": "이직 · 자격증 경력 증빙",
    "yeongsujeung": "계약금 · 대금 수령 확인",
    "jichul": "회사 경비 · 출장비 합계",
    "simal": "과실 반성 · 재발방지 서약",
    "habuiseo": "일반·민사 분쟁 양측 날인",
    "stamp": "투명 PNG · 52종 서식 바로 날인",
}

TOOL_SEARCH_ALIASES = {
    "sajikseo": "사직서 퇴직서 퇴사 사표 인사",
    "chayongjeung": "차용증 금전소비대차계약서 돈빌리기 이자 가족차용증",
    "wiimjang": "표준위임장 위임장 대리인 주민센터 은행 부동산 차량 민원",
    "jaejik": "재직증명서 재직확인서 직장 대출 회사증명",
    "gyeonjeokseo": "견적서 부가세 단가 품목 거래처 B2B",
    "geunro": "표준근로계약서 근로계약서 정규직 노무 최저임금",
    "georae": "거래명세서 거래명세표 납품서 공급자 공급받는자 세금",
    "gyeongryeok": "경력증명서 사용증명서 이직 자격증",
    "yeongsujeung": "영수증 현금영수증 계약금 대금 수령확인서",
    "jichul": "지출결의서 경비정산 출장비 품의서 법인카드",
    "simal": "시말서 반성문 과실보고서 사유서",
    "habuiseo": "합의서 일반합의서 민사합의서 처벌불원서 분쟁 손해배상",
    "stamp": "온라인 도장 만들기 막도장 인감 직인 법인직인 결재도장 서명",
}

CALC_SHORT_DESCS = {
    "vat": "공급가액 +10% · 포함 역산",
    "annual-leave": "입사일 · 회계연도 · 연차수당",
    "brokerage": "주택 · 오피스텔 · 월세 복비",
    "severance": "재직일수 · 3개월 평균임금",
    "unemployment": "2026 상·하한액 · 120~270일",
    "weekly-holiday": "주 15시간 · 실질 시급 자동",
}

CALC_SEARCH_ALIASES = {
    "vat": "부가세 계산기 부가가치세 VAT 세금 공급가액",
    "annual-leave": "연차 계산기 연차수당 휴가 입사일 퇴사정산",
    "brokerage": "중개수수료 계산기 복비 부동산 매매 전세 월세",
    "severance": "퇴직금 계산기 평균임금 IRP 퇴사정산",
    "unemployment": "실업급여 계산기 구직급여 권고사직 고용보험",
    "weekly-holiday": "주휴수당 계산기 알바주휴수당 최저시급 주급",
}

FORM_CATEGORY_GROUPS = [
    ("hr", "인사·퇴사", "퇴사·증명·휴가·근태·출장 표준 서식"),
    ("labor", "계약·노무", "근로계약·연봉·급여·프리랜서·NDA·동업"),
    ("biz", "거래·경영", "견적→발주→거래명세→청구→영수 이어쓰기 · 결재"),
    ("money", "금전·부동산", "차용·보관·지불각서 · 전세/월세·매매계약"),
    ("legal", "일상·법률·민원", "위임장·합의서·내용증명·탄원서·사실확인"),
]


def render_home_body(cfg):
    stamp_tool = next((t for t in TOOLS if t["kind"] == "stamp"), None)
    all_forms = [t for t in TOOLS if t["kind"] == "form"]
    cat_counts = {k: sum(1 for t in all_forms if t.get("category") == k) for k, _, _ in FORM_CATEGORY_GROUPS}
    util_count = (1 if stamp_tool else 0) + len(CALCULATORS)
    total_count = len(all_forms) + util_count

    home_categories = (
        [("all", f"전체 ({total_count})", "전체")]
        + [(k, f"{label} ({cat_counts[k]})", label) for k, label, _ in FORM_CATEGORY_GROUPS]
        + [("tools", f"계산기·도장 ({util_count})", "계산기·도장")]
    )

    cat_groups_html = []
    for cat_key, cat_label, cat_sub in FORM_CATEGORY_GROUPS:
        group_forms = [t for t in all_forms if t.get("category") == cat_key]
        tiles_html = []
        for t in group_forms:
            disp_name = TOOL_DISPLAY_NAMES.get(t["key"], t["short_name"])
            short_desc = t.get("home_desc") or TOOL_SHORT_DESCS.get(t["key"], t["card_desc"])
            aliases = t.get("search_aliases") or TOOL_SEARCH_ALIASES.get(t["key"], disp_name)
            tiles_html.append(
                f"""
                <a class="action-tile tile-form" href="/{t['slug']}/" data-dir-tile data-group="form" data-cat-group="{cat_key}" data-title="{disp_name}" data-categories="{cat_key}" data-keywords="{aliases}">
                  <div class="action-tile-top">
                    <h3>{disp_name}</h3>
                    <span class="tile-arrow" aria-hidden="true">→</span>
                  </div>
                  <p>{short_desc}</p>
                </a>
                """
            )
        cat_groups_html.append(
            f"""
            <div class="home-cat-group" data-group-box="{cat_key}">
              <div class="home-cat-group-head">
                <h3><span class="dot-swatch blue" aria-hidden="true"></span>{cat_label} <span class="cat-count-pill">{len(group_forms)}종</span></h3>
                <span class="sub-note">{cat_sub}</span>
              </div>
              <div class="tools-grid">
                {''.join(tiles_html)}
              </div>
            </div>
            """
        )

    utility_tiles = []
    if stamp_tool:
        utility_tiles.append(
            f"""
            <a class="action-tile tile-stamp" href="/{stamp_tool['slug']}/" data-dir-tile data-group="utility" data-title="온라인 도장 만들기" data-categories="tools" data-keywords="{TOOL_SEARCH_ALIASES['stamp']}">
              <div class="action-tile-top">
                <h3>온라인 도장 만들기</h3>
                <span class="tile-arrow" aria-hidden="true">→</span>
              </div>
              <p>{TOOL_SHORT_DESCS['stamp']}</p>
            </a>
            """
        )
    for c in CALCULATORS:
        short_desc = CALC_SHORT_DESCS.get(c["key"], c["card_desc"])
        aliases = CALC_SEARCH_ALIASES.get(c["key"], c["short_name"])
        utility_tiles.append(
            f"""
            <a class="action-tile tile-calc" href="{c['path']}" data-dir-tile data-group="utility" data-title="{c['short_name']}" data-categories="tools" data-keywords="{aliases}">
              <div class="action-tile-top">
                <h3>{c['short_name']}</h3>
                <span class="tile-arrow" aria-hidden="true">→</span>
              </div>
              <p>{short_desc}</p>
            </a>
            """
        )

    cat_tabs_html = "".join(
        f'<button type="button" class="cat-tab-btn{" active" if key == "all" else ""}" role="tab" aria-selected="{"true" if key == "all" else "false"}" data-cat-tab="{key}" data-cat-label="{plain}">{label}</button>'
        for key, label, plain in home_categories
    )

    home_faqs = [
        ("바로서식은 정말 100% 무료인가요? 회원가입이 필요한가요?", "네, 바로서식에서 제공하는 52종 무료 A4 표준 서식, 온라인 투명 도장·손가락 자필 서명 도구, 실무 계산기 6종은 회원가입, 로그인, 결제 없이 누구나 무제한 무료로 이용할 수 있습니다."),
        ("작성한 사직서나 차용증·임대차계약서의 개인정보가 서버에 저장되나요?", "아니요. 52종 서식, 6종 계산기, 도장·자필 서명 도구에 입력하신 이름·주소·금액·서명 데이터는 별도의 백엔드 DB에 저장되지 않고 100% 브라우저 안에서만 처리됩니다. 단, 문의하기(/contact/) 페이지에서 직접 제출하는 문의 내용과 선택 입력 이메일은 답변 처리를 위해 Web3Forms를 통해 운영자에게 전달됩니다."),
        ("견적서 내용을 발주서·거래명세서·청구서·영수증으로 이어서 쓸 수 있나요?", "네! 견적서, 발주서, 거래명세서, 청구서 상단의 '이어쓰기' 버튼을 누르면 품목·수량·단가·거래처 정보가 다음 문서로 자동 채움되어 반복 입력 없이 10초 만에 거래 문서를 완성할 수 있습니다."),
        ("상대방과 함께 작성하거나 비대면으로 서명을 받을 수 있나요?", "네! 작성 중인 서식에서 '상대방 입력 요청 링크 복사' 버튼을 누르면 내가 입력한 정보와 도장·서명이 압축 링크(#d=)에 담깁니다. 상대방이 링크를 열어 본인 정보와 손가락 서명·도장만 추가한 뒤 바로 A4 PDF로 저장할 수 있습니다."),
        ("내 개인·회사 정보를 저장해 두고 52종 서식에 자동 입력할 수 있나요?", "네! 상단의 '내 정보 불러오기'에서 이름·연락처·주소·상호·사업자번호·기본 도장/서명을 1번만 브라우저(localStorage)에 저장해 두면 52종 모든 서식에서 클릭 한 번으로 자동 채움됩니다."),
    ]

    faq_html = "".join(
        f"""
        <details class="faq-item">
          <summary>{q}</summary>
          <div class="faq-answer">{a}</div>
        </details>
        """
        for q, a in home_faqs
    )

    return (
        f"""
        <section class="home-hero">
          <div class="container">
            <div class="home-hero-compact">
              <h1>가입 없이 바로 쓰는 무료 서식 52종 · 도장 · 계산기 6종</h1>
              <p class="hero-desc">빈칸 입력 · 손가락 서명 · 상대방 링크 공유 · A4 PDF/PNG 저장까지 브라우저에서 1분 만에 끝납니다.</p>

              <div class="home-search-wrap">
                <div class="home-search-box">
                  <span class="home-search-icon" aria-hidden="true">🔍</span>
                  <input type="search" id="homeSearchInput" autocomplete="off" placeholder="52종 서식 · 6종 계산기 검색 (초성 지원: ㅅㅈㅅ, ㅊㅇㅈ, ㄱㅈㅅ, ㅌㅈㄱ, ㄴㅇㅈ...)" aria-label="무료 서식 및 계산기 빠른 검색">
                  <button type="button" id="homeSearchClear" class="home-search-clear" style="display:none;" aria-label="검색어 지우기">×</button>
                </div>
                <div class="home-search-hints">
                  <span class="hint-label">초성 빠른 검색:</span>
                  <button type="button" class="search-demo-chip" data-search-demo="ㅅㅈㅅ">ㅅㅈㅅ</button>
                  <button type="button" class="search-demo-chip" data-search-demo="ㅊㅇㅈ">ㅊㅇㅈ</button>
                  <button type="button" class="search-demo-chip" data-search-demo="ㄱㅈㅅ">ㄱㅈㅅ</button>
                  <button type="button" class="search-demo-chip" data-search-demo="ㅇㄷㅊ">ㅇㄷㅊ</button>
                  <button type="button" class="search-demo-chip" data-search-demo="ㅌㅈㄱ">ㅌㅈㄱ</button>
                  <button type="button" class="search-demo-chip" data-search-demo="ㄷㅈ">ㄷㅈ</button>
                </div>
              </div>

              <div class="home-cat-tabs" role="tablist" aria-label="서식 카테고리 선택">
                {cat_tabs_html}
              </div>
            </div>
          </div>
        </section>

        <section class="home-section-compact second-band" id="calculators">
          <div class="container">
            <div class="home-section-head">
              <h2>
                <span class="dot-swatch red" aria-hidden="true"></span>온라인 도장
                <span style="color:var(--border-strong);margin:0 2px;">·</span>
                <span class="dot-swatch green" aria-hidden="true"></span>실무 계산기 6종
              </h2>
              <span class="sub-note" id="homeResultCount">전체 {total_count}종 바로 작성 가능</span>
            </div>
            <div class="utility-row-grid" id="homeUtilityGrid">
              {''.join(utility_tiles)}
            </div>
          </div>
        </section>

        <section class="home-section-compact" id="tools">
          <div class="container">
            {''.join(cat_groups_html)}
          </div>
        </section>

        <section class="container" id="homeEmptyState" style="display:none;padding:28px 20px;">
          <div class="home-empty-card">
            <p><strong>일치하는 서식이나 계산기가 없습니다.</strong></p>
            <p class="sub">초성(예: ㅅㅈㅅ, ㅊㅇㅈ, ㅇㄷㅊ, ㅌㅈㄱ)이나 다른 키워드로 다시 검색해 보세요.</p>
            <button type="button" class="btn btn-primary btn-sm" id="homeResetSearchBtn">전체 59종 다시 보기</button>
          </div>
        </section>

        <section class="guide-banner-wrap">
          <div class="container">
            <a class="guide-banner-btn" href="/guide/">
              <div class="guide-banner-text">
                <strong>서류 작성 전 꼭 읽어야 할 실무 가이드 ({len(GUIDES)}편)</strong>
                <span>퇴사·실업급여·가족 간 차용증·2026 최저임금·부가세·위임장·전자 도장 핵심 정리</span>
              </div>
              <span class="guide-banner-cta">실무 가이드 보기 →</span>
            </a>
          </div>
        </section>

        <div class="container"><div class="ad-slot" data-ad-position="home-mid"></div></div>

        <section class="editorial-section">
          <div class="container-narrow guide-article">
            <h2>{cfg['site_name']} 이용 안내 및 자주 묻는 질문</h2>
            <p>{cfg['site_name']}은 대한민국 직장인, 소상공인, 프리랜서, 개인이 일상과 업무에서 가장 자주 찾는 5개 카테고리 총 52종 표준 A4 공식 서식(인사·퇴사 12종, 계약·노무 12종, 거래·경영 12종, 금전·부동산 8종, 일상·법률·민원 8종), 한글 투명 도장·손가락 자필 서명 도구, 그리고 실무 계산기 6종(부가세·연차·중개수수료·퇴직금·실업급여·주휴수당)을 로그인 없이 무료로 제공하는 웹 플랫폼입니다.</p>

            <h3>자주 묻는 질문 (FAQ)</h3>
            <div class="faq-list">
              {faq_html}
            </div>
          </div>
        </section>
        """,
        home_faqs,
    )


def render_about_body(cfg):
    return f"""
    <section class="static-page">
      <div class="container-narrow">
        <article class="static-card">
          <h1>{cfg['site_name']} 사이트 소개</h1>
          <div class="static-meta">운영 원칙 및 서비스 안내 · 최종 업데이트 {cfg['last_modified']}</div>

          <p><strong>{cfg['site_name']}({cfg['site_name_en']})</strong>는 누구나 회원가입이나 유료 결제 없이 웹 브라우저에서 바로 한국 표준 A4 공식 서식을 작성하고, 투명 한글 도장을 찍어 깨끗하게 인쇄·PDF 저장할 수 있도록 만든 무료 웹 도구 서비스입니다.</p>

          <h2>서비스를 만든 이유</h2>
          <p>사직서, 차용증, 위임장, 견적서처럼 살면서 꼭 한 번은 급하게 필요한 서류들이 있습니다. 하지만 기존 서식 사이트들은 회원가입과 유료 결제를 유도하거나, 한글(HWP)·엑셀 파일이 없으면 열리지 않아 정작 문서가 급한 순간에 큰 불편을 겪곤 했습니다.</p>
          <p>{cfg['site_name']}는 이러한 불편을 해결하기 위해 <strong>"접속 → 빈칸 입력 → 도장 날인 → A4 PDF 저장"</strong>의 전 과정을 30초 안에 끝낼 수 있도록 설계되었습니다.</p>

          <h2>핵심 운영 및 검수 원칙</h2>
          <ul>
            <li><strong>서식·도장·계산기 100% 브라우저 로컬 처리:</strong> 사용자가 52종 서식, 6종 계산기, 온라인 도장·서명 도구에 입력하는 성명, 주소, 연락처, 금액, 사업자 정보, 도장·서명 이미지는 외부 서버로 전송되거나 저장되지 않고 브라우저 내부에서만 처리됩니다. (단, <a href="/contact/" style="color:var(--brand-blue);text-decoration:underline;">문의하기 폼</a>에서 이용자가 직접 제출한 문의 내용·회신 이메일은 답변 처리를 위해 Web3Forms를 통해 전달됩니다.)</li>
            <li><strong>표준 A4 규격과 실무 자동화:</strong> 한글·한자 금액 자동 변환, 부가세 별도/포함/면세 자동 계산, 견적서→발주서→거래명세서→청구서→영수증 이어쓰기, 2026년 최저임금·구직급여 상·하한액 및 법정 최고이자율 점검 기능을 무료로 제공합니다.</li>
            <li><strong>공식 법령 대조 및 정정 절차:</strong> 모든 계산식과 실무 가이드는 국가법령정보센터·고용노동부·국세청·최저임금위원회 등 공공기관 공식 고시와 원문을 대조해 작성하며, 페이지별 최종 검토일을 공개합니다. 법령 개정이나 수치 오류가 발견되면 <a href="/contact/" style="color:var(--brand-blue);text-decoration:underline;">문의하기 페이지</a>의 '법령·내용 정정'으로 제보해 주시면 확인 후 신속히 반영합니다.</li>
          </ul>

          <h2>제공 중인 무료 도구 (총 59종)</h2>
          <ul>
            <li><strong>무료 A4 표준 서식 52종:</strong> 인사·퇴사 12종(사직서·재직증명서·경력증명서 등), 계약·노무 12종(표준근로계약서·급여명세서·용역계약서 등), 거래·경영 12종(견적서·발주서·거래명세서·청구서·영수증 이어쓰기 등), 금전·부동산 8종(차용증·임대차계약서 등), 일상·법률·민원 8종(표준위임장·합의서·내용증명서 등) — <a href="/#tools" style="color:var(--brand-blue);font-weight:700;">전체 52종 보기</a></li>
            <li><a href="/stamp/" style="color:var(--seal-red);font-weight:700;">무료 온라인 도장 만들기</a> — 원형·타원·사각직인·결재도장 투명 PNG 및 52종 서식 원클릭 날인</li>
            <li><strong>무료 실무 계산기 6종:</strong> <a href="/calc/unemployment/" style="color:var(--brand-blue);font-weight:700;">실업급여</a> · <a href="/calc/severance/" style="color:var(--brand-blue);font-weight:700;">퇴직금</a> · <a href="/calc/annual-leave/" style="color:var(--brand-blue);font-weight:700;">연차수당</a> · <a href="/calc/weekly-holiday/" style="color:var(--brand-blue);font-weight:700;">주휴수당</a> · <a href="/calc/vat/" style="color:var(--brand-blue);font-weight:700;">부가세</a> · <a href="/calc/brokerage/" style="color:var(--brand-blue);font-weight:700;">중개수수료</a></li>
          </ul>

          <h2>문의 및 개선 제안</h2>
          <p>추가되었으면 하는 서식이나 오탈자·개선 의견이 있으시면 언제든지 <a href="/contact/" style="color:var(--brand-blue);font-weight:700;">문의하기 페이지</a>를 통해 알려주세요.</p>
        </article>
      </div>
    </section>
    """


def render_privacy_body(cfg):
    return f"""
    <section class="static-page">
      <div class="container-narrow">
        <article class="static-card">
          <h1>개인정보처리방침</h1>
          <div class="static-meta">시행일자: {cfg['last_modified']} · 적용 서비스: {cfg['site_name']} ({cfg['domain']})</div>

          <p><strong>{cfg['site_name']}</strong>(이하 "본 사이트")는 이용자의 개인정보를 최우선으로 보호하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 <strong>서식·도장·계산기 입력 데이터(브라우저 로컬 처리)</strong>, <strong>공유 링크(#d=)</strong>, 그리고 <strong>문의하기 폼 데이터(외부 폼 서비스 전달)</strong>가 각각 어떻게 처리·보관·삭제되는지 명확히 구분하여 안내합니다.</p>

          <h2>1. 서식·도장·계산기 입력 정보의 브라우저 로컬 처리 원칙</h2>
          <p>본 사이트의 52종 무료 서식 작성기, 6종 실무 계산기, 온라인 도장 및 자필 서명 도구는 별도의 회원가입이나 자체 백엔드 데이터베이스를 사용하지 않고 <strong>이용자의 웹 브라우저 내부에서만 동작</strong>합니다.</p>
          <ul>
            <li>서식 및 계산기에 입력하는 성명, 생년월일, 주민등록번호, 주소, 연락처, 계좌번호, 사업자등록번호, 급여·금액, 생성한 도장 및 자필 서명 이미지 등 <strong>일체의 문서·계산 데이터는 본 사이트 서버로 전송되거나 수집·저장되지 않습니다.</strong></li>
            <li>PDF 인쇄 및 PNG 이미지 변환 작업 역시 이용자의 기기 브라우저 메모리 내부에서만 처리됩니다.</li>
          </ul>

          <h2>2. 브라우저 로컬 저장소(localStorage · sessionStorage) 저장 항목 및 삭제 방법</h2>
          <p>이용자의 반복 입력 편의를 위해 아래 기능에 한해 이용자 본인 기기의 웹 브라우저 저장소에만 데이터를 보관합니다. 해당 데이터는 외부 서버로 전송되지 않으며 이용자가 언제든지 직접 삭제할 수 있습니다.</p>
          <ul>
            <li><strong>임시 작성 내용 보관 (<code>localStorage</code>):</strong> 실수로 새로고침해도 작성 중인 내용이 사라지지 않도록 현재 기기 브라우저에만 임시 저장합니다. 각 서식 상단의 <strong>'초기화'</strong> 버튼을 누르거나 브라우저 사이트 데이터를 삭제하면 즉시 영구 삭제됩니다.</li>
            <li><strong>내 개인·회사 정보 저장 (<code>localStorage</code>, <code>barodoc_user_profile_v1</code>):</strong> 이용자가 직접 <em>'내 정보 불러오기 → ⚙ 설정'</em>에서 저장을 선택한 경우에 한해 성명·생년월일·연락처·주소·부서·직위·계좌번호(개인 정보), 상호·사업자등록번호·대표자명·회사 연락처·사업장 주소·업태·종목·계좌번호(회사 정보), 기본 도장·서명 설정을 본인 브라우저에만 보관합니다. 상단 <strong>'⚙ 설정' 모달 하단의 '프로필 삭제'</strong> 버튼 또는 브라우저 사이트 데이터 삭제로 즉시 삭제할 수 있습니다.</li>
            <li><strong>내 도장함 및 자필 서명 저장 (<code>localStorage</code>):</strong> 이용자가 직접 저장 버튼을 누른 도장 이미지와 자필 서명 이미지만 본인 브라우저에 보관됩니다. 도장함·서명함의 개별 <strong>'삭제'</strong> 버튼으로 언제든지 삭제할 수 있습니다.</li>
            <li><strong>거래 문서 이어쓰기 임시 전달 (<code>sessionStorage</code>):</strong> 견적서·발주서·거래명세서·청구서·영수증 간 '이어쓰기' 버튼 클릭 시 품목·거래처 정보를 다음 페이지로 넘기기 위해 브라우저 세션 저장소에만 잠시 보관하며, 탭을 닫으면 자동 삭제됩니다.</li>
          </ul>
          <p><em>※ PC방, 도서관 등 공용 컴퓨터에서 이용하신 경우 문서 출력을 마친 뒤 반드시 서식 '초기화', '프로필 삭제', 도장·서명 삭제 또는 브라우저 쿠키·사이트 데이터 전체 삭제를 진행하시기 바랍니다.</em></p>

          <h2>3. 상대방 입력 요청 공유 링크(<code>#d=...</code>)의 처리 방식 및 주의사항</h2>
          <p>이용자가 서식 상단의 <strong>'상대방 입력 요청 링크 복사'</strong> 기능을 사용하면, 현재 문서에 입력한 항목과 날인된 도장·서명 데이터가 압축·인코딩되어 URL 해시 프래그먼트(<code>https://barodoc.pe.kr/.../#d=...</code>)에 포함됩니다.</p>
          <ul>
            <li><strong>서버 비전송:</strong> 웹 표준상 URL의 <code>#</code> 뒤쪽 프래그먼트 영역은 웹 서버로 전송되지 않으며, 본 사이트 서버에도 저장되지 않습니다.</li>
            <li><strong>수신자 열람 범위:</strong> 해당 링크 전체를 전달받은 상대방(또는 링크에 접근한 제3자)은 링크 안에 포함된 <strong>문서 입력 정보, 도장 이미지, 자필 서명 내용을 그대로 열람하고 수정·저장</strong>할 수 있습니다.</li>
            <li><strong>이용 시 주의사항:</strong> 주민등록번호, 계좌번호, 주소 등 민감한 개인정보가 포함된 공유 링크는 반드시 실제 거래·계약 당사자에게만 1:1 비공개 채널로 전달하시고, 공개 게시판·오픈채팅방 등에 게시하지 마시기 바랍니다.</li>
          </ul>

          <h2>4. 온라인 문의하기(<code>/contact/</code>) 폼 데이터 처리 안내 (Web3Forms)</h2>
          <p>서식 입력 데이터와 달리, 이용자가 <a href="/contact/" style="color:var(--brand-blue);text-decoration:underline;">문의하기 페이지</a>의 온라인 문의 폼을 직접 작성해 제출하는 정보는 오류 수정 및 회신 처리를 위해 외부 폼 전달 서비스를 거쳐 운영자에게 전달됩니다.</p>
          <ul>
            <li><strong>수집·전달 항목:</strong> 문의 유형(필수), 문의 내용(필수), 회신받을 이메일 주소(선택 입력).</li>
            <li><strong>처리 목적:</strong> 서비스 오류 제보 확인, 신규 서식 요청 검토, 법령·내용 정정 반영, 제휴 문의 확인 및 이용자가 이메일을 입력한 경우 회신 발송.</li>
            <li><strong>처리 경로 (외부 전송):</strong> 제출된 문의 데이터는 암호화된 HTTPS 통신을 통해 <strong>Web3Forms (<code>api.web3forms.com</code>)</strong>를 거쳐 운영자 수신 메일함으로 전달됩니다.</li>
            <li><strong>보관 기간 및 삭제 기준:</strong> 접수된 문의 내역과 회신 이메일은 처리 및 답변 완료 후 목적 달성 시 지체 없이 파기하며, 오류 재현·정정 이력 확인이 필요한 경우에 한해 <strong>최대 1년</strong> 이내 보관 후 파기합니다. 이용자가 문의하기 페이지를 통해 이전 문의 내역의 삭제를 요청하면 본인 확인 후 즉시 삭제합니다.</li>
          </ul>

          <h2>5. 쿠키(Cookie) · 방문 통계(Google Analytics 4) 및 제3자 광고(Google AdSense) 안내</h2>
          <p>본 사이트는 서비스 품질 개선과 무료 운영을 위해 Google LLC가 제공하는 <strong>Google Analytics 4(GA4)</strong> 방문 통계 도구와 <strong>Google AdSense</strong> 광고를 사용합니다.</p>
          <ul>
            <li><strong>방문 통계(GA4):</strong> 방문 페이지 경로, 접속 기기, 체류 시간 등 비식별 통계 정보만 수집하며, <strong>서식 입력 내용·도장·서명 이미지 및 공유 링크의 해시 데이터(<code>#d=...</code>)는 전송 대상에서 원천 제외</strong>(URL 프래그먼트 제거 전송)합니다. 이용자는 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);text-decoration:underline;">Google Analytics 차단 브라우저 부가기능</a>으로 통계 수집을 거부할 수 있습니다.</li>
            <li><strong>맞춤형 광고(Google AdSense):</strong> Google을 포함한 제3자 광고 공급업체는 이용자의 본 사이트 및 다른 웹사이트 이전 방문 기록을 바탕으로 맞춤형 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.</li>
            <li>이용자는 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);text-decoration:underline;">Google 광고 설정(adssettings.google.com)</a>에서 언제든지 맞춤형 광고를 비활성화할 수 있으며, 웹 브라우저의 쿠키 차단 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>

          <h2>6. 개인정보 보호 문의처 및 권리 행사</h2>
          <p>본 사이트의 개인정보 처리, 문의 내역 열람·삭제 요청, 불만 처리 등은 아래 온라인 문의 폼을 통해 접수해 주시면 영업일 기준 1~3일 이내에 확인 후 조치하겠습니다.</p>
          <ul>
            <li><strong>운영자 / 서비스명:</strong> {cfg['site_name']} 운영팀</li>
            <li><strong>접수 경로:</strong> <a href="/contact/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">문의하기 페이지의 온라인 문의 폼</a></li>
          </ul>

          <h2>7. 개인정보처리방침의 변경</h2>
          <p>본 개인정보처리방침은 법령이나 서비스 기능 변경에 따라 수정될 수 있으며, 변경 시 시행일자 갱신과 함께 본 페이지를 통해 공지합니다.</p>
        </article>
      </div>
    </section>
    """


def render_terms_body(cfg):
    return f"""
    <section class="static-page">
      <div class="container-narrow">
        <article class="static-card">
          <h1>이용약관 및 법적 면책고지</h1>
          <div class="static-meta">시행일자: {cfg['last_modified']} · 적용 서비스: {cfg['site_name']}</div>

          <h2>제1조 (목적)</h2>
          <p>본 약관은 {cfg['site_name']}(이하 "사이트")가 제공하는 무료 온라인 서식 작성 도구, 온라인 도장 생성 도구 및 실무 정보 콘텐츠의 이용 조건과 책임의 한계를 규정함을 목적으로 합니다.</p>

          <h2>제2조 (서비스의 내용 및 무료 이용)</h2>
          <p>사이트는 사직서, 차용증, 위임장, 재직증명서, 견적서, 표준근로계약서, 거래명세서 작성 및 투명 도장 생성 기능을 무료로 제공합니다. 사이트는 운영상·기술상의 필요에 따라 제공하는 기능이나 양식을 사전 고지 없이 개선·변경할 수 있습니다.</p>

          <h2>제3조 (법적 면책고지 — 중요)</h2>
          <ul>
            <li>본 사이트가 제공하는 모든 서식 양식, 자동 계산 결과, 작성 가이드 및 FAQ는 <strong>일반적인 실무 편의를 위한 참고용 표준 서식</strong>이며, 변호사·노무사·세무사·법무사의 개별적인 법률·노무·세무 자문을 대체하지 않습니다.</li>
            <li>구체적인 계약 조건, 고액 금전 거래, 소송·분쟁 가능성이 있는 사안, 관공서·금융기관의 특수한 전용 서식이 요구되는 업무에서는 반드시 제출 기관의 요건을 사전 확인하거나 관련 전문가의 검토를 받으시기 바랍니다.</li>
            <li>이용자가 본 사이트의 서식이나 도장 이미지를 사용하여 발생한 직·간접적 손해나 법적 분쟁에 대해 사이트 운영자는 법적 책임을 지지 않습니다.</li>
          </ul>

          <h2>제4조 (부정 사용 금지)</h2>
          <p>이용자는 타인의 성명, 상호, 직인 등을 무단으로 도용하여 사문서 위조·변조 등 불법적인 목적으로 본 사이트의 서식 작성기 및 도장 생성기를 이용해서는 안 됩니다. 모든 문서와 도장의 적법한 사용 권한 및 책임은 작성자 본인에게 있습니다.</p>

          <h2>제5조 (지식재산권)</h2>
          <p>사이트의 디자인, 소스 코드, 작성 가이드 및 설명 콘텐츠에 대한 저작권은 사이트 운영자에게 있습니다. 단, 이용자가 본 사이트 도구를 사용해 직접 작성한 개별 문서 및 도장 이미지 파일은 상업적·비상업적 구분 없이 이용자가 자유롭게 출력·제출·활용할 수 있습니다.</p>
        </article>
      </div>
    </section>
    """


def render_contact_body(cfg):
    access_key = cfg.get("web3forms_access_key", "여기에_Web3Forms_키_입력")
    return f"""
    <section class="static-page">
      <div class="container-narrow">
        <article class="static-card">
          <h1>문의하기</h1>
          <div class="static-meta">{cfg['site_name']} 오류 제보 · 신규 서식 요청 · 법령 정정 · 제휴 문의</div>

          <p>{cfg['site_name']}를 이용해 주셔서 감사합니다. 서비스 이용 중 발생하는 인쇄·PDF 오류 제보, 법령 개정에 따른 서식 및 가이드 업데이트 제안, 새로 추가되었으면 하는 무료 서식 아이디어가 있으시면 아래 온라인 문의 폼으로 편하게 남겨 주세요.</p>

          <div class="contact-form-card">
            <h2>온라인 문의 폼</h2>
            <p class="contact-form-sub">운영시간: 평일 09:00 ~ 18:00 (주말·공휴일 제외) · 평균 회신 기간: 영업일 기준 1~3일 이내</p>

            <form id="contactForm" class="contact-form" action="https://api.web3forms.com/submit" method="POST">
              <input type="hidden" name="access_key" value="{access_key}">
              <input type="hidden" name="subject" id="formSubject" value="[바로문서 문의] 오류 제보">
              <input type="hidden" name="from_name" value="{cfg['site_name']} 웹사이트">
              <input type="checkbox" name="botcheck" style="display:none;" tabindex="-1" autocomplete="off" aria-hidden="true">

              <div class="field">
                <label for="inquiryType">문의 유형 <span style="color:var(--seal-red);">*</span></label>
                <select id="inquiryType" name="category" required>
                  <option value="오류 제보" selected>오류 제보</option>
                  <option value="신규 서식 요청">신규 서식 요청</option>
                  <option value="법령·내용 정정">법령·내용 정정</option>
                  <option value="제휴 및 기타">제휴 및 기타</option>
                </select>
              </div>

              <div class="field">
                <label for="replyEmail">회신받을 이메일 <span style="font-weight:500;color:var(--text-muted);">(선택)</span></label>
                <input type="email" id="replyEmail" name="reply_email" placeholder="답변을 받으실 경우에만 이메일 주소를 입력해 주세요" autocomplete="email">
                <p class="field-help">회신이 필요 없는 단순 제보나 건의는 비워 두셔도 접수됩니다.</p>
              </div>

              <div class="field">
                <label for="inquiryMessage">문의 내용 <span style="color:var(--seal-red);">*</span></label>
                <textarea id="inquiryMessage" name="message" required placeholder="오류 제보 시 사용 중인 기기/브라우저(예: 크롬, 아이폰 사파리)와 문제가 발생한 서식 이름을 함께 적어주시면 더욱 빠르게 개선할 수 있습니다."></textarea>
              </div>

              <p class="field-help" style="margin:0 0 12px;line-height:1.6;">
                ※ 서식 작성 데이터와 달리, 이 문의 폼에 입력하신 문의 유형·내용 및 회신 이메일(선택)은 문의 확인과 답변 처리를 위해 HTTPS 암호화 통신으로 <strong>Web3Forms</strong>를 거쳐 운영자에게 전달되며, 처리 완료 후 지체 없이(최대 1년 이내) 파기됩니다. 자세한 내용은 <a href="/privacy/" style="color:var(--brand-blue);text-decoration:underline;">개인정보처리방침</a>을 확인해 주세요.
              </p>

              <button type="submit" id="contactSubmitBtn" class="btn btn-primary btn-lg btn-block">문의 보내기</button>
              <div id="contactStatus" class="contact-status" role="status" aria-live="polite" hidden></div>
            </form>
          </div>

          <h2>자주 접수되는 문의 유형 및 빠른 처리 안내</h2>
          <ul>
            <li><strong>오류 제보:</strong> 특정 브라우저(크롬·엣지·사파리·웨일 등)나 모바일 기기에서 A4 인쇄 여백이 어긋나거나 계산·도장 날인 오류가 발생하는 경우, 사용 중인 <em>기기/브라우저 이름과 문제가 발생한 서식 페이지 주소</em>를 함께 보내주시면 가장 빠르게 수정합니다.</li>
            <li><strong>신규 무료 서식 요청:</strong> 경력증명서, 영수증, 내용증명, 퇴직금 정산서, 발주서 등 실무에서 자주 쓰이는 무료 A4 서식 아이디어를 제안해 주시면 우선순위를 검토해 반영합니다.</li>
            <li><strong>법령·내용 정정:</strong> 실무 가이드나 FAQ 내용 중 법령 개정·수치 변동이 필요한 부분을 알려주시면 확인 즉시 최신화합니다.</li>
            <li><strong>제휴 및 기타:</strong> 기업용 맞춤 서식 연동 및 비즈니스·광고 제휴 관련 문의를 환영합니다.</li>
          </ul>

          <h2>개별 법률·노무·세무 상담 안내 (공공 무료 상담 기관)</h2>
          <p>{cfg['site_name']}는 표준 서식 작성 도구와 일반 실무 정보를 제공하는 서비스로, 개별 분쟁에 대한 법률·노무·세무 자문은 진행하지 않습니다. 구체적인 분쟁 해결이 필요하신 경우 아래 정부 공공 무료 상담 센터를 이용해 주세요.</p>
          <table class="guide-table">
            <thead>
              <tr><th style="width:28%">기관명</th><th style="width:20%">대표번호</th><th>주요 무료 상담 분야</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>고용노동부 고객상담센터</strong></td><td>국번 없이 <strong>1350</strong></td><td>임금체불, 퇴직금, 최저임금, 근로계약서, 실업급여</td></tr>
              <tr><td><strong>대한법률구조공단</strong></td><td>국번 없이 <strong>132</strong></td><td>차용증 금전 분쟁, 지급명령, 민사소송, 위임·계약 법률 상담</td></tr>
              <tr><td><strong>국세상담센터 (홈택스)</strong></td><td>국번 없이 <strong>126</strong></td><td>세금계산서, 부가가치세, 가족 간 차용증 증여세, 원천징수</td></tr>
              <tr><td><strong>정부24 민원콜센터</strong></td><td><strong>1588-2188</strong></td><td>주민등록등·초본, 가족관계증명서, 인감 대리발급 민원 안내</td></tr>
            </tbody>
          </table>
        </article>
      </div>
    </section>
    """


def render_404_body(cfg):
    links = "".join(
        f'<a class="btn btn-outline btn-sm" href="/{t["slug"]}/">{t["short_name"]}</a>'
        for t in TOOLS
    )
    return f"""
    <section class="static-page">
      <div class="container-narrow">
        <div class="static-card" style="text-align:center;">
          <p style="font-size:48px;font-weight:800;color:var(--brand-navy);margin:0 0 8px;">404</p>
          <h1 style="margin-bottom:10px;">요청하신 페이지를 찾을 수 없습니다</h1>
          <p style="max-width:520px;margin:0 auto 24px;">주소가 변경되었거나 잘못 입력되었을 수 있습니다. 아래에서 원하시는 무료 서식 또는 도장 만들기 도구로 바로 이동해 보세요.</p>
          <div style="margin-bottom:22px;">
            <a href="/" class="btn btn-primary btn-lg">홈으로 돌아가기</a>
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">
            {links}
          </div>
        </div>
      </div>
    </section>
    """
