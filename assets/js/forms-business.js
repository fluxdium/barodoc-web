/* ==========================================================================
   바로서식 (BaroDoc) — Business & Labor Official Forms (3 Forms)
   5. 견적서 (gyeonjeokseo)
   6. 근로계약서 (geunro)
   7. 거래명세서 (georae)
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;

  // 2026년 고용노동부 고시 최저임금 기준
  const MIN_WAGE_HOURLY_2026 = 10320;
  const MIN_WAGE_MONTHLY_2026 = 2156880; // 주 40시간, 월 209시간 기준

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

  function calcLineTotals(items, vatMode) {
    let rawSum = 0;
    const rows = (items || []).map((it) => {
      const qty = U.parseNumber(it.qty);
      const unitPrice = U.parseNumber(it.unitPrice);
      const amount = Math.round(qty * unitPrice);
      let supply = amount;
      let vat = 0;
      if (vatMode === 'separate') {
        supply = amount;
        vat = Math.round(amount * 0.1);
      } else if (vatMode === 'included') {
        supply = Math.round(amount / 1.1);
        vat = amount - supply;
      } else {
        supply = amount;
        vat = 0;
      }
      rawSum += amount;
      return Object.assign({}, it, { qty, unitPrice, supply, vat, total: supply + vat });
    });

    const supplyTotal = rows.reduce((a, r) => a + r.supply, 0);
    const vatTotal = rows.reduce((a, r) => a + r.vat, 0);
    const grandTotal = supplyTotal + vatTotal;
    return { rows, supplyTotal, vatTotal, grandTotal, rawSum };
  }

  function renderItemsEditorHtml(items, vatMode, totals) {
    return `
      <div class="form-group-card">
        <div class="form-group-title">
          <span>3. 품목 및 금액 (자동 계산)</span>
          <button type="button" class="btn btn-outline btn-sm" id="addLineItemBtn">+ 품목 추가</button>
        </div>
        <div class="field">
          <label for="f_vatMode">부가가치세 (VAT) 계산 방식</label>
          <select id="f_vatMode" data-field="vatMode" data-rerender="true">
            <option value="separate" ${vatMode === 'separate' ? 'selected' : ''}>부가세 별도 (+10% 자동 계산)</option>
            <option value="included" ${vatMode === 'included' ? 'selected' : ''}>부가세 포함 (공급가액·세액 역산)</option>
            <option value="exempt" ${vatMode === 'exempt' ? 'selected' : ''}>면세 / 부가세 없음 (0%)</option>
          </select>
        </div>

        <div id="lineItemsList">
          ${items
            .map(
              (item, idx) => `
            <div class="line-item-card" data-item-idx="${idx}">
              <div class="line-item-head">
                <span>품목 #${idx + 1}</span>
                ${
                  items.length > 1
                    ? `<button type="button" class="btn btn-ghost btn-sm" data-remove-item="${idx}" style="padding:2px 6px;font-size:11.5px;color:var(--seal-red);">삭제</button>`
                    : ''
                }
              </div>
              <div class="line-item-grid">
                <input type="text" data-item-field="name" data-idx="${idx}" value="${U.escapeHtml(item.name)}" placeholder="품목명 (예: 웹사이트 디자인)">
                <input type="text" data-item-field="spec" data-idx="${idx}" value="${U.escapeHtml(item.spec)}" placeholder="규격/단위 (예: 식, 개)">
              </div>
              <div class="line-item-nums">
                <input type="number" min="0" step="1" data-item-field="qty" data-idx="${idx}" value="${U.escapeHtml(item.qty)}" placeholder="수량">
                <input type="number" min="0" step="100" data-item-field="unitPrice" data-idx="${idx}" value="${U.escapeHtml(item.unitPrice)}" placeholder="단가(원)">
                <input type="text" data-item-field="note" data-idx="${idx}" value="${U.escapeHtml(item.note)}" placeholder="비고">
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="summary-box" id="bizSummaryBox">
          <div class="summary-line"><span>공급가액 합계</span><strong>${U.formatNumber(totals.supplyTotal)}원</strong></div>
          <div class="summary-line"><span>부가세 (VAT)</span><strong>${U.formatNumber(totals.vatTotal)}원</strong></div>
          <div class="summary-line total"><span>총 합계금액</span><strong>${U.formatNumber(totals.grandTotal)}원</strong></div>
          <div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))}</div>
        </div>
      </div>
    `;
  }

  function bindItemsEvents(container, state, api) {
    container.querySelectorAll('[data-item-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const idx = Number(el.getAttribute('data-idx'));
        const field = el.getAttribute('data-item-field');
        if (state.items[idx]) {
          state.items[idx][field] = el.value;
          api.setState(state, { rerenderEditor: false });
          const totals = calcLineTotals(state.items, state.vatMode);
          const sumBox = container.querySelector('#bizSummaryBox');
          if (sumBox) {
            sumBox.innerHTML = `
              <div class="summary-line"><span>공급가액 합계</span><strong>${U.formatNumber(totals.supplyTotal)}원</strong></div>
              <div class="summary-line"><span>부가세 (VAT)</span><strong>${U.formatNumber(totals.vatTotal)}원</strong></div>
              <div class="summary-line total"><span>총 합계금액</span><strong>${U.formatNumber(totals.grandTotal)}원</strong></div>
              <div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))}</div>
            `;
          }
        }
      });
    });

    const addBtn = container.querySelector('#addLineItemBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (state.items.length >= 12) {
          U.showToast('A4 1장 기준 최대 12개 품목까지 추가할 수 있습니다.');
          return;
        }
        state.items.push({ name: '', spec: '식', qty: 1, unitPrice: 0, note: '' });
        api.rerenderAll();
      });
    }

    container.querySelectorAll('[data-remove-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-remove-item'));
        if (state.items.length > 1) {
          state.items.splice(idx, 1);
          api.rerenderAll();
        }
      });
    });
  }

  function makeCompanyStampName(companyName, fallback) {
    if (!companyName) return fallback;
    const core = String(companyName).replace(/주식회사|\(주\)|유한회사|\s+/g, '');
    return (core.slice(0, 8) || fallback.replace(/인$/, '')) + '인';
  }

  /* ========================================================================
     5. 견적서 (gyeonjeokseo)
     ======================================================================== */
  F.register('gyeonjeokseo', {
    stampSlots: [{ key: 'supplier', label: '공급자 직인', defaultName: '바로스튜디오인', defaultShape: 'square', sizeMm: 19 }],
    defaultStampMm: 19,
    getSuggestedStampName: (s) => makeCompanyStampName(s.supplierName, '바로스튜디오인'),
    getInitialData: () => ({
      quoteNo: 'Q-2026-001',
      quoteDate: U.todayISO(),
      validDays: '견적일로부터 14일',
      clientName: '',
      clientContact: '',
      projectTitle: '',
      supplierBizNo: '',
      supplierName: '',
      supplierCeo: '',
      supplierAddress: '',
      supplierBizType: '',
      supplierBizItem: '',
      supplierPhone: '',
      vatMode: 'separate',
      items: [
        { name: '', spec: '식', qty: 1, unitPrice: 0, note: '' },
        { name: '', spec: '식', qty: 1, unitPrice: 0, note: '' },
      ],
      notes: '1. 위 견적 금액은 부가가치세 포함 최종 합계 기준입니다.\n2. 계약금 50% 입금 시 작업에 착수하며, 잔금은 납품 완료 후 7일 이내 정산합니다.',
    }),
    getSampleData: () => ({
      quoteNo: 'Q-2026-1119',
      quoteDate: U.todayISO(),
      validDays: '견적일로부터 15일',
      clientName: '주식회사 한빛커머스',
      clientContact: '마케팅팀 김담당 님',
      projectTitle: '기업 공식 홈페이지 리뉴얼 구축',
      supplierBizNo: '123-45-67890',
      supplierName: '주식회사 바로스튜디오',
      supplierCeo: '이대표',
      supplierAddress: '서울특별시 성동구 아차산로 100, 4층',
      supplierBizType: '정보통신업',
      supplierBizItem: '소프트웨어 개발 및 디자인',
      supplierPhone: '02-6000-1234',
      vatMode: 'separate',
      items: [
        { name: 'UI/UX 기획 및 와이어프레임 설계', spec: '식', qty: 1, unitPrice: 800000, note: 'PC/모바일' },
        { name: '반응형 웹 디자인 및 퍼블리싱', spec: '식', qty: 1, unitPrice: 1800000, note: '주요 8페이지' },
        { name: 'SEO 최적화 및 도메인·호스팅 연동', spec: '식', qty: 1, unitPrice: 500000, note: '검색엔진 등록 포함' },
        { name: '유지보수 및 운영 매뉴얼 제공', spec: '식', qty: 1, unitPrice: 400000, note: '납품 후 1개월 무상' },
      ],
      notes: '1. 결제 조건: 계약금 50% 착수 시 / 잔금 50% 검수 완료 후 7일 이내\n2. 세금계산서는 전자세금계산서로 발행됩니다.\n3. 입금 계좌: 기업은행 110-222-333444 (예금주: 주식회사 바로스튜디오)',
    }),
    renderEditor: (container, s, api) => {
      const totals = calcLineTotals(s.items, s.vatMode);
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 수신처 (견적 받는 곳)</div>
          <div class="field-row">
            <div class="field">
              <label>수신처 (회사명/고객명)</label>
              <input type="text" data-field="clientName" value="${U.escapeHtml(s.clientName)}" placeholder="예: 주식회사 한빛커머스">
            </div>
            <div class="field">
              <label>담당자 / 참조 (선택)</label>
              <input type="text" data-field="clientContact" value="${U.escapeHtml(s.clientContact)}" placeholder="예: 김담당 팀장님">
            </div>
          </div>
          <div class="field">
            <label>건명 (프로젝트명)</label>
            <input type="text" data-field="projectTitle" value="${U.escapeHtml(s.projectTitle)}" placeholder="예: 홈페이지 제작 견적">
          </div>
          <div class="field-row">
            <div class="field">
              <label>견적일자</label>
              <input type="date" data-field="quoteDate" value="${U.escapeHtml(s.quoteDate)}">
            </div>
            <div class="field">
              <label>견적번호</label>
              <input type="text" data-field="quoteNo" value="${U.escapeHtml(s.quoteNo)}" placeholder="Q-2026-001">
            </div>
          </div>
          <div class="field">
            <label>유효기간</label>
            <input type="text" data-field="validDays" value="${U.escapeHtml(s.validDays)}" placeholder="예: 견적일로부터 14일">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 공급자 (견적 보내는 회사)</div>
          <div class="field-row">
            <div class="field">
              <label>상호 (회사명)</label>
              <input type="text" data-field="supplierName" value="${U.escapeHtml(s.supplierName)}" placeholder="공급자 상호">
            </div>
            <div class="field">
              <label>대표자 성명</label>
              <input type="text" data-field="supplierCeo" value="${U.escapeHtml(s.supplierCeo)}" placeholder="대표자명">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>사업자등록번호</label>
              <input type="text" data-field="supplierBizNo" value="${U.escapeHtml(s.supplierBizNo)}" placeholder="000-00-00000">
            </div>
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="supplierPhone" value="${U.escapeHtml(s.supplierPhone)}" placeholder="02-000-0000">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>업태</label>
              <input type="text" data-field="supplierBizType" value="${U.escapeHtml(s.supplierBizType)}" placeholder="예: 서비스업">
            </div>
            <div class="field">
              <label>종목</label>
              <input type="text" data-field="supplierBizItem" value="${U.escapeHtml(s.supplierBizItem)}" placeholder="예: 소프트웨어 개발">
            </div>
          </div>
          <div class="field">
            <label>사업장 주소</label>
            <input type="text" data-field="supplierAddress" value="${U.escapeHtml(s.supplierAddress)}" placeholder="사업장 도로명 주소">
          </div>
        </div>

        ${renderItemsEditorHtml(s.items, s.vatMode, totals)}

        <div class="form-group-card">
          <div class="form-group-title">4. 특기사항 / 입금 계좌 안내</div>
          <div class="field">
            <textarea data-field="notes" placeholder="결제 조건, 납기 일정, 계좌번호 등을 입력하세요.">${U.escapeHtml(s.notes)}</textarea>
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      bindItemsEvents(container, s, api);
    },
    renderA4: (s, ctx) => {
      const totals = calcLineTotals(s.items, s.vatMode);
      const minRows = Math.max(8, totals.rows.length);
      const paddedRows = [];
      for (let i = 0; i < minRows; i++) {
        const r = totals.rows[i];
        if (r && (r.name || r.unitPrice > 0)) {
          paddedRows.push(`
            <tr>
              <td class="center">${i + 1}</td>
              <td>${U.escapeHtml(r.name)}</td>
              <td class="center">${U.escapeHtml(r.spec)}</td>
              <td class="num">${r.qty ? U.formatNumber(r.qty) : ''}</td>
              <td class="num">${r.unitPrice ? U.formatNumber(r.unitPrice) : ''}</td>
              <td class="num">${r.supply ? U.formatNumber(r.supply) : ''}</td>
              <td class="num">${r.vat ? U.formatNumber(r.vat) : (s.vatMode === 'exempt' ? '0' : '')}</td>
              <td>${U.escapeHtml(r.note)}</td>
            </tr>
          `);
        } else {
          paddedRows.push(`
            <tr>
              <td class="center" style="color:#9ca3af;">${i + 1}</td>
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          `);
        }
      }

      const vatLabel =
        s.vatMode === 'exempt' ? '(면세)' : s.vatMode === 'included' ? '(부가세 포함)' : '(부가세 포함 총액)';
      const denseClass = totals.rows.length >= 7 ? 'dense-items' : '';

      return `
        <div class="a4-sheet ${denseClass} ${ctx.fontClass}" style="padding:14mm 14mm 13mm;">
          <h2 class="doc-title compact">견 적 서</h2>

          <div class="biz-header">
            <div class="biz-left">
              <div>
                <div class="biz-recipient-line">
                  <span>${valOrEmpty(s.clientName, '수신처명')}</span>
                  <span style="font-size:10.5pt;font-weight:700;">귀중</span>
                </div>
                <div class="biz-meta-list">
                  <div><strong>견적번호:</strong> ${U.escapeHtml(s.quoteNo || '-')}</div>
                  <div><strong>견적일자:</strong> ${U.formatKoreanDate(s.quoteDate)}</div>
                  ${s.clientContact ? `<div><strong>참 &nbsp;&nbsp;&nbsp;&nbsp;조:</strong> ${U.escapeHtml(s.clientContact)}</div>` : ''}
                  ${s.projectTitle ? `<div><strong>건 &nbsp;&nbsp;&nbsp;&nbsp;명:</strong> ${U.escapeHtml(s.projectTitle)}</div>` : ''}
                  <div><strong>유효기간:</strong> ${U.escapeHtml(s.validDays || '견적일로부터 14일')}</div>
                </div>
              </div>
              <div style="font-size:9.3pt;margin-top:3mm;">아래와 같이 견적합니다.</div>
            </div>

            <table class="doc-table compact thick-outer" style="margin:0;">
              <colgroup><col style="width:9%"><col style="width:19%"><col style="width:27%"><col style="width:14%"><col style="width:31%"></colgroup>
              <tr>
                <th rowspan="5" style="line-height:1.4;">공<br>급<br>자</th>
                <th>등록번호</th>
                <td colspan="3" class="bold">${valOrEmpty(s.supplierBizNo, '000-00-00000')}</td>
              </tr>
              <tr>
                <th>상 호</th>
                <td class="bold">${valOrEmpty(s.supplierName, '회사명')}</td>
                <th>성 명</th>
                <td>
                  <div class="ceo-stamp-cell">
                    <span>${valOrEmpty(s.supplierCeo, '대표자')}</span>
                    ${ctx.renderStamp('supplier', '(인)', 'sm')}
                  </div>
                </td>
              </tr>
              <tr>
                <th>주 소</th>
                <td colspan="3">${valOrEmpty(s.supplierAddress, '사업장 주소')}</td>
              </tr>
              <tr>
                <th>업 태</th>
                <td>${valOrEmpty(s.supplierBizType, '')}</td>
                <th>종 목</th>
                <td>${valOrEmpty(s.supplierBizItem, '')}</td>
              </tr>
              <tr>
                <th>연락처</th>
                <td colspan="3">${valOrEmpty(s.supplierPhone, '')}</td>
              </tr>
            </table>
          </div>

          <div class="biz-total-banner">
            <span class="biz-total-label">합계금액 ${vatLabel}</span>
            <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))}</span>
            <span class="biz-total-number">(₩ ${U.formatNumber(totals.grandTotal)})</span>
          </div>

          <table class="doc-table compact thick-outer">
            <colgroup>
              <col style="width:6%"><col style="width:27%"><col style="width:9%"><col style="width:8%">
              <col style="width:13%"><col style="width:14%"><col style="width:11%"><col style="width:12%">
            </colgroup>
            <thead>
              <tr>
                <th>No</th>
                <th>품 목</th>
                <th>규 격</th>
                <th>수 량</th>
                <th>단 가</th>
                <th>공급가액</th>
                <th>세 액</th>
                <th>비 고</th>
              </tr>
            </thead>
            <tbody>
              ${paddedRows.join('')}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="5">합 계</th>
                <td class="num bold">${U.formatNumber(totals.supplyTotal)}</td>
                <td class="num bold">${U.formatNumber(totals.vatTotal)}</td>
                <td class="num bold">${U.formatNumber(totals.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="doc-notes-box" style="margin-top:auto;"><strong>[특기사항 및 결제 안내]</strong><div class="doc-notes-body">${U.escapeHtml(s.notes || '특이사항 없음')}</div></div>
        </div>
      `;
    },
  });

  /* ========================================================================
     6. 표준근로계약서 (geunro)
     ======================================================================== */
  F.register('geunro', {
    stampSlots: [
      { key: 'employer', label: '사업주 직인/인', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 17 },
      { key: 'employee', label: '근로자 도장 (인)', defaultName: '김근로', defaultShape: 'circle', sizeMm: 16 },
    ],
    getSuggestedStampName: (s, slot) => (slot === 'employer' ? makeCompanyStampName(s.companyName, '바로컴퍼니인') : s.employeeName || '김근로'),
    getInitialData: () => ({
      contractType: 'permanent', // permanent | fixed | parttime
      companyName: '',
      ceoName: '',
      companyPhone: '',
      companyAddress: '',
      employeeName: '',
      employeePhone: '',
      employeeAddress: '',
      startDate: U.todayISO(),
      endDate: '',
      workplace: '',
      jobDescription: '',
      workStart: '09:00',
      workEnd: '18:00',
      breakTime: '12:00 ~ 13:00 (1시간)',
      workDays: '매주 월~금요일 (주 5일)',
      weeklyHoliday: '매주 일요일',
      wageType: 'monthly', // monthly | hourly | annual
      wageAmount: '2500000',
      bonusText: '없음 (회사 규정에 따름)',
      allowanceText: '식대 월 200,000원 포함',
      payDay: '매월 25일',
      payMethod: '근로자 명의 예금통장에 입금',
      insEmployment: true,
      insAccident: true,
      insPension: true,
      insHealth: true,
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      contractType: 'permanent',
      companyName: '주식회사 바로컴퍼니',
      ceoName: '최대표',
      companyPhone: '02-555-7890',
      companyAddress: '서울특별시 강남구 테헤란로 250, 7층',
      employeeName: '이서준',
      employeePhone: '010-4455-6677',
      employeeAddress: '서울특별시 동작구 상도로 110, 204호',
      startDate: U.todayISO(),
      endDate: '',
      workplace: '본사 사무실 (서울특별시 강남구 테헤란로 250)',
      jobDescription: '웹 서비스 운영 및 고객지원 업무',
      workStart: '09:00',
      workEnd: '18:00',
      breakTime: '12:00 ~ 13:00 (1시간)',
      workDays: '매주 월~금요일 (주 5일, 주 40시간)',
      weeklyHoliday: '매주 일요일',
      wageType: 'monthly',
      wageAmount: '2800000',
      bonusText: '경영 성과에 따라 별도 지급',
      allowanceText: '비과세 식대 월 200,000원 포함',
      payDay: '매월 25일',
      payMethod: '근로자 명의 예금통장에 입금',
      insEmployment: true,
      insAccident: true,
      insPension: true,
      insHealth: true,
      writtenDate: U.todayISO(),
    }),
    onFieldUpdated: (container, s, field) => {
      if (field === 'wageAmount' || field === 'wageType') {
        const alertEl = container.querySelector('#minWageAlert');
        if (alertEl) updateMinWageAlert(alertEl, s);
      }
    },
    renderEditor: (container, s, api) => {
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 계약 유형 및 당사자 정보</div>
          <div class="field">
            <label>근로계약 유형 (고용노동부 표준 기준)</label>
            <select data-field="contractType" data-rerender="true">
              <option value="permanent" ${s.contractType === 'permanent' ? 'selected' : ''}>정규직 (기간의 정함이 없는 경우)</option>
              <option value="fixed" ${s.contractType === 'fixed' ? 'selected' : ''}>계약직 (기간의 정함이 있는 경우)</option>
              <option value="parttime" ${s.contractType === 'parttime' ? 'selected' : ''}>단시간 근로자 (아르바이트/파트타임)</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field">
              <label>사업체명 (회사명)</label>
              <input type="text" data-field="companyName" value="${U.escapeHtml(s.companyName)}" placeholder="예: 주식회사 바로컴퍼니">
            </div>
            <div class="field">
              <label>사업주 (대표자명)</label>
              <input type="text" data-field="ceoName" value="${U.escapeHtml(s.ceoName)}" placeholder="대표자 성명">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>사업장 전화번호</label>
              <input type="tel" data-field="companyPhone" value="${U.escapeHtml(s.companyPhone)}" placeholder="02-000-0000">
            </div>
            <div class="field">
              <label>계약 체결일</label>
              <input type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}">
            </div>
          </div>
          <div class="field">
            <label>사업장 소재지</label>
            <input type="text" data-field="companyAddress" value="${U.escapeHtml(s.companyAddress)}" placeholder="회사 도로명 주소">
          </div>
          <hr style="border:none;border-top:1px solid var(--border);margin:12px 0;">
          <div class="field-row">
            <div class="field">
              <label>근로자 성명</label>
              <input type="text" data-field="employeeName" value="${U.escapeHtml(s.employeeName)}" placeholder="근로자 성명">
            </div>
            <div class="field">
              <label>근로자 연락처</label>
              <input type="tel" data-field="employeePhone" value="${U.escapeHtml(s.employeePhone)}" placeholder="010-0000-0000">
            </div>
          </div>
          <div class="field">
            <label>근로자 주소</label>
            <input type="text" data-field="employeeAddress" value="${U.escapeHtml(s.employeeAddress)}" placeholder="근로자 거주지 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 근로기간·장소·근무시간</div>
          <div class="field-row">
            <div class="field">
              <label>근로 개시일</label>
              <input type="date" data-field="startDate" value="${U.escapeHtml(s.startDate)}">
            </div>
            ${
              s.contractType !== 'permanent'
                ? `
              <div class="field">
                <label>근로 종료일</label>
                <input type="date" data-field="endDate" value="${U.escapeHtml(s.endDate)}">
              </div>
            `
                : `
              <div class="field">
                <label>근로 종료일</label>
                <input type="text" value="기간의 정함 없음" disabled>
              </div>
            `
            }
          </div>
          <div class="field">
            <label>근무 장소</label>
            <input type="text" data-field="workplace" value="${U.escapeHtml(s.workplace)}" placeholder="예: 본사 사무실">
          </div>
          <div class="field">
            <label>업무의 내용</label>
            <input type="text" data-field="jobDescription" value="${U.escapeHtml(s.jobDescription)}" placeholder="예: 매장 관리 및 고객 응대">
          </div>
          <div class="field-row">
            <div class="field">
              <label>시업 시각 (출근)</label>
              <input type="text" data-field="workStart" value="${U.escapeHtml(s.workStart)}" placeholder="09:00">
            </div>
            <div class="field">
              <label>종업 시각 (퇴근)</label>
              <input type="text" data-field="workEnd" value="${U.escapeHtml(s.workEnd)}" placeholder="18:00">
            </div>
          </div>
          <div class="field">
            <label>휴게시간 (4시간당 30분, 8시간당 1시간 이상 필수)</label>
            <input type="text" data-field="breakTime" value="${U.escapeHtml(s.breakTime)}" placeholder="12:00 ~ 13:00 (1시간)">
          </div>
          <div class="field-row">
            <div class="field">
              <label>근무일</label>
              <input type="text" data-field="workDays" value="${U.escapeHtml(s.workDays)}" placeholder="매주 월~금요일">
            </div>
            <div class="field">
              <label>주휴일</label>
              <input type="text" data-field="weeklyHoliday" value="${U.escapeHtml(s.weeklyHoliday)}" placeholder="매주 일요일">
            </div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 임금 및 4대보험 (2026 최저임금 자동 점검)</div>
          <div class="field-row">
            <div class="field">
              <label>임금 형태</label>
              <select data-field="wageType">
                <option value="monthly" ${s.wageType === 'monthly' ? 'selected' : ''}>월급 (원)</option>
                <option value="hourly" ${s.wageType === 'hourly' ? 'selected' : ''}>시급 (원)</option>
                <option value="annual" ${s.wageType === 'annual' ? 'selected' : ''}>연봉 (원)</option>
              </select>
            </div>
            <div class="field">
              <label>금액 (숫자 입력)</label>
              <input type="number" min="0" step="100" data-field="wageAmount" value="${U.escapeHtml(s.wageAmount)}">
            </div>
          </div>
          <div id="minWageAlert" class="field-alert ok"></div>
          <div class="field-row" style="margin-top:10px;">
            <div class="field">
              <label>임금 지급일</label>
              <input type="text" data-field="payDay" value="${U.escapeHtml(s.payDay)}" placeholder="매월 25일">
            </div>
            <div class="field">
              <label>지급 방법</label>
              <input type="text" data-field="payMethod" value="${U.escapeHtml(s.payMethod)}">
            </div>
          </div>
          <div class="field">
            <label>상여금 / 기타 제수당</label>
            <input type="text" data-field="allowanceText" value="${U.escapeHtml(s.allowanceText)}" placeholder="예: 식대 월 200,000원 포함">
          </div>
          <div class="field">
            <label>사회보험 적용 여부 (4대보험)</label>
            <div class="checkbox-grid">
              <label class="checkbox-row"><input type="checkbox" data-field="insEmployment" ${s.insEmployment ? 'checked' : ''}> 고용보험</label>
              <label class="checkbox-row"><input type="checkbox" data-field="insAccident" ${s.insAccident ? 'checked' : ''}> 산재보험</label>
              <label class="checkbox-row"><input type="checkbox" data-field="insPension" ${s.insPension ? 'checked' : ''}> 국민연금</label>
              <label class="checkbox-row"><input type="checkbox" data-field="insHealth" ${s.insHealth ? 'checked' : ''}> 건강보험</label>
            </div>
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      const alertEl = container.querySelector('#minWageAlert');
      if (alertEl) updateMinWageAlert(alertEl, s);
    },
    renderA4: (s, ctx) => {
      const titleMap = {
        permanent: '표 준 근 로 계 약 서',
        fixed: '표 준 근 로 계 약 서 (기간제)',
        parttime: '단 시 간 근 로 자 표 준 근 로 계 약 서',
      };
      const wageLabelMap = { monthly: '월급', hourly: '시급', annual: '연봉' };
      const amt = U.parseNumber(s.wageAmount);
      const periodText =
        s.contractType === 'permanent'
          ? `${U.formatKoreanDate(s.startDate)}부터 기간의 정함이 없음`
          : `${U.formatKoreanDate(s.startDate)}부터 ${s.endDate ? U.formatKoreanDate(s.endDate) : '20  년   월   일'}까지`;

      const ins = (checked, label) => `${checked ? '☑' : '☐'} ${label}`;

      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">${titleMap[s.contractType] || '표 준 근 로 계 약 서'}</h2>

          <p style="margin:0 0 3.5mm;line-height:1.6;">
            <strong>${valOrEmpty(s.companyName, '○○○')}</strong>(이하 "사업주"라 함)과(와)
            <strong>${valOrEmpty(s.employeeName, '○○○')}</strong>(이하 "근로자"라 함)은(는) 다음과 같이 근로계약을 체결한다.
          </p>

          <div class="contract-item"><strong>1. 근로계약기간 :</strong> ${periodText}</div>
          <div class="contract-item"><strong>2. 근 무 장 소 :</strong> ${valOrEmpty(s.workplace, '근무 장소 기재')}</div>
          <div class="contract-item"><strong>3. 업무의 내용 :</strong> ${valOrEmpty(s.jobDescription, '담당 업무 기재')}</div>
          <div class="contract-item">
            <strong>4. 소정근로시간 :</strong> ${U.escapeHtml(s.workStart || '09:00')}부터 ${U.escapeHtml(s.workEnd || '18:00')}까지
            (휴게시간 : ${U.escapeHtml(s.breakTime || '12:00 ~ 13:00')})
          </div>
          <div class="contract-item">
            <strong>5. 근무일 / 휴일 :</strong> ${U.escapeHtml(s.workDays || '매주 5일 근무')},
            주휴일은 ${U.escapeHtml(s.weeklyHoliday || '매주 일요일')}로 한다.
          </div>
          <div class="contract-item">
            <strong>6. 임 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;금 :</strong>
            <div style="padding-left:4mm;margin-top:1mm;">
              - ${wageLabelMap[s.wageType] || '월급'} : <strong>${U.formatNumber(amt)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(amt))})<br>
              - 상여금 및 제수당 : ${U.escapeHtml(s.allowanceText || '별도 약정 없음')}<br>
              - 임금지급일 : ${U.escapeHtml(s.payDay || '매월 25일')}${/(휴일|전일|전영업일)/.test(s.payDay || '') ? '' : ' (휴일의 경우는 전일 지급)'}<br>
              - 지급방법 : ${U.escapeHtml(s.payMethod || '근로자 명의 예금통장에 입금')}
            </div>
          </div>
          <div class="contract-item">
            <strong>7. 연차유급휴가 :</strong> 연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함.
          </div>
          <div class="contract-item">
            <strong>8. 사회보험 적용여부 :</strong>
            ${ins(s.insEmployment, '고용보험')} &nbsp;
            ${ins(s.insAccident, '산재보험')} &nbsp;
            ${ins(s.insPension, '국민연금')} &nbsp;
            ${ins(s.insHealth, '건강보험')}
          </div>
          <div class="contract-item">
            <strong>9. 근로계약서 교부 :</strong> 사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부요구와 관계없이 근로자에게 교부함(근로기준법 제17조 이행).
          </div>
          <div class="contract-item">
            <strong>10. 근로계약, 취업규칙 등의 성실한 이행의무 :</strong> 사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 함.
          </div>
          <div class="contract-item">
            <strong>11. 기 타 :</strong> 이 계약에 정함이 없는 사항은 근로기준법령에 의함.
          </div>

          <div class="doc-sign-block" style="padding-top:3mm;">
            <div class="doc-date" style="margin:3mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>

            <div class="party-grid">
              <div class="party-box">
                <div class="party-box-title">
                  <span>(사업주)</span>
                  ${ctx.renderStamp('employer', '(서명 또는 인)')}
                </div>
                <div class="party-line"><span class="lbl">사업체명</span><span class="val bold">${valOrEmpty(s.companyName, '')}</span></div>
                <div class="party-line"><span class="lbl">대 표 자</span><span class="val">${valOrEmpty(s.ceoName, '')}</span></div>
                <div class="party-line"><span class="lbl">전화번호</span><span class="val">${valOrEmpty(s.companyPhone, '')}</span></div>
                <div class="party-line"><span class="lbl">주 &nbsp;&nbsp;&nbsp;&nbsp;소</span><span class="val">${valOrEmpty(s.companyAddress, '')}</span></div>
              </div>

              <div class="party-box">
                <div class="party-box-title">
                  <span>(근로자)</span>
                  ${ctx.renderStamp('employee', '(서명 또는 인)')}
                </div>
                <div class="party-line"><span class="lbl">성 &nbsp;&nbsp;&nbsp;&nbsp;명</span><span class="val bold">${valOrEmpty(s.employeeName, '')}</span></div>
                <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.employeePhone, '')}</span></div>
                <div class="party-line"><span class="lbl">주 &nbsp;&nbsp;&nbsp;&nbsp;소</span><span class="val">${valOrEmpty(s.employeeAddress, '')}</span></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },
  });

  function updateMinWageAlert(alertEl, s) {
    const amt = U.parseNumber(s.wageAmount);
    if (s.wageType === 'hourly') {
      if (amt < MIN_WAGE_HOURLY_2026) {
        alertEl.className = 'field-alert danger';
        alertEl.textContent = `⚠ 2026년 법정 최저시급(${U.formatNumber(MIN_WAGE_HOURLY_2026)}원) 미만입니다. 최저임금법 위반 소지가 있으니 확인해 주세요.`;
      } else {
        alertEl.className = 'field-alert ok';
        alertEl.textContent = `✓ 2026년 최저시급(${U.formatNumber(MIN_WAGE_HOURLY_2026)}원) 이상입니다.`;
      }
    } else if (s.wageType === 'monthly') {
      if (amt < MIN_WAGE_MONTHLY_2026) {
        alertEl.className = 'field-alert warn';
        alertEl.textContent = `⚠ 주 40시간 기준 2026년 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원, 209시간 기준)보다 낮습니다. 단시간 근로가 아니라면 확인이 필요합니다.`;
      } else {
        alertEl.className = 'field-alert ok';
        alertEl.textContent = `✓ 주 40시간 기준 2026년 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원) 이상입니다.`;
      }
    } else {
      const monthly = Math.round(amt / 12);
      if (monthly < MIN_WAGE_MONTHLY_2026) {
        alertEl.className = 'field-alert warn';
        alertEl.textContent = `⚠ 월 환산액(${U.formatNumber(monthly)}원)이 2026년 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원) 미만입니다.`;
      } else {
        alertEl.className = 'field-alert ok';
        alertEl.textContent = `✓ 월 환산액 약 ${U.formatNumber(monthly)}원 (2026년 최저임금 기준 충족)`;
      }
    }
  }

  /* ========================================================================
     7. 거래명세서 (georae)
     ======================================================================== */
  F.register('georae', {
    stampSlots: [{ key: 'supplier', label: '공급자 직인', defaultName: '바로유통인', defaultShape: 'square', sizeMm: 19 }],
    defaultStampMm: 19,
    getSuggestedStampName: (s) => makeCompanyStampName(s.supplierName, '바로유통인'),
    getInitialData: () => ({
      copyMode: 'blue', // blue (공급받는자 보관용) | red (공급자 보관용) | both (2매 동시 출력)
      tradeDate: U.todayISO(),
      docNo: 'T-2026-001',
      clientName: '',
      clientBizNo: '',
      clientCeo: '',
      clientPhone: '',
      supplierBizNo: '',
      supplierName: '',
      supplierCeo: '',
      supplierAddress: '',
      supplierBizType: '',
      supplierBizItem: '',
      supplierPhone: '',
      vatMode: 'separate',
      items: [
        { name: '', spec: 'EA', qty: 1, unitPrice: 0, note: '' },
        { name: '', spec: 'EA', qty: 1, unitPrice: 0, note: '' },
      ],
      notes: '위 품목을 정히 납품(인수) 하였음을 확인합니다.',
    }),
    getSampleData: () => ({
      copyMode: 'blue',
      tradeDate: U.todayISO(),
      docNo: 'T-2026-1119',
      clientName: '주식회사 에이치디자인',
      clientBizNo: '311-86-54321',
      clientCeo: '윤대표',
      clientPhone: '02-333-4455',
      supplierBizNo: '214-81-98765',
      supplierName: '주식회사 바로유통',
      supplierCeo: '박사장',
      supplierAddress: '경기도 하남시 미사대로 520, B동 305호',
      supplierBizType: '도소매업',
      supplierBizItem: '사무용품 및 전자기기',
      supplierPhone: '031-790-1122',
      vatMode: 'separate',
      items: [
        { name: 'A4 복사용지 80g (2,500매/박스)', spec: 'BOX', qty: 10, unitPrice: 28000, note: '11/19 납품' },
        { name: '컬러 레이저 토너 카트리지 세트', spec: 'SET', qty: 2, unitPrice: 145000, note: '정품' },
        { name: '무선 인체공학 키보드·마우스 세트', spec: 'SET', qty: 5, unitPrice: 62000, note: '' },
      ],
      notes: '입금 계좌: 신한은행 140-001-234567 (예금주: 주식회사 바로유통)\n전자세금계산서는 월말 일괄 발행됩니다.',
    }),
    renderEditor: (container, s, api) => {
      const totals = calcLineTotals(s.items, s.vatMode);
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 보관용 구분 및 거래처 정보</div>
          <div class="field">
            <label>보관용 색상 / 출력 매수 선택</label>
            <select data-field="copyMode">
              <option value="blue" ${s.copyMode === 'blue' ? 'selected' : ''}>공급받는자 보관용 (청색 1매)</option>
              <option value="red" ${s.copyMode === 'red' ? 'selected' : ''}>공급자 보관용 (적색 1매)</option>
              <option value="both" ${s.copyMode === 'both' ? 'selected' : ''}>공급자(적색) + 공급받는자(청색) 2매 동시 출력</option>
            </select>
          </div>
          <div class="field-row">
            <div class="field">
              <label>거래일자</label>
              <input type="date" data-field="tradeDate" value="${U.escapeHtml(s.tradeDate)}">
            </div>
            <div class="field">
              <label>명세서 번호</label>
              <input type="text" data-field="docNo" value="${U.escapeHtml(s.docNo)}">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>공급받는자 (거래처 상호)</label>
              <input type="text" data-field="clientName" value="${U.escapeHtml(s.clientName)}" placeholder="거래처 회사명">
            </div>
            <div class="field">
              <label>거래처 대표자 / 담당자</label>
              <input type="text" data-field="clientCeo" value="${U.escapeHtml(s.clientCeo)}" placeholder="성명">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>거래처 사업자번호 (선택)</label>
              <input type="text" data-field="clientBizNo" value="${U.escapeHtml(s.clientBizNo)}" placeholder="000-00-00000">
            </div>
            <div class="field">
              <label>거래처 연락처 (선택)</label>
              <input type="tel" data-field="clientPhone" value="${U.escapeHtml(s.clientPhone)}" placeholder="02-000-0000">
            </div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 공급자 (내 회사 정보)</div>
          <div class="field-row">
            <div class="field">
              <label>상호 (회사명)</label>
              <input type="text" data-field="supplierName" value="${U.escapeHtml(s.supplierName)}" placeholder="공급자 상호">
            </div>
            <div class="field">
              <label>대표자 성명</label>
              <input type="text" data-field="supplierCeo" value="${U.escapeHtml(s.supplierCeo)}" placeholder="대표자명">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>사업자등록번호</label>
              <input type="text" data-field="supplierBizNo" value="${U.escapeHtml(s.supplierBizNo)}" placeholder="000-00-00000">
            </div>
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="supplierPhone" value="${U.escapeHtml(s.supplierPhone)}" placeholder="02-000-0000">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>업태</label>
              <input type="text" data-field="supplierBizType" value="${U.escapeHtml(s.supplierBizType)}" placeholder="도소매업">
            </div>
            <div class="field">
              <label>종목</label>
              <input type="text" data-field="supplierBizItem" value="${U.escapeHtml(s.supplierBizItem)}" placeholder="사무용품">
            </div>
          </div>
          <div class="field">
            <label>사업장 주소</label>
            <input type="text" data-field="supplierAddress" value="${U.escapeHtml(s.supplierAddress)}" placeholder="사업장 도로명 주소">
          </div>
        </div>

        ${renderItemsEditorHtml(s.items, s.vatMode, totals)}

        <div class="form-group-card">
          <div class="form-group-title">4. 비고 및 입금 안내</div>
          <div class="field">
            <textarea data-field="notes">${U.escapeHtml(s.notes)}</textarea>
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      bindItemsEvents(container, s, api);
    },
    renderA4: (s, ctx) => {
      const totals = calcLineTotals(s.items, s.vatMode);
      const copies =
        s.copyMode === 'both'
          ? [
              { theme: 'theme-blue', label: '공급받는자 보관용' },
              { theme: 'theme-red', label: '공급자 보관용' },
            ]
          : s.copyMode === 'red'
          ? [{ theme: 'theme-red', label: '공급자 보관용' }]
          : [{ theme: 'theme-blue', label: '공급받는자 보관용' }];

      const minRows = Math.max(9, totals.rows.length);
      const rowsHtml = [];
      for (let i = 0; i < minRows; i++) {
        const r = totals.rows[i];
        if (r && (r.name || r.unitPrice > 0)) {
          rowsHtml.push(`
            <tr>
              <td class="center">${i + 1}</td>
              <td>${U.escapeHtml(r.name)}</td>
              <td class="center">${U.escapeHtml(r.spec)}</td>
              <td class="num">${r.qty ? U.formatNumber(r.qty) : ''}</td>
              <td class="num">${r.unitPrice ? U.formatNumber(r.unitPrice) : ''}</td>
              <td class="num">${r.supply ? U.formatNumber(r.supply) : ''}</td>
              <td class="num">${r.vat ? U.formatNumber(r.vat) : (s.vatMode === 'exempt' ? '0' : '')}</td>
              <td>${U.escapeHtml(r.note)}</td>
            </tr>
          `);
        } else {
          rowsHtml.push(`
            <tr>
              <td class="center" style="color:#9ca3af;">${i + 1}</td>
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          `);
        }
      }

      const denseClass = totals.rows.length >= 7 ? 'dense-items' : '';
      return copies
        .map(
          (copy) => `
          <div class="a4-sheet ${denseClass} ${copy.theme} ${ctx.fontClass}" style="padding:14mm 14mm 13mm;">
            <h2 class="doc-title compact">
              거 래 명 세 서
              <span class="statement-copy-badge">${copy.label}</span>
            </h2>

            <div class="biz-header">
              <div class="biz-left">
                <div>
                  <div class="biz-recipient-line">
                    <span>${valOrEmpty(s.clientName, '공급받는자 상호')}</span>
                    <span style="font-size:10.5pt;font-weight:700;">귀하</span>
                  </div>
                  <div class="biz-meta-list">
                    <div><strong>거래일자:</strong> ${U.formatKoreanDate(s.tradeDate)}</div>
                    <div><strong>문서번호:</strong> ${U.escapeHtml(s.docNo || '-')}</div>
                    ${s.clientCeo ? `<div><strong>대 표 자:</strong> ${U.escapeHtml(s.clientCeo)}</div>` : ''}
                    ${s.clientBizNo ? `<div><strong>사업자번호:</strong> ${U.escapeHtml(s.clientBizNo)}</div>` : ''}
                    ${s.clientPhone ? `<div><strong>연 락 처:</strong> ${U.escapeHtml(s.clientPhone)}</div>` : ''}
                  </div>
                </div>
                <div style="font-size:9.3pt;margin-top:3mm;">아래와 같이 계산합니다.</div>
              </div>

              <table class="doc-table compact thick-outer" style="margin:0;">
                <colgroup><col style="width:9%"><col style="width:19%"><col style="width:27%"><col style="width:14%"><col style="width:31%"></colgroup>
                <tr>
                  <th rowspan="5" style="line-height:1.4;">공<br>급<br>자</th>
                  <th>등록번호</th>
                  <td colspan="3" class="bold">${valOrEmpty(s.supplierBizNo, '000-00-00000')}</td>
                </tr>
                <tr>
                  <th>상 호</th>
                  <td class="bold">${valOrEmpty(s.supplierName, '공급자 상호')}</td>
                  <th>성 명</th>
                  <td>
                    <div class="ceo-stamp-cell">
                      <span>${valOrEmpty(s.supplierCeo, '대표자')}</span>
                      ${ctx.renderStamp('supplier', '(인)', 'sm')}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>주 소</th>
                  <td colspan="3">${valOrEmpty(s.supplierAddress, '사업장 주소')}</td>
                </tr>
                <tr>
                  <th>업 태</th>
                  <td>${valOrEmpty(s.supplierBizType, '')}</td>
                  <th>종 목</th>
                  <td>${valOrEmpty(s.supplierBizItem, '')}</td>
                </tr>
                <tr>
                  <th>연락처</th>
                  <td colspan="3">${valOrEmpty(s.supplierPhone, '')}</td>
                </tr>
              </table>
            </div>

            <div class="biz-total-banner">
              <span class="biz-total-label">합계금액</span>
              <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))}</span>
              <span class="biz-total-number">(₩ ${U.formatNumber(totals.grandTotal)})</span>
            </div>

            <table class="doc-table compact thick-outer">
              <colgroup>
                <col style="width:6%"><col style="width:27%"><col style="width:9%"><col style="width:8%">
                <col style="width:13%"><col style="width:14%"><col style="width:11%"><col style="width:12%">
              </colgroup>
              <thead>
                <tr>
                  <th>No</th>
                  <th>품 목</th>
                  <th>규 격</th>
                  <th>수 량</th>
                  <th>단 가</th>
                  <th>공급가액</th>
                  <th>세 액</th>
                  <th>비 고</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml.join('')}
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="5">합 계</th>
                  <td class="num bold">${U.formatNumber(totals.supplyTotal)}</td>
                  <td class="num bold">${U.formatNumber(totals.vatTotal)}</td>
                  <td class="num bold">${U.formatNumber(totals.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:4mm;margin-top:auto;">
              <div class="doc-notes-box"><strong>[비고 / 입금 안내]</strong><div class="doc-notes-body">${U.escapeHtml(s.notes || '')}</div></div>
              <table class="doc-table compact" style="margin:0;">
                <tr>
                  <th style="width:34%">인수자 확인</th>
                  <td class="center" style="height:${totals.rows.length >= 7 ? '12mm' : '16mm'};vertical-align:bottom;color:#666;">성명 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(인)</td>
                </tr>
              </table>
            </div>
          </div>
        `
        )
        .join('');
    },
  });
})(window);
