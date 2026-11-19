/* ==========================================================================
   바로서식 (BaroDoc) — Additional 5 High-Demand Korean Official Forms
   8. 경력증명서 (gyeongryeok)
   9. 영수증 (yeongsujeung)
   10. 지출결의서 (jichul)
   11. 경위서·시말서 (simal)
   12. 합의서 (habuiseo)
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;

  function valOrEmpty(v, placeholder) {
    if (v && String(v).trim()) return U.escapeHtml(v);
    return `<span class="doc-empty">${U.escapeHtml(placeholder || '')}</span>`;
  }

  function bindInputs(container, state, api) {
    container.querySelectorAll('[data-field]').forEach((el) => {
      const key = el.getAttribute('data-field');
      const rerender = el.getAttribute('data-rerender') === 'true';
      const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        const val = el.type === 'checkbox' ? el.checked : el.value;
        api.updateField(key, val, { rerenderEditor: rerender });
      });
    });
  }

  function makeCompanyStampName(companyName, fallback) {
    if (!companyName) return fallback;
    const core = String(companyName).replace(/주식회사|\(주\)|유한회사|\s+/g, '');
    return (core.slice(0, 8) || fallback.replace(/인$/, '')) + '인';
  }

  /* ========================================================================
     8. 경력증명서 (gyeongryeok)
     ======================================================================== */
  F.register('gyeongryeok', {
    stampSlots: [{ key: 'company', label: '회사 직인 / 대표이사 인', defaultName: '바로서식대표인', defaultShape: 'square', sizeMm: 21 }],
    defaultStampMm: 21,
    getSuggestedStampName: (s) => makeCompanyStampName(s.companyName, '바로서식대표인'),
    getInitialData: () => ({
      docNo: '제 2026-001 호',
      name: '',
      residentId: '',
      maskId: true,
      address: '',
      department: '',
      position: '',
      joinDate: '2022-03-02',
      leaveDate: U.todayISO(),
      duties: '',
      purpose: '이직 회사 제출용',
      companyName: '',
      bizNo: '',
      ceoName: '',
      companyPhone: '',
      companyAddress: '',
      issueDate: U.todayISO(),
    }),
    getSampleData: () => ({
      docNo: '제 2026-204 호',
      name: '김도현',
      residentId: '910420-1234567',
      maskId: true,
      address: '서울특별시 송파구 백제고분로 120, 405호',
      department: '프로덕트개발본부',
      position: '선임연구원 (과장)',
      joinDate: '2022-03-02',
      leaveDate: '2026-10-31',
      duties: '1. 웹 서비스 프론트엔드·백엔드 설계 및 운영\n2. 신규 결제 시스템 구축 프로젝트 리딩\n3. 주니어 개발자 코드 리뷰 및 기술 문서 관리',
      purpose: '이직 회사 경력 증빙 제출용',
      companyName: '주식회사 바로테크',
      bizNo: '214-88-54321',
      ceoName: '이대표',
      companyPhone: '02-555-9876',
      companyAddress: '서울특별시 강남구 테헤란로 310, 9층',
      issueDate: U.todayISO(),
    }),
    renderEditor: (container, s, api) => {
      const tenure = U.calcTenure(s.joinDate, s.leaveDate);
      const purposes = ['이직 회사 제출용', '국가자격증 응시용', '관공서 제출용', '대학원·교육기관 제출용'];
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 인적사항</div>
          <div class="field-row">
            <div class="field"><label>문서번호</label><input type="text" data-field="docNo" value="${U.escapeHtml(s.docNo)}"></div>
            <div class="field"><label>성명</label><input type="text" data-field="name" value="${U.escapeHtml(s.name)}" placeholder="예: 홍길동"></div>
          </div>
          <div class="field">
            <label>주민등록번호 (또는 생년월일)</label>
            <input type="text" data-field="residentId" value="${U.escapeHtml(s.residentId)}" placeholder="910420-1******">
            <label class="checkbox-row" style="margin-top:6px;font-size:12.5px;">
              <input type="checkbox" data-field="maskId" ${s.maskId ? 'checked' : ''}> 주민등록번호 뒷자리 자동 마스킹
            </label>
          </div>
          <div class="field"><label>현주소</label><input type="text" data-field="address" value="${U.escapeHtml(s.address)}" placeholder="도로명 주소"></div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 경력 사항 및 담당 업무</div>
          <div class="field-row">
            <div class="field"><label>최종 소속(부서)</label><input type="text" data-field="department" value="${U.escapeHtml(s.department)}" placeholder="개발팀"></div>
            <div class="field"><label>최종 직위</label><input type="text" data-field="position" value="${U.escapeHtml(s.position)}" placeholder="과장"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>입사일</label><input type="date" data-field="joinDate" data-rerender="true" value="${U.escapeHtml(s.joinDate)}"></div>
            <div class="field"><label>퇴사일</label><input type="date" data-field="leaveDate" data-rerender="true" value="${U.escapeHtml(s.leaveDate)}"></div>
          </div>
          ${tenure ? `<div class="field-converted">자동 계산된 경력기간: <strong>${U.escapeHtml(tenure)}</strong></div>` : ''}
          <div class="field" style="margin-top:10px;">
            <label>주요 담당 업무</label>
            <textarea data-field="duties" placeholder="수행했던 핵심 업무와 역할을 구체적으로 기재하세요.">${U.escapeHtml(s.duties)}</textarea>
          </div>
          <div class="field">
            <label>발급 용도</label>
            <div class="chip-row">${purposes.map((p) => `<button type="button" class="chip-btn" data-chip-purpose="${U.escapeHtml(p)}">${U.escapeHtml(p)}</button>`).join('')}</div>
            <input type="text" data-field="purpose" value="${U.escapeHtml(s.purpose)}">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 발급 회사 정보</div>
          <div class="field-row">
            <div class="field"><label>회사명</label><input type="text" data-field="companyName" value="${U.escapeHtml(s.companyName)}" placeholder="주식회사 바로테크"></div>
            <div class="field"><label>대표자 성명</label><input type="text" data-field="ceoName" value="${U.escapeHtml(s.ceoName)}" placeholder="대표자명"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>사업자등록번호</label><input type="text" data-field="bizNo" value="${U.escapeHtml(s.bizNo)}" placeholder="000-00-00000"></div>
            <div class="field"><label>회사 연락처</label><input type="tel" data-field="companyPhone" value="${U.escapeHtml(s.companyPhone)}" placeholder="02-000-0000"></div>
          </div>
          <div class="field"><label>회사 주소</label><input type="text" data-field="companyAddress" value="${U.escapeHtml(s.companyAddress)}"></div>
          <div class="field"><label>발급일자</label><input type="date" data-field="issueDate" value="${U.escapeHtml(s.issueDate)}"></div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-chip-purpose]').forEach((btn) => {
        btn.addEventListener('click', () => api.updateField('purpose', btn.getAttribute('data-chip-purpose'), { rerenderEditor: true }));
      });
    },
    renderA4: (s, ctx) => {
      const displayId = U.maskResidentId(s.residentId, s.maskId);
      const tenure = U.calcTenure(s.joinDate, s.leaveDate);
      const periodText = s.joinDate
        ? `${U.formatKoreanDate(s.joinDate)} ~ ${U.formatKoreanDate(s.leaveDate)}${tenure ? ` (${tenure})` : ''}`
        : '<span class="doc-empty">입사일 ~ 퇴사일</span>';
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:14mm;">
          <div class="cert-frame">
            <div style="font-size:9.5pt;color:#333;margin-bottom:4mm;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div>
            <h2 class="doc-title" style="margin-bottom:8mm;">경 력 증 명 서</h2>

            <table class="doc-table thick-outer">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr><th>성 명</th><td class="bold">${valOrEmpty(s.name, '성명')}</td><th>주민등록번호</th><td>${valOrEmpty(displayId, '')}</td></tr>
              <tr><th>현 주 소</th><td colspan="3">${valOrEmpty(s.address, '현주소')}</td></tr>
            </table>

            <table class="doc-table thick-outer">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr><th>최종 소속</th><td>${valOrEmpty(s.department, '부서명')}</td><th>최종 직위</th><td>${valOrEmpty(s.position, '직위')}</td></tr>
              <tr><th>근무 기간</th><td colspan="3" class="bold">${periodText}</td></tr>
              <tr>
                <th>담당 업무</th>
                <td colspan="3" style="min-height:36mm;vertical-align:top;padding-top:3.5mm;line-height:1.7;">
                  ${s.duties ? U.escapeHtmlWithBr(s.duties) : '<span class="doc-empty">주요 담당 업무 내용 기재</span>'}
                </td>
              </tr>
              <tr><th>발급 용도</th><td colspan="3">${valOrEmpty(s.purpose, '제출 용도')}</td></tr>
            </table>

            <table class="doc-table">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr><th>회 사 명</th><td class="bold">${valOrEmpty(s.companyName, '회사명')}</td><th>사업자번호</th><td>${valOrEmpty(s.bizNo, '')}</td></tr>
              <tr><th>대 표 자</th><td>${valOrEmpty(s.ceoName, '')}</td><th>전화번호</th><td>${valOrEmpty(s.companyPhone, '')}</td></tr>
              <tr><th>소 재 지</th><td colspan="3">${valOrEmpty(s.companyAddress, '회사 소재지')}</td></tr>
            </table>

            <div class="doc-statement" style="margin:7mm 0 5mm;">위 사람은 당사에서 상기와 같이 근무하였음을 증명합니다.</div>

            <div class="doc-sign-block" style="text-align:center;">
              <div class="doc-date">${U.formatKoreanDate(s.issueDate)}</div>
              <div style="font-size:13pt;font-weight:800;margin-top:5mm;display:inline-flex;align-items:center;gap:4mm;">
                <span>${valOrEmpty(s.companyName, '주식회사 ○○○')}</span>
                <span>대표이사 ${valOrEmpty(s.ceoName, '○○○')}</span>
                ${ctx.renderStamp('company', '(직인)')}
              </div>
            </div>
          </div>
        </div>
      `;
    },
  });

  /* ========================================================================
     9. 영수증 (yeongsujeung)
     ======================================================================== */
  F.register('yeongsujeung', {
    stampSlots: [{ key: 'issuer', label: '발행인 (영수인) 도장', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 18 }],
    getSuggestedStampName: (s) => (s.issuerName ? makeCompanyStampName(s.issuerName, '홍길동') : '홍길동'),
    getInitialData: () => ({
      receiptNo: 'R-2026-001',
      payerName: '',
      amount: '500000',
      itemDesc: '',
      payMethod: '계좌이체',
      receiptDate: U.todayISO(),
      issuerName: '',
      issuerBizOrId: '',
      issuerPhone: '',
      issuerAddress: '',
      note: '상기 금액을 정히 영수(수령)하였음을 확인합니다.',
    }),
    getSampleData: () => ({
      receiptNo: 'R-2026-1120',
      payerName: '박지민',
      amount: '1500000',
      itemDesc: '서울시 마포구 OO빌라 302호 월세 보증금 계약금',
      payMethod: '계좌이체 (국민은행)',
      receiptDate: U.todayISO(),
      issuerName: '김임대',
      issuerBizOrId: '750312-1******',
      issuerPhone: '010-2233-4455',
      issuerAddress: '서울특별시 마포구 성미산로 55, 101호',
      note: '상기 금액을 정히 영수하였음을 확인합니다. (본 영수증은 대금 수령 확인용이며 세금계산서를 대체하지 않습니다.)',
    }),
    onFieldUpdated: (container, s, field) => {
      if (field === 'amount') {
        const box = container.querySelector('#rcpConvertedBox');
        if (box) {
          const amt = U.parseNumber(s.amount);
          box.innerHTML = `<div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div><div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>`;
        }
      }
    },
    renderEditor: (container, s, api) => {
      const amt = U.parseNumber(s.amount);
      const methods = ['계좌이체', '현금 수령', '카드 결제', '수표'];
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 영수 금액 및 내역</div>
          <div class="field-row">
            <div class="field"><label>영수증 번호</label><input type="text" data-field="receiptNo" value="${U.escapeHtml(s.receiptNo)}"></div>
            <div class="field"><label>영수일자</label><input type="date" data-field="receiptDate" value="${U.escapeHtml(s.receiptDate)}"></div>
          </div>
          <div class="field"><label>지급인 (돈을 낸 분 / 귀하)</label><input type="text" data-field="payerName" value="${U.escapeHtml(s.payerName)}" placeholder="예: 박지민 귀하"></div>
          <div class="field">
            <label>영수 금액 (숫자 입력, 원)</label>
            <input type="number" min="0" step="1000" data-field="amount" value="${U.escapeHtml(s.amount)}">
            <div id="rcpConvertedBox" class="field-converted">
              <div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div>
              <div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
            </div>
          </div>
          <div class="field">
            <label>결제 수단</label>
            <div class="chip-row">${methods.map((m) => `<button type="button" class="chip-btn" data-chip-pay="${U.escapeHtml(m)}">${U.escapeHtml(m)}</button>`).join('')}</div>
            <input type="text" data-field="payMethod" value="${U.escapeHtml(s.payMethod)}">
          </div>
          <div class="field"><label>내역 (용도 / 품목)</label><textarea data-field="itemDesc" placeholder="예: 계약금, 물품 대금, 용역비 등">${U.escapeHtml(s.itemDesc)}</textarea></div>
          <div class="field"><label>비고</label><textarea data-field="note">${U.escapeHtml(s.note)}</textarea></div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 발행인 (돈을 받은 분 / 영수인)</div>
          <div class="field-row">
            <div class="field"><label>성명 또는 상호</label><input type="text" data-field="issuerName" value="${U.escapeHtml(s.issuerName)}" placeholder="발행인 성명/상호"></div>
            <div class="field"><label>사업자번호 / 생년월일</label><input type="text" data-field="issuerBizOrId" value="${U.escapeHtml(s.issuerBizOrId)}" placeholder="선택 입력"></div>
          </div>
          <div class="field"><label>연락처</label><input type="tel" data-field="issuerPhone" value="${U.escapeHtml(s.issuerPhone)}" placeholder="010-0000-0000"></div>
          <div class="field"><label>주소</label><input type="text" data-field="issuerAddress" value="${U.escapeHtml(s.issuerAddress)}" placeholder="도로명 주소"></div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-chip-pay]').forEach((btn) => {
        btn.addEventListener('click', () => api.updateField('payMethod', btn.getAttribute('data-chip-pay'), { rerenderEditor: true }));
      });
    },
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
          <div class="cert-frame">
            <div style="display:flex;justify-content:space-between;font-size:9.5pt;color:#444;margin-bottom:5mm;">
              <span>No. ${U.escapeHtml(s.receiptNo || '')}</span>
              <span>영수일자 : ${U.formatKoreanDate(s.receiptDate)}</span>
            </div>
            <h2 class="doc-title" style="margin-bottom:8mm;">영 수 증</h2>

            <div class="biz-recipient-line" style="margin-bottom:6mm;">
              <span>${valOrEmpty(s.payerName, '지급인 성명/상호')}</span>
              <span style="font-size:11pt;font-weight:700;">귀하</span>
            </div>

            <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:2mm;padding:4.5mm 5mm;margin-bottom:6mm;">
              <div style="display:flex;width:100%;justify-content:space-between;align-items:center;">
                <span class="biz-total-label">영수 금액</span>
                <span class="biz-total-number" style="font-size:15pt;">₩ ${U.formatNumber(amt)} 원</span>
              </div>
              <div style="font-size:10.5pt;font-weight:700;color:#111;">
                ${U.escapeHtml(U.formatKoreanCurrency(amt))} &nbsp;/&nbsp; ${U.escapeHtml(U.formatHanjaCurrency(amt))}
              </div>
            </div>

            <table class="doc-table thick-outer">
              <colgroup><col style="width:24%"><col style="width:76%"></colgroup>
              <tr><th>결 제 수 단</th><td>${valOrEmpty(s.payMethod, '계좌이체 / 현금')}</td></tr>
              <tr>
                <th>영 수 내 역</th>
                <td style="min-height:36mm;vertical-align:top;padding-top:4mm;line-height:1.7;">
                  ${s.itemDesc ? U.escapeHtmlWithBr(s.itemDesc) : '<span class="doc-empty">수령한 대금의 구체적 용도 및 내역</span>'}
                </td>
              </tr>
              <tr><th>비 고</th><td style="line-height:1.6;">${U.escapeHtmlWithBr(s.note || '')}</td></tr>
            </table>

            <div class="doc-statement" style="margin:8mm 0 6mm;">위 금액을 정히 영수하였습니다.</div>

            <div class="doc-sign-block">
              <div class="doc-date">${U.formatKoreanDate(s.receiptDate)}</div>
              <table class="doc-table thick-outer" style="margin-top:4mm;">
                <colgroup><col style="width:20%"><col style="width:32%"><col style="width:20%"><col style="width:28%"></colgroup>
                <tr>
                  <th>영 수 인</th>
                  <td class="bold">${valOrEmpty(s.issuerName, '발행인 성명/상호')}</td>
                  <th>사업자/생년</th>
                  <td>${valOrEmpty(s.issuerBizOrId, '')}</td>
                </tr>
                <tr>
                  <th>연 락 처</th>
                  <td>${valOrEmpty(s.issuerPhone, '')}</td>
                  <th>서명 / 날인</th>
                  <td class="center">${ctx.renderStamp('issuer', '(인)')}</td>
                </tr>
                <tr>
                  <th>주 소</th>
                  <td colspan="3">${valOrEmpty(s.issuerAddress, '')}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `;
    },
  });

  /* ========================================================================
     10. 지출결의서 (jichul)
     ======================================================================== */
  F.register('jichul', {
    stampSlots: [{ key: 'drafter', label: '기안자 (작성자) 도장', defaultName: '김담당', defaultShape: 'circle', sizeMm: 16 }],
    getSuggestedStampName: (s) => s.drafterName || '김담당',
    getInitialData: () => ({
      docNo: 'EXP-2026-001',
      draftDate: U.todayISO(),
      department: '',
      drafterName: '',
      title: '',
      payMethod: '법인카드',
      bankAccount: '',
      items: [
        { date: U.todayISO(), category: '교통비', desc: '', amount: 0, note: '' },
        { date: U.todayISO(), category: '식대', desc: '', amount: 0, note: '' },
      ],
      notes: '영수증 및 카드전표 별도 첨부',
    }),
    getSampleData: () => ({
      docNo: 'EXP-2026-1120',
      draftDate: U.todayISO(),
      department: '영업기획팀',
      drafterName: '최유진 대리',
      title: '부산 거래처 미팅 출장 경비 정산',
      payMethod: '개인 선지출 후 계좌이체 정산',
      bankAccount: '신한은행 110-345-678901 (예금주: 최유진)',
      items: [
        { date: U.todayISO(), category: '교통비', desc: '서울-부산 KTX 왕복 승차권', amount: 119600, note: '영수증 첨부' },
        { date: U.todayISO(), category: '숙박비', desc: '출장지 비즈니스 호텔 1박', amount: 115000, note: '카드전표' },
        { date: U.todayISO(), category: '접대비', desc: '거래처 담당자 업무 오찬', amount: 76000, note: '2인' },
        { date: U.todayISO(), category: '교통비', desc: '현지 이동 택시비', amount: 24400, note: '' },
      ],
      notes: '1. 각 항목별 카드 매출전표 및 영수증 사본을 별첨합니다.\n2. 결재 완료 후 상기 개인 계좌로 입금 부탁드립니다.',
    }),
    renderEditor: (container, s, api) => {
      const total = (s.items || []).reduce((acc, it) => acc + Math.max(0, U.parseNumber(it.amount)), 0);
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 기안 기본 정보</div>
          <div class="field-row">
            <div class="field"><label>문서번호</label><input type="text" data-field="docNo" value="${U.escapeHtml(s.docNo)}"></div>
            <div class="field"><label>기안일자</label><input type="date" data-field="draftDate" value="${U.escapeHtml(s.draftDate)}"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>소속 부서</label><input type="text" data-field="department" value="${U.escapeHtml(s.department)}" placeholder="영업기획팀"></div>
            <div class="field"><label>기안자 성명</label><input type="text" data-field="drafterName" value="${U.escapeHtml(s.drafterName)}" placeholder="홍길동 대리"></div>
          </div>
          <div class="field"><label>지출 제목 (건명)</label><input type="text" data-field="title" value="${U.escapeHtml(s.title)}" placeholder="예: 11월 출장 경비 지출 결의"></div>
          <div class="field-row">
            <div class="field"><label>결제 수단</label><input type="text" data-field="payMethod" value="${U.escapeHtml(s.payMethod)}" placeholder="법인카드 / 개인선지출"></div>
            <div class="field"><label>입금 계좌 (선택)</label><input type="text" data-field="bankAccount" value="${U.escapeHtml(s.bankAccount)}" placeholder="정산 계좌"></div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">
            <span>2. 지출 내역 (자동 합계)</span>
            <button type="button" class="btn btn-outline btn-sm" id="addExpBtn">+ 항목 추가</button>
          </div>
          ${(s.items || [])
            .map(
              (it, idx) => `
            <div class="line-item-card">
              <div class="line-item-head">
                <span>내역 #${idx + 1}</span>
                ${s.items.length > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-del-exp="${idx}" style="padding:2px 6px;font-size:11.5px;color:var(--seal-red);">삭제</button>` : ''}
              </div>
              <div class="line-item-grid">
                <input type="date" data-exp-field="date" data-idx="${idx}" value="${U.escapeHtml(it.date)}">
                <input type="text" data-exp-field="category" data-idx="${idx}" value="${U.escapeHtml(it.category)}" placeholder="계정과목 (교통비/식대)">
              </div>
              <div class="line-item-nums">
                <input type="text" data-exp-field="desc" data-idx="${idx}" value="${U.escapeHtml(it.desc)}" placeholder="적요 (상세 내역)" style="grid-column:1 / 3;">
                <input type="number" min="0" step="100" data-exp-field="amount" data-idx="${idx}" value="${U.escapeHtml(it.amount)}" placeholder="금액(원)">
              </div>
            </div>
          `
            )
            .join('')}
          <div class="summary-box" id="expSummaryBox">
            <div class="summary-line total"><span>지출 합계금액</span><strong>${U.formatNumber(total)}원</strong></div>
            <div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(total))}</div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 비고 / 증빙 첨부 안내</div>
          <div class="field"><textarea data-field="notes">${U.escapeHtml(s.notes)}</textarea></div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-exp-field]').forEach((el) => {
        el.addEventListener('input', () => {
          const idx = Number(el.getAttribute('data-idx'));
          const f = el.getAttribute('data-exp-field');
          if (s.items[idx]) {
            s.items[idx][f] = el.value;
            api.setState(s, { rerenderEditor: false });
            const sum = s.items.reduce((a, r) => a + Math.max(0, U.parseNumber(r.amount)), 0);
            const box = container.querySelector('#expSummaryBox');
            if (box) {
              box.innerHTML = `<div class="summary-line total"><span>지출 합계금액</span><strong>${U.formatNumber(sum)}원</strong></div><div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(sum))}</div>`;
            }
          }
        });
      });
      const addBtn = container.querySelector('#addExpBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (s.items.length >= 10) { U.showToast('최대 10개 항목까지 입력할 수 있습니다.'); return; }
          s.items.push({ date: U.todayISO(), category: '', desc: '', amount: 0, note: '' });
          api.rerenderAll();
        });
      }
      container.querySelectorAll('[data-del-exp]').forEach((btn) => {
        btn.addEventListener('click', () => {
          s.items.splice(Number(btn.getAttribute('data-del-exp')), 1);
          api.rerenderAll();
        });
      });
    },
    renderA4: (s, ctx) => {
      const items = s.items || [];
      const total = items.reduce((acc, it) => acc + Math.max(0, U.parseNumber(it.amount)), 0);
      const minRows = Math.max(8, items.length);
      const rows = [];
      for (let i = 0; i < minRows; i++) {
        const r = items[i];
        if (r && (r.desc || r.category || U.parseNumber(r.amount) > 0)) {
          rows.push(`<tr><td class="center">${i + 1}</td><td class="center">${U.escapeHtml(r.date)}</td><td class="center">${U.escapeHtml(r.category)}</td><td>${U.escapeHtml(r.desc)}</td><td class="num bold">${U.formatNumber(r.amount)}</td><td>${U.escapeHtml(r.note)}</td></tr>`);
        } else {
          rows.push(`<tr><td class="center" style="color:#9ca3af;">${i + 1}</td><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`);
        }
      }
      return `
        <div class="a4-sheet ${items.length >= 8 ? 'dense-items' : ''} ${ctx.fontClass}" style="padding:14mm;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
            <div style="flex:1;padding-top:4mm;">
              <h2 class="doc-title compact" style="text-align:left;padding-left:0;margin-bottom:2mm;">지 출 결 의 서</h2>
              <div style="font-size:9.2pt;color:#444;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div>
            </div>
            <table class="doc-table compact thick-outer" style="width:76mm;margin:0;">
              <tr>
                <th rowspan="2" style="width:14%;line-height:1.4;">결<br>재</th>
                <th>담 당</th><th>팀 장</th><th>임 원</th><th>대 표</th>
              </tr>
              <tr>
                <td class="center" style="height:15mm;">${ctx.renderStamp('drafter', '')}</td>
                <td></td><td></td><td></td>
              </tr>
            </table>
          </div>

          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
            <tr><th>기 안 일 자</th><td>${U.formatKoreanDate(s.draftDate)}</td><th>소 속 부 서</th><td>${valOrEmpty(s.department, '소속 부서')}</td></tr>
            <tr><th>기 안 자</th><td class="bold">${valOrEmpty(s.drafterName, '성명')}</td><th>결 제 수 단</th><td>${valOrEmpty(s.payMethod, '')}</td></tr>
            <tr><th>건 명</th><td colspan="3" class="bold">${valOrEmpty(s.title, '지출 제목')}</td></tr>
            ${s.bankAccount ? `<tr><th>정 산 계 좌</th><td colspan="3">${U.escapeHtml(s.bankAccount)}</td></tr>` : ''}
          </table>

          <div class="biz-total-banner">
            <span class="biz-total-label">지출 총액</span>
            <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(total))}</span>
            <span class="biz-total-number">(₩ ${U.formatNumber(total)})</span>
          </div>

          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:6%"><col style="width:16%"><col style="width:15%"><col style="width:35%"><col style="width:16%"><col style="width:12%"></colgroup>
            <thead><tr><th>No</th><th>지출일자</th><th>계정과목</th><th>적 요 (지출 내역)</th><th>금 액</th><th>비 고</th></tr></thead>
            <tbody>${rows.join('')}</tbody>
            <tfoot><tr><th colspan="4">합 계</th><td class="num bold">${U.formatNumber(total)}</td><td></td></tr></tfoot>
          </table>

          <div class="doc-notes-box" style="margin-top:auto;"><strong>[비고 및 첨부 증빙]</strong><div class="doc-notes-body">${U.escapeHtml(s.notes || '')}</div></div>
        </div>
      `;
    },
  });

  /* ========================================================================
     11. 경위서 · 시말서 (simal)
     ======================================================================== */
  F.register('simal', {
    stampSlots: [{ key: 'writer', label: '작성자 도장 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 17 }],
    getSuggestedStampName: (s) => s.name || '홍길동',
    getInitialData: () => ({
      docType: '경위서', // 경위서 | 시말서
      companyName: '',
      department: '',
      position: '',
      name: '',
      incidentDate: U.todayISO(),
      subject: '',
      details: '',
      prevention: '',
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      docType: '경위서',
      companyName: '주식회사 바로솔루션',
      department: '운영지원팀',
      position: '주임',
      name: '정하늘',
      incidentDate: U.todayISO(),
      subject: '거래처 납품 일정 안내 이메일 오발송 건',
      details: '2026년 11월 19일 오후 2시경, 거래처별 납품 일정 안내 메일을 발송하는 과정에서 수신자 확인을 소홀히 하여 A사 일정표가 B사 담당자에게 잘못 발송되었습니다. 즉시 회수 요청 및 사과 연락을 진행하여 추가 피해 없이 수습 완료하였습니다.',
      prevention: '향후 대외 발송 메일은 발송 전 수신자·첨부파일 2차 교차 확인 체크리스트를 적용하고, 예약 발송(3분 지연) 기능을 활성화하여 동일한 실수가 재발하지 않도록 철저히 주의하겠습니다.',
      writtenDate: U.todayISO(),
    }),
    renderEditor: (container, s, api) => {
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 문서 종류 및 작성자 정보</div>
          <div class="field">
            <label>문서 제목 선택</label>
            <select data-field="docType">
              <option value="경위서" ${s.docType === '경위서' ? 'selected' : ''}>경위서 (사실관계 보고 중심)</option>
              <option value="시말서" ${s.docType === '시말서' ? 'selected' : ''}>시말서 (반성 및 재발방지 서약)</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field"><label>회사명 (제출처)</label><input type="text" data-field="companyName" value="${U.escapeHtml(s.companyName)}" placeholder="주식회사 ○○○"></div>
            <div class="field"><label>작성일</label><input type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>소속 부서</label><input type="text" data-field="department" value="${U.escapeHtml(s.department)}" placeholder="부서명"></div>
            <div class="field"><label>직위</label><input type="text" data-field="position" value="${U.escapeHtml(s.position)}" placeholder="직위"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>성명</label><input type="text" data-field="name" value="${U.escapeHtml(s.name)}" placeholder="성명"></div>
            <div class="field"><label>발생일자</label><input type="date" data-field="incidentDate" value="${U.escapeHtml(s.incidentDate)}"></div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 발생 경위 및 재발방지 대책</div>
          <div class="field"><label>건명 (제목)</label><input type="text" data-field="subject" value="${U.escapeHtml(s.subject)}" placeholder="예: 업무 일정 착오 건"></div>
          <div class="field"><label>발생 경위 (육하원칙 중심)</label><textarea style="min-height:110px;" data-field="details" placeholder="언제, 어디서, 무엇이, 어떻게 발생했고 어떻게 조치했는지 객관적으로 작성하세요.">${U.escapeHtml(s.details)}</textarea></div>
          <div class="field"><label>재발방지 대책 및 다짐</label><textarea style="min-height:90px;" data-field="prevention" placeholder="동일한 문제가 재발하지 않도록 구체적인 개선 방안을 작성하세요.">${U.escapeHtml(s.prevention)}</textarea></div>
        </div>
      `;
      bindInputs(container, s, api);
    },
    renderA4: (s, ctx) => {
      const titleSpaced = s.docType === '시말서' ? '시 말 서' : '경 위 서';
      const closing =
        s.docType === '시말서'
          ? '상기 본인은 위와 같은 과실에 대해 깊이 반성하며, 향후 동일한 사례가 재발하지 않도록 성실히 직무에 임할 것을 서약합니다.'
          : '상기 내용이 사실과 틀림없음을 확인하며 이에 경위서를 제출합니다.';
      return `
        <div class="a4-sheet ${ctx.fontClass}">
          <h2 class="doc-title">${titleSpaced}</h2>

          <table class="doc-table thick-outer">
            <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
            <tr><th>소 속</th><td>${valOrEmpty(s.department, '소속 부서')}</td><th>직 위</th><td>${valOrEmpty(s.position, '직위')}</td></tr>
            <tr><th>성 명</th><td class="bold">${valOrEmpty(s.name, '성명')}</td><th>발 생 일 자</th><td>${U.formatKoreanDate(s.incidentDate)}</td></tr>
            <tr><th>건 명</th><td colspan="3" class="bold">${valOrEmpty(s.subject, '사건/업무 건명')}</td></tr>
            <tr>
              <th>발생 경위</th>
              <td colspan="3" style="min-height:66mm;vertical-align:top;padding:4mm;line-height:1.75;">
                ${s.details ? U.escapeHtmlWithBr(s.details) : '<span class="doc-empty">발생 일시, 경위 및 조치 결과를 사실대로 기재하세요.</span>'}
              </td>
            </tr>
            <tr>
              <th>재발방지 대책</th>
              <td colspan="3" style="min-height:40mm;vertical-align:top;padding:4mm;line-height:1.75;">
                ${s.prevention ? U.escapeHtmlWithBr(s.prevention) : '<span class="doc-empty">향후 재발 방지를 위한 구체적인 개선 대책을 기재하세요.</span>'}
              </td>
            </tr>
          </table>

          <div class="doc-statement" style="margin:8mm 0 6mm;">${closing}</div>

          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row">
              <span>작 성 자 :</span>
              <span class="doc-sign-name">${valOrEmpty(s.name, '홍 길 동')}</span>
              ${ctx.renderStamp('writer', '(인)')}
            </div>
            <div class="doc-recipient">${valOrEmpty(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
          </div>
        </div>
      `;
    },
  });

  /* ========================================================================
     12. 합의서 (habuiseo)
     ======================================================================== */
  F.register('habuiseo', {
    stampSlots: [
      { key: 'partyA', label: '갑 (피해자/청구인)', defaultName: '김피해', defaultShape: 'circle', sizeMm: 16 },
      { key: 'partyB', label: '을 (가해자/지급인)', defaultName: '이가해', defaultShape: 'circle', sizeMm: 16 },
    ],
    getSuggestedStampName: (s, slot) => (slot === 'partyA' ? s.partyAName || '김피해' : s.partyBName || '이가해'),
    getInitialData: () => ({
      incidentTitle: '',
      incidentDate: U.todayISO(),
      incidentSummary: '',
      amount: '1000000',
      payDate: U.todayISO(),
      bankAccount: '',
      clauses: '1. 을은 갑에게 위 합의금을 약정 기일까지 지정 계좌로 지급한다.\n2. 갑은 위 합의금을 전액 수령함과 동시에 본 건과 관련한 일체의 민·형사상 이의 제기 및 처벌 불원 의사를 확인한다.\n3. 본 합의서 2부를 작성하여 갑과 을이 서명·날인 후 각 1부씩 보관한다.',
      partyAName: '',
      partyAId: '',
      partyAPhone: '',
      partyAAddress: '',
      partyBName: '',
      partyBId: '',
      partyBPhone: '',
      partyBAddress: '',
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      incidentTitle: '주차장 차량 접촉 사고 물적 피해 합의',
      incidentDate: U.todayISO(),
      incidentSummary: '2026년 11월 19일 서울시 강남구 OO빌딩 지하주차장에서 발생한 을의 차량 후진 중 갑의 차량(12가 3456) 범퍼 접촉 사고와 관련하여 당사자 간 원만히 합의함.',
      amount: '800000',
      payDate: U.todayISO(),
      bankAccount: '우리은행 1002-123-456789 (예금주: 김갑동)',
      clauses: '1. 을은 갑에게 차량 수리비 및 렌트비 일체 명목으로 위 합의금을 합의 당일 지정 계좌로 입금한다.\n2. 갑은 위 합의금을 수령함으로써 본 사고와 관련한 향후 민·형사상 일체의 청구나 이의를 제기하지 아니한다.\n3. 본 합의서를 2부 작성하여 갑과 을이 서명·날인 후 각 1부씩 보관한다.',
      partyAName: '김갑동',
      partyAId: '890512-1******',
      partyAPhone: '010-1111-2222',
      partyAAddress: '서울특별시 강남구 논현로 200, 301호',
      partyBName: '이을수',
      partyBId: '860821-1******',
      partyBPhone: '010-3333-4444',
      partyBAddress: '서울특별시 서초구 반포대로 150, 502호',
      writtenDate: U.todayISO(),
    }),
    onFieldUpdated: (container, s, field) => {
      if (field === 'amount') {
        const box = container.querySelector('#habConvertedBox');
        if (box) {
          const amt = U.parseNumber(s.amount);
          box.innerHTML = `<div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div><div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>`;
        }
      }
    },
    renderEditor: (container, s, api) => {
      const amt = U.parseNumber(s.amount);
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 사건 내용 및 합의금</div>
          <div class="field"><label>합의 건명 (사건명)</label><input type="text" data-field="incidentTitle" value="${U.escapeHtml(s.incidentTitle)}" placeholder="예: 차량 접촉 사고 / 기물 파손 / 금전 정산 합의"></div>
          <div class="field-row">
            <div class="field"><label>사건 발생일</label><input type="date" data-field="incidentDate" value="${U.escapeHtml(s.incidentDate)}"></div>
            <div class="field"><label>합의금 지급기한</label><input type="date" data-field="payDate" value="${U.escapeHtml(s.payDate)}"></div>
          </div>
          <div class="field">
            <label>합의 금액 (숫자 입력, 원 / 무금액 합의면 0)</label>
            <input type="number" min="0" step="10000" data-field="amount" value="${U.escapeHtml(s.amount)}">
            <div id="habConvertedBox" class="field-converted">
              <div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div>
              <div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
            </div>
          </div>
          <div class="field"><label>지급 계좌 (갑 명의 계좌)</label><input type="text" data-field="bankAccount" value="${U.escapeHtml(s.bankAccount)}" placeholder="은행명 계좌번호 (예금주)"></div>
          <div class="field"><label>사건 개요</label><textarea data-field="incidentSummary">${U.escapeHtml(s.incidentSummary)}</textarea></div>
          <div class="field"><label>합의 조항</label><textarea style="min-height:95px;" data-field="clauses">${U.escapeHtml(s.clauses)}</textarea></div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 갑 (피해자 / 합의금 수령인)</div>
          <div class="field-row">
            <div class="field"><label>성명</label><input type="text" data-field="partyAName" value="${U.escapeHtml(s.partyAName)}"></div>
            <div class="field"><label>생년월일/주민번호</label><input type="text" data-field="partyAId" value="${U.escapeHtml(s.partyAId)}"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>연락처</label><input type="tel" data-field="partyAPhone" value="${U.escapeHtml(s.partyAPhone)}"></div>
            <div class="field"><label>합의 작성일</label><input type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}"></div>
          </div>
          <div class="field"><label>주소</label><input type="text" data-field="partyAAddress" value="${U.escapeHtml(s.partyAAddress)}"></div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 을 (가해자 / 합의금 지급인)</div>
          <div class="field-row">
            <div class="field"><label>성명</label><input type="text" data-field="partyBName" value="${U.escapeHtml(s.partyBName)}"></div>
            <div class="field"><label>생년월일/주민번호</label><input type="text" data-field="partyBId" value="${U.escapeHtml(s.partyBId)}"></div>
          </div>
          <div class="field"><label>연락처</label><input type="tel" data-field="partyBPhone" value="${U.escapeHtml(s.partyBPhone)}"></div>
          <div class="field"><label>주소</label><input type="text" data-field="partyBAddress" value="${U.escapeHtml(s.partyBAddress)}"></div>
        </div>
      `;
      bindInputs(container, s, api);
    },
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm 14mm;">
          <h2 class="doc-title compact">합 의 서</h2>

          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
            <tr><th>사 건 건 명</th><td colspan="3" class="bold">${valOrEmpty(s.incidentTitle, '합의 대상 사건명')}</td></tr>
            <tr><th>사건 발생일</th><td>${U.formatKoreanDate(s.incidentDate)}</td><th>합의금 지급일</th><td class="bold">${U.formatKoreanDate(s.payDate)}</td></tr>
            <tr>
              <th>합 의 금 액</th>
              <td colspan="3" class="bold">
                ₩ ${U.formatNumber(amt)}원 (${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))})
              </td>
            </tr>
            ${s.bankAccount ? `<tr><th>입 금 계 좌</th><td colspan="3">${U.escapeHtml(s.bankAccount)}</td></tr>` : ''}
            <tr>
              <th>사 건 개 요</th>
              <td colspan="3" style="min-height:24mm;vertical-align:top;padding:3mm;line-height:1.6;">
                ${s.incidentSummary ? U.escapeHtmlWithBr(s.incidentSummary) : '<span class="doc-empty">합의 대상 사건의 일시·장소·내용</span>'}
              </td>
            </tr>
            <tr>
              <th>합 의 조 항</th>
              <td colspan="3" style="min-height:36mm;vertical-align:top;padding:3mm;line-height:1.65;">
                ${U.escapeHtmlWithBr(s.clauses || '')}
              </td>
            </tr>
          </table>

          <p style="text-align:center;font-size:10.5pt;margin:5mm 0 4mm;">
            위와 같이 당사자 간에 원만히 합의하였음을 증명하기 위하여 본 합의서를 작성하고 서명·날인합니다.
          </p>

          <div class="doc-sign-block">
            <div class="doc-date" style="margin:3mm 0 5mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="party-grid">
              <div class="party-box">
                <div class="party-box-title"><span>갑 (피해자 / 수령인)</span>${ctx.renderStamp('partyA', '(인)')}</div>
                <div class="party-line"><span class="lbl">성 명</span><span class="val bold">${valOrEmpty(s.partyAName, '')}</span></div>
                <div class="party-line"><span class="lbl">주민/생년</span><span class="val">${valOrEmpty(s.partyAId, '')}</span></div>
                <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.partyAPhone, '')}</span></div>
                <div class="party-line"><span class="lbl">주 소</span><span class="val">${valOrEmpty(s.partyAAddress, '')}</span></div>
              </div>
              <div class="party-box">
                <div class="party-box-title"><span>을 (가해자 / 지급인)</span>${ctx.renderStamp('partyB', '(인)')}</div>
                <div class="party-line"><span class="lbl">성 명</span><span class="val bold">${valOrEmpty(s.partyBName, '')}</span></div>
                <div class="party-line"><span class="lbl">주민/생년</span><span class="val">${valOrEmpty(s.partyBId, '')}</span></div>
                <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.partyBPhone, '')}</span></div>
                <div class="party-line"><span class="lbl">주 소</span><span class="val">${valOrEmpty(s.partyBAddress, '')}</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },
  });
})(window);
