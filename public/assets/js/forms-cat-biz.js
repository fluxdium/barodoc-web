/* ==========================================================================
   바로서식 (BaroDoc) — Category 3: 거래·경영 신규 8종 서식
   baljuseo, cheongguseo, gani-yeongsujeung, pumuiseo,
   gianseo, hoeuilok, eopmuilji, ipgeum
   ========================================================================== */
(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;
  const P = window.BaroPlatform;
  const V = P.valOrEmpty;

  function makeApprovalTable(ctx, slotKey, labels) {
    const cols = labels || ['담 당', '팀 장', '임 원', '대 표'];
    return `
      <table class="doc-table compact thick-outer" style="width:74mm;margin:0;">
        <tr><th rowspan="2" style="width:14%;line-height:1.4;">결<br>재</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
        <tr><td class="center" style="height:14mm;">${ctx.renderStamp(slotKey, '')}</td>${cols.slice(1).map(() => '<td></td>').join('')}</tr>
      </table>
    `;
  }

  function renderTradeLineTable(items, vatMode) {
    const totals = P.calcLineTotals(items || [], vatMode || 'separate');
    const minRows = Math.max(7, totals.rows.length);
    const rows = [];
    for (let i = 0; i < minRows; i++) {
      const r = totals.rows[i];
      if (r && (r.name || r.unitPrice > 0)) {
        rows.push(`<tr><td class="center">${i + 1}</td><td>${U.escapeHtml(r.name)}</td><td class="center">${U.escapeHtml(r.spec)}</td><td class="num">${r.qty ? U.formatNumber(r.qty) : ''}</td><td class="num">${r.unitPrice ? U.formatNumber(r.unitPrice) : ''}</td><td class="num">${r.supply ? U.formatNumber(r.supply) : ''}</td><td class="num">${r.vat ? U.formatNumber(r.vat) : (vatMode === 'exempt' ? '0' : '')}</td><td>${U.escapeHtml(r.note)}</td></tr>`);
      } else {
        rows.push(`<tr><td class="center" style="color:#9ca3af;">${i + 1}</td><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`);
      }
    }
    return {
      totals,
      denseClass: totals.rows.length >= 7 ? 'dense-items' : '',
      tableHtml: `
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:6%"><col style="width:27%"><col style="width:9%"><col style="width:8%"><col style="width:13%"><col style="width:14%"><col style="width:11%"><col style="width:12%"></colgroup>
          <thead><tr><th>No</th><th>품 목</th><th>규 격</th><th>수 량</th><th>단 가</th><th>공급가액</th><th>세 액</th><th>비 고</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
          <tfoot><tr><th colspan="5">합 계</th><td class="num bold">${U.formatNumber(totals.supplyTotal)}</td><td class="num bold">${U.formatNumber(totals.vatTotal)}</td><td class="num bold">${U.formatNumber(totals.grandTotal)}</td></tr></tfoot>
        </table>
      `,
    };
  }

  /* 1. 발주서 (baljuseo) — Trade Chain Enabled */
  F.registerSchema('baljuseo', {
    stampSlots: [{ key: 'buyer', label: '발주자 직인', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 18 }],
    profileTargets: [{
      id: 'buyer', label: '내 회사 정보를 발주처(구매자)에 채우기', slot: 'buyer',
      company: { companyName: 'clientName', ceoName: 'clientCeo', bizNo: 'clientBizNo', companyPhone: 'clientPhone', companyAddress: 'deliveryAddress' },
    }],
    required: [{ field: 'supplierName', label: '수신처(공급자)' }, { field: 'clientName', label: '발주처 상호' }, { field: 'orderDate', label: '발주일자' }],
    validate: (s) => {
      const t = P.calcLineTotals(s.items || [], s.vatMode);
      return t.grandTotal <= 0 ? [{ level: 'warn', text: '발주 품목의 합계금액이 0원입니다.' }] : [];
    },
    presets: {
      notes: [
        { label: '납기 준수 · 검수 후 결제', text: '1. 지정 납기일까지 납품 장소로 입고해 주시기 바라며, 거래명세서 1부를 동봉해 주세요.\n2. 검수 완료 및 전자세금계산서 발행일로부터 15일 이내 계좌이체 결제합니다.' },
        { label: '하자 시 무상 교체', text: '1. 납품 품목에 파손·불량·수량 오차가 있을 경우 즉시 무상 재납품 조건입니다.\n2. 납기 지연 예상 시 최소 3영업일 전 사전 통보 부탁드립니다.' },
        { label: '선금 50% / 잔금 50%', text: '1. 발주 확정 시 선금 50%, 최종 납품 및 검수 완료 후 잔금 50% 정산 조건입니다.' },
      ],
    },
    sections: [
      {
        title: '1. 발주 기본 정보 & 수신처(공급자)',
        fields: [
          { name: 'orderNo', label: '발주번호', half: true, default: 'PO-2026-001', sample: 'PO-2026-1120' },
          { name: 'orderDate', label: '발주일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'supplierName', label: '수신처 (공급자 상호)', half: true, sample: '주식회사 한빛유통' },
          { name: 'supplierCeo', label: '공급자 대표/담당자', half: true, sample: '윤대표 / 김담당' },
          { name: 'supplierBizNo', label: '공급자 사업자번호', half: true, sample: '214-81-98765' },
          { name: 'supplierPhone', label: '공급자 연락처', half: true, sample: '02-333-4455' },
          { name: 'projectTitle', label: '발주 건명', sample: '사무용 비품 및 패키지 자재 발주' },
          { name: 'deliveryDate', label: '납품 요청일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'payTerms', label: '결제 조건', half: true, default: '검수 후 15일 이내 계좌이체' },
        ],
      },
      {
        title: '2. 발주처 (구매 회사) 정보',
        fields: [
          { name: 'clientName', label: '발주처 상호', half: true, sample: '주식회사 바로컴퍼니' },
          { name: 'clientCeo', label: '대표자명', half: true, sample: '최대표' },
          { name: 'clientBizNo', label: '사업자등록번호', half: true, sample: '123-45-67890' },
          { name: 'clientPhone', label: '연락처', half: true, sample: '02-555-7890' },
          { name: 'deliveryAddress', label: '납품 장소 (주소)', sample: '서울특별시 강남구 테헤란로 250, 7층 물류창고' },
        ],
      },
      {
        title: '3. 발주 품목 및 금액 (자동 계산)',
        fields: [
          {
            name: 'items', type: 'items', useVat: true,
            default: [{ name: '', spec: 'EA', qty: 1, unitPrice: 0, note: '' }, { name: '', spec: 'EA', qty: 1, unitPrice: 0, note: '' }],
            sample: [
              { name: '맞춤 인쇄 택배박스 (중형)', spec: 'BOX', qty: 500, unitPrice: 1200, note: '로고 1도 인쇄' },
              { name: '친환경 완충재 (롤)', spec: 'ROLL', qty: 20, unitPrice: 25000, note: '' },
            ],
          },
          { name: 'notes', label: '납품 조건 및 특기사항', type: 'textarea', default: '지정 납기일까지 납품 장소로 입고 부탁드리며, 거래명세서를 동봉해 주세요.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const { totals, denseClass, tableHtml } = renderTradeLineTable(s.items, s.vatMode);
      return `
        <div class="a4-sheet ${denseClass} ${ctx.fontClass}" style="padding:14mm;">
          <h2 class="doc-title compact">발 주 서</h2>
          <div class="biz-header">
            <div class="biz-left">
              <div>
                <div class="biz-recipient-line"><span>${V(s.supplierName, '공급자 상호')}</span><span style="font-size:10.5pt;font-weight:700;">귀중</span></div>
                <div class="biz-meta-list">
                  <div><strong>발주번호:</strong> ${U.escapeHtml(s.orderNo || '-')}</div>
                  <div><strong>발주일자:</strong> ${U.formatKoreanDate(s.orderDate)}</div>
                  <div><strong>건 &nbsp;&nbsp;&nbsp;&nbsp;명:</strong> ${V(s.projectTitle, '-')}</div>
                  <div><strong>납기요청:</strong> ${U.formatKoreanDate(s.deliveryDate)}</div>
                  <div><strong>결제조건:</strong> ${V(s.payTerms, '')}</div>
                </div>
              </div>
              <div style="font-size:9.3pt;margin-top:2.5mm;">아래와 같이 발주하오니 납기 내 공급 부탁드립니다.</div>
            </div>
            <table class="doc-table compact thick-outer" style="margin:0;">
              <colgroup><col style="width:9%"><col style="width:19%"><col style="width:27%"><col style="width:14%"><col style="width:31%"></colgroup>
              <tr><th rowspan="4" style="line-height:1.4;">발<br>주<br>처</th><th>등록번호</th><td colspan="3" class="bold">${V(s.clientBizNo, '000-00-00000')}</td></tr>
              <tr><th>상 호</th><td class="bold">${V(s.clientName, '발주처')}</td><th>성 명</th><td><div class="ceo-stamp-cell"><span>${V(s.clientCeo, '')}</span>${ctx.renderStamp('buyer', '(인)', 'sm')}</div></td></tr>
              <tr><th>납품장소</th><td colspan="3">${V(s.deliveryAddress, '')}</td></tr>
              <tr><th>연락처</th><td colspan="3">${V(s.clientPhone, '')}</td></tr>
            </table>
          </div>
          <div class="biz-total-banner">
            <span class="biz-total-label">발주 합계금액</span>
            <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))} <small style="font-weight:500;color:#444;">(${U.escapeHtml(U.formatHanjaCurrency(totals.grandTotal))})</small></span>
            <span class="biz-total-number">(₩ ${U.formatNumber(totals.grandTotal)})</span>
          </div>
          ${tableHtml}
          <div class="doc-notes-box" style="margin-top:auto;"><strong>[납품 조건 및 특기사항]</strong><div class="doc-notes-body">${U.escapeHtml(s.notes || '')}</div></div>
        </div>
      `;
    },
  });

  /* 2. 청구서 (cheongguseo) — Trade Chain Enabled */
  F.registerSchema('cheongguseo', {
    stampSlots: [{ key: 'supplier', label: '청구인(공급자) 직인', defaultName: '바로스튜디오인', defaultShape: 'square', sizeMm: 18 }],
    profileTargets: [{
      id: 'supplier', label: '내 회사 정보를 청구인(공급자)에 채우기', slot: 'supplier',
      company: { companyName: 'supplierName', ceoName: 'supplierCeo', bizNo: 'supplierBizNo', companyPhone: 'supplierPhone', companyAddress: 'supplierAddress', bankAccount: 'bankAccount' },
    }],
    required: [{ field: 'clientName', label: '수신처(청구 대상)' }, { field: 'supplierName', label: '청구인 상호' }, { field: 'billDate', label: '청구일자' }],
    validate: (s) => {
      const t = P.calcLineTotals(s.items || [], s.vatMode);
      return t.grandTotal <= 0 ? [{ level: 'warn', text: '청구 합계금액이 0원입니다.' }] : [];
    },
    presets: {
      notes: [
        { label: '세금계산서 발행 완료', text: '전자세금계산서를 발행 완료하였습니다. 위 입금 기한까지 지정 계좌로 송금 부탁드립니다.' },
        { label: '입금 확인 후 세금계산서 발행', text: '대금 입금 확인 즉시 전자세금계산서(영수)를 발행해 드리겠습니다.' },
        { label: '프리랜서 3.3% 원천징수 안내', text: '사업소득 3.3% 원천징수 대상인 경우 세액 공제 후 실지급액을 상기 계좌로 입금 부탁드립니다.' },
      ],
    },
    sections: [
      {
        title: '1. 청구 대상(수신처) 및 기한',
        fields: [
          { name: 'billNo', label: '청구번호', half: true, default: 'INV-2026-001', sample: 'INV-2026-1120' },
          { name: 'billDate', label: '청구일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'clientName', label: '수신처 (청구 받는 회사)', half: true, sample: '주식회사 한빛커머스' },
          { name: 'dueDate', label: '입금 요청 기한', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'projectTitle', label: '청구 건명', sample: '홈페이지 리뉴얼 용역 잔금 청구' },
          { name: 'bankAccount', label: '입금 계좌 정보', sample: '국민은행 123-456-789012 (예금주: (주)바로스튜디오)' },
        ],
      },
      {
        title: '2. 청구인 (공급자) 정보',
        fields: [
          { name: 'supplierName', label: '상호 (회사명)', half: true, sample: '주식회사 바로스튜디오' },
          { name: 'supplierCeo', label: '대표자 성명', half: true, sample: '이대표' },
          { name: 'supplierBizNo', label: '사업자등록번호', half: true, sample: '123-45-67890' },
          { name: 'supplierPhone', label: '연락처', half: true, sample: '02-6000-1234' },
          { name: 'supplierAddress', label: '사업장 주소', sample: '서울특별시 성동구 아차산로 100, 4층' },
        ],
      },
      {
        title: '3. 청구 내역 (자동 계산)',
        fields: [
          {
            name: 'items', type: 'items', useVat: true,
            default: [{ name: '', spec: '식', qty: 1, unitPrice: 0, note: '' }],
            sample: [
              { name: 'UI/UX 디자인 및 퍼블리싱 잔금 (50%)', spec: '식', qty: 1, unitPrice: 1750000, note: '검수 완료' },
              { name: '유지보수 초기 세팅비', spec: '식', qty: 1, unitPrice: 250000, note: '' },
            ],
          },
          { name: 'notes', label: '안내 및 특기사항', type: 'textarea', default: '상기 입금 기한까지 지정 계좌로 송금 부탁드립니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const { totals, denseClass, tableHtml } = renderTradeLineTable(s.items, s.vatMode);
      return `
        <div class="a4-sheet ${denseClass} ${ctx.fontClass}" style="padding:14mm;">
          <h2 class="doc-title compact">청 구 서</h2>
          <div class="biz-header">
            <div class="biz-left">
              <div>
                <div class="biz-recipient-line"><span>${V(s.clientName, '수신처 상호')}</span><span style="font-size:10.5pt;font-weight:700;">귀중</span></div>
                <div class="biz-meta-list">
                  <div><strong>청구번호:</strong> ${U.escapeHtml(s.billNo || '-')}</div>
                  <div><strong>청구일자:</strong> ${U.formatKoreanDate(s.billDate)}</div>
                  <div><strong>건 &nbsp;&nbsp;&nbsp;&nbsp;명:</strong> ${V(s.projectTitle, '-')}</div>
                  <div><strong>입금기한:</strong> <strong>${U.formatKoreanDate(s.dueDate)}</strong></div>
                  <div><strong>입금계좌:</strong> ${V(s.bankAccount, '')}</div>
                </div>
              </div>
              <div style="font-size:9.3pt;margin-top:2.5mm;">아래와 같이 대금을 정히 청구합니다.</div>
            </div>
            <table class="doc-table compact thick-outer" style="margin:0;">
              <colgroup><col style="width:9%"><col style="width:19%"><col style="width:27%"><col style="width:14%"><col style="width:31%"></colgroup>
              <tr><th rowspan="4" style="line-height:1.4;">청<br>구<br>인</th><th>등록번호</th><td colspan="3" class="bold">${V(s.supplierBizNo, '000-00-00000')}</td></tr>
              <tr><th>상 호</th><td class="bold">${V(s.supplierName, '공급자')}</td><th>성 명</th><td><div class="ceo-stamp-cell"><span>${V(s.supplierCeo, '')}</span>${ctx.renderStamp('supplier', '(인)', 'sm')}</div></td></tr>
              <tr><th>주 소</th><td colspan="3">${V(s.supplierAddress, '')}</td></tr>
              <tr><th>연락처</th><td colspan="3">${V(s.supplierPhone, '')}</td></tr>
            </table>
          </div>
          <div class="biz-total-banner">
            <span class="biz-total-label">청구 합계금액</span>
            <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))} <small style="font-weight:500;color:#444;">(${U.escapeHtml(U.formatHanjaCurrency(totals.grandTotal))})</small></span>
            <span class="biz-total-number">(₩ ${U.formatNumber(totals.grandTotal)})</span>
          </div>
          ${tableHtml}
          <div class="doc-notes-box" style="margin-top:auto;"><strong>[입금 및 세금계산서 안내]</strong><div class="doc-notes-body">${U.escapeHtml(s.notes || '')}</div></div>
        </div>
      `;
    },
  });

  /* 3. 간이영수증 (gani-yeongsujeung) */
  F.registerSchema('gani-yeongsujeung', {
    stampSlots: [{ key: 'issuer', label: '공급자 도장 (인)', defaultName: '바로상사', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'company', label: '내 회사 정보를 공급자에 채우기', slot: 'issuer',
      company: { companyName: 'issuerName', ceoName: 'issuerCeo', bizNo: 'issuerBizOrId', companyAddress: 'issuerAddress', bizType: 'bizType', bizItem: 'bizItem' },
    }],
    required: [{ field: 'issuerName', label: '공급자 상호' }, { field: 'receiptDate', label: '작성일자' }],
    presets: {
      note: [
        { label: '공급받는자 보관용 표준', text: '위 금액을 정히 영수함. (건당 3만원 이하 소액 경비 증빙용)' },
        { label: '경조사·소액 비품 지출용', text: '소액 물품 구입 대금을 현금/이체로 수령하였음을 확인합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 간이영수증 기본 정보',
        fields: [
          { name: 'payerName', label: '공급받는자 (귀하)', half: true, sample: '주식회사 바로테크' },
          { name: 'receiptDate', label: '작성일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'issuerName', label: '공급자 상호', half: true, sample: '성수문구사' },
          { name: 'issuerCeo', label: '공급자 성명', half: true, sample: '김사장' },
          { name: 'issuerBizOrId', label: '사업자등록번호', half: true, sample: '201-12-34567' },
          { name: 'bizType', label: '업태 / 종목', half: true, sample: '도소매 / 문구·사무용품' },
          { name: 'issuerAddress', label: '사업장 소재지', sample: '서울특별시 성동구 성수동2가 300-1' },
        ],
      },
      {
        title: '2. 품목 및 금액 (자동 합계)',
        fields: [
          {
            name: 'items', type: 'items', useVat: false,
            default: [{ name: '', spec: '개', qty: 1, unitPrice: 0, note: '' }],
            sample: [
              { name: 'A4 복사용지 (1박스)', spec: 'BOX', qty: 1, unitPrice: 18500, note: '' },
              { name: '보드마카 및 클리어파일', spec: 'SET', qty: 1, unitPrice: 9500, note: '' },
            ],
          },
          { name: 'note', label: '비고', type: 'textarea', default: '위 금액을 정히 영수함.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const totals = P.calcLineTotals(s.items || [], 'exempt');
      const rows = [];
      for (let i = 0; i < 8; i++) {
        const r = totals.rows[i];
        rows.push(r && (r.name || r.unitPrice > 0)
          ? `<tr><td class="center">${U.escapeHtml((s.receiptDate || '').slice(5))}</td><td>${U.escapeHtml(r.name)}</td><td class="num">${U.formatNumber(r.qty)}</td><td class="num">${U.formatNumber(r.unitPrice)}</td><td class="num bold">${U.formatNumber(r.total)}</td></tr>`
          : `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`);
      }
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:18mm 20mm;">
          <div style="border:2px solid #1e3a8a;padding:10mm;flex:1;display:flex;flex-direction:column;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1e3a8a;padding-bottom:3mm;margin-bottom:5mm;">
              <h2 class="doc-title compact" style="margin:0;color:#1e3a8a;text-align:left;padding-left:0;">영 수 증 <span style="font-size:10pt;letter-spacing:0;font-weight:600;">(간이 · 공급받는자 보관용)</span></h2>
              <span style="font-size:10pt;font-weight:700;">${V(s.payerName, '○○○')} 귀하</span>
            </div>
            <table class="doc-table compact thick-outer">
              <colgroup><col style="width:16%"><col style="width:34%"><col style="width:16%"><col style="width:34%"></colgroup>
              <tr><th>등록번호</th><td colspan="3" class="bold">${V(s.issuerBizOrId, '')}</td></tr>
              <tr><th>상 호</th><td class="bold">${V(s.issuerName, '')}</td><th>성 명</th><td><div class="ceo-stamp-cell"><span>${V(s.issuerCeo, '')}</span>${ctx.renderStamp('issuer', '(인)', 'sm')}</div></td></tr>
              <tr><th>소 재 지</th><td colspan="3">${V(s.issuerAddress, '')}</td></tr>
              <tr><th>업태·종목</th><td>${V(s.bizType, '')}</td><th>작성일자</th><td class="bold">${U.formatKoreanDate(s.receiptDate)}</td></tr>
            </table>
            <div class="biz-total-banner" style="border-color:#1e3a8a;background:#eff6ff;">
              <span class="biz-total-label" style="color:#1e3a8a;">공급대가 총액</span>
              <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))} <small>(${U.escapeHtml(U.formatHanjaCurrency(totals.grandTotal))})</small></span>
              <span class="biz-total-number">₩ ${U.formatNumber(totals.grandTotal)}</span>
            </div>
            <table class="doc-table compact thick-outer">
              <colgroup><col style="width:14%"><col style="width:38%"><col style="width:12%"><col style="width:16%"><col style="width:20%"></colgroup>
              <thead><tr><th>월 일</th><th>품 목</th><th>수 량</th><th>단 가</th><th>금 액</th></tr></thead>
              <tbody>${rows.join('')}</tbody>
              <tfoot><tr><th colspan="4">합 계</th><td class="num bold">₩ ${U.formatNumber(totals.grandTotal)}</td></tr></tfoot>
            </table>
            <div style="margin-top:auto;padding-top:6mm;text-align:center;font-size:10.5pt;">${U.escapeHtmlWithBr(s.note || '위 금액을 정히 영수함.')}</div>
          </div>
        </div>
      `;
    },
  });

  /* 4. 품의서 (pumuiseo) */
  F.registerSchema('pumuiseo', {
    stampSlots: [{ key: 'drafter', label: '기안자 (인)', defaultName: '김담당', defaultShape: 'circle', sizeMm: 15 }],
    profileTargets: [{ id: 'drafter', label: '내 개인 + 회사 정보 채우기', slot: 'drafter', personal: { name: 'drafterName', department: 'department', position: 'position' }, company: { companyName: 'companyName' } }],
    required: [{ field: 'drafterName', label: '기안자 성명' }, { field: 'title', label: '품의 제목' }, { field: 'draftDate', label: '기안일' }],
    presets: {
      body: [
        { label: '업무용 장비·비품 구매 품의', text: '1. 구매 사유: 신규 입사자 업무 환경 구축 및 노후 장비 교체\n2. 구매 품목: 업무용 노트북 2대, 모니터 2대 (견적서 2개사 비교 후 최저가 선정)\n3. 기대 효과: 개발·기획 업무 생산성 향상 및 유지보수 비용 절감' },
        { label: '외주 용역 · 계약 체결 품의', text: '1. 추진 배경: 하반기 신규 서비스 런칭을 위한 전문 디자인 외주 진행\n2. 선정 업체 및 금액: (주)바로스튜디오 / 총 3,300,000원 (부가세 포함)\n3. 진행 일정: 계약일로부터 30일 이내 최종 검수 완료 예정' },
        { label: '마케팅 광고비 집행 품의', text: '1. 집행 목적: 신규 고객 유입 확대를 위한 검색광고 및 SNS 캠페인 운영\n2. 월 예산 한도 및 KPI 목표: 월 2,000,000원 한도 / 목표 ROAS 350% 이상' },
      ],
    },
    sections: [
      {
        title: '1. 품의 기본 정보',
        fields: [
          { name: 'docNo', label: '문서번호', half: true, default: 'AP-2026-001' },
          { name: 'draftDate', label: '기안일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'department', label: '기안 부서', half: true, sample: '경영지원팀' },
          { name: 'drafterName', label: '기안자 성명', half: true, sample: '박소연' },
          { name: 'position', label: '직위', half: true, sample: '과장' },
          { name: 'title', label: '품의 제목 (건명)', sample: '신규 입사자 업무용 노트북 및 모니터 구매 품의' },
          { name: 'budget', label: '소요 예산 (원, 해당 시 입력)', type: 'money', default: '2400000', sample: '3200000' },
          { name: 'body', label: '품의 내용 (배경 · 세부 내역 · 기대 효과)', type: 'textarea', minHeight: 130, sample: '1. 추진 배경: 12월 신규 입사자 2명 배치에 따른 필수 업무 장비 지급\n2. 구매 내역: 업무용 노트북 2대(2,600,000원), 27인치 모니터 2대(600,000원)\n3. 결제 방식: 법인카드 결제 및 견적서 2부 비교 첨부 완료' },
          { name: 'attachments', label: '첨부 자료', default: '비교 견적서 1부', sample: '비교 견적서 2부, 품목 명세표 1부' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.budget);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
            <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;margin-bottom:2mm;">품 의 서</h2><div style="font-size:9.2pt;color:#444;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div></div>
            ${makeApprovalTable(ctx, 'drafter')}
          </div>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
            <tr><th>기 안 일 자</th><td>${U.formatKoreanDate(s.draftDate)}</td><th>기 안 부 서</th><td>${V(s.department, '')}</td></tr>
            <tr><th>기 안 자</th><td class="bold">${V(s.drafterName, '')} ${U.escapeHtml(s.position || '')}</td><th>보 존 연 한</th><td>5년</td></tr>
            <tr><th>제 목</th><td colspan="3" class="bold">${V(s.title, '품의 제목')}</td></tr>
            <tr><th>소 요 예 산</th><td colspan="3" class="bold">₩ ${U.formatNumber(amt)}원 (${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))})</td></tr>
            <tr><th>품 의 내 용</th><td colspan="3" style="min-height:110mm;vertical-align:top;padding:4.5mm;line-height:1.8;">${s.body ? U.escapeHtmlWithBr(s.body) : '<span class="doc-empty">품의 배경, 상세 내역, 소요 비용 및 기대효과 기재</span>'}</td></tr>
            <tr><th>첨 부 자 료</th><td colspan="3">${V(s.attachments, '없음')}</td></tr>
          </table>
          <div style="margin-top:auto;text-align:center;font-size:10.5pt;padding-top:4mm;">상기와 같이 품의하오니 검토 후 재가하여 주시기 바랍니다.</div>
        </div>
      `;
    },
  });

  /* 5. 기안서 (gianseo) */
  F.registerSchema('gianseo', {
    stampSlots: [{ key: 'drafter', label: '기안자 (인)', defaultName: '김기안', defaultShape: 'circle', sizeMm: 15 }],
    profileTargets: [{ id: 'drafter', label: '내 개인 + 회사 정보 채우기', slot: 'drafter', personal: { name: 'drafterName', department: 'department', position: 'position' }, company: { companyName: 'companyName' } }],
    required: [{ field: 'drafterName', label: '기안자 성명' }, { field: 'title', label: '기안 제목' }],
    presets: {
      body: [
        { label: '신규 업무·프로세스 도입 기안', text: '1. 기안 목적: 반복적인 수작업 보고 절차를 자동화하여 업무 효율성 제고\n2. 추진 내용: 표준 서식 템플릿 통일 및 주간 현황 공유 체계 수립\n3. 시행 일정: 결재 승인 즉시 전 부서 공지 및 시범 적용' },
        { label: '사내 규정·복지 개선 기안', text: '1. 제안 배경: 직원 만족도 조사 결과를 반영한 탄력근무제 시범 운영 제안\n2. 운영 기준: 코어타임(10:00~16:00) 준수 및 주 40시간 총량 유지\n3. 기대 효과: 출퇴근 피로도 경감 및 업무 몰입도 향상' },
        { label: '거래처 프로모션 행사 기안', text: '1. 행사 개요: 연말 고객 감사 프로모션 및 SNS 이벤트 진행\n2. 기대 성과: 신규 회원 20% 증가 및 재구매율 개선' },
      ],
    },
    sections: [
      {
        title: '1. 기안 기본 정보',
        fields: [
          { name: 'docNo', label: '문서번호', half: true, default: 'DR-2026-001' },
          { name: 'draftDate', label: '기안일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '기안 부서', half: true, sample: '전략기획팀' },
          { name: 'coopDept', label: '협조 부서', half: true, default: '경영지원팀', sample: '인사팀 · 개발팀' },
          { name: 'drafterName', label: '기안자 성명', half: true, sample: '정민아' },
          { name: 'position', label: '직위', half: true, sample: '대리' },
          { name: 'title', label: '기안 제목', sample: '전사 표준 문서 프로세스 도입 및 시행 기안' },
          { name: 'body', label: '기안 상세 내용 (목적 · 추진안 · 일정)', type: 'textarea', minHeight: 140, sample: '1. 기안 목적: 부서별 상이한 문서 양식을 통합하여 결재 속도 및 대외 신뢰도 향상\n2. 세부 추진 방안: 표준 A4 서식 52종 도입 및 전자 서명·도장 가이드 배포\n3. 시행 예정일: 2026년 12월 1일부터 전사 적용' },
          { name: 'attachments', label: '붙임 (첨부서류)', default: '세부 추진 계획서 1부' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;margin-bottom:2mm;">기 안 서</h2><div style="font-size:9.2pt;color:#444;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div></div>
          ${makeApprovalTable(ctx, 'drafter')}
        </div>
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr><th>기 안 일 자</th><td>${U.formatKoreanDate(s.draftDate)}</td><th>기 안 부 서</th><td>${V(s.department, '')}</td></tr>
          <tr><th>기 안 자</th><td class="bold">${V(s.drafterName, '')} ${U.escapeHtml(s.position || '')}</td><th>협 조 부 서</th><td>${V(s.coopDept, '해당 없음')}</td></tr>
          <tr><th>제 목</th><td colspan="3" class="bold">${V(s.title, '기안 제목')}</td></tr>
          <tr><th>기 안 내 용</th><td colspan="3" style="min-height:122mm;vertical-align:top;padding:4.5mm;line-height:1.8;">${s.body ? U.escapeHtmlWithBr(s.body) : '<span class="doc-empty">기안 목적, 세부 추진 계획, 일정 및 기대효과 기재</span>'}</td></tr>
          <tr><th>붙 임</th><td colspan="3">${V(s.attachments, '없음')}</td></tr>
        </table>
        <div style="margin-top:auto;text-align:center;font-size:10.5pt;padding-top:4mm;">상기와 같이 기안하오니 검토 후 승인하여 주시기 바랍니다.</div>
      </div>
    `,
  });

  /* 6. 회의록 (hoeuilok) */
  F.registerSchema('hoeuilok', {
    stampSlots: [{ key: 'writer', label: '작성자 확인 (인)', defaultName: '김서기', defaultShape: 'circle', sizeMm: 15 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보로 작성자 채우기', slot: 'writer', personal: { name: 'writerName', department: 'department' } }],
    required: [{ field: 'meetingTitle', label: '회의명' }, { field: 'meetingDate', label: '회의 일시' }],
    presets: {
      agenda: [
        { label: '주간 정기 회의 표준', text: '1. 지난주 주요 업무 실적 및 KPI 점검\n2. 금주 핵심 목표 및 부서별 협조 요청 사항\n3. 고객 피드백 및 이슈 대응 방안 논의' },
        { label: '프로젝트 킥오프 회의', text: '1. 프로젝트 범위(Scope) 및 최종 마일스톤 확정\n2. 파트별 담당자(R&R) 배정 및 커뮤니케이션 채널 합의\n3. 리스크 요인 및 사전 대응 계획 점검' },
      ],
      decisions: [
        { label: '액션아이템 담당자·기한 정리', text: '[결정 1] 신규 기능 1차 오픈 일정을 12월 10일로 확정함 (담당: 개발팀)\n[결정 2] 마케팅 배너 시안 3종을 11월 25일까지 공유하기로 함 (담당: 디자인팀)\n[차기 회의] 다음 주 수요일 10:00 동일 회의실 진행' },
      ],
    },
    sections: [
      {
        title: '1. 회의 개요',
        fields: [
          { name: 'meetingTitle', label: '회의명', sample: '2026년 11월 4주차 서비스 정기 회의' },
          { name: 'meetingDate', label: '회의 일시', half: true, default: () => U.todayISO() + ' 10:00~11:00', sample: '2026-11-20 10:00 ~ 11:00' },
          { name: 'location', label: '회의 장소', half: true, default: '본사 대회의실 (또는 화상회의)', sample: '본사 7층 대회의실' },
          { name: 'department', label: '주관 부서', half: true, sample: '프로덕트팀' },
          { name: 'writerName', label: '작성자', half: true, sample: '김서연 대리' },
          { name: 'attendees', label: '참석자 명단', sample: '최대표, 박팀장, 김서연 대리, 이개발 선임 (총 4명)' },
        ],
      },
      {
        title: '2. 회의 안건 · 논의 내용 · 결정 사항',
        fields: [
          { name: 'agenda', label: '회의 안건 및 주요 논의 내용', type: 'textarea', minHeight: 110, sample: '1. 신규 서식 52종 확장 릴리즈 일정 점검\n2. 모바일 자필 서명 및 링크 공유 UX 테스트 피드백 반영\n3. 검색 유입(SEO) 및 사이트맵 제출 일정 확인' },
          { name: 'decisions', label: '결정 사항 및 Action Item (담당자 · 기한)', type: 'textarea', minHeight: 100, sample: '1. 전 서식 최종 QA 완료 후 금주 내 배포 확정 (담당: 개발팀 / 기한: 11/21)\n2. 신규 계산기 3종 가이드 문구 검수 완료 (담당: 기획팀 / 기한: 11/22)\n3. 차기 회의 일정: 11월 27일(금) 오전 10시' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">회 의 록</h2></div>
          ${makeApprovalTable(ctx, 'writer', ['작 성', '팀 장', '부서장'])}
        </div>
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr><th>회 의 명</th><td colspan="3" class="bold">${V(s.meetingTitle, '회의명')}</td></tr>
          <tr><th>일 시</th><td>${V(s.meetingDate, '')}</td><th>장 소</th><td>${V(s.location, '')}</td></tr>
          <tr><th>주관 부서</th><td>${V(s.department, '')}</td><th>작 성 자</th><td>${V(s.writerName, '')}</td></tr>
          <tr><th>참 석 자</th><td colspan="3">${V(s.attendees, '')}</td></tr>
          <tr><th>주요 안건 및<br>논의 내용</th><td colspan="3" style="min-height:76mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.agenda ? U.escapeHtmlWithBr(s.agenda) : '<span class="doc-empty">회의 안건 및 논의 내역 기재</span>'}</td></tr>
          <tr><th>결정 사항 및<br>Action Item</th><td colspan="3" style="min-height:66mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.decisions ? U.escapeHtmlWithBr(s.decisions) : '<span class="doc-empty">결정 사항, 담당자 및 완료 기한 기재</span>'}</td></tr>
        </table>
      </div>
    `,
  });

  /* 7. 업무일지·주간업무보고서 (eopmuilji) */
  F.registerSchema('eopmuilji', {
    stampSlots: [{ key: 'writer', label: '보고자 (인)', defaultName: '김보고', defaultShape: 'circle', sizeMm: 15 }],
    profileTargets: [{ id: 'writer', label: '내 개인 정보 채우기', slot: 'writer', personal: { name: 'name', department: 'department', position: 'position' } }],
    required: [{ field: 'name', label: '작성자 성명' }, { field: 'period', label: '보고 기간' }],
    presets: {
      doneTasks: [
        { label: '주간 업무 실적 표준', text: '1. [완료] 11월 거래처 견적서·청구서 정산 마감 (12건 처리 완료)\n2. [진행 80%] 신규 서비스 홍보 콘텐츠 제작 및 배너 검수\n3. [완료] 고객 문의 24건 응대 및 FAQ 업데이트' },
        { label: '일일 업무일지 표준', text: '- 09:00~11:00 주간 현황 데이터 취합 및 팀 회의 참석\n- 11:00~12:00 거래처 A사 발주 건 확인 및 유선 협의\n- 13:00~17:30 신규 기획안 초안 작성 및 내부 리뷰 완료' },
      ],
      nextPlan: [
        { label: '차주 계획 및 요청 사항', text: '1. 신규 프로젝트 2차 검수 및 최종 배포 진행\n2. 월말 세금계산서 발행 대상 리스트 점검\n3. 특이 이슈 및 지원 요청: 없음' },
      ],
    },
    sections: [
      {
        title: '1. 보고 기본 정보',
        fields: [
          { name: 'reportType', label: '보고서 구분', type: 'select', half: true, default: '주간 업무 보고서', options: ['주간 업무 보고서', '일일 업무 일지', '월간 업무 보고서'] },
          { name: 'writtenDate', label: '보고일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, sample: '마케팅기획팀' },
          { name: 'position', label: '직위', half: true, sample: '대리' },
          { name: 'name', label: '작성자 성명', half: true, sample: '김서연' },
          { name: 'period', label: '보고 대상 기간', half: true, default: '2026.11.16 ~ 2026.11.20', sample: '2026.11.16 (월) ~ 2026.11.20 (금)' },
        ],
      },
      {
        title: '2. 주요 실적 및 향후 계획',
        fields: [
          { name: 'doneTasks', label: '금주(금일) 주요 업무 실적', type: 'textarea', minHeight: 115, sample: '1. [완료] 11월 검색광고 성과 리포트 작성 및 팀 공유\n2. [진행 85%] 연말 프로모션 랜딩페이지 기획 및 디자인 협업\n3. [완료] 협력사 3곳 정산 자료 확인' },
          { name: 'nextPlan', label: '차주(익일) 업무 계획', type: 'textarea', minHeight: 95, sample: '1. 연말 프로모션 최종 검수 및 오픈\n2. 12월 예산안 초안 작성 및 부서장 보고' },
          { name: 'issues', label: '특이사항 / 건의 및 협조 요청', type: 'textarea', sample: '랜딩페이지 QA 일정 조율을 위해 개발팀 협조 요청 예정' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">${U.escapeHtml(s.reportType === '일일 업무 일지' ? '일 일 업 무 일 지' : s.reportType === '월간 업무 보고서' ? '월 간 업 무 보 고 서' : '주 간 업 무 보 고 서')}</h2></div>
          ${makeApprovalTable(ctx, 'writer', ['담 당', '팀 장', '부서장'])}
        </div>
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr><th>소 속 부 서</th><td>${V(s.department, '')}</td><th>직 위 / 성 명</th><td class="bold">${V(s.position, '')} ${V(s.name, '')}</td></tr>
          <tr><th>보 고 기 간</th><td class="bold">${V(s.period, '')}</td><th>보 고 일 자</th><td>${U.formatKoreanDate(s.writtenDate)}</td></tr>
          <tr><th>금주(금일)<br>주요 실적</th><td colspan="3" style="min-height:76mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.doneTasks ? U.escapeHtmlWithBr(s.doneTasks) : '<span class="doc-empty">수행 완료 및 진행 중인 주요 업무 기재</span>'}</td></tr>
          <tr><th>차주(익일)<br>업무 계획</th><td colspan="3" style="min-height:56mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.nextPlan ? U.escapeHtmlWithBr(s.nextPlan) : '<span class="doc-empty">향후 추진 계획 기재</span>'}</td></tr>
          <tr><th>특이사항 및<br>협조 요청</th><td colspan="3" style="min-height:28mm;vertical-align:top;padding:4mm;line-height:1.7;">${s.issues ? U.escapeHtmlWithBr(s.issues) : '<span class="doc-empty">특이사항 없음</span>'}</td></tr>
        </table>
      </div>
    `,
  });

  /* 8. 입금확인서·인수증 (ipgeum) */
  F.registerSchema('ipgeum', {
    stampSlots: [{ key: 'issuer', label: '확인자(인수인) (인)', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 18 }],
    profileTargets: [
      { id: 'company', label: '내 회사 정보를 확인자에 채우기', slot: 'issuer', company: { companyName: 'issuerName', bizNo: 'issuerBizOrId', companyPhone: 'issuerPhone', companyAddress: 'issuerAddress' } },
      { id: 'personal', label: '내 개인 정보를 확인자에 채우기', slot: 'issuer', personal: { name: 'issuerName', phone: 'issuerPhone', address: 'issuerAddress' } },
    ],
    required: [{ field: 'payerName', label: '입금인 / 인계자' }, { field: 'issuerName', label: '확인자 / 인수자' }],
    presets: {
      itemDesc: [
        { label: '대금 입금 확인 표준', text: '상기 금액이 당사 지정 계좌로 정상 입금되었음을 확인합니다.' },
        { label: '물품·서류 인수 확인 표준', text: '납품된 물품(또는 원본 서류)의 수량 및 외관 이상 없음을 확인하고 정히 인수합니다.' },
        { label: '보증금·계약금 입금 확인', text: '임대차(또는 매매) 계약에 따른 계약금/잔금이 정상 입금되었음을 확인합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 문서 유형 및 입금/인수 내역',
        fields: [
          { name: 'docKind', label: '문서 유형', type: 'select', half: true, default: '입금 확인서', options: ['입금 확인서', '물품 · 서류 인수증'] },
          { name: 'writtenDate', label: '확인(인수)일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'payerName', label: '입금인 / 인계자 (귀하)', half: true, sample: '주식회사 한빛커머스' },
          { name: 'bankInfo', label: '입금 계좌 / 인도 장소', half: true, sample: '국민은행 123-456-789012' },
          { name: 'amount', label: '입금 금액 (원, 물품 인수증이면 0 가능)', type: 'money', default: '1000000', sample: '3850000' },
          { name: 'itemDesc', label: '입금 내역 / 인수 물품 상세', type: 'textarea', sample: '홈페이지 리뉴얼 용역 대금(견적번호 Q-2026-1119) 전액 계좌 입금 확인' },
        ],
      },
      {
        title: '2. 확인자 (수령인 / 인수자) 정보',
        fields: [
          { name: 'issuerName', label: '확인자 상호 / 성명', half: true, sample: '주식회사 바로스튜디오' },
          { name: 'issuerBizOrId', label: '사업자번호 / 생년월일', half: true, sample: '123-45-67890' },
          { name: 'issuerPhone', label: '연락처', half: true, sample: '02-6000-1234' },
          { name: 'issuerAddress', label: '주소', half: true, sample: '서울특별시 성동구 아차산로 100' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.amount);
      const isInsu = s.docKind === '물품 · 서류 인수증';
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
          <div class="cert-frame">
            <h2 class="doc-title" style="margin-bottom:8mm;">${isInsu ? '인 수 증' : '입 금 확 인 서'}</h2>
            <div class="biz-recipient-line" style="margin-bottom:5mm;"><span>${V(s.payerName, '상대방 성명/상호')}</span><span style="font-size:11pt;font-weight:700;">귀하</span></div>
            ${amt > 0 ? `
              <div class="biz-total-banner" style="flex-direction:column;align-items:flex-start;gap:2mm;padding:4mm 5mm;margin-bottom:5mm;">
                <div style="display:flex;width:100%;justify-content:space-between;">
                  <span class="biz-total-label">${isInsu ? '관련 금액' : '입금 확인 금액'}</span>
                  <span class="biz-total-number">₩ ${U.formatNumber(amt)} 원</span>
                </div>
                <div style="font-size:10pt;font-weight:700;">${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))}</div>
              </div>
            ` : ''}
            <table class="doc-table thick-outer">
              <colgroup><col style="width:24%"><col style="width:76%"></colgroup>
              <tr><th>${isInsu ? '인 수 일 자' : '입 금 일 자'}</th><td class="bold">${U.formatKoreanDate(s.writtenDate)}</td></tr>
              <tr><th>${isInsu ? '인 도 장 소' : '입 금 계 좌'}</th><td>${V(s.bankInfo, '')}</td></tr>
              <tr><th>${isInsu ? '인 수 내 역' : '입 금 내 역'}</th><td style="min-height:48mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.itemDesc ? U.escapeHtmlWithBr(s.itemDesc) : '<span class="doc-empty">상세 내역 기재</span>'}</td></tr>
            </table>
            <div class="doc-statement">${isInsu ? '위 물품(또는 서류) 일체를 이상 없이 정히 인수하였음을 확인합니다.' : '상기 금액이 정상적으로 입금되었음을 정히 확인합니다.'}</div>
            <div class="doc-sign-block" style="text-align:center;">
              <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
              <div style="font-size:12pt;font-weight:800;display:inline-flex;align-items:center;gap:4mm;">
                <span>${isInsu ? '인수자' : '확인자'} : ${V(s.issuerName, '○○○')}</span>
                ${ctx.renderStamp('issuer', '(인)')}
              </div>
              <div style="font-size:9.2pt;color:#444;margin-top:3mm;">${V(s.issuerBizOrId, '')} · ${V(s.issuerPhone, '')} · ${V(s.issuerAddress, '')}</div>
            </div>
          </div>
        </div>
      `;
    },
  });
})(window);
