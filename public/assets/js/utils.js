/* ==========================================================================
   바로문서 (BaroDoc) — Core Utilities
   Korean/Hanja currency conversion, formatting, print helper, A4 scaler
   ========================================================================== */

(function (window) {
  'use strict';

  const KO_DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const KO_SUB_UNITS = ['', '십', '백', '천'];
  const KO_BIG_UNITS = ['', '만', '억', '조', '경'];

  // 법률·금융 문서 표준 한자 대자(大字) 표기
  const HJ_DIGITS = ['', '壹', '貳', '參', '四', '五', '六', '七', '八', '九'];
  const HJ_SUB_UNITS = ['', '拾', '百', '千'];
  const HJ_BIG_UNITS = ['', '萬', '億', '兆', '京'];

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeHtmlWithBr(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
  }

  function parseNumber(val) {
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const n = Number(cleaned);
    return isFinite(n) ? n : 0;
  }

  function formatNumber(val) {
    const n = Math.round(parseNumber(val));
    return n.toLocaleString('ko-KR');
  }

  function convertNumberToUnits(num, digits, subUnits, bigUnits) {
    const n = Math.floor(Math.abs(parseNumber(num)));
    if (n === 0) return '';
    const str = String(n);
    const groups = [];
    for (let i = str.length; i > 0; i -= 4) {
      groups.unshift(str.slice(Math.max(0, i - 4), i));
    }

    const result = [];
    const totalGroups = groups.length;

    groups.forEach((group, gIdx) => {
      const unitIndex = totalGroups - 1 - gIdx;
      let groupText = '';
      const len = group.length;
      for (let i = 0; i < len; i++) {
        const d = Number(group[i]);
        if (d === 0) continue;
        const pos = len - 1 - i;
        groupText += digits[d] + subUnits[pos];
      }
      if (groupText) {
        result.push(groupText + (bigUnits[unitIndex] || ''));
      }
    });

    return result.join('');
  }

  function numberToKorean(num) {
    const n = Math.floor(Math.abs(parseNumber(num)));
    if (n === 0) return '영';
    return convertNumberToUnits(n, KO_DIGITS, KO_SUB_UNITS, KO_BIG_UNITS);
  }

  function numberToHanja(num) {
    const n = Math.floor(Math.abs(parseNumber(num)));
    if (n === 0) return '零';
    return convertNumberToUnits(n, HJ_DIGITS, HJ_SUB_UNITS, HJ_BIG_UNITS);
  }

  function formatKoreanCurrency(num) {
    const n = Math.floor(Math.abs(parseNumber(num)));
    if (n === 0) return '금 영원정';
    return '금 ' + numberToKorean(n) + '원정';
  }

  function formatHanjaCurrency(num) {
    const n = Math.floor(Math.abs(parseNumber(num)));
    if (n === 0) return '金 零圓整';
    return '金 ' + numberToHanja(n) + '圓整';
  }

  function todayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addMonthsISO(isoStr, months) {
    const base = isoStr ? new Date(isoStr + 'T00:00:00') : new Date();
    if (isNaN(base.getTime())) return todayISO();
    base.setMonth(base.getMonth() + months);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatKoreanDate(isoStr, fallback) {
    if (!isoStr) return fallback || '20  년   월   일';
    const parts = String(isoStr).split('-');
    if (parts.length !== 3) return escapeHtml(isoStr);
    const y = parts[0];
    const m = String(Number(parts[1])).padStart(2, '0');
    const d = String(Number(parts[2])).padStart(2, '0');
    return `${y}년 ${m}월 ${d}일`;
  }

  function calcTenure(startIso, endIso) {
    if (!startIso) return '';
    const start = new Date(startIso + 'T00:00:00');
    const end = endIso ? new Date(endIso + 'T00:00:00') : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years <= 0 && months <= 0) return '1개월 미만';
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.join(' ');
  }

  function maskResidentId(val, shouldMask) {
    if (!val) return '';
    if (!shouldMask) return val;
    const digits = String(val).replace(/[^0-9]/g, '');
    if (digits.length >= 7) {
      return `${digits.slice(0, 6)}-${digits[6]}******`;
    }
    return val;
  }

  function showToast(message, duration) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 220);
    }, duration || 2800);
  }

  function initCommonUI() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  function setupA4Scaler() {
    const stage = document.getElementById('previewStage');
    const scaler = document.getElementById('a4ScaleContainer');
    if (!stage || !scaler) return () => {};

    const A4_PX_WIDTH = 793.7; // 210mm at 96dpi

    function rescale() {
      const style = window.getComputedStyle(stage);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = stage.clientWidth - padX;
      if (available <= 0) return;

      const scale = Math.min(1, available / A4_PX_WIDTH);
      scaler.style.transform = `scale(${scale})`;

      const naturalHeight = scaler.scrollHeight || 1122.5;
      scaler.style.height = `${naturalHeight * scale}px`;
      scaler.style.width = `${A4_PX_WIDTH}px`;
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(rescale);
      ro.observe(stage);
    }
    window.addEventListener('resize', rescale);
    window.addEventListener('beforeprint', () => {
      scaler.style.transform = 'none';
      scaler.style.height = 'auto';
    });
    window.addEventListener('afterprint', rescale);

    rescale();
    return rescale;
  }

  function triggerPrint() {
    showToast('인쇄 창에서 대상을 "PDF로 저장"으로 선택하고 "배경 그래픽"을 켜면 선명한 A4 PDF가 저장됩니다.', 4200);
    setTimeout(() => {
      window.print();
    }, 180);
  }

  document.addEventListener('DOMContentLoaded', initCommonUI);

  window.BaroUtils = {
    escapeHtml,
    escapeHtmlWithBr,
    parseNumber,
    formatNumber,
    numberToKorean,
    numberToHanja,
    formatKoreanCurrency,
    formatHanjaCurrency,
    todayISO,
    addMonthsISO,
    formatKoreanDate,
    calcTenure,
    maskResidentId,
    showToast,
    setupA4Scaler,
    triggerPrint,
  };
})(window);
