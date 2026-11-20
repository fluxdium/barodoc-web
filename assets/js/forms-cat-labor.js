/* ==========================================================================
   바로서식 (BaroDoc) — Category 2: 계약·노무 신규 11종 서식
   alba-geunro, gyeyak-geunro, ilyong-geunro, yeonbong, geubyeo,
   yongyeok, haechok, nda, boan, mou, dongeop
   ========================================================================== */
(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const F = window.BaroForms;
  const P = window.BaroPlatform;
  const V = P.valOrEmpty;
  const MIN_HOURLY = 10320;
  const MIN_MONTHLY = 2156880;

  function partySignBoxes(ctx, left, right) {
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

  function laborProfileTargets() {
    return [
      { id: 'employer', label: '내 회사 정보를 사업주에 채우기', slot: 'employer', company: { companyName: 'companyName', ceoName: 'ceoName', companyPhone: 'companyPhone', companyAddress: 'companyAddress' } },
      { id: 'employee', label: '내 개인 정보를 근로자에 채우기', slot: 'employee', personal: { name: 'employeeName', phone: 'employeePhone', address: 'employeeAddress' } },
    ];
  }

  /* 1. 단시간(알바) 근로계약서 (alba-geunro) */
  F.registerSchema('alba-geunro', {
    stampSlots: [
      { key: 'employer', label: '사업주 (인)', defaultName: '바로카페', defaultShape: 'square', sizeMm: 16 },
      { key: 'employee', label: '근로자 (인)', defaultName: '김알바', defaultShape: 'circle', sizeMm: 16 },
    ],
    getSuggestedStampName: (s, slot) => (slot === 'employer' ? (s.companyName || '바로카페').slice(0, 8) : s.employeeName || '김알바'),
    profileTargets: laborProfileTargets(),
    required: [
      { field: 'companyName', label: '사업체명' },
      { field: 'employeeName', label: '근로자 성명' },
      { field: 'hourlyWage', label: '시급', type: 'money' },
      { field: 'startDate', label: '근로 개시일' },
    ],
    validate: (s) => {
      const w = U.parseNumber(s.hourlyWage);
      const hrs = U.parseNumber(s.weeklyHours);
      const alerts = [];
      if (w < MIN_HOURLY) {
        alerts.push({ level: 'danger', text: `2026년 법정 최저시급(${U.formatNumber(MIN_HOURLY)}원) 미만입니다! 최저임금법 위반 소지가 있습니다.` });
      } else if (hrs >= 15) {
        const juhyu = Math.round((Math.min(40, hrs) / 40) * 8 * w);
        alerts.push({ level: 'ok', text: `최저시급 충족 · 주 ${hrs}시간 개근 시 예상 주휴수당 주 ${U.formatNumber(juhyu)}원 (실질 시급 약 ${U.formatNumber(Math.round(w * 1.2))}원)` });
      } else {
        alerts.push({ level: 'info', text: `주 ${hrs}시간(15시간 미만) 초단시간 근로로 법정 주휴수당·퇴직금 대상에서 제외됩니다.` });
      }
      return alerts;
    },
    presets: {
      schedule: [
        { label: '주말 알바 (토·일 14시간)', text: '토·일요일 10:00~18:00 (휴게 1시간 포함, 실근로 1일 7시간 / 주 14시간)' },
        { label: '평일 파트타임 (월~금 20시간)', text: '월~금요일 13:00~17:30 (휴게 30분 포함, 실근로 1일 4시간 / 주 20시간)' },
        { label: '야간·마감 알바 (주 18시간)', text: '수·금·토요일 17:00~23:30 (휴게 30분 포함, 실근로 1일 6시간 / 주 18시간, 22시 이후 야간가산 적용)' },
      ],
    },
    sections: [
      {
        title: '1. 사업주 및 단시간 근로자 정보',
        fields: [
          { name: 'companyName', label: '사업체명 (매장/회사명)', half: true, sample: '바로커피 강남점' },
          { name: 'ceoName', label: '사업주(대표자)', half: true, sample: '박사장' },
          { name: 'companyPhone', label: '매장 연락처', half: true, type: 'tel', sample: '02-555-8800' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyAddress', label: '근무지 주소', sample: '서울특별시 강남구 역삼로 120, 1층' },
          { name: 'employeeName', label: '근로자 성명', half: true, sample: '김하은' },
          { name: 'employeePhone', label: '근로자 연락처', type: 'tel', half: true, sample: '010-7788-9900' },
          { name: 'employeeAddress', label: '근로자 주소', sample: '서울특별시 관악구 봉천로 88, 202호' },
        ],
      },
      {
        title: '2. 계약기간 · 요일별 근무시간 · 시급',
        fields: [
          { name: 'startDate', label: '근로 개시일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '근로 종료일 (정함 없으면 공란)', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 6) },
          { name: 'jobDesc', label: '담당 업무', half: true, default: '매장 관리, 음료 제조 및 고객 응대', sample: '음료 제조, 홀 서빙 및 매장 마감 정리' },
          { name: 'weeklyHours', label: '주 소정근로시간 (시간)', type: 'number', half: true, default: '20', sample: '20' },
          { name: 'schedule', label: '요일별 근로시간 및 휴게시간', type: 'textarea', default: '월~금요일 13:00~17:30 (휴게 30분 포함, 실근로 1일 4시간)', sample: '월~금요일 13:00~17:30 (휴게 30분 포함, 실근로 1일 4시간 / 주 20시간)' },
          { name: 'hourlyWage', label: '시간급 (원, 2026 최저시급 10,320원)', type: 'money', step: 10, default: '10500', sample: '11000' },
          { name: 'payDay', label: '임금 지급일', half: true, default: '매월 10일', sample: '매월 10일' },
          { name: 'weeklyHoliday', label: '주휴일', half: true, default: '매주 일요일', sample: '매주 일요일' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const w = U.parseNumber(s.hourlyWage);
      const hrs = U.parseNumber(s.weeklyHours);
      const juhyu = hrs >= 15 ? Math.round((Math.min(40, hrs) / 40) * 8 * w) : 0;
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">단시간근로자 표준근로계약서</h2>
          <p style="margin:0 0 3.5mm;"><strong>${V(s.companyName, '○○○')}</strong>(이하 "사업주")과 <strong>${V(s.employeeName, '○○○')}</strong>(이하 "근로자")은 다음과 같이 단시간 근로계약을 체결한다.</p>
          <div class="contract-item"><strong>1. 근로계약기간 :</strong> ${U.formatKoreanDate(s.startDate)}부터 ${s.endDate ? U.formatKoreanDate(s.endDate) + '까지' : '기간의 정함이 없음'}</div>
          <div class="contract-item"><strong>2. 근 무 장 소 :</strong> ${V(s.companyAddress, '근무지 주소')}</div>
          <div class="contract-item"><strong>3. 업무의 내용 :</strong> ${V(s.jobDesc, '담당 업무')}</div>
          <div class="contract-item"><strong>4. 근로일 및 근로시간 (주 ${U.escapeHtml(s.weeklyHours || '0')}시간) :</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.schedule || '')}</div></div>
          <div class="contract-item"><strong>5. 주 휴 일 :</strong> ${V(s.weeklyHoliday, '매주 일요일')} (주 15시간 이상 소정근로일 개근 시 유급 주휴수당 지급)</div>
          <div class="contract-item"><strong>6. 임 금 :</strong>
            <div style="padding-left:4mm;">
              - 시간급 : <strong>${U.formatNumber(w)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(w))} / ${U.escapeHtml(U.formatHanjaCurrency(w))})<br>
              - 주휴수당 : ${hrs >= 15 ? `주 15시간 이상 개근 시 주 약 <strong>${U.formatNumber(juhyu)}원</strong> 별도(또는 법정 기준 지급)` : '주 15시간 미만으로 법정 주휴수당 미적용'}<br>
              - 초과근로 가산임금률 : 통상임금의 100분의 50 이상 (근로기준법 기준)<br>
              - 임금지급일 및 방법 : ${V(s.payDay, '매월 10일')} 근로자 명의 예금계좌 입금
            </div>
          </div>
          <div class="contract-item"><strong>7. 연차유급휴가 :</strong> 통상근로자의 근로시간에 비례하여 근로기준법에 따라 부여함.</div>
          <div class="contract-item"><strong>8. 사회보험 및 계약서 교부 :</strong> 관련 법령에 따라 4대보험을 적용하며, 사업주는 계약 체결 즉시 본 계약서 사본을 근로자에게 교부함(근로기준법 제17조).</div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:3mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '사업주', slot: 'employer', rows: [['사업체명', s.companyName, true], ['대표자', s.ceoName], ['연락처', s.companyPhone], ['주소', s.companyAddress]] },
              { title: '근로자', slot: 'employee', rows: [['성 명', s.employeeName, true], ['연락처', s.employeePhone], ['주 소', s.employeeAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 2. 계약직 근로계약서 (gyeyak-geunro) */
  F.registerSchema('gyeyak-geunro', {
    stampSlots: [
      { key: 'employer', label: '사업주 직인', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 17 },
      { key: 'employee', label: '근로자 (인)', defaultName: '김계약', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: laborProfileTargets(),
    required: [{ field: 'companyName', label: '사업체명' }, { field: 'employeeName', label: '근로자 성명' }, { field: 'startDate', label: '계약 시작일' }, { field: 'endDate', label: '계약 종료일' }, { field: 'monthlyWage', label: '월 급여', type: 'money' }],
    validate: (s) => {
      const a = [];
      const w = U.parseNumber(s.monthlyWage);
      if (w > 0 && w < MIN_MONTHLY) a.push({ level: 'warn', text: `주 40시간 기준 2026년 최저월급(${U.formatNumber(MIN_MONTHLY)}원) 미만입니다.` });
      if (s.startDate && s.endDate && s.endDate < s.startDate) a.push({ level: 'danger', text: '계약 종료일이 시작일보다 빠릅니다.' });
      return a;
    },
    presets: {
      specialTerms: [
        { label: '정규직 전환 검토 조항', text: '계약기간 만료 30일 전 업무 성과 평가를 거쳐 상호 합의 하에 정규직 전환 또는 계약을 갱신할 수 있다.' },
        { label: '수습기간 3개월 안내', text: '최초 3개월은 수습기간으로 하며, 1년 이상 계약 시 근로기준법 기준을 준수한다.' },
        { label: '기간만료 자동 종료', text: '본 근로계약은 위 계약기간 만료로 별도의 해지 통보 없이 자동 종료된다.' },
      ],
    },
    sections: [
      {
        title: '1. 당사자 및 계약기간 (기간제)',
        fields: [
          { name: 'companyName', label: '사업체명', half: true, sample: '주식회사 바로컴퍼니' },
          { name: 'ceoName', label: '대표자명', half: true, sample: '최대표' },
          { name: 'companyPhone', label: '회사 연락처', half: true, sample: '02-555-7890' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyAddress', label: '사업장 주소', sample: '서울특별시 강남구 테헤란로 250, 7층' },
          { name: 'employeeName', label: '근로자 성명', half: true, sample: '한지우' },
          { name: 'employeePhone', label: '근로자 연락처', half: true, sample: '010-2211-3344' },
          { name: 'employeeAddress', label: '근로자 주소', sample: '서울특별시 서초구 서초대로 88, 501호' },
          { name: 'startDate', label: '계약 시작일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '계약 종료일 (필수)', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 12) },
        ],
      },
      {
        title: '2. 근무조건 및 임금',
        fields: [
          { name: 'jobDesc', label: '담당 업무', half: true, sample: '프로젝트 운영 및 데이터 분석' },
          { name: 'workHours', label: '근무시간 / 휴게', half: true, default: '09:00 ~ 18:00 (휴게 12:00~13:00)', sample: '09:00 ~ 18:00 (휴게 12:00~13:00)' },
          { name: 'monthlyWage', label: '월 급여 (원)', type: 'money', default: '2600000', sample: '2800000' },
          { name: 'payDay', label: '급여 지급일', half: true, default: '매월 25일' },
          { name: 'allowance', label: '제수당 / 식대', half: true, default: '비과세 식대 월 200,000원 포함' },
          { name: 'specialTerms', label: '갱신 · 특약 사항', type: 'textarea', sample: '계약기간 만료 30일 전 업무 성과 평가를 거쳐 상호 합의 하에 정규직 전환 또는 계약 갱신을 협의할 수 있다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const w = U.parseNumber(s.monthlyWage);
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">기간제(계약직) 근로계약서</h2>
          <p style="margin:0 0 3.5mm;"><strong>${V(s.companyName, '○○○')}</strong>(이하 "사업주")과 <strong>${V(s.employeeName, '○○○')}</strong>(이하 "근로자")은 다음과 같이 기간의 정함이 있는 근로계약을 체결한다.</p>
          <div class="contract-item"><strong>1. 근로계약기간 :</strong> <strong>${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</strong></div>
          <div class="contract-item"><strong>2. 근 무 장 소 :</strong> ${V(s.companyAddress, '사업장 소재지')}</div>
          <div class="contract-item"><strong>3. 업무의 내용 :</strong> ${V(s.jobDesc, '담당 업무')}</div>
          <div class="contract-item"><strong>4. 소정근로시간 :</strong> ${V(s.workHours, '09:00 ~ 18:00')} (주 5일, 주휴일 매주 일요일)</div>
          <div class="contract-item"><strong>5. 임 금 :</strong> 월 <strong>${U.formatNumber(w)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(w))} / ${U.escapeHtml(U.formatHanjaCurrency(w))})<br><span style="padding-left:4mm;">- 제수당: ${V(s.allowance, '없음')} / 지급일: ${V(s.payDay, '매월 25일')} (계좌이체)</span></div>
          <div class="contract-item"><strong>6. 연차 및 4대보험 :</strong> 근로기준법에 따른 연차유급휴가 및 국민연금·건강·고용·산재보험을 적용한다.</div>
          <div class="contract-item"><strong>7. 계약 갱신 및 특약 :</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.specialTerms || '계약기간 만료 시 당사자 합의에 따라 갱신 여부를 결정한다.')}</div></div>
          <div class="contract-item"><strong>8. 계약서 교부 :</strong> 사업주는 근로계약 체결 즉시 본 계약서 사본 1부를 근로자에게 교부한다.</div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:3mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '사업주', slot: 'employer', mark: '(직인)', rows: [['사업체명', s.companyName, true], ['대표자', s.ceoName], ['연락처', s.companyPhone], ['주소', s.companyAddress]] },
              { title: '근로자', slot: 'employee', rows: [['성 명', s.employeeName, true], ['연락처', s.employeePhone], ['주 소', s.employeeAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 3. 일용직 근로계약서 (ilyong-geunro) */
  F.registerSchema('ilyong-geunro', {
    stampSlots: [
      { key: 'employer', label: '사업주 (인)', defaultName: '바로건설인', defaultShape: 'square', sizeMm: 16 },
      { key: 'employee', label: '일용근로자 (인)', defaultName: '김일용', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: laborProfileTargets(),
    required: [{ field: 'companyName', label: '사업체명' }, { field: 'employeeName', label: '근로자 성명' }, { field: 'dailyWage', label: '일당 금액', type: 'money' }],
    validate: (s) => {
      const daily = U.parseNumber(s.dailyWage);
      const min8h = MIN_HOURLY * 8;
      if (daily > 0 && daily < min8h) {
        return [{ level: 'danger', text: `1일 8시간 기준 2026년 최저일당(${U.formatNumber(min8h)}원) 미만입니다. 근무시간을 확인해 주세요.` }];
      }
      return [];
    },
    presets: {
      safetyNote: [
        { label: '건설·현장 안전수칙 준수', text: '근로자는 작업 중 안전모·안전화 등 보호구를 반드시 착용하고 현장 안전관리자의 지시를 준수한다.' },
        { label: '물류·행사 단기 지원', text: '당일 작업 종료 확인 후 임금을 정산하며, 작업 중 시설물 안전 관리에 유의한다.' },
      ],
    },
    sections: [
      {
        title: '1. 사업주 및 일용근로자 정보',
        fields: [
          { name: 'companyName', label: '사업체명', half: true, sample: '주식회사 바로건설' },
          { name: 'ceoName', label: '대표자명', half: true, sample: '강대표' },
          { name: 'companyPhone', label: '현장 연락처', half: true, sample: '02-444-5678' },
          { name: 'writtenDate', label: '작성일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyAddress', label: '근무 현장 주소', sample: '경기도 용인시 기흥구 OO물류센터 신축 현장' },
          { name: 'employeeName', label: '근로자 성명', half: true, sample: '오민철' },
          { name: 'employeePhone', label: '근로자 연락처', half: true, sample: '010-6677-8899' },
          { name: 'employeeAddress', label: '근로자 주소', sample: '경기도 수원시 영통구 매탄로 50, 301호' },
        ],
      },
      {
        title: '2. 작업 일자 · 일당 및 지급 조건',
        fields: [
          { name: 'workDate', label: '근로 일자 (기간)', half: true, default: () => U.todayISO(), sample: '2026-11-20 (1일 단위 계약)' },
          { name: 'workHours', label: '근무시간 / 휴게', half: true, default: '08:00 ~ 17:00 (휴게 1시간)', sample: '08:00 ~ 17:00 (휴게 12:00~13:00)' },
          { name: 'jobDesc', label: '담당 작업 내용', sample: '현장 자재 운반 및 정리 보조' },
          { name: 'dailyWage', label: '일당 (1일 임금, 원)', type: 'money', default: '150000', sample: '170000' },
          { name: 'payMethod', label: '임금 지급 시기 및 계좌', default: '당일 작업 종료 후 본인 계좌 입금', sample: '매주 금요일 일괄 계좌이체 (국민은행)' },
          { name: 'safetyNote', label: '안전 수칙 및 특약', type: 'textarea', sample: '근로자는 작업 중 안전모·안전화 등 보호구를 반드시 착용하고 현장 안전수칙을 철저히 준수한다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const d = U.parseNumber(s.dailyWage);
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">일 용 직 근 로 계 약 서</h2>
          <p style="margin:0 0 3.5mm;"><strong>${V(s.companyName, '○○○')}</strong>(이하 "사업주")과 <strong>${V(s.employeeName, '○○○')}</strong>(이하 "근로자")은 1일 단위 일용근로계약을 다음과 같이 체결한다.</p>
          <div class="contract-item"><strong>1. 계약 기간 :</strong> ${V(s.workDate, '')} (1일 단위 근로계약으로 당일 작업 종료 시 계약 종료)</div>
          <div class="contract-item"><strong>2. 근무 장소 :</strong> ${V(s.companyAddress, '현장 주소')}</div>
          <div class="contract-item"><strong>3. 업무 내용 :</strong> ${V(s.jobDesc, '담당 작업')}</div>
          <div class="contract-item"><strong>4. 근무 시간 :</strong> ${V(s.workHours, '08:00 ~ 17:00 (휴게 1시간)')}</div>
          <div class="contract-item"><strong>5. 임금 (일당) :</strong> 1일 <strong>${U.formatNumber(d)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(d))} / ${U.escapeHtml(U.formatHanjaCurrency(d))})<br><span style="padding-left:4mm;">- 지급 방법 : ${V(s.payMethod, '당일 계좌이체')} (일용근로소득세·고용/산재보험 법령 기준 적용)</span></div>
          <div class="contract-item"><strong>6. 안전 및 특약 :</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.safetyNote || '')}</div></div>
          <div class="contract-item"><strong>7. 계약서 교부 :</strong> 본 계약서 2부를 작성하여 서명·날인 후 사업주와 근로자가 각 1부씩 보관한다.</div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:3mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '사업주', slot: 'employer', rows: [['사업체명', s.companyName, true], ['대표자', s.ceoName], ['연락처', s.companyPhone], ['현장주소', s.companyAddress]] },
              { title: '근로자', slot: 'employee', rows: [['성 명', s.employeeName, true], ['연락처', s.employeePhone], ['주 소', s.employeeAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 4. 연봉계약서 (yeonbong) */
  F.registerSchema('yeonbong', {
    stampSlots: [
      { key: 'employer', label: '회사 직인', defaultName: '바로테크인', defaultShape: 'square', sizeMm: 17 },
      { key: 'employee', label: '근로자 (인)', defaultName: '김연봉', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: laborProfileTargets(),
    required: [{ field: 'companyName', label: '회사명' }, { field: 'employeeName', label: '근로자 성명' }, { field: 'annualSalary', label: '연봉 총액', type: 'money' }],
    validate: (s) => {
      const m = Math.round(U.parseNumber(s.annualSalary) / 12);
      return m > 0 && m < MIN_MONTHLY ? [{ level: 'warn', text: `월 환산액(${U.formatNumber(m)}원)이 2026년 최저월급(${U.formatNumber(MIN_MONTHLY)}원) 미만입니다.` }] : [];
    },
    presets: {
      clauses: [
        { label: '퇴직금 별도 · 비밀유지 표준', text: '1. 위 연봉 총액에는 법정 퇴직금이 포함되어 있지 않으며, 퇴직금은 근로자퇴직급여보장법에 따라 별도 지급한다.\n2. 근로자는 본인의 연봉 금액 및 조건을 사내·외 제3자에게 누설하지 아니한다.' },
        { label: '인센티브 별도 약정', text: '1. 기본 연봉 외 경영 성과급(인센티브)은 회사 실적 및 개인 평가에 따라 별도 지급할 수 있다.\n2. 퇴직금은 연봉과 별도로 적립·지급하며, 연봉 정보는 대외비로 유지한다.' },
      ],
    },
    sections: [
      {
        title: '1. 회사 및 대상 근로자',
        fields: [
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'ceoName', label: '대표이사', half: true, sample: '최대표' },
          { name: 'companyAddress', label: '회사 주소', sample: '서울특별시 강남구 테헤란로 210, 8층' },
          { name: 'department', label: '소속 부서', half: true, sample: '프로덕트팀' },
          { name: 'position', label: '직위 / 직급', half: true, sample: '과장' },
          { name: 'employeeName', label: '근로자 성명', half: true, sample: '윤서현' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
        ],
      },
      {
        title: '2. 연봉 적용기간 및 금액',
        fields: [
          { name: 'startDate', label: '연봉 적용 시작일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '연봉 적용 종료일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 12) },
          { name: 'annualSalary', label: '연봉 총액 (원, 세전)', type: 'money', step: 100000, default: '42000000', sample: '48000000' },
          { name: 'mealAllowance', label: '월 비과세 식대 포함액 (원)', type: 'number', half: true, default: '200000', sample: '200000' },
          { name: 'payDay', label: '급여 지급일', half: true, default: '매월 25일' },
          { name: 'clauses', label: '연봉 계약 조항 (퇴직금·비밀유지)', type: 'textarea', sample: '1. 위 연봉 총액에는 퇴직금이 포함되어 있지 않으며, 퇴직금은 관련 법령에 따라 별도 지급한다.\n2. 근로자는 본인의 연봉 계약 내용을 타 직원 및 외부에 공개하지 않는 비밀유지 의무를 진다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const ann = U.parseNumber(s.annualSalary);
      const mon = Math.round(ann / 12);
      const meal = U.parseNumber(s.mealAllowance);
      const baseMon = Math.max(0, mon - meal);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <h2 class="doc-title compact">연 봉 계 약 서</h2>
          <p style="margin:0 0 4mm;"><strong>${V(s.companyName, '주식회사 ○○○')}</strong>(이하 "회사")과 근로자 <strong>${V(s.employeeName, '○○○')}</strong>(이하 "근로자")은 다음과 같이 연봉 계약을 체결한다.</p>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr><th>소 속 / 직 위</th><td>${V(s.department, '')} / ${V(s.position, '')}</td><th>성 명</th><td class="bold">${V(s.employeeName, '')}</td></tr>
            <tr><th>연봉 적용기간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</td></tr>
            <tr><th>연 봉 총 액</th><td colspan="3" class="bold">₩ ${U.formatNumber(ann)}원 (${U.escapeHtml(U.formatKoreanCurrency(ann))} / ${U.escapeHtml(U.formatHanjaCurrency(ann))})</td></tr>
            <tr><th>월 지급액 (1/12)</th><td class="bold">₩ ${U.formatNumber(mon)}원</td><th>급여 지급일</th><td>${V(s.payDay, '매월 25일')}</td></tr>
            <tr><th>월 기본급</th><td>₩ ${U.formatNumber(baseMon)}원</td><th>비과세 식대</th><td>₩ ${U.formatNumber(meal)}원</td></tr>
          </table>
          <div class="doc-clauses" style="border:1px solid #222;padding:4mm 5mm;line-height:1.75;">
            <p class="doc-clause-title">[계약 및 준수 사항]</p>
            <div>${U.escapeHtmlWithBr(s.clauses || '')}</div>
          </div>
          <p style="text-align:center;margin:5mm 0;">회사와 근로자는 상기 연봉 조건에 충분히 설명을 듣고 동의하며, 본 계약서 2부를 작성하여 각 1부씩 보관한다.</p>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '회 사 (사용자)', slot: 'employer', mark: '(직인)', rows: [['회사명', s.companyName, true], ['대표이사', s.ceoName], ['소재지', s.companyAddress]] },
              { title: '근로자 (동의인)', slot: 'employee', rows: [['소 속', s.department], ['직 위', s.position], ['성 명', s.employeeName, true]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 5. 급여명세서 (geubyeo) */
  F.registerSchema('geubyeo', {
    stampSlots: [{ key: 'company', label: '회사 직인 (선택)', defaultName: '바로테크인', defaultShape: 'square', sizeMm: 17 }],
    profileTargets: [{
      id: 'both', label: '내 회사 + 직원 정보 채우기', slot: 'company',
      company: { companyName: 'companyName' },
      personal: { name: 'employeeName', department: 'department', position: 'position', bankAccount: 'bankAccount' },
    }],
    required: [{ field: 'companyName', label: '회사명' }, { field: 'employeeName', label: '성명' }, { field: 'basePay', label: '기본급', type: 'money' }],
    presets: {
      note: [
        { label: '근로기준법 제48조 표준 안내', text: '본 급여명세서는 근로기준법 제48조에 따라 임금의 구성항목·계산방법 및 공제내역을 기재하여 교부합니다.' },
        { label: '연장·주휴수당 산출식 포함', text: '주휴수당 및 연장근로수당(통상시급×1.5)이 법정 기준에 따라 반영되었습니다. 문의사항은 인사팀으로 연락 바랍니다.' },
      ],
    },
    sections: [
      {
        title: '1. 지급 귀속월 및 직원 정보',
        fields: [
          { name: 'payMonth', label: '귀속 연월', half: true, default: '2026년 11월분', sample: '2026년 11월분' },
          { name: 'payDate', label: '지급일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'companyName', label: '회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'department', label: '소속 부서', half: true, sample: '서비스기획팀' },
          { name: 'employeeName', label: '성명', half: true, sample: '김민수' },
          { name: 'position', label: '직위', half: true, sample: '대리' },
          { name: 'bankAccount', label: '지급 계좌 (선택)', sample: '신한은행 110-***-******' },
        ],
      },
      {
        title: '2. 지급 항목 (원)',
        fields: [
          { name: 'basePay', label: '기본급 (원)', type: 'money', default: '2800000', sample: '3000000' },
          { name: 'mealPay', label: '식대 (비과세, 원)', type: 'number', half: true, default: '200000', sample: '200000' },
          { name: 'overtimePay', label: '연장·야간·주휴수당 (원)', type: 'number', half: true, default: '0', sample: '150000' },
          { name: 'bonusPay', label: '직책·기타수당/상여 (원)', type: 'number', default: '0', sample: '100000' },
        ],
      },
      {
        title: '3. 공제 항목 (4대보험 · 세금, 원)',
        fields: [
          { name: 'pension', label: '국민연금 (4.5%)', type: 'number', half: true, default: '126000', sample: '146250' },
          { name: 'health', label: '건강보험 + 장기요양', type: 'number', half: true, default: '112000', sample: '129800' },
          { name: 'empIns', label: '고용보험 (0.9%)', type: 'number', half: true, default: '25200', sample: '29250' },
          { name: 'incomeTax', label: '소득세 + 지방소득세', type: 'number', half: true, default: '68000', sample: '98400' },
          { name: 'note', label: '산출 근거 및 비고', type: 'textarea', default: '본 급여명세서는 근로기준법 제48조에 따라 교부합니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const payTotal = U.parseNumber(s.basePay) + U.parseNumber(s.mealPay) + U.parseNumber(s.overtimePay) + U.parseNumber(s.bonusPay);
      const dedTotal = U.parseNumber(s.pension) + U.parseNumber(s.health) + U.parseNumber(s.empIns) + U.parseNumber(s.incomeTax);
      const netPay = Math.max(0, payTotal - dedTotal);
      return `
        <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm 16mm;">
          <h2 class="doc-title compact">급 여 명 세 서</h2>
          <div class="doc-title-sub">${V(s.payMonth, '2026년 11월분')} · 지급일 : ${U.formatKoreanDate(s.payDate)}</div>
          <table class="doc-table compact thick-outer">
            <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
            <tr><th>회 사 명</th><td class="bold">${V(s.companyName, '')}</td><th>소 속 / 직 위</th><td>${V(s.department, '')} / ${V(s.position, '')}</td></tr>
            <tr><th>성 명</th><td class="bold">${V(s.employeeName, '')}</td><th>지 급 계 좌</th><td>${V(s.bankAccount, '')}</td></tr>
          </table>
          <div class="biz-total-banner">
            <span class="biz-total-label">차인 지급액 (실수령액)</span>
            <span class="biz-total-korean">${U.escapeHtml(U.formatKoreanCurrency(netPay))} <small style="font-weight:500;color:#444;">(${U.escapeHtml(U.formatHanjaCurrency(netPay))})</small></span>
            <span class="biz-total-number">₩ ${U.formatNumber(netPay)}</span>
          </div>
          <table class="doc-table thick-outer">
            <colgroup><col style="width:26%"><col style="width:24%"><col style="width:26%"><col style="width:24%"></colgroup>
            <thead><tr><th colspan="2">지 급 내 역</th><th colspan="2">공 제 내 역</th></tr></thead>
            <tbody>
              <tr><th>기본급</th><td class="num">${U.formatNumber(s.basePay)}</td><th>국민연금</th><td class="num">${U.formatNumber(s.pension)}</td></tr>
              <tr><th>식대 (비과세)</th><td class="num">${U.formatNumber(s.mealPay)}</td><th>건강·장기요양보험</th><td class="num">${U.formatNumber(s.health)}</td></tr>
              <tr><th>연장·주휴수당</th><td class="num">${U.formatNumber(s.overtimePay)}</td><th>고용보험</th><td class="num">${U.formatNumber(s.empIns)}</td></tr>
              <tr><th>직책·기타수당</th><td class="num">${U.formatNumber(s.bonusPay)}</td><th>소득세·지방소득세</th><td class="num">${U.formatNumber(s.incomeTax)}</td></tr>
            </tbody>
            <tfoot>
              <tr><th>지급 합계</th><td class="num bold">${U.formatNumber(payTotal)}</td><th>공제 합계</th><td class="num bold">${U.formatNumber(dedTotal)}</td></tr>
              <tr><th colspan="2">실수령액 (지급 − 공제)</th><td colspan="2" class="num bold" style="font-size:11.5pt;">₩ ${U.formatNumber(netPay)} 원</td></tr>
            </tfoot>
          </table>
          <div class="doc-notes-box"><strong>[산출 근거 및 안내사항]</strong><div class="doc-notes-body">${U.escapeHtml(s.note || '')}</div></div>
          <div class="doc-sign-block" style="text-align:center;">
            <div class="doc-date">${U.formatKoreanDate(s.payDate)}</div>
            <div style="font-size:12pt;font-weight:800;display:inline-flex;align-items:center;gap:4mm;">
              <span>${V(s.companyName, '주식회사 ○○○')}</span>
              ${ctx.renderStamp('company', '(직인)')}
            </div>
          </div>
        </div>
      `;
    },
  });

  /* 6. 프리랜서 용역계약서 (yongyeok) */
  F.registerSchema('yongyeok', {
    stampSlots: [
      { key: 'client', label: '발주자(갑) (인)', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 16 },
      { key: 'freelancer', label: '수급인(을) (인)', defaultName: '김프리', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: [
      { id: 'client', label: '내 회사 정보를 갑(발주자)에 채우기', slot: 'client', company: { companyName: 'clientName', ceoName: 'clientCeo', bizNo: 'clientBizNo', companyAddress: 'clientAddress' } },
      { id: 'freelancer', label: '내 개인 정보를 을(프리랜서)에 채우기', slot: 'freelancer', personal: { name: 'freeName', birthOrId: 'freeId', phone: 'freePhone', address: 'freeAddress', bankAccount: 'bankAccount' } },
    ],
    required: [{ field: 'projectName', label: '용역 건명' }, { field: 'feeAmount', label: '용역 대금', type: 'money' }, { field: 'clientName', label: '발주자(갑)' }, { field: 'freeName', label: '수급인(을)' }],
    presets: {
      clauses: [
        { label: '3.3% 원천징수 · 저작권 잔금 귀속', text: '1. 갑은 대금 지급 시 소득세법상 사업소득 원천징수세액(3.3%)을 공제한 금액을 을의 지정 계좌로 지급한다.\n2. 본 용역의 결과물에 대한 저작권은 대금 완납 시점에 갑에게 귀속되며, 을은 포트폴리오 용도로 활용할 수 있다.\n3. 시안 확정 후 기본 수정은 2회 무료 제공하며, 범위 외 추가 작업은 별도 협의한다.' },
        { label: '선금 50% · 잔금 50% 분할', text: '1. 대금은 계약 체결 시 선금 50%, 최종 산출물 납품 및 검수 완료 후 7일 이내 잔금 50%로 분할 지급한다.\n2. 갑과 을은 업무상 취득한 비밀정보를 제3자에게 누설하지 않는다.' },
      ],
    },
    sections: [
      {
        title: '1. 프로젝트 및 대금 조건',
        fields: [
          { name: 'projectName', label: '용역 건명 (프로젝트명)', sample: '브랜드 웹사이트 UI/UX 디자인 및 퍼블리싱 용역' },
          { name: 'startDate', label: '용역 시작일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'endDate', label: '납품 마감일', type: 'date', half: true, default: () => U.addMonthsISO(U.todayISO(), 1) },
          { name: 'feeAmount', label: '총 용역 대금 (원, 세전)', type: 'money', default: '3000000', sample: '3500000' },
          { name: 'taxType', label: '세무 처리 방식', type: 'select', half: true, default: '사업소득 3.3% 원천징수', options: ['사업소득 3.3% 원천징수', '세금계산서 발행 (부가세 10% 별도)', '기타소득 원천징수'] },
          { name: 'paySchedule', label: '지급 일정', half: true, default: '계약금 50% / 검수 후 잔금 50%' },
          { name: 'bankAccount', label: '을 입금 계좌', sample: '카카오뱅크 3333-01-1234567 (예금주: 김프리)' },
          { name: 'scope', label: '용역 범위 및 산출물', type: 'textarea', sample: '반응형 메인·서브 8페이지 디자인 시안(Figma) 및 HTML/CSS 퍼블리싱 산출물 일체' },
          { name: 'clauses', label: '저작권 · 수정범위 · 비밀유지 조항', type: 'textarea', sample: '1. 대금 지급 시 3.3% 원천징수 후 지급하며, 최종 저작권은 잔금 완납 시 갑에게 귀속된다.\n2. 기본 수정은 2회 포함하며 추가 요구사항은 별도 견적 협의한다.' },
        ],
      },
      {
        title: '2. 갑(발주자) 및 을(프리랜서)',
        fields: [
          { name: 'clientName', label: '갑 상호/성명', half: true, sample: '주식회사 바로컴퍼니' },
          { name: 'clientCeo', label: '갑 대표자', half: true, sample: '최대표' },
          { name: 'clientBizNo', label: '갑 사업자번호', half: true, sample: '214-88-12345' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'clientAddress', label: '갑 주소', sample: '서울특별시 강남구 테헤란로 250' },
          { name: 'freeName', label: '을 성명(프리랜서)', half: true, sample: '김프리' },
          { name: 'freeId', label: '을 생년월일/사업자번호', half: true, sample: '910815-1******' },
          { name: 'freePhone', label: '을 연락처', half: true, sample: '010-9988-7766' },
          { name: 'freeAddress', label: '을 주소', half: true, sample: '서울특별시 마포구 양화로 80' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const fee = U.parseNumber(s.feeAmount);
      const afterTax = s.taxType.includes('3.3%') ? Math.round(fee * 0.967) : fee;
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">프리랜서 용역계약서</h2>
          <p style="margin:0 0 3mm;"><strong>${V(s.clientName, '○○○')}</strong>(이하 "갑")과 <strong>${V(s.freeName, '○○○')}</strong>(이하 "을")은 독립된 계약 당사자로서 다음과 같이 업무 위탁(용역) 계약을 체결한다.</p>
          <div class="contract-item"><strong>제1조 (용역 건명)</strong> ${V(s.projectName, '프로젝트명')}</div>
          <div class="contract-item"><strong>제2조 (용역 기간)</strong> ${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)}</div>
          <div class="contract-item"><strong>제3조 (용역 범위 및 산출물)</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.scope || '')}</div></div>
          <div class="contract-item"><strong>제4조 (용역 대금 및 지급)</strong>
            <div style="padding-left:4mm;">
              - 총 용역 대금 : <strong>₩ ${U.formatNumber(fee)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(fee))} / ${U.escapeHtml(U.formatHanjaCurrency(fee))})<br>
              - 세무 구분 : ${V(s.taxType, '')}${s.taxType.includes('3.3%') ? ` (3.3% 공제 후 예상 실지급액 ₩ ${U.formatNumber(afterTax)}원)` : ''}<br>
              - 지급 조건 / 계좌 : ${V(s.paySchedule, '')} / ${V(s.bankAccount, '')}
            </div>
          </div>
          <div class="contract-item"><strong>제5조 (독립 계약자 지위)</strong> 을은 갑의 근로자가 아닌 독립 사업자(프리랜서)로서 자기 책임 하에 용역을 수행한다.</div>
          <div class="contract-item"><strong>제6조 (저작권 · 비밀유지 및 특약)</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.clauses || '')}</div></div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '갑 (발주자)', slot: 'client', mark: '(인)', rows: [['상 호', s.clientName, true], ['대표자', s.clientCeo], ['사업자번호', s.clientBizNo], ['주 소', s.clientAddress]] },
              { title: '을 (수급인/프리랜서)', slot: 'freelancer', rows: [['성 명', s.freeName, true], ['생년/번호', s.freeId], ['연락처', s.freePhone], ['주 소', s.freeAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });

  /* 7. 해촉증명서 (haechok) */
  F.registerSchema('haechok', {
    stampSlots: [{ key: 'company', label: '발급 회사 직인', defaultName: '바로컴퍼니인', defaultShape: 'square', sizeMm: 19 }],
    profileTargets: [{
      id: 'both', label: '내 개인 + 발급 회사 정보 채우기', slot: 'company',
      personal: { name: 'name', birthOrId: 'residentId', address: 'address' },
      company: { companyName: 'companyName', bizNo: 'bizNo', ceoName: 'ceoName', companyPhone: 'companyPhone', companyAddress: 'companyAddress' },
    }],
    required: [{ field: 'name', label: '성명' }, { field: 'companyName', label: '발급 회사명' }, { field: 'endDate', label: '해촉일' }],
    presets: {
      purpose: [
        { label: '국민건강보험공단 제출용', text: '국민건강보험공단 지역가입자 건강보험료 소득 정산·조정 신청용' },
        { label: '국민연금공단 제출용', text: '국민연금공단 납부예외 및 기준소득월액 조정 신청용' },
        { label: '금융·관공서 제출용', text: '프리랜서 위촉 계약 종료 증빙 (금융기관/관공서 제출용)' },
      ],
    },
    sections: [
      {
        title: '1. 해촉 대상자 (프리랜서) 정보',
        fields: [
          { name: 'docNo', label: '문서번호', half: true, default: 'HC-2026-001' },
          { name: 'issueDate', label: '발급일자', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'name', label: '성명', half: true, sample: '김프리' },
          { name: 'residentId', label: '생년월일 / 주민번호', half: true, sample: '910815-1******' },
          { name: 'address', label: '현주소', sample: '서울특별시 마포구 양화로 80, 402호' },
          { name: 'role', label: '위촉 직무 / 업무 내용', sample: '외주 디자인 및 콘텐츠 제작 프리랜서(3.3% 사업소득)' },
          { name: 'startDate', label: '위촉 시작일', type: 'date', half: true, sample: '2025-01-01' },
          { name: 'endDate', label: '해촉(계약종료)일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'purpose', label: '발급 용도', type: 'textarea', default: '국민건강보험공단 건강보험료 조정 제출용' },
        ],
      },
      {
        title: '2. 발급 회사(위촉 기관) 정보',
        fields: [
          { name: 'companyName', label: '회사명(상호)', half: true, sample: '주식회사 바로컴퍼니' },
          { name: 'bizNo', label: '사업자등록번호', half: true, sample: '214-88-12345' },
          { name: 'ceoName', label: '대표자명', half: true, sample: '최대표' },
          { name: 'companyPhone', label: '대표 전화', half: true, sample: '02-555-7890' },
          { name: 'companyAddress', label: '사업장 소재지', sample: '서울특별시 강남구 테헤란로 250, 7층' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:15mm;">
        <div class="cert-frame">
          <div style="font-size:9.2pt;color:#444;margin-bottom:4mm;">문서번호 : ${U.escapeHtml(s.docNo || '')}</div>
          <h2 class="doc-title" style="margin-bottom:7mm;">해 촉 증 명 서</h2>
          <table class="doc-table thick-outer">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr><th>성 명</th><td class="bold">${V(s.name, '성명')}</td><th>생년월일/주민번호</th><td>${V(s.residentId, '')}</td></tr>
            <tr><th>현 주 소</th><td colspan="3">${V(s.address, '')}</td></tr>
            <tr><th>위촉 업무</th><td colspan="3">${V(s.role, '프리랜서 위촉 업무')}</td></tr>
            <tr><th>위촉(활동) 기간</th><td colspan="3" class="bold">${U.formatKoreanDate(s.startDate)} ~ ${U.formatKoreanDate(s.endDate)} (해촉 완료)</td></tr>
            <tr><th>발급 용도</th><td colspan="3">${V(s.purpose, '')}</td></tr>
          </table>
          <table class="doc-table">
            <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
            <tr><th>상 호 (기관명)</th><td class="bold">${V(s.companyName, '')}</td><th>사업자등록번호</th><td>${V(s.bizNo, '')}</td></tr>
            <tr><th>대 표 자</th><td>${V(s.ceoName, '')}</td><th>연 락 처</th><td>${V(s.companyPhone, '')}</td></tr>
            <tr><th>소 재 지</th><td colspan="3">${V(s.companyAddress, '')}</td></tr>
          </table>
          <div class="doc-statement" style="margin:8mm 0;">위 사람은 당사와의 위촉(프리랜서) 계약이 상기 해촉일자로 종료(해촉)되어<br>현재 당사로부터 발생하는 소득이 없음을 증명합니다.</div>
          <div class="doc-sign-block" style="text-align:center;">
            <div class="doc-date">${U.formatKoreanDate(s.issueDate)}</div>
            <div style="font-size:13pt;font-weight:800;margin-top:5mm;display:inline-flex;align-items:center;gap:4mm;">
              <span>${V(s.companyName, '주식회사 ○○○')}</span>
              <span>대표이사 ${V(s.ceoName, '○○○')}</span>
              ${ctx.renderStamp('company', '(직인)')}
            </div>
          </div>
        </div>
      </div>
    `,
  });

  /* 8. 비밀유지서약서 (NDA) */
  F.registerSchema('nda', {
    stampSlots: [
      { key: 'partyA', label: '정보제공자(갑) (인)', defaultName: '바로테크인', defaultShape: 'square', sizeMm: 16 },
      { key: 'partyB', label: '정보수령자(을) (인)', defaultName: '김서약', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: [
      { id: 'partyA', label: '내 회사 정보를 갑(제공자)에 채우기', slot: 'partyA', company: { companyName: 'partyAName', ceoName: 'partyACeo', companyAddress: 'partyAAddress' } },
      { id: 'partyB', label: '내 개인 정보를 을(수령자)에 채우기', slot: 'partyB', personal: { name: 'partyBName', phone: 'partyBPhone', address: 'partyBAddress' } },
    ],
    required: [{ field: 'partyAName', label: '갑(제공자)' }, { field: 'partyBName', label: '을(수령자)' }, { field: 'writtenDate', label: '서약일' }],
    presets: {
      secretScope: [
        { label: 'IT 개발 · 소스코드 · 기획안', text: '갑이 을에게 제공하는 서비스 기획서, 소스코드, 데이터베이스 구조, API 명세, 고객 개인정보 및 사업 전략 일체' },
        { label: '투자 · M&A · 제휴 검토', text: '투자 및 업무 제휴 검토 과정에서 제공되는 재무제표, 매출 데이터, 거래처 목록, 영업 노하우 및 미공개 경영 정보 일체' },
        { label: '제조 · 디자인 · 도면', text: '제품 설계 도면, 금형·레시피 정보, 원가 내역, 시제품 및 협력사 단가 정보 일체' },
      ],
    },
    sections: [
      {
        title: '1. 비밀유지 대상 및 유지 기간',
        fields: [
          { name: 'purpose', label: '정보 제공 목적', sample: '신규 웹 플랫폼 공동 개발 및 외주 용역 수행' },
          { name: 'duration', label: '비밀유지 존속 기간', half: true, default: '계약 종료 후 3년간', sample: '계약 종료 후 3년간' },
          { name: 'writtenDate', label: '작성(서약)일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'secretScope', label: '비밀정보의 범위', type: 'textarea', sample: '갑이 을에게 구두·서면·전자파일 형태로 제공하는 서비스 기획서, 소스코드, 고객 DB, 재무 및 영업 전략 일체' },
          { name: 'penalty', label: '위반 시 손해배상 / 위약벌', default: '비밀유지 의무 위반으로 갑에게 발생한 일체의 직·간접 손해를 배상한다.' },
        ],
      },
      {
        title: '2. 갑(정보제공자) 및 을(서약자/수령자)',
        fields: [
          { name: 'partyAName', label: '갑 회사명/성명', half: true, sample: '주식회사 바로테크' },
          { name: 'partyACeo', label: '갑 대표자', half: true, sample: '최대표' },
          { name: 'partyAAddress', label: '갑 주소', sample: '서울특별시 강남구 테헤란로 210' },
          { name: 'partyBName', label: '을 성명/상호', half: true, sample: '박개발' },
          { name: 'partyBPhone', label: '을 연락처', half: true, sample: '010-3344-5566' },
          { name: 'partyBAddress', label: '을 주소', sample: '서울특별시 동작구 사당로 120' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet contract-sheet ${ctx.fontClass}">
        <h2 class="doc-title">비 밀 유 지 서 약 서 (NDA)</h2>
        <p style="margin:0 0 3.5mm;"><strong>${V(s.partyBName, '○○○')}</strong>(이하 "을")은 <strong>${V(s.partyAName, '○○○')}</strong>(이하 "갑")과 「${V(s.purpose, '업무 수행')}」을 진행함에 있어 취득하는 비밀정보를 보호하기 위하여 다음과 같이 서약한다.</p>
        <div class="contract-item"><strong>제1조 (비밀정보의 범위)</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.secretScope || '')}</div></div>
        <div class="contract-item"><strong>제2조 (목적 외 사용 및 누설 금지)</strong> 을은 비밀정보를 본 업무 수행 목적 외에 사용하거나 갑의 사전 서면 동의 없이 제3자에게 공개·복제·배포하지 아니한다.</div>
        <div class="contract-item"><strong>제3조 (비밀정보의 반환 및 파기)</strong> 본 업무가 종료되거나 갑의 반환 요청이 있을 경우 을은 보유 중인 모든 문서·파일·복사본을 즉시 반환 또는 복구 불가능한 방식으로 파기한다.</div>
        <div class="contract-item"><strong>제4조 (비밀유지 기간)</strong> 본 서약의 효력은 서명일로부터 <strong>${V(s.duration, '계약 종료 후 3년간')}</strong> 존속한다.</div>
        <div class="contract-item"><strong>제5조 (위반 시 책임)</strong> ${V(s.penalty, '')}</div>
        <div class="contract-item"><strong>제6조 (관할 법원)</strong> 본 서약과 관련한 분쟁은 갑의 본점 소재지 관할 법원으로 한다.</div>
        <div class="doc-sign-block">
          <div class="doc-date" style="margin:3mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
          ${partySignBoxes(ctx,
            { title: '갑 (정보제공자)', slot: 'partyA', mark: '(인)', rows: [['상호/성명', s.partyAName, true], ['대표자', s.partyACeo], ['주 소', s.partyAAddress]] },
            { title: '을 (서약자 / 수령자)', slot: 'partyB', rows: [['성명/상호', s.partyBName, true], ['연락처', s.partyBPhone], ['주 소', s.partyBAddress]] }
          )}
        </div>
      </div>
    `,
  });

  /* 9. 보안서약서 (boan) */
  F.registerSchema('boan', {
    stampSlots: [{ key: 'writer', label: '서약자 (인)', defaultName: '김보안', defaultShape: 'circle', sizeMm: 17 }],
    profileTargets: [{
      id: 'default', label: '내 개인 + 회사 정보 채우기', slot: 'writer',
      personal: { name: 'name', birthOrId: 'birth', department: 'department', position: 'position', phone: 'phone', address: 'address' },
      company: { companyName: 'companyName' },
    }],
    required: [{ field: 'name', label: '서약자 성명' }, { field: 'companyName', label: '제출처 회사명' }],
    presets: {
      pledgeType: [
        { label: '입사자 표준 보안서약', text: '1. 재직 중 업무상 지득한 영업비밀·고객 개인정보·기술자료를 외부에 누설하거나 무단 반출하지 않겠습니다.\n2. 사내 PC·계정·보안매체 관리 수칙을 준수하며, 무단 소프트웨어 설치 및 외부 저장장치 반출을 금지합니다.\n3. 위반 시 부정경쟁방지법·개인정보보호법 등 관련 법령에 따른 민·형사상 책임을 감수하겠습니다.' },
        { label: '퇴사자 보안서약', text: '1. 재직 중 취득한 회사의 모든 기밀·고객정보·소스코드를 개인 기기나 클라우드에 보관하지 않고 전량 반납·파기하였음을 확인합니다.\n2. 퇴사 후에도 재직 시 지득한 영업비밀을 제3자 또는 경쟁사에 누설·이용하지 않겠습니다.' },
        { label: '외주·방문자 보안서약', text: '1. 프로젝트 수행 및 출입 기간 동안 인지한 발주처의 내부 시스템·데이터·문서를 무단 복제 및 외부 유출하지 않겠습니다.\n2. 업무 종료 즉시 발급받은 임시 계정과 자료 일체를 반납하겠습니다.' },
      ],
    },
    sections: [
      {
        title: '1. 서약자 인적사항',
        fields: [
          { name: 'companyName', label: '제출처 (회사명)', half: true, sample: '주식회사 바로테크' },
          { name: 'writtenDate', label: '서약일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'department', label: '소속 부서', half: true, sample: '개발팀' },
          { name: 'position', label: '직위', half: true, sample: '사원' },
          { name: 'name', label: '성명', half: true, sample: '이준호' },
          { name: 'birth', label: '생년월일', half: true, sample: '1994.09.10' },
          { name: 'phone', label: '연락처', half: true, sample: '010-5566-7788' },
          { name: 'address', label: '현주소', half: true, sample: '서울특별시 강서구 마곡로 55' },
          { name: 'pledgeType', label: '보안 서약 내용', type: 'textarea', minHeight: 110, default: '1. 재직 중 업무상 지득한 영업비밀·고객 개인정보·기술자료를 외부에 누설하거나 무단 반출하지 않겠습니다.\n2. 사내 PC·계정·보안매체 관리 수칙을 철저히 준수하겠습니다.\n3. 본 서약 위반 시 부정경쟁방지법 및 개인정보보호법 등 관련 법령에 따른 민·형사상 책임을 감수하겠습니다.' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:17mm 18mm;">
        <h2 class="doc-title">보 안 서 약 서</h2>
        <table class="doc-table thick-outer">
          <colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup>
          <tr><th>소 속</th><td>${V(s.department, '')}</td><th>직 위</th><td>${V(s.position, '')}</td></tr>
          <tr><th>성 명</th><td class="bold">${V(s.name, '')}</td><th>생년월일</th><td>${V(s.birth, '')}</td></tr>
          <tr><th>연 락 처</th><td>${V(s.phone, '')}</td><th>현 주 소</th><td>${V(s.address, '')}</td></tr>
        </table>
        <div class="doc-clauses" style="border:1.5px solid #222;padding:6mm;margin-top:5mm;line-height:1.85;">
          <p class="doc-clause-title" style="margin-bottom:3mm;">상기 본인은 ${V(s.companyName, '귀사')}의 정보자산 및 영업비밀 보호를 위하여 다음 사항을 엄숙히 서약합니다.</p>
          <div>${U.escapeHtmlWithBr(s.pledgeType || '')}</div>
        </div>
        <div class="doc-statement">위 서약 사항을 숙지하고 성실히 이행할 것을 확인하며 본 보안서약서를 제출합니다.</div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          <div class="doc-sign-row"><span>서약자 :</span><span class="doc-sign-name">${V(s.name, '홍 길 동')}</span>${ctx.renderStamp('writer', '(인)')}</div>
          <div class="doc-recipient">${V(s.companyName, '주식회사 ○○○')} 대표이사 귀하</div>
        </div>
      </div>
    `,
  });

  /* 10. 업무협약서 (MOU) */
  F.registerSchema('mou', {
    stampSlots: [
      { key: 'partyA', label: '협약기관(갑) 직인', defaultName: '바로테크인', defaultShape: 'square', sizeMm: 18 },
      { key: 'partyB', label: '협약기관(을) 직인', defaultName: '한빛파트너스', defaultShape: 'square', sizeMm: 18 },
    ],
    profileTargets: [
      { id: 'partyA', label: '내 회사 정보를 갑에 채우기', slot: 'partyA', company: { companyName: 'partyAName', ceoName: 'partyACeo', companyAddress: 'partyAAddress' } },
      { id: 'partyB', label: '내 회사 정보를 을에 채우기', slot: 'partyB', company: { companyName: 'partyBName', ceoName: 'partyBCeo', companyAddress: 'partyBAddress' } },
    ],
    required: [{ field: 'title', label: '협약명' }, { field: 'partyAName', label: '갑 기관/회사명' }, { field: 'partyBName', label: '을 기관/회사명' }],
    presets: {
      cooperation: [
        { label: '공동 마케팅 · 사업 제휴', text: '1. 양 사의 플랫폼 및 고객 채널을 활용한 공동 마케팅·프로모션 추진\n2. 신규 제휴 상품 기획 및 상호 고객 혜택 제공\n3. 기타 상호 발전과 우호 증진을 위해 필요하다고 인정되는 협력 사업' },
        { label: '기술 개발 · R&D 협력', text: '1. 공동 기술 연구개발 및 보유 기술·인프라 상호 교류\n2. 정부 지원 과제 공동 참여 및 사업화 모델 구축' },
        { label: '교육 · 산학협력 MOU', text: '1. 실무 인재 양성을 위한 현장 실습 및 취업 연계 지원\n2. 공동 교육 커리큘럼 개발 및 세미나 개최 협력' },
      ],
    },
    sections: [
      {
        title: '1. 업무협약(MOU) 개요',
        fields: [
          { name: 'title', label: '협약 건명', sample: '상호 공동 마케팅 및 전략적 사업 제휴 업무협약' },
          { name: 'duration', label: '협약 유효기간', half: true, default: '체결일로부터 1년간 (자동 연장 가능)' },
          { name: 'writtenDate', label: '협약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'cooperation', label: '상호 협력 분야 (제2조)', type: 'textarea', minHeight: 95, sample: '1. 양 사 서비스 연동을 통한 공동 프로모션 및 마케팅 추진\n2. 신규 비즈니스 모델 발굴 및 시장 확대를 위한 정보 교류\n3. 기타 양 사가 합의하는 공동 협력 사업' },
          { name: 'bindingNote', label: '법적 구속력 및 비밀유지', default: '본 협약은 상호 신뢰를 바탕으로 한 협력 의사의 확인이며, 구체적인 비용·권리의무는 별도의 본 계약으로 정한다. 단, 비밀유지 조항은 법적 구속력을 가진다.' },
        ],
      },
      {
        title: '2. 협약 당사자 (갑 · 을)',
        fields: [
          { name: 'partyAName', label: '갑 기관/회사명', half: true, sample: '주식회사 바로테크' },
          { name: 'partyACeo', label: '갑 대표자', half: true, sample: '최대표' },
          { name: 'partyAAddress', label: '갑 소재지', sample: '서울특별시 강남구 테헤란로 210' },
          { name: 'partyBName', label: '을 기관/회사명', half: true, sample: '주식회사 한빛파트너스' },
          { name: 'partyBCeo', label: '을 대표자', half: true, sample: '이대표' },
          { name: 'partyBAddress', label: '을 소재지', sample: '서울특별시 서초구 강남대로 350' },
        ],
      },
    ],
    renderA4: (s, ctx) => `
      <div class="a4-sheet ${ctx.fontClass}" style="padding:16mm 17mm;">
        <h2 class="doc-title compact">업 무 협 약 서 (MOU)</h2>
        <div class="doc-title-sub">${V(s.title, '전략적 업무 제휴 협약')}</div>
        <p style="margin:0 0 4mm;"><strong>${V(s.partyAName, '○○○')}</strong>(이하 "갑")과 <strong>${V(s.partyBName, '○○○')}</strong>(이하 "을")은 상호 신뢰와 호혜의 원칙을 바탕으로 「${V(s.title, '')}」을 추진하기 위하여 다음과 같이 업무협약을 체결한다.</p>
        <div class="doc-clauses" style="line-height:1.75;">
          <p><strong>제1조 (목적)</strong> 본 협약은 갑과 을이 보유한 역량과 자원을 활용하여 상호 공동의 이익을 증진하고 긴밀한 협력 체계를 구축함을 목적으로 한다.</p>
          <p><strong>제2조 (협력 분야)</strong><br>${U.escapeHtmlWithBr(s.cooperation || '')}</p>
          <p><strong>제3조 (유효 기간)</strong> 본 협약은 서명일로부터 <strong>${V(s.duration, '1년간')}</strong> 효력을 가지며, 만료 30일 전 별도의 해지 통보가 없는 한 1년씩 자동 연장된다.</p>
          <p><strong>제4조 (효력 및 비밀유지)</strong> ${V(s.bindingNote, '')}</p>
          <p><strong>제5조 (협약서 보관)</strong> 본 협약의 성립을 증명하기 위하여 협약서 2부를 작성하고 갑과 을이 서명·날인하여 각 1부씩 보관한다.</p>
        </div>
        <div class="doc-sign-block">
          <div class="doc-date">${U.formatKoreanDate(s.writtenDate)}</div>
          ${partySignBoxes(ctx,
            { title: '갑', slot: 'partyA', mark: '(직인)', rows: [['기관/상호', s.partyAName, true], ['대표자', s.partyACeo], ['소재지', s.partyAAddress]] },
            { title: '을', slot: 'partyB', mark: '(직인)', rows: [['기관/상호', s.partyBName, true], ['대표자', s.partyBCeo], ['소재지', s.partyBAddress]] }
          )}
        </div>
      </div>
    `,
  });

  /* 11. 동업계약서 (dongeop) */
  F.registerSchema('dongeop', {
    stampSlots: [
      { key: 'partyA', label: '동업자(갑) (인)', defaultName: '김동업', defaultShape: 'circle', sizeMm: 16 },
      { key: 'partyB', label: '동업자(을) (인)', defaultName: '이파트너', defaultShape: 'circle', sizeMm: 16 },
    ],
    profileTargets: [
      { id: 'partyA', label: '내 개인 정보를 동업자(갑)에 채우기', slot: 'partyA', personal: { name: 'partyAName', birthOrId: 'partyAId', phone: 'partyAPhone', address: 'partyAAddress' } },
      { id: 'partyB', label: '내 개인 정보를 동업자(을)에 채우기', slot: 'partyB', personal: { name: 'partyBName', birthOrId: 'partyBId', phone: 'partyBPhone', address: 'partyBAddress' } },
    ],
    required: [{ field: 'bizName', label: '공동사업 상호' }, { field: 'partyAName', label: '갑 성명' }, { field: 'partyBName', label: '을 성명' }],
    validate: (s) => {
      const rA = U.parseNumber(s.ratioA);
      const rB = U.parseNumber(s.ratioB);
      if (rA + rB !== 100) {
        return [{ level: 'warn', text: `지분율 합계가 ${rA + rB}%입니다. 갑과 을의 합계가 100%가 되도록 맞춰주세요.` }];
      }
      return [];
    },
    presets: {
      clauses: [
        { label: '월말 정산 · 탈퇴·정산 기준', text: '1. 매월 말일 기준으로 매출에서 임대료·인건비·제세공과금을 차감한 순이익을 지분 비율대로 익월 10일 정산한다.\n2. 일방이 동업 탈퇴를 원할 경우 최소 60일 전 서면 통지하며, 탈퇴 시점의 순자산 평가액 기준으로 지분을 정산한다.\n3. 자금 집행(100만원 초과) 및 대출·보증은 반드시 양 당사자의 서면 합의를 거쳐야 한다.' },
        { label: '경업금지 및 비밀유지 강화', text: '1. 동업자는 동업 기간 및 탈퇴 후 1년간 동일 상권 내 동종 업종 영업을 금지한다.\n2. 공동사업의 장부 및 계좌 내역은 투명하게 상호 실시간 열람할 수 있어야 한다.' },
      ],
    },
    sections: [
      {
        title: '1. 공동사업 및 출자·지분 조건',
        fields: [
          { name: 'bizName', label: '공동사업 상호 / 업종', sample: '바로서식 스튜디오 (음식점/카페 공동운영)' },
          { name: 'bizAddress', label: '사업장 소재지', sample: '서울특별시 성동구 성수이로 77, 1층' },
          { name: 'capitalA', label: '갑 출자금 (원)', type: 'money', default: '30000000', sample: '30000000' },
          { name: 'capitalB', label: '을 출자금 (원)', type: 'money', default: '30000000', sample: '30000000' },
          { name: 'ratioA', label: '갑 지분율 (%)', type: 'number', half: true, default: '50' },
          { name: 'ratioB', label: '을 지분율 (%)', type: 'number', half: true, default: '50' },
          { name: 'roles', label: '역할 분담 (경영·자금·운영)', sample: '갑: 매장 운영 및 마케팅 총괄 / 을: 회계·발주·인사 관리 총괄' },
          { name: 'clauses', label: '손익 분배 · 탈퇴 · 정산 조항', type: 'textarea', sample: '1. 매월 말일 순이익을 지분 비율대로 익월 10일 정산하며, 손실 또한 동일 비율로 부담한다.\n2. 동업 탈퇴 시 60일 전 서면 통지하고 순자산 평가액으로 정산한다.\n3. 100만 원 초과 지출 및 차입은 상호 사전 서면 합의한다.' },
        ],
      },
      {
        title: '2. 동업 당사자 (갑 · 을)',
        fields: [
          { name: 'partyAName', label: '갑 성명', half: true, sample: '김동업' },
          { name: 'partyAId', label: '갑 생년월일', half: true, sample: '880412-1******' },
          { name: 'partyAPhone', label: '갑 연락처', half: true, sample: '010-1212-3434' },
          { name: 'writtenDate', label: '계약 체결일', type: 'date', half: true, default: () => U.todayISO() },
          { name: 'partyAAddress', label: '갑 주소', sample: '서울특별시 광진구 능동로 50' },
          { name: 'partyBName', label: '을 성명', half: true, sample: '이파트너' },
          { name: 'partyBId', label: '을 생년월일', half: true, sample: '900720-2******' },
          { name: 'partyBPhone', label: '을 연락처', half: true, sample: '010-5656-7878' },
          { name: 'partyBAddress', label: '을 주소', sample: '서울특별시 성동구 왕십리로 120' },
        ],
      },
    ],
    renderA4: (s, ctx) => {
      const cA = U.parseNumber(s.capitalA);
      const cB = U.parseNumber(s.capitalB);
      const totalCap = cA + cB;
      return `
        <div class="a4-sheet contract-sheet ${ctx.fontClass}">
          <h2 class="doc-title">동 업 계 약 서</h2>
          <p style="margin:0 0 3mm;"><strong>${V(s.partyAName, '○○○')}</strong>(이하 "갑")과 <strong>${V(s.partyBName, '○○○')}</strong>(이하 "을")은 공동사업을 영위하기 위하여 다음과 같이 동업계약을 체결한다.</p>
          <div class="contract-item"><strong>제1조 (공동사업의 상호 및 소재지)</strong> ${V(s.bizName, '')} / ${V(s.bizAddress, '')}</div>
          <div class="contract-item"><strong>제2조 (출자금 및 지분 비율)</strong>
            <div style="padding-left:4mm;">
              - 총 출자금 합계 : <strong>₩ ${U.formatNumber(totalCap)}원</strong> (${U.escapeHtml(U.formatKoreanCurrency(totalCap))} / ${U.escapeHtml(U.formatHanjaCurrency(totalCap))})<br>
              - 갑 출자금 : ₩ ${U.formatNumber(cA)}원 (지분 <strong>${U.escapeHtml(s.ratioA || '50')}%</strong>) / 을 출자금 : ₩ ${U.formatNumber(cB)}원 (지분 <strong>${U.escapeHtml(s.ratioB || '50')}%</strong>)
            </div>
          </div>
          <div class="contract-item"><strong>제3조 (업무 및 역할 분담)</strong> ${V(s.roles, '상호 협의하여 공동 경영한다.')}</div>
          <div class="contract-item"><strong>제4조 (손익 분배 · 정산 및 탈퇴)</strong><div style="padding-left:4mm;">${U.escapeHtmlWithBr(s.clauses || '')}</div></div>
          <div class="contract-item"><strong>제5조 (분쟁 해결 및 보관)</strong> 본 계약에 정함이 없는 사항은 민법 조합 규정에 따르며, 2부를 작성하여 갑·을이 서명·날인 후 각 1부씩 보관한다.</div>
          <div class="doc-sign-block">
            <div class="doc-date" style="margin:2mm 0 4mm;">${U.formatKoreanDate(s.writtenDate)}</div>
            ${partySignBoxes(ctx,
              { title: '갑 (동업자)', slot: 'partyA', rows: [['성 명', s.partyAName, true], ['생년월일', s.partyAId], ['연락처', s.partyAPhone], ['주 소', s.partyAAddress]] },
              { title: '을 (동업자)', slot: 'partyB', rows: [['성 명', s.partyBName, true], ['생년월일', s.partyBId], ['연락처', s.partyBPhone], ['주 소', s.partyBAddress]] }
            )}
          </div>
        </div>
      `;
    },
  });
})(window);
