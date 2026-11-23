# -*- coding: utf-8 -*-
"""
바로서식 (BaroDoc) — 무료 실무 계산기 3종 메타데이터, UI, 실무 가이드, FAQ
1. 부가세 계산기 (/calc/vat/)
2. 연차 계산기 (/calc/annual-leave/)
3. 중개수수료(복비) 계산기 (/calc/brokerage/)
"""

CALCULATORS = [
    {
        "key": "vat",
        "slug": "vat",
        "path": "/calc/vat/",
        "short_name": "부가세 계산기",
        "icon": "세",
        "tag": "별도·포함 역산",
        "title": "부가세 계산기 (부가세 10% 별도·포함 역산 · 한글금액 자동변환)",
        "h1": "무료 부가세(VAT) 계산기",
        "subtitle": "공급가액에서 부가세 10%를 더하거나, 부가세 포함 총액에서 공급가액과 세액을 즉시 역산하세요. 계산한 금액으로 견적서·거래명세서도 바로 작성할 수 있습니다.",
        "description": "무료 부가세 계산기로 공급가액 기준 부가세(10%) 별도 계산과 부가세 포함 합계금액 역산을 1초 만에 확인하세요. 원클릭 복사, 한글 금액 변환, 프리랜서 3.3% 원천징수 참고 계산과 견적서·거래명세서 연동을 제공합니다.",
        "keywords": "부가세 계산기, 부가가치세 계산기, 부가세 포함 계산, 공급가액 계산기, 부가세 역산, VAT 계산기",
        "card_desc": "공급가액 +10% 계산과 부가세 포함 총액 역산, 한글 금액 변환, 프리랜서 3.3% 참고까지 한 번에 확인합니다.",
        "card_features": ["부가세 별도(+10%) / 포함 역산 전환", "공급가액·세액·합계 원클릭 복사", "견적서·거래명세서 바로 연결"],
        "related_forms": [
            ("/gyeonjeokseo/", "무료 견적서 양식 작성 →"),
            ("/georae/", "무료 거래명세서 양식 작성 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="vatCalcApp">
          <div class="calc-card">
            <div class="calc-mode-tabs" role="tablist" aria-label="부가세 계산 방식">
              <button type="button" class="calc-mode-btn active" data-vat-mode="exclude">공급가액 → 합계 (+10%)</button>
              <button type="button" class="calc-mode-btn" data-vat-mode="include">합계금액 → 역산 (포함)</button>
            </div>

            <div class="field">
              <label for="vatAmount" id="vatInputLabel">공급가액 입력 (부가세 별도 금액, 원)</label>
              <input type="number" id="vatAmount" min="0" step="1000" value="1000000" placeholder="금액을 숫자로 입력하세요">
            </div>

            <div class="chip-row" style="margin-top:8px;">
              <button type="button" class="chip-btn" data-add-amt="100000">+10만</button>
              <button type="button" class="chip-btn" data-add-amt="1000000">+100만</button>
              <button type="button" class="chip-btn" data-add-amt="5000000">+500만</button>
              <button type="button" class="chip-btn" data-add-amt="10000000">+1,000만</button>
              <button type="button" class="chip-btn" data-add-amt="0">초기화</button>
            </div>

            <div class="guide-callout" style="margin:14px 0 0;font-size:13px;">
              <strong>프리랜서 3.3% 원천징수 참고 (입력 금액 기준)</strong>
              원천징수세액(소득세 3% + 지방세 0.3%): <strong id="vatFreelanceTax">33,000원</strong><br>
              세후 실수령액: <strong id="vatFreelanceNet">967,000원</strong>
            </div>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label" id="vatHeroLabel">부가세 포함 총 합계금액 (공급대가)</div>
              <div class="calc-result-main" id="vatHeroVal">1,100,000원</div>
              <div class="calc-result-sub" id="vatHeroKor">금 일백일십만원정 / 金 壹百壹拾萬圓整</div>
            </div>

            <div class="calc-breakdown-grid">
              <div class="calc-stat-box">
                <div class="lbl">공급가액 (세전)</div>
                <div class="val" id="vatSupplyVal">1,000,000원</div>
                <div class="sub">세금계산서 공급가액란</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">부가가치세 (10%)</div>
                <div class="val" id="vatTaxVal">100,000원</div>
                <div class="sub">세금계산서 세액란</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">합계금액 (공급대가)</div>
                <div class="val" id="vatTotalVal">1,100,000원</div>
                <div class="sub">실제 입금·결제 총액</div>
              </div>
            </div>

            <div class="calc-copy-row">
              <button type="button" class="btn btn-outline btn-sm" data-copy-vat="supply">공급가액 복사</button>
              <button type="button" class="btn btn-outline btn-sm" data-copy-vat="vat">부가세 복사</button>
              <button type="button" class="btn btn-navy btn-sm" data-copy-vat="total">합계금액 복사</button>
            </div>

            <div class="calc-cta-box">
              <div>
                <strong>계산한 금액으로 A4 서식을 바로 만드세요</strong>
                <span>견적서와 거래명세서에서도 부가세 별도·포함·면세가 자동 계산됩니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/gyeonjeokseo/" class="btn btn-primary btn-sm">견적서 작성 →</a>
                <a href="/georae/" class="btn btn-outline btn-sm">거래명세서 작성 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>부가가치세(VAT) 계산 원리와 실무 완벽 가이드</h2>
<p>대한민국 「부가가치세법」상 일반과세자의 표준 부가가치세율은 <strong>10%</strong>입니다. 견적서·거래명세서·전자세금계산서를 발행하거나 카드 매출을 정산할 때 <strong>공급가액(부가세 제외 금액)</strong>과 <strong>공급대가(부가세 포함 합계금액)</strong>를 정확히 구분해 계산해야 1원 단위 오차나 거래처 분쟁을 막을 수 있습니다.</p>

<h3>1. 부가세 별도 vs 포함 역산 공식</h3>
<table class="guide-table">
  <thead>
    <tr><th style="width:24%">계산 방식</th><th style="width:38%">공식</th><th>실생활 계산 예시</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>부가세 별도 (+10%)</strong><br>(공급가액 기준)</td>
      <td>부가세 = 공급가액 × 0.1<br>합계금액 = 공급가액 × 1.1</td>
      <td>공급가액 <strong>3,500,000원</strong> → 부가세 <strong>350,000원</strong> → 총 합계 <strong>3,850,000원</strong></td>
    </tr>
    <tr>
      <td><strong>부가세 포함 역산</strong><br>(총액 기준 분리)</td>
      <td>공급가액 = 합계금액 ÷ 1.1 (반올림)<br>부가세 = 합계금액 − 공급가액</td>
      <td>총액 <strong>1,000,000원</strong> → 공급가액 <strong>909,091원</strong> + 부가세 <strong>90,909원</strong></td>
    </tr>
  </tbody>
</table>

<h3>2. 실무에서 자주 하는 부가세 실수 3가지</h3>
<ol>
  <li><strong>부가세 포함 금액에 0.9를 곱하는 오류:</strong> 총액 100만 원에서 공급가액을 구할 때 <code>100만 × 0.9 = 90만 원</code>으로 계산하면 틀립니다! 공급가액 90만 원에 10%를 붙이면 99만 원이 되기 때문입니다. 반드시 <strong><code>÷ 1.1</code>(10/11)</strong>로 나누어야 정확한 <code>909,091원</code>이 나옵니다.</li>
  <li><strong>견적서 부가세 별도 표기 누락:</strong> 구두나 문자로 "300만 원에 진행하겠습니다"라고만 하면 발주처는 부가세 포함으로 이해하고, 공급자는 부가세 별도로 이해해 30만 원 분쟁이 자주 발생합니다. <a href="/gyeonjeokseo/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">표준 견적서 양식</a>에 공급가액과 세액을 분리 명시하세요.</li>
  <li><strong>원 단위 절사·반올림 차이:</strong> 홈택스 전자세금계산서는 합계금액 기준 역산 시 1원 미만은 반올림(또는 버림) 처리하여 <code>공급가액 + 세액 = 합계금액</code>이 정확히 일치하도록 맞춥니다.</li>
</ol>

<div class="guide-callout">
  <strong>공식 법령 출처 및 관련 가이드</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://www.law.go.kr/법령/부가가치세법" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「부가가치세법」</a></li>
    <li><a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국세청 홈택스 — 전자세금계산서 발급 및 신고 안내</a></li>
  </ul>
  <p style="margin:8px 0 0;">일반과세자·간이과세자·면세사업자별 세금계산서 발행 기준은 <a href="/guide/simplified-taxpayer-quotation/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">간이과세자·일반과세자 견적서 및 부가세 작성법</a>을 참고하세요.</p>
</div>
""",
        "faqs": [
            ("합계 100만 원(부가세 포함)의 공급가액과 부가세는 얼마인가요?", "1,000,000 ÷ 1.1 = 909,091원이 공급가액이고, 나머지 90,909원이 부가가치세(10%)입니다."),
            ("간이과세자도 거래처에 부가세 10%를 별도로 청구하나요?", "세금계산서 발급 의무가 있는 간이과세자(직전 연도 공급대가 4,800만 원 이상 등)는 세금계산서에 10% 부가세를 기재해 발급할 수 있습니다. 반면 세금계산서 발급 불가 간이과세자(4,800만 원 미만)는 현금영수증·영수증으로 거래하며 별도 10% 부가세를 청구하지 않는 것이 일반적입니다."),
            ("프리랜서(인적용역)도 부가세 10%를 받나요?", "사업자등록이 없는 개인 프리랜서는 부가가치세 과세 대상이 아니므로 부가세 10%를 받지 않으며, 대신 지급 총액에서 사업소득세 3% + 지방소득세 0.3% = 총 3.3%를 원천징수한 금액을 수령합니다."),
            ("부가세 신고 및 납부 기간은 언제인가요?", "개인 일반과세자는 1년에 2회(1기: 7월 25일까지, 2기: 다음 해 1월 25일까지), 법인사업자는 분기별 4회(4월·7월·10월·다음 해 1월 25일까지), 간이과세자는 연 1회(다음 해 1월 25일까지) 신고·납부합니다."),
            ("세금계산서 발행 시 1원 오차가 나면 어떻게 하나요?", "공급가액을 먼저 반올림해 확정한 뒤 '합계금액 − 공급가액 = 세액' 방식으로 맞추면 총액과 정확히 일치합니다. 본 계산기도 동일한 방식으로 1원 오차 없이 계산합니다."),
            ("계산한 금액을 바로 견적서나 거래명세서에 넣을 수 있나요?", "네, 우측 하단의 '견적서 작성' 또는 '거래명세서 작성' 버튼을 누르면 품목별 부가세 별도/포함/면세 자동 계산과 회사 직인 날인까지 한 번에 완료해 A4 PDF로 저장할 수 있습니다."),
        ],
    },
    {
        "key": "annual-leave",
        "slug": "annual-leave",
        "path": "/calc/annual-leave/",
        "short_name": "연차 계산기",
        "icon": "연",
        "tag": "2026 근로기준법",
        "title": "연차 계산기 (입사일·회계연도 기준 · 미사용 연차수당 자동계산)",
        "h1": "무료 연차 · 연차수당 계산기",
        "subtitle": "입사일만 입력하면 근로기준법 제60조 기준 발생 연차(1년 미만 월차 ~ 최대 25일)와 연차별 발생 이력, 퇴사 시 미사용 연차수당 예상액까지 자동으로 계산합니다.",
        "description": "입사일 기준 및 회계연도(1월 1일) 기준 연차유급휴가 일수를 자동으로 계산해 보세요. 1년 미만 월차 최대 11일, 3년차 이상 가산 연차, 퇴사 시 미사용 연차수당 계산과 사직서·근로계약서 연동을 지원합니다.",
        "keywords": "연차 계산기, 연차수당 계산기, 입사일 기준 연차, 회계연도 연차 계산, 1년 미만 연차, 미사용 연차수당",
        "card_desc": "입사일·회계연도 기준 발생 연차와 근속연차별 표, 미사용 연차수당 예상액까지 즉시 계산합니다.",
        "card_features": ["입사일 기준 / 회계연도 기준 전환", "1년 미만 월차~최대 25일 연도별 표", "퇴사 시 미사용 연차수당 예상 계산"],
        "related_forms": [
            ("/sajikseo/", "무료 사직서 양식 작성 →"),
            ("/geunro/", "무료 표준근로계약서 작성 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="annualCalcApp">
          <div class="calc-card">
            <div class="calc-mode-tabs" role="tablist" aria-label="연차 산정 기준">
              <button type="button" class="calc-mode-btn active" data-al-basis="join">입사일 기준 (법정 원칙)</button>
              <button type="button" class="calc-mode-btn" data-al-basis="fiscal">회계연도 (1월 1일) 기준</button>
            </div>

            <div class="field" style="margin-bottom:12px;">
              <label>재직 상태 선택 (1년 경계 정확 계산)</label>
              <div class="calc-mode-tabs" role="tablist" aria-label="재직 상태 선택" style="margin-bottom:0;">
                <button type="button" class="calc-mode-btn active" data-al-status="active">재직 중 (오늘/조회일 기준)</button>
                <button type="button" class="calc-mode-btn" data-al-status="retired">퇴직 예정 · 퇴사 정산</button>
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="alJoinDate">입사일</label>
                <input type="date" id="alJoinDate">
              </div>
              <div class="field">
                <label for="alBaseDate" id="alBaseDateLabel">계산 기준일 (재직 중 · 오늘/조회일)</label>
                <input type="date" id="alBaseDate">
              </div>
            </div>

            <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;">

            <div class="field-row">
              <div class="field">
                <label for="alMonthlyWage">월 통상임금 (선택, 원)</label>
                <input type="number" id="alMonthlyWage" min="0" step="10000" value="3000000" placeholder="예: 3000000">
              </div>
              <div class="field">
                <label for="alUnusedDays">미사용 잔여 연차 (일)</label>
                <input type="number" id="alUnusedDays" min="0" max="40" step="0.5" value="5" placeholder="예: 5">
              </div>
            </div>
            <p class="field-help" style="margin:0;">1일 통상임금 = 월 통상임금 ÷ 209시간 × 8시간 (주 40시간 기준 참고치)</p>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label" id="alHeroLabel">기준일 현재 발생 연차유급휴가</div>
              <div class="calc-result-main" id="alHeroVal">총 15일</div>
              <div class="calc-result-sub" id="alHeroSub">근속연차 기준 산정</div>
            </div>

            <div class="calc-breakdown-grid">
              <div class="calc-stat-box">
                <div class="lbl">총 재직기간</div>
                <div class="val" id="alTenureVal">-</div>
                <div class="sub">입사일 ~ 기준일</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">인정 연차 일수</div>
                <div class="val" id="alYearDaysVal">-</div>
                <div class="sub">80% 이상 출근 가정</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">미사용 연차수당 예상</div>
                <div class="val" id="alPayVal">0원</div>
                <div class="sub">세전 예상 정산액</div>
              </div>
            </div>

            <div id="alStatusAlert" class="guide-callout warn" style="display:none;margin:0 0 12px;font-size:13px;"></div>
            <p id="alFiscalNote" class="field-help" style="margin:0 0 10px;"></p>

            <div class="calc-table-wrap">
              <table class="guide-table" style="margin:0 0 14px;font-size:13px;">
                <thead>
                  <tr><th>구분</th><th>발생 시점</th><th>발생 일수</th><th>비고</th></tr>
                </thead>
                <tbody id="alTableBody"></tbody>
              </table>
            </div>

            <div class="calc-cta-box">
              <div>
                <strong>퇴사·입사 서류도 바로 준비하세요</strong>
                <span>연차 정산 후 사직서 작성이나 신규 근로계약서 작성을 무료로 진행할 수 있습니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/sajikseo/" class="btn btn-primary btn-sm">사직서 작성 →</a>
                <a href="/geunro/" class="btn btn-outline btn-sm">근로계약서 작성 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>근로기준법 제60조 연차유급휴가 발생 원리 완벽 정리</h2>
<p>연차유급휴가는 <strong>상시 근로자 5인 이상 사업장</strong>에서 1주 소정근로시간이 15시간 이상인 근로자에게 법적으로 보장되는 유급 휴가입니다. 입사 1년 미만 신입사원부터 20년 이상 장기 근속자까지 연차 계산 공식과 퇴사 시 정산 주의사항을 실생활 예시로 쉽게 정리했습니다.</p>

<h3>1. 근속연수별 법정 연차 일수 표 (입사일 기준)</h3>
<table class="guide-table">
  <thead>
    <tr><th style="width:26%">재직 기간</th><th style="width:22%">발생 연차</th><th>적용 조건</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>1년 미만 (1년차)</strong></td><td><strong>최대 11일</strong></td><td>1개월 개근 시 1일씩 발생 (입사일로부터 1년 내 사용)</td></tr>
    <tr><td><strong>만 1년 ~ 2년 (2~3년차)</strong></td><td><strong>15일</strong></td><td>전년도 1년간 80% 이상 출근 시 발생</td></tr>
    <tr><td><strong>만 3년 ~ 4년 (4~5년차)</strong></td><td><strong>16일</strong></td><td>최초 1년을 초과하는 계속 근로 매 2년마다 1일 가산</td></tr>
    <tr><td><strong>만 5년 ~ 6년 (6~7년차)</strong></td><td><strong>17일</strong></td><td>매 2년마다 +1일 가산</td></tr>
    <tr><td><strong>만 21년 이상</strong></td><td><strong>최대 25일</strong></td><td>법정 상한 25일</td></tr>
  </tbody>
</table>

<h3>2. 실생활 예시: 2025년 3월 2일 입사자가 2026년 3월 2일에 퇴사하면?</h3>
<ul>
  <li><strong>2025.03.02 ~ 2026.03.01 (만 1년 근무):</strong> 1년 미만 기간 동안 매월 개근해 발생한 월차 <strong>11일</strong>이 있습니다.</li>
  <li><strong>2026.03.02 퇴사 시 주의 (대법원 판례):</strong> 1년 80% 이상 출근에 따른 15일 연차는 <strong>만 1년을 채우고 그 다음 날(366일째)까지 근로관계가 유지</strong>되어야 발생합니다. 따라서 정확히 만 1년(365일)만 근무하고 계약이 끝나면 11일까지만 인정되고, 366일째 근무 관계가 존재해야 15일이 추가 발생합니다.</li>
</ul>

<h3>3. 입사일 기준 vs 회계연도(1월 1일) 기준, 퇴사 시 어떤 게 유리할까?</h3>
<p>많은 회사가 인사 관리 편의를 위해 매년 1월 1일에 전 직원 연차를 일괄 부여(회계연도 기준)합니다. 하지만 근로기준법 원칙은 <strong>입사일 기준</strong>이므로, 퇴사할 때 회계연도 기준으로 받은 총 연차보다 입사일 기준 법정 연차가 더 많다면 <strong>부족한 일수만큼 추가로 연차수당을 청구</strong>할 수 있습니다.</p>

<div class="guide-callout">
  <strong>공식 법령 및 행정해석 근거</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://www.law.go.kr/법령/근로기준법/제60조" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「근로기준법」 제60조(연차 유급휴가)</a></li>
    <li><a href="https://www.moel.go.kr/news/enews/report/enewsView.do?bbs_id=12&news_seq=13052" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 — 1년 기간제·만 1년 퇴직 시 연차유급휴가 변경 행정해석 안내</a></li>
  </ul>
  <p style="margin:8px 0 0;">퇴사 준비 중이라면 <a href="/guide/severance-pay-annual-leave/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">퇴직금·미사용 연차수당 계산법과 14일 이내 미지급 대처 가이드</a> 및 <a href="/sajikseo/" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">무료 사직서 양식 작성기</a>도 함께 확인하세요.</p>
</div>
""",
        "faqs": [
            ("5인 미만 사업장도 법정 연차가 발생하나요?", "아니요. 근로기준법 제60조(연차유급휴가)는 상시 근로자 5인 이상 사업장에 의무 적용됩니다. 5인 미만 사업장은 법정 연차 의무는 없으나 근로계약서에 별도 약정한 경우 그에 따릅니다."),
            ("1년 미만일 때 매월 받은 11일을 쓰면 다음 해 15일에서 차감되나요?", "아니요! 2018년 근로기준법 개정으로 차감 규정이 폐지되어, 1년 미만 월차 최대 11일과 만 1년 완료 후 발생하는 15일은 각각 별개로 보장됩니다(2년간 최대 26일)."),
            ("미사용 연차수당은 어떻게 계산하나요?", "통상적으로 '1일 통상임금 × 미사용 연차 일수'로 계산합니다. 주 40시간 월급제 근로자는 '월 통상임금(기본급 + 고정수당) ÷ 209시간 × 8시간'이 1일 통상임금입니다."),
            ("회사가 연차 촉진제를 시행했는데 못 쓴 연차도 수당을 받을 수 있나요?", "회사가 근로기준법 제61조의 법적 절차(소멸 6개월 전 서면 촉구 + 2개월 전 사용 시기 서면 지정)를 모두 적법하게 이행했다면 금전 보상 의무가 면제됩니다. 반대로 구두 안내만 했거나 절차를 누락했다면 수당을 지급해야 합니다."),
            ("육아휴직이나 출산전후휴가 기간도 출근율에 포함되나요?", "네, 근로기준법상 출산전후휴가·육아휴직·업무상 재해 휴업 기간은 모두 출근한 것으로 간주되어 연차가 정상 발생합니다."),
            ("퇴사 시 미사용 연차수당은 언제까지 받아야 하나요?", "근로기준법 제36조에 따라 퇴직일로부터 14일 이내에 퇴직금·급여와 함께 정산받아야 합니다."),
        ],
    },
    {
        "key": "brokerage",
        "slug": "brokerage",
        "path": "/calc/brokerage/",
        "short_name": "중개수수료 계산기",
        "icon": "복",
        "tag": "2026 상한요율",
        "title": "부동산 중개수수료(복비) 계산기 (주택 매매·전세·월세·오피스텔·상가)",
        "h1": "무료 부동산 중개수수료(복비) 계산기",
        "subtitle": "2026년 공인중개사법 상한요율표와 법정 한도액, 월세 환산보증금(×100 / 5천만 원 미만 ×70 특례), 부가세 10%까지 자동으로 계산합니다.",
        "description": "아파트·빌라 주택 매매, 전세, 월세, 주거용 오피스텔, 상가·토지 부동산 중개수수료(복비)를 2026년 최신 법정 상한요율표 기준으로 즉시 계산하세요. 협의 요율 비교 및 부가세 10% 자동 계산을 지원합니다.",
        "keywords": "중개수수료 계산기, 복비 계산기, 부동산 중개보수 계산기, 전세 복비 계산, 월세 중개수수료 계산, 아파트 매매 복비",
        "card_desc": "주택 매매·전세·월세·오피스텔·상가 법정 상한요율, 한도액, 월세 특례, 부가세 10%를 자동 계산합니다.",
        "card_features": ["월세 5천만 미만 ×70 특례 자동 적용", "구간별 법정 한도액 자동 캡 적용", "일반·간이과세자 부가세 비교"],
        "related_forms": [
            ("/wiimjang/", "부동산 대리 위임장 작성 →"),
            ("/chayongjeung/", "가족간 주택자금 차용증 작성 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="brokerageCalcApp">
          <div class="calc-card">
            <div class="field">
              <label>1. 매물 유형</label>
              <div class="calc-mode-tabs cols-3" role="tablist">
                <button type="button" class="calc-mode-btn active" data-prop-type="house">주택</button>
                <button type="button" class="calc-mode-btn" data-prop-type="officetel">주거 오피스텔</button>
                <button type="button" class="calc-mode-btn" data-prop-type="commercial">상가·토지</button>
              </div>
            </div>

            <div class="field">
              <label>2. 거래 유형</label>
              <div class="calc-mode-tabs cols-3" role="tablist">
                <button type="button" class="calc-mode-btn active" data-deal-type="sale">매매·교환</button>
                <button type="button" class="calc-mode-btn" data-deal-type="jeonse">전세</button>
                <button type="button" class="calc-mode-btn" data-deal-type="monthly">월세</button>
              </div>
            </div>

            <div class="field" id="brkPriceWrap">
              <label for="brkPrice" id="brkPriceLabel">매매가 (만 원 단위 입력)</label>
              <input type="number" id="brkPrice" min="0" step="100" value="50000" placeholder="예: 5억이면 50000 입력">
              <div class="chip-row" style="margin-top:7px;">
                <button type="button" class="chip-btn" data-add-man="1000">+1천만</button>
                <button type="button" class="chip-btn" data-add-man="5000">+5천만</button>
                <button type="button" class="chip-btn" data-add-man="10000">+1억</button>
                <button type="button" class="chip-btn" data-add-man="50000">+5억</button>
                <button type="button" class="chip-btn" data-add-man="0">초기화</button>
              </div>
            </div>

            <div class="field" id="brkMonthlyWrap" style="display:none;">
              <label for="brkMonthlyRent">월세 (만 원 단위 입력)</label>
              <input type="number" id="brkMonthlyRent" min="0" step="5" value="80" placeholder="예: 월세 80만 원이면 80">
            </div>

            <div class="field-row">
              <div class="field">
                <label for="brkCustomRate">협의 요율 (%, 비우면 상한)</label>
                <input type="number" id="brkCustomRate" min="0" max="0.9" step="0.05" placeholder="자동 (법정 상한)">
              </div>
              <div class="field">
                <label for="brkVatType">중개사 과세 유형 (부가세)</label>
                <select id="brkVatType">
                  <option value="general" selected>일반과세자 (부가세 10%)</option>
                  <option value="simplified">간이과세자 (약 4% 참고)</option>
                  <option value="none">부가세 제외 (순수 복비만)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label">예상 총 지불 금액 (중개보수 + 부가세)</div>
              <div class="calc-result-main" id="brkHeroVal">2,200,000원</div>
              <div class="calc-result-sub" id="brkHeroSub">금 이백이십만원정</div>
            </div>

            <div class="calc-breakdown-grid">
              <div class="calc-stat-box">
                <div class="lbl">순수 중개보수 (상한)</div>
                <div class="val" id="brkBaseFee">2,000,000원</div>
                <div class="sub">협의 시 인하 가능</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">부가가치세</div>
                <div class="val" id="brkVatFee">200,000원</div>
                <div class="sub">현금영수증 의무 발급</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">적용 요율</div>
                <div class="val" id="brkRateApplied">0.4%</div>
                <div class="sub">법정 상한 이내</div>
              </div>
            </div>

            <div id="brkRuleNote" class="guide-callout" style="margin:0 0 16px;font-size:13px;"></div>

            <div class="calc-cta-box">
              <div>
                <strong>부동산 계약에 꼭 필요한 무료 서식</strong>
                <span>대리 계약 위임장이나 가족 간 주택자금 차용증도 바로 작성할 수 있습니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/wiimjang/" class="btn btn-primary btn-sm">위임장 작성 →</a>
                <a href="/chayongjeung/" class="btn btn-outline btn-sm">차용증 작성 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>2026년 부동산 중개수수료(복비) 상한요율표 및 절약 팁</h2>
<p>부동산 중개보수(복비)는 「공인중개사법」 및 각 시·도 조례에서 정한 <strong>상한요율(최대 한도)</strong>을 초과해 받을 수 없으며, 실제 수수료는 계약 체결 전 중개사와 의뢰인이 상한요율 이내에서 협의해 결정합니다.</p>

<h3>1. 주택 매매·교환 및 임대차(전세·월세) 상한요율표</h3>
<table class="guide-table">
  <thead>
    <tr><th style="width:32%">거래금액 구간</th><th style="width:34%">매매·교환 (상한 / 한도)</th><th style="width:34%">임대차 전·월세 (상한 / 한도)</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>5천만 원 미만</strong></td><td>0.6% (한도 25만 원)</td><td>0.5% (한도 20만 원)</td></tr>
    <tr><td><strong>5천만 원 ~ 1억 원 미만</strong></td><td>0.5% (한도 80만 원)</td><td>0.4% (한도 30만 원)</td></tr>
    <tr><td><strong>1억 원 ~ 2억 원 미만</strong></td><td>0.5% (한도 80만 원)</td><td>0.3% (한도 없음)</td></tr>
    <tr><td><strong>2억 원 ~ 6억 원 미만</strong></td><td>0.4% (한도 없음)</td><td>0.3% (한도 없음)</td></tr>
    <tr><td><strong>6억 원 ~ 9억 원 미만</strong></td><td>0.4% (한도 없음)</td><td>0.4% (한도 없음)</td></tr>
    <tr><td><strong>9억 원 ~ 12억 원 미만</strong></td><td>0.5% (한도 없음)</td><td>0.4% (한도 없음)</td></tr>
    <tr><td><strong>12억 원 ~ 15억 원 미만</strong></td><td>0.6% (한도 없음)</td><td>0.5% (한도 없음)</td></tr>
    <tr><td><strong>15억 원 이상</strong></td><td>0.7% 이내 협의</td><td>0.6% 이내 협의</td></tr>
  </tbody>
</table>

<h3>2. 월세 환산보증금 계산 예시 (5천만 원 미만 특례 주의!)</h3>
<ul>
  <li><strong>기본 공식:</strong> <code>보증금 + (월세 × 100)</code><br>
  예) 보증금 2,000만 원 / 월세 60만 원 → <code>2,000만 + 6,000만 = 8,000만 원</code> → 5천만~1억 미만 구간(0.4%, 한도 30만 원) 적용 → 최대 복비 <strong>30만 원</strong>(32만 원이 아니라 한도 30만 원 적용!).</li>
  <li><strong>5천만 원 미만 특례:</strong> 기본 공식 결과가 5천만 원 미만이면 <code>보증금 + (월세 × 70)</code>으로 다시 계산합니다.<br>
  예) 보증금 1,000만 원 / 월세 35만 원 → <code>1,000만 + 3,500만 = 4,500만 원</code>(5천만 미만!) → 특례 재계산: <code>1,000만 + (35만 × 70) = 3,450만 원</code> → 0.5% = <strong>172,500원</strong>!</li>
</ul>

<h3>3. 복비 결제 전 반드시 확인할 3가지</h3>
<ol>
  <li><strong>중개대상물 확인·설명서 요율 협의:</strong> 계약서 도장을 찍기 전에 중개보수 요율을 협의하고 확인·설명서에 명시해야 추후 분쟁이 없습니다.</li>
  <li><strong>현금영수증 의무 발급 (소득공제 & 양도세 경비):</strong> 부동산 중개업은 10만 원 이상 현금 거래 시 현금영수증 의무 발급 업종입니다. 매매 복비 영수증은 추후 집을 팔 때 <strong>양도소득세 필요경비</strong>로 공제되므로 반드시 보관하세요.</li>
  <li><strong>간이과세자 부가세 확인:</strong> 간이과세자인 공인중개사는 일반과세자처럼 10%를 그대로 청구할 수 없으므로 사업자등록증 과세유형을 확인하세요.</li>
</ol>

<div class="guide-callout">
  <strong>공식 법령 근거</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://www.law.go.kr/법령/공인중개사법시행규칙" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「공인중개사법 시행규칙」 제20조(중개보수 상한요율)</a></li>
    <li><a href="https://www.molit.go.kr" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국토교통부 — 부동산 중개보수 요율 안내</a></li>
  </ul>
</div>
""",
        "faqs": [
            ("부동산 복비에 부가세 10%는 무조건 내야 하나요?", "공인중개사가 '일반과세자'라면 중개보수의 10%를 부가세로 별도 청구할 수 있습니다. 반면 '간이과세자'는 10%를 청구할 수 없으며(세금계산서 발급 불가 간이과세자는 부가세 별도 청구 관행이 없거나 4% 이내), 계약 전 확인하시는 것이 좋습니다."),
            ("오피스텔은 무조건 주택보다 복비가 비싼가요?", "전용면적 85㎡ 이하이면서 상하수도·전용 입식 부엌·전용 수세식 화장실 및 목욕시설을 갖춘 '주거용 오피스텔'은 매매 0.5%, 임대차 0.4%의 우대 상한요율이 적용됩니다. 이 요건을 충족하지 못하거나 85㎡를 초과하면 0.9% 이내 협의입니다."),
            ("중개수수료는 계약금 낼 때 주나요, 잔금 치를 때 주나요?", "공인중개사법 시행령에 따라 별도 약정이 없으면 '거래대금 지급이 완료된 날(잔금일)'에 지급하는 것이 원칙입니다."),
            ("복비를 현금으로 주면 부가세 10%를 빼주겠다고 하는데 괜찮나요?", "매매 시 현금영수증을 받지 않으면 추후 매도할 때 양도소득세 필요경비(최대 수십~수백만 원 절세 효과)로 인정받지 못해 오히려 손해일 수 있습니다. 임대차도 연말정산 현금영수증 소득공제를 받을 수 있으니 정상 발급받는 것이 유리합니다."),
            ("계약이 중도에 파기되면 복비를 내야 하나요?", "중개사의 고의·과실 없이 매도인·매수인(또는 임대인·임차인)의 단순 변심이나 일방적 사정으로 계약이 해제된 경우, 법적으로 중개보수 청구권은 소멸하지 않습니다."),
            ("가족이 대신 부동산 계약을 진행하거나 부모님께 주택 자금을 빌릴 때 필요한 서류가 있나요?", "대리 계약 시에는 소유자 인감 날인 위임장과 인감증명서가 필요하며, 가족 간 주택 자금 차용 시에는 증여세 방어를 위해 송금 전 차용증을 작성해야 합니다. 바로서식의 무료 위임장·차용증 작성기를 활용해 보세요."),
        ],
    },
    {
        "key": "severance",
        "slug": "severance",
        "path": "/calc/severance/",
        "short_name": "퇴직금 계산기",
        "icon": "퇴",
        "tag": "평균임금·IRP 기준",
        "title": "퇴직금 계산기 (입사일·퇴사일·3개월 급여 자동 계산 · 2026 기준)",
        "h1": "무료 퇴직금 계산기",
        "subtitle": "입사일·퇴사일과 퇴직 전 3개월 급여, 연간 상여금·연차수당을 입력하면 법정 예상 퇴직금과 1일 평균임금을 즉시 계산합니다.",
        "description": "2026년 근로자퇴직급여보장법 기준 무료 퇴직금 계산기입니다. 입사일·퇴직일 재직일수, 퇴직 전 3개월 급여·상여금·연차수당을 반영해 1일 평균임금과 세전 예상 퇴직금을 1초 만에 계산하세요.",
        "keywords": "퇴직금 계산기, 퇴직금 계산 방법, 퇴직금 산정, 평균임금 계산, 퇴직금 IRP, 무료 퇴직금 계산기",
        "card_desc": "재직일수·3개월 급여·상여금·연차수당 반영 예상 퇴직금",
        "card_features": ["재직일수·3개월 평균임금 자동 산출", "상여금·미사용 연차수당 3/12 반영", "사직서·퇴직증명서 바로 연동"],
        "related_forms": [
            ("/sajikseo/", "무료 사직서 양식 작성 →"),
            ("/toejik/", "무료 퇴직증명서 양식 작성 →"),
            ("/gyeongryeok/", "무료 경력증명서 양식 작성 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="sevCalcApp">
          <div class="calc-card">
            <div class="field-row">
              <div class="field">
                <label for="sevJoinDate">입사일</label>
                <input type="date" id="sevJoinDate">
              </div>
              <div class="field">
                <label for="sevLeaveDate">퇴직일 (마지막 근무 다음날)</label>
                <input type="date" id="sevLeaveDate">
              </div>
            </div>
            <div class="field">
              <label for="sevPay3m">퇴직 전 3개월 급여 총액 (세전, 원)</label>
              <input type="number" id="sevPay3m" min="0" step="10000" value="9000000" placeholder="예: 월 300만원 × 3개월 = 9000000">
            </div>
            <div class="field-row">
              <div class="field">
                <label for="sevBonusYear">연간 상여금 총액 (원)</label>
                <input type="number" id="sevBonusYear" min="0" step="10000" value="0">
              </div>
              <div class="field">
                <label for="sevAnnualPay">연간 연차수당 (원)</label>
                <input type="number" id="sevAnnualPay" min="0" step="10000" value="0">
              </div>
            </div>
            <hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">
            <div class="field-row">
              <div class="field">
                <label for="sevOrdinaryDaily">1일 통상임금 (선택, 원)</label>
                <input type="number" id="sevOrdinaryDaily" min="0" step="1000" value="" placeholder="비우면 평균임금만 사용">
              </div>
              <div class="field">
                <label for="sevExcludedDays">3개월 중 제외기간 (선택, 일)</label>
                <input type="number" id="sevExcludedDays" min="0" max="92" step="1" value="0" placeholder="출산휴가·육아휴직 등">
              </div>
            </div>
            <p class="field-help" style="margin:0 0 10px;">출산전후휴가·육아휴직·업무상 재해 휴업 등 제외기간(근로기준법 시행령 제2조)이 있으면 해당 일수를 입력하고, 3개월 급여에서도 해당 기간 임금을 제외해 입력하세요.</p>
            <div class="guide-callout" style="margin:0;font-size:13px;" id="sevRuleNote"></div>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label">세전 예상 법정 퇴직금 (참고치)</div>
              <div class="calc-result-main" id="sevHeroVal">9,000,000원</div>
              <div class="calc-result-sub" id="sevHeroSub">근로자퇴직급여보장법 기준</div>
            </div>
            <div class="calc-breakdown-grid" style="grid-template-columns:repeat(2,1fr);">
              <div class="calc-stat-box">
                <div class="lbl">총 계속근로일수</div>
                <div class="val" id="sevDaysVal">1,095일</div>
                <div class="sub">365일 이상 지급 대상</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">적용 1일 기준임금</div>
                <div class="val" id="sevAvgWageVal">97,826원</div>
                <div class="sub" id="sevAvgWageSub">3개월 총임금 ÷ 3개월 일수</div>
              </div>
            </div>
            <div class="calc-cta-box">
              <div>
                <strong>퇴사 서류와 실업급여도 함께 준비하세요</strong>
                <span>사직서·퇴직증명서 작성과 실업급여 모의계산을 바로 이어갈 수 있습니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/sajikseo/" class="btn btn-primary btn-sm">사직서 작성 →</a>
                <a href="/toejik/" class="btn btn-outline btn-sm">퇴직증명서 →</a>
                <a href="/calc/unemployment/" class="btn btn-outline btn-sm">실업급여 계산 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>법정 퇴직금 계산 공식과 지급 기준 완벽 정리</h2>
<p>「근로자퇴직급여 보장법」에 따라 <strong>계속근로기간이 1년(365일) 이상</strong>이고 <strong>4주 평균 1주 소정근로시간이 15시간 이상</strong>인 근로자는 정규직·계약직·아르바이트 여부와 관계없이 퇴직금을 받을 수 있습니다.</p>

<h3>1. 퇴직금 공식 및 산입 항목</h3>
<ul>
  <li><strong>기본 공식:</strong> <code>1일 평균임금 × 30일 × (총 계속근로일수 ÷ 365)</code></li>
  <li><strong>1일 평균임금:</strong> 퇴직 전 3개월간 지급받은 임금 총액(세전)에 연간 상여금의 3/12 및 직전 연도 미사용 연차수당의 3/12을 더해 3개월 총 일수(89~92일)로 나눈 금액입니다.</li>
  <li><strong>통상임금 하한 보호 (근로기준법 제2조 제2항):</strong> 퇴직 직전 무급휴가나 병가 등으로 1일 평균임금이 1일 통상임금보다 낮아진 경우, <strong>1일 통상임금</strong>을 기준으로 퇴직금을 산정합니다. 위 계산기에서 '1일 통상임금'을 함께 입력하면 자동으로 비교해 더 높은 금액을 적용합니다.</li>
  <li><strong>평균임금 산정 제외기간 (근로기준법 시행령 제2조):</strong> 수습기간, 사용자 귀책 휴업, 출산전후휴가, 육아휴직, 업무상 부상·질병 요양 휴업, 쟁의행위 기간 등은 평균임금 산정 기간과 임금 총액에서 모두 제외합니다. 최근 3개월 전체가 제외기간에 해당하는 등 특수 사례는 고용노동부 공식 계산기로 산정하세요.</li>
</ul>

<h3>2. 퇴직금 지급 기한과 IRP 계좌 이전</h3>
<p>사용자는 퇴직일로부터 <strong>14일 이내</strong>에 퇴직금을 지급해야 합니다. 2022년 4월 이후 퇴직금은 원칙적으로 근로자 본인의 <strong>개인형 퇴직연금(IRP) 계좌</strong>로 이전 지급되며(만 55세 이상, 퇴직금 300만 원 이하 등 예외 있음), 지연 시 연 20%의 지연이자를 청구할 수 있습니다.</p>

<div class="guide-callout">
  <strong>공식 법령 및 정부 계산기 출처</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://www.moel.go.kr/retirementpayCal.do" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 — 공식 퇴직금 계산기</a></li>
    <li><a href="https://www.law.go.kr/법령/근로자퇴직급여보장법" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「근로자퇴직급여 보장법」</a></li>
    <li><a href="https://www.law.go.kr/법령/근로기준법/제2조" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「근로기준법」 제2조(평균임금·통상임금)</a></li>
  </ul>
</div>
""",
        "faqs": [
            ("5인 미만 사업장이나 아르바이트생도 퇴직금을 받을 수 있나요?", "네, 퇴직금은 사업장 규모와 무관하게 1인 이상 모든 사업장에 적용됩니다. 주 15시간 이상 근무하며 1년(365일) 이상 계속 근로했다면 알바생도 법정 퇴직금을 받을 수 있습니다."),
            ("퇴직금에서 세금은 얼마나 공제되나요?", "퇴직소득세는 근속연수공제와 환산급여공제가 크게 적용되어 일반 근로소득세보다 훨씬 낮으며, IRP 계좌로 수령할 경우 연금 수령 전까지 퇴직소득세 원천징수가 이연됩니다."),
            ("퇴직 전 마지막 달에 결근이나 병가가 있으면 퇴직금이 줄어드나요?", "평균임금이 통상임금보다 낮아지면 근로기준법 제2조에 따라 통상임금이 평균임금으로 적용되므로 부당하게 줄어드는 것을 방지합니다."),
            ("퇴사 후 14일이 지났는데 퇴직금을 안 주면 어떻게 하나요?", "당사자 간 지급기일 연장 합의가 없다면 임금체불에 해당하므로 관할 고용노동부에 진정을 제기할 수 있습니다."),
            ("연차수당은 어떤 것이 퇴직금 평균임금에 들어가나요?", "퇴직으로 인해 비로소 발생한 미사용 연차수당은 제외되며, 퇴직 전전년도 출근율로 발생해 퇴직 전 1년간 지급받은 연차수당의 3/12이 평균임금에 산입됩니다."),
        ],
    },
    {
        "key": "unemployment",
        "slug": "unemployment",
        "path": "/calc/unemployment/",
        "short_name": "실업급여 계산기",
        "icon": "실",
        "tag": "2026 상·하한액",
        "title": "실업급여 계산기 (2026 구직급여 1일 수급액 · 총 수급일수 자동계산)",
        "h1": "무료 실업급여(구직급여) 계산기",
        "subtitle": "퇴직 시 연령, 고용보험 가입기간, 월 평균 급여를 입력하면 2026년 기준 1일 구직급여액, 소정급여일수(120~270일), 예상 총 수급액을 바로 계산합니다.",
        "description": "2026년 고용보험법 기준 무료 실업급여 계산기입니다. 만 50세 미만·이상·장애인 기준 소정급여일수(120~270일)와 1일 상·하한액, 월 예상 수령액, 총 수급액을 1초 만에 확인하세요.",
        "keywords": "실업급여 계산기, 2026 실업급여, 구직급여 계산기, 실업급여 조건, 실업급여 금액, 권고사직 실업급여",
        "card_desc": "2026 기준 1일 수급액·소정급여일수·총 예상 수령액",
        "card_features": ["연령·가입기간별 120~270일 자동 산출", "2026 상한액·최저임금 하한액 자동 적용", "사직서·퇴직증명서 바로 연동"],
        "related_forms": [
            ("/sajikseo/", "무료 사직서 양식 작성 →"),
            ("/toejik/", "무료 퇴직증명서 양식 작성 →"),
            ("/calc/severance/", "무료 퇴직금 계산기 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="unempCalcApp">
          <div class="calc-card">
            <div class="field-row">
              <div class="field">
                <label for="ueAgeGroup">퇴사 당시 연령 (만 나이)</label>
                <select id="ueAgeGroup">
                  <option value="under50" selected>만 50세 미만</option>
                  <option value="over50">만 50세 이상 또는 장애인</option>
                </select>
              </div>
              <div class="field">
                <label for="ueInsPeriod">고용보험 총 가입기간</label>
                <select id="ueInsPeriod">
                  <option value="0">1년 미만</option>
                  <option value="1" selected>1년 이상 ~ 3년 미만</option>
                  <option value="3">3년 이상 ~ 5년 미만</option>
                  <option value="5">5년 이상 ~ 10년 미만</option>
                  <option value="10">10년 이상</option>
                </select>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="ueMonthlyWage">퇴직 전 3개월 월평균 급여 (세전, 원)</label>
                <input type="number" id="ueMonthlyWage" min="0" step="50000" value="3200000">
              </div>
              <div class="field">
                <label for="ueDailyHours">1일 소정근로시간</label>
                <select id="ueDailyHours">
                  <option value="8" selected>8시간 (주 40시간 풀타임)</option>
                  <option value="7">7시간</option>
                  <option value="6">6시간</option>
                  <option value="5">5시간</option>
                  <option value="4">4시간 이하 (단시간)</option>
                </select>
              </div>
            </div>
            <div class="guide-callout" style="margin:12px 0 0;font-size:13px;" id="ueRuleNote"></div>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label">예상 총 실업급여 수급액 (2026년 1월 1일 이후 이직자)</div>
              <div class="calc-result-main" id="ueHeroVal">9,907,200원</div>
              <div class="calc-result-sub" id="ueHeroSub">고용보험 구직급여 기준</div>
            </div>
            <div class="calc-breakdown-grid">
              <div class="calc-stat-box">
                <div class="lbl">1일 구직급여액</div>
                <div class="val" id="ueDailyVal">66,048원</div>
                <div class="sub" id="ueDailySub">2026 상한 68,100 / 하한 66,048</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">소정급여일수</div>
                <div class="val" id="ueDaysVal">150일</div>
                <div class="sub">연령·가입기간 기준</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">월 예상 수령액 (30일)</div>
                <div class="val" id="ueMonthVal">약 1,981,440원</div>
                <div class="sub">비과세 수령</div>
              </div>
            </div>
            <div class="calc-cta-box">
              <div>
                <strong>권고사직·계약만료 시 사직서 사유 기재에 주의하세요</strong>
                <span>사직서에 실제 비자발적 퇴사 사유를 명확히 적어야 수급 불이익이 없습니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/sajikseo/" class="btn btn-primary btn-sm">사직서 작성 →</a>
                <a href="/guide/resignation-notice-period/" class="btn btn-outline btn-sm">실업급여 가이드 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>2026년 실업급여(구직급여) 수급 조건 및 상·하한액 기준</h2>
<p>실업급여(구직급여)는 고용보험에 가입된 근로자가 비자발적 사유로 실직한 뒤 재취업 활동을 하는 기간에 소정의 급여를 지급하는 제도입니다. <strong>2026년 1월 1일 이후 이직자</strong>부터 1일 상한액이 7년 만에 <strong>68,100원</strong>으로 인상되었으며, 1일 8시간 소정근로자 기준 하한액은 <strong>66,048원</strong>(2026년 최저시급 10,320원 × 80% × 8시간)입니다.</p>

<table class="guide-table">
  <thead><tr><th style="width:28%">2026년 구직급여 기준</th><th style="width:24%">1일 지급액</th><th>월 30일 환산 / 적용 대상</th></tr></thead>
  <tbody>
    <tr><td><strong>1일 상한액</strong></td><td><strong>68,100원</strong></td><td>월 약 2,043,000원 (2026.01.01 이후 이직자)</td></tr>
    <tr><td><strong>1일 하한액 (8시간)</strong></td><td><strong>66,048원</strong></td><td>월 약 1,981,440원 (단시간 근로자는 소정근로시간 비례)</td></tr>
  </tbody>
</table>

<h3>1. 실업급여 수급 핵심 요건 3가지</h3>
<ol>
  <li><strong>피보험단위기간 180일 이상:</strong> 이직일 이전 18개월(초단시간근로자는 24개월) 동안 유급 근로일수(주휴일 포함)가 통산 180일 이상이어야 합니다.</li>
  <li><strong>비자발적 이직 사유:</strong> 권고사직, 계약기간 만료, 정년퇴직, 폐업·도산, 또는 임금체불·왕복 3시간 이상 통근 곤란 등 고용보험법상 정당한 이직 사유에 해당해야 합니다.</li>
  <li><strong>적극적 재취업 활동:</strong> 근로 의사와 능력을 가지고 고용24(work24.go.kr) 구직등록 및 실업인정 절차를 이행해야 합니다.</li>
</ol>

<h3>2. 연령 및 고용보험 가입기간별 소정급여일수</h3>
<table class="guide-table">
  <thead><tr><th>구분</th><th>1년 미만</th><th>1~3년</th><th>3~5년</th><th>5~10년</th><th>10년 이상</th></tr></thead>
  <tbody>
    <tr><td><strong>만 50세 미만</strong></td><td>120일</td><td>150일</td><td>180일</td><td>210일</td><td>240일</td></tr>
    <tr><td><strong>만 50세 이상 · 장애인</strong></td><td>120일</td><td>180일</td><td>210일</td><td>240일</td><td>270일</td></tr>
  </tbody>
</table>

<div class="guide-callout">
  <strong>공식 법령 및 정부 안내 출처</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://1350.moel.go.kr/rtmview.do?id=1000324861" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 고객상담센터(1350) — 2026년 구직급여 상·하한액 공식 안내</a></li>
    <li><a href="https://www.work24.go.kr" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용24(work24.go.kr) — 실업급여 신청 및 공식 모의계산</a></li>
    <li><a href="https://www.law.go.kr/법령/고용보험법" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「고용보험법」 및 시행령</a></li>
  </ul>
</div>
""",
        "faqs": [
            ("자진 퇴사(일신상의 사유)는 무조건 실업급여를 못 받나요?", "원칙적으로 자발적 이직은 불가하지만, 임금체불(최근 1년 내 2개월 이상), 사업장 이전으로 왕복 3시간 이상 통근 곤란, 질병으로 업무 수행 불가(의사 소견서+사업주 확인서), 직장 내 괴롭힘 등 예외 사유가 입증되면 수급 가능합니다."),
            ("퇴사 후 언제까지 실업급여를 신청해야 하나요?", "구직급여는 퇴직 다음 날로부터 12개월이 지나면 소정급여일수가 남아 있어도 지급이 종료되므로 퇴사 직후 지체 없이 신청하는 것이 유리합니다."),
            ("권고사직인데 사직서에 '일신상의 사유'라고 써달라고 합니다.", "절대 '일신상의 사유'로 적지 마시고 사실 그대로 '회사 경영상 사유에 의한 권고사직'으로 작성한 뒤 사본을 보관하세요."),
            ("이전 직장의 고용보험 가입기간도 합산되나요?", "네, 이전 직장에서 실업급여를 받지 않았고 이직일 전 18개월 이내의 피보험단위기간이라면 이전 직장 일수와 합산하여 180일 요건을 충족할 수 있습니다."),
            ("실업급여에는 소득세가 부과되나요?", "아니요. 구직급여는 비과세 소득이므로 세금 공제 없이 전액 계좌로 수령합니다."),
        ],
    },
    {
        "key": "weekly-holiday",
        "slug": "weekly-holiday",
        "path": "/calc/weekly-holiday/",
        "short_name": "주휴수당 계산기",
        "icon": "주",
        "tag": "2026 최저시급",
        "title": "주휴수당 계산기 (2026 최저시급 10,320원 · 알바 주급·월급 자동계산)",
        "h1": "무료 주휴수당 계산기",
        "subtitle": "시급과 1주 소정근로시간만 입력하면 2026년 최저시급(10,320원) 기준 주휴수당, 주휴 포함 실질 시급, 예상 주급·월급을 즉시 계산합니다.",
        "description": "2026년 최저시급 10,320원 기준 무료 주휴수당 계산기입니다. 아르바이트·파트타임·단시간 근로자의 1주 주휴수당, 주휴 포함 시급, 예상 월급을 1초 만에 계산하고 알바 근로계약서·급여명세서로 바로 연결하세요.",
        "keywords": "주휴수당 계산기, 주휴수당 계산법, 2026 주휴수당, 알바 주휴수당, 주휴수당 포함 시급, 15시간 주휴수당",
        "card_desc": "주 15시간 기준 주휴수당·실질 시급·예상 월급 계산",
        "card_features": ["2026 최저시급 10,320원 자동 점검", "주휴 포함 실질 시급(×1.2) 즉시 산출", "알바 근로계약서·급여명세서 연동"],
        "related_forms": [
            ("/alba-geunro/", "무료 알바 근로계약서 작성 →"),
            ("/geunro/", "무료 표준근로계약서 작성 →"),
            ("/geubyeo/", "무료 급여명세서 작성 →"),
        ],
        "app_html": """
        <div class="calc-grid" id="whCalcApp">
          <div class="calc-card">
            <div class="field">
              <label for="whHourly">약정 시급 (원, 2026 최저시급 10,320원)</label>
              <input type="number" id="whHourly" min="0" step="10" value="10320">
            </div>
            <div class="field">
              <label for="whWeeklyHours">1주 소정근로시간 (휴게시간 제외, 시간)</label>
              <input type="number" id="whWeeklyHours" min="1" max="52" step="0.5" value="20">
            </div>
            <div class="chip-row" style="margin-top:8px;">
              <button type="button" class="chip-btn" data-wh-preset="14">주 14시간 (미대상)</button>
              <button type="button" class="chip-btn" data-wh-preset="15">주 15시간</button>
              <button type="button" class="chip-btn" data-wh-preset="20">주 20시간</button>
              <button type="button" class="chip-btn" data-wh-preset="30">주 30시간</button>
              <button type="button" class="chip-btn" data-wh-preset="40">주 40시간 (풀타임)</button>
            </div>
            <div class="guide-callout" style="margin:12px 0 0;font-size:13px;" id="whRuleNote"></div>
          </div>

          <div class="calc-card">
            <div class="calc-result-hero">
              <div class="calc-result-label">1주 예상 법정 주휴수당</div>
              <div class="calc-result-main" id="whHeroVal">주 41,280원</div>
              <div class="calc-result-sub" id="whHeroSub">주휴시간 4시간 × 시급 10,320원</div>
            </div>
            <div class="calc-breakdown-grid">
              <div class="calc-stat-box">
                <div class="lbl">주휴 포함 1주 총 주급</div>
                <div class="val" id="whWeekBase">247,680원</div>
                <div class="sub">기본 주급 + 주휴수당</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">주휴 포함 실질 시급</div>
                <div class="val" id="whRealHourly">12,384원 / 시간</div>
                <div class="sub">약정 시급 × 1.2배</div>
              </div>
              <div class="calc-stat-box">
                <div class="lbl">월 예상 총 급여 (세전)</div>
                <div class="val" id="whMonthTotal">약 1,076,170원</div>
                <div class="sub">주급 × 4.345주 기준</div>
              </div>
            </div>
            <div class="calc-cta-box">
              <div>
                <strong>계산한 시급과 주휴수당을 계약서에 바로 반영하세요</strong>
                <span>단시간(알바) 근로계약서와 급여명세서를 브라우저에서 바로 작성할 수 있습니다.</span>
              </div>
              <div class="calc-cta-links">
                <a href="/alba-geunro/" class="btn btn-primary btn-sm">알바 근로계약서 →</a>
                <a href="/geubyeo/" class="btn btn-outline btn-sm">급여명세서 →</a>
              </div>
            </div>
          </div>
        </div>
        """,
        "guide_html": """
<h2>2026년 주휴수당 발생 조건과 계산 공식 완벽 정리</h2>
<p>주휴수당은 「근로기준법」 제55조에 따라 1주 동안 소정근로일을 개근한 근로자에게 유급 주휴일 1일분의 임금을 추가로 지급하는 법정 수당입니다. <strong>5인 미만 사업장 및 아르바이트·단시간 근로자에게도 동일하게 적용</strong>됩니다.</p>

<h3>1. 주휴수당 지급 필수 조건 2가지</h3>
<ul>
  <li><strong>1주 소정근로시간 15시간 이상:</strong> 근로계약서에 약정한 1주 근로시간(휴게시간 제외)이 15시간 이상이어야 합니다.</li>
  <li><strong>소정근로일 개근:</strong> 약속된 출근일에 결근하지 않고 모두 출근해야 합니다. (지각·조퇴는 결근이 아니므로 주휴수당이 발생합니다.)</li>
</ul>

<h3>2. 주휴수당 공식 및 2026년 최저시급 예시</h3>
<p><code>주휴수당 = (1주 소정근로시간 ÷ 40) × 8 × 시급</code> (최대 주 40시간 기준 8시간 한도)</p>
<table class="guide-table">
  <thead><tr><th>1주 근로시간</th><th>주휴시간</th><th>2026 최저시급(10,320원) 주휴수당</th><th>주휴 포함 주급</th></tr></thead>
  <tbody>
    <tr><td>주 15시간</td><td>3시간</td><td>30,960원</td><td>185,760원</td></tr>
    <tr><td>주 20시간</td><td>4시간</td><td>41,280원</td><td>247,680원</td></tr>
    <tr><td>주 30시간</td><td>6시간</td><td>61,920원</td><td>371,520원</td></tr>
    <tr><td>주 40시간</td><td>8시간</td><td>82,560원</td><td>495,360원</td></tr>
  </tbody>
</table>

<div class="guide-callout">
  <strong>공식 법령 및 고시 근거</strong>
  <ul style="margin:6px 0 0;padding-left:18px;">
    <li><a href="https://www.law.go.kr/법령/근로기준법/제55조" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">국가법령정보센터 — 「근로기준법」 제55조(휴일)</a></li>
    <li><a href="https://www.minimumwage.go.kr" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">최저임금위원회 — 2026년 최저임금(시간급 10,320원) 공식 고시</a></li>
  </ul>
</div>
""",
        "faqs": [
            ("5인 미만 작은 카페나 편의점 알바도 주휴수당을 받나요?", "네, 주휴수당은 근로기준법상 상시근로자 수와 무관하게 1인 이상 모든 사업장에 의무 적용됩니다."),
            ("지각이나 조퇴를 한 번 하면 그 주 주휴수당이 사라지나요?", "아니요. 지각·조퇴는 출근 자체를 한 것이므로 결근이 아니며, 소정근로일을 개근한 것으로 보아 주휴수당이 정상 발생합니다."),
            ("퇴사하는 마지막 주에도 주휴수당을 받을 수 있나요?", "대법원 및 고용노동부 변경 행정해석에 따라 1주간 소정근로일을 개근하고 그 주를 마친 뒤 퇴직하는 경우(일주일 근로관계 유지) 마지막 주 주휴수당도 지급 대상입니다."),
            ("연장근로를 해서 15시간을 넘긴 경우에도 주휴수당이 나오나요?", "주휴수당 기준은 실제 연장근로시간이 아니라 근로계약상 약정된 '소정근로시간' 기준입니다. 다만 상습적으로 주 15시간 이상 근무하는 경우 실질 소정근로시간으로 인정받을 수 있습니다."),
            ("주 40시간을 넘겨 45시간 일하면 주휴시간도 9시간이 되나요?", "아니요. 주휴시간은 법정 근로시간 한도인 주 40시간 기준 최대 8시간까지만 인정되며, 40시간 초과분은 연장근로수당(5인 이상 사업장 1.5배)으로 정산됩니다."),
        ],
    },
]

CALC_MAP = {c["key"]: c for c in CALCULATORS}
