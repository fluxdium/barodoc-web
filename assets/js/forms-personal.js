/* ==========================================================================
   바로문서 (BaroDoc) — Personal & HR Official Forms (4 Forms)
   1. 사직서 (sajikseo)
   2. 차용증 (chayongjeung)
   3. 위임장 (wiimjang)
   4. 재직증명서 (jaejik)
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

  /* ========================================================================
     1. 사직서 (sajikseo)
     ======================================================================== */
  F.register('sajikseo', {
    stampSlots: [{ key: 'writer', label: '작성자 도장 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 17 }],
    getSuggestedStampName: (s) => s.name || '홍길동',
    getInitialData: () => ({
      companyName: '',
      ceoTitle: '대표이사 귀하',
      department: '',
      position: '',
      name: '',
      birthOrId: '',
      phone: '',
      address: '',
      joinDate: '',
      resignDate: U.addMonthsISO(U.todayISO(), 1),
      reason: '일신상의 사유',
      reasonDetail: '',
      includeHandover: true,
      includeConfidential: true,
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      companyName: '주식회사 바로테크',
      ceoTitle: '대표이사 귀하',
      department: '서비스기획팀',
      position: '대리',
      name: '김민수',
      birthOrId: '1993.05.14',
      phone: '010-1234-5678',
      address: '서울특별시 강남구 테헤란로 123, 101동 502호',
      joinDate: '2023-03-02',
      resignDate: U.addMonthsISO(U.todayISO(), 1),
      reason: '일신상의 사유',
      reasonDetail: '개인적인 사정과 향후 진로 준비를 위해 사직하고자 합니다.',
      includeHandover: true,
      includeConfidential: true,
      writtenDate: U.todayISO(),
    }),
    renderEditor: (container, s, api) => {
      const reasonPresets = ['일신상의 사유', '이직 및 경력 개발', '건강상의 사유', '학업 및 자기계발', '가사 사정'];
      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 제출처 (회사 정보)</div>
          <div class="field-row">
            <div class="field">
              <label for="f_company">회사명</label>
              <input id="f_company" type="text" data-field="companyName" value="${U.escapeHtml(s.companyName)}" placeholder="예: 주식회사 바로테크">
            </div>
            <div class="field">
              <label for="f_ceo">수신 표기</label>
              <input id="f_ceo" type="text" data-field="ceoTitle" value="${U.escapeHtml(s.ceoTitle)}" placeholder="예: 대표이사 귀하">
            </div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 퇴직자 인적사항</div>
          <div class="field-row">
            <div class="field">
              <label for="f_dept">소속 (부서명)</label>
              <input id="f_dept" type="text" data-field="department" value="${U.escapeHtml(s.department)}" placeholder="예: 마케팅팀">
            </div>
            <div class="field">
              <label for="f_pos">직위 / 직급</label>
              <input id="f_pos" type="text" data-field="position" value="${U.escapeHtml(s.position)}" placeholder="예: 대리 / 사원">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f_name">성명</label>
              <input id="f_name" type="text" data-field="name" value="${U.escapeHtml(s.name)}" placeholder="예: 홍길동">
            </div>
            <div class="field">
              <label for="f_birth">생년월일 (또는 사번)</label>
              <input id="f_birth" type="text" data-field="birthOrId" value="${U.escapeHtml(s.birthOrId)}" placeholder="예: 1995.01.15">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f_phone">연락처</label>
              <input id="f_phone" type="tel" data-field="phone" value="${U.escapeHtml(s.phone)}" placeholder="010-0000-0000">
            </div>
            <div class="field">
              <label for="f_join">입사일</label>
              <input id="f_join" type="date" data-field="joinDate" value="${U.escapeHtml(s.joinDate)}">
            </div>
          </div>
          <div class="field">
            <label for="f_addr">현주소</label>
            <input id="f_addr" type="text" data-field="address" value="${U.escapeHtml(s.address)}" placeholder="퇴직 정산 서류 수령 가능 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 퇴직 예정일 및 사유</div>
          <div class="field-row">
            <div class="field">
              <label for="f_resign">퇴직 예정일 (마지막 근무 다음날)</label>
              <input id="f_resign" type="date" data-field="resignDate" value="${U.escapeHtml(s.resignDate)}">
            </div>
            <div class="field">
              <label for="f_written">작성일</label>
              <input id="f_written" type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}">
            </div>
          </div>
          <div class="field">
            <label>사직 사유 빠른 선택</label>
            <div class="chip-row">
              ${reasonPresets
                .map((r) => `<button type="button" class="chip-btn" data-reason-chip="${U.escapeHtml(r)}">${U.escapeHtml(r)}</button>`)
                .join('')}
            </div>
            <input type="text" data-field="reason" value="${U.escapeHtml(s.reason)}" placeholder="예: 일신상의 사유">
          </div>
          <div class="field">
            <label for="f_detail">상세 사유 (선택)</label>
            <textarea id="f_detail" data-field="reasonDetail" placeholder="필요 시 구체적인 사직 사유를 간략히 기재하세요.">${U.escapeHtml(s.reasonDetail)}</textarea>
          </div>
          <div class="field">
            <label class="checkbox-row">
              <input type="checkbox" data-field="includeHandover" ${s.includeHandover ? 'checked' : ''}>
              업무 인수인계 및 회사 비품 반납 서약 포함
            </label>
          </div>
          <div class="field">
            <label class="checkbox-row">
              <input type="checkbox" data-field="includeConfidential" ${s.includeConfidential ? 'checked' : ''}>
              퇴직 후 직무상 비밀유지 서약 문구 포함
            </label>
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-reason-chip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          api.updateField('reason', btn.getAttribute('data-reason-chip'), { rerenderEditor: true });
        });
      });
    },
    renderA4: (s, ctx) => {
      const pledges = [];
      if (s.includeHandover) {
        pledges.push('1. 퇴직 전까지 담당 업무의 인수인계를 성실히 완료하며, 회사로부터 대여받은 비품·출입증·자료 일체를 반환하겠습니다.');
      }
      if (s.includeConfidential) {
        pledges.push(`${pledges.length + 1}. 재직 중 취득한 회사의 영업비밀 및 고객 정보 등 직무상 기밀을 퇴직 후에도 외부에 누설하거나 부당하게 이용하지 않겠습니다.`);
      }
      return `
        <div class="a4-sheet ${ctx.fontClass}">
          <h2 class="doc-title">사 직 서</h2>

          <table class="doc-table thick-outer">
            <colgroup>
              <col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%">
            </colgroup>
            <tr>
              <th>소 속</th>
              <td>${valOrEmpty(s.department, '소속 부서')}</td>
              <th>직 위</th>
              <td>${valOrEmpty(s.position, '직위')}</td>
            </tr>
            <tr>
              <th>성 명</th>
              <td>${valOrEmpty(s.name, '성명')}</td>
              <th>생년월일</th>
              <td>${valOrEmpty(s.birthOrId, '생년월일')}</td>
            </tr>
            <tr>
              <th>입 사 일</th>
              <td>${s.joinDate ? U.formatKoreanDate(s.joinDate) : '<span class="doc-empty">입사일</span>'}</td>
              <th>연 락 처</th>
              <td>${valOrEmpty(s.phone, '연락처')}</td>
            </tr>
            <tr>
              <th>퇴직 예정일</th>
              <td colspan="3" class="bold">${U.formatKoreanDate(s.resignDate)}</td>
            </tr>
            <tr>
              <th>현 주 소</th>
              <td colspan="3">${valOrEmpty(s.address, '현주소')}</td>
            </tr>
            <tr>
              <th>사직 사유</th>
              <td colspan="3" style="min-height:36mm;vertical-align:top;padding-top:4mm;padding-bottom:5mm;">
                <div class="bold" style="margin-bottom:2mm;">${valOrEmpty(s.reason, '일신상의 사유')}</div>
                ${s.reasonDetail ? `<div style="line-height:1.7;">${U.escapeHtmlWithBr(s.reasonDetail)}</div>` : ''}
              </td>
            </tr>
          </table>

          ${
            pledges.length > 0
              ? `
            <div class="doc-clauses" style="border:1px solid #333;padding:4mm 5mm;margin-top:4mm;background:#fafafa;">
              <p class="doc-clause-title" style="margin-bottom:2.5mm;">[퇴직 서약 사항]</p>
              ${pledges.map((p) => `<p>${U.escapeHtml(p)}</p>`).join('')}
            </div>
          `
              : ''
          }

          <div class="doc-statement">
            상기 본인은 위와 같은 사유로 사직하고자 하오니<br>
            선처하여 주시기 바랍니다.
          </div>

          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row">
              <span>작성자 (퇴직 신청인) :</span>
              <span class="doc-sign-name">${valOrEmpty(s.name, '홍 길 동')}</span>
              ${ctx.renderStamp('writer', '(인)')}
            </div>
            <div class="doc-recipient">
              ${valOrEmpty(s.companyName, '주식회사 ○○○')} ${U.escapeHtml(s.ceoTitle || '대표이사 귀하')}
            </div>
          </div>
        </div>
      `;
    },
  });

  /* ========================================================================
     2. 차용증 (chayongjeung)
     ======================================================================== */
  F.register('chayongjeung', {
    stampSlots: [
      { key: 'debtor', label: '채무자', defaultName: '김채무', defaultShape: 'circle', sizeMm: 17 },
      { key: 'creditor', label: '채권자', defaultName: '이채권', defaultShape: 'circle', sizeMm: 17 },
      { key: 'guarantor', label: '연대보증인', defaultName: '박보증', defaultShape: 'circle', sizeMm: 16 },
    ],
    getSuggestedStampName: (s, slot) => {
      if (slot === 'debtor') return s.debtorName || '홍길동';
      if (slot === 'creditor') return s.creditorName || '김철수';
      return s.guarantorName || '이영희';
    },
    getInitialData: () => ({
      principal: '10000000',
      loanDate: U.todayISO(),
      dueDate: U.addMonthsISO(U.todayISO(), 12),
      interestRate: '5',
      interestPayDay: '매월 25일',
      repayMethod: '만기 일시 상환',
      delayRate: '15',
      bankAccount: '',
      specialTerms: '1. 채무자가 이자 지급을 2회 이상 연체할 경우 기한의 이익을 상실하며, 채권자는 즉시 원리금 전액의 변제를 청구할 수 있다.\n2. 본 차용증과 관련한 분쟁 발생 시 관할 법원은 채권자 주소지 관할 법원으로 한다.',
      debtorName: '',
      debtorId: '',
      debtorPhone: '',
      debtorAddress: '',
      creditorName: '',
      creditorId: '',
      creditorPhone: '',
      creditorAddress: '',
      useGuarantor: false,
      guarantorName: '',
      guarantorId: '',
      guarantorPhone: '',
      guarantorAddress: '',
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      principal: '10000000',
      loanDate: U.todayISO(),
      dueDate: U.addMonthsISO(U.todayISO(), 12),
      interestRate: '4.6',
      interestPayDay: '매월 25일',
      repayMethod: '만기 일시 상환',
      delayRate: '15',
      bankAccount: '국민은행 123-456-789012 (예금주: 이채권)',
      specialTerms: '1. 채무자가 이자 지급을 2회 이상 연체할 경우 기한의 이익을 상실하며, 채권자는 즉시 원리금 전액의 변제를 청구할 수 있다.\n2. 원금 및 이자는 위 지정 계좌로 이체하여 변제한다.',
      debtorName: '김채무',
      debtorId: '900315-1******',
      debtorPhone: '010-2345-6789',
      debtorAddress: '서울특별시 마포구 월드컵북로 45, 302호',
      creditorName: '이채권',
      creditorId: '880722-2******',
      creditorPhone: '010-9876-5432',
      creditorAddress: '경기도 성남시 분당구 판교역로 100, 1205호',
      useGuarantor: false,
      guarantorName: '',
      guarantorId: '',
      guarantorPhone: '',
      guarantorAddress: '',
      writtenDate: U.todayISO(),
    }),
    onFieldUpdated: (container, s, field) => {
      if (field === 'principal') {
        const box = container.querySelector('#iouConvertedBox');
        if (box) {
          const amt = U.parseNumber(s.principal);
          box.innerHTML = `
            <div><strong>한글 표기:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div>
            <div><strong>한자 표기:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))} (₩${U.formatNumber(amt)})</div>
          `;
        }
      }
      if (field === 'interestRate' || field === 'delayRate') {
        const alertEl = container.querySelector('#iouRateAlert');
        if (alertEl) {
          const r1 = U.parseNumber(s.interestRate);
          const r2 = U.parseNumber(s.delayRate);
          if (r1 > 20 || r2 > 20) {
            alertEl.className = 'field-alert danger';
            alertEl.textContent = '⚠ 법정 최고이자율(연 20%, 이자제한법)을 초과했습니다. 연 20% 초과 이자 약정은 초과 부분에 한해 법적으로 무효입니다.';
          } else {
            alertEl.className = 'field-alert ok';
            alertEl.textContent = '✓ 이자제한법상 법정 최고이자율(연 20%) 이내의 적법한 이율입니다.';
          }
        }
      }
    },
    renderEditor: (container, s, api) => {
      const amt = U.parseNumber(s.principal);
      const r1 = U.parseNumber(s.interestRate);
      const r2 = U.parseNumber(s.delayRate);
      const rateOver = r1 > 20 || r2 > 20;

      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 차용 금액 및 이자 조건</div>
          <div class="field">
            <label for="f_principal">원금 (숫자만 입력, 원 단위)</label>
            <input id="f_principal" type="number" min="0" step="10000" data-field="principal" value="${U.escapeHtml(s.principal)}" placeholder="예: 10000000">
            <div id="iouConvertedBox" class="field-converted">
              <div><strong>한글 표기:</strong> ${U.escapeHtml(U.formatKoreanCurrency(amt))}</div>
              <div><strong>한자 표기:</strong> ${U.escapeHtml(U.formatHanjaCurrency(amt))} (₩${U.formatNumber(amt)})</div>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f_loanDate">차용일 (빌린 날)</label>
              <input id="f_loanDate" type="date" data-field="loanDate" value="${U.escapeHtml(s.loanDate)}">
            </div>
            <div class="field">
              <label for="f_dueDate">변제기일 (갚을 날)</label>
              <input id="f_dueDate" type="date" data-field="dueDate" value="${U.escapeHtml(s.dueDate)}">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f_rate">약정 이자율 (연 %, 무이자면 0)</label>
              <input id="f_rate" type="number" min="0" max="100" step="0.1" data-field="interestRate" value="${U.escapeHtml(s.interestRate)}">
            </div>
            <div class="field">
              <label for="f_delay">지연손해금 (연체이자율 연 %)</label>
              <input id="f_delay" type="number" min="0" max="100" step="0.1" data-field="delayRate" value="${U.escapeHtml(s.delayRate)}">
            </div>
          </div>
          <div id="iouRateAlert" class="field-alert ${rateOver ? 'danger' : 'ok'}">
            ${
              rateOver
                ? '⚠ 법정 최고이자율(연 20%, 이자제한법)을 초과했습니다. 연 20% 초과 이자 약정은 초과 부분에 한해 법적으로 무효입니다.'
                : '✓ 이자제한법상 법정 최고이자율(연 20%) 이내의 적법한 이율입니다.'
            }
          </div>
          <div class="field-row" style="margin-top:10px;">
            <div class="field">
              <label for="f_repay">변제 방법</label>
              <select id="f_repay" data-field="repayMethod">
                <option value="만기 일시 상환" ${s.repayMethod === '만기 일시 상환' ? 'selected' : ''}>만기 일시 상환</option>
                <option value="매월 원리금 균등 분할 상환" ${s.repayMethod === '매월 원리금 균등 분할 상환' ? 'selected' : ''}>매월 원리금 균등 분할</option>
                <option value="매월 원금 균등 분할 상환" ${s.repayMethod === '매월 원금 균등 분할 상환' ? 'selected' : ''}>매월 원금 균등 분할</option>
              </select>
            </div>
            <div class="field">
              <label for="f_payday">이자 지급일</label>
              <input id="f_payday" type="text" data-field="interestPayDay" value="${U.escapeHtml(s.interestPayDay)}" placeholder="예: 매월 25일">
            </div>
          </div>
          <div class="field">
            <label for="f_account">변제 입금 계좌 (채권자 계좌)</label>
            <input id="f_account" type="text" data-field="bankAccount" value="${U.escapeHtml(s.bankAccount)}" placeholder="예: 국민은행 123-456-789012 (예금주: 홍길동)">
          </div>
          <div class="field">
            <label for="f_special">특약 사항</label>
            <textarea id="f_special" data-field="specialTerms">${U.escapeHtml(s.specialTerms)}</textarea>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 채무자 (돈을 빌리는 사람)</div>
          <div class="field-row">
            <div class="field">
              <label>성명</label>
              <input type="text" data-field="debtorName" value="${U.escapeHtml(s.debtorName)}" placeholder="채무자 성명">
            </div>
            <div class="field">
              <label>생년월일 / 주민등록번호</label>
              <input type="text" data-field="debtorId" value="${U.escapeHtml(s.debtorId)}" placeholder="예: 900101-1******">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="debtorPhone" value="${U.escapeHtml(s.debtorPhone)}" placeholder="010-0000-0000">
            </div>
            <div class="field">
              <label>작성일</label>
              <input type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}">
            </div>
          </div>
          <div class="field">
            <label>주소</label>
            <input type="text" data-field="debtorAddress" value="${U.escapeHtml(s.debtorAddress)}" placeholder="도로명 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 채권자 (돈을 빌려주는 사람)</div>
          <div class="field-row">
            <div class="field">
              <label>성명</label>
              <input type="text" data-field="creditorName" value="${U.escapeHtml(s.creditorName)}" placeholder="채권자 성명">
            </div>
            <div class="field">
              <label>생년월일 / 주민등록번호</label>
              <input type="text" data-field="creditorId" value="${U.escapeHtml(s.creditorId)}" placeholder="예: 880101-2******">
            </div>
          </div>
          <div class="field">
            <label>연락처</label>
            <input type="tel" data-field="creditorPhone" value="${U.escapeHtml(s.creditorPhone)}" placeholder="010-0000-0000">
          </div>
          <div class="field">
            <label>주소</label>
            <input type="text" data-field="creditorAddress" value="${U.escapeHtml(s.creditorAddress)}" placeholder="도로명 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">
            <span>4. 연대보증인 (선택)</span>
            <label class="checkbox-row" style="font-size:12.5px;">
              <input type="checkbox" data-field="useGuarantor" data-rerender="true" ${s.useGuarantor ? 'checked' : ''}> 포함하기
            </label>
          </div>
          ${
            s.useGuarantor
              ? `
            <div class="field-row">
              <div class="field">
                <label>보증인 성명</label>
                <input type="text" data-field="guarantorName" value="${U.escapeHtml(s.guarantorName)}" placeholder="연대보증인 성명">
              </div>
              <div class="field">
                <label>생년월일 / 주민등록번호</label>
                <input type="text" data-field="guarantorId" value="${U.escapeHtml(s.guarantorId)}" placeholder="예: 850101-1******">
              </div>
            </div>
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="guarantorPhone" value="${U.escapeHtml(s.guarantorPhone)}" placeholder="010-0000-0000">
            </div>
            <div class="field">
              <label>주소</label>
              <input type="text" data-field="guarantorAddress" value="${U.escapeHtml(s.guarantorAddress)}" placeholder="도로명 주소">
            </div>
          `
              : '<p class="field-help" style="margin:0;">연대보증인이 있는 경우에만 체크해 기재하세요.</p>'
          }
        </div>
      `;
      bindInputs(container, s, api);
    },
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.principal);
      const rate = U.parseNumber(s.interestRate);
      const delay = U.parseNumber(s.delayRate);
      const rateText = rate === 0 ? '무이자 (연 0%)' : `연 ${rate}% (${U.escapeHtml(s.interestPayDay || '매월 지정일')} 지급)`;

      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm 14mm;">
          <h2 class="doc-title compact">차 용 증</h2>

          <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:1.5mm;">
            <div style="display:flex;width:100%;justify-content:space-between;align-items:center;">
              <span class="biz-total-label">차용 원금</span>
              <span class="biz-total-number">₩ ${U.formatNumber(amt)} 원</span>
            </div>
            <div style="font-size:10.5pt;font-weight:700;color:#111;">
              ${U.escapeHtml(U.formatKoreanCurrency(amt))} &nbsp;/&nbsp; ${U.escapeHtml(U.formatHanjaCurrency(amt))}
            </div>
          </div>

          <p style="margin:0 0 3.5mm;font-size:9.8pt;line-height:1.65;">
            채무자는 위 금액을 채권자로부터 틀림없이 차용하였음을 확인하며, 아래 조건에 따라 성실히 변제할 것을 확약합니다.
          </p>

          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr>
              <th>차 용 일</th>
              <td>${U.formatKoreanDate(s.loanDate)}</td>
              <th>변 제 기 일</th>
              <td class="bold">${U.formatKoreanDate(s.dueDate)}</td>
            </tr>
            <tr>
              <th>약정 이자율</th>
              <td>${rateText}</td>
              <th>지연손해금</th>
              <td>연 ${delay}% (연체 시)</td>
            </tr>
            <tr>
              <th>변 제 방 법</th>
              <td colspan="3">${U.escapeHtml(s.repayMethod)}</td>
            </tr>
            <tr>
              <th>변제 입금 계좌</th>
              <td colspan="3">${valOrEmpty(s.bankAccount, '변제 시 입금할 채권자 계좌번호 기재')}</td>
            </tr>
            <tr>
              <th>특 약 사 항</th>
              <td colspan="3" style="line-height:1.55;vertical-align:top;min-height:22mm;">${U.escapeHtmlWithBr(s.specialTerms || '특약 사항 없음')}</td>
            </tr>
          </table>

          <div class="doc-date" style="margin:4mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>

          <div class="party-grid">
            <div class="party-box">
              <div class="party-box-title">
                <span>채 무 자 (빌리는 사람)</span>
                ${ctx.renderStamp('debtor', '(인)')}
              </div>
              <div class="party-line"><span class="lbl">성 명</span><span class="val bold">${valOrEmpty(s.debtorName, '채무자 성명')}</span></div>
              <div class="party-line"><span class="lbl">주민/생년</span><span class="val">${valOrEmpty(s.debtorId, '')}</span></div>
              <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.debtorPhone, '')}</span></div>
              <div class="party-line"><span class="lbl">주 소</span><span class="val">${valOrEmpty(s.debtorAddress, '')}</span></div>
            </div>

            <div class="party-box">
              <div class="party-box-title">
                <span>채 권 자 (빌려주는 사람)</span>
                ${ctx.renderStamp('creditor', '(인)')}
              </div>
              <div class="party-line"><span class="lbl">성 명</span><span class="val bold">${valOrEmpty(s.creditorName, '채권자 성명')}</span></div>
              <div class="party-line"><span class="lbl">주민/생년</span><span class="val">${valOrEmpty(s.creditorId, '')}</span></div>
              <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.creditorPhone, '')}</span></div>
              <div class="party-line"><span class="lbl">주 소</span><span class="val">${valOrEmpty(s.creditorAddress, '')}</span></div>
            </div>
          </div>

          ${
            s.useGuarantor
              ? `
            <div class="party-box" style="margin-top:4mm;">
              <div class="party-box-title">
                <span>연 대 보 증 인 (채무자와 연대하여 변제 책임을 부담함)</span>
                ${ctx.renderStamp('guarantor', '(인)')}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:2mm 6mm;">
                <div class="party-line"><span class="lbl">성 명</span><span class="val bold">${valOrEmpty(s.guarantorName, '보증인 성명')}</span></div>
                <div class="party-line"><span class="lbl">주민/생년</span><span class="val">${valOrEmpty(s.guarantorId, '')}</span></div>
                <div class="party-line"><span class="lbl">연 락 처</span><span class="val">${valOrEmpty(s.guarantorPhone, '')}</span></div>
                <div class="party-line"><span class="lbl">주 소</span><span class="val">${valOrEmpty(s.guarantorAddress, '')}</span></div>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;
    },
  });

  /* ========================================================================
     3. 위임장 (wiimjang)
     ======================================================================== */
  F.register('wiimjang', {
    stampSlots: [{ key: 'delegator', label: '위임인 도장 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 18 }],
    getSuggestedStampName: (s) => s.delegatorName || '홍길동',
    getInitialData: () => ({
      delegatorName: '',
      delegatorId: '',
      delegatorPhone: '',
      delegatorAddress: '',
      agentName: '',
      agentId: '',
      agentPhone: '',
      agentRelation: '가족',
      agentAddress: '',
      purposeTitle: '',
      purposeDetail: '',
      validUntil: '',
      recipientOrg: '',
      writtenDate: U.todayISO(),
    }),
    getSampleData: () => ({
      delegatorName: '박지훈',
      delegatorId: '870412-1******',
      delegatorPhone: '010-3344-5566',
      delegatorAddress: '서울특별시 송파구 올림픽로 300, 102동 804호',
      agentName: '박서연',
      agentId: '910903-2******',
      agentPhone: '010-7788-9900',
      agentRelation: '배우자',
      agentAddress: '서울특별시 송파구 올림픽로 300, 102동 804호',
      purposeTitle: '주민등록등·초본 및 가족관계증명서 대리 발급',
      purposeDetail: '위임인 본인의 주민등록등본 2통, 가족관계증명서(상세) 1통의 신청 및 수령에 관한 일체의 권한을 위 수임인에게 위임합니다.',
      validUntil: U.addMonthsISO(U.todayISO(), 1),
      recipientOrg: '관할 주민센터 귀중',
      writtenDate: U.todayISO(),
    }),
    renderEditor: (container, s, api) => {
      const presets = [
        {
          label: '민원서류 발급',
          title: '주민등록등·초본 및 제증명 대리 발급',
          detail: '위임인 본인의 민원 서류 신청 및 수령에 관한 일체의 권한을 수임인에게 위임합니다.',
          org: '관할 행정복지센터 귀중',
        },
        {
          label: '금융/은행 업무',
          title: '예금 계좌 개설·해지 및 금융거래 제반 업무',
          detail: '해당 금융기관의 계좌 관련 신청, 서류 제출 및 수령에 관한 권한 일체를 수임인에게 위임합니다.',
          org: '○○은행 귀중',
        },
        {
          label: '부동산 계약',
          title: '부동산 임대차(매매) 계약 체결 및 대금 수령',
          detail: '목적 부동산에 대한 계약 체결, 계약서 작성·날인 및 관련 서류 제출에 관한 권한 일체를 위임합니다.',
          org: '관계자 귀중',
        },
        {
          label: '차량 등록/이전',
          title: '자동차 소유권 이전 등록 및 말소 신청',
          detail: '차량 등록·이전·변경 신청 및 등록증 수령에 관한 권한 일체를 수임인에게 위임합니다.',
          org: '차량등록사업소 귀중',
        },
      ];

      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 위임 유형 빠른 선택</div>
          <div class="chip-row">
            ${presets
              .map((p, idx) => `<button type="button" class="chip-btn" data-poa-preset="${idx}">${U.escapeHtml(p.label)}</button>`)
              .join('')}
          </div>
          <div class="field">
            <label>위임 제목 (건명)</label>
            <input type="text" data-field="purposeTitle" value="${U.escapeHtml(s.purposeTitle)}" placeholder="예: 주민등록등본 대리 발급">
          </div>
          <div class="field">
            <label>위임 내용 (권한 범위)</label>
            <textarea data-field="purposeDetail" placeholder="위임할 업무의 구체적인 범위를 작성하세요.">${U.escapeHtml(s.purposeDetail)}</textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>제출처 (기관명)</label>
              <input type="text" data-field="recipientOrg" value="${U.escapeHtml(s.recipientOrg)}" placeholder="예: ○○구청 / ○○은행 귀중">
            </div>
            <div class="field">
              <label>위임 유효기한 (선택)</label>
              <input type="date" data-field="validUntil" value="${U.escapeHtml(s.validUntil)}">
            </div>
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 위임인 (권한을 맡기는 분 / 본인)</div>
          <div class="field-row">
            <div class="field">
              <label>성명</label>
              <input type="text" data-field="delegatorName" value="${U.escapeHtml(s.delegatorName)}" placeholder="위임인 성명">
            </div>
            <div class="field">
              <label>생년월일 / 주민등록번호</label>
              <input type="text" data-field="delegatorId" value="${U.escapeHtml(s.delegatorId)}" placeholder="예: 870412-1******">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="delegatorPhone" value="${U.escapeHtml(s.delegatorPhone)}" placeholder="010-0000-0000">
            </div>
            <div class="field">
              <label>작성일</label>
              <input type="date" data-field="writtenDate" value="${U.escapeHtml(s.writtenDate)}">
            </div>
          </div>
          <div class="field">
            <label>주소</label>
            <input type="text" data-field="delegatorAddress" value="${U.escapeHtml(s.delegatorAddress)}" placeholder="위임인 도로명 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 수임인 (대리인 / 방문하는 분)</div>
          <div class="field-row">
            <div class="field">
              <label>성명</label>
              <input type="text" data-field="agentName" value="${U.escapeHtml(s.agentName)}" placeholder="대리인 성명">
            </div>
            <div class="field">
              <label>위임인과의 관계</label>
              <input type="text" data-field="agentRelation" value="${U.escapeHtml(s.agentRelation)}" placeholder="예: 배우자, 자녀, 직원">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>생년월일 / 주민등록번호</label>
              <input type="text" data-field="agentId" value="${U.escapeHtml(s.agentId)}" placeholder="예: 910903-2******">
            </div>
            <div class="field">
              <label>연락처</label>
              <input type="tel" data-field="agentPhone" value="${U.escapeHtml(s.agentPhone)}" placeholder="010-0000-0000">
            </div>
          </div>
          <div class="field">
            <label>주소</label>
            <input type="text" data-field="agentAddress" value="${U.escapeHtml(s.agentAddress)}" placeholder="대리인 도로명 주소">
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-poa-preset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = presets[Number(btn.getAttribute('data-poa-preset'))];
          if (!p) return;
          s.purposeTitle = p.title;
          s.purposeDetail = p.detail;
          s.recipientOrg = p.org;
          api.rerenderAll();
        });
      });
    },
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}">
        <h2 class="doc-title">위 임 장</h2>

        <table class="doc-table thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr>
            <th colspan="4" style="background:#e5e7eb;font-size:10.5pt;">위 임 인 (본 인)</th>
          </tr>
          <tr>
            <th>성 명</th>
            <td class="bold">${valOrEmpty(s.delegatorName, '위임인 성명')}</td>
            <th>생년월일/주민번호</th>
            <td>${valOrEmpty(s.delegatorId, '')}</td>
          </tr>
          <tr>
            <th>연 락 처</th>
            <td>${valOrEmpty(s.delegatorPhone, '')}</td>
            <th>작 성 일</th>
            <td>${U.formatKoreanDate(s.writtenDate)}</td>
          </tr>
          <tr>
            <th>주 소</th>
            <td colspan="3">${valOrEmpty(s.delegatorAddress, '위임인 주소')}</td>
          </tr>
        </table>

        <table class="doc-table thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr>
            <th colspan="4" style="background:#e5e7eb;font-size:10.5pt;">수 임 인 (대 리 인)</th>
          </tr>
          <tr>
            <th>성 명</th>
            <td class="bold">${valOrEmpty(s.agentName, '대리인 성명')}</td>
            <th>위임인과의 관계</th>
            <td>${valOrEmpty(s.agentRelation, '')}</td>
          </tr>
          <tr>
            <th>생년월일/주민번호</th>
            <td>${valOrEmpty(s.agentId, '')}</td>
            <th>연 락 처</th>
            <td>${valOrEmpty(s.agentPhone, '')}</td>
          </tr>
          <tr>
            <th>주 소</th>
            <td colspan="3">${valOrEmpty(s.agentAddress, '대리인 주소')}</td>
          </tr>
        </table>

        <table class="doc-table thick-outer">
          <colgroup><col style="width:18%"><col style="width:82%"></colgroup>
          <tr>
            <th>위 임 건 명</th>
            <td class="bold">${valOrEmpty(s.purposeTitle, '위임 업무 제목')}</td>
          </tr>
          <tr>
            <th>위 임 내 용</th>
            <td style="min-height:38mm;vertical-align:top;padding-top:4mm;padding-bottom:5mm;line-height:1.75;">
              ${s.purposeDetail ? U.escapeHtmlWithBr(s.purposeDetail) : '<span class="doc-empty">위임할 권한 및 업무의 상세 내용을 기재하세요.</span>'}
            </td>
          </tr>
          ${
            s.validUntil
              ? `
            <tr>
              <th>위임 유효기간</th>
              <td>${U.formatKoreanDate(s.writtenDate)} ~ ${U.formatKoreanDate(s.validUntil)}</td>
            </tr>
          `
              : ''
          }
        </table>

        <div class="doc-statement" style="margin:6mm 0 4mm;">
          위 위임인은 위 수임인에게 상기 위임 내용에 관한 권한 일체를<br>
          정히 위임하며, 이로 인한 일체의 책임을 부담할 것을 확인합니다.
        </div>

        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row">
            <span>위 임 인 (본인) :</span>
            <span class="doc-sign-name">${valOrEmpty(s.delegatorName, '홍 길 동')}</span>
            ${ctx.renderStamp('delegator', '(인)')}
          </div>
          ${
            s.recipientOrg
              ? `<div class="doc-recipient">${U.escapeHtml(s.recipientOrg)}</div>`
              : '<div class="doc-recipient"><span class="doc-empty">제출 기관 귀중</span></div>'
          }
        </div>
      </div>
    `,
  });

  /* ========================================================================
     4. 재직증명서 (jaejik)
     ======================================================================== */
  F.register('jaejik', {
    stampSlots: [{ key: 'company', label: '회사 직인 / 대표이사 인', defaultName: '바로상사대표이사인', defaultShape: 'square', sizeMm: 21 }],
    defaultStampMm: 21,
    getSuggestedStampName: (s) => {
      if (!s.companyName) return '바로상사대표인';
      const core = s.companyName.replace(/주식회사|\(주\)|유한회사|\s+/g, '');
      return (core.slice(0, 8) || '바로상사') + '인';
    },
    getInitialData: () => ({
      docNo: '제 2026-001 호',
      name: '',
      residentId: '',
      maskId: true,
      address: '',
      department: '',
      position: '',
      jobDuty: '',
      joinDate: '2023-03-02',
      purpose: '금융기관(은행) 제출용',
      companyName: '',
      bizNo: '',
      ceoName: '',
      companyPhone: '',
      companyAddress: '',
      issueDate: U.todayISO(),
    }),
    getSampleData: () => ({
      docNo: '제 2026-119 호',
      name: '정유진',
      residentId: '920815-2123456',
      maskId: true,
      address: '서울특별시 서초구 서초대로 77길 15, 501호',
      department: '경영지원본부 인사팀',
      position: '과장',
      jobDuty: '인사·총무 관리',
      joinDate: '2022-05-02',
      purpose: '금융기관(은행) 제출용',
      companyName: '주식회사 바로솔루션',
      bizNo: '214-88-12345',
      ceoName: '강대표',
      companyPhone: '02-555-1234',
      companyAddress: '서울특별시 강남구 역삼로 210, 8층',
      issueDate: U.todayISO(),
    }),
    renderEditor: (container, s, api) => {
      const tenure = U.calcTenure(s.joinDate, s.issueDate);
      const purposes = ['금융기관(은행) 제출용', '관공서 제출용', '어린이집/유치원 제출용', '비자/대사관 제출용', '신용카드 발급용'];

      container.innerHTML = `
        <div class="form-group-card">
          <div class="form-group-title">1. 재직자 인적사항</div>
          <div class="field-row">
            <div class="field">
              <label>문서번호</label>
              <input type="text" data-field="docNo" value="${U.escapeHtml(s.docNo)}" placeholder="제 2026-001 호">
            </div>
            <div class="field">
              <label>성명</label>
              <input type="text" data-field="name" value="${U.escapeHtml(s.name)}" placeholder="예: 홍길동">
            </div>
          </div>
          <div class="field">
            <label>주민등록번호 (또는 생년월일)</label>
            <input type="text" data-field="residentId" value="${U.escapeHtml(s.residentId)}" placeholder="예: 920815-2******">
            <label class="checkbox-row" style="margin-top:6px;font-size:12.5px;">
              <input type="checkbox" data-field="maskId" ${s.maskId ? 'checked' : ''}>
              주민등록번호 뒷자리 자동 마스킹 (개인정보 보호 권장)
            </label>
          </div>
          <div class="field">
            <label>현주소</label>
            <input type="text" data-field="address" value="${U.escapeHtml(s.address)}" placeholder="도로명 주소">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">2. 재직 사항 및 용도</div>
          <div class="field-row">
            <div class="field">
              <label>소속 (부서)</label>
              <input type="text" data-field="department" value="${U.escapeHtml(s.department)}" placeholder="예: 개발팀">
            </div>
            <div class="field">
              <label>직위 / 직급</label>
              <input type="text" data-field="position" value="${U.escapeHtml(s.position)}" placeholder="예: 과장">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>담당 업무 (선택)</label>
              <input type="text" data-field="jobDuty" value="${U.escapeHtml(s.jobDuty)}" placeholder="예: 소프트웨어 개발">
            </div>
            <div class="field">
              <label>입사일</label>
              <input type="date" data-field="joinDate" data-rerender="true" value="${U.escapeHtml(s.joinDate)}">
            </div>
          </div>
          ${tenure ? `<div class="field-converted">자동 계산된 재직기간: <strong>${U.escapeHtml(tenure)}</strong></div>` : ''}
          <div class="field" style="margin-top:10px;">
            <label>발급 용도</label>
            <div class="chip-row">
              ${purposes
                .map((p) => `<button type="button" class="chip-btn" data-purpose-chip="${U.escapeHtml(p)}">${U.escapeHtml(p)}</button>`)
                .join('')}
            </div>
            <input type="text" data-field="purpose" value="${U.escapeHtml(s.purpose)}" placeholder="제출 용도 입력">
          </div>
        </div>

        <div class="form-group-card">
          <div class="form-group-title">3. 발급 회사 (기관) 정보</div>
          <div class="field-row">
            <div class="field">
              <label>회사명 (상호)</label>
              <input type="text" data-field="companyName" value="${U.escapeHtml(s.companyName)}" placeholder="예: 주식회사 바로솔루션">
            </div>
            <div class="field">
              <label>대표자 성명</label>
              <input type="text" data-field="ceoName" value="${U.escapeHtml(s.ceoName)}" placeholder="예: 홍대표">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>사업자등록번호</label>
              <input type="text" data-field="bizNo" value="${U.escapeHtml(s.bizNo)}" placeholder="000-00-00000">
            </div>
            <div class="field">
              <label>회사 전화번호</label>
              <input type="tel" data-field="companyPhone" value="${U.escapeHtml(s.companyPhone)}" placeholder="02-000-0000">
            </div>
          </div>
          <div class="field">
            <label>회사 소재지 (주소)</label>
            <input type="text" data-field="companyAddress" value="${U.escapeHtml(s.companyAddress)}" placeholder="회사 도로명 주소">
          </div>
          <div class="field">
            <label>발급일자</label>
            <input type="date" data-field="issueDate" data-rerender="true" value="${U.escapeHtml(s.issueDate)}">
          </div>
        </div>
      `;
      bindInputs(container, s, api);
      container.querySelectorAll('[data-purpose-chip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          api.updateField('purpose', btn.getAttribute('data-purpose-chip'), { rerenderEditor: true });
        });
      });
    },
    renderA4: (s, ctx) => {
      const displayId = U.maskResidentId(s.residentId, s.maskId);
      const tenure = U.calcTenure(s.joinDate, s.issueDate);
      const periodText = s.joinDate
        ? `${U.formatKoreanDate(s.joinDate)} ~ 현재${tenure ? ` (${tenure})` : ''}`
        : '<span class="doc-empty">입사일 ~ 현재</span>';

      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:14mm;">
          <div class="cert-frame">
            <div style="font-size:9.5pt;color:#333;margin-bottom:4mm;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div>
            <h2 class="doc-title" style="margin-bottom:9mm;">재 직 증 명 서</h2>

            <table class="doc-table thick-outer">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr>
                <th rowspan="2">인적사항</th>
                <th>성 명</th>
                <td colspan="2" class="bold">${valOrEmpty(s.name, '성명')}</td>
              </tr>
              <tr>
                <th>주민등록번호</th>
                <td colspan="2">${valOrEmpty(displayId, '생년월일 또는 주민등록번호')}</td>
              </tr>
              <tr>
                <th>현 주 소</th>
                <td colspan="3">${valOrEmpty(s.address, '현주소')}</td>
              </tr>
            </table>

            <table class="doc-table thick-outer">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr>
                <th>소 속</th>
                <td>${valOrEmpty(s.department, '부서명')}</td>
                <th>직 위</th>
                <td>${valOrEmpty(s.position, '직위')}</td>
              </tr>
              <tr>
                <th>담당 업무</th>
                <td colspan="3">${valOrEmpty(s.jobDuty, '담당 직무')}</td>
              </tr>
              <tr>
                <th>재직 기간</th>
                <td colspan="3" class="bold">${periodText}</td>
              </tr>
              <tr>
                <th>발급 용도</th>
                <td colspan="3">${valOrEmpty(s.purpose, '제출 용도')}</td>
              </tr>
            </table>

            <table class="doc-table">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr>
                <th>회 사 명</th>
                <td class="bold">${valOrEmpty(s.companyName, '회사명')}</td>
                <th>사업자번호</th>
                <td>${valOrEmpty(s.bizNo, '')}</td>
              </tr>
              <tr>
                <th>대 표 자</th>
                <td>${valOrEmpty(s.ceoName, '')}</td>
                <th>전화번호</th>
                <td>${valOrEmpty(s.companyPhone, '')}</td>
              </tr>
              <tr>
                <th>소 재 지</th>
                <td colspan="3">${valOrEmpty(s.companyAddress, '회사 소재지')}</td>
              </tr>
            </table>

            <div class="doc-statement" style="margin:10mm 0 6mm;">
              위 사람은 당사에 현재 재직 중임을 증명합니다.
            </div>

            <div class="doc-sign-block" style="text-align:center;">
              <div class="doc-date">${U.formatKoreanDate(s.issueDate)}</div>
              <div style="font-size:13pt;font-weight:800;margin-top:6mm;display:inline-flex;align-items:center;gap:4mm;">
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
})(window);
