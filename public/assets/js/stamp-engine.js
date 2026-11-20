/* ==========================================================================
   바로서식 (BaroDoc) — Transparent Korean Stamp Canvas Engine
   Generates crisp 600x600 transparent PNG seals & manages localStorage tray
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'barodoc_stamps_v1';
  const LAST_STAMP_KEY = 'barodoc_last_stamp_id';
  const MAX_SAVED_STAMPS = 8;

  const STAMP_FONTS = {
    songmyung: { label: '전통 인장체 (송명)', family: '"Song Myung", "Batang", serif', weight: '400' },
    batang: { label: '단정 명조체 (고운바탕)', family: '"Gowun Batang", "Noto Serif KR", serif', weight: '700' },
    hahmlet: { label: '판본 정자체 (함렛)', family: '"Hahmlet", "Noto Serif KR", serif', weight: '700' },
    brush: { label: '붓글씨체 (나눔손글씨)', family: '"Nanum Brush Script", "Gowun Batang", cursive', weight: '400' },
    gothic: { label: '현대 고딕체 (노토산스)', family: '"Noto Sans KR", "Malgun Gothic", sans-serif', weight: '800' },
  };

  const INK_COLORS = [
    { id: 'vermilion', name: '전통 주홍', hex: '#C81E1E' },
    { id: 'crimson', name: '선명 인주', hex: '#DC2626' },
    { id: 'deepred', name: '진한 적색', hex: '#991B1B' },
    { id: 'blue', name: '청색 스탬프', hex: '#1D4ED8' },
    { id: 'black', name: '흑색 도장', hex: '#1F2937' },
  ];

  function defaultConfig(overrides) {
    return Object.assign(
      {
        text: '홍길동',
        shape: 'circle', // circle | oval | square | approval
        font: 'songmyung',
        color: '#C81E1E',
        borderWidth: 14,
        fontSizeScale: 1.0,
        addInMark: true, // 3글자 이름에 印 자동 추가(2x2 전통 배치)
        inMarkChar: '印', // 印 또는 인
        layout: 'auto', // auto | vertical | horizontal | grid
        vintage: 22, // 0 ~ 60 인주 질감 효과
        approvalDept: '결재',
        approvalDate: '26.11.19',
      },
      overrides || {}
    );
  }

  // Deterministic pseudo-random so vintage texture doesn't jitter randomly
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function applyVintageTexture(ctx, size, intensity, seedBase) {
    if (!intensity || intensity <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const count = Math.floor(intensity * 9);
    for (let i = 0; i < count; i++) {
      const rx = seededRandom(seedBase + i * 13.7) * size;
      const ry = seededRandom(seedBase + i * 29.3) * size;
      const r = 0.8 + seededRandom(seedBase + i * 47.1) * 3.0;
      const alpha = 0.12 + seededRandom(seedBase + i * 61.9) * 0.45;
      ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function getFontString(fontKey, pxSize) {
    const meta = STAMP_FONTS[fontKey] || STAMP_FONTS.songmyung;
    return `${meta.weight} ${Math.round(pxSize)}px ${meta.family}`;
  }

  function buildChars(cfg) {
    let raw = (cfg.text || '홍길동').replace(/\s+/g, '');
    if (!raw) raw = '홍길동';
    if (cfg.shape === 'approval') return raw.slice(0, 4);

    if (cfg.addInMark && raw.length === 3 && !/[인印]$/.test(raw) && cfg.layout !== 'vertical' && cfg.layout !== 'horizontal') {
      raw += cfg.inMarkChar || '印';
    }
    return raw.slice(0, 9);
  }

  function drawGridChars(ctx, chars, cols, rows, box, fontKey, fontSizeScale, color) {
    const cellW = box.w / cols;
    const cellH = box.h / rows;
    const baseSize = Math.min(cellW, cellH) * 0.84 * fontSizeScale;

    ctx.fillStyle = color;
    ctx.font = getFontString(fontKey, baseSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 전통 한국 도장 읽기 순서: 오른쪽 열 위→아래, 그다음 왼쪽 열 위→아래
    let idx = 0;
    for (let c = cols - 1; c >= 0; c--) {
      for (let r = 0; r < rows; r++) {
        if (idx >= chars.length) break;
        const ch = chars[idx++];
        const cx = box.x + cellW * (c + 0.5);
        const cy = box.y + cellH * (r + 0.52);
        ctx.fillText(ch, cx, cy);
      }
    }
  }

  function drawStamp(canvas, rawConfig) {
    const cfg = defaultConfig(rawConfig);
    const size = 600;
    if (canvas.width !== size) canvas.width = size;
    if (canvas.height !== size) canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const bw = Math.max(4, Math.min(30, Number(cfg.borderWidth) || 14));
    const color = cfg.color || '#C81E1E';
    const scale = Number(cfg.fontSizeScale) || 1.0;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = bw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (cfg.shape === 'approval') {
      // 3단 원형 결재 도장 (부서 / 날짜 / 성명)
      const r = 248;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // 가로 구분선 2줄
      const y1 = cy - 82;
      const y2 = cy + 82;
      const chordHalf = Math.sqrt(Math.max(0, r * r - 82 * 82)) - bw * 0.35;
      ctx.lineWidth = Math.max(4, bw * 0.65);
      ctx.beginPath();
      ctx.moveTo(cx - chordHalf, y1);
      ctx.lineTo(cx + chordHalf, y1);
      ctx.moveTo(cx - chordHalf, y2);
      ctx.lineTo(cx + chordHalf, y2);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 상단 부서/직함
      const dept = (cfg.approvalDept || '결재').slice(0, 5);
      ctx.font = getFontString(cfg.font, (dept.length > 3 ? 58 : 74) * scale);
      ctx.fillText(dept, cx, cy - 156);

      // 중앙 날짜
      const dateTxt = (cfg.approvalDate || '26.11.19').slice(0, 10);
      ctx.font = `700 ${Math.round(62 * scale)}px "Noto Sans KR", "Malgun Gothic", sans-serif`;
      ctx.fillText(dateTxt, cx, cy + 4);

      // 하단 성명
      const nameTxt = (cfg.text || '홍길동').replace(/\s+/g, '').slice(0, 4);
      ctx.font = getFontString(cfg.font, (nameTxt.length > 3 ? 64 : 80) * scale);
      ctx.fillText(nameTxt, cx, cy + 158);
    } else if (cfg.shape === 'oval') {
      // 타원형 인감 (세로 긴 전통 막도장)
      const rx = 180;
      const ry = 256;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      const rawName = (cfg.text || '홍길동').replace(/\s+/g, '').slice(0, 4);
      const chars = rawName.split('');
      const count = chars.length;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (count <= 3) {
        const innerH = ry * 1.48;
        const step = innerH / count;
        const startY = cy - innerH / 2 + step / 2;
        const fontSize = Math.min(138, step * 0.88) * scale;
        ctx.font = getFontString(cfg.font, fontSize);
        chars.forEach((ch, i) => {
          ctx.fillText(ch, cx, startY + i * step + 4);
        });
      } else {
        drawGridChars(
          ctx,
          chars,
          2,
          2,
          { x: cx - 125, y: cy - 155, w: 250, h: 310 },
          cfg.font,
          scale * 0.92,
          color
        );
      }
    } else if (cfg.shape === 'square') {
      // 사각형 회사 직인 / 법인 인감
      const pad = 42;
      const boxSize = size - pad * 2;
      const radius = 16;

      ctx.beginPath();
      ctx.moveTo(pad + radius, pad);
      ctx.lineTo(pad + boxSize - radius, pad);
      ctx.quadraticCurveTo(pad + boxSize, pad, pad + boxSize, pad + radius);
      ctx.lineTo(pad + boxSize, pad + boxSize - radius);
      ctx.quadraticCurveTo(pad + boxSize, pad + boxSize, pad + boxSize - radius, pad + boxSize);
      ctx.lineTo(pad + radius, pad + boxSize);
      ctx.quadraticCurveTo(pad, pad + boxSize, pad, pad + boxSize - radius);
      ctx.lineTo(pad, pad + radius);
      ctx.quadraticCurveTo(pad, pad, pad + radius, pad);
      ctx.closePath();
      ctx.stroke();

      const chars = buildChars(cfg).split('');
      const innerPad = pad + bw + 18;
      const innerSize = size - innerPad * 2;
      const box = { x: innerPad, y: innerPad, w: innerSize, h: innerSize };

      if (chars.length <= 2) {
        drawGridChars(ctx, chars, chars.length === 1 ? 1 : 2, 1, box, cfg.font, scale * 0.9, color);
      } else if (chars.length <= 4) {
        drawGridChars(ctx, chars, 2, 2, box, cfg.font, scale * 0.92, color);
      } else if (chars.length <= 6) {
        drawGridChars(ctx, chars, 2, 3, box, cfg.font, scale * 0.88, color);
      } else {
        drawGridChars(ctx, chars, 3, 3, box, cfg.font, scale * 0.82, color);
      }
    } else {
      // 원형 도장 (기본)
      const r = 248;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const chars = buildChars(cfg).split('');
      const count = chars.length;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (cfg.layout === 'horizontal' && count <= 4) {
        const innerW = r * 1.56;
        const step = innerW / count;
        const startX = cx - innerW / 2 + step / 2;
        const fontSize = Math.min(148, step * 0.88) * scale;
        ctx.font = getFontString(cfg.font, fontSize);
        chars.forEach((ch, i) => {
          ctx.fillText(ch, startX + i * step, cy + 5);
        });
      } else if (cfg.layout === 'vertical' || (cfg.layout === 'auto' && count <= 3)) {
        const innerH = r * 1.52;
        const step = innerH / count;
        const startY = cy - innerH / 2 + step / 2;
        const fontSize = Math.min(150, step * 0.88) * scale;
        ctx.font = getFontString(cfg.font, fontSize);
        chars.forEach((ch, i) => {
          ctx.fillText(ch, cx, startY + i * step + 4);
        });
      } else if (count <= 4) {
        drawGridChars(
          ctx,
          chars,
          2,
          2,
          { x: cx - 154, y: cy - 154, w: 308, h: 308 },
          cfg.font,
          scale * 0.94,
          color
        );
      } else if (count <= 6) {
        drawGridChars(
          ctx,
          chars,
          2,
          3,
          { x: cx - 146, y: cy - 166, w: 292, h: 332 },
          cfg.font,
          scale * 0.9,
          color
        );
      } else {
        drawGridChars(
          ctx,
          chars,
          3,
          3,
          { x: cx - 162, y: cy - 162, w: 324, h: 324 },
          cfg.font,
          scale * 0.8,
          color
        );
      }
    }

    const seedBase = (cfg.text || 'a').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 17);
    applyVintageTexture(ctx, size, Number(cfg.vintage) || 0, seedBase);
  }

  function generateDataUrl(rawConfig) {
    const canvas = document.createElement('canvas');
    drawStamp(canvas, rawConfig);
    return canvas.toDataURL('image/png');
  }

  function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'barodoc-stamp.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function loadSavedStamps() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function persistStamps(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED_STAMPS)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveStamp(rawConfig, dataUrl) {
    const cfg = defaultConfig(rawConfig);
    const url = dataUrl || generateDataUrl(cfg);
    const list = loadSavedStamps();
    const id = 'st_' + Date.now();
    const shapeLabel =
      cfg.shape === 'square'
        ? '직인'
        : cfg.shape === 'oval'
        ? '타원'
        : cfg.shape === 'approval'
        ? '결재'
        : '원형';

    const item = {
      id,
      name: (cfg.text || '도장').trim(),
      label: `${(cfg.text || '도장').trim()} (${shapeLabel})`,
      shape: cfg.shape,
      cfg,
      dataUrl: url,
      createdAt: new Date().toISOString(),
    };

    list.unshift(item);
    persistStamps(list);
    try {
      localStorage.setItem(LAST_STAMP_KEY, id);
    } catch (e) {}
    return item;
  }

  function deleteStamp(id) {
    const list = loadSavedStamps().filter((item) => item.id !== id);
    persistStamps(list);
    return list;
  }

  function getLastStampId() {
    try {
      return localStorage.getItem(LAST_STAMP_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  window.StampEngine = {
    STAMP_FONTS,
    INK_COLORS,
    defaultConfig,
    drawStamp,
    generateDataUrl,
    downloadDataUrl,
    loadSavedStamps,
    saveStamp,
    deleteStamp,
    getLastStampId,
  };
})(window);
