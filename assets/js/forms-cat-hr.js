/* ==========================================================================
   바로서식 (BaroDoc) — Category 1: 인사·퇴사 신규 8종 서식
   toejik, hyuga, hyujik, bokjik, insu, gyeongwiseo, sayuseo, chuljang
   ========================================================================== */
(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;
  const P = window.BaroPlatform;
  const V = P.valOrEmpty;

  function makeApprovalTable(ctx, slotKey, labels) {
    const cols = labels || ['담 당', '팀 장', '부서장', '대 표'];
    return `
      <table class="doc-table compact thick-outer" style="width:74mm;margin:0;">
        <tr><th rowspan="2" style="width:14%;line-height:1.4;">결<br>재</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
        <tr><td class="center" style="height:14mm;">${ctx.renderStamp(slotKey, '')}</td>${cols.slice(1).map(() => '<td></td>').join('')}</tr>
      </table>
    `;
  }

  /* 1. 퇴직증명서 (toejik) */
  F.registerSchema('toejik', {
    stampSlots: [{ key: 'company', label: '회사 직인', defaultName: '바로테크인', defaultShape: 'square', sizeMm: 19 }],
    getSuggestedStampName: (s) => (s.companyName ? s.companyName.replace(/\(주\)|주식회사|\s+/g, '').slice(0, 7) + '인' : '바로테크인'),
    profileTargets: [{
      id: 'both', label: '내 개인 + 회사 정보 불러오기', slot: 'company',
      personal: { name: 'name', birthOrId: 'residentId', address: 'address', department: 'department', position: 'position' },
      company: { companyName: 'companyName', bizNo: 'bizNo', ceoName: 'ceoName', companyPhone: 'companyPhone', companyAddress: 'companyAddress' },
    }],
    required: [
      { field: 'name', label: '성명' },
      { field: 'leaveDate', label: '퇴직일' },
      { field: 'companyName', label: '회사명' },
      { field: 'issueDate', label: '발급일자' },
    ],
    validate: (s) => (s.joinDate && s.leaveDate && s.leaveDate < s.joinDate ? [{ level: 'danger', text: '퇴직일이 입사일보다 빠릅니다.' }] : []),
    presets: {
      leaveReason: [
        { label: '개인 사정 (자발적 퇴직)', text: '개인 사정으로 인한 자발적 퇴직' },
        { label: '계약기간 만료', text: '근로계약 기간 만료에 따른 퇴직' },
        { label: '경영상 권고사직', text: '회사 경영상 사정에 의한 권고사직' },
        { label: '정년 퇴직', text: '취업규칙상 정년 도래에 따른 정년퇴직' },
      ],
    },
    sections: [
      {
        title: '1. 퇴직자 인적사항',
        fields: [
          { name: 'docNo', label: '문서번호', half: true, default: 'RET-2026-001', sample: 'RET-2026-1120' },
          { name: 'issueDate', label: '발급일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'name', label: '성명', half: true, placeholder: '홍길동', sample: '김도윤' },
          { name: 'residentId', label: '생년월일 / 주민번호', half: true, placeholder: '920415-1******', sample: '920415-1234567' },
          { name: 'maskId', label: '주민번호 뒷자리 마스킹(******) 적용', type: 'checkbox', default: true },
          { name: 'department', label: '최종 소속 부서', half: true, placeholder: '개발팀', sample: '플랫폼개발팀' },
          { name: 'position', label: '최종 직위', half: true, placeholder: '과장', sample: '선임연구원' },
          { name: 'joinDate', label: '입사일', type: 'date', half: true, default: '2022-03-02', sample: '2022-03-02' },
          { name: 'leaveDate', label: '퇴직일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'address', label: '현주소', placeholder: '도로명 주소', sample: '서울특별시 송파구 올림픽로 300, 102동 804호' },
          { name: 'leaveReason', label: '퇴직 사유 (필요 시 기재)', type: 'textarea', placeholder: '퇴직 사유 (미기재 시 공란 처리 가능)', sample: '개인 사정으로 인한 자발적 퇴직' },
          { name: 'purpose', label: '제출 용도', default: '기관 제출용', sample: '이직 회사 및 금융기관 제출용' },
        ],
      },
      {
        title: '2. 발급 회사 정보',
        fields: [
          { name: 'companyName', label: '회사명', half: true, placeholder: '주식회사 바로테크', sample: '주식회사 바로테크' },
          { name: 'bizNo', label: '사업자등록번호', half: true, placeholder: '000-00-00000', sample: '214-88-12345' },
          { name: 'ceoName', label: '대표이사', half: true, placeholder: '대표자명', sample: '최대표' },
          { name: 'companyPhone', label: '전화번호', half: true, placeholder: '02-000-0000', sample: '02-555-1234' },
          { name: 'companyAddress', label: '소재지', placeholder: '회사 도로명 주소', sample: '서울특별시 강남구 테헤란로 210, 8층' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const tenure = U.calcTenure(s.joinDate, s.leaveDate);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm;">
          <div class="cert-frame">
            <div style="font-size:9.2pt;color:#444;margin-bottom:4mm;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div>
            <h2 class="doc-title" style="margin-bottom:7mm;">퇴 직 증 명 서</h2>
            <table class="doc-table thick-outer">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>주민등록번호</th><td>${V(U.maskResidentId(s.residentId, s.maskId), '생년월일')}</td></tr>
              <tr><th>현 주 소</th><td colspan="3">${V(s.address, '현주소')}</td></tr>
              <tr><th>최종 소속</th><td>${V(s.department, '소속')}</td><th>최종 직위</th><td>${V(s.position, '직위')}</td></tr>
              <tr><th>재직 기간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.joinDate)} ~ ${U.formatKoreanDate(s.leaveDate)} ${tenure ? `(총 ${U.escapeHtml(tenure)})` : ''}</td></tr>
              <tr><th>퇴직 사유</th><td colspan="3">${V(s.leaveReason, '')}</td></tr>
              <tr><th>제출 용도</th><td colspan="3">${V(s.purpose, '제출 용도')}</td></tr>
            </table>
            <table class="doc-table">
              <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
              <tr><th>회 사 명</th><td class="bold">${V(s.companyName, '회사명')}</td><th>사업자번호</th><td>${V(s.bizNo, '')}</td></tr>
              <tr><th>대 표 자</th><td>${V(s.ceoName, '')}</td><th>전화번호</th><td>${V(s.companyPhone, '')}</td></tr>
              <tr><th>소 재 지</th><td colspan="3">${V(s.companyAddress, '회사 소재지')}</td></tr>
            </table>
            <div class="doc-statement" style="margin:8mm 0 6mm;">위 사람은 당사에서 상기와 같이 근무하고 퇴직하였음을 증명합니다.</div>
            <div class="doc-sign-block" style="text-align:center;">
              <div class="doc-date">${U.formatKoreanDate(s.issueDate)}</div>
              <div style="font-size:13pt;font-weight:800;margin-top:6mm;display:inline-flex;align-items:center;gap:4mm;">
                <span>${V(s.companyName, '주식회사 ○○○')}</span>
                <span>대표이사 ${V(s.ceoName, '○○○')}</span>
                ${ctx.renderStamp('company', '(직인)')}
              </div>
            </div>
          </div>
        </div>
      `;
    },
  });

  /* 2. 연차휴가신청서 (hyuga) */
  F.registerSchema('hyuga', {
    stampSlots: [{ key: 'writer', label: '신청인 (인)', defaultName: '김민수', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position', phone: 'phone' },
      company: { companyName: 'companyName' },
    }],
    required: [
      { field: 'name', label: '신청인 성명' },
      { field: 'startDate', label: '휴가 시작일' },
      { field: 'endDate', label: '휴가 종료일' },
      { field: 'writtenDate', label: '신청일' },
    ],
    validate: (s) => (s.startDate && s.endDate && s.endDate < s.startDate ? [{ level: 'danger', text: '휴가 종료일이 시작일보다 빠릅니다.' }] : []),
    presets: {
      reason: [
        { label: '개인 사정 (연차 소진)', text: '개인 사정으로 인하여 연차유급휴가를 신청합니다. 휴가 기간 중 긴급 업무는 비상연락망을 통해 대응하겠습니다.' },
        { label: '가족 행사 · 여행', text: '가족 행사 참석을 위하여 연차휴가를 신청합니다. 사전 업무 정리 및 대직자 인계를 완료하였습니다.' },
        { label: '병원 진료 · 건강검진', text: '건강검진 및 병원 진료를 위하여 반차(또는 연차) 휴가를 신청합니다.' },
        { label: '경조사 휴가', text: '가족 경조사 참석을 위하여 취업규칙에 따른 경조휴가를 신청합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 신청인 정보',
        fields: [
          { name: 'companyName', label: '회사명', half: true, placeholder: '주식회사 바로테크', sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '신청일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, placeholder: '마케팅팀', sample: '마케팅팀' },
          { name: 'position', label: '직위 / 직급', half: true, placeholder: '대리', sample: '대리' },
          { name: 'name', label: '성명', half: true, placeholder: '홍길동', sample: '김서연' },
          { name: 'phone', label: '비상 연락처', half: true, type: 'tel', placeholder: '010-0000-0000', sample: '010-2345-6789' },
        ],
      },
      {
        title: '2. 휴가 구분 및 기간',
        fields: [
          { name: 'leaveType', label: '휴가 종류', type: 'select', half: true, default: '연차휴가', options: ['연차휴가', '오전 반차 (0.5일)', '오후 반차 (0.5일)', '경조휴가', '병가', '공가', '출산·배우자출산휴가'] },
          { name: 'days', label: '사용 일수 (일)', half: true, default: '1', sample: '2' },
          { name: 'startDate', label: '시작일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '종료일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'proxyName', label: '업무 대직자 (인계자)', placeholder: '예: 박지훈 과장', sample: '박지훈 과장' },
          { name: 'reason', label: '휴가 사유 및 업무 인계 사항', type: 'textarea', sample: '개인 사정으로 인하여 연차유급휴가를 신청합니다. 휴가 기간 중 진행 건은 박지훈 과장에게 사전 인계 완료하였습니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;">
            <h2 class="doc-title compact" style="text-align:left;padding-left:0;margin-bottom:2mm;">연 차 휴 가 신 청 서</h2>
            <div style="font-size:9.5pt;color:#444;">신청일자 : ${U.formatKoreanDate(s.writtenDate)}</div>
          </div>
          ${makeApprovalTable(ctx, 'writer', ['담 당', '팀 장', '부서장', '대 표'])}
        </div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>소 속</th><td>${V(s.department, '부서명')}</td><th>직 위</th><td>${V(s.position, '직위')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>비상연락처</th><td>${V(s.phone, '연락처')}</td></tr>
          <tr><th>휴가 구분</th><td class="bold">${V(s.leaveType, '연차휴가')}</td><th>사용 일수</th><td class="bold">총 ${U.escapeHtml(s.days || '1')} 일</td></tr>
          <tr><th>휴가 기간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</td></tr>
          <tr><th>업무 대직자</th><td colspan="3">${V(s.proxyName, '대직자 성명')}</td></tr>
          <tr><th>사유 및<br>인계 사항</th><td colspan="3" style="min-height:46mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.reason ? U.escapeHtmlWithBr(s.reason) : '<span class="doc-empty">휴가 사유 및 업무 인계 사항 기재</span>'}</td></tr>
        </table>
        <div class="doc-statement">상기와 같이 휴가를 신청하오니 허가하여 주시기 바랍니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row">
            <span>신청인 :</span>
            <span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>
            ${ctx.renderStamp('writer', '(인)')}
          </div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 3. 휴직신청서 (hyujik) */
  F.registerSchema('hyujik', {
    stampSlots: [{ key: 'writer', label: '신청인 (인)', defaultName: '김민수', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position', phone: 'phone', address: 'address' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '신청인 성명' }, { field: 'startDate', label: '휴직 시작일' }, { field: 'endDate', label: '휴직 종료일' }],
    validate: (s) => (s.startDate && s.endDate && s.endDate < s.startDate ? [{ level: 'danger', text: '휴직 종료일이 시작일보다 빠릅니다.' }] : []),
    presets: {
      reason: [
        { label: '육아휴직 신청', text: '만 8세 이하(또는 초등학교 2학년 이하) 자녀의 양육을 위하여 남녀고용평등법에 따른 육아휴직을 신청합니다. (가족관계증명서 별첨)' },
        { label: '질병·부상 휴직', text: '개인 질병 치료 및 회복을 위하여 전문의 진단서에 따라 일정 기간 병가 휴직을 신청합니다. (의사 진단서 별첨)' },
        { label: '가족돌봄 휴직', text: '가족의 질병·사고·노령으로 인한 돌봄이 필요하여 가족돌봄휴직을 신청합니다.' },
        { label: '일신상 개인 휴직', text: '개인적인 사정으로 인하여 일정 기간 무급 휴직을 신청하며, 휴직 기간 종료 후 성실히 복직하겠습니다.' },
      ],
    },
    sections: [
      {
        title: '1. 신청인 인적사항',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '신청일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, sample: '디자인팀' },
          { name: 'position', label: '직위', half: true, sample: '과장' },
          { name: 'name', label: '성명', half: true, sample: '이지은' },
          { name: 'phone', label: '휴직 중 연락처', type: 'tel', half: true, sample: '010-4444-5555' },
          { name: 'address', label: '현주소', sample: '경기도 성남시 분당구 정자로 100, 305호' },
        ],
      },
      {
        title: '2. 휴직 종류 및 기간',
        fields: [
          { name: 'leaveType', label: '휴직 구분', type: 'select', default: '육아휴직', options: ['육아휴직', '질병·상해 휴직', '가족돌봄휴직', '일신상 일반휴직', '학업·연수 휴직'] },
          { name: 'startDate', label: '휴직 시작일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'endDate', label: '휴직 종료 예정일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 7) },
          { name: 'reason', label: '휴직 사유', type: 'textarea', sample: '자녀 양육을 위하여 남녀고용평등법에 따른 육아휴직을 신청합니다.' },
          { name: 'attachments', label: '첨부 서류', placeholder: '예: 진단서 1부, 가족관계증명서 1부', sample: '가족관계증명서 1부, 주민등록등본 1부' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">휴 직 신 청 서</h2></div>
          ${makeApprovalTable(ctx, 'writer')}
        </div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>소 속</th><td>${V(s.department, '부서명')}</td><th>직 위</th><td>${V(s.position, '직위')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>연 락 처</th><td>${V(s.phone, '연락처')}</td></tr>
          <tr><th>현 주 소</th><td colspan="3">${V(s.address, '현주소')}</td></tr>
          <tr><th>휴직 구분</th><td colspan="3" class="bold">${V(s.leaveType, '육아휴직')}</td></tr>
          <tr><th>휴직 기간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</td></tr>
          <tr><th>휴직 사유</th><td colspan="3" style="min-height:42mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.reason ? U.escapeHtmlWithBr(s.reason) : '<span class="doc-empty">구체적 휴직 사유 기재</span>'}</td></tr>
          <tr><th>첨부 서류</th><td colspan="3">${V(s.attachments, '없음')}</td></tr>
        </table>
        <div class="doc-statement">상기와 같은 사유로 휴직을 신청하오니 허가하여 주시기 바라며,<br>휴직 기간 종료 시 회사의 규정에 따라 복직 절차를 성실히 이행하겠습니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>신청인 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 4. 복직신청서 (bokjik) */
  F.registerSchema('bokjik', {
    stampSlots: [{ key: 'writer', label: '신청인 (인)', defaultName: '김민수', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position', phone: 'phone', address: 'address' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '신청인 성명' }, { field: 'returnDate', label: '복직 예정일' }],
    presets: {
      reason: [
        { label: '육아휴직 만료 복직', text: '육아휴직 기간이 만료됨에 따라 정상 근무가 가능하여 복직을 신청합니다.' },
        { label: '질병 완치 · 회복 복직', text: '질병 치료를 마치고 정상적인 업무 수행이 가능하다는 전문의 소견을 받아 복직을 신청합니다. (소견서 별첨)' },
        { label: '조기 복직 요청', text: '휴직 사유가 조기에 해소되어 당초 예정일보다 앞서 복직하고자 신청합니다.' },
      ],
    },
    sections: [
      {
        title: '1. 신청인 정보',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '신청일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '휴직 전 소속', half: true, sample: '디자인팀' },
          { name: 'position', label: '직위', half: true, sample: '과장' },
          { name: 'name', label: '성명', half: true, sample: '이지은' },
          { name: 'phone', label: '연락처', type: 'tel', half: true, sample: '010-4444-5555' },
          { name: 'address', label: '현주소', sample: '경기도 성남시 분당구 정자로 100, 305호' },
        ],
      },
      {
        title: '2. 휴직 이력 및 복직 예정일',
        fields: [
          { name: 'leaveType', label: '휴직 종류', half: true, default: '육아휴직', sample: '육아휴직' },
          { name: 'returnDate', label: '복직 예정일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'leaveStart', label: '휴직 시작일', type: 'date', half: true, sample: '2026-01-01' },
          { name: 'leaveEnd', label: '휴직 종료일', type: 'date', half: true, sample: '2026-12-31' },
          { name: 'reason', label: '복직 사유 및 희망 사항', type: 'textarea', sample: '육아휴직 기간이 만료됨에 따라 정상 근무가 가능하여 복직을 신청합니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">복 직 신 청 서</h2></div>
          ${makeApprovalTable(ctx, 'writer')}
        </div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>휴직 전 소속</th><td>${V(s.department, '부서명')}</td><th>직 위</th><td>${V(s.position, '직위')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>연 락 처</th><td>${V(s.phone, '연락처')}</td></tr>
          <tr><th>현 주 소</th><td colspan="3">${V(s.address, '현주소')}</td></tr>
          <tr><th>휴직 구분</th><td>${V(s.leaveType, '육아휴직')}</td><th>복직 예정일</th><td class="bold">${U.formatKoreanDate(s.returnDate)}</td></tr>
          <tr><th>휴직 기간</th><td colspan="3">${U.formatKoreanDate(s.leaveStart)} ~ ${U.formatKoreanDate(s.leaveEnd)}</td></tr>
          <tr><th>복직 사유</th><td colspan="3" style="min-height:46mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.reason ? U.escapeHtmlWithBr(s.reason) : '<span class="doc-empty">복직 사유 기재</span>'}</td></tr>
        </table>
        <div class="doc-statement">휴직 사유가 종료되어 위와 같이 복직을 신청하오니 허가하여 주시기 바랍니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>신청인 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 5. 업무인수인계서 (insu) */
  F.registerSchema('insu', {
    stampSlots: [
      { key: 'handover', label: '인계자 (넘기는 분)', defaultName: '김인계', defaultShape: 'circle', sizeMm: 16 },
      { key: 'receiver', label: '인수자 (받는 분)', defaultName: '이인수', defaultShape: 'circle', sizeMm: 16 },
      { key: 'witness', label: '입회자 (팀장)', defaultName: '박팀장', defaultShape: 'circle', sizeMm: 16 },
    ],
    getSuggestedStampName: (s, slot) => (slot === 'handover' ? s.handoverName || '김인계' : slot === 'receiver' ? s.receiverName || '이인수' : s.witnessName || '박팀장'),
    profileTargets: [{
      id: 'handover', label: '내 정보를 인계자(퇴사·이동자)에 채우기', slot: 'handover',
      personal: { name: 'handoverName', department: 'department', position: 'handoverPos' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'handoverName', label: '인계자 성명' }, { field: 'receiverName', label: '인수자 성명' }, { field: 'writtenDate', label: '작성일' }],
    presets: {
      tasksSummary: [
        { label: '퇴사 표준 인수인계', text: '1. 정기 업무 현황 및 주간/월간 스케줄 공유 완료\n2. 거래처 및 유관 부서 담당자 비상연락망 전달 완료\n3. 공유 드라이브 핵심 문서·매뉴얼 경로 및 계정 권한 이관 완료' },
        { label: '부서 이동 인수인계', text: '1. 진행 중인 프로젝트 3건의 현재 진척도 및 잔여 이슈 리스트 공유\n2. 발주·정산 대기 건 및 결재 문서 이력 인계 완료' },
        { label: '휴직 전 임시 인계', text: '1. 휴직 기간 중 정기 보고 및 고객 응대 업무 대행 매뉴얼 인계\n2. 긴급 문의 발생 시 비상 연락 기준 합의 완료' },
      ],
      assetsReturn: [
        { label: '노트북·사원증·법인카드', text: '업무용 노트북(충전기 포함), 사원증, 법인카드, 보안토큰 반납 완료' },
        { label: '계정·문서함 권한 이관', text: '공용 이메일, 노션/슬랙 관리자 권한, 구글 드라이브 폴더 소유권 이전 완료' },
      ],
    },
    sections: [
      {
        title: '1. 인수인계 기본 정보',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'department', label: '소속 부서', half: true, sample: '서비스운영팀' },
          { name: 'reason', label: '인수인계 사유', type: 'select', half: true, default: '퇴사', options: ['퇴사', '부서 이동', '휴직', '직무 변경'] },
          { name: 'writtenDate', label: '인수인계 완료일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'handoverName', label: '인계자 성명', half: true, sample: '김민수' },
          { name: 'handoverPos', label: '인계자 직위', half: true, sample: '대리' },
          { name: 'receiverName', label: '인수자 성명', half: true, sample: '박지훈' },
          { name: 'receiverPos', label: '인수자 직위', half: true, sample: '사원' },
          { name: 'witnessName', label: '입회자 (부서장/팀장)', sample: '최팀장' },
        ],
      },
      {
        title: '2. 인계 업무 및 자산 반납 내역',
        fields: [
          { name: 'tasksSummary', label: '주요 인계 업무 및 진행 현황', type: 'textarea', minHeight: 100, sample: '1. 정기 월간 리포트 작성 절차 및 템플릿 공유 완료\n2. 주요 협력사(5개사) 담당자 연락처 및 계약 현황 인계\n3. 팀 공유 드라이브 내 업무 매뉴얼 폴더 권한 이관 완료' },
          { name: 'pendingIssues', label: '미결 업무 및 유의사항', type: 'textarea', sample: '12월 5일 예정된 연말 정산 자료 취합 건은 A사 담당자 회신 확인 필요' },
          { name: 'assetsReturn', label: '인계 문서 · 계정 · 비품 목록', type: 'textarea', sample: '업무용 노트북 1대, 법인카드 1매, 사원증 1매, 공용 계정 매뉴얼 1부' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
        <h2 class="doc-title compact">업 무 인 수 인 계 서</h2>
        <table class="doc-table compact thick-outer">
          <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
          <tr><th>소 속 부 서</th><td>${V(s.department, '소속 부서')}</td><th>인계 사유</th><td class="bold">${V(s.reason, '퇴사')}</td></tr>
          <tr><th>인계자 (넘김)</th><td class="bold">${V(s.handoverName, '')} ${U.escapeHtml(s.handoverPos || '')}</td><th>인수자 (받음)</th><td class="bold">${V(s.receiverName, '')} ${U.escapeHtml(s.receiverPos || '')}</td></tr>
          <tr><th>인계 완료일</th><td>${U.formatKoreanDate(s.writtenDate)}</td><th>입회자 (확인)</th><td>${V(s.witnessName, '')}</td></tr>
        </table>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:22%"><col style="width:78%"></colgroup>
          <tr><th>주요 인계 업무<br>및 진행 현황</th><td style="min-height:46mm;vertical-align:top;padding:3.5mm;line-height:1.7;">${s.tasksSummary ? U.escapeHtmlWithBr(s.tasksSummary) : '<span class="doc-empty">담당 업무 및 진행 현황 기재</span>'}</td></tr>
          <tr><th>미결 업무 및<br>특이 유의사항</th><td style="min-height:28mm;vertical-align:top;padding:3.5mm;line-height:1.7;">${s.pendingIssues ? U.escapeHtmlWithBr(s.pendingIssues) : '<span class="doc-empty">미결 사항 없음</span>'}</td></tr>
          <tr><th>인계 서류 · 계정<br>및 비품 목록</th><td style="min-height:24mm;vertical-align:top;padding:3.5mm;line-height:1.7;">${s.assetsReturn ? U.escapeHtmlWithBr(s.assetsReturn) : '<span class="doc-empty">비품 및 계정 이관 내역</span>'}</td></tr>
        </table>
        <p style="text-align:center;font-size:10.5pt;margin:5mm 0;">상기 업무 및 관련 서류·비품 일체를 정확히 인계하고 인수하였음을 확인합니다.</p>
        <div class="doc-sign-block">
          <div class="doc-date" style="margin:2mm 0 5mm;">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>인 계 자 :</span><span class="doc-sign-name">${V(s.handoverName, '○○○')}</span>${ctx.renderStamp('handover', '(인)')}</div>
          <div class="doc-sign-row"><span>인 수 자 :</span><span class="doc-sign-name">${V(s.receiverName, '○○○')}</span>${ctx.renderStamp('receiver', '(인)')}</div>
          <div class="doc-sign-row"><span>입 회 자 :</span><span class="doc-sign-name">${V(s.witnessName, '○○○')}</span>${ctx.renderStamp('witness', '(인)')}</div>
        </div>
      </div>
    `,
  });

  /* 6. 경위서 (gyeongwiseo) */
  F.registerSchema('gyeongwiseo', {
    stampSlots: [{ key: 'writer', label: '작성자 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position', phone: 'phone' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '작성자 성명' }, { field: 'subject', label: '사건 건명' }, { field: 'writtenDate', label: '작성일' }],
    presets: {
      chronology: [
        { label: '업무 오류 발생 경위', text: '1. 발생 일시 및 경과: 당일 14:00경 거래처 발송 자료 취합 과정에서 단가 항목 오기입 발생.\n2. 인지 및 조치: 15:10경 오류를 즉시 인지하여 거래처 담당자에게 유선 안내 및 정정본 재발송 완료.\n3. 현재 상태: 거래처 확인 완료되었으며 금전적 손실은 발생하지 않았음.' },
        { label: '업무용 차량 접촉사고', text: '1. 발생 일시 및 장소: 당일 11:30경 거래처 방문 후 지하주차장 출차 중 기둥 접촉.\n2. 조치 사항: 즉시 현장 사진 촬영, 보험사 접수 및 관리팀 보고 완료.\n3. 인명 피해 여부: 인명 피해 없으며 차량 범퍼 경미한 긁힘 발생.' },
        { label: '고객 민원 발생 경위', text: '1. 발생 경과: 고객 문의 응대 과정에서 안내 기준 전달 지연으로 민원 제기됨.\n2. 현장 조치: 팀장 보고 후 고객께 직접 사과 및 정상 처리 일정 확정 안내 완료.' },
      ],
      followUp: [
        { label: '이중 검수 체크리스트 도입', text: '향후 외부 발송 전 필수 항목 체크리스트 검수 및 팀 내 상호 확인 절차를 정례화하겠습니다.' },
        { label: '안전 수칙 및 보고 체계 준수', text: '차량 운행 전후 안전 점검을 철저히 하고 특이사항 발생 시 즉시 보고 체계를 준수하겠습니다.' },
      ],
    },
    sections: [
      {
        title: '1. 작성자 및 사건 개요',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, sample: '영업관리팀' },
          { name: 'position', label: '직위', half: true, sample: '대리' },
          { name: 'name', label: '성명', half: true, sample: '박현우' },
          { name: 'incidentDate', label: '사건 발생일시', half: true, default: () => U.todayISO(), sample: '2026-11-20 14:00' },
          { name: 'subject', label: '사건 건명 (제목)', placeholder: '예: 거래처 견적 단가 오기입 발생 경위 보고', sample: '거래처 발송 단가표 오기입 및 정정 조치 경위' },
          { name: 'location', label: '발생 장소 / 관련 대상', placeholder: '예: 본사 사무실 / OO거래처', sample: '본사 영업관리팀 / (주)한빛상사' },
        ],
      },
      {
        title: '2. 시간순 경위 및 후속 조치',
        fields: [
          { name: 'chronology', label: '발생 경위 (육하원칙 중심, 객관적 사실 기재)', type: 'textarea', minHeight: 110, sample: '1. 발생 경과: 11월 20일 14:00경 (주)한빛상사 발송 견적서 작성 중 일부 품목 단가가 오기입되어 발송됨.\n2. 인지 및 조치: 15:10경 자체 재검토 중 즉시 오류를 발견하여 거래처에 유선 통보 및 정정본 재송부 완료.\n3. 피해 현황: 계약 확정 전 정정되어 실제 금전적 손실은 없음.' },
          { name: 'followUp', label: '향후 조치 및 개선 대책', type: 'textarea', sample: '외부 발송 전 필수 단가 검수 체크리스트를 도입하고 담당자 교차 확인 후 발송하도록 개선하겠습니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">경 위 서</h2></div>
          ${makeApprovalTable(ctx, 'writer')}
        </div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>소 속</th><td>${V(s.department, '소속')}</td><th>직 위</th><td>${V(s.position, '직위')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>발생 일시</th><td>${V(s.incidentDate, '')}</td></tr>
          <tr><th>발생 장소/대상</th><td colspan="3">${V(s.location, '')}</td></tr>
          <tr><th>건 명</th><td colspan="3" class="bold">${V(s.subject, '사건 건명')}</td></tr>
          <tr><th>발생 경위<br>(사실 관계)</th><td colspan="3" style="min-height:60mm;vertical-align:top;padding:4mm;line-height:1.75;">${s.chronology ? U.escapeHtmlWithBr(s.chronology) : '<span class="doc-empty">시간 순서대로 객관적 경위 기재</span>'}</td></tr>
          <tr><th>조치 결과 및<br>개선 대책</th><td colspan="3" style="min-height:30mm;vertical-align:top;padding:4mm;line-height:1.7;">${s.followUp ? U.escapeHtmlWithBr(s.followUp) : '<span class="doc-empty">후속 조치 및 재발 방지 대책</span>'}</td></tr>
        </table>
        <div class="doc-statement" style="margin:5mm 0;">위 내용은 사실과 다름이 없음을 확인하고 이에 경위서를 제출합니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>작성자 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 7. 지각·조퇴사유서 (sayuseo) */
  F.registerSchema('sayuseo', {
    stampSlots: [{ key: 'writer', label: '작성자 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '성명' }, { field: 'targetDate', label: '해당 일자' }],
    presets: {
      reason: [
        { label: '대중교통 지연·사고', text: '출근 중 지하철(또는 버스) 운행 지연 사고로 인해 불가피하게 소정 출근 시각보다 늦게 도착하였습니다. (지연증명서 별첨)' },
        { label: '병원 진료 · 몸살', text: '갑작스러운 컨디션 난조(병원 외래 진료)로 인하여 부득이하게 지각(또는 조퇴)을 요청드립니다. 담당 업무는 사전 정리 완료하였습니다.' },
        { label: '개인·가족 긴급 사정', text: '가족의 긴급한 병원 동행 사정이 발생하여 부득이하게 조퇴를 신청합니다. 잔여 업무는 익일 오전 중 우선 처리하겠습니다.' },
      ],
    },
    sections: [
      {
        title: '1. 근태 사유 기본 정보',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '제출일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, sample: '개발팀' },
          { name: 'position', label: '직위', half: true, sample: '사원' },
          { name: 'name', label: '성명', half: true, sample: '정하준' },
          { name: 'kind', label: '근태 구분', type: 'select', half: true, default: '지각', options: ['지각', '조퇴', '외출', '결근'] },
          { name: 'targetDate', label: '해당 일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'timeRange', label: '발생 시각 / 소요 시간', half: true, placeholder: '예: 09:00 ~ 09:40 (40분 지각)', sample: '09:00 ~ 09:35 (35분 지각)' },
          { name: 'reason', label: '상세 사유', type: 'textarea', sample: '출근 중 지하철 신호 장애에 따른 열차 운행 지연으로 부득이하게 35분 지각하였습니다. (지연증명서 첨부)' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm;gap:6mm;">
          <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">지각 · 조퇴 사유서</h2></div>
          ${makeApprovalTable(ctx, 'writer', ['담 당', '팀 장', '부서장'])}
        </div>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>소 속</th><td>${V(s.department, '부서명')}</td><th>직 위</th><td>${V(s.position, '직위')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>근태 구분</th><td class="bold">${V(s.kind, '지각')}</td></tr>
          <tr><th>해당 일자</th><td>${U.formatKoreanDate(s.targetDate)}</td><th>시각 / 시간</th><td>${V(s.timeRange, '')}</td></tr>
          <tr><th>상세 사유</th><td colspan="3" style="min-height:66mm;vertical-align:top;padding:4mm;line-height:1.8;">${s.reason ? U.escapeHtmlWithBr(s.reason) : '<span class="doc-empty">지각·조퇴·외출·결근의 구체적 사유 기재</span>'}</td></tr>
        </table>
        <div class="doc-statement">상기와 같은 사유로 근태 사유서를 제출하오니 선처하여 주시기 바라며,<br>향후 사내 복무 규정을 성실히 준수하겠습니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>작성자 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 8. 출장신청서·보고서 (chuljang) */
  F.registerSchema('chuljang', {
    stampSlots: [{ key: 'writer', label: '출장자 (인)', defaultName: '김출장', defaultShape: 'circle', sizeMm: 16 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', department: 'department', position: 'position', phone: 'phone' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '출장자 성명' }, { field: 'destination', label: '출장지' }, { field: 'startDate', label: '출장 시작일' }],
    presets: {
      purpose: [
        { label: '거래처 영업 · 미팅', text: '신규 파트너사 계약 조건 협의 및 2026년 연간 공급 물량 미팅 진행' },
        { label: '현장 점검 · 기술 지원', text: '고객사 시스템 구축 현장 점검, 담당자 교육 및 기술 지원 수행' },
        { label: '전시회 · 세미나 참관', text: '업계 주요 박람회 참관, 시장 트렌드 조사 및 잠재 거래처 발굴' },
      ],
      resultSummary: [
        { label: '출장 신청(사전 계획)', text: '1일차: 오전 이동 및 고객사 미팅 / 오후 현장 실사\n2일차: 최종 협의안 정리 및 복귀 예정' },
        { label: '출장 보고(완료 결과)', text: '1. 거래처 실무진과 단가 및 납기 일정 합의 완료(발주서 12월 초 접수 예정)\n2. 특이사항 및 추가 요청 사항은 주간 회의 시 공유 예정' },
      ],
    },
    sections: [
      {
        title: '1. 출장 기본 정보',
        fields: [
          { name: 'docMode', label: '문서 유형', type: 'select', half: true, default: '출장 신청서', options: ['출장 신청서', '출장 결과 보고서'] },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'department', label: '소속 부서', half: true, sample: '사업개발팀' },
          { name: 'name', label: '출장자 성명', half: true, sample: '최유진' },
          { name: 'position', label: '직위', half: true, sample: '과장' },
          { name: 'destination', label: '출장지 (방문처)', half: true, placeholder: '예: 부산 해운대구 (주)대한물산', sample: '부산광역시 해운대구 (주)대한물산 본사' },
          { name: 'transport', label: '교통 수단', half: true, default: 'KTX / 대중교통', sample: 'KTX 왕복 및 현지 택시' },
          { name: 'startDate', label: '출장 시작일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '출장 종료일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'budget', label: '예상(또는 집행) 경비 총액 (원)', type: 'money', default: '250000', sample: '335000' },
        ],
      },
      {
        title: '2. 출장 목적 및 일정/결과',
        fields: [
          { name: 'purpose', label: '출장 목적', type: 'textarea', sample: '신규 거래처 연간 공급 계약 협의 및 물류센터 현장 실사' },
          { name: 'resultSummary', label: '세부 일정 / 출장 결과 보고', type: 'textarea', minHeight: 95, sample: '1. 11/20 10:00~12:00 계약 단가 및 납기 협의 완료\n2. 11/20 14:00~16:00 물류센터 입고 프로세스 점검 완료\n3. 영수증 및 카드전표 일체는 지출결의서로 별도 정산 예정' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const amt = U.parseNumber(s.budget);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm;gap:6mm;">
            <div style="flex:1;padding-top:4mm;"><h2 class="doc-title compact" style="text-align:left;padding-left:0;">${U.escapeHtml(s.docMode === '출장 결과 보고서' ? '출 장 결 과 보 고 서' : '출 장 신 청 서')}</h2></div>
            ${makeApprovalTable(ctx, 'writer')}
          </div>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:19%"><col style="width:31%"><col style="width:19%"><col style="width:31%"></colgroup>
            <tr><th>소 속</th><td>${V(s.department, '소속')}</td><th>직 위 / 성 명</th><td class="bold">${V(s.position, '')} ${V(s.name, '성명')}</td></tr>
            <tr><th>출 장 기 간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</td></tr>
            <tr><th>출 장 지</th><td>${V(s.destination, '출장지')}</td><th>교 통 수 단</th><td>${V(s.transport, '')}</td></tr>
            <tr><th>출 장 경 비</th><td colspan="3" class="bold">₩ ${U.formatNumber(amt)}원 (${U.escapeHtml(U.formatKoreanCurrency(amt))} / ${U.escapeHtml(U.formatHanjaCurrency(amt))})</td></tr>
            <tr><th>출 장 목 적</th><td colspan="3" style="min-height:22mm;vertical-align:top;padding:3mm;line-height:1.65;">${s.purpose ? U.escapeHtmlWithBr(s.purpose) : '<span class="doc-empty">출장 목적 기재</span>'}</td></tr>
            <tr><th>세부 일정 및<br>업무 보고</th><td colspan="3" style="min-height:54mm;vertical-align:top;padding:3.5mm;line-height:1.7;">${s.resultSummary ? U.escapeHtmlWithBr(s.resultSummary) : '<span class="doc-empty">일자별 일정 및 수행 결과 기재</span>'}</td></tr>
          </table>
          <div class="doc-statement" style="margin:5mm 0;">상기와 같이 ${U.escapeHtml(s.docMode === '출장 결과 보고서' ? '출장 결과를 보고합니다.' : '출장을 신청하오니 승인하여 주시기 바랍니다.')}</div>
          <div class="doc-sign-block">
            <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
            <div class="doc-sign-row"><span>출장자 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
            <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
          </div>
        </div>
      `;
    },
  });
})(window);
