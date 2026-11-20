/* ==========================================================================
   바로서식 (BaroDoc) — Category 4: 금전·부동산 신규 7종 서식
   hyeongeum, jibulgakseo, imdaecha, maemae, imdae-tongji,
   imdaeryo-yeongsujeung, mulpoom-maemae
   ========================================================================== */
(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;
  const P = window.BaroPlatform;
  const V = P.valOrEmpty;

  function twoPartyBoxes(ctx, left, right) {
    return `
      <div class="party-grid">
        <div class="party-box">
          <div class="party-box-title"><span>${U.escapeHtml(left.title)}</span>${ctx.renderStamp(left.slot, left.mark || '(인)')}</div>
          ${left.rows.map((r) => `<div class="party-line"><span class="lbl">${U.escapeHtml(r[0])}</span><span class="val ${r[2] ? 'bold' : ''}">${V(r[1], '')}</span></div>`).join('')}
        </div>
        <div class="party-box">
          <div class="party-box-title"><span>${U.escapeHtml(right.title)}</span>${ctx.renderStamp(right.slot, right.mark || '(인)')}</div>
          ${right.rows.map((r) => `<div class="party-line"><span class="lbl">${U.escapeHtml(r[0])}</span><span class="val ${r[2] ? 'bold' : ''}">${V(r[1], '')}</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  function twoPersonTargets(lSlot, lTitle, lPrefix, rSlot, rTitle, rPrefix) {
    return [
      {
        id: lSlot, label: `내 개인 정보를 ${lTitle}에 채우기`, slot: lSlot,
        personal: { name: `${lPrefix}Name`, birthOrId: `${lPrefix}Id`, phone: `${lPrefix}Phone`, address: `${lPrefix}Address` },
      },
      {
        id: rSlot, label: `내 개인 정보를 ${rTitle}에 채우기`, slot: rSlot,
        personal: { name: `${rPrefix}Name`, birthOrId: `${rPrefix}Id`, phone: `${rPrefix}Phone`, address: `${rPrefix}Address` },
      },
    ];
  }

  /* 1. 현금보관증 (hyeongeum) */
  F.registerSchema('hyeongeum', {
    stampSlots: [
      { key: 'keeper', label: '보관인(맡은 분) (인)', defaultName: '김보관', defaultShape: 'circle', sizeMm: 17 },
      { key: 'depositor', label: '임치인(맡긴 분) (인)', defaultName: '이임치', defaultShape: 'circle', sizeMm: 17 },
    ],
    profileTargets: twoPersonTargets('keeper', '보관인(맡은 분)', 'keeper', 'depositor', '임치인(맡긴 분)', 'depositor'),
    required: [{ field: 'amount', label: '보관 금액', type: 'money' }, { field: 'keeperName', label: '보관인 성명' }, { field: 'depositorName', label: '임치인 성명' }],
    presets: {
      purpose: [
        { label: '계약 진행 임시 보관', text: '부동산(또는 물품) 거래 계약 체결 시까지 계약금을 임시 보관하며, 임치인의 반환 요청 시 즉시 전액 반환한다.' },
        { label: '공동 자금 · 정산금 보관', text: '공동 행사 및 사업 정산금을 안전하게 보관하며, 약정 반환 기일에 지정 계좌로 전액 반환한다.' },
        { label: '임의 소비 금지 · 횡령 경고', text: '보관인은 본 보관금을 임의로 소비·유용하지 아니하며, 임치인의 반환 청구가 있을 때 지체 없이 원금 전액을 반환할 책임을 진다.' },
      ],
    },
    sections: [
      {
        title: '1. 보관 금액 및 반환 조건',
        fields: [
          { name: 'amount', label: '보관 금액 (원)', type: 'money', default: '5000000', sample: '5000000' },
          { name: 'depositDate', label: '보관 개시일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'returnDate', label: '반환 예정일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'purpose', label: '보관 사유 및 반환 약정', type: 'textarea', sample: '임치인의 위탁에 따라 상기 금액을 정히 보관하며, 임치인의 반환 요청 또는 반환 기일 도래 시 조건 없이 즉시 전액 반환할 것을 확약합니다.' },
        ],
      },
      {
        title: '2. 보관인(돈을 맡은 분) & 임치인(맡긴 분)',
        fields: [
          { name: 'keeperName', label: '보관인 성명', half: true, sample: '김보관' },
          { name: 'keeperId', label: '보관인 생년월일/주민번호', half: true, sample: '870510-1******' },
          { name: 'keeperPhone', label: '보관인 연락처', half: true, sample: '010-2222-3333' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'keeperAddress', label: '보관인 주소', sample: '서울특별시 강남구 역삼로 200' },
          { name: 'depositorName', label: '임치인 성명', half: true, sample: '이임치' },
          { name: 'depositorId', label: '임치인 생년월일/주민번호', half: true, sample: '900120-2******' },
          { name: 'depositorPhone', label: '임치인 연락처', half: true, sample: '010-4444-5555' },
          { name: 'depositorAddress', label: '임치인 주소', half: true, sample: '서울특별시 서초구 방배로 88' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
          <h2 class="doc-title">현 금 보 관 증</h2>
          <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:2mm;padding:4.5mm 5mm;margin-bottom:6mm;">
            <div style="display:flex;width:100%;justify-content:space-between;"><span class="biz-total-label">보 관 금 액</span><span class="biz-total-number" style="font-size:15pt;">₩ ${U.formatNumber(amt)} 원</span></div>
            <div style="font-size:10.5pt;font-weight:700;">${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
          </div>
          <table class="doc-table thick-outer">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr><th>보관 개시일</th><td>${U.formatKoreanDate(s.depositDate)}</td><th>반환 예정일</th><td class="bold">${U.formatKoreanDate(s.returnDate)}</td></tr>
            <tr><th>보관 사유 및<br>반환 약정</th><td colspan="3" style="min-height:48mm;vertical-align:top;padding:4mm;line-height:1.8;">${U.escapeHtmlWithBr(s.purpose || '')}</td></tr>
          </table>
          <div class="doc-statement" style="margin:6mm 0;">상기 금액을 틀림없이 현금(또는 계좌이체)으로 수령하여 보관하고 있음을 확인하며,<br>임치인의 반환 요구 시 지체 없이 반환할 것을 확약하고 본 현금보관증을 교부합니다.</div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 5mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '보관인 (돈을 맡은 사람)', slot: 'keeper', rows: [['성 명', s.keeperName, true], ['생년/주민', s.keeperId], ['연락처', s.keeperPhone], ['주 소', s.keeperAddress]] },
              { title: '임치인 (돈을 맡긴 사람)', slot: 'depositor', rows: [['성 명', s.depositorName, true], ['생년/주민', s.depositorId], ['연락처', s.depositorPhone], ['주 소', s.depositorAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 2. 지불각서 (jibulgakseo) */
  F.registerSchema('jibulgakseo', {
    stampSlots: [
      { key: 'debtor', label: '지불의무자 (인)', defaultName: '김채무', defaultShape: 'circle', sizeMm: 17 },
      { key: 'creditor', label: '수령권자 (인)', defaultName: '이채권', defaultShape: 'circle', sizeMm: 17 },
    ],
    profileTargets: twoPersonTargets('debtor', '지불의무자(채무자)', 'debtor', 'creditor', '수령권자(채권자)', 'creditor'),
    required: [{ field: 'amount', label: '지불 금액', type: 'money' }, { field: 'dueDate', label: '지불 기한' }, { field: 'debtorName', label: '지불의무자 성명' }, { field: 'creditorName', label: '수령권자 성명' }],
    validate: (s) => (U.parseNumber(s.delayRate) > 20 ? [{ level: 'danger', text: '지연손해금이 법정 최고이자율(연 20%)을 초과했습니다.' }] : []),
    presets: {
      pledgeText: [
        { label: '미수금·물품대금 전액 변제', text: '1. 본인은 귀하(귀사)에게 미지급된 물품·용역 대금 잔액을 상기 지불 기한까지 지정 계좌로 틀림없이 완제하겠습니다.\n2. 기한 도과 시 미변제 금액에 대하여 법정 범위 내 지연손해금을 가산하여 지급하며, 민·형사상 어떠한 이의도 제기하지 않겠습니다.' },
        { label: '분할 상환 · 기한이익상실', text: '1. 상기 채무 금액을 매월 약정일에 분할하여 지정 계좌로 입금하겠습니다.\n2. 분할 변제를 1회라도 연체할 경우 기한의 이익을 상실하고 잔액 전액을 즉시 일시 변제하겠습니다.' },
        { label: '손해배상·합의금 지불 확약', text: '1. 본인은 약정된 합의금(또는 손해배상금)을 기한 내 전액 지급할 것을 확약합니다.\n2. 미이행 시 강제집행 및 법적 절차 진행에 따른 일체의 비용을 부담하겠습니다.' },
      ],
    },
    sections: [
      {
        title: '1. 지불 금액 및 변제 기한',
        fields: [
          { name: 'cause', label: '채무 발생 원인', sample: '거래 물품 대금 미수금 정산' },
          { name: 'amount', label: '지불 약정 금액 (원)', type: 'money', default: '5000000', sample: '7500000' },
          { name: 'dueDate', label: '지불 기한', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'delayRate', label: '연체 지연손해금 (연 %, 최대 20)', type: 'number', half: true, default: '12' },
          { name: 'bankAccount', label: '입금 지정 계좌', sample: '우리은행 1002-123-456789 (예금주: 이채권)' },
          { name: 'pledgeText', label: '지불 확약 조항', type: 'textarea', minHeight: 95, sample: '1. 상기 지불 금액을 약정 기한까지 지정 계좌로 틀림없이 전액 변제할 것을 확약합니다.\n2. 만일 기한을 도과할 경우 지연손해금을 가산 지급하며, 채권자의 법적 조치에 일체의 이의를 제기하지 않겠습니다.' },
        ],
      },
      {
        title: '2. 지불의무자(채무자) & 수령권자(채권자)',
        fields: [
          { name: 'debtorName', label: '지불의무자 성명/상호', half: true, sample: '김채무' },
          { name: 'debtorId', label: '생년월일/사업자번호', half: true, sample: '890312-1******' },
          { name: 'debtorPhone', label: '연락처', half: true, sample: '010-1111-2222' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'debtorAddress', label: '지불의무자 주소', sample: '서울특별시 강동구 천호대로 100' },
          { name: 'creditorName', label: '수령권자(귀하)', half: true, sample: '이채권' },
          { name: 'creditorId', label: '수령권자 생년/사업자번호', half: true, sample: '850901-1******' },
          { name: 'creditorPhone', label: '수령권자 연락처', half: true, sample: '010-3333-4444' },
          { name: 'creditorAddress', label: '수령권자 주소', half: true, sample: '서울특별시 송파구 백제고분로 50' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <h2 class="doc-title compact">지 불 각 서</h2>
          <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:2mm;padding:4mm 5mm;margin-bottom:5mm;">
            <div style="display:flex;width:100%;justify-content:space-between;"><span class="biz-total-label">지 불 약 정 금 액</span><span class="biz-total-number">₩ ${U.formatNumber(amt)} 원</span></div>
            <div style="font-size:10pt;font-weight:700;">${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
          </div>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr><th>채무 발생 원인</th><td colspan="3" class="bold">${V(s.cause, '')}</td></tr>
            <tr><th>지 불 기 한</th><td class="bold">${U.formatKoreanDate(s.dueDate)}</td><th>지연손해금</th><td>연 ${U.escapeHtml(s.delayRate || '12')}%</td></tr>
            <tr><th>입 금 계 좌</th><td colspan="3">${V(s.bankAccount, '')}</td></tr>
            <tr><th>지불 확약 조항</th><td colspan="3" style="min-height:42mm;vertical-align:top;padding:3.5mm;line-height:1.75;">${U.escapeHtmlWithBr(s.pledgeText || '')}</td></tr>
          </table>
          <p style="text-align:center;margin:5mm 0;">위와 같이 틀림없이 지불할 것을 확약하며 본 지불각서를 작성하여 교부합니다.</p>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '지불의무자 (각서인)', slot: 'debtor', rows: [['성 명', s.debtorName, true], ['생년/번호', s.debtorId], ['연락처', s.debtorPhone], ['주 소', s.debtorAddress]] },
              { title: '수령권자 (채권자)', slot: 'creditor', rows: [['성 명', s.creditorName, true], ['생년/번호', s.creditorId], ['연락처', s.creditorPhone], ['주 소', s.creditorAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 3. 부동산 임대차계약서 (전세·월세) (imdaecha) */
  F.registerSchema('imdaecha', {
    stampSlots: [
      { key: 'lessor', label: '임대인(집주인) (인)', defaultName: '김임대', defaultShape: 'circle', sizeMm: 16 },
      { key: 'lessee', label: '임차인(세입자) (인)', defaultName: '이임차', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: twoPersonTargets('lessor', '임대인(집주인)', 'lessor', 'lessee', '임차인(세입자)', 'lessee'),
    required: [{ field: 'propertyAddress', label: '부동산 소재지' }, { field: 'deposit', label: '보증금', type: 'money' }, { field: 'lessorName', label: '임대인 성명' }, { field: 'lesseeName', label: '임차인 성명' }],
    validate: (s) => {
      const dep = U.parseNumber(s.deposit);
      const down = U.parseNumber(s.downPayment);
      const bal = dep - down;
      const alerts = [];
      if (bal < 0) alerts.push({ level: 'danger', text: '계약금이 총 보증금보다 큽니다. 금액을 확인해 주세요.' });
      if (s.startDate && s.endDate && s.endDate <= s.startDate) alerts.push({ level: 'warn', text: '임대차 종료일이 시작일보다 빠르거나 같습니다.' });
      return alerts;
    },
    presets: {
      specialTerms: [
        { label: '전세사기 예방 필수 특약 (강력추천)', text: '1. 임대인은 임차인의 전입신고 및 확정일자 익일까지 현재 등기부등본상 권리 변동(근저당 설정 등)이 없도록 유지하며, 위반 시 임차인은 계약을 해제하고 보증금 전액을 반환받는다.\n2. 임차인의 전세자금대출 또는 전세보증보험 가입이 임대인·목적물 사유로 거절될 경우 본 계약은 무효로 하고 계약금 전액을 즉시 반환한다.\n3. 입주 전 보일러·누수 등 주요 시설물 하자는 임대인 부담으로 수선한다.' },
        { label: '월세 · 원상복구 · 반려동물 특약', text: '1. 통상적인 사용에 따른 자연 마모는 원상복구 대상에서 제외한다.\n2. 공과금 및 관리비(수도·전기·가스)는 입주일 기준으로 정산한다.\n3. 만기 전 중도 퇴실 시 신규 임차인 주선 및 중개보수 부담은 상호 협의한다.' },
        { label: '상가 임대차 표준 특약', text: '1. 권리금 회수 기회 보호 등 상가건물임대차보호법 규정을 준수한다.\n2. 임대료 및 관리비 부가가치세(10%)는 별도이며 매월 전자세금계산서를 발행한다.' },
      ],
    },
    sections: [
      {
        title: '1. 부동산 표시 및 전세/월세 금액',
        fields: [
          { name: 'leaseType', label: '계약 유형', type: 'select', half: true, default: '전세', sample: '월세 (보증부)', options: ['전세', '월세 (보증부)', '반전세', '상가 임대차'] },
          { name: 'area', label: '임대 면적 (㎡)', half: true, placeholder: '예: 전용 59.84㎡', sample: '전용 59.84㎡ (방2·거실1)' },
          { name: 'propertyAddress', label: '부동산 소재지 (주소 및 동·호수)', sample: '서울특별시 마포구 월드컵북로 120, 101동 802호' },
          { name: 'deposit', label: '보증금 총액 (원)', type: 'money', default: '200000000', sample: '50000000' },
          { name: 'downPayment', label: '계약금 (계약 시 지급, 원)', type: 'number', half: true, default: '20000000', sample: '5000000' },
          { name: 'monthlyRent', label: '월 차임 (월세, 전세면 0)', type: 'number', half: true, default: '0', sample: '850000' },
          { name: 'rentPayDay', label: '월세 지급일 / 관리비', half: true, default: '매월 25일 (선불)', sample: '매월 25일 / 관리비 별도' },
          { name: 'balanceDate', label: '잔금 지급일 (입주일)', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'startDate', label: '임대차 시작일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'endDate', label: '임대차 종료일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 25) },
          { name: 'specialTerms', label: '특약 사항', type: 'textarea', minHeight: 95, sample: '1. 임대인은 임차인의 전입신고 익일까지 등기부상 근저당 등 추가 권리 변동을 발생시키지 않는다.\n2. 시설물(보일러·누수) 하자는 임대인 부담으로 수선하며, 통상 마모는 원상복구에서 제외한다.' },
        ],
      },
      {
        title: '2. 임대인(집주인) & 임차인(세입자)',
        fields: [
          { name: 'lessorName', label: '임대인 성명', half: true, sample: '김임대' },
          { name: 'lessorId', label: '임대인 생년/주민번호', half: true, sample: '720514-1******' },
          { name: 'lessorPhone', label: '임대인 연락처', half: true, sample: '010-1234-5678' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'lessorAddress', label: '임대인 주소', sample: '서울특별시 용산구 이촌로 100' },
          { name: 'lesseeName', label: '임차인 성명', half: true, sample: '이임차' },
          { name: 'lesseeId', label: '임차인 생년/주민번호', half: true, sample: '930820-2******' },
          { name: 'lesseePhone', label: '임차인 연락처', half: true, sample: '010-8765-4321' },
          { name: 'lesseeAddress', label: '임차인 주소', half: true, sample: '서울특별시 은평구 통일로 500' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const dep = U.parseNumber(s.deposit);
      const down = U.parseNumber(s.downPayment);
      const bal = Math.max(0, dep - down);
      const rent = U.parseNumber(s.monthlyRent);
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">부동산 임대차 계약서 (${U.escapeHtml(s.leaseType || '전세')})</h2>
          <p style="margin:0 0 2.5mm;">임대인과 임차인 쌍방은 아래 표시 부동산에 관하여 다음 계약 내용과 같이 임대차계약을 체결한다.</p>
          <table class="doc-table compact thick-outer" style="margin-bottom:3mm;">
            <colgroup><col style="width:18%"><col style="width:46%"><col style="width:14%"><col style="width:22%"></colgroup>
            <tr><th>소 재 지</th><td class="bold">${V(s.propertyAddress, '부동산 주소')}</td><th>임대 면적</th><td>${V(s.area, '')}</td></tr>
            <tr><th>보 증 금</th><td colspan="3" class="bold">₩ ${U.formatNumber(dep)}원 (${U.escapeHtml(U.formatKoreanCurrency(dep))} / ${U.escapeHtml(U.formatHanjaCurrency(dep))})</td></tr>
            <tr><th>계 약 금</th><td>₩ ${U.formatNumber(down)}원 (계약 시 지급)</td><th>잔 금</th><td class="bold">₩ ${U.formatNumber(bal)}원 (${U.formatKoreanDate(s.balanceDate)})</td></tr>
            <tr><th>월 차 임</th><td>${rent > 0 ? `<strong>월 ₩ ${U.formatNumber(rent)}원</strong> (${V(s.rentPayDay, '')})` : '없음 (전세)'}</td><th>임대 기간</th><td>${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</td></tr>
          </table>
          <div class="contract-item"><strong>제1조 (목적물 인도 및 기간)</strong> 임대인은 위 부동산을 임대차 목적대로 사용·수익할 수 있는 상태로 ${U.formatKoreanDate(s.startDate)}까지 임차인에게 인도한다.</div>
          <div class="contract-item"><strong>제2조 (용도 변경 및 전대 금지)</strong> 임차인은 임대인의 서면 동의 없이 용도나 구조를 변경하거나 전대·임차권 양도를 할 수 없다.</div>
          <div class="contract-item"><strong>제3조 (계약 해지 및 보증금 반환)</strong> 임대차 기간 종료 시 임차인은 목적물을 원상회복하여 반환하며, 임대인은 동시에 보증금을 반환한다.</div>
          <div class="contract-item"><strong>제4조 (채무불이행 및 손해배상)</strong> 일방이 계약을 위배할 경우 상대방은 서면 최고 후 계약을 해제할 수 있으며 계약금을 손해배상 기준으로 본다.</div>
          <div class="contract-item"><strong>[특약 사항]</strong><div style="border:1px solid #333;padding:2.5mm 3.5mm;margin-top:1mm;background:#fafafa;min-height:22mm;line-height:1.55;">${U.escapeHtmlWithBr(s.specialTerms || '특이사항 없음')}</div></div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 3.5mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '임대인 (집주인)', slot: 'lessor', rows: [['성 명', s.lessorName, true], ['생년/주민', s.lessorId], ['연락처', s.lessorPhone], ['주 소', s.lessorAddress]] },
              { title: '임차인 (세입자)', slot: 'lessee', rows: [['성 명', s.lesseeName, true], ['생년/주민', s.lesseeId], ['연락처', s.lesseePhone], ['주 소', s.lesseeAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 4. 부동산 매매계약서 (maemae) */
  F.registerSchema('maemae', {
    stampSlots: [
      { key: 'seller', label: '매도인(파는 분) (인)', defaultName: '김매도', defaultShape: 'circle', sizeMm: 16 },
      { key: 'buyer', label: '매수인(사는 분) (인)', defaultName: '이매수', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: twoPersonTargets('seller', '매도인(파는 분)', 'seller', 'buyer', '매수인(사는 분)', 'buyer'),
    required: [{ field: 'propertyAddress', label: '부동산 소재지' }, { field: 'salePrice', label: '매매대금', type: 'money' }, { field: 'sellerName', label: '매도인 성명' }, { field: 'buyerName', label: '매수인 성명' }],
    validate: (s) => {
      const total = U.parseNumber(s.salePrice);
      const paid = U.parseNumber(s.downPayment) + U.parseNumber(s.midPayment);
      return paid > total ? [{ level: 'danger', text: '계약금+중도금 합계가 총 매매대금을 초과합니다.' }] : [];
    },
    presets: {
      specialTerms: [
        { label: '근저당 말소 · 현 시설물 매매', text: '1. 현 시설물 상태의 매매이며, 매도인은 잔금 지급과 동시에 등기부상 근저당권 및 모든 제한물권을 말소하여 완전한 소유권을 이전한다.\n2. 잔금일 기준 공과금·관리비·재산세 등 제세공과금은 일할 정산한다.\n3. 매매대금 잔금 지급과 동시에 소유권이전등기 필요 서류 일체를 교부한다.' },
        { label: '기존 임차인 승계 조건', text: '1. 본 부동산에 거주 중인 기존 임차인의 보증금 반환 의무를 매수인이 승계하며, 해당 보증금은 잔금에서 공제한다.' },
      ],
    },
    sections: [
      {
        title: '1. 부동산 표시 및 매매대금',
        fields: [
          { name: 'propertyAddress', label: '부동산 소재지', sample: '서울특별시 송파구 잠실로 200, 205동 1203호' },
          { name: 'area', label: '토지 / 건물 면적', half: true, sample: '대지권 42.1㎡ / 전용 84.9㎡' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'salePrice', label: '매매 대금 총액 (원)', type: 'money', default: '500000000', sample: '650000000' },
          { name: 'downPayment', label: '계약금 (원)', type: 'number', half: true, default: '50000000', sample: '65000000' },
          { name: 'midPayment', label: '중도금 (없으면 0)', type: 'number', half: true, default: '150000000', sample: '200000000' },
          { name: 'midDate', label: '중도금 지급일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'balanceDate', label: '잔금 지급 및 인도일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 2) },
          { name: 'specialTerms', label: '특약 사항', type: 'textarea', sample: '1. 현 시설물 상태의 매매이며, 매도인은 잔금 수령과 동시에 등기부상 근저당권 등 제한물권을 말소한다.\n2. 공과금 및 관리비는 잔금일 기준으로 정산한다.' },
        ],
      },
      {
        title: '2. 매도인(파는 분) & 매수인(사는 분)',
        fields: [
          { name: 'sellerName', label: '매도인 성명', half: true, sample: '김매도' },
          { name: 'sellerId', label: '매도인 생년/주민번호', half: true, sample: '680310-1******' },
          { name: 'sellerPhone', label: '매도인 연락처', half: true, sample: '010-2222-4444' },
          { name: 'sellerAddress', label: '매도인 주소', half: true, sample: '서울특별시 송파구 잠실로 200' },
          { name: 'buyerName', label: '매수인 성명', half: true, sample: '이매수' },
          { name: 'buyerId', label: '매수인 생년/주민번호', half: true, sample: '850615-1******' },
          { name: 'buyerPhone', label: '매수인 연락처', half: true, sample: '010-5555-7777' },
          { name: 'buyerAddress', label: '매수인 주소', half: true, sample: '경기도 성남시 분당구 서현로 180' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const total = U.parseNumber(s.salePrice);
      const down = U.parseNumber(s.downPayment);
      const mid = U.parseNumber(s.midPayment);
      const bal = Math.max(0, total - down - mid);
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">부 동 산 매 매 계 약 서</h2>
          <p style="margin:0 0 2.5mm;">매도인과 매수인 쌍방은 아래 표시 부동산에 관하여 다음 계약 내용과 같이 매매계약을 체결한다.</p>
          <table class="doc-table compact thick-outer" style="margin-bottom:3mm;">
            <colgroup><col style="width:18%"><col style="width:42%"><col style="width:16%"><col style="width:24%"></colgroup>
            <tr><th>소 재 지</th><td class="bold">${V(s.propertyAddress, '')}</td><th>면 적</th><td>${V(s.area, '')}</td></tr>
            <tr><th>매 매 대 금</th><td colspan="3" class="bold">₩ ${U.formatNumber(total)}원 (${U.escapeHtml(U.formatKoreanCurrency(total))} / ${U.escapeHtml(U.formatHanjaCurrency(total))})</td></tr>
            <tr><th>계 약 금</th><td>₩ ${U.formatNumber(down)}원 (계약 시)</td><th>중 도 금</th><td>${mid > 0 ? `₩ ${U.formatNumber(mid)}원 (${U.formatKoreanDate(s.midDate)})` : '없음'}</td></tr>
            <tr><th>잔 금</th><td colspan="3" class="bold">₩ ${U.formatNumber(bal)}원 (지급 및 인도일 : ${U.formatKoreanDate(s.balanceDate)})</td></tr>
          </table>
          <div class="contract-item"><strong>제1조 (소유권 이전 및 인도)</strong> 매도인은 매매대금 잔금 수령과 동시에 매수인에게 소유권이전등기에 필요한 모든 서류를 교부하고 부동산을 인도한다.</div>
          <div class="contract-item"><strong>제2조 (제한물권 소멸)</strong> 매도인은 소유권 행사를 제한하는 사유나 제세공과금 미납분이 있을 경우 잔금 수령 전까지 완전 제거한다.</div>
          <div class="contract-item"><strong>제3조 (계약의 해제)</strong> 중도금 지급 전까지 매도인은 계약금의 배액을 상환하고, 매수인은 계약금을 포기함으로써 본 계약을 해제할 수 있다.</div>
          <div class="contract-item"><strong>[특약 사항]</strong><div style="border:1px solid #333;padding:2.5mm 3.5mm;margin-top:1mm;background:#fafafa;min-height:24mm;line-height:1.55;">${U.escapeHtmlWithBr(s.specialTerms || '')}</div></div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 3.5mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '매도인 (파는 사람)', slot: 'seller', rows: [['성 명', s.sellerName, true], ['생년/주민', s.sellerId], ['연락처', s.sellerPhone], ['주 소', s.sellerAddress]] },
              { title: '매수인 (사는 사람)', slot: 'buyer', rows: [['성 명', s.buyerName, true], ['생년/주민', s.buyerId], ['연락처', s.buyerPhone], ['주 소', s.buyerAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 5. 임대차 계약 갱신·해지 통지서 (imdae-tongji) */
  F.registerSchema('imdae-tongji', {
    stampSlots: [{ key: 'sender', label: '통지인 (인)', defaultName: '이임차', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'sender', label: '내 개인 정보를 통지인에 채우기', slot: 'sender', personal: { name: 'senderName', phone: 'senderPhone', address: 'senderAddress', bankAccount: 'bankAccount' } }],
    required: [{ field: 'receiverName', label: '수신인 성명' }, { field: 'senderName', label: '통지인 성명' }, { field: 'propertyAddress', label: '임대차 부동산 주소' }],
    presets: {
      noticeBody: [
        { label: '만기 해지 및 보증금 반환 요청', text: '1. 본인은 귀하와 체결한 위 부동산 임대차계약에 대하여 만기일 도래에 따라 계약을 갱신하지 않고 종료(해지)하고자 공식 통지합니다.\n2. 만기 당일 목적물 인도 및 퇴거와 동시에 임차보증금 전액을 아래 지정 계좌로 반환하여 주시기 바랍니다.' },
        { label: '계약갱신청구권 행사 (2년 연장)', text: '1. 본인은 주택임대차보호법 제6조의3에 따라 기존 임대차계약의 갱신을 청구(계약갱신청구권 행사)합니다.\n2. 법정 상한(5% 이내) 범위에서 임대 조건 협의를 요청드립니다.' },
        { label: '묵시적 갱신 후 3개월 해지 통지', text: '1. 본 임대차계약은 묵시적 갱신 상태로, 주택임대차보호법 제6조의2에 따라 계약 해지를 통지합니다.\n2. 본 통지가 도달한 날로부터 3개월이 경과하는 시점에 계약 해지 효력이 발생하므로 해당 일자에 보증금 반환을 요청합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 통지 유형 및 임대차 정보',
        fields: [
          { name: 'noticeType', label: '통지 구분', type: 'select', half: true, default: '임대차 계약 해지 통지서', options: ['임대차 계약 해지 통지서', '계약갱신청구권 행사 통지서', '묵시적 갱신 후 해지 통지서', '보증금 반환 최고 통지서'] },
          { name: 'writtenDate', label: '통지일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'propertyAddress', label: '임대차 목적물 주소', sample: '서울특별시 마포구 월드컵북로 120, 101동 802호' },
          { name: 'endDate', label: '계약 만기일 (퇴거 예정일)', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 3) },
          { name: 'deposit', label: '반환받을 보증금 (원)', type: 'money', default: '200000000', sample: '200000000' },
          { name: 'bankAccount', label: '보증금 반환 계좌 (해지 시)', sample: '국민은행 123-456-789012 (예금주: 이임차)' },
          { name: 'noticeBody', label: '통지 내용', type: 'textarea', minHeight: 105, sample: '1. 위 부동산 임대차계약과 관련하여 만기일 도래에 따라 계약 갱신 의사가 없음을 공식 통지합니다.\n2. 계약 만기일에 목적물 인도와 동시에 보증금 전액을 지정 계좌로 반환하여 주시기 바랍니다.' },
        ],
      },
      {
        title: '2. 수신인 & 통지인',
        fields: [
          { name: 'receiverName', label: '수신인 (임대인/임차인)', half: true, sample: '김임대' },
          { name: 'receiverAddress', label: '수신인 주소', half: true, sample: '서울특별시 용산구 이촌로 100' },
          { name: 'senderName', label: '통지인 성명', half: true, sample: '이임차' },
          { name: 'senderPhone', label: '통지인 연락처', half: true, sample: '010-8765-4321' },
          { name: 'senderAddress', label: '통지인 주소', sample: '서울특별시 마포구 월드컵북로 120, 101동 802호' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const dep = U.parseNumber(s.deposit);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm 17mm;">
          <h2 class="doc-title compact">${U.escapeHtml(s.noticeType || '임대차 계약 해지 통지서')}</h2>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:18%"><col style="width:82%"></colgroup>
            <tr><th>수 신 인</th><td><strong>${V(s.receiverName, '')} 귀하</strong> (${V(s.receiverAddress, '')})</td></tr>
            <tr><th>발 신 인</th><td><strong>${V(s.senderName, '')}</strong> (${V(s.senderPhone, '')} / ${V(s.senderAddress, '')})</td></tr>
            <tr><th>목 적 물</th><td class="bold">${V(s.propertyAddress, '')}</td></tr>
            <tr><th>계약 만기일</th><td class="bold">${U.formatKoreanDate(s.endDate)}</td></tr>
            <tr><th>보 증 금</th><td class="bold">₩ ${U.formatNumber(dep)}원 (${U.escapeHtml(U.formatKoreanCurrency(dep))} / ${U.escapeHtml(U.formatHanjaCurrency(dep))})</td></tr>
            ${s.bankAccount ? `<tr><th>반환 계좌</th><td>${U.escapeHtml(s.bankAccount)}</td></tr>` : ''}
          </table>
          <div style="border:1.5px solid #222;padding:5.5mm;margin-top:4mm;min-height:76mm;line-height:1.85;font-size:10.3pt;">
            <p style="font-weight:700;margin:0 0 3mm;">[통지 내용]</p>
            <div>${U.escapeHtmlWithBr(s.noticeBody || '')}</div>
          </div>
          <p style="text-align:center;margin:6mm 0 4mm;">주택임대차보호법 등 관련 법령에 근거하여 위와 같이 공식 통지합니다.</p>
          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row"><span>통지인 :</span><span class="doc-sign-name">${V(s.senderName, '홍 길 동')}</span>${ctx.renderStamp('sender', '(인)')}</div>
            <div class="doc-recipient">${V(s.receiverName, '○○○')} 귀하</div>
          </div>
        </div>
      `;
    },
  });

  /* 6. 임대료·보증금 영수증 (imdaeryo-yeongsujeung) */
  F.registerSchema('imdaeryo-yeongsujeung', {
    stampSlots: [{ key: 'lessor', label: '임대인(영수인) (인)', defaultName: '김임대', defaultShape: 'circle', sizeMm: 18 }],
    profileTargets: [{ id: 'lessor', label: '내 개인 정보를 임대인에 채우기', slot: 'lessor', personal: { name: 'lessorName', birthOrId: 'lessorId', phone: 'lessorPhone', address: 'lessorAddress' } }],
    required: [{ field: 'lesseeName', label: '임차인 성명' }, { field: 'amount', label: '영수 금액', type: 'money' }, { field: 'lessorName', label: '임대인 성명' }],
    presets: {
      note: [
        { label: '계약금 수령 확인', text: '상기 부동산 임대차 계약금을 정히 영수하였으며, 잔금은 입주일에 정산합니다.' },
        { label: '월세(차임) 영수 · 연말정산용', text: '해당 월분 월세(차임)를 정히 영수하였음을 확인합니다. (월세 세액공제 참고 증빙)' },
        { label: '보증금 잔금 완납 확인', text: '임대차 보증금 잔금 전액을 수령 완료하였음을 확인합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 임대 목적물 및 수령 금액',
        fields: [
          { name: 'payKind', label: '수령 항목', type: 'select', half: true, default: '보증금 계약금', options: ['보증금 계약금', '보증금 중도금', '보증금 잔금', '월 차임 (월세)', '관리비 포함 월세'] },
          { name: 'receiptDate', label: '영수일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'propertyAddress', label: '임대차 목적물 주소', sample: '서울특별시 마포구 성미산로 55, 302호' },
          { name: 'lesseeName', label: '임차인 (지급인)', half: true, sample: '박지민' },
          { name: 'payMethod', label: '결제 수단', half: true, default: '계좌이체', sample: '계좌이체 (국민은행)' },
          { name: 'amount', label: '영수 금액 (원)', type: 'money', default: '1000000', sample: '5000000' },
          { name: 'periodLabel', label: '해당 기간 / 비고 내역', placeholder: '예: 2026년 11월분 월세 또는 계약금 1차', sample: '임대차 보증금 5,000만원 중 계약금 1차분' },
          { name: 'note', label: '확인 문구', type: 'textarea', default: '상기 임대차 관련 금액을 정히 영수(수령)하였음을 확인합니다.' },
        ],
      },
      {
        title: '2. 임대인 (영수인) 정보',
        fields: [
          { name: 'lessorName', label: '임대인 성명', half: true, sample: '김임대' },
          { name: 'lessorId', label: '생년월일 / 사업자번호', half: true, sample: '720514-1******' },
          { name: 'lessorPhone', label: '연락처', half: true, sample: '010-1234-5678' },
          { name: 'lessorAddress', label: '임대인 주소', half: true, sample: '서울특별시 용산구 이촌로 100' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
          <div class="cert-frame">
            <h2 class="doc-title" style="margin-bottom:6mm;">임대료 · 보증금 영수증</h2>
            <div class="biz-recipient-line" style="margin-bottom:5mm;"><span>${V(s.lesseeName, '임차인 성명')}</span><span style="font-size:11pt;font-weight:700;">귀하</span></div>
            <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:2mm;padding:4.5mm 5mm;margin-bottom:5mm;">
              <div style="display:flex;width:100%;justify-content:space-between;"><span class="biz-total-label">영수 금액 (${U.escapeHtml(s.payKind || '')})</span><span class="biz-total-number">₩ ${U.formatNumber(amt)} 원</span></div>
              <div style="font-size:10.5pt;font-weight:700;">${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
            </div>
            <table class="doc-table thick-outer">
              <colgroup><col style="width:24%"><col style="width:76%"></colgroup>
              <tr><th>임대차 목적물</th><td class="bold">${V(s.propertyAddress, '')}</td></tr>
              <tr><th>수령 항목 / 기간</th><td>${V(s.payKind, '')} ${s.periodLabel ? `(${U.escapeHtml(s.periodLabel)})` : ''}</td></tr>
              <tr><th>결제 수단 / 일자</th><td>${V(s.payMethod, '')} · ${U.formatKoreanDate(s.receiptDate)}</td></tr>
              <tr><th>비 고</th><td style="min-height:28mm;vertical-align:top;padding:3.5mm;line-height:1.7;">${U.escapeHtmlWithBr(s.note || '')}</td></tr>
            </table>
            <div class="doc-statement">위 금액을 틀림없이 영수하였음을 확인합니다.</div>
            <div class="doc-sign-block" style="text-align:center;">
              <div class="doc-date">${U.formatKoreanDate(s.receiptDate)}</div>
              <div style="font-size:12pt;font-weight:800;display:inline-flex;align-items:center;gap:4mm;">
                <span>임대인 (영수인) : ${V(s.lessorName, '○○○')}</span>
                ${ctx.renderStamp('lessor', '(인)')}
              </div>
              <div style="font-size:9.2pt;color:#444;margin-top:3mm;">${V(s.lessorId, '')} · ${V(s.lessorPhone, '')} · ${V(s.lessorAddress, '')}</div>
            </div>
          </div>
        </div>
      `;
    },
  });

  /* 7. 중고·물품 매매계약서 (mulpoom-maemae) */
  F.registerSchema('mulpoom-maemae', {
    stampSlots: [
      { key: 'seller', label: '매도인(판매자) (인)', defaultName: '김판매', defaultShape: 'circle', sizeMm: 16 },
      { key: 'buyer', label: '매수인(구매자) (인)', defaultName: '이구매', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: twoPersonTargets('seller', '매도인(판매자)', 'seller', 'buyer', '매수인(구매자)', 'buyer'),
    required: [{ field: 'itemName', label: '거래 물품명' }, { field: 'price', label: '매매 대금', type: 'money' }, { field: 'sellerName', label: '매도인 성명' }, { field: 'buyerName', label: '매수인 성명' }],
    presets: {
      terms: [
        { label: '현 상태 직거래 · 환불 불가 표준', text: '1. 매수인은 거래 당일 물품의 외관 및 정상 작동 여부를 직접 확인하고 인수하며, 인도 이후 단순 변심에 의한 교환·환불은 불가하다.\n2. 매도인은 본 물품이 정당한 소유물이며 분실·도난·압류품이 아님을 보증한다.' },
        { label: '중고차·기계 하자 고지 특약', text: '1. 매도인은 인도 전 알려진 주요 수리 이력 및 결함 사항을 매수인에게 성실히 고지하였다.\n2. 소유권 이전 등록 및 부대 비용은 매수인 부담으로 인도일로부터 15일 이내 완료한다.' },
      ],
    },
    sections: [
      {
        title: '1. 거래 물품 및 매매 대금',
        fields: [
          { name: 'itemName', label: '물품명 (모델명)', sample: '애플 맥북 프로 16인치 M3 Max (36GB / 1TB)' },
          { name: 'serialNo', label: '시리얼번호 / 차량번호 (선택)', half: true, sample: 'C02X9481ABCD' },
          { name: 'condition', label: '물품 상태', half: true, default: '중고 양호 (정상 작동 확인)', sample: '중고 A급 (충전기·박스 포함, 정상 작동)' },
          { name: 'price', label: '매매 대금 (원)', type: 'money', default: '2000000', sample: '3200000' },
          { name: 'payMethod', label: '결제 방식', half: true, default: '현장 계좌이체', sample: '당일 즉시 계좌이체' },
          { name: 'handoverDate', label: '물품 인도일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'terms', label: '소유권 보증 및 특약 사항', type: 'textarea', sample: '1. 매도인은 본 물품이 도난·분실품이 아닌 정당한 소유물임을 보증한다.\n2. 매수인은 현장 검수 후 인수하며, 고지되지 않은 중대한 숨은 하자 외에는 인도 후 환불을 요구하지 않는다.' },
        ],
      },
      {
        title: '2. 매도인(판매자) & 매수인(구매자)',
        fields: [
          { name: 'sellerName', label: '매도인 성명', half: true, sample: '김판매' },
          { name: 'sellerId', label: '매도인 생년월일', half: true, sample: '910412-1******' },
          { name: 'sellerPhone', label: '매도인 연락처', half: true, sample: '010-1212-3434' },
          { name: 'writtenDate', label: '계약일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'sellerAddress', label: '매도인 주소', sample: '서울특별시 강남구 논현로 150' },
          { name: 'buyerName', label: '매수인 성명', half: true, sample: '이구매' },
          { name: 'buyerId', label: '매수인 생년월일', half: true, sample: '940825-1******' },
          { name: 'buyerPhone', label: '매수인 연락처', half: true, sample: '010-5656-7878' },
          { name: 'buyerAddress', label: '매수인 주소', half: true, sample: '경기도 성남시 분당구 판교로 200' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const price = U.parseNumber(s.price);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <h2 class="doc-title compact">중고 · 물품 매매계약서</h2>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
            <tr><th>물 품 명</th><td colspan="3" class="bold">${V(s.itemName, '')}</td></tr>
            <tr><th>고유/모델번호</th><td>${V(s.serialNo, '-')}</td><th>물품 상태</th><td>${V(s.condition, '')}</td></tr>
            <tr><th>매 매 대 금</th><td colspan="3" class="bold">₩ ${U.formatNumber(price)}원 (${U.escapeHtml(U.formatKoreanCurrency(price))} / ${U.escapeHtml(U.formatHanjaCurrency(price))})</td></tr>
            <tr><th>결 제 방 식</th><td>${V(s.payMethod, '')}</td><th>인 도 일 자</th><td>${U.formatKoreanDate(s.handoverDate)}</td></tr>
            <tr><th>특 약 사 항</th><td colspan="3" style="min-height:46mm;vertical-align:top;padding:3.5mm;line-height:1.75;">${U.escapeHtmlWithBr(s.terms || '')}</td></tr>
          </table>
          <p style="text-align:center;margin:5mm 0;">매도인과 매수인은 위 물품의 매매 조건에 합의하고 물품 인도 및 대금 정산을 확인하며 본 계약서를 2부 작성하여 각 1부씩 보관한다.</p>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '매도인 (판매자)', slot: 'seller', rows: [['성 명', s.sellerName, true], ['생년월일', s.sellerId], ['연락처', s.sellerPhone], ['주 소', s.sellerAddress]] },
              { title: '매수인 (구매자)', slot: 'buyer', rows: [['성 명', s.buyerName, true], ['생년월일', s.buyerId], ['연락처', s.buyerPhone], ['주 소', s.buyerAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });
})(window);
