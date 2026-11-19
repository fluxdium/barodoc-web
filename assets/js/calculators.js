/* ==========================================================================
   바로문서 (BaroDoc) — 3 Free Korean Practical Calculators
   1. 부가세 계산기 (/calc/vat/)
   2. 연차 계산기 (/calc/annual-leave/)
   3. 중개수수료(복비) 계산기 (/calc/brokerage/)
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;

  function copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => U.showToast(`${label} (${text}) 복사되었습니다.`),
        () => U.showToast('복사에 실패했습니다. 직접 선택해 복사해 주세요.')
      );
    } else {
      U.showToast(`${label}: ${text}`);
    }
  }

  /* ========================================================================
     1. 부가세 계산기 (/calc/vat/)
     ======================================================================== */
  function initVatCalculator() {
    const root = document.getElementById('vatCalcApp');
    if (!root) return;

    let mode = 'exclude'; // exclude (공급가액->합계) | include (합계->역산)
    const inputAmt = document.getElementById('vatAmount');
    const elHeroLabel = document.getElementById('vatHeroLabel');
    const elHeroVal = document.getElementById('vatHeroVal');
    const elHeroKor = document.getElementById('vatHeroKor');
    const elSupply = document.getElementById('vatSupplyVal');
    const elVat = document.getElementById('vatTaxVal');
    const elTotal = document.getElementById('vatTotalVal');
    const elFreelanceNet = document.getElementById('vatFreelanceNet');
    const elFreelanceTax = document.getElementById('vatFreelanceTax');
    const elInputLabel = document.getElementById('vatInputLabel');

    let latest = { supply: 0, vat: 0, total: 0 };

    function render() {
      const raw = Math.max(0, Math.floor(U.parseNumber(inputAmt.value)));
      let supply = 0;
      let vat = 0;
      let total = 0;

      if (mode === 'exclude') {
        supply = raw;
        vat = Math.round(raw * 0.1);
        total = supply + vat;
        if (elInputLabel) elInputLabel.textContent = '공급가액 입력 (부가세 별도 금액, 원)';
        if (elHeroLabel) elHeroLabel.textContent = '부가세 포함 총 합계금액 (공급대가)';
        if (elHeroVal) elHeroVal.textContent = `${U.formatNumber(total)}원`;
        if (elHeroKor) elHeroKor.textContent = `${U.formatKoreanCurrency(total)} / ${U.formatHanjaCurrency(total)}`;
      } else {
        total = raw;
        supply = Math.round(raw / 1.1);
        vat = total - supply;
        if (elInputLabel) elInputLabel.textContent = '합계금액 입력 (부가세 포함 금액, 원)';
        if (elHeroLabel) elHeroLabel.textContent = '역산된 공급가액 + 부가가치세 (10%)';
        if (elHeroVal) elHeroVal.textContent = `공급가액 ${U.formatNumber(supply)}원`;
        if (elHeroKor) elHeroKor.textContent = `부가세 ${U.formatNumber(vat)}원 · 합계 ${U.formatKoreanCurrency(total)}`;
      }

      latest = { supply, vat, total };
      if (elSupply) elSupply.textContent = `${U.formatNumber(supply)}원`;
      if (elVat) elVat.textContent = `${U.formatNumber(vat)}원`;
      if (elTotal) elTotal.textContent = `${U.formatNumber(total)}원`;

      // 참고: 개인 프리랜서 3.3% 원천징수 기준 (입력액 기준)
      const fTax = Math.floor(raw * 0.033);
      const fNet = raw - fTax;
      if (elFreelanceTax) elFreelanceTax.textContent = `${U.formatNumber(fTax)}원`;
      if (elFreelanceNet) elFreelanceNet.textContent = `${U.formatNumber(fNet)}원`;
    }

    root.querySelectorAll('[data-vat-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.getAttribute('data-vat-mode');
        root.querySelectorAll('[data-vat-mode]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-vat-mode') === mode);
        });
        render();
      });
    });

    root.querySelectorAll('[data-add-amt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const add = Number(btn.getAttribute('data-add-amt'));
        if (add === 0) {
          inputAmt.value = '';
        } else {
          inputAmt.value = String(Math.max(0, U.parseNumber(inputAmt.value)) + add);
        }
        render();
      });
    });

    if (inputAmt) inputAmt.addEventListener('input', render);

    root.querySelectorAll('[data-copy-vat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const which = btn.getAttribute('data-copy-vat');
        if (which === 'supply') copyText(U.formatNumber(latest.supply), '공급가액');
        if (which === 'vat') copyText(U.formatNumber(latest.vat), '부가세');
        if (which === 'total') copyText(U.formatNumber(latest.total), '합계금액');
      });
    });

    render();
  }

  /* ========================================================================
     2. 연차 계산기 (/calc/annual-leave/)
     ======================================================================== */
  function initAnnualLeaveCalculator() {
    const root = document.getElementById('annualCalcApp');
    if (!root) return;

    const elJoin = document.getElementById('alJoinDate');
    const elBase = document.getElementById('alBaseDate');
    const elMonthly = document.getElementById('alMonthlyWage');
    const elUnused = document.getElementById('alUnusedDays');
    const elHeroVal = document.getElementById('alHeroVal');
    const elHeroSub = document.getElementById('alHeroSub');
    const elTenureVal = document.getElementById('alTenureVal');
    const elYearDaysVal = document.getElementById('alYearDaysVal');
    const elPayVal = document.getElementById('alPayVal');
    const elTableBody = document.getElementById('alTableBody');
    const elFiscalNote = document.getElementById('alFiscalNote');

    let basis = 'join'; // join (입사일 기준) | fiscal (회계연도 1월1일 기준)

    if (elBase && !elBase.value) elBase.value = U.todayISO();
    if (elJoin && !elJoin.value) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 2);
      d.setMonth(2);
      d.setDate(2);
      elJoin.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function fullMonthsBetween(start, end) {
      let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (end.getDate() < start.getDate()) months -= 1;
      return Math.max(0, months);
    }

    function fullYearsBetween(start, end) {
      let years = end.getFullYear() - start.getFullYear();
      const m = end.getMonth() - start.getMonth();
      if (m < 0 || (m === 0 && end.getDate() < start.getDate())) years -= 1;
      return Math.max(0, years);
    }

    function leaveForCompletedYears(years) {
      if (years < 1) return 0;
      return Math.min(25, 15 + Math.floor((years - 1) / 2));
    }

    function render() {
      const joinIso = elJoin.value;
      const baseIso = elBase.value || U.todayISO();
      const join = new Date(joinIso + 'T00:00:00');
      const base = new Date(baseIso + 'T00:00:00');

      if (!joinIso || isNaN(join.getTime()) || isNaN(base.getTime()) || base < join) {
        if (elHeroVal) elHeroVal.textContent = '날짜를 확인해 주세요';
        if (elHeroSub) elHeroSub.textContent = '기준일은 입사일과 같거나 이후 날짜여야 합니다.';
        if (elTableBody) elTableBody.innerHTML = '';
        return;
      }

      const totalMonths = fullMonthsBetween(join, base);
      const years = fullYearsBetween(join, base);
      const tenureStr = U.calcTenure(joinIso, baseIso) || '입사 당일';

      let currentAnnualDays = 0;
      let subMsg = '';
      const rows = [];

      if (basis === 'join') {
        // 입사일 기준 (근로기준법 제60조 원칙)
        if (years < 1) {
          currentAnnualDays = Math.min(11, totalMonths);
          subMsg = `입사 1년 미만 · 경과 개근 월수(${totalMonths}개월) 기준 월차 최대 11일 발생`;
        } else {
          currentAnnualDays = leaveForCompletedYears(years);
          subMsg = `근속 ${years}년차 (${years + 1}년차 사용분) · 1년 80% 이상 출근 가정`;
        }

        // 연차 발생 이력 표 생성
        const firstYearDays = years < 1 ? Math.min(11, totalMonths) : 11;
        rows.push({
          label: '1년 미만 (월차)',
          period: `${U.formatKoreanDate(joinIso)} ~ 만 1년 전`,
          days: `${firstYearDays}일`,
          note: '1개월 개근 시 1일 (최대 11일)',
        });

        const maxYearToShow = Math.max(years, 1);
        for (let y = 1; y <= Math.min(maxYearToShow + 1, 22); y++) {
          const grantDate = new Date(join);
          grantDate.setFullYear(join.getFullYear() + y);
          const grantIso = `${grantDate.getFullYear()}-${String(grantDate.getMonth() + 1).padStart(2, '0')}-${String(grantDate.getDate()).padStart(2, '0')}`;
          const days = leaveForCompletedYears(y);
          const isCurrent = y === years;
          const isFuture = grantDate > base;
          rows.push({
            label: `${y}년 만근 (${y + 1}년차)`,
            period: `${U.formatKoreanDate(grantIso)} 발생`,
            days: `${days}일`,
            note: isCurrent ? '현재 적용 연차' : isFuture ? '예정 연차' : '이전 발생분',
          });
        }

        if (elFiscalNote) {
          elFiscalNote.textContent = '근로기준법 제60조 원칙(입사일 기준)으로 계산되었습니다. 상시 5인 이상 사업장에 적용됩니다.';
        }
      } else {
        // 회계연도 (매년 1월 1일) 기준
        const joinYear = join.getFullYear();
        const baseYear = base.getFullYear();
        const yearDiff = baseYear - joinYear;

        if (yearDiff === 0) {
          currentAnnualDays = Math.min(11, totalMonths);
          subMsg = `${baseYear}년 중도 입사 · 당해 연도 월차(${currentAnnualDays}일) 발생`;
        } else if (yearDiff === 1) {
          const yearStart = new Date(joinYear, 0, 1);
          const yearEnd = new Date(joinYear, 11, 31);
          const daysInYear = Math.round((yearEnd - yearStart) / 86400000) + 1;
          const workedDays = Math.round((yearEnd - join) / 86400000) + 1;
          const prorated = Math.round((15 * (workedDays / daysInYear)) * 10) / 10;
          currentAnnualDays = prorated;
          subMsg = `${baseYear}년 1월 1일 비례 부여 (${joinYear}년 재직 ${workedDays}일/${daysInYear}일 기준)`;
        } else {
          currentAnnualDays = leaveForCompletedYears(yearDiff - 1);
          subMsg = `${baseYear}년 1월 1일 일괄 부여 (회계연도 기준 ${yearDiff}번째 해)`;
        }

        const yearStart = new Date(joinYear, 0, 1);
        const yearEnd = new Date(joinYear, 11, 31);
        const daysInYear = Math.round((yearEnd - yearStart) / 86400000) + 1;
        const workedDays = Math.round((yearEnd - join) / 86400000) + 1;
        const prorated = Math.round((15 * (workedDays / daysInYear)) * 10) / 10;

        rows.push({
          label: `${joinYear}년 (입사 연도)`,
          period: `${U.formatKoreanDate(joinIso)} ~ ${joinYear}.12.31`,
          days: `${Math.min(11, fullMonthsBetween(join, new Date(Math.min(base.getTime(), yearEnd.getTime()))))}일`,
          note: '입사 1년 미만 월차 (월 1일)',
        });
        rows.push({
          label: `${joinYear + 1}년 1월 1일`,
          period: `${joinYear + 1}년 01월 01일 부여`,
          days: `${prorated}일`,
          note: `전년 재직일수 비례 (15일 × ${workedDays}/${daysInYear})`,
        });

        for (let y = joinYear + 2; y <= Math.min(baseYear + 1, joinYear + 21); y++) {
          const d = leaveForCompletedYears(y - joinYear - 1);
          rows.push({
            label: `${y}년 1월 1일`,
            period: `${y}년 01월 01일 부여`,
            days: `${d}일`,
            note: y === baseYear ? '현재 연도 적용' : y > baseYear ? '내년 예정' : '이전 부여분',
          });
        }

        if (elFiscalNote) {
          elFiscalNote.textContent = '회계연도(1월 1일) 기준은 회사 편의용 방식이며, 퇴사 시 입사일 기준보다 연차가 적다면 더 유리한 입사일 기준으로 정산받아야 합니다.';
        }
      }

      // 미사용 연차수당 예상액 (월 통상임금 / 209시간 * 8시간 * 미사용 일수)
      const monthlyWage = Math.max(0, U.parseNumber(elMonthly ? elMonthly.value : 0));
      const unusedDays = Math.max(0, U.parseNumber(elUnused ? elUnused.value : 0));
      const dailyWage = monthlyWage > 0 ? Math.round((monthlyWage / 209) * 8) : 0;
      const estimatedPay = Math.round(dailyWage * unusedDays);

      if (elHeroVal) elHeroVal.textContent = `총 ${currentAnnualDays}일`;
      if (elHeroSub) elHeroSub.textContent = subMsg;
      if (elTenureVal) elTenureVal.textContent = tenureStr;
      if (elYearDaysVal) elYearDaysVal.textContent = `${currentAnnualDays}일`;
      if (elPayVal) elPayVal.textContent = estimatedPay > 0 ? `${U.formatNumber(estimatedPay)}원` : '0원';

      if (elTableBody) {
        elTableBody.innerHTML = rows
          .map(
            (r) => `
            <tr>
              <td><strong>${U.escapeHtml(r.label)}</strong></td>
              <td>${U.escapeHtml(r.period)}</td>
              <td style="font-weight:800;color:var(--brand-navy);">${U.escapeHtml(r.days)}</td>
              <td>${U.escapeHtml(r.note)}</td>
            </tr>
          `
          )
          .join('');
      }
    }

    root.querySelectorAll('[data-al-basis]').forEach((btn) => {
      btn.addEventListener('click', () => {
        basis = btn.getAttribute('data-al-basis');
        root.querySelectorAll('[data-al-basis]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-al-basis') === basis);
        });
        render();
      });
    });

    [elJoin, elBase, elMonthly, elUnused].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });

    render();
  }

  /* ========================================================================
     3. 부동산 중개수수료(복비) 계산기 (/calc/brokerage/)
     ======================================================================== */
  function initBrokerageCalculator() {
    const root = document.getElementById('brokerageCalcApp');
    if (!root) return;

    let propType = 'house'; // house | officetel | commercial
    let dealType = 'sale'; // sale | jeonse | monthly

    const elPriceWrap = document.getElementById('brkPriceWrap');
    const elMonthlyWrap = document.getElementById('brkMonthlyWrap');
    const elPriceLabel = document.getElementById('brkPriceLabel');
    const elPrice = document.getElementById('brkPrice'); // 만원 단위
    const elMonthlyRent = document.getElementById('brkMonthlyRent'); // 만원 단위
    const elCustomRate = document.getElementById('brkCustomRate');
    const elVatType = document.getElementById('brkVatType');

    const elHeroVal = document.getElementById('brkHeroVal');
    const elHeroSub = document.getElementById('brkHeroSub');
    const elBaseFee = document.getElementById('brkBaseFee');
    const elVatFee = document.getElementById('brkVatFee');
    const elRateApplied = document.getElementById('brkRateApplied');
    const elRuleNote = document.getElementById('brkRuleNote');

    function getMaxRateAndCap(pType, dType, amountWon) {
      if (pType === 'commercial') {
        return { rate: 0.9, cap: null, desc: '상가·토지·업무용 오피스텔: 상한요율 0.9% 이내 협의' };
      }
      if (pType === 'officetel') {
        if (dType === 'sale') {
          return { rate: 0.5, cap: null, desc: '주거용 오피스텔(전용 85㎡ 이하) 매매: 상한요율 0.5%' };
        }
        return { rate: 0.4, cap: null, desc: '주거용 오피스텔(전용 85㎡ 이하) 임대차: 상한요율 0.4%' };
      }

      // 주택 (아파트·빌라·단독)
      const EOK = 100000000;
      const MAN = 10000;
      if (dType === 'sale') {
        if (amountWon < 5000 * MAN) return { rate: 0.6, cap: 25 * MAN, desc: '주택 매매 5천만 원 미만 (상한 0.6%, 한도 25만 원)' };
        if (amountWon < 2 * EOK) return { rate: 0.5, cap: 80 * MAN, desc: '주택 매매 5천만~2억 미만 (상한 0.5%, 한도 80만 원)' };
        if (amountWon < 9 * EOK) return { rate: 0.4, cap: null, desc: '주택 매매 2억~9억 미만 (상한 0.4%)' };
        if (amountWon < 12 * EOK) return { rate: 0.5, cap: null, desc: '주택 매매 9억~12억 미만 (상한 0.5%)' };
        if (amountWon < 15 * EOK) return { rate: 0.6, cap: null, desc: '주택 매매 12억~15억 미만 (상한 0.6%)' };
        return { rate: 0.7, cap: null, desc: '주택 매매 15억 이상 (상한 0.7% 이내 협의)' };
      } else {
        if (amountWon < 5000 * MAN) return { rate: 0.5, cap: 20 * MAN, desc: '주택 임대차 5천만 원 미만 (상한 0.5%, 한도 20만 원)' };
        if (amountWon < 1 * EOK) return { rate: 0.4, cap: 30 * MAN, desc: '주택 임대차 5천만~1억 미만 (상한 0.4%, 한도 30만 원)' };
        if (amountWon < 6 * EOK) return { rate: 0.3, cap: null, desc: '주택 임대차 1억~6억 미만 (상한 0.3%)' };
        if (amountWon < 12 * EOK) return { rate: 0.4, cap: null, desc: '주택 임대차 6억~12억 미만 (상한 0.4%)' };
        if (amountWon < 15 * EOK) return { rate: 0.5, cap: null, desc: '주택 임대차 12억~15억 미만 (상한 0.5%)' };
        return { rate: 0.6, cap: null, desc: '주택 임대차 15억 이상 (상한 0.6% 이내 협의)' };
      }
    }

    function syncUI() {
      if (elMonthlyWrap) elMonthlyWrap.style.display = dealType === 'monthly' ? 'block' : 'none';
      if (elPriceLabel) {
        elPriceLabel.textContent =
          dealType === 'sale'
            ? '매매가 (만 원 단위 입력)'
            : dealType === 'jeonse'
            ? '전세 보증금 (만 원 단위 입력)'
            : '월세 보증금 (만 원 단위 입력)';
      }
    }

    function render() {
      syncUI();
      const priceMan = Math.max(0, U.parseNumber(elPrice ? elPrice.value : 0));
      const rentMan = Math.max(0, U.parseNumber(elMonthlyRent ? elMonthlyRent.value : 0));

      let calcAmountWon = priceMan * 10000;
      let conversionNote = '';

      if (dealType === 'monthly') {
        let converted = (priceMan + rentMan * 100) * 10000;
        if (converted < 50000000) {
          converted = (priceMan + rentMan * 70) * 10000;
          conversionNote = `월세 환산보증금 5천만 원 미만 특례 적용: 보증금 + (월세 × 70) = ${U.formatNumber(converted)}원`;
        } else {
          conversionNote = `월세 환산보증금: 보증금 + (월세 × 100) = ${U.formatNumber(converted)}원`;
        }
        calcAmountWon = converted;
      }

      const rule = getMaxRateAndCap(propType, dealType, calcAmountWon);
      const customRaw = elCustomRate ? elCustomRate.value.trim() : '';
      const customRate = customRaw !== '' ? Math.max(0, U.parseNumber(customRaw)) : null;
      const usedRate = customRate !== null ? Math.min(customRate, rule.rate) : rule.rate;

      let fee = Math.round(calcAmountWon * (usedRate / 100));
      let capApplied = false;
      if (rule.cap !== null && fee > rule.cap) {
        fee = rule.cap;
        capApplied = true;
      }

      const vatMode = elVatType ? elVatType.value : 'general';
      let vat = 0;
      if (vatMode === 'general') vat = Math.round(fee * 0.1);
      else if (vatMode === 'simplified') vat = Math.round(fee * 0.04); // 간이과세자 부가가치율 40% 참고 (최대 4% 수준)
      else vat = 0;

      const total = fee + vat;

      if (elHeroVal) elHeroVal.textContent = `${U.formatNumber(total)}원`;
      if (elHeroSub) {
        elHeroSub.textContent = `${U.formatKoreanCurrency(total)} (중개보수 ${U.formatNumber(fee)}원 + 부가세 ${U.formatNumber(vat)}원)`;
      }
      if (elBaseFee) elBaseFee.textContent = `${U.formatNumber(fee)}원`;
      if (elVatFee) elVatFee.textContent = `${U.formatNumber(vat)}원`;
      if (elRateApplied) elRateApplied.textContent = `${usedRate}%${capApplied ? ' (한도적용)' : ''}`;

      if (elRuleNote) {
        const parts = [rule.desc];
        if (conversionNote) parts.push(conversionNote);
        if (capApplied) parts.push(`법정 한도액(${U.formatNumber(rule.cap)}원)이 적용되어 초과 금액이 절감되었습니다.`);
        if (customRate !== null && customRate > rule.rate) {
          parts.push(`입력하신 요율(${customRate}%)이 법정 상한(${rule.rate}%)을 초과하여 상한요율로 자동 제한되었습니다.`);
        }
        elRuleNote.innerHTML = parts.map((p) => `<div>• ${U.escapeHtml(p)}</div>`).join('');
      }
    }

    root.querySelectorAll('[data-prop-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        propType = btn.getAttribute('data-prop-type');
        root.querySelectorAll('[data-prop-type]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-prop-type') === propType);
        });
        render();
      });
    });

    root.querySelectorAll('[data-deal-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        dealType = btn.getAttribute('data-deal-type');
        root.querySelectorAll('[data-deal-type]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-deal-type') === dealType);
        });
        render();
      });
    });

    root.querySelectorAll('[data-add-man]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const add = Number(btn.getAttribute('data-add-man'));
        if (add === 0) elPrice.value = '';
        else elPrice.value = String(Math.max(0, U.parseNumber(elPrice.value)) + add);
        render();
      });
    });

    [elPrice, elMonthlyRent, elCustomRate, elVatType].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initVatCalculator();
    initAnnualLeaveCalculator();
    initBrokerageCalculator();
  });
})(window);
