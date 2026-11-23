/* ==========================================================================
   바로서식 (BaroDoc) — 3 Free Korean Practical Calculators
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
    const elBaseLabel = document.getElementById('alBaseDateLabel');
    const elMonthly = document.getElementById('alMonthlyWage');
    const elUnused = document.getElementById('alUnusedDays');
    const elHeroLabel = document.getElementById('alHeroLabel');
    const elHeroVal = document.getElementById('alHeroVal');
    const elHeroSub = document.getElementById('alHeroSub');
    const elTenureVal = document.getElementById('alTenureVal');
    const elYearDaysVal = document.getElementById('alYearDaysVal');
    const elPayVal = document.getElementById('alPayVal');
    const elTableBody = document.getElementById('alTableBody');
    const elFiscalNote = document.getElementById('alFiscalNote');
    const elStatusAlert = document.getElementById('alStatusAlert');

    let basis = 'join'; // join (입사일 기준) | fiscal (회계연도 1월1일 기준)
    let empStatus = 'active'; // active (재직 중) | retired (퇴직일 기준)

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

    function addYears(date, n) {
      const d = new Date(date.getTime());
      const origMonth = d.getMonth();
      d.setFullYear(d.getFullYear() + n);
      if (d.getMonth() !== origMonth) d.setDate(0);
      return d;
    }

    function isExactAnniversary(start, end, years) {
      if (years < 1) return false;
      return addYears(start, years).getTime() === end.getTime();
    }

    function leaveForCompletedYears(years) {
      if (years < 1) return 0;
      return Math.min(25, 15 + Math.floor((years - 1) / 2));
    }

    function render() {
      if (elBaseLabel) {
        elBaseLabel.textContent =
          empStatus === 'retired'
            ? '퇴직일 (마지막 근무일의 다음 날)'
            : '계산 기준일 (재직 중 · 오늘/조회일)';
      }
      if (elHeroLabel) {
        elHeroLabel.textContent =
          empStatus === 'retired'
            ? '퇴직일 기준 인정 연차유급휴가'
            : '기준일 현재 발생 연차유급휴가';
      }

      const joinIso = elJoin.value;
      const baseIso = elBase.value || U.todayISO();
      const join = new Date(joinIso + 'T00:00:00');
      const base = new Date(baseIso + 'T00:00:00');

      if (!joinIso || isNaN(join.getTime()) || isNaN(base.getTime()) || base < join) {
        if (elHeroVal) elHeroVal.textContent = '날짜를 확인해 주세요';
        if (elHeroSub) elHeroSub.textContent = '기준일은 입사일과 같거나 이후 날짜여야 합니다.';
        if (elTableBody) elTableBody.innerHTML = '';
        if (elStatusAlert) elStatusAlert.style.display = 'none';
        return;
      }

      const totalMonths = fullMonthsBetween(join, base);
      const years = fullYearsBetween(join, base);
      const exactAnniv = isExactAnniversary(join, base, years);
      const tenureStr = U.calcTenure(joinIso, baseIso) || '입사 당일';

      let currentAnnualDays = 0;
      let subMsg = '';
      let alertHtml = '';
      const rows = [];

      if (basis === 'join') {
        // 입사일 기준 (근로기준법 제60조 원칙 + 대법원 2021다227100 판결)
        if (years < 1) {
          currentAnnualDays = Math.min(11, totalMonths);
          subMsg = `입사 1년 미만 · 경과 개근 월수(${totalMonths}개월) 기준 월차 최대 11일 발생`;
        } else if (empStatus === 'retired' && exactAnniv) {
          // 정확히 만 N년(예: 1년=365일)만 근무하고 퇴직한 경우: (N+1)년차 연차 미발생
          if (years === 1) {
            currentAnnualDays = 11;
            subMsg = '정확히 만 1년(365일) 근무 후 퇴직 · 2년차 15일 미발생, 1년 미만 월차 최대 11일만 인정';
            alertHtml =
              '<strong>만 1년 정각 퇴직 경계 적용 (고용노동부 행정해석 · 대법원 2021다227100):</strong> 정확히 만 1년(365일)만 근무하고 계약이 종료·퇴직하면 2년차 연차 15일은 발생하지 않으며 1년 미만 월차(최대 11일)만 인정됩니다. 15일 연차를 받으려면 <strong>366일째까지 근로관계가 유지</strong>(퇴직일이 1일 더 이후)되어야 합니다.';
          } else {
            currentAnnualDays = leaveForCompletedYears(years - 1);
            subMsg = `정확히 만 ${years}년 근무 후 퇴직 · ${years + 1}년차 신규 연차(${leaveForCompletedYears(years)}일) 미발생`;
            alertHtml = `<strong>만 ${years}년 정각 퇴직 경계 적용:</strong> 대법원 판례 및 고용노동부 해석에 따라 퇴직일 당일 새로 도래하는 ${years + 1}년차 연차(${leaveForCompletedYears(years)}일)는 다음 해 근로관계가 유지되지 않으므로 발생하지 않습니다.`;
          }
        } else {
          currentAnnualDays = leaveForCompletedYears(years);
          if (empStatus === 'active' && years === 1 && exactAnniv) {
            subMsg = `만 1년 완료(366일째 재직 중) · 2년차 연차 15일 발생 (단, 오늘 퇴직 시 15일 미발생)`;
            alertHtml =
              '<strong>1년 경계 안내:</strong> 현재 <em>재직 중</em>이므로 만 1년 완료에 따른 15일이 발생합니다. 만약 오늘을 퇴직일(365일 근무 종료)로 계약이 끝난다면 상단에서 <strong>‘퇴직 예정·퇴사 정산’</strong>을 선택해 확인하세요.';
          } else {
            subMsg = `근속 ${years}년차 (${years + 1}년차 사용분) · 1년 80% 이상 출근 가정`;
          }
        }

        // 연차 발생 이력 표 생성
        const firstYearDays = years < 1 ? Math.min(11, totalMonths) : 11;
        rows.push({
          label: '1년 미만 (월차)',
          period: `${U.formatKoreanDate(joinIso)} ~ 만 1년 전`,
          days: `${firstYearDays}일`,
          note: empStatus === 'retired' && exactAnniv && years === 1 ? '만 1년 정각 퇴직 시 인정분' : '1개월 개근 시 1일 (최대 11일)',
        });

        const maxYearToShow = Math.max(years, 1);
        for (let y = 1; y <= Math.min(maxYearToShow + 1, 22); y++) {
          const grantDate = addYears(join, y);
          const grantIso = `${grantDate.getFullYear()}-${String(grantDate.getMonth() + 1).padStart(2, '0')}-${String(grantDate.getDate()).padStart(2, '0')}`;
          const days = leaveForCompletedYears(y);
          let noteText = '이전 발생분';
          if (empStatus === 'retired' && exactAnniv && y === years) {
            noteText = '퇴직 경계 미발생 (다음 날 미근무)';
          } else if (empStatus === 'retired' && exactAnniv && y === years - 1) {
            noteText = '최종 발생 적용 연차';
          } else if (y === years) {
            noteText = empStatus === 'retired' ? '퇴직 전 최종 발생 연차' : '현재 적용 연차';
          } else if (grantDate > base) {
            noteText = empStatus === 'retired' ? '퇴직 후 (미발생)' : '예정 연차';
          }
          rows.push({
            label: `${y}년 만근 (${y + 1}년차)`,
            period: `${U.formatKoreanDate(grantIso)} 발생`,
            days: `${days}일`,
            note: noteText,
          });
        }

        if (elFiscalNote) {
          elFiscalNote.textContent =
            '근로기준법 제60조 원칙(입사일 기준) 및 고용노동부 변경 행정해석(2021.12.16)으로 계산되었습니다. 상시 5인 이상 사업장·주 15시간 이상 근로자에게 적용됩니다.';
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
          const prorated = Math.round(15 * (workedDays / daysInYear) * 10) / 10;
          currentAnnualDays = prorated;
          subMsg = `${baseYear}년 1월 1일 비례 부여 (${joinYear}년 재직 ${workedDays}일/${daysInYear}일 기준)`;
        } else {
          currentAnnualDays = leaveForCompletedYears(yearDiff - 1);
          subMsg = `${baseYear}년 1월 1일 일괄 부여 (회계연도 기준 ${yearDiff}번째 해)`;
        }

        if (empStatus === 'retired') {
          alertHtml =
            '<strong>퇴직 시 회계연도 기준 정산 주의:</strong> 퇴사할 때 회계연도(1월 1일) 기준으로 받은 누적 연차가 법정 <strong>입사일 기준</strong>보다 적다면 입사일 기준으로 재정산받아야 합니다. 정확한 퇴사 정산은 상단 ‘입사일 기준’ 탭과 함께 비교하세요.';
        }

        const yearStart = new Date(joinYear, 0, 1);
        const yearEnd = new Date(joinYear, 11, 31);
        const daysInYear = Math.round((yearEnd - yearStart) / 86400000) + 1;
        const workedDays = Math.round((yearEnd - join) / 86400000) + 1;
        const prorated = Math.round(15 * (workedDays / daysInYear) * 10) / 10;

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
          elFiscalNote.textContent =
            '회계연도(1월 1일) 기준은 회사 편의용 방식이며, 퇴사 시 입사일 기준보다 연차가 적다면 더 유리한 입사일 기준으로 정산받아야 합니다.';
        }
      }

      if (elStatusAlert) {
        if (alertHtml) {
          elStatusAlert.innerHTML = alertHtml;
          elStatusAlert.style.display = 'block';
        } else {
          elStatusAlert.style.display = 'none';
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

    root.querySelectorAll('[data-al-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        empStatus = btn.getAttribute('data-al-status');
        root.querySelectorAll('[data-al-status]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-al-status') === empStatus);
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

  /* ========================================================================
     4. 퇴직금 계산기 (/calc/severance/)
     ======================================================================== */
  function initSeveranceCalculator() {
    const root = document.getElementById('sevCalcApp');
    if (!root) return;

    const elJoin = document.getElementById('sevJoinDate');
    const elLeave = document.getElementById('sevLeaveDate');
    const elPay3m = document.getElementById('sevPay3m');
    const elBonus = document.getElementById('sevBonusYear');
    const elLeavePay = document.getElementById('sevAnnualPay');
    const elOrdinary = document.getElementById('sevOrdinaryDaily');
    const elExcluded = document.getElementById('sevExcludedDays');
    const elHeroVal = document.getElementById('sevHeroVal');
    const elHeroSub = document.getElementById('sevHeroSub');
    const elDaysVal = document.getElementById('sevDaysVal');
    const elAvgWage = document.getElementById('sevAvgWageVal');
    const elAvgWageSub = document.getElementById('sevAvgWageSub');
    const elNetNote = document.getElementById('sevRuleNote');

    if (elLeave && !elLeave.value) elLeave.value = U.todayISO();
    if (elJoin && !elJoin.value) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 3);
      elJoin.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function render() {
      const join = new Date((elJoin.value || '') + 'T00:00:00');
      const leave = new Date((elLeave.value || '') + 'T00:00:00');
      if (isNaN(join.getTime()) || isNaN(leave.getTime()) || leave <= join) {
        if (elHeroVal) elHeroVal.textContent = '날짜를 확인해 주세요';
        if (elHeroSub) elHeroSub.textContent = '퇴직일은 입사일 이후 날짜여야 합니다.';
        return;
      }
      const totalDays = Math.round((leave - join) / 86400000);
      // 퇴직 전 3개월 일수 계산
      const threeMonthsAgo = new Date(leave);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const days3m = Math.max(89, Math.min(92, Math.round((leave - threeMonthsAgo) / 86400000)));

      const excludedDays = Math.max(0, Math.floor(U.parseNumber(elExcluded ? elExcluded.value : 0)));
      const effectiveDays3m = days3m - excludedDays;

      const pay3m = Math.max(0, U.parseNumber(elPay3m.value));
      const bonus3m = Math.round(Math.max(0, U.parseNumber(elBonus.value)) * (3 / 12));
      const annual3m = Math.round(Math.max(0, U.parseNumber(elLeavePay.value)) * (3 / 12));
      const ordinaryDaily = Math.max(0, U.parseNumber(elOrdinary ? elOrdinary.value : 0));
      const total3m = pay3m + bonus3m + annual3m;

      if (elDaysVal) {
        elDaysVal.textContent = `${U.formatNumber(totalDays)}일 (${U.calcTenure(elJoin.value, elLeave.value) || '1년 미만'})`;
      }

      if (effectiveDays3m <= 0) {
        if (elHeroVal) elHeroVal.textContent = '공식 계산기 확인 필요';
        if (elHeroSub) elHeroSub.textContent = '최근 3개월 전체가 제외기간인 경우 그 직전 3개월 임금으로 별도 산정해야 합니다.';
        if (elAvgWage) elAvgWage.textContent = '-';
        if (elNetNote) {
          elNetNote.innerHTML =
            '<div>• 최근 3개월 전체가 출산휴가·육아휴직·업무상 재해 휴업 등 제외기간(근로기준법 시행령 제2조)에 해당하는 경우, 제외기간 직전 3개월을 기준으로 산정합니다.</div><div>• 정확한 금액은 <a href="https://www.moel.go.kr/retirementpayCal.do" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 공식 퇴직금 계산기</a>로 확인해 주세요.</div>';
        }
        return;
      }

      const avgDaily = total3m / effectiveDays3m;
      const usedOrdinary = ordinaryDaily > 0 && ordinaryDaily > avgDaily;
      const appliedDaily = usedOrdinary ? ordinaryDaily : avgDaily;
      const severance = totalDays >= 365 ? Math.round(appliedDaily * 30 * (totalDays / 365)) : 0;

      if (elAvgWage) {
        elAvgWage.textContent = `${U.formatNumber(Math.round(appliedDaily))}원 / 일`;
      }
      if (elAvgWageSub) {
        elAvgWageSub.textContent = usedOrdinary
          ? '통상임금 하한 보호 적용 (평균임금 초과)'
          : excludedDays > 0
          ? `제외 ${excludedDays}일 차감 (${effectiveDays3m}일 기준)`
          : `3개월 총임금 ÷ ${days3m}일`;
      }

      if (totalDays < 365) {
        if (elHeroVal) elHeroVal.textContent = '지급 대상 아님 (1년 미만)';
        if (elHeroSub) elHeroSub.textContent = '법정 퇴직금은 계속근로기간 1년(365일) 이상 + 주 15시간 이상 근로 시 발생합니다.';
      } else {
        if (elHeroVal) elHeroVal.textContent = `${U.formatNumber(severance)}원`;
        if (elHeroSub) {
          elHeroSub.textContent = `${U.formatKoreanCurrency(severance)} (세전 참고치${usedOrdinary ? ' · 1일 통상임금 적용' : ''})`;
        }
      }

      if (elNetNote) {
        const ordLine = usedOrdinary
          ? `<div style="color:var(--brand-blue);font-weight:700;">✓ 근로기준법 제2조 통상임금 하한 보호 적용: 산출 1일 평균임금(${U.formatNumber(Math.round(avgDaily))}원)보다 1일 통상임금(${U.formatNumber(Math.round(ordinaryDaily))}원)이 높아 통상임금으로 계산했습니다.</div>`
          : ordinaryDaily > 0
          ? `<div>• 산출 1일 평균임금(${U.formatNumber(Math.round(avgDaily))}원)이 1일 통상임금(${U.formatNumber(Math.round(ordinaryDaily))}원) 이상이므로 평균임금을 적용했습니다.</div>`
          : `<div>• 1일 통상임금을 입력하면 평균임금과 자동 비교해 더 높은 금액으로 계산합니다.</div>`;
        const exclLine =
          excludedDays > 0
            ? `<div>• 산정 기준일수: ${days3m}일 − 제외기간 ${excludedDays}일 = <strong>${effectiveDays3m}일</strong> / 산입 임금 총액: <strong>${U.formatNumber(total3m)}원</strong></div>`
            : `<div>• 퇴직 전 3개월 기준일수: <strong>${days3m}일</strong> / 3개월 산입 임금 총액: <strong>${U.formatNumber(total3m)}원</strong></div>`;
        elNetNote.innerHTML = `${ordLine}${exclLine}<div>• 본 결과는 DB형/법정 퇴직금 세전 참고치이며, 퇴직소득세·DC형 운용수익·중도인출·특수 수당 산입 여부는 <a href="https://www.moel.go.kr/retirementpayCal.do" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 공식 퇴직금 계산기</a> 또는 인사팀을 통해 최종 확인하세요.</div>`;
      }
    }

    [elJoin, elLeave, elPay3m, elBonus, elLeavePay, elOrdinary, elExcluded].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });
    render();
  }

  /* ========================================================================
     5. 실업급여 계산기 (/calc/unemployment/) — 2026.01.01 이후 이직자 공식 기준
     상한액: 68,100원 / 하한액: 2026 최저시급(10,320원) × 80% × 소정근로시간 (8h = 66,048원)
     ======================================================================== */
  function initUnemploymentCalculator() {
    const root = document.getElementById('unempCalcApp');
    if (!root) return;

    const elAgeGroup = document.getElementById('ueAgeGroup'); // under50 | over50
    const elPeriod = document.getElementById('ueInsPeriod'); // 0(<1y), 1(1~3y), 3(3~5y), 5(5~10y), 10(10y+)
    const elMonthly = document.getElementById('ueMonthlyWage');
    const elHours = document.getElementById('ueDailyHours');
    const elHeroVal = document.getElementById('ueHeroVal');
    const elHeroSub = document.getElementById('ueHeroSub');
    const elDailyVal = document.getElementById('ueDailyVal');
    const elDailySub = document.getElementById('ueDailySub');
    const elDaysVal = document.getElementById('ueDaysVal');
    const elMonthVal = document.getElementById('ueMonthVal');
    const elNote = document.getElementById('ueRuleNote');

    const CAP_2026 = 68100;
    const MIN_HOURLY_2026 = 10320;

    const DAYS_TABLE = {
      under50: { '0': 120, '1': 150, '3': 180, '5': 210, '10': 240 },
      over50: { '0': 120, '1': 180, '3': 210, '5': 240, '10': 270 },
    };

    function render() {
      const age = elAgeGroup.value || 'under50';
      const period = elPeriod.value || '1';
      const monthly = Math.max(0, U.parseNumber(elMonthly.value));
      const dailyHours = Math.max(1, Math.min(8, U.parseNumber(elHours.value) || 8));

      const benefitDays = (DAYS_TABLE[age] && DAYS_TABLE[age][period]) || 120;
      const avgDaily = (monthly * 3) / 90;
      const raw60 = avgDaily * 0.6;

      // 2026년 1월 1일 이후 이직자 공식 기준 (고용보험법 시행령):
      // 1일 상한액 68,100원 / 1일 하한액 = 2026 최저시급(10,320원) × 80% × 소정근로시간 (8h = 66,048원)
      const cap = CAP_2026;
      const floor = Math.round(MIN_HOURLY_2026 * 0.8 * dailyHours);
      const effectiveDaily = Math.round(Math.min(cap, Math.max(raw60, floor)));
      const total = effectiveDaily * benefitDays;
      const per30 = effectiveDaily * 30;

      let appliedTag = '평균임금 60% 적용';
      if (raw60 >= cap) appliedTag = `2026 상한액(${U.formatNumber(cap)}원) 적용`;
      else if (raw60 <= floor) appliedTag = `2026 ${dailyHours}시간 하한액(${U.formatNumber(floor)}원) 적용`;

      if (elHeroVal) elHeroVal.textContent = `${U.formatNumber(total)}원`;
      if (elHeroSub) elHeroSub.textContent = `${U.formatKoreanCurrency(total)} (총 ${benefitDays}일 수급 시 예상 합계)`;
      if (elDailyVal) elDailyVal.textContent = `${U.formatNumber(effectiveDaily)}원 / 일`;
      if (elDailySub) elDailySub.textContent = appliedTag;
      if (elDaysVal) elDaysVal.textContent = `${benefitDays}일 (약 ${Math.round((benefitDays / 30) * 10) / 10}개월)`;
      if (elMonthVal) elMonthVal.textContent = `약 ${U.formatNumber(per30)}원`;
      if (elNote) {
        elNote.innerHTML = `<div>• <strong>적용 기준:</strong> 2026년 1월 1일 이후 이직자 (상한 <strong>68,100원</strong> / ${dailyHours}시간 하한 <strong>${U.formatNumber(floor)}원</strong>) · 산출 평균임금 60%: ${U.formatNumber(Math.round(raw60))}원 → <strong>${appliedTag}</strong></div><div>• 비자발적 이직 + 이직 전 18개월간 피보험단위기간 <strong>180일 이상</strong> 충족 시 수급 가능합니다. (공식 안내: <a href="https://1350.moel.go.kr/rtmview.do?id=1000324861" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용노동부 1350</a> · <a href="https://www.work24.go.kr" target="_blank" rel="noopener noreferrer" style="color:var(--brand-blue);font-weight:700;text-decoration:underline;">고용24</a>)</div>`;
      }
    }

    [elAgeGroup, elPeriod, elMonthly, elHours].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });
    render();
  }

  /* ========================================================================
     6. 주휴수당 계산기 (/calc/weekly-holiday/) — 2026 최저시급 10,320원 기준
     ======================================================================== */
  function initWeeklyHolidayCalculator() {
    const root = document.getElementById('whCalcApp');
    if (!root) return;

    const elHourly = document.getElementById('whHourly');
    const elHours = document.getElementById('whWeeklyHours');
    const elHeroVal = document.getElementById('whHeroVal');
    const elHeroSub = document.getElementById('whHeroSub');
    const elWeekBase = document.getElementById('whWeekBase');
    const elRealHourly = document.getElementById('whRealHourly');
    const elMonthTotal = document.getElementById('whMonthTotal');
    const elRuleNote = document.getElementById('whRuleNote');

    function render() {
      const hourly = Math.max(0, U.parseNumber(elHourly.value));
      const weeklyHours = Math.max(0, Math.min(52, U.parseNumber(elHours.value)));
      const eligible = weeklyHours >= 15;
      const holidayHours = eligible ? (Math.min(40, weeklyHours) / 40) * 8 : 0;
      const weeklyHolidayPay = Math.round(holidayHours * hourly);
      const weeklyBase = Math.round(weeklyHours * hourly);
      const weeklyTotal = weeklyBase + weeklyHolidayPay;
      const realHourly = weeklyHours > 0 ? Math.round(weeklyTotal / weeklyHours) : 0;
      const monthlyEst = Math.round(weeklyTotal * 4.345);

      if (elHeroVal) {
        elHeroVal.textContent = eligible ? `주 ${U.formatNumber(weeklyHolidayPay)}원` : '0원 (주 15시간 미만)';
      }
      if (elHeroSub) {
        elHeroSub.textContent = eligible
          ? `주휴시간 ${Math.round(holidayHours * 100) / 100}시간 × 시급 ${U.formatNumber(hourly)}원 · 주급 합계 ${U.formatNumber(weeklyTotal)}원`
          : '주 소정근로시간이 15시간 미만이면 법정 주휴수당 지급 대상이 아닙니다.';
      }
      if (elWeekBase) elWeekBase.textContent = `${U.formatNumber(weeklyTotal)}원`;
      if (elRealHourly) elRealHourly.textContent = `${U.formatNumber(realHourly)}원 / 시간`;
      if (elMonthTotal) elMonthTotal.textContent = `약 ${U.formatNumber(monthlyEst)}원`;

      if (elRuleNote) {
        const minWarn =
          hourly < 10320
            ? `<div style="color:#b91c1c;font-weight:700;">⚠ 입력한 시급(${U.formatNumber(hourly)}원)이 2026년 법정 최저시급(10,320원) 미만입니다!</div>`
            : `<div>✓ 2026년 최저시급(10,320원) 기준 충족 (최저시급 기준 주휴 포함 실질 시급 12,384원)</div>`;
        elRuleNote.innerHTML = `${minWarn}<div>• 계산식: (1주 소정근로시간 ÷ 40) × 8 × 시급 (최대 주 40시간 기준 8시간 한도, 소정근로일 개근 조건)</div>`;
      }
    }

    root.querySelectorAll('[data-wh-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        elHours.value = btn.getAttribute('data-wh-preset');
        render();
      });
    });

    [elHourly, elHours].forEach((el) => {
      if (el) el.addEventListener('input', render);
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initVatCalculator();
    initAnnualLeaveCalculator();
    initBrokerageCalculator();
    initSeveranceCalculator();
    initUnemploymentCalculator();
    initWeeklyHolidayCalculator();
  });
})(window);
