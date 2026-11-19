# -*- coding: utf-8 -*-
"""
바로문서 (BaroDoc) — 홈, 사이트 소개, 개인정보처리방침, 이용약관, 문의하기, 404 콘텐츠
구글 애드센스 필수 신뢰 페이지(E-E-A-T) 완비
"""

from content.pages_data import TOOLS
from content.guides_data import GUIDES


def render_home_body(cfg):
    cards_html = []
    for t in TOOLS:
        is_stamp = t["kind"] == "stamp"
        extra_cls = " featured-stamp" if is_stamp else ""
        features = "".join(f"<li>✓ {f}</li>" for f in t["card_features"])
        cta_label = "무료 도장 만들기 →" if is_stamp else f"{t['short_name']} 작성하기 →"
        cards_html.append(
            f"""
            <a class="tool-card{extra_cls}" href="/{t['slug']}/">
              <div class="tool-card-top">
                <div class="tool-icon" aria-hidden="true">{t['icon']}</div>
                <span class="tool-tag">{t['tag']}</span>
              </div>
              <h3>{t['short_name'] if is_stamp else f"{t['short_name']} 양식"}</h3>
              <p>{t['card_desc']}</p>
              <ul class="tool-card-features">{features}</ul>
              <span class="tool-card-cta">{cta_label}</span>
            </a>
            """
        )

    home_faqs = [
        ("바로문서는 정말 100% 무료인가요? 회원가입이 필요한가요?", "네, 바로문서에서 제공하는 7종 무료 서식 작성기와 온라인 투명 도장 생성기는 회원가입, 로그인, 결제 없이 누구나 무제한 무료로 이용할 수 있습니다."),
        ("작성한 사직서나 차용증의 개인정보가 서버에 저장되나요?", "아니요. 바로문서는 별도의 백엔드 서버나 데이터베이스를 사용하지 않는 100% 브라우저 로컬 처리 웹사이트입니다. 입력하신 이름, 주소, 주민등록번호, 금액 등 모든 내용은 오직 사용자의 기기 화면에서만 처리되며 외부 서버로 절대 전송되지 않습니다."),
        ("한글(HWP)이나 워드, 엑셀 프로그램이 없어도 PDF로 저장할 수 있나요?", "네, 크롬·엣지·사파리·웨일 등 일반 웹 브라우저만 있으면 충분합니다. 작성 완료 후 'A4 인쇄 / PDF 저장' 버튼을 누르고 인쇄 창에서 대상을 'PDF로 저장'으로 선택하면 깨짐 없는 고화질 표준 A4 PDF 파일로 바로 저장됩니다."),
        ("온라인 도장을 만들어서 서식에 바로 찍을 수 있나요?", "네! '도장 만들기' 페이지에서 투명 도장을 만들고 '내 도장함에 저장'을 누르면 7종 서식 어디서든 클릭 한 번으로 문서의 (인) 또는 (직인) 자리에 바로 날인할 수 있습니다. 각 서식 페이지 안에서도 이름을 입력해 3초 만에 즉시 도장을 찍을 수 있습니다."),
        ("모바일 스마트폰에서도 서식을 작성하고 PDF로 저장할 수 있나요?", "네, 모바일 화면에서는 '입력하기'와 'A4 미리보기' 탭을 오가며 간편하게 작성하고 모바일 브라우저 인쇄/PDF 저장 기능으로 문서를 저장할 수 있습니다."),
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
          <div class="container home-hero-inner">
            <div>
              <div class="hero-pill">100% 무료 · 회원가입 없음 · 서버 저장 안 함</div>
              <h1>빈칸만 채우고 도장 찍어<br><span class="accent">깨지지 않는 A4 PDF</span> 즉시 저장</h1>
              <p class="hero-desc">
                유료 결제 유도나 복잡한 HWP·엑셀 편집은 이제 그만. 사직서·차용증·위임장·재직증명서·견적서·근로계약서·거래명세서와
                한글 투명 도장 만들기를 브라우저에서 30초 만에 무료로 완성하세요.
              </p>
              <div class="hero-actions">
                <a href="#tools" class="btn btn-primary btn-lg">무료 서식 바로 선택하기</a>
                <a href="/stamp/" class="btn btn-seal btn-lg">투명 도장 만들기 (PNG)</a>
              </div>
              <div class="hero-trust-row">
                <span>✓ 입력 데이터 서버 비저장</span>
                <span>✓ 한글·한자 금액 자동 변환</span>
                <span>✓ 부가세·최저임금 자동 계산</span>
                <span>✓ A4 정밀 인쇄 최적화</span>
              </div>
            </div>

            <div class="hero-preview-card">
              <div class="hero-steps">
                <div class="hero-step">
                  <div class="hero-step-num">1</div>
                  <div>
                    <strong>필요한 서식 선택 후 빈칸 입력</strong>
                    <p>금액 한글·한자 변환, 부가세 10% 자동 계산, 재직기간 계산까지 실시간으로 반영됩니다.</p>
                  </div>
                </div>
                <div class="hero-step">
                  <div class="hero-step-num">2</div>
                  <div>
                    <strong>투명 도장·회사 직인 원클릭 날인</strong>
                    <p>만들어 둔 도장을 불러오거나 이름만 입력해 문서의 (인)·(직인) 칸에 바로 찍으세요.</p>
                  </div>
                </div>
                <div class="hero-step">
                  <div class="hero-step-num">3</div>
                  <div>
                    <strong>A4 규격 그대로 인쇄 또는 PDF 저장</strong>
                    <p>여백이나 표가 깨지지 않는 정밀 A4 레이아웃으로 즉시 출력하거나 PDF로 저장합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section" id="tools">
          <div class="container">
            <div class="section-header">
              <h2>무료 A4 서식 7종 &amp; 온라인 도장 만들기</h2>
              <p>원하는 도구를 선택하면 로그인 없이 바로 작성할 수 있습니다.</p>
            </div>
            <div class="tools-grid">
              {''.join(cards_html)}
            </div>
          </div>
        </section>

        <div class="container"><div class="ad-slot" data-ad-position="home-mid"></div></div>

        <section class="section" style="padding-top:12px;">
          <div class="container">
            <div class="section-header">
              <h2>왜 많은 분들이 바로문서를 선택할까요?</h2>
              <p>불편한 파일 다운로드와 개인정보 유출 걱정 없이 가장 실용적인 문서 작성 경험을 제공합니다.</p>
            </div>
            <div class="features-3col">
              <div class="feature-box">
                <h3>100% 브라우저 로컬 처리 보안</h3>
                <p>바로문서에는 사용자 데이터를 저장하는 백엔드 서버가 없습니다. 주민등록번호, 주소, 계약 금액, 도장 이미지 모두 사용자의 브라우저 안에서만 처리되므로 개인정보 유출 위험이 원천 차단됩니다.</p>
              </div>
              <div class="feature-box">
                <h3>실무에 꼭 필요한 자동화 기능</h3>
                <p>차용증 원금 한글·한자(大字) 자동 변환 및 연 20% 법정 최고이자율 경고, 견적서·거래명세서 부가세 별도/포함/면세 자동 계산, 근로계약서 2026년 최저임금 점검 등 실수를 줄이는 스마트 기능을 담았습니다.</p>
              </div>
              <div class="feature-box">
                <h3>도장 만들기 → 서식 날인 원스톱 연동</h3>
                <p>도장 사이트와 서식 사이트를 따로 오갈 필요가 없습니다. 온라인에서 만든 고화질 투명 PNG 도장을 내 도장함에 저장해 두고 7종 서식 어디에나 크기 조절과 함께 즉시 날인할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:12px;">
          <div class="container">
            <div class="section-header" style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;">
              <div>
                <h2>서류 작성 전 꼭 읽어야 할 실무 가이드</h2>
                <p>2026년 최신 법령 기준으로 퇴사·금전거래·근로계약·부가세·위임장·전자도장 핵심 규정을 알기 쉽게 정리했습니다.</p>
              </div>
              <a href="/guide/" class="btn btn-outline btn-sm">전체 가이드 보기 →</a>
            </div>
            <div class="features-3col">
              {''.join(
                  f'''
                  <a href="/guide/{g['slug']}/" class="tool-card" style="padding:18px;">
                    <div class="tool-card-top" style="margin-bottom:8px;">
                      <span class="tool-tag">{g['category']}</span>
                      <span style="font-size:12px;color:var(--text-muted);">{g['read_time']}</span>
                    </div>
                    <h3 style="font-size:16px;line-height:1.45;margin-bottom:8px;">{g['title']}</h3>
                    <p style="font-size:13.5px;margin-bottom:10px;">{g['summary']}</p>
                    <span class="tool-card-cta">가이드 읽기 →</span>
                  </a>
                  '''
                  for g in GUIDES
              )}
            </div>
          </div>
        </section>

        <section class="editorial-section">
          <div class="container-narrow guide-article">
            <h2>바로문서 이용 가이드 및 자주 묻는 질문</h2>
            <p>바로문서는 대한민국 직장인, 소상공인, 프리랜서, 개인이 일상과 업무에서 가장 자주 찾는 핵심 공식 서식 7종(사직서, 차용증, 위임장, 재직증명서, 견적서, 표준근로계약서, 거래명세서)과 한글 투명 도장 생성기를 한곳에 모아 무료로 제공하는 웹 도구 서비스입니다.</p>
            <p>각 서식 페이지 하단에는 <strong>2026년 최신 법령 기준(최저임금, 이자제한법, 근로기준법 등)에 맞춘 실무 작성 가이드와 체크리스트</strong>가 함께 제공되므로, 처음 문서를 작성하시는 분도 실수 없이 완성도 높은 서류를 준비하실 수 있습니다.</p>

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

          <h2>핵심 운영 원칙 3가지</h2>
          <ul>
            <li><strong>100% 브라우저 로컬 처리 (개인정보 무저장):</strong> 사용자가 입력한 성명, 주소, 연락처, 금액, 사업자 정보, 도장 이미지는 그 어떠한 경우에도 외부 서버로 전송되거나 저장되지 않습니다. 모든 연산과 문서 렌더링은 사용자의 기기 브라우저 내부에서만 동작합니다.</li>
            <li><strong>표준 A4 규격과 실무 자동화:</strong> 단순 텍스트 입력이 아니라 한글·한자 금액 자동 변환, 부가세 별도/포함/면세 자동 계산, 2026년 법정 최저임금 및 최고이자율 안내 등 실무에서 실수를 막아주는 기능을 무료로 제공합니다.</li>
            <li><strong>검증된 실무 가이드 제공:</strong> 서식만 덜렁 제공하지 않고, 각 문서를 작성할 때 반드시 챙겨야 할 법적 주의사항과 제출 전 체크리스트를 함께 안내합니다.</li>
          </ul>

          <h2>제공 중인 무료 도구 목록</h2>
          <ul>
            <li><a href="/sajikseo/" style="color:var(--brand-blue);font-weight:700;">무료 사직서 양식 작성기</a> — 퇴직 예정일, 사직 사유, 인수인계·비밀유지 서약</li>
            <li><a href="/chayongjeung/" style="color:var(--brand-blue);font-weight:700;">무료 차용증 양식 작성기</a> — 원금 한글·한자(大字) 자동 변환, 연 20% 이자율 체크</li>
            <li><a href="/wiimjang/" style="color:var(--brand-blue);font-weight:700;">무료 위임장 양식 작성기</a> — 민원·금융·부동산·차량 대리 위임 프리셋</li>
            <li><a href="/jaejik/" style="color:var(--brand-blue);font-weight:700;">무료 재직증명서 양식 작성기</a> — 재직기간 자동 계산, 주민번호 마스킹, 회사 직인</li>
            <li><a href="/gyeonjeokseo/" style="color:var(--brand-blue);font-weight:700;">무료 견적서 양식 작성기</a> — 품목 추가, 부가세 10% 자동 계산, 합계 한글 표기</li>
            <li><a href="/geunro/" style="color:var(--brand-blue);font-weight:700;">무료 표준근로계약서 양식 작성기</a> — 정규직·계약직·알바, 2026 최저임금 자동 점검</li>
            <li><a href="/georae/" style="color:var(--brand-blue);font-weight:700;">무료 거래명세서 양식 작성기</a> — 공급자(적색)·공급받는자(청색)·2매 동시 출력</li>
            <li><a href="/stamp/" style="color:var(--seal-red);font-weight:700;">무료 온라인 도장 만들기</a> — 원형·타원·사각직인·결재도장 투명 PNG 및 서식 연동</li>
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

          <p><strong>{cfg['site_name']}</strong>(이하 "본 사이트")는 이용자의 개인정보를 최우선으로 보호하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침을 통해 이용자가 본 사이트를 이용할 때 입력하는 정보와 자동 수집 정보가 어떻게 처리되는지 투명하게 안내합니다.</p>

          <h2>1. 서식 입력 정보 및 도장 이미지의 비수집·비저장 원칙</h2>
          <p>본 사이트는 별도의 회원가입 절차나 백엔드 서버 데이터베이스를 운영하지 않는 <strong>100% 정적 웹 애플리케이션</strong>입니다.</p>
          <ul>
            <li>이용자가 사직서, 차용증, 위임장, 재직증명서, 견적서, 근로계약서, 거래명세서 및 온라인 도장 만들기 화면에 입력하는 성명, 생년월일, 주민등록번호, 주소, 연락처, 계좌번호, 사업자등록번호, 도장 이미지 등 <strong>일체의 문서 데이터는 외부 서버로 전송되거나 저장되지 않습니다.</strong></li>
            <li>모든 문서 렌더링, 자동 계산, 도장 이미지 생성은 이용자의 웹 브라우저 내부 메모리에서만 처리됩니다.</li>
          </ul>

          <h2>2. 브라우저 로컬 저장소(localStorage) 이용 안내</h2>
          <p>이용자의 편의를 위해 아래 두 가지 기능에 한해 이용자 본인 기기의 웹 브라우저 <code>localStorage</code>를 사용합니다.</p>
          <ul>
            <li><strong>임시 작성 내용 보관:</strong> 실수로 페이지를 새로고침했을 때 입력 내용이 사라지지 않도록 브라우저 내부에만 임시 보관합니다. 상단의 <strong>'초기화'</strong> 버튼을 누르거나 브라우저 캐시를 삭제하면 즉시 영구 삭제됩니다.</li>
            <li><strong>내 도장함 저장:</strong> 이용자가 직접 '내 도장함에 저장' 버튼을 누른 경우에 한해 본 사이트 서식에 재사용할 수 있도록 본인 브라우저에만 저장됩니다. 언제든지 도장함에서 개별 삭제할 수 있습니다.</li>
          </ul>
          <p><em>※ PC방, 도서관 등 공용 컴퓨터에서 이용하신 경우 문서 출력을 마친 뒤 반드시 '초기화' 버튼 및 도장 삭제를 진행하시기 바랍니다.</em></p>

          <h2>3. 쿠키(Cookie) 및 제3자 광고(Google AdSense) 안내</h2>
          <p>본 사이트는 무료 서비스 운영을 위해 Google LLC가 제공하는 <strong>Google AdSense</strong> 광고 및 방문 통계 도구를 사용할 수 있습니다.</p>
          <ul>
            <li>Google을 포함한 제3자 광고 공급업체는 이용자의 본 사이트 및 다른 웹사이트 이전 방문 기록을 바탕으로 맞춤형 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.</li>
            <li>Google의 광고 쿠키 사용을 통해 Google 및 파트너는 이용자의 방문 기록을 기반으로 적합한 광고를 표시합니다.</li>
            <li>이용자는 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);text-decoration:underline;">Google 광고 설정(adssettings.google.com)</a>에서 언제든지 맞춤형 광고를 비활성화할 수 있으며, 웹 브라우저의 쿠키 차단 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>

          <h2>4. 개인정보 보호 문의처</h2>
          <p>본 사이트의 개인정보 처리와 관련한 문의, 불만 처리, 피해 구제 등은 아래 온라인 문의 폼을 통해 접수해 주시면 영업일 기준 1~3일 이내에 신속히 확인 후 안내드리겠습니다.</p>
          <ul>
            <li><strong>운영자 / 서비스명:</strong> {cfg['site_name']} 운영팀</li>
            <li><strong>접수 경로:</strong> <a href="/contact/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">문의하기 페이지의 온라인 문의 폼</a></li>
          </ul>

          <h2>5. 개인정보처리방침의 변경</h2>
          <p>본 개인정보처리방침은 법령이나 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.</p>
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
