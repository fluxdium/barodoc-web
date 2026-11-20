/* ==========================================================================
   바로서식 (BaroDoc) — Category 5: 일상·법률·민원 신규 6종 서식
   gyotong-habuiseo, gakseo, sasil, naeyong, tanwonseo, donguiseo
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

  /* 1. 교통사고 합의서 (gyotong-habuiseo) */
  F.registerSchema('gyotong-habuiseo', {
    stampSlots: [
      { key: 'victim', label: '피해자(갑) (인)', defaultName: '김피해', defaultShape: 'circle', sizeMm: 16 },
      { key: 'driver', label: '가해자(을) (인)', defaultName: '이가해', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: [
      { id: 'victim', label: '내 개인 정보를 피해자(갑)에 채우기', slot: 'victim', personal: { name: 'victimName', birthOrId: 'victimId', phone: 'victimPhone', address: 'victimAddress', bankAccount: 'bankAccount' } },
      { id: 'driver', label: '내 개인 정보를 가해자(을)에 채우기', slot: 'driver', personal: { name: 'driverName', birthOrId: 'driverId', phone: 'driverPhone', address: 'driverAddress' } },
    ],
    required: [{ field: 'accidentPlace', label: '사고 장소' }, { field: 'victimName', label: '피해자 성명' }, { field: 'driverName', label: '가해자 성명' }],
    presets: {
      clauses: [
        { label: '대물(차량 파손) 현장 합의', text: '1. 가해자(을)는 피해자(갑)에게 차량 수리비 및 렌트비 일체 명목으로 위 합의금을 지급한다.\n2. 피해자(갑)는 위 합의금을 수령함과 동시에 본 사고로 인한 민·형사상 일체의 이의 제기 및 추가 청구를 하지 아니한다.' },
        { label: '형사 합의 (처벌불원 · 채권양도 제외)', text: '1. 본 합의금은 자동차보험금과 별개의 형사상 위로금이며, 피해자의 보험사에 대한 민사 손해배상청구권에는 영향을 미치지 아니한다.\n2. 피해자(갑)는 위 형사 합의금을 수령하고 가해자(을)의 형사 처벌을 원하지 아니한다(처벌불원 의사 확인).' },
        { label: '대인·대물 일괄 종결 합의', text: '1. 을은 갑에게 치료비·위자료·차량 수리비를 포함한 일괄 합의금을 지급 기일까지 송금한다.\n2. 갑은 합의금 전액 수령 후 본 사고와 관련한 모든 민·형사상 분쟁을 최종 종결한다.' },
      ],
    },
    sections: [
      {
        title: '1. 교통사고 개요 및 합의금',
        fields: [
          { name: 'accidentDate', label: '사고 일시', half: true, default: () => U.todayISO() + ' 14:30', sample: '2026-11-20 14:30경' },
          { name: 'writtenDate', label: '합의 작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'accidentPlace', label: '사고 장소', sample: '서울특별시 강남구 테헤란로 OO빌딩 앞 교차로' },
          { name: 'victimCar', label: '피해 차량번호 / 종류', half: true, sample: '12가 3456 (그랜저)' },
          { name: 'driverCar', label: '가해 차량번호 / 종류', half: true, sample: '34나 7890 (쏘렌토)' },
          { name: 'amount', label: '합의 금액 (원)', type: 'money', default: '1000000', sample: '1200000' },
          { name: 'bankAccount', label: '입금 계좌', sample: '신한은행 110-123-456789 (예금주: 김피해)' },
          { name: 'clauses', label: '합의 조건 및 처벌불원 조항', type: 'textarea', minHeight: 95, sample: '1. 가해자(을)는 피해자(갑)에게 차량 수리비 및 위로금 명목으로 위 합의금을 합의 당일 지정 계좌로 입금한다.\n2. 피해자(갑)는 합의금을 전액 수령함과 동시에 본 사고와 관련한 민·형사상 일체의 이의를 제기하지 않으며 가해자의 처벌을 원하지 아니한다.' },
        ],
      },
      {
        title: '2. 피해자(갑) & 가해자(을)',
        fields: [
          { name: 'victimName', label: '피해자 성명', half: true, sample: '김피해' },
          { name: 'victimId', label: '피해자 생년/주민번호', half: true, sample: '880412-1******' },
          { name: 'victimPhone', label: '피해자 연락처', half: true, sample: '010-1111-2222' },
          { name: 'victimAddress', label: '피해자 주소', half: true, sample: '서울특별시 강남구 삼성로 100' },
          { name: 'driverName', label: '가해자 성명', half: true, sample: '이가해' },
          { name: 'driverId', label: '가해자 생년/주민번호', half: true, sample: '840920-1******' },
          { name: 'driverPhone', label: '가해자 연락처', half: true, sample: '010-3333-4444' },
          { name: 'driverAddress', label: '가해자 주소', half: true, sample: '서울특별시 서초구 서초대로 200' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <h2 class="doc-title compact">교 통 사 고 합 의 서</h2>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
            <tr><th>사고 일시</th><td>${V(s.accidentDate, '')}</td><th>사고 장소</th><td>${V(s.accidentPlace, '')}</td></tr>
            <tr><th>피해 차량</th><td>${V(s.victimCar, '')}</td><th>가해 차량</th><td>${V(s.driverCar, '')}</td></tr>
            <tr><th>합 의 금 액</th><td colspan="3" class="bold">₩ ${U.formatNumber(amt)}원 (${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))})</td></tr>
            ${s.bankAccount ? `<tr><th>입 금 계 좌</th><td colspan="3">${U.escapeHtml(s.bankAccount)}</td></tr>` : ''}
            <tr><th>합 의 조 항</th><td colspan="3" style="min-height:48mm;vertical-align:top;padding:3.5mm;line-height:1.75;">${U.escapeHtmlWithBr(s.clauses || '')}</td></tr>
          </table>
          <p style="text-align:center;margin:5mm 0;">위 교통사고에 관하여 당사자 쌍방이 자유로운 의사로 원만히 합의하였음을 증명하기 위하여 본 합의서 2부를 작성하고 서명·날인 후 각 1부씩 보관한다.</p>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${twoPartyBoxes(ctx,
              { title: '갑 (피해자)', slot: 'victim', rows: [['성 명', s.victimName, true], ['생년/주민', s.victimId], ['연락처', s.victimPhone], ['주 소', s.victimAddress]] },
              { title: '을 (가해자)', slot: 'driver', rows: [['성 명', s.driverName, true], ['생년/주민', s.driverId], ['연락처', s.driverPhone], ['주 소', s.driverAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 2. 각서 (gakseo) */
  F.registerSchema('gakseo', {
    stampSlots: [{ key: 'writer', label: '각서인 (인)', defaultName: '김각서', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보를 각서인에 채우기', slot: 'writer', personal: { name: 'writerName', birthOrId: 'writerId', phone: 'writerPhone', address: 'writerAddress' } }],
    required: [{ field: 'writerName', label: '각서인 성명' }, { field: 'receiverName', label: '수신인(귀하)' }, { field: 'subject', label: '각서 건명' }],
    presets: {
      pledge: [
        { label: '이행 약속 · 재발 방지 각서', text: '1. 본인은 위 사항과 관련하여 약속된 기한 내에 모든 의무를 성실히 이행할 것을 굳게 확약합니다.\n2. 향후 동일한 사안이 재발하지 않도록 각별히 주의하겠습니다.\n3. 만일 본 각서의 약속을 위반할 경우 어떠한 민·형사상 책임 및 불이익도 이의 없이 감수할 것을 서약합니다.' },
        { label: '업무·비밀·신뢰 준수 각서', text: '1. 본인은 상대방과의 신의성실 원칙을 지키며 약정된 업무 및 비밀유지 사항을 철저히 준수하겠습니다.\n2. 위반으로 인해 손해가 발생할 경우 그 손해 전액을 배상할 것을 각서합니다.' },
        { label: '생활·가족·개인 약속 각서', text: '1. 본인은 지난 잘못을 깊이 반성하며, 앞으로 약속한 사항을 성실히 실천할 것을 다짐합니다.\n2. 본 각서의 내용을 성실히 지킬 것을 서명·날인으로 확약합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 각서 내용 및 당사자',
        fields: [
          { name: 'subject', label: '각서 제목 / 건명', sample: '약정 사항 성실 이행 및 재발 방지 각서' },
          { name: 'receiverName', label: '수신인 (귀하)', half: true, sample: '이수신 귀하' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'pledge', label: '각서 (확약) 내용', type: 'textarea', minHeight: 130, sample: '1. 본인은 약정된 기한 내에 본 건 이행 사항을 성실히 완료할 것을 확약합니다.\n2. 향후 동일한 문제가 재발하지 않도록 최선을 다하겠습니다.\n3. 만일 위 약속을 어길 경우 발생하는 모든 법적·금전적 책임을 감수하겠습니다.' },
          { name: 'writerName', label: '각서인 성명', half: true, sample: '김각서' },
          { name: 'writerId', label: '생년월일 / 주민번호', half: true, sample: '900512-1******' },
          { name: 'writerPhone', label: '연락처', half: true, sample: '010-2345-6789' },
          { name: 'writerAddress', label: '현주소', half: true, sample: '서울특별시 강서구 화곡로 100' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:18mm 19mm;">
        <h2 class="doc-title">각 서</h2>
        <div class="doc-title-sub">${V(s.subject, '')}</div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>성 명</th><td class="bold">${V(s.writerName, '')}</td><th>생년월일</th><td>${V(s.writerId, '')}</td></tr>
          <tr><th>연 락 처</th><td>${V(s.writerPhone, '')}</td><th>작 성 일</th><td>${U.formatKoreanDate(s.writtenDate)}</td></tr>
          <tr><th>현 주 소</th><td colspan="3">${V(s.writerAddress, '')}</td></tr>
        </table>
        <div style="border:1.5px solid #222;padding:6mm;margin-top:5mm;min-height:92mm;line-height:1.9;font-size:10.5pt;">
          <p style="font-weight:700;margin:0 0 4mm;">[확약 사항]</p>
          <div>${U.escapeHtmlWithBr(s.pledge || '')}</div>
        </div>
        <div class="doc-statement">상기 본인은 위 각서 내용을 자유로운 의사로 충분히 숙지하고 틀림없이 이행할 것을 확약합니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>각서인 :</span><span class="doc-sign-name">${V(s.writerName, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.receiverName, '○○○ 귀하')}</div>
        </div>
      </div>
    `,
  });

  /* 3. 사실확인서 (sasil) */
  F.registerSchema('sasil', {
    stampSlots: [{ key: 'writer', label: '확인자(진술인) (인)', defaultName: '김확인', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보를 확인자에 채우기', slot: 'writer', personal: { name: 'writerName', birthOrId: 'writerId', phone: 'writerPhone', address: 'writerAddress' } }],
    required: [{ field: 'writerName', label: '확인자 성명' }, { field: 'subject', label: '확인 건명' }, { field: 'facts', label: '확인 사실 내용' }],
    presets: {
      facts: [
        { label: '거주·실제 동거 사실 확인', text: '본인은 당사자가 2025년 3월 1일부터 현재까지 아래 주소지에 실제로 거주하고 있음을 직접 확인하였으며, 이는 틀림없는 사실임을 확인합니다.' },
        { label: '목격·사건 경위 사실 확인', text: '본인은 2026년 11월 19일 15:00경 현장에서 당사자 간 발생한 사건 경위를 직접 목격하였으며, 아래 기재된 내용은 과장이나 허위 없는 객관적 사실 그대로임을 확인합니다.' },
        { label: '근무·거래 사실 확인', text: '본인은 당사자 간 용역 수행 및 대금 정산 사실이 아래 내역과 동일함을 확인합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 확인자(진술인) 및 제출처',
        fields: [
          { name: 'recipient', label: '제출처 (기관/법원/회사명)', half: true, sample: '서울중앙지방법원 / OO구청 귀중' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'writerName', label: '확인자 성명', half: true, sample: '김확인' },
          { name: 'writerId', label: '생년월일 / 주민번호', half: true, sample: '850315-1******' },
          { name: 'writerPhone', label: '연락처', half: true, sample: '010-4455-6677' },
          { name: 'relation', label: '당사자와의 관계', half: true, sample: '현장 목격자 / 직장 동료' },
          { name: 'writerAddress', label: '확인자 주소', sample: '서울특별시 마포구 도화길 50' },
          { name: 'subject', label: '확인 건명 (제목)', sample: '실제 거주(또는 현장 목격) 사실 확인' },
          { name: 'facts', label: '확인 사실 내용 (육하원칙 중심)', type: 'textarea', minHeight: 135, sample: '1. 본인은 2026년 11월 19일 15:00경 서울시 마포구 OO앞 도로에서 발생한 사안을 직접 목격하였습니다.\n2. 당시 상황 및 경위는 기재한 바와 일치하며 어떠한 허위나 왜곡도 없음을 확인합니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:17mm 18mm;">
        <h2 class="doc-title">사 실 확 인 서</h2>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>성 명</th><td class="bold">${V(s.writerName, '')}</td><th>생년월일</th><td>${V(s.writerId, '')}</td></tr>
          <tr><th>연 락 처</th><td>${V(s.writerPhone, '')}</td><th>당사자와 관계</th><td>${V(s.relation, '')}</td></tr>
          <tr><th>주 소</th><td colspan="3">${V(s.writerAddress, '')}</td></tr>
          <tr><th>확인 건명</th><td colspan="3" class="bold">${V(s.subject, '')}</td></tr>
          <tr><th>확인 사실 내용</th><td colspan="3" style="min-height:92mm;vertical-align:top;padding:4.5mm;line-height:1.85;">${s.facts ? U.escapeHtmlWithBr(s.facts) : '<span class="doc-empty">객관적인 사실 관계를 구체적으로 기재</span>'}</td></tr>
        </table>
        <div class="doc-statement">위 기재 내용은 본인이 직접 보고 겪은 틀림없는 사실이며,<br>만일 허위 사실이 있을 경우 이에 따른 법적 책임을 감수할 것을 확인합니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>확인자 (진술인) :</span><span class="doc-sign-name">${V(s.writerName, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.recipient, '관계 기관 귀중')}</div>
        </div>
      </div>
    `,
  });

  /* 4. 내용증명서 (naeyong) */
  F.registerSchema('naeyong', {
    stampSlots: [{ key: 'sender', label: '발신인 (인)', defaultName: '김발신', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'sender', label: '내 개인 정보를 발신인에 채우기', slot: 'sender', personal: { name: 'senderName', phone: 'senderPhone', address: 'senderAddress', bankAccount: 'bankAccount' } }],
    required: [{ field: 'title', label: '내용증명 제목' }, { field: 'senderName', label: '발신인 성명' }, { field: 'receiverName', label: '수신인 성명' }],
    presets: {
      body: [
        { label: '전세보증금 반환 최고', text: '1. 귀하와 체결한 임대차계약이 만기 종료되었음에도 현재까지 임차보증금이 반환되지 않고 있습니다.\n2. 본 내용증명 수령일로부터 7일 이내에 보증금 전액을 아래 발신인 지정 계좌로 반환하여 주시기 바랍니다.\n3. 기한 내 미반환 시 임차권등기명령 신청, 보증금 반환 청구 소송 및 지연이자(연 12%) 청구 등 법적 절차를 진행할 예정임을 정중히 통고합니다.' },
        { label: '대여금(차용금) 변제 촉구', text: '1. 귀하는 차용증에 따라 약정한 변제기일이 도과하였음에도 대여 원리금을 상환하지 않고 있습니다.\n2. 본 통지서 도달일로부터 10일 이내에 미변제 원리금 전액을 지정 계좌로 입금하여 주시기 바랍니다.\n3. 기한 내 이행이 없을 경우 지급명령 신청 및 강제집행 절차에 착수할 수밖에 없음을 통지합니다.' },
        { label: '미수금·용역대금 지급 독촉', text: '1. 당사는 계약에 따라 용역(또는 물품 공급)을 정상 완료하고 세금계산서를 발행하였으나 약정 결제일이 경과하였습니다.\n2. 본 통지 수령 후 7영업일 이내에 미수금 전액을 입금해 주시기 바라며, 미이행 시 법적 조치를 진행하겠습니다.' },
        { label: '계약 해지 및 원상복구 통지', text: '1. 귀하의 지속적인 계약 위반(또는 월세 2기 이상 연체)으로 인하여 본 계약을 해지함을 공식 통지합니다.\n2. 본 서면 도달일로부터 14일 이내에 목적물을 원상복구하여 인도해 주시기 바랍니다.' },
      ],
    },
    sections: [
      {
        title: '1. 발신인 · 수신인 (우체국 봉투 주소와 일치 필수)',
        fields: [
          { name: 'title', label: '제목', sample: '임대차 보증금 반환 이행 최고 및 법적 조치 예고 통지' },
          { name: 'writtenDate', label: '발송(작성)일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'claimAmount', label: '청구 금액 (해당 시 입력, 원)', type: 'money', default: '0', sample: '10000000' },
          { name: 'senderName', label: '발신인 성명/상호', half: true, sample: '김발신' },
          { name: 'senderPhone', label: '발신인 연락처', half: true, sample: '010-1234-5678' },
          { name: 'senderAddress', label: '발신인 주소', sample: '서울특별시 마포구 월드컵북로 120, 101동 802호' },
          { name: 'receiverName', label: '수신인 성명/상호', half: true, sample: '이수신' },
          { name: 'receiverAddress', label: '수신인 주소', half: true, sample: '서울특별시 용산구 이촌로 100, 305호' },
          { name: 'bankAccount', label: '입금 지정 계좌 (선택)', sample: '국민은행 123-456-789012 (예금주: 김발신)' },
          { name: 'body', label: '통지 내용 (번호를 붙여 명확히 기재)', type: 'textarea', minHeight: 140, sample: '1. 발신인은 수신인에게 대여한 금전(또는 임차보증금)의 변제기일이 도과하였음에도 현재까지 반환받지 못하고 있습니다.\n2. 이에 본 내용증명 수령일로부터 7일 이내에 미변제 금액 전액을 상기 지정 계좌로 입금하여 주시기 바랍니다.\n3. 위 기한까지 이행이 없을 경우 부득이하게 지급명령·민사소송 및 지연이자 청구 등 일체의 법적 절차를 진행할 것임을 공식 통고합니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.claimAmount);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:17mm 18mm;">
          <h2 class="doc-title compact">내 용 증 명 서</h2>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:18%"><col style="width:82%"></colgroup>
            <tr><th>제 목</th><td class="bold">${V(s.title, '내용증명 제목')}</td></tr>
            <tr><th>수 신 인</th><td><strong>${V(s.receiverName, '')}</strong> / ${V(s.receiverAddress, '')}</td></tr>
            <tr><th>발 신 인</th><td><strong>${V(s.senderName, '')}</strong> (${V(s.senderPhone, '')}) / ${V(s.senderAddress, '')}</td></tr>
            ${amt > 0 ? `<tr><th>청구 금액</th><td class="bold">₩ ${U.formatNumber(amt)}원 (${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))})</td></tr>` : ''}
            ${s.bankAccount ? `<tr><th>지정 계좌</th><td>${U.escapeHtml(s.bankAccount)}</td></tr>` : ''}
          </table>
          <div style="border:1.5px solid #222;padding:5.5mm;margin-top:4mm;min-height:112mm;line-height:1.9;font-size:10.3pt;">
            <p style="font-weight:700;margin:0 0 3.5mm;">[통 지 내 용]</p>
            <div>${U.escapeHtmlWithBr(s.body || '')}</div>
          </div>
          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row"><span>발신인 :</span><span class="doc-sign-name">${V(s.senderName, '홍 길 동')}</span>${ctx.renderStamp('sender', '(인)')}</div>
            <div class="doc-recipient">${V(s.receiverName, '○○○')} 귀하</div>
          </div>
        </div>
      `;
    },
  });

  /* 5. 탄원서 (tanwonseo) */
  F.registerSchema('tanwonseo', {
    stampSlots: [{ key: 'writer', label: '탄원인 (인)', defaultName: '김탄원', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보를 탄원인에 채우기', slot: 'writer', personal: { name: 'writerName', birthOrId: 'writerId', phone: 'writerPhone', address: 'writerAddress' } }],
    required: [{ field: 'recipient', label: '제출처(법원/검찰청 등)' }, { field: 'writerName', label: '탄원인 성명' }, { field: 'body', label: '탄원 내용' }],
    presets: {
      body: [
        { label: '피고인 선처 호소 (가족·지인)', text: '존경하는 재판장님께 간곡히 호소드립니다.\n\n1. 피고인은 평소 성실하게 가정과 직장을 지켜온 가장으로, 이번 과오에 대하여 진심으로 깊이 반성하고 있습니다.\n2. 피해 회복을 위해 최선을 다하였으며, 가족 모두가 곁에서 다시는 같은 실수를 반복하지 않도록 적극 돕겠습니다.\n3. 부디 피고인이 사회의 건전한 일원으로 복귀할 수 있도록 최대한의 관용과 선처를 베풀어 주시기를 간절히 탄원합니다.' },
        { label: '피해자 엄벌 탄원', text: '존경하는 재판장님께 간곡히 탄원드립니다.\n\n1. 본 사건으로 인하여 피해자와 가족들은 회복하기 어려운 정신적·경제적 고통을 겪고 있습니다.\n2. 가해자는 현재까지 진정한 사과나 실질적인 피해 회복 노력을 보이지 않고 있습니다.\n3. 유사한 피해가 재발하지 않도록 법이 허용하는 엄중한 처벌을 내려주시기를 간절히 요청드립니다.' },
        { label: '행정 처분 감경 · 민원 탄원', text: '존경하는 위원장님(기관장님)께 간곡히 호소드립니다.\n\n1. 생계 유지를 위해 필수적인 자격(또는 영업)과 관련된 사안으로, 이번 처분 시 가족 전체의 생계가 막막한 실정입니다.\n2. 잘못을 깊이 반성하고 재발 방지 조치를 완료하였사오니, 제반 사정을 참작하시어 관대한 선처를 베풀어 주시기 바랍니다.' },
      ],
    },
    sections: [
      {
        title: '1. 사건 및 탄원인 정보',
        fields: [
          { name: 'recipient', label: '제출처 (법원·재판부·검찰청 등)', sample: '서울중앙지방법원 형사 제00단독 재판부 귀중' },
          { name: 'caseNo', label: '사건번호 (해당 시)', half: true, sample: '2026고단 12345' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'targetPerson', label: '피탄원인 (대상자 성명)', half: true, sample: '박대상 (피고인)' },
          { name: 'relation', label: '대상자와의 관계', half: true, sample: '직장 동료 / 가족' },
          { name: 'writerName', label: '탄원인 성명', half: true, sample: '김탄원' },
          { name: 'writerId', label: '생년월일', half: true, sample: '860711-1******' },
          { name: 'writerPhone', label: '연락처', half: true, sample: '010-5566-7788' },
          { name: 'writerAddress', label: '탄원인 주소', half: true, sample: '서울특별시 동작구 상도로 200' },
          { name: 'body', label: '탄원 취지 및 상세 내용', type: 'textarea', minHeight: 150, sample: '존경하는 재판장님께 간곡히 탄원드립니다.\n\n피탄원인은 평소 성실한 사회 구성원으로 살아왔으며 본 사건에 대해 진심으로 반성하고 있습니다. 부디 제반 사정을 깊이 헤아리시어 관대한 선처를 베풀어 주시기를 간절히 호소드립니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:17mm 18mm;">
        <h2 class="doc-title compact">탄 원 서</h2>
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>사 건 번 호</th><td>${V(s.caseNo, '-')}</td><th>피 탄 원 인</th><td class="bold">${V(s.targetPerson, '')}</td></tr>
          <tr><th>탄원인 성명</th><td class="bold">${V(s.writerName, '')}</td><th>생년월일 / 관계</th><td>${V(s.writerId, '')} (${V(s.relation, '')})</td></tr>
          <tr><th>연 락 처</th><td>${V(s.writerPhone, '')}</td><th>주 소</th><td>${V(s.writerAddress, '')}</td></tr>
        </table>
        <div style="border:1.5px solid #222;padding:5.5mm;margin-top:4mm;min-height:118mm;line-height:1.9;font-size:10.3pt;">
          <p style="font-weight:700;margin:0 0 3.5mm;">[탄원 취지 및 이유]</p>
          <div>${U.escapeHtmlWithBr(s.body || '')}</div>
        </div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>탄원인 :</span><span class="doc-sign-name">${V(s.writerName, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.recipient, '○○지방법원 재판부 귀중')}</div>
        </div>
      </div>
    `,
  });

  /* 6. 동의서·수령확인서 (donguiseo) */
  F.registerSchema('donguiseo', {
    stampSlots: [{ key: 'writer', label: '동의인/수령인 (인)', defaultName: '김동의', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보를 동의인/수령인에 채우기', slot: 'writer', personal: { name: 'writerName', birthOrId: 'writerId', phone: 'writerPhone', address: 'writerAddress' } }],
    required: [{ field: 'writerName', label: '성명' }, { field: 'subject', label: '건명' }],
    presets: {
      content: [
        { label: '개인정보 수집·이용 동의서', text: '1. 수집 항목: 성명, 생년월일, 연락처, 주소, 계좌번호\n2. 수집 목적: 계약 체결·이행, 대금 정산 및 관련 법령상 세무 신고\n3. 보유 기간: 목적 달성 및 관계 법령상 보존 기간 종료 시 즉시 파기\n* 귀하는 동의를 거부할 권리가 있으나, 거부 시 계약·정산 진행이 제한될 수 있습니다.' },
        { label: '서류·물품·금품 수령확인서', text: '본인은 상기 교부처로부터 해당 서류(또는 물품·지원금)를 빠짐없이 정상 수령하였음을 확인하며, 수령 이후의 관리 책임은 본인에게 있음을 확인합니다.' },
        { label: '초상권·콘텐츠 활용 동의서', text: '본인은 촬영된 사진·영상 콘텐츠가 지정된 홍보 및 안내 목적으로 활용되는 것에 자유로운 의사로 동의합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 문서 구분 및 내용',
        fields: [
          { name: 'docKind', label: '문서 유형', type: 'select', half: true, default: '동 의 서', options: ['동 의 서', '개인정보 수집·이용 동의서', '수 령 확 인 서'] },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'recipient', label: '제출처 (기관/회사명)', half: true, sample: '주식회사 바로테크 귀중' },
          { name: 'subject', label: '동의 / 수령 건명', half: true, sample: '개인정보 수집·이용 및 제3자 제공 동의' },
          { name: 'content', label: '동의 사항 또는 수령 물품·내역', type: 'textarea', minHeight: 120, sample: '1. 수집 항목: 성명, 생년월일, 연락처, 주소\n2. 이용 목적: 업무 위탁 계약 체결 및 대금 정산, 원천징수 신고\n3. 보유 기간: 관계 법령상 보존 기간 만료 시 즉시 파기\n\n위 내용을 충분히 안내받았으며 이에 동의합니다.' },
        ],
      },
      {
        title: '2. 동의인 / 수령인 인적사항',
        fields: [
          { name: 'writerName', label: '성명', half: true, sample: '김동의' },
          { name: 'writerId', label: '생년월일', half: true, sample: '920618-2******' },
          { name: 'writerPhone', label: '연락처', half: true, sample: '010-7788-9900' },
          { name: 'writerAddress', label: '주소', half: true, sample: '서울특별시 관악구 남부순환로 1500' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const isReceipt = s.docKind === '수 령 확 인 서';
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:17mm 18mm;">
          <h2 class="doc-title compact">${U.escapeHtml(s.docKind || '동 의 서')}</h2>
          <table class="doc-table thick-outer">
            <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
            <tr><th>성 명</th><td class="bold">${V(s.writerName, '')}</td><th>생년월일</th><td>${V(s.writerId, '')}</td></tr>
            <tr><th>연 락 처</th><td>${V(s.writerPhone, '')}</td><th>작 성 일</th><td>${U.formatKoreanDate(s.writtenDate)}</td></tr>
            <tr><th>주 소</th><td colspan="3">${V(s.writerAddress, '')}</td></tr>
            <tr><th>건 명</th><td colspan="3" class="bold">${V(s.subject, '')}</td></tr>
            <tr><th>${isReceipt ? '수령 내역' : '동의 내용'}</th><td colspan="3" style="min-height:88mm;vertical-align:top;padding:4.5mm;line-height:1.85;">${U.escapeHtmlWithBr(s.content || '')}</td></tr>
          </table>
          <div class="doc-statement">${isReceipt ? '상기 내역 일체를 이상 없이 정히 수령하였음을 확인합니다.' : '위 사항을 충분히 확인하고 자유로운 의사로 이에 동의합니다.'}</div>
          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row"><span>${isReceipt ? '수령인' : '동의인'} :</span><span class="doc-sign-name">${V(s.writerName, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
            <div class="doc-recipient">${V(s.recipient, '○○○ 귀중')}</div>
          </div>
        </div>
      `;
    },
  });
})(window);
