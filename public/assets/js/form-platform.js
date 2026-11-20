/* ==========================================================================
   바로서식 (BaroDoc) — Stage 1 Scalable Form Platform Engine (52+ Ready)
   1. Declarative Schema Compiler (registerSchema support)
   2. Serverless Share Link (#d=... compressed hash, zero server storage)
   3. Personal & Company Profile Auto-Fill (localStorage)
   4. Situation-based 1-Click Narrative Phrase Presets
   5. Real-time Legal/Practical Validator + Pre-Print Checklist Modal
   6. High-Resolution A4 PNG Image Export
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SE = window.StampEngine;
  const SW = window.StampWidget;

  const PROFILE_KEY = 'barodoc_user_profile_v1';
  const MIN_WAGE_HOURLY_2026 = 10320;
  const MIN_WAGE_MONTHLY_2026 = 2156880; // 209h 기준 (주휴 포함)
  const FAMILY_LOAN_EXEMPT_PRINCIPAL = 217391304; // 연 4.6% 기준 1,000만원 / 0.046

  /* ========================================================================
     1. Personal & Company Profile Storage (100% Browser Local)
     ======================================================================== */
  function defaultProfile() {
    return {
      personal: {
        name: '',
        birthOrId: '',
        phone: '',
        address: '',
        department: '',
        position: '',
        bankAccount: '',
      },
      company: {
        companyName: '',
        bizNo: '',
        ceoName: '',
        companyPhone: '',
        companyAddress: '',
        bizType: '',
        bizItem: '',
        bankAccount: '',
      },
      defaultMarkType: 'none', // none | stamp | signature
      defaultStampId: '',
      defaultSignatureId: '',
    };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return defaultProfile();
      const parsed = JSON.parse(raw);
      const base = defaultProfile();
      return {
        personal: Object.assign(base.personal, parsed.personal || {}),
        company: Object.assign(base.company, parsed.company || {}),
        defaultMarkType: parsed.defaultMarkType || 'none',
        defaultStampId: parsed.defaultStampId || '',
        defaultSignatureId: parsed.defaultSignatureId || '',
      };
    } catch (e) {
      return defaultProfile();
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasProfileData(profile) {
    const p = profile || loadProfile();
    const hasPersonal = Object.values(p.personal || {}).some((v) => String(v || '').trim().length > 0);
    const hasCompany = Object.values(p.company || {}).some((v) => String(v || '').trim().length > 0);
    return hasPersonal || hasCompany;
  }

  /* ========================================================================
     2. Per-Form Capability Registry (Profile Map, Phrase Presets, Validators)
     Extensible for 52+ forms — future schema forms pass these directly!
     ======================================================================== */
  const FORM_META = {
    sajikseo: {
      profileTargets: [
        {
          id: 'default',
          label: '내 개인 + 소속 회사 정보 불러오기',
          slot: 'writer',
          personal: {
            name: 'name',
            birthOrId: 'birthOrId',
            phone: 'phone',
            address: 'address',
            department: 'department',
            position: 'position',
          },
          company: { companyName: 'companyName' },
        },
      ],
      presets: {
        reasonDetail: [
          {
            label: '개인 사정 · 이직',
            text: '개인적인 사정과 향후 경력 개발 및 진로 준비를 위하여 사직하고자 합니다. 그동안 베풀어 주신 배려에 깊이 감사드리며, 퇴직 전까지 담당 업무 인수인계를 성실히 완료하겠습니다.',
          },
          {
            label: '건강 회복 · 휴식',
            text: '최근 건강상의 사유로 충분한 치료와 휴식이 필요하여 부득이하게 사직을 요청드립니다. 원활한 업무 공백 최소화를 위해 인수인계에 최선을 다하겠습니다.',
          },
          {
            label: '권고사직 (실업급여용)',
            text: '회사의 경영상 사정 및 조직 개편에 따른 사직 권유를 수용하여 권고사직으로 퇴사하고자 합니다. (비자발적 이직 사유 확인 및 이직확인서 발급 요청)',
          },
          {
            label: '학업 · 자기계발',
            text: '향후 학업 정진 및 전문 자격 취득 준비를 위하여 사직하고자 합니다. 재직 기간 동안 함께 근무할 수 있어 감사했습니다.',
          },
        ],
      },
      required: [
        { field: 'name', label: '작성자 성명' },
        { field: 'resignDate', label: '퇴직 예정일' },
        { field: 'writtenDate', label: '작성일' },
      ],
      requireMark: true,
      validate: (s) => {
        const items = [];
        if (s.joinDate && s.resignDate && s.resignDate < s.joinDate) {
          items.push({ level: 'danger', text: '퇴직 예정일이 입사일보다 빠릅니다. 날짜를 다시 확인해 주세요.' });
        }
        if (s.writtenDate && s.resignDate) {
          const diffDays = Math.round((new Date(s.resignDate) - new Date(s.writtenDate)) / 86400000);
          if (diffDays >= 0 && diffDays < 30) {
            items.push({
              level: 'info',
              text: `퇴직 예정일이 작성일로부터 ${diffDays}일 뒤입니다. 통상 30일 전 통보가 권장되며(민법 제660조), 회사 협의가 필요합니다.`,
            });
          }
        }
        return items;
      },
    },

    chayongjeung: {
      profileTargets: [
        {
          id: 'debtor',
          label: '내 정보를 채무자(빌리는 분)에 채우기',
          slot: 'debtor',
          personal: { name: 'debtorName', birthOrId: 'debtorId', phone: 'debtorPhone', address: 'debtorAddress' },
        },
        {
          id: 'creditor',
          label: '내 정보를 채권자(빌려주는 분)에 채우기',
          slot: 'creditor',
          personal: {
            name: 'creditorName',
            birthOrId: 'creditorId',
            phone: 'creditorPhone',
            address: 'creditorAddress',
            bankAccount: 'bankAccount',
          },
        },
      ],
      presets: {
        specialTerms: [
          {
            label: '기한이익상실 표준',
            text: '1. 채무자가 이자 지급을 2회 이상 연체할 경우 기한의 이익을 상실하며, 채권자는 즉시 원리금 전액의 변제를 청구할 수 있다.\n2. 원금 및 이자는 위 지정 계좌로 이체하여 변제한다.\n3. 본 차용증과 관련한 분쟁 발생 시 관할 법원은 채권자 주소지 관할 법원으로 한다.',
          },
          {
            label: '가족 간 무이자 · 증여세 대비',
            text: '1. 본 금전 대차는 당사자 간 합의에 의한 실제 차용 거래이며, 채무자는 변제기일까지 지정 계좌로 원금을 상환한다.\n2. 중도상환 수수료는 없으며, 상환 내역은 계좌이체 기록으로 명확히 증빙한다.\n3. 본 차용증은 작성일 기준으로 2부 작성하여 각 1부씩 보관한다.',
          },
          {
            label: '중도상환 자유 특약',
            text: '1. 채무자는 변제기일 전이라도 사전 통지 후 별도의 중도상환 수수료 없이 원금의 전부 또는 일부를 조기 상환할 수 있다.\n2. 일부 상환 시 잔여 원금에 대해서만 약정 이자를 산정한다.',
          },
          {
            label: '공증 · 담보 협의',
            text: '1. 채권자의 요청이 있을 경우 채무자는 본 차용증에 기한 강제집행 인낙 공정증서 작성에 성실히 협조한다.\n2. 변제기일 도과 시 미변제 원금에 대하여 약정 지연손해금을 가산하여 지급한다.',
          },
        ],
      },
      required: [
        { field: 'principal', label: '차용 원금', type: 'money' },
        { field: 'loanDate', label: '차용일' },
        { field: 'dueDate', label: '변제기일' },
        { field: 'debtorName', label: '채무자 성명' },
        { field: 'creditorName', label: '채권자 성명' },
      ],
      requireMark: true,
      validate: (s) => {
        const items = [];
        const r1 = U.parseNumber(s.interestRate);
        const r2 = U.parseNumber(s.delayRate);
        const principal = U.parseNumber(s.principal);
        if (r1 > 20 || r2 > 20) {
          items.push({
            level: 'danger',
            text: '법정 최고이자율(연 20%, 이자제한법)을 초과했습니다. 연 20% 초과 이자 약정은 초과 부분에 한해 무효입니다.',
          });
        }
        if (s.loanDate && s.dueDate && s.dueDate < s.loanDate) {
          items.push({ level: 'warn', text: '변제기일이 차용일보다 빠릅니다. 날짜를 확인해 주세요.' });
        }
        if (principal > FAMILY_LOAN_EXEMPT_PRINCIPAL && r1 < 4.6) {
          const gap = Math.round(principal * ((4.6 - r1) / 100));
          if (gap >= 10000000) {
            items.push({
              level: 'info',
              text: `가족·특수관계인 거래 시 적정이자(연 4.6%)와 차액이 연 ${U.formatNumber(gap)}원(1,000만원 이상)으로 증여세 과세 검토가 필요합니다.`,
            });
          }
        }
        return items;
      },
    },

    wiimjang: {
      profileTargets: [
        {
          id: 'delegator',
          label: '내 정보를 위임인(맡기는 분)에 채우기',
          slot: 'delegator',
          personal: {
            name: 'delegatorName',
            birthOrId: 'delegatorId',
            phone: 'delegatorPhone',
            address: 'delegatorAddress',
          },
        },
        {
          id: 'agent',
          label: '내 정보를 수임인(대리인)에 채우기',
          slot: 'delegator',
          personal: {
            name: 'agentName',
            birthOrId: 'agentId',
            phone: 'agentPhone',
            address: 'agentAddress',
          },
        },
      ],
      presets: {
        purposeDetail: [
          {
            label: '주민센터 서류 발급',
            text: '위임인의 주민등록등본·초본, 가족관계증명서, 인감증명서(또는 본인서명사실확인서) 등 제증명 발급 신청 및 수령에 관한 일체의 권한을 위임합니다.',
          },
          {
            label: '은행 계좌 · 금융 업무',
            text: '위임인 명의 계좌의 입출금, 증명서(잔액증명서·거래내역서) 발급, 통장 재발급 및 제신고 등 지정된 금융 업무 대리 처리 권한 일체를 위임합니다.',
          },
          {
            label: '부동산 임대차 · 매매 계약',
            text: '목적물 부동산의 매매 또는 임대차 계약 체결, 계약금·중도금·잔금 정산, 영수증 수령 및 인도 확인 등 계약 관련 대리 행위 일체를 위임합니다.',
          },
          {
            label: '자동차 등록 · 이전',
            text: '위임인 소유 차량의 소유권 이전 등록, 저당권 설정·말소, 등록증 재교부 및 관련 세금 납부 대행에 관한 권한 일체를 위임합니다.',
          },
        ],
      },
      required: [
        { field: 'delegatorName', label: '위임인 성명' },
        { field: 'agentName', label: '수임인 성명' },
        { field: 'purposeTitle', label: '위임 사항 제목' },
        { field: 'writtenDate', label: '작성일' },
      ],
      requireMark: true,
    },

    jaejik: {
      profileTargets: [
        {
          id: 'both',
          label: '내 개인 + 회사 정보 한 번에 채우기',
          slot: 'company',
          personal: {
            name: 'name',
            birthOrId: 'residentId',
            address: 'address',
            department: 'department',
            position: 'position',
          },
          company: {
            companyName: 'companyName',
            bizNo: 'bizNo',
            ceoName: 'ceoName',
            companyPhone: 'companyPhone',
            companyAddress: 'companyAddress',
          },
        },
      ],
      presets: {
        purpose: [
          { label: '금융기관 (대출) 제출용', text: '금융기관 제출용 (주택자금·신용대출 심사)' },
          { label: '관공서 · 비자 제출용', text: '관공서 및 대사관(비자 발급) 제출용' },
          { label: '보증 · 임대차 제출용', text: '전세보증보험 및 임대차 계약 제출용' },
          { label: '교육 · 지원 제출용', text: '교육기관 및 지원사업 신청 제출용' },
        ],
      },
      required: [
        { field: 'name', label: '성명' },
        { field: 'companyName', label: '회사명' },
        { field: 'issueDate', label: '발급일자' },
      ],
      requireMark: true,
    },

    gyeonjeokseo: {
      profileTargets: [
        {
          id: 'supplier',
          label: '내 회사 정보를 공급자에 채우기',
          slot: 'supplier',
          company: {
            companyName: 'supplierName',
            ceoName: 'supplierCeo',
            bizNo: 'supplierBizNo',
            companyPhone: 'supplierPhone',
            bizType: 'supplierBizType',
            bizItem: 'supplierBizItem',
            companyAddress: 'supplierAddress',
          },
        },
      ],
      presets: {
        notes: [
          {
            label: '계약금 50% / 잔금 50%',
            text: '1. 결제 조건: 계약 시 선금 50%, 최종 납품 및 검수 완료 후 7일 이내 잔금 50%\n2. 본 견적서는 발행일로부터 14일간 유효하며, 작업 범위 변경 시 금액이 조정될 수 있습니다.\n3. 세금계산서는 전자세금계산서로 발행해 드립니다.',
          },
          {
            label: '납품 후 15일 결제',
            text: '1. 결제 조건: 납품 완료 및 세금계산서 발행일로부터 15일 이내 계좌이체\n2. 하자보수 기간은 검수 완료일로부터 3개월로 합니다.',
          },
          {
            label: '부가세 별도 · 세금계산서',
            text: '1. 상기 단가는 부가가치세(VAT 10%) 별도 기준이며, 최종 합계에 부가세가 반영되어 있습니다.\n2. 발주 확정 후 착수 일정은 담당자와 별도 협의합니다.',
          },
          {
            label: '수정 범위 명시 (프리랜서)',
            text: '1. 시안 확정 후 기본 수정 2회 무료 포함(추가 수정 시 별도 협의)\n2. 원본 파일 제공 여부 및 저작권 귀속 범위는 최종 잔금 완납 시점에 적용됩니다.',
          },
        ],
      },
      required: [
        { field: 'clientName', label: '수신처명' },
        { field: 'supplierName', label: '공급자 상호' },
        { field: 'quoteDate', label: '견적일자' },
      ],
      requireMark: true,
      validate: (s) => {
        const items = [];
        const total = (s.items || []).reduce((a, r) => a + U.parseNumber(r.qty) * U.parseNumber(r.unitPrice), 0);
        if (total <= 0) {
          items.push({ level: 'warn', text: '견적 품목의 수량과 단가가 0원입니다. 금액을 입력해 주세요.' });
        }
        return items;
      },
    },

    geunro: {
      profileTargets: [
        {
          id: 'employer',
          label: '내 회사 정보를 사업주에 채우기',
          slot: 'employer',
          company: {
            companyName: 'companyName',
            ceoName: 'ceoName',
            companyPhone: 'companyPhone',
            companyAddress: 'companyAddress',
          },
        },
        {
          id: 'employee',
          label: '내 개인 정보를 근로자에 채우기',
          slot: 'employee',
          personal: {
            name: 'employeeName',
            phone: 'employeePhone',
            address: 'employeeAddress',
          },
        },
      ],
      presets: {
        allowanceText: [
          { label: '비과세 식대 20만원 포함', text: '비과세 식대 월 200,000원 포함 (연장·야간·휴일근로수당 별도)' },
          { label: '주휴수당 별도 지급', text: '주 소정근로시간 15시간 이상 개근 시 법정 주휴수당 별도 지급' },
          { label: '성과급 · 명절상여 별도', text: '경영 성과급 및 명절 상여금은 회사 내부 규정에 따라 별도 지급' },
          { label: '별도 수당 없음', text: '없음 (법정 연장·야간·휴일 가산수당은 근로기준법에 따라 지급)' },
        ],
      },
      required: [
        { field: 'companyName', label: '사업체명' },
        { field: 'employeeName', label: '근로자 성명' },
        { field: 'startDate', label: '근로 개시일' },
        { field: 'wageAmount', label: '임금 금액', type: 'money' },
        { field: 'writtenDate', label: '계약 체결일' },
      ],
      requireMark: true,
      validate: (s) => {
        const items = [];
        const amt = U.parseNumber(s.wageAmount);
        if (s.wageType === 'hourly') {
          const withWeeklyHoliday = Math.round(amt * 1.2);
          if (amt < MIN_WAGE_HOURLY_2026) {
            items.push({
              level: 'danger',
              text: `2026년 법정 최저시급(${U.formatNumber(MIN_WAGE_HOURLY_2026)}원) 미만입니다! 주 15시간 이상 근무 시 주휴수당(시급×1.2 = 최소 12,384원)도 별도 지급해야 합니다.`,
            });
          } else {
            items.push({
              level: 'ok',
              text: `2026년 최저시급 충족 · 주 15시간 이상 개근 시 주휴수당 포함 실질 시급 약 ${U.formatNumber(withWeeklyHoliday)}원`,
            });
          }
        } else if (s.wageType === 'monthly') {
          if (amt < MIN_WAGE_MONTHLY_2026) {
            items.push({
              level: 'warn',
              text: `주 40시간(209시간·주휴 포함) 기준 2026년 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원) 미만입니다. 단시간 근로 여부를 확인하세요.`,
            });
          } else {
            items.push({
              level: 'ok',
              text: `2026년 주 40시간 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원, 주휴수당 포함) 기준 충족`,
            });
          }
        } else {
          const monthly = Math.round(amt / 12);
          if (monthly < MIN_WAGE_MONTHLY_2026) {
            items.push({
              level: 'warn',
              text: `연봉 월 환산액(${U.formatNumber(monthly)}원)이 2026년 최저월급(${U.formatNumber(MIN_WAGE_MONTHLY_2026)}원) 미만입니다.`,
            });
          }
        }
        if (s.contractType !== 'permanent' && !s.endDate) {
          items.push({ level: 'warn', text: '계약직·단시간 근로계약서는 근로 종료일을 반드시 기재해야 합니다.' });
        }
        return items;
      },
    },

    georae: {
      profileTargets: [
        {
          id: 'supplier',
          label: '내 회사 정보를 공급자에 채우기',
          slot: 'supplier',
          company: {
            companyName: 'supplierName',
            ceoName: 'supplierCeo',
            bizNo: 'supplierBizNo',
            companyPhone: 'supplierPhone',
            bizType: 'supplierBizType',
            bizItem: 'supplierBizItem',
            companyAddress: 'supplierAddress',
          },
        },
      ],
      presets: {
        notes: [
          { label: '정상 납품 · 인수 확인', text: '위 품목을 정히 납품(인수) 하였음을 확인합니다.' },
          { label: '월말 합산 세금계산서', text: '본 거래 건은 월말 마감 후 전자세금계산서로 합산 발행 예정입니다.' },
          { label: '검수 후 7일 이내 입금', text: '납품 품목 검수 완료 후 7영업일 이내 지정 계좌로 대금 정산 부탁드립니다.' },
          { label: '하자 시 무상 교환', text: '수령일로부터 7일 이내 파손·수량 오류 발견 시 무상 교환 처리해 드립니다.' },
        ],
      },
      required: [
        { field: 'clientName', label: '공급받는자 상호' },
        { field: 'supplierName', label: '공급자 상호' },
        { field: 'tradeDate', label: '거래일자' },
      ],
      requireMark: true,
      validate: (s) => {
        const total = (s.items || []).reduce((a, r) => a + U.parseNumber(r.qty) * U.parseNumber(r.unitPrice), 0);
        return total <= 0 ? [{ level: 'warn', text: '거래 품목의 금액 합계가 0원입니다. 수량과 단가를 입력해 주세요.' }] : [];
      },
    },

    gyeongryeok: {
      profileTargets: [
        {
          id: 'both',
          label: '내 개인 + 회사 정보 채우기',
          slot: 'company',
          personal: {
            name: 'name',
            birthOrId: 'residentId',
            address: 'address',
            department: 'department',
            position: 'position',
          },
          company: {
            companyName: 'companyName',
            bizNo: 'bizNo',
            ceoName: 'ceoName',
            companyPhone: 'companyPhone',
            companyAddress: 'companyAddress',
          },
        },
      ],
      presets: {
        duties: [
          {
            label: '경영지원 · 총무/회계',
            text: '- 전표 관리, 부가세·원천세 세무 자료 취합 및 월간 결산 지원\n- 인사·근태 관리, 4대보험 취득/상실 신고 및 사내 총무 업무 총괄',
          },
          {
            label: 'IT 서비스 기획 · 개발',
            text: '- 웹·모바일 서비스 요구사항 정의, 화면 설계(UI/UX) 및 프로젝트 일정 관리\n- 프론트엔드/백엔드 기능 개발, 배포 운영 및 성능 개선 업무 수행',
          },
          {
            label: '영업 · 거래처 관리',
            text: '- B2B 신규 거래처 발굴, 제안서·견적서 작성 및 계약 체결 업무\n- 기존 고객사 매출 관리, 정산 협의 및 파트너십 유지',
          },
          {
            label: '마케팅 · 콘텐츠 운영',
            text: '- 디지털 광고(검색/SNS) 캠페인 기획·집행 및 ROAS 성과 분석\n- 브랜드 콘텐츠 제작, 공식 채널 운영 및 프로모션 이벤트 실행',
          },
        ],
      },
      required: [
        { field: 'name', label: '성명' },
        { field: 'companyName', label: '회사명' },
        { field: 'issueDate', label: '발급일자' },
      ],
      requireMark: true,
      validate: (s) => {
        if (s.joinDate && s.leaveDate && s.leaveDate < s.joinDate) {
          return [{ level: 'danger', text: '퇴사일이 입사일보다 빠릅니다. 경력 기간을 확인해 주세요.' }];
        }
        return [];
      },
    },

    yeongsujeung: {
      profileTargets: [
        {
          id: 'issuer_personal',
          label: '내 개인 정보를 발행인(받은 분)에 채우기',
          slot: 'issuer',
          personal: {
            name: 'issuerName',
            birthOrId: 'issuerBizOrId',
            phone: 'issuerPhone',
            address: 'issuerAddress',
          },
        },
        {
          id: 'issuer_company',
          label: '내 회사 정보를 발행인(받은 분)에 채우기',
          slot: 'issuer',
          company: {
            companyName: 'issuerName',
            bizNo: 'issuerBizOrId',
            companyPhone: 'issuerPhone',
            companyAddress: 'issuerAddress',
          },
        },
      ],
      presets: {
        itemDesc: [
          { label: '부동산 계약금', text: '부동산 매매(또는 임대차) 계약금 수령분 (목적물 소재지 기재)' },
          { label: '월세 보증금 · 차임', text: '임대차 보증금 및 월 차임(월세) 수령분' },
          { label: '프리랜서 용역 대금', text: '프로젝트 디자인·개발 용역 수행 대금 정산분' },
          { label: '물품 매매 대금', text: '물품 공급 및 인도 완료에 따른 매매 대금 전액' },
        ],
        note: [
          { label: '표준 영수 확인', text: '상기 금액을 정히 영수(수령)하였음을 확인합니다.' },
          {
            label: '세금계산서 미대체 안내',
            text: '상기 금액을 정히 영수하였음을 확인합니다. (본 영수증은 대금 수령 확인용이며 세금계산서를 대체하지 않습니다.)',
          },
          { label: '잔금 일정 명시', text: '상기 계약금을 정히 영수하였으며, 잔금은 추후 약정 기일에 정산하기로 합니다.' },
        ],
      },
      required: [
        { field: 'payerName', label: '지급인' },
        { field: 'amount', label: '영수 금액', type: 'money' },
        { field: 'receiptDate', label: '영수일자' },
        { field: 'issuerName', label: '발행인 성명/상호' },
      ],
      requireMark: true,
    },

    jichul: {
      profileTargets: [
        {
          id: 'drafter',
          label: '내 개인 정보를 기안자에 채우기',
          slot: 'drafter',
          personal: {
            name: 'drafterName',
            department: 'department',
            bankAccount: 'bankAccount',
          },
        },
      ],
      presets: {
        notes: [
          { label: '카드전표 · 영수증 별첨', text: '1. 각 항목별 신용카드 매출전표 및 영수증 사본을 별도 첨부합니다.\n2. 결재 승인 후 지출 정산 처리 부탁드립니다.' },
          { label: '개인 선지출 정산 요청', text: '업무상 불가피하게 개인 카드로 선지출한 경비이며, 결재 완료 후 상기 기재된 개인 계좌로 입금 부탁드립니다.' },
          { label: '출장비 정산 완료', text: '사내 출장 여비 규정에 따라 교통비·숙박비·식대 실비 정산 내역을 보고합니다.' },
          { label: '거래처 접대비 품의', text: '신규 거래처 협의 및 업무 미팅에 따른 식대 지출이며, 참석자 명단 및 카드전표를 별첨합니다.' },
        ],
      },
      required: [
        { field: 'drafterName', label: '기안자 성명' },
        { field: 'title', label: '지출 제목' },
        { field: 'draftDate', label: '기안일자' },
      ],
      requireMark: true,
      validate: (s) => {
        const sum = (s.items || []).reduce((a, r) => a + Math.max(0, U.parseNumber(r.amount)), 0);
        return sum <= 0 ? [{ level: 'warn', text: '지출 합계금액이 0원입니다. 지출 내역 금액을 입력해 주세요.' }] : [];
      },
    },

    simal: {
      profileTargets: [
        {
          id: 'writer',
          label: '내 개인 + 회사 정보 채우기',
          slot: 'writer',
          personal: { name: 'name', department: 'department', position: 'position' },
          company: { companyName: 'companyName' },
        },
      ],
      presets: {
        details: [
          {
            label: '업무 착오 · 누락',
            text: '담당 업무 처리 과정에서 세부 확인 절차를 소홀히 하여 자료 기재 착오(또는 누락)가 발생하였습니다. 인지 즉시 관련 부서에 공유하고 정정 조치를 완료하였으나, 업무에 혼선을 드린 점 깊이 반성합니다.',
          },
          {
            label: '납기 · 일정 지연',
            text: '진행 중인 업무의 사전 일정 관리 및 리스크 점검이 미흡하여 당초 예정된 마감 기한을 준수하지 못하였습니다. 관련 담당자께 불편을 끼쳐드린 점 진심으로 사과드립니다.',
          },
          {
            label: '근태 (지각/결근)',
            text: '개인 일정 및 건강 관리 소홀로 인해 소정 출근 시각을 준수하지 못하여 팀 업무에 지장을 초래하였습니다. 변명의 여지 없이 본인의 부주의를 인정하며 깊이 반성합니다.',
          },
          {
            label: '비품 · 차량 손상',
            text: '업무 수행 중 회사 지급 비품(또는 업무용 차량)을 취급하는 과정에서 부주의로 인해 일부 파손이 발생하였습니다. 즉시 관리자께 보고하였으며 원상복구 절차에 성실히 협조하겠습니다.',
          },
        ],
        prevention: [
          {
            label: '체크리스트 이중 검수',
            text: '1. 모든 문서·데이터 발송 전 필수 항목 체크리스트를 작성하여 2회 이상 교차 검수하겠습니다.\n2. 특이사항 발생 시 즉시 상급자에게 보고하여 신속히 대응하겠습니다.',
          },
          {
            label: '일정 사전 공유 체계',
            text: '1. 업무 착수 시 단계별 마일스톤을 설정하고 마감 2일 전 중간 점검을 정례화하겠습니다.\n2. 지연 우려가 감지되는 즉시 팀 내 공유하여 선제적으로 조율하겠습니다.',
          },
          {
            label: '근태 준수 서약',
            text: '1. 향후 출퇴근 시간 및 사내 복무 규정을 철저히 준수하여 동일한 사례가 재발하지 않도록 하겠습니다.\n2. 부득이한 사유 발생 시 사전에 반드시 보고하고 승인을 받겠습니다.',
          },
          {
            label: '안전 · 관리 수칙 준수',
            text: '1. 회사 비품 및 차량 사용 전후 상태 점검을 생활화하고 안전 수칙을 엄격히 준수하겠습니다.\n2. 향후 동일 과실이 재발할 경우 회사의 어떠한 조치도 감수하겠습니다.',
          },
        ],
      },
      required: [
        { field: 'name', label: '작성자 성명' },
        { field: 'subject', label: '사건 건명' },
        { field: 'writtenDate', label: '작성일' },
      ],
      requireMark: true,
    },

    habuiseo: {
      profileTargets: [
        {
          id: 'partyA',
          label: '내 정보를 갑(피해자/수령인)에 채우기',
          slot: 'partyA',
          personal: {
            name: 'partyAName',
            birthOrId: 'partyAId',
            phone: 'partyAPhone',
            address: 'partyAAddress',
            bankAccount: 'bankAccount',
          },
        },
        {
          id: 'partyB',
          label: '내 정보를 을(가해자/지급인)에 채우기',
          slot: 'partyB',
          personal: {
            name: 'partyBName',
            birthOrId: 'partyBId',
            phone: 'partyBPhone',
            address: 'partyBAddress',
          },
        },
      ],
      presets: {
        incidentSummary: [
          {
            label: '주차장 차량 접촉사고',
            text: '사건 발생일시 및 장소에서 을의 차량 운전 부주의로 갑의 차량과 접촉하여 물적 피해가 발생한 건에 대하여, 양 당사자가 원만히 손해배상 및 합의 조건을 정함.',
          },
          {
            label: '물품 · 기물 파손',
            text: '을의 부주의로 갑 소유의 시설물(또는 물품)이 파손된 사건과 관련하여, 수리비 및 손해 배상 금액을 상호 협의하여 아래와 같이 원만히 합의함.',
          },
          {
            label: '임대차 원상복구 정산',
            text: '임대차 계약 종료에 따른 목적물 원상복구 비용 및 보증금 반환 정산과 관련하여, 임대인과 임차인 간 상호 양보로 최종 정산 금액에 원만히 합의함.',
          },
          {
            label: '금전 · 채무 정산',
            text: '당사자 간 기존 금전 거래(또는 용역 대금) 미정산 잔액에 대하여 상호 정산 금액과 지급 기한을 확정하고 분쟁을 종결하기로 합의함.',
          },
        ],
        clauses: [
          {
            label: '민·형사상 이의제기 금지',
            text: '1. 을은 갑에게 위 합의금을 약정 기일까지 지정 계좌로 지급한다.\n2. 갑은 위 합의금을 전액 수령함과 동시에 본 건과 관련한 일체의 민·형사상 이의 제기, 손해배상 청구 및 처벌 불원 의사를 확인한다.\n3. 본 합의서 2부를 작성하여 갑과 을이 서명·날인 후 각 1부씩 보관한다.',
          },
          {
            label: '분할 지급 · 기한이익상실',
            text: '1. 을은 위 합의금을 매월 약정일에 분할하여 지정 계좌로 입금한다.\n2. 을이 약정 지급을 1회라도 지체할 경우 기한의 이익을 상실하며, 갑은 미지급 잔액 전액에 대하여 즉시 청구할 수 있다.\n3. 완납 시 본 건과 관련한 모든 민·형사상 분쟁은 최종 종결된다.',
          },
          {
            label: '비밀유지 · 비방 금지 포함',
            text: '1. 을은 약정 기일까지 위 합의금을 갑의 지정 계좌로 지급한다.\n2. 갑과 을은 본 합의 내용 및 사건 경위를 제3자 또는 온라인(SNS 등)에 유포하거나 상대방의 명예를 훼손하지 않기로 확약한다.\n3. 합의금 완납과 동시에 양 당사자는 민·형사상 일체의 추가 이의를 제기하지 아니한다.',
          },
          {
            label: '처벌불원서 제출 포함',
            text: '1. 을은 갑에게 합의 당일 위 합의금을 전액 지급하며, 갑은 수령과 동시에 을의 형사 처벌을 원하지 않는다는 처벌불원 의사를 명확히 한다.\n2. 갑은 수사기관 또는 법원에 합의서 및 처벌불원서 제출에 성실히 협조한다.\n3. 본 합의 이후 양 당사자는 본 건에 관한 일체의 민·형사상 이의를 제기하지 아니한다.',
          },
        ],
      },
      required: [
        { field: 'incidentTitle', label: '합의 건명' },
        { field: 'partyAName', label: '갑(수령인) 성명' },
        { field: 'partyBName', label: '을(지급인) 성명' },
        { field: 'writtenDate', label: '합의 작성일' },
      ],
      requireMark: true,
    },
  };

  function getMeta(formKey, def) {
    const base = FORM_META[formKey] || {};
    if (def && def.platformMeta) {
      return Object.assign({}, base, def.platformMeta);
    }
    return base;
  }

  /* ========================================================================
     3. Declarative Schema Compiler + Shared A4 Helpers (Enables 52+ Forms)
     ======================================================================== */
  function calcLineTotals(items, vatMode) {
    let supplyTotal = 0;
    let vatTotal = 0;
    const rows = (items || []).map((item) => {
      const qty = Math.max(0, U.parseNumber(item.qty));
      const unitPrice = Math.max(0, U.parseNumber(item.unitPrice));
      const raw = qty * unitPrice;
      let supply = 0;
      let vat = 0;
      if (vatMode === 'exempt') {
        supply = raw;
        vat = 0;
      } else if (vatMode === 'included') {
        supply = Math.round(raw / 1.1);
        vat = raw - supply;
      } else {
        supply = raw;
        vat = Math.round(raw * 0.1);
      }
      supplyTotal += supply;
      vatTotal += vat;
      return {
        name: item.name || '',
        spec: item.spec || '',
        qty,
        unitPrice,
        supply,
        vat,
        total: supply + vat,
        note: item.note || '',
      };
    });
    return { rows, supplyTotal, vatTotal, grandTotal: supplyTotal + vatTotal };
  }

  function valOrEmpty(v, placeholder) {
    if (v !== null && v !== undefined && String(v).trim()) return U.escapeHtml(v);
    return `<span class="doc-empty">${U.escapeHtml(placeholder || '')}</span>`;
  }

  function renderFieldHtml(f, s) {
    const val = s[f.name] !== undefined ? s[f.name] : '';
    if (f.type === 'textarea') {
      const minH = f.minHeight ? ` style="min-height:${f.minHeight}px;"` : '';
      return `<div class="field"><label>${U.escapeHtml(f.label)}</label><textarea${minH} data-field="${U.escapeHtml(f.name)}" placeholder="${U.escapeHtml(f.placeholder || '')}">${U.escapeHtml(val)}</textarea></div>`;
    }
    if (f.type === 'select') {
      return `<div class="field"><label>${U.escapeHtml(f.label)}</label><select data-field="${U.escapeHtml(f.name)}"${f.rerender ? ' data-rerender="true"' : ''}>${(f.options || [])
        .map((opt) => {
          const ov = typeof opt === 'string' ? opt : opt.value;
          const ol = typeof opt === 'string' ? opt : opt.label;
          return `<option value="${U.escapeHtml(ov)}" ${val === ov ? 'selected' : ''}>${U.escapeHtml(ol)}</option>`;
        })
        .join('')}</select></div>`;
    }
    if (f.type === 'checkbox') {
      return `<div class="field"><label class="checkbox-row"><input type="checkbox" data-field="${U.escapeHtml(f.name)}"${f.rerender ? ' data-rerender="true"' : ''} ${val ? 'checked' : ''}> ${U.escapeHtml(f.label)}</label></div>`;
    }
    if (f.type === 'money') {
      const n = U.parseNumber(val);
      return `<div class="field"><label>${U.escapeHtml(f.label)}</label><input type="number" min="0" step="${f.step || 1000}" data-field="${U.escapeHtml(f.name)}" data-money-live="true" value="${U.escapeHtml(val)}" placeholder="${U.escapeHtml(f.placeholder || '')}"><div class="field-converted" data-money-box="${U.escapeHtml(f.name)}"><div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(n))}</div><div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(n))} (₩${U.formatNumber(n)})</div></div></div>`;
    }
    if (f.type === 'items') {
      const items = Array.isArray(s[f.name]) ? s[f.name] : [];
      const vatField = f.vatField || 'vatMode';
      const vatMode = f.useVat ? (s[vatField] || 'separate') : 'exempt';
      const totals = calcLineTotals(items, vatMode);
      return `
        <div class="schema-items-block" data-items-field="${U.escapeHtml(f.name)}">
          ${
            f.useVat
              ? `<div class="field">
                  <label>부가가치세 (VAT) 방식</label>
                  <select data-field="${U.escapeHtml(vatField)}" data-rerender="true">
                    <option value="separate" ${vatMode === 'separate' ? 'selected' : ''}>부가세 별도 (+10% 자동 계산)</option>
                    <option value="included" ${vatMode === 'included' ? 'selected' : ''}>부가세 포함 (공급가액·세액 역산)</option>
                    <option value="exempt" ${vatMode === 'exempt' ? 'selected' : ''}>면세 / 부가세 없음 (0%)</option>
                  </select>
                </div>`
              : ''
          }
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:12.5px;font-weight:700;color:var(--text-secondary);">항목 목록 (${items.length}건)</span>
            <button type="button" class="btn btn-outline btn-sm" data-schema-add-item="${U.escapeHtml(f.name)}">+ 항목 추가</button>
          </div>
          ${items
            .map(
              (it, idx) => `
            <div class="line-item-card">
              <div class="line-item-head">
                <span>항목 #${idx + 1}</span>
                ${items.length > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-schema-del-item="${U.escapeHtml(f.name)}" data-idx="${idx}" style="padding:2px 6px;font-size:11.5px;color:var(--seal-red);">삭제</button>` : ''}
              </div>
              <div class="line-item-grid">
                <input type="text" data-si-field="${U.escapeHtml(f.name)}" data-si-key="name" data-idx="${idx}" value="${U.escapeHtml(it.name || '')}" placeholder="${U.escapeHtml(f.namePlaceholder || '품목 / 내역명')}">
                <input type="text" data-si-field="${U.escapeHtml(f.name)}" data-si-key="spec" data-idx="${idx}" value="${U.escapeHtml(it.spec || '')}" placeholder="${U.escapeHtml(f.specPlaceholder || '규격 / 단위')}">
              </div>
              <div class="line-item-nums">
                <input type="number" min="0" step="1" data-si-field="${U.escapeHtml(f.name)}" data-si-key="qty" data-idx="${idx}" value="${U.escapeHtml(it.qty !== undefined ? it.qty : 1)}" placeholder="수량">
                <input type="number" min="0" step="100" data-si-field="${U.escapeHtml(f.name)}" data-si-key="unitPrice" data-idx="${idx}" value="${U.escapeHtml(it.unitPrice !== undefined ? it.unitPrice : 0)}" placeholder="단가(원)">
                <input type="text" data-si-field="${U.escapeHtml(f.name)}" data-si-key="note" data-idx="${idx}" value="${U.escapeHtml(it.note || '')}" placeholder="비고">
              </div>
            </div>
          `
            )
            .join('')}
          <div class="summary-box" data-si-summary="${U.escapeHtml(f.name)}">
            ${f.useVat ? `<div class="summary-line"><span>공급가액 합계</span><strong>${U.formatNumber(totals.supplyTotal)}원</strong></div><div class="summary-line"><span>부가세 (VAT)</span><strong>${U.formatNumber(totals.vatTotal)}원</strong></div>` : ''}
            <div class="summary-line total"><span>총 합계금액</span><strong>${U.formatNumber(totals.grandTotal)}원</strong></div>
            <div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))} / ${U.escapeHtml(U.formatHanjaCurrency(totals.grandTotal))}</div>
          </div>
        </div>
      `;
    }
    return `<div class="field"><label>${U.escapeHtml(f.label)}</label><input type="${U.escapeHtml(f.type || 'text')}" data-field="${U.escapeHtml(f.name)}" value="${U.escapeHtml(val)}" placeholder="${U.escapeHtml(f.placeholder || '')}"></div>`;
  }

  function renderSectionFields(secFields, s) {
    const out = [];
    let i = 0;
    while (i < secFields.length) {
      const cur = secFields[i];
      if (cur.half && i + 1 < secFields.length && secFields[i + 1].half) {
        out.push(`<div class="field-row">${renderFieldHtml(cur, s)}${renderFieldHtml(secFields[i + 1], s)}</div>`);
        i += 2;
      } else {
        out.push(renderFieldHtml(cur, s));
        i += 1;
      }
    }
    return out.join('');
  }

  function compileSchema(schema) {
    const sections = schema.sections || [];
    const fields = [];
    sections.forEach((sec) => {
      (sec.fields || []).forEach((f) => fields.push(f));
    });

    return {
      stampSlots: schema.stampSlots || [{ key: 'writer', label: '작성자 (인)', defaultName: '홍길동', defaultShape: 'circle', sizeMm: 17 }],
      defaultStampMm: schema.defaultStampMm || 17,
      getSuggestedStampName: schema.getSuggestedStampName || ((s) => s.name || s.writerName || s.supplierName || s.companyName || '홍길동'),
      platformMeta: {
        profileTargets: schema.profileTargets || [],
        presets: schema.presets || {},
        required: schema.required || [],
        requireMark: schema.requireMark !== false,
        validate: schema.validate || null,
      },
      getInitialData: () => {
        const data = {};
        fields.forEach((f) => {
          if (f.type === 'items' && f.useVat && !data[f.vatField || 'vatMode']) {
            data[f.vatField || 'vatMode'] = 'separate';
          }
          data[f.name] = typeof f.default === 'function' ? f.default() : (f.default !== undefined ? JSON.parse(JSON.stringify(f.default)) : '');
        });
        return Object.assign(data, typeof schema.extraInitial === 'function' ? schema.extraInitial() : {});
      },
      getSampleData: () => {
        const base = {};
        fields.forEach((f) => {
          if (f.type === 'items' && f.useVat && !base[f.vatField || 'vatMode']) {
            base[f.vatField || 'vatMode'] = 'separate';
          }
          base[f.name] = typeof f.sample === 'function' ? f.sample() : (f.sample !== undefined ? JSON.parse(JSON.stringify(f.sample)) : (typeof f.default === 'function' ? f.default() : (f.default !== undefined ? JSON.parse(JSON.stringify(f.default)) : '')));
        });
        return Object.assign(base, typeof schema.extraSample === 'function' ? schema.extraSample() : {});
      },
      renderEditor: (container, s, api) => {
        container.innerHTML = sections
          .map((sec) => `<div class="form-group-card"><div class="form-group-title">${U.escapeHtml(sec.title)}</div>${renderSectionFields(sec.fields || [], s)}</div>`)
          .join('');

        container.querySelectorAll('[data-field]').forEach((el) => {
          const key = el.getAttribute('data-field');
          const rerender = el.getAttribute('data-rerender') === 'true';
          const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
          el.addEventListener(ev, () => {
            const val = el.type === 'checkbox' ? el.checked : el.value;
            api.updateField(key, val, { rerenderEditor: rerender });
            if (el.getAttribute('data-money-live') === 'true') {
              const box = container.querySelector(`[data-money-box="${key}"]`);
              if (box) {
                const n = U.parseNumber(val);
                box.innerHTML = `<div><strong>한글:</strong> ${U.escapeHtml(U.formatKoreanCurrency(n))}</div><div><strong>한자:</strong> ${U.escapeHtml(U.formatHanjaCurrency(n))} (₩${U.formatNumber(n)})</div>`;
              }
            }
          });
        });

        // Schema dynamic items bindings
        container.querySelectorAll('[data-si-field]').forEach((el) => {
          el.addEventListener('input', () => {
            const fname = el.getAttribute('data-si-field');
            const subKey = el.getAttribute('data-si-key');
            const idx = Number(el.getAttribute('data-idx'));
            if (Array.isArray(s[fname]) && s[fname][idx]) {
              s[fname][idx][subKey] = el.value;
              api.setState(s, { rerenderEditor: false });
              const fDef = fields.find((x) => x.name === fname) || {};
              const vatMode = fDef.useVat ? (s[fDef.vatField || 'vatMode'] || 'separate') : 'exempt';
              const totals = calcLineTotals(s[fname], vatMode);
              const box = container.querySelector(`[data-si-summary="${fname}"]`);
              if (box) {
                box.innerHTML = `
                  ${fDef.useVat ? `<div class="summary-line"><span>공급가액 합계</span><strong>${U.formatNumber(totals.supplyTotal)}원</strong></div><div class="summary-line"><span>부가세 (VAT)</span><strong>${U.formatNumber(totals.vatTotal)}원</strong></div>` : ''}
                  <div class="summary-line total"><span>총 합계금액</span><strong>${U.formatNumber(totals.grandTotal)}원</strong></div>
                  <div style="font-size:12px;color:#bfdbfe;margin-top:4px;">${U.escapeHtml(U.formatKoreanCurrency(totals.grandTotal))} / ${U.escapeHtml(U.formatHanjaCurrency(totals.grandTotal))}</div>
                `;
              }
            }
          });
        });

        container.querySelectorAll('[data-schema-add-item]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const fname = btn.getAttribute('data-schema-add-item');
            if (!Array.isArray(s[fname])) s[fname] = [];
            if (s[fname].length >= 10) {
              U.showToast('A4 1장 기준 최대 10개 항목까지 입력할 수 있습니다.');
              return;
            }
            s[fname].push({ name: '', spec: '식', qty: 1, unitPrice: 0, note: '' });
            api.rerenderAll();
          });
        });

        container.querySelectorAll('[data-schema-del-item]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const fname = btn.getAttribute('data-schema-del-item');
            const idx = Number(btn.getAttribute('data-idx'));
            if (Array.isArray(s[fname]) && s[fname].length > 1) {
              s[fname].splice(idx, 1);
              api.rerenderAll();
            }
          });
        });
      },
      renderA4: schema.renderA4,
    };
  }

  /* ========================================================================
     3.5 Trade Document Chain Carry-Over (견적서 -> 발주서 -> 거래명세서 -> 청구서 -> 영수증)
     ======================================================================== */
  const CHAIN_KEY = 'barodoc_trade_chain_v1';
  const TRADE_CHAIN_STEPS = [
    { key: 'gyeonjeokseo', label: '견적서', path: '/gyeonjeokseo/' },
    { key: 'baljuseo', label: '발주서', path: '/baljuseo/' },
    { key: 'georae', label: '거래명세서', path: '/georae/' },
    { key: 'cheongguseo', label: '청구서', path: '/cheongguseo/' },
    { key: 'yeongsujeung', label: '영수증', path: '/yeongsujeung/' },
  ];

  function extractTradeEnvelope(formKey, state) {
    const items = Array.isArray(state.items) ? state.items : [];
    const vatMode = state.vatMode || 'separate';
    const totals = items.length ? calcLineTotals(items, vatMode) : null;
    const grandTotal = totals ? totals.grandTotal : U.parseNumber(state.amount || 0);
    const firstNames = items.map((i) => i.name).filter(Boolean).slice(0, 3).join(', ');
    return {
      sourceKey: formKey,
      sourceLabel: (TRADE_CHAIN_STEPS.find((x) => x.key === formKey) || { label: '이전 문서' }).label,
      clientName: state.clientName || state.payerName || '',
      clientBizNo: state.clientBizNo || '',
      clientCeo: state.clientCeo || '',
      clientPhone: state.clientPhone || '',
      clientContact: state.clientContact || '',
      supplierName: state.supplierName || state.issuerName || '',
      supplierBizNo: state.supplierBizNo || state.issuerBizOrId || '',
      supplierCeo: state.supplierCeo || '',
      supplierPhone: state.supplierPhone || state.issuerPhone || '',
      supplierAddress: state.supplierAddress || state.issuerAddress || '',
      supplierBizType: state.supplierBizType || '',
      supplierBizItem: state.supplierBizItem || '',
      projectTitle: state.projectTitle || state.itemDesc || firstNames || '',
      bankAccount: state.bankAccount || '',
      vatMode,
      items: items.length ? JSON.parse(JSON.stringify(items)) : [],
      grandTotal,
      notes: state.notes || state.note || '',
      savedAt: Date.now(),
    };
  }

  function applyTradeEnvelope(formKey, baseState, env) {
    if (!env) return baseState;
    const s = JSON.parse(JSON.stringify(baseState));
    const mapIfHas = (k, v) => {
      if (v !== undefined && v !== '' && Object.prototype.hasOwnProperty.call(s, k)) {
        s[k] = v;
      }
    };
    mapIfHas('clientName', env.clientName);
    mapIfHas('clientBizNo', env.clientBizNo);
    mapIfHas('clientCeo', env.clientCeo);
    mapIfHas('clientPhone', env.clientPhone);
    mapIfHas('clientContact', env.clientContact);
    mapIfHas('supplierName', env.supplierName);
    mapIfHas('supplierBizNo', env.supplierBizNo);
    mapIfHas('supplierCeo', env.supplierCeo);
    mapIfHas('supplierPhone', env.supplierPhone);
    mapIfHas('supplierAddress', env.supplierAddress);
    mapIfHas('supplierBizType', env.supplierBizType);
    mapIfHas('supplierBizItem', env.supplierBizItem);
    mapIfHas('projectTitle', env.projectTitle);
    mapIfHas('bankAccount', env.bankAccount);
    mapIfHas('vatMode', env.vatMode);
    if (Array.isArray(env.items) && env.items.length && Object.prototype.hasOwnProperty.call(s, 'items')) {
      s.items = JSON.parse(JSON.stringify(env.items));
    }
    if (formKey === 'yeongsujeung' || formKey === 'gani-yeongsujeung' || formKey === 'ipgeum') {
      mapIfHas('payerName', env.clientName);
      mapIfHas('issuerName', env.supplierName);
      mapIfHas('issuerBizOrId', env.supplierBizNo);
      mapIfHas('issuerPhone', env.supplierPhone);
      mapIfHas('issuerAddress', env.supplierAddress);
      if (env.grandTotal > 0 && Object.prototype.hasOwnProperty.call(s, 'amount')) {
        s.amount = String(env.grandTotal);
      }
      mapIfHas('itemDesc', env.projectTitle || (env.items || []).map((i) => i.name).filter(Boolean).join(', '));
    }
    if (env.notes && Object.prototype.hasOwnProperty.call(s, 'notes')) {
      s.notes = env.notes;
    }
    return s;
  }

  function renderTradeChainBar(barEl, formKey, getStateFn) {
    if (!barEl) return;
    const idx = TRADE_CHAIN_STEPS.findIndex((x) => x.key === formKey);
    if (idx === -1) {
      barEl.style.display = 'none';
      return;
    }
    const nextSteps = TRADE_CHAIN_STEPS.slice(idx + 1);
    if (!nextSteps.length) {
      barEl.style.display = 'none';
      return;
    }
    barEl.style.display = 'flex';
    barEl.innerHTML = `
      <span class="trade-chain-label">🔄 거래 문서 이어쓰기:</span>
      <div class="trade-chain-btns">
        ${nextSteps
          .map(
            (st) =>
              `<button type="button" class="trade-chain-btn" data-chain-target="${U.escapeHtml(st.path)}">${U.escapeHtml(st.label)}로 이어쓰기 →</button>`
          )
          .join('')}
      </div>
    `;
    barEl.querySelectorAll('[data-chain-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        try {
          const env = extractTradeEnvelope(formKey, getStateFn());
          sessionStorage.setItem(CHAIN_KEY, JSON.stringify(env));
        } catch (e) {}
        window.location.href = btn.getAttribute('data-chain-target') + '?from=chain';
      });
    });
  }

  function consumeTradeChainIfRequested(formKey, baseState) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'chain') return null;
    try {
      const raw = sessionStorage.getItem(CHAIN_KEY);
      if (!raw) return null;
      const env = JSON.parse(raw);
      return {
        state: applyTradeEnvelope(formKey, baseState, env),
        sourceLabel: env.sourceLabel || '이전 거래 문서',
      };
    } catch (e) {
      return null;
    }
  }

  /* ========================================================================
     4. Serverless Share Link (#d=...) Encode & Decode
     ======================================================================== */
  async function createShareUrl(formKey, state, initialData, fontMode, stampWidget) {
    const diff = {};
    Object.keys(state || {}).forEach((k) => {
      const cur = state[k];
      const init = initialData ? initialData[k] : undefined;
      if (JSON.stringify(cur) !== JSON.stringify(init)) {
        diff[k] = cur;
      }
    });
    const marks = stampWidget && typeof stampWidget.exportForShare === 'function' ? stampWidget.exportForShare() : {};
    const payload = {
      v: 1,
      f: formKey,
      s: diff,
      m: fontMode || 'serif',
    };
    if (marks && Object.keys(marks).length > 0) {
      payload.t = marks;
    }
    const token = await U.compressToHash(payload);
    const base = window.location.origin + window.location.pathname;
    return `${base}#d=${token}`;
  }

  async function readShareHash(expectedFormKey) {
    const hash = window.location.hash || '';
    const match = hash.match(/[#&]d=([^&]+)/);
    if (!match || !match[1]) return null;
    const data = await U.decompressFromHash(decodeURIComponent(match[1]));
    if (!data || typeof data !== 'object') return null;
    if (data.f && expectedFormKey && data.f !== expectedFormKey) return null;
    return data;
  }

  /* ========================================================================
     5. Modal Infrastructure (Profile, Share Fallback, Pre-Print Checklist)
     ======================================================================== */
  function openModal({ title, subtitle, bodyHtml, footerHtml, onMount }) {
    closeActiveModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'baro-modal-backdrop no-print';
    backdrop.id = 'baroActiveModal';
    backdrop.innerHTML = `
      <div class="baro-modal" role="dialog" aria-modal="true" aria-label="${U.escapeHtml(title)}">
        <div class="baro-modal-head">
          <div>
            <h3>${U.escapeHtml(title)}</h3>
            ${subtitle ? `<p>${U.escapeHtml(subtitle)}</p>` : ''}
          </div>
          <button type="button" class="baro-modal-close" aria-label="닫기">×</button>
        </div>
        <div class="baro-modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="baro-modal-foot">${footerHtml}</div>` : ''}
      </div>
    `;
    document.body.appendChild(backdrop);

    const closeBtn = backdrop.querySelector('.baro-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeActiveModal);
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) closeActiveModal();
    });
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        closeActiveModal();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);

    if (typeof onMount === 'function') onMount(backdrop, closeActiveModal);
    return backdrop;
  }

  function closeActiveModal() {
    const existing = document.getElementById('baroActiveModal');
    if (existing) existing.remove();
  }

  /* ========================================================================
     6. Profile Modal & Smart Auto-Fill
     ======================================================================== */
  function applyProfileTarget(target, profile, state, stampWidget, setStateFn) {
    const next = JSON.parse(JSON.stringify(state));
    let filledCount = 0;

    if (target.personal && profile.personal) {
      Object.keys(target.personal).forEach((pKey) => {
        const formField = target.personal[pKey];
        const val = (profile.personal[pKey] || '').trim();
        if (val && Object.prototype.hasOwnProperty.call(next, formField)) {
          next[formField] = val;
          filledCount++;
        }
      });
    }
    if (target.company && profile.company) {
      Object.keys(target.company).forEach((cKey) => {
        const formField = target.company[cKey];
        const val = (profile.company[cKey] || '').trim();
        if (val && Object.prototype.hasOwnProperty.call(next, formField)) {
          next[formField] = val;
          filledCount++;
        }
      });
    }

    let markApplied = false;
    if (stampWidget && target.slot) {
      if (profile.defaultMarkType === 'stamp' && profile.defaultStampId) {
        markApplied = stampWidget.applySavedStampById(profile.defaultStampId, target.slot);
      } else if (profile.defaultMarkType === 'signature' && profile.defaultSignatureId) {
        markApplied = stampWidget.applySavedSignatureById(profile.defaultSignatureId, target.slot);
      }
    }

    if (filledCount === 0 && !markApplied) {
      U.showToast('저장된 프로필에 채울 항목이 없습니다. 프로필 설정에서 먼저 정보를 입력해 주세요.');
      return false;
    }

    setStateFn(next, { rerenderEditor: true });
    U.showToast(`내 프로필에서 ${filledCount}개 항목${markApplied ? ' + 도장/서명' : ''}을 자동 채움했습니다.`);
    return true;
  }

  function openProfileModal(formKey, def, state, stampWidget, setStateFn, onAfterSave) {
    const p = loadProfile();
    const stamps = SE.loadSavedStamps();
    const sigs = SW.loadSavedSignatures();
    const meta = getMeta(formKey, def);

    const bodyHtml = `
      <div class="profile-tabs" role="tablist">
        <button type="button" class="profile-tab active" data-ptab="personal">개인 정보</button>
        <button type="button" class="profile-tab" data-ptab="company">회사 · 사업자 정보</button>
        <button type="button" class="profile-tab" data-ptab="mark">기본 도장 · 서명</button>
      </div>

      <div class="profile-pane" data-ppane="personal">
        <div class="field-row">
          <div class="field"><label>성명</label><input type="text" id="prof_p_name" value="${U.escapeHtml(p.personal.name)}" placeholder="예: 홍길동"></div>
          <div class="field"><label>생년월일 / 주민번호 앞자리</label><input type="text" id="prof_p_birth" value="${U.escapeHtml(p.personal.birthOrId)}" placeholder="예: 1990.05.15"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>연락처</label><input type="tel" id="prof_p_phone" value="${U.escapeHtml(p.personal.phone)}" placeholder="010-0000-0000"></div>
          <div class="field"><label>소속 부서</label><input type="text" id="prof_p_dept" value="${U.escapeHtml(p.personal.department)}" placeholder="예: 기획팀"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>직위 / 직급</label><input type="text" id="prof_p_pos" value="${U.escapeHtml(p.personal.position)}" placeholder="예: 대리"></div>
          <div class="field"><label>입금 계좌번호</label><input type="text" id="prof_p_bank" value="${U.escapeHtml(p.personal.bankAccount)}" placeholder="은행명 계좌번호 (예금주)"></div>
        </div>
        <div class="field"><label>현주소</label><input type="text" id="prof_p_addr" value="${U.escapeHtml(p.personal.address)}" placeholder="도로명 주소"></div>
      </div>

      <div class="profile-pane" data-ppane="company" style="display:none;">
        <div class="field-row">
          <div class="field"><label>상호 (회사명)</label><input type="text" id="prof_c_name" value="${U.escapeHtml(p.company.companyName)}" placeholder="예: 주식회사 바로테크"></div>
          <div class="field"><label>대표자 성명</label><input type="text" id="prof_c_ceo" value="${U.escapeHtml(p.company.ceoName)}" placeholder="예: 홍길동"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>사업자등록번호</label><input type="text" id="prof_c_biz" value="${U.escapeHtml(p.company.bizNo)}" placeholder="000-00-00000"></div>
          <div class="field"><label>회사 연락처</label><input type="tel" id="prof_c_phone" value="${U.escapeHtml(p.company.companyPhone)}" placeholder="02-000-0000"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>업태</label><input type="text" id="prof_c_type" value="${U.escapeHtml(p.company.bizType)}" placeholder="예: 정보통신업"></div>
          <div class="field"><label>종목</label><input type="text" id="prof_c_item" value="${U.escapeHtml(p.company.bizItem)}" placeholder="예: 소프트웨어 개발"></div>
        </div>
        <div class="field"><label>사업장 주소</label><input type="text" id="prof_c_addr" value="${U.escapeHtml(p.company.companyAddress)}" placeholder="사업장 도로명 주소"></div>
        <div class="field"><label>회사 입금 계좌</label><input type="text" id="prof_c_bank" value="${U.escapeHtml(p.company.bankAccount)}" placeholder="은행명 계좌번호 (예금주)"></div>
      </div>

      <div class="profile-pane" data-ppane="mark" style="display:none;">
        <p class="field-help" style="margin-top:0;">프로필 자동 채움 시 함께 날인할 기본 도장 또는 자필 서명을 선택할 수 있습니다.</p>
        <div class="field">
          <label>자동 날인 방식</label>
          <select id="prof_mark_type">
            <option value="none" ${p.defaultMarkType === 'none' ? 'selected' : ''}>사용 안 함 (텍스트만 자동 채움)</option>
            <option value="stamp" ${p.defaultMarkType === 'stamp' ? 'selected' : ''}>저장된 내 도장 자동 날인</option>
            <option value="signature" ${p.defaultMarkType === 'signature' ? 'selected' : ''}>저장된 자필 서명 자동 날인</option>
          </select>
        </div>
        <div class="field">
          <label>저장된 도장 (${stamps.length}개)</label>
          <select id="prof_stamp_id">
            <option value="">-- 선택 안 함 --</option>
            ${stamps.map((st) => `<option value="${U.escapeHtml(st.id)}" ${p.defaultStampId === st.id ? 'selected' : ''}>${U.escapeHtml(st.label)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>저장된 자필 서명 (${sigs.length}개)</label>
          <select id="prof_sig_id">
            <option value="">-- 선택 안 함 --</option>
            ${sigs.map((sg) => `<option value="${U.escapeHtml(sg.id)}" ${p.defaultSignatureId === sg.id ? 'selected' : ''}>${U.escapeHtml(sg.name)} (자필서명)</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="profile-privacy-note">
        🔒 입력한 프로필은 외부 서버로 절대 전송되지 않으며, 현재 기기의 브라우저(localStorage)에만 안전하게 보관됩니다.
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-ghost btn-sm" id="profClearBtn" style="color:var(--seal-red);margin-right:auto;">프로필 삭제</button>
      <button type="button" class="btn btn-outline btn-sm" id="profSaveOnlyBtn">저장만 하기</button>
      <button type="button" class="btn btn-primary btn-sm" id="profSaveApplyBtn">저장 후 바로 채우기</button>
    `;

    openModal({
      title: '내 개인 · 회사 프로필 설정',
      subtitle: '1번만 저장해 두면 바로서식의 모든 서식에서 클릭 한 번으로 자동 입력됩니다.',
      bodyHtml,
      footerHtml,
      onMount: (backdrop, close) => {
        backdrop.querySelectorAll('[data-ptab]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-ptab');
            backdrop.querySelectorAll('[data-ptab]').forEach((b) => b.classList.toggle('active', b === btn));
            backdrop.querySelectorAll('[data-ppane]').forEach((pane) => {
              pane.style.display = pane.getAttribute('data-ppane') === tab ? '' : 'none';
            });
          });
        });

        function collect() {
          return {
            personal: {
              name: backdrop.querySelector('#prof_p_name').value.trim(),
              birthOrId: backdrop.querySelector('#prof_p_birth').value.trim(),
              phone: backdrop.querySelector('#prof_p_phone').value.trim(),
              department: backdrop.querySelector('#prof_p_dept').value.trim(),
              position: backdrop.querySelector('#prof_p_pos').value.trim(),
              bankAccount: backdrop.querySelector('#prof_p_bank').value.trim(),
              address: backdrop.querySelector('#prof_p_addr').value.trim(),
            },
            company: {
              companyName: backdrop.querySelector('#prof_c_name').value.trim(),
              ceoName: backdrop.querySelector('#prof_c_ceo').value.trim(),
              bizNo: backdrop.querySelector('#prof_c_biz').value.trim(),
              companyPhone: backdrop.querySelector('#prof_c_phone').value.trim(),
              bizType: backdrop.querySelector('#prof_c_type').value.trim(),
              bizItem: backdrop.querySelector('#prof_c_item').value.trim(),
              companyAddress: backdrop.querySelector('#prof_c_addr').value.trim(),
              bankAccount: backdrop.querySelector('#prof_c_bank').value.trim(),
            },
            defaultMarkType: backdrop.querySelector('#prof_mark_type').value,
            defaultStampId: backdrop.querySelector('#prof_stamp_id').value,
            defaultSignatureId: backdrop.querySelector('#prof_sig_id').value,
          };
        }

        backdrop.querySelector('#profClearBtn').addEventListener('click', () => {
          try {
            localStorage.removeItem(PROFILE_KEY);
          } catch (e) {}
          U.showToast('저장된 내 프로필을 모두 삭제했습니다.');
          close();
          if (typeof onAfterSave === 'function') onAfterSave();
        });

        backdrop.querySelector('#profSaveOnlyBtn').addEventListener('click', () => {
          saveProfile(collect());
          U.showToast('내 프로필을 이 브라우저에 저장했습니다.');
          close();
          if (typeof onAfterSave === 'function') onAfterSave();
        });

        backdrop.querySelector('#profSaveApplyBtn').addEventListener('click', () => {
          const nextProfile = collect();
          saveProfile(nextProfile);
          close();
          const targets = meta.profileTargets || [];
          if (targets.length === 1) {
            applyProfileTarget(targets[0], nextProfile, state, stampWidget, setStateFn);
          } else if (targets.length > 1) {
            openProfileRolePicker(targets, nextProfile, state, stampWidget, setStateFn);
          }
          if (typeof onAfterSave === 'function') onAfterSave();
        });
      },
    });
  }

  function openProfileRolePicker(targets, profile, state, stampWidget, setStateFn) {
    const bodyHtml = `
      <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-secondary);">
        이 서식은 당사자 역할이 나뉘어 있습니다. 내 프로필을 어느 위치에 자동 입력할까요?
      </p>
      <div class="role-picker-list">
        ${targets
          .map(
            (t, idx) =>
              `<button type="button" class="role-picker-btn" data-role-idx="${idx}">
                <strong>${U.escapeHtml(t.label)}</strong>
                <span>클릭 즉시 자동 채움 →</span>
              </button>`
          )
          .join('')}
      </div>
    `;
    openModal({
      title: '내 정보 불러오기 — 위치 선택',
      bodyHtml,
      onMount: (backdrop, close) => {
        backdrop.querySelectorAll('[data-role-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-role-idx'));
            close();
            if (targets[idx]) {
              applyProfileTarget(targets[idx], profile, state, stampWidget, setStateFn);
            }
          });
        });
      },
    });
  }

  function triggerProfileFill(formKey, def, state, stampWidget, setStateFn, onAfterSave) {
    const profile = loadProfile();
    if (!hasProfileData(profile)) {
      openProfileModal(formKey, def, state, stampWidget, setStateFn, onAfterSave);
      return;
    }
    const meta = getMeta(formKey, def);
    const targets = meta.profileTargets || [];
    if (targets.length === 1) {
      applyProfileTarget(targets[0], profile, state, stampWidget, setStateFn);
    } else if (targets.length > 1) {
      openProfileRolePicker(targets, profile, state, stampWidget, setStateFn);
    } else {
      openProfileModal(formKey, def, state, stampWidget, setStateFn, onAfterSave);
    }
  }

  /* ========================================================================
     7. Situation-Based 1-Click Narrative Phrase Presets Injection
     ======================================================================== */
  function injectPhrasePresets(editorContainer, formKey, def, api) {
    const meta = getMeta(formKey, def);
    const presets = meta.presets || {};
    Object.keys(presets).forEach((fieldKey) => {
      const list = presets[fieldKey];
      if (!Array.isArray(list) || !list.length) return;
      const inputEl = editorContainer.querySelector(`[data-field="${fieldKey}"]`);
      if (!inputEl) return;
      const fieldWrap = inputEl.closest('.field');
      if (!fieldWrap || fieldWrap.querySelector(`.phrase-preset-bar[data-preset-for="${fieldKey}"]`)) return;

      const bar = document.createElement('div');
      bar.className = 'phrase-preset-bar';
      bar.setAttribute('data-preset-for', fieldKey);
      bar.innerHTML = `
        <span class="phrase-preset-label">✨ 상황별 예시 문구</span>
        <div class="phrase-preset-chips">
          ${list
            .map(
              (item, idx) =>
                `<button type="button" class="phrase-chip-btn" data-pfield="${U.escapeHtml(fieldKey)}" data-pidx="${idx}">${U.escapeHtml(
                  item.label
                )}</button>`
            )
            .join('')}
        </div>
      `;
      inputEl.parentNode.insertBefore(bar, inputEl);

      bar.querySelectorAll('.phrase-chip-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-pidx'));
          const chosen = list[idx];
          if (!chosen) return;
          inputEl.value = chosen.text;
          api.updateField(fieldKey, chosen.text);
          U.showToast(`"${chosen.label}" 실무 문구를 채웠습니다.`);
        });
      });
    });
  }

  /* ========================================================================
     8. Real-Time Legal/Practical Validation + Pre-Print Checklist Modal
     ======================================================================== */
  function evaluateForm(formKey, def, state, stampWidget) {
    const meta = getMeta(formKey, def);
    const alerts = typeof meta.validate === 'function' ? meta.validate(state) || [] : [];
    const missing = [];

    (meta.required || []).forEach((req) => {
      const raw = state[req.field];
      if (req.type === 'money') {
        if (U.parseNumber(raw) <= 0) {
          missing.push({ field: req.field, label: `${req.label} (금액 미입력)` });
        }
      } else if (!raw || !String(raw).trim()) {
        missing.push({ field: req.field, label: req.label });
      }
    });

    const missingMark = Boolean(meta.requireMark && stampWidget && !stampWidget.hasAnyMark());
    if (missingMark) {
      missing.push({ field: '__mark__', label: '도장 또는 자필 서명 날인' });
    }

    const totalChecks = (meta.required || []).length + (meta.requireMark ? 1 : 0);
    const doneChecks = Math.max(0, totalChecks - missing.length);

    return {
      alerts,
      missing,
      missingMark,
      totalChecks,
      doneChecks,
      hasDanger: alerts.some((a) => a.level === 'danger'),
      hasWarn: alerts.some((a) => a.level === 'warn'),
    };
  }

  function renderLiveValidationBar(barEl, formKey, def, state, stampWidget) {
    if (!barEl) return;
    const res = evaluateForm(formKey, def, state, stampWidget);
    const badgeClass =
      res.hasDanger ? 'danger' : res.missing.length === 0 ? 'ok' : 'warn';
    const badgeText =
      res.hasDanger
        ? '법적 경고 확인 필요'
        : res.missing.length === 0
        ? `필수 항목 ${res.doneChecks}/${res.totalChecks} 완료`
        : `필수 항목 ${res.doneChecks}/${res.totalChecks} (누락 ${res.missing.length}건)`;

    const alertsHtml = res.alerts
      .map(
        (a) =>
          `<div class="val-alert-line ${U.escapeHtml(a.level)}">${
            a.level === 'danger' ? '🚨' : a.level === 'warn' ? '⚠' : a.level === 'ok' ? '✓' : '💡'
          } ${U.escapeHtml(a.text)}</div>`
      )
      .join('');

    const missingPreview =
      res.missing.length > 0
        ? `<div class="val-missing-hint">미입력: ${res.missing.map((m) => U.escapeHtml(m.label)).join(', ')}</div>`
        : '';

    barEl.innerHTML = `
      <div class="live-val-card ${badgeClass}">
        <div class="live-val-top">
          <span class="live-val-badge ${badgeClass}">${badgeText}</span>
          <span class="live-val-sub">인쇄·PDF 저장 전 자동 점검</span>
        </div>
        ${alertsHtml}
        ${missingPreview}
      </div>
    `;
  }

  function handlePrintWithChecklist(formKey, def, state, stampWidget, editorContainer) {
    const res = evaluateForm(formKey, def, state, stampWidget);
    const urgentAlerts = res.alerts.filter((a) => a.level === 'danger' || a.level === 'warn');

    if (res.missing.length === 0 && urgentAlerts.length === 0) {
      U.triggerPrint();
      return;
    }

    const alertsHtml = urgentAlerts.length
      ? `<div class="check-group">
          <h4>법적 · 실무 주의사항</h4>
          <ul>${urgentAlerts
            .map((a) => `<li class="chk-${U.escapeHtml(a.level)}">${a.level === 'danger' ? '🚨' : '⚠'} ${U.escapeHtml(a.text)}</li>`)
            .join('')}</ul>
        </div>`
      : '';

    const missingHtml = res.missing.length
      ? `<div class="check-group">
          <h4>미입력 필수 항목 (${res.missing.length}건)</h4>
          <ul>${res.missing.map((m) => `<li class="chk-miss">• ${U.escapeHtml(m.label)}</li>`).join('')}</ul>
        </div>`
      : '';

    openModal({
      title: '인쇄 / PDF 저장 전 필수 항목 확인',
      subtitle: '빠진 항목이나 법적 주의사항이 감지되었습니다. 보완하거나 그대로 인쇄할 수 있습니다.',
      bodyHtml: `${alertsHtml}${missingHtml}<p class="field-help" style="margin:10px 0 0;">※ 출력 후 자필로 기입·날인하실 예정이라면 '그대로 인쇄'를 눌러 진행하시면 됩니다.</p>`,
      footerHtml: `
        <button type="button" class="btn btn-outline btn-sm" id="chkBackFixBtn">돌아가서 보완하기</button>
        <button type="button" class="btn btn-primary btn-sm" id="chkPrintAnywayBtn">그대로 A4 인쇄 / PDF 저장</button>
      `,
      onMount: (backdrop, close) => {
        backdrop.querySelector('#chkBackFixBtn').addEventListener('click', () => {
          close();
          if (res.missing.length > 0 && editorContainer) {
            const first = res.missing[0];
            if (first.field === '__mark__') {
              const sw = document.getElementById('stampWidgetContainer');
              if (sw) sw.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              const targetEl = editorContainer.querySelector(`[data-field="${first.field}"]`);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.focus();
              }
            }
          }
        });
        backdrop.querySelector('#chkPrintAnywayBtn').addEventListener('click', () => {
          close();
          U.triggerPrint();
        });
      },
    });
  }

  /* ========================================================================
     9. High-Resolution A4 PNG Image Export via html2canvas (scale: 2, #fff)
     Captures exact A4 DOM (210mm x 297mm, tables, borders, fonts, stamps,
     handwritten signatures) with transform: none on an unscaled clone.
     ======================================================================== */
  let html2canvasLoadPromise = null;

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        s.remove();
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(s);
    });
  }

  function ensureHtml2Canvas() {
    if (typeof window.html2canvas === 'function') {
      return Promise.resolve(window.html2canvas);
    }
    if (!html2canvasLoadPromise) {
      html2canvasLoadPromise = loadScriptOnce('/assets/js/vendor/html2canvas.min.js')
        .catch(() => loadScriptOnce('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'))
        .then(() => {
          if (typeof window.html2canvas !== 'function') {
            throw new Error('html2canvas unavailable');
          }
          return window.html2canvas;
        })
        .catch((err) => {
          html2canvasLoadPromise = null;
          throw err;
        });
    }
    return html2canvasLoadPromise;
  }

  async function waitForCloneAssets(clone) {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {}
    }
    const imgs = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 1500);
        });
      })
    );
  }

  async function captureSheetAsCanvas(sheet) {
    const h2c = await ensureHtml2Canvas();

    // Mount unscaled A4 clone directly under body (zero transform: scale ancestor)
    const host = document.createElement('div');
    host.className = 'baro-png-capture-host no-print';
    host.style.cssText =
      'position:fixed;left:-10000px;top:0;width:210mm;height:297mm;margin:0;padding:0;' +
      'background:#ffffff;transform:none;overflow:visible;pointer-events:none;z-index:-1;';

    const clone = sheet.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.width = '210mm';
    clone.style.height = '297mm';
    clone.style.minHeight = '297mm';
    clone.style.maxHeight = '297mm';
    clone.style.background = '#ffffff';

    // Ensure transparent signature/stamp overlays render cleanly without blend-mode artifacts
    clone.querySelectorAll('.stamp-overlay, .sig-overlay').forEach((img) => {
      img.style.mixBlendMode = 'normal';
    });

    host.appendChild(clone);
    document.body.appendChild(host);

    try {
      await waitForCloneAssets(clone);
      // Let layout settle for 1 animation frame
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Bake exact pixel center for stamps/signatures so html2canvas never miscomputes translate(-50%, -50%)
      clone.querySelectorAll('.stamp-overlay').forEach((img) => {
        const anchor = img.parentElement;
        if (!anchor) return;
        const aRect = anchor.getBoundingClientRect();
        const iRect = img.getBoundingClientRect();
        const w = Math.round(iRect.width);
        const h = Math.round(iRect.height);
        if (w > 0 && h > 0) {
          const left = Math.round((aRect.width - w) / 2);
          const top = Math.round((aRect.height - h) / 2);
          img.style.setProperty('transform', 'none', 'important');
          img.style.setProperty('left', `${left}px`, 'important');
          img.style.setProperty('top', `${top}px`, 'important');
          img.style.setProperty('width', `${w}px`, 'important');
          img.style.setProperty('height', `${h}px`, 'important');
          img.style.setProperty('max-width', 'none', 'important');
          img.style.setProperty('max-height', 'none', 'important');
        }
        img.style.mixBlendMode = 'normal';
      });

      const rect = clone.getBoundingClientRect();
      const targetW = Math.round(rect.width) || 794;
      const targetH = Math.round(rect.height) || 1123;

      const canvas = await h2c(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: targetW,
        height: targetH,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.max(1200, targetW + 40),
        windowHeight: Math.max(1400, targetH + 40),
      });
      return canvas;
    } finally {
      host.remove();
    }
  }

  function downloadCanvasAsPng(canvas, filename) {
    return new Promise((resolve) => {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            resolve();
            return;
          }
          SE.downloadDataUrl(canvas.toDataURL('image/png'), filename);
          resolve();
        }, 'image/png');
      } else {
        SE.downloadDataUrl(canvas.toDataURL('image/png'), filename);
        resolve();
      }
    });
  }

  async function exportA4ToPng(formKey) {
    const sheets = document.querySelectorAll('#a4PreviewTarget .a4-sheet');
    if (!sheets.length) {
      U.showToast('저장할 A4 미리보기 문서를 찾을 수 없습니다.');
      return;
    }

    const buttons = Array.from(document.querySelectorAll('[data-png-export]'));
    buttons.forEach((b) => {
      b.disabled = true;
    });
    U.showToast('고해상도 A4 PNG 이미지를 생성하고 있습니다...', 2200);

    try {
      for (let idx = 0; idx < sheets.length; idx++) {
        const canvas = await captureSheetAsCanvas(sheets[idx]);
        const suffix = sheets.length > 1 ? `-p${idx + 1}` : '';
        await downloadCanvasAsPng(canvas, `baroseosik-${formKey}${suffix}-${U.todayISO()}.png`);
      }
      U.showToast(`고해상도 A4 PNG 이미지(${sheets.length}매)를 저장했습니다.`);
    } catch (err) {
      U.showToast('PNG 이미지 생성 중 오류가 발생했습니다. 다시 시도하거나 A4 PDF 저장을 이용해 주세요.', 4000);
    } finally {
      buttons.forEach((b) => {
        b.disabled = false;
      });
    }
  }

  /* ========================================================================
     10. Share Link Copy UX (Clipboard + Fallback Modal)
     ======================================================================== */
  async function triggerShareCopy(formKey, state, initialData, fontMode, stampWidget) {
    try {
      const url = await createShareUrl(formKey, state, initialData, fontMode, stampWidget);
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch (e) {}
      }

      if (copied) {
        U.showToast('상대방 입력 요청 링크가 복사되었습니다! 카카오톡·문자로 바로 보내세요. (서버 전송 없음)', 4200);
      }

      // Also offer a quick confirmation/manual-copy modal if clipboard failed or URL is long
      if (!copied) {
        openModal({
          title: '상대방 입력 · 서명 요청 링크',
          subtitle: '입력하신 내용과 도장/서명이 링크 주소(#d=)에만 담깁니다. 서버에는 전혀 저장되지 않습니다.',
          bodyHtml: `
            <div class="field">
              <label>공유 링크 (전체 선택 후 복사해 전달하세요)</label>
              <textarea id="shareLinkCopyBox" readonly style="min-height:86px;font-size:12px;word-break:break-all;">${U.escapeHtml(url)}</textarea>
            </div>
            <p class="field-help" style="margin:6px 0 0;">상대방이 이 링크를 열면 내 정보는 채워진 상태로 본인 정보와 서명·도장만 추가해 바로 PDF 저장할 수 있습니다.</p>
          `,
          footerHtml: `<button type="button" class="btn btn-primary btn-sm" id="shareManualCopyBtn">링크 복사하기</button>`,
          onMount: (backdrop, close) => {
            const ta = backdrop.querySelector('#shareLinkCopyBox');
            ta.select();
            backdrop.querySelector('#shareManualCopyBtn').addEventListener('click', () => {
              ta.select();
              try {
                document.execCommand('copy');
                U.showToast('상대방 입력 요청 링크를 복사했습니다.');
              } catch (e) {}
              close();
            });
          },
        });
      }
      return url;
    } catch (e) {
      U.showToast('링크 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return '';
    }
  }

  window.BaroPlatform = {
    FORM_META,
    getMeta,
    compileSchema,
    calcLineTotals,
    valOrEmpty,
    renderTradeChainBar,
    consumeTradeChainIfRequested,
    loadProfile,
    saveProfile,
    hasProfileData,
    openProfileModal,
    triggerProfileFill,
    injectPhrasePresets,
    evaluateForm,
    renderLiveValidationBar,
    handlePrintWithChecklist,
    createShareUrl,
    readShareHash,
    triggerShareCopy,
    captureSheetAsCanvas,
    exportA4ToPng,
    openModal,
    closeActiveModal,
  };
})(window);
