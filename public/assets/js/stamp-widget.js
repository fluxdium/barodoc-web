/* ==========================================================================
   바로서식 (BaroDoc) — Unified Seal & Mobile Hand-Drawn Signature Widget
   Shared across all form pages (52+ scalable) with:
   - Saved transparent stamps (/stamp/ integration) + 3-sec quick stamp
   - Mobile finger / mouse smooth canvas signature pad + saved signature tray
   - Transparent signature PNG export + compact vector share serialization
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SE = window.StampEngine;

  const SIG_STORAGE_KEY = 'barodoc_saved_signatures_v1';
  const MAX_SAVED_SIGS = 6;
  const PAD_W = 420;
  const PAD_H = 150;

  function loadSavedSignatures() {
    try {
      const raw = localStorage.getItem(SIG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function persistSignatures(list) {
    try {
      localStorage.setItem(SIG_STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED_SIGS)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function deleteSavedSignature(id) {
    const next = loadSavedSignatures().filter((s) => s.id !== id);
    persistSignatures(next);
    return next;
  }

  function drawStrokesOnCtx(ctx, strokes, scaleX, scaleY, offsetX, offsetY) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    (strokes || []).forEach((st) => {
      const pts = st.p || [];
      if (pts.length < 2) return;
      ctx.strokeStyle = st.c || '#111827';
      ctx.fillStyle = st.c || '#111827';
      ctx.lineWidth = (st.w || 3) * Math.min(scaleX, scaleY);

      if (pts.length === 2) {
        ctx.beginPath();
        ctx.arc(pts[0] * scaleX + offsetX, pts[1] * scaleY + offsetY, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(pts[0] * scaleX + offsetX, pts[1] * scaleY + offsetY);
      for (let i = 2; i < pts.length - 2; i += 2) {
        const x1 = pts[i] * scaleX + offsetX;
        const y1 = pts[i + 1] * scaleY + offsetY;
        const x2 = pts[i + 2] * scaleX + offsetX;
        const y2 = pts[i + 3] * scaleY + offsetY;
        ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
      }
      const lastX = pts[pts.length - 2] * scaleX + offsetX;
      const lastY = pts[pts.length - 1] * scaleY + offsetY;
      ctx.lineTo(lastX, lastY);
      ctx.stroke();
    });
  }

  function renderStrokesToDataUrl(strokes) {
    if (!strokes || !strokes.length) return '';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokes.forEach((st) => {
      const pts = st.p || [];
      for (let i = 0; i < pts.length; i += 2) {
        if (pts[i] < minX) minX = pts[i];
        if (pts[i] > maxX) maxX = pts[i];
        if (pts[i + 1] < minY) minY = pts[i + 1];
        if (pts[i + 1] > maxY) maxY = pts[i + 1];
      }
    });
    if (!isFinite(minX)) return '';

    const pad = 12;
    const rawW = Math.max(40, maxX - minX + pad * 2);
    const rawH = Math.max(24, maxY - minY + pad * 2);
    const scale = 3; // Crisp 3x Retina PNG for A4 print & download
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rawW * scale);
    canvas.height = Math.round(rawH * scale);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStrokesOnCtx(ctx, strokes, scale, scale, (-minX + pad) * scale, (-minY + pad) * scale);
    return canvas.toDataURL('image/png');
  }

  function simplifyStrokes(strokes) {
    // Keep stroke payload compact for serverless #d= URL sharing
    return (strokes || []).map((st) => {
      const pts = st.p || [];
      const compact = [];
      let prevX = -999, prevY = -999;
      for (let i = 0; i < pts.length; i += 2) {
        const x = Math.round(pts[i]);
        const y = Math.round(pts[i + 1]);
        const isLast = i >= pts.length - 2;
        if (isLast || Math.hypot(x - prevX, y - prevY) >= 2.5) {
          compact.push(x, y);
          prevX = x;
          prevY = y;
        }
      }
      return { c: st.c || '#111827', w: Number(st.w) || 3, p: compact };
    }).filter((st) => st.p.length >= 2);
  }

  function saveSignature(strokes, labelName) {
    const cleanStrokes = simplifyStrokes(strokes);
    if (!cleanStrokes.length) return null;
    const dataUrl = renderStrokesToDataUrl(cleanStrokes);
    const list = loadSavedSignatures();
    const id = 'sig_' + Date.now();
    const item = {
      id,
      name: (labelName || '자필서명').trim().slice(0, 12),
      strokes: cleanStrokes,
      dataUrl,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    persistSignatures(list);
    return item;
  }

  function createStampWidget(options) {
    const container = document.getElementById(options.containerId || 'stampWidgetContainer');
    if (!container) return null;

    const slots = options.slots || [
      { key: 'primary', label: '작성자 도장 (인)', defaultName: '홍길동', defaultShape: 'circle' },
    ];
    const onChange = typeof options.onChange === 'function' ? options.onChange : function () {};

    const state = {
      mode: 'stamp', // 'stamp' | 'signature'
      activeSlot: slots[0].key,
      stampsBySlot: {}, // { slotKey: { id, kind:'stamp'|'signature', dataUrl, name, sizeMm, cfg?, strokes? } | null }
      defaultSizeMm: options.defaultSizeMm || 18,
      penColor: '#111827',
      penWidth: 3.2,
      draftStrokes: [],
    };

    slots.forEach((s) => {
      state.stampsBySlot[s.key] = null;
    });

    // If navigated from /stamp/ with ?stamp=auto, apply latest saved stamp automatically
    const params = new URLSearchParams(window.location.search);
    if (params.get('stamp') === 'auto') {
      const saved = SE.loadSavedStamps();
      if (saved.length > 0) {
        const lastId = SE.getLastStampId();
        const found = saved.find((s) => s.id === lastId) || saved[0];
        state.stampsBySlot[slots[0].key] = {
          id: found.id,
          kind: 'stamp',
          dataUrl: found.dataUrl,
          name: found.name,
          cfg: found.cfg || { text: found.name, shape: found.shape || 'circle' },
          sizeMm: slots[0].sizeMm || state.defaultSizeMm,
        };
        setTimeout(() => {
          U.showToast(`"${found.name}" 도장이 서식에 자동 날인되었습니다.`);
        }, 350);
      }
    }

    function getActiveSlotDef() {
      return slots.find((s) => s.key === state.activeSlot) || slots[0];
    }

    function getSuggestedName() {
      const activeDef = getActiveSlotDef();
      const raw =
        (typeof options.getSuggestedName === 'function' && options.getSuggestedName(state.activeSlot)) ||
        activeDef.defaultName ||
        '홍길동';
      return String(raw).replace(/\s+/g, '').slice(0, 9);
    }

    function bindSignatureCanvas() {
      const canvas = container.querySelector('#signaturePadCanvas');
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = PAD_W * dpr;
      canvas.height = PAD_H * dpr;
      const ctx = canvas.getContext('2d');

      function redraw() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
        // Subtle guide baseline (not exported to PNG)
        ctx.save();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, PAD_H - 28);
        ctx.lineTo(PAD_W - 20, PAD_H - 28);
        ctx.stroke();
        ctx.restore();
        drawStrokesOnCtx(ctx, state.draftStrokes, 1, 1, 0, 0);
      }

      redraw();

      let drawing = false;
      let currentStroke = null;

      function getPos(ev) {
        const rect = canvas.getBoundingClientRect();
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        return {
          x: ((clientX - rect.left) / rect.width) * PAD_W,
          y: ((clientY - rect.top) / rect.height) * PAD_H,
        };
      }

      function onDown(ev) {
        ev.preventDefault();
        drawing = true;
        const p = getPos(ev);
        currentStroke = { c: state.penColor, w: state.penWidth, p: [p.x, p.y] };
        state.draftStrokes.push(currentStroke);
        const hint = container.querySelector('#sigPadHint');
        if (hint) hint.style.display = 'none';
        redraw();
      }

      function onMove(ev) {
        if (!drawing || !currentStroke) return;
        ev.preventDefault();
        const p = getPos(ev);
        currentStroke.p.push(p.x, p.y);
        redraw();
      }

      function onUp() {
        drawing = false;
        currentStroke = null;
      }

      if (window.PointerEvent) {
        canvas.addEventListener('pointerdown', (ev) => {
          canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
          onDown(ev);
        });
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
      } else {
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onUp);
      }

      const clearPadBtn = container.querySelector('#sigClearPadBtn');
      if (clearPadBtn) {
        clearPadBtn.addEventListener('click', () => {
          state.draftStrokes = [];
          const hint = container.querySelector('#sigPadHint');
          if (hint) hint.style.display = '';
          redraw();
        });
      }

      const applySigBtn = container.querySelector('#sigApplyBtn');
      if (applySigBtn) {
        applySigBtn.addEventListener('click', () => {
          if (!state.draftStrokes.length) {
            U.showToast('서명 패드에 손가락이나 마우스로 먼저 서명해 주세요.');
            return;
          }
          const activeDef = getActiveSlotDef();
          const saved = saveSignature(state.draftStrokes, getSuggestedName() || activeDef.label);
          if (!saved) return;
          state.stampsBySlot[state.activeSlot] = {
            id: saved.id,
            kind: 'signature',
            dataUrl: saved.dataUrl,
            name: saved.name,
            strokes: saved.strokes,
            sizeMm: activeDef.sizeMm || state.defaultSizeMm,
          };
          state.draftStrokes = [];
          U.showToast(`자필 서명을 저장하고 [${activeDef.label}] 자리에 날인했습니다.`);
          render();
          onChange(state.stampsBySlot);
        });
      }

      const dlSigBtn = container.querySelector('#sigDownloadPngBtn');
      if (dlSigBtn) {
        dlSigBtn.addEventListener('click', () => {
          let dataUrl = '';
          if (state.draftStrokes.length) {
            dataUrl = renderStrokesToDataUrl(state.draftStrokes);
          } else {
            const cur = state.stampsBySlot[state.activeSlot];
            if (cur && cur.kind === 'signature' && cur.dataUrl) dataUrl = cur.dataUrl;
          }
          if (!dataUrl) {
            U.showToast('다운로드할 서명을 먼저 그려주세요.');
            return;
          }
          SE.downloadDataUrl(dataUrl, `barodoc-signature-${Date.now()}.png`);
          U.showToast('투명 배경 자필 서명 PNG 파일을 다운로드했습니다.');
        });
      }
    }

    function render() {
      const savedStamps = SE.loadSavedStamps();
      const savedSigs = loadSavedSignatures();
      const activeDef = getActiveSlotDef();
      const current = state.stampsBySlot[state.activeSlot];
      const currentSize = (current && current.sizeMm) || activeDef.sizeMm || state.defaultSizeMm;

      let slotTabsHtml = '';
      if (slots.length > 1) {
        slotTabsHtml = `
          <div class="stamp-slot-tabs" role="tablist">
            ${slots
              .map((s) => {
                const mark = state.stampsBySlot[s.key];
                const badge = mark ? (mark.kind === 'signature' ? ' ✍' : ' ✓') : '';
                return `<button type="button" class="stamp-slot-tab ${
                  s.key === state.activeSlot ? 'active' : ''
                }" data-slot="${U.escapeHtml(s.key)}">${U.escapeHtml(s.label)}${badge}</button>`;
              })
              .join('')}
          </div>
        `;
      }

      let bodyHtml = '';
      if (state.mode === 'stamp') {
        const savedHtml =
          savedStamps.length > 0
            ? `<div class="saved-stamps-grid">
                ${savedStamps
                  .map((item) => {
                    const isSelected = current && current.kind === 'stamp' && current.id === item.id;
                    return `
                      <button type="button" class="saved-stamp-item ${
                        isSelected ? 'selected' : ''
                      }" data-stamp-id="${U.escapeHtml(item.id)}" title="${U.escapeHtml(item.label)} 선택">
                        <img src="${item.dataUrl}" alt="${U.escapeHtml(item.label)}">
                        <span>${U.escapeHtml(item.name)}</span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>`
            : `<p class="field-help" style="margin:0 0 8px;">
                저장된 도장이 없습니다. 아래에 이름을 입력해 3초 만에 즉시 찍거나,
                <a href="/stamp/" style="color:var(--seal-red);font-weight:700;text-decoration:underline;">도장 만들기</a>에서 상세 디자인할 수 있습니다.
              </p>`;

        const suggestedName = getSuggestedName();
        bodyHtml = `
          ${savedHtml}
          <div class="quick-stamp-row">
            <input type="text" id="quickStampName" maxlength="9" placeholder="성명 또는 상호 입력" value="${U.escapeHtml(
              suggestedName
            )}" aria-label="즉시 도장 이름">
            <select id="quickStampShape" aria-label="도장 모양">
              <option value="circle" ${activeDef.defaultShape === 'circle' ? 'selected' : ''}>원형</option>
              <option value="oval" ${activeDef.defaultShape === 'oval' ? 'selected' : ''}>타원</option>
              <option value="square" ${activeDef.defaultShape === 'square' ? 'selected' : ''}>사각직인</option>
            </select>
            <button type="button" class="btn btn-seal btn-sm" id="quickStampBtn">즉시 찍기</button>
          </div>
        `;
      } else {
        const savedSigHtml =
          savedSigs.length > 0
            ? `<div class="saved-sigs-row">
                ${savedSigs
                  .map((sig) => {
                    const isSelected = current && current.kind === 'signature' && current.id === sig.id;
                    return `
                      <div class="saved-sig-chip ${isSelected ? 'selected' : ''}">
                        <button type="button" class="saved-sig-pick" data-sig-id="${U.escapeHtml(sig.id)}" title="서명 적용">
                          <img src="${sig.dataUrl}" alt="${U.escapeHtml(sig.name)} 서명">
                        </button>
                        <button type="button" class="saved-sig-del" data-del-sig="${U.escapeHtml(sig.id)}" aria-label="서명 삭제">×</button>
                      </div>
                    `;
                  })
                  .join('')}
              </div>`
            : '';

        bodyHtml = `
          ${savedSigHtml}
          <div class="sig-pad-toolbar">
            <div class="sig-pen-colors" role="group" aria-label="서명 잉크 색상">
              ${[
                { hex: '#111827', name: '검정' },
                { hex: '#1B365D', name: '남색' },
                { hex: '#C81E1E', name: '적색' },
              ]
                .map(
                  (c) =>
                    `<button type="button" class="sig-color-dot ${
                      state.penColor === c.hex ? 'active' : ''
                    }" data-pen-color="${c.hex}" style="background:${c.hex}" title="${c.name}"></button>`
                )
                .join('')}
            </div>
            <div class="sig-pen-widths" role="group" aria-label="펜 굵기">
              ${[
                { w: 2.2, label: '얇게' },
                { w: 3.2, label: '보통' },
                { w: 4.8, label: '굵게' },
              ]
                .map(
                  (item) =>
                    `<button type="button" class="sig-width-btn ${
                      state.penWidth === item.w ? 'active' : ''
                    }" data-pen-width="${item.w}">${item.label}</button>`
                )
                .join('')}
            </div>
          </div>
          <div class="sig-canvas-wrap">
            <canvas id="signaturePadCanvas" class="sig-pad-canvas" aria-label="손가락 또는 마우스 자필 서명 패드"></canvas>
            <div class="sig-pad-hint" id="sigPadHint" style="${state.draftStrokes.length ? 'display:none;' : ''}">여기에 마우스나 손가락으로 서명하세요</div>
          </div>
          <div class="sig-pad-actions">
            <button type="button" class="btn btn-outline btn-sm" id="sigClearPadBtn">지우기</button>
            <button type="button" class="btn btn-outline btn-sm" id="sigDownloadPngBtn">서명 PNG</button>
            <button type="button" class="btn btn-navy btn-sm" id="sigApplyBtn" style="margin-left:auto;">서명 저장 &amp; 날인</button>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="stamp-widget">
          <div class="stamp-widget-head">
            <div class="mark-mode-tabs" role="tablist" aria-label="날인 방식 선택">
              <button type="button" class="mark-mode-tab ${state.mode === 'stamp' ? 'active' : ''}" data-mark-mode="stamp">● 도장 날인</button>
              <button type="button" class="mark-mode-tab ${state.mode === 'signature' ? 'active' : ''}" data-mark-mode="signature">✍ 자필 서명</button>
            </div>
            <a href="/stamp/" class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11.5px;">상세 도장 ↗</a>
          </div>
          ${slotTabsHtml}
          ${bodyHtml}
          ${
            current
              ? `
            <div class="stamp-controls-row">
              <label style="display:flex;align-items:center;gap:6px;flex:1;margin:0;">
                <span style="white-space:nowrap;font-weight:700;">${current.kind === 'signature' ? '서명 크기' : '도장 크기'}</span>
                <input type="range" id="stampSizeSlider" min="12" max="30" step="1" value="${currentSize}" style="flex:1;">
                <span style="width:36px;text-align:right;">${currentSize}mm</span>
              </label>
              <button type="button" class="btn btn-outline btn-sm" id="clearSlotStampBtn" style="padding:4px 8px;font-size:12px;">날인 해제</button>
            </div>
          `
              : ''
          }
        </div>
      `;

      // Mode tabs (도장 / 자필 서명)
      container.querySelectorAll('[data-mark-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.mode = btn.getAttribute('data-mark-mode');
          render();
        });
      });

      // Slot tabs
      container.querySelectorAll('.stamp-slot-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeSlot = btn.getAttribute('data-slot');
          render();
        });
      });

      // Stamp tray clicks
      container.querySelectorAll('.saved-stamp-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-stamp-id');
          const cur = state.stampsBySlot[state.activeSlot];
          if (cur && cur.kind === 'stamp' && cur.id === id) {
            state.stampsBySlot[state.activeSlot] = null;
          } else {
            const found = SE.loadSavedStamps().find((s) => s.id === id);
            if (found) {
              state.stampsBySlot[state.activeSlot] = {
                id: found.id,
                kind: 'stamp',
                dataUrl: found.dataUrl,
                name: found.name,
                cfg: found.cfg || { text: found.name, shape: found.shape || 'circle' },
                sizeMm: activeDef.sizeMm || state.defaultSizeMm,
              };
            }
          }
          render();
          onChange(state.stampsBySlot);
        });
      });

      // Quick stamp creation
      const quickBtn = container.querySelector('#quickStampBtn');
      if (quickBtn) {
        quickBtn.addEventListener('click', () => {
          const nameInput = container.querySelector('#quickStampName');
          const shapeSelect = container.querySelector('#quickStampShape');
          const name = (nameInput.value || '').trim();
          if (!name) {
            U.showToast('도장에 들어갈 이름이나 상호를 입력해 주세요.');
            nameInput.focus();
            return;
          }
          const shape = shapeSelect.value;
          const cfg = {
            text: name,
            shape,
            font: shape === 'square' ? 'hahmlet' : 'songmyung',
            color: '#C81E1E',
            addInMark: shape !== 'oval' && name.length === 3,
            vintage: 20,
          };
          const savedItem = SE.saveStamp(cfg);
          state.stampsBySlot[state.activeSlot] = {
            id: savedItem.id,
            kind: 'stamp',
            dataUrl: savedItem.dataUrl,
            name: savedItem.name,
            cfg: savedItem.cfg || cfg,
            sizeMm: activeDef.sizeMm || (shape === 'square' ? 21 : state.defaultSizeMm),
          };
          U.showToast(`"${name}" 도장을 생성해 서식에 날인했습니다.`);
          render();
          onChange(state.stampsBySlot);
        });
      }

      // Signature tray & pen controls
      if (state.mode === 'signature') {
        container.querySelectorAll('[data-sig-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-sig-id');
            const cur = state.stampsBySlot[state.activeSlot];
            if (cur && cur.kind === 'signature' && cur.id === id) {
              state.stampsBySlot[state.activeSlot] = null;
            } else {
              const found = loadSavedSignatures().find((s) => s.id === id);
              if (found) {
                state.stampsBySlot[state.activeSlot] = {
                  id: found.id,
                  kind: 'signature',
                  dataUrl: found.dataUrl,
                  name: found.name,
                  strokes: found.strokes || [],
                  sizeMm: activeDef.sizeMm || state.defaultSizeMm,
                };
              }
            }
            render();
            onChange(state.stampsBySlot);
          });
        });

        container.querySelectorAll('[data-del-sig]').forEach((btn) => {
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = btn.getAttribute('data-del-sig');
            deleteSavedSignature(id);
            Object.keys(state.stampsBySlot).forEach((k) => {
              if (state.stampsBySlot[k] && state.stampsBySlot[k].id === id) {
                state.stampsBySlot[k] = null;
              }
            });
            render();
            onChange(state.stampsBySlot);
          });
        });

        container.querySelectorAll('[data-pen-color]').forEach((btn) => {
          btn.addEventListener('click', () => {
            state.penColor = btn.getAttribute('data-pen-color');
            render();
          });
        });

        container.querySelectorAll('[data-pen-width]').forEach((btn) => {
          btn.addEventListener('click', () => {
            state.penWidth = Number(btn.getAttribute('data-pen-width'));
            render();
          });
        });

        bindSignatureCanvas();
      }

      // Size slider
      const sizeSlider = container.querySelector('#stampSizeSlider');
      if (sizeSlider) {
        sizeSlider.addEventListener('input', () => {
          const cur = state.stampsBySlot[state.activeSlot];
          if (cur) {
            cur.sizeMm = Number(sizeSlider.value);
            const label = sizeSlider.nextElementSibling;
            if (label) label.textContent = `${cur.sizeMm}mm`;
            onChange(state.stampsBySlot);
          }
        });
      }

      const clearBtn = container.querySelector('#clearSlotStampBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          state.stampsBySlot[state.activeSlot] = null;
          render();
          onChange(state.stampsBySlot);
        });
      }
    }

    function renderStampHtml(slotKey, placeholderText, extraClass) {
      const mark = state.stampsBySlot[slotKey];
      const label = placeholderText !== undefined ? placeholderText : '(인)';
      const cls = extraClass ? `stamp-anchor ${extraClass}` : 'stamp-anchor';
      if (!mark || !mark.dataUrl) {
        return `<span class="${cls}"><span class="in-label">${U.escapeHtml(label)}</span></span>`;
      }
      const mm = mark.sizeMm || state.defaultSizeMm;
      if (mark.kind === 'signature') {
        const hMm = Math.round(mm * 0.78 * 10) / 10;
        const maxWMm = Math.round(mm * 2.1 * 10) / 10;
        return `
          <span class="${cls}">
            <span class="in-label">${U.escapeHtml(label)}</span>
            <img class="stamp-overlay sig-overlay" src="${mark.dataUrl}" alt="${U.escapeHtml(mark.name)} 서명" style="height:${hMm}mm;width:auto;max-width:${maxWMm}mm;">
          </span>
        `;
      }
      return `
        <span class="${cls}">
          <span class="in-label">${U.escapeHtml(label)}</span>
          <img class="stamp-overlay" src="${mark.dataUrl}" alt="${U.escapeHtml(mark.name)} 도장" style="width:${mm}mm;height:${mm}mm;">
        </span>
      `;
    }

    function exportForShare() {
      const out = {};
      Object.keys(state.stampsBySlot).forEach((slotKey) => {
        const m = state.stampsBySlot[slotKey];
        if (!m) return;
        if (m.kind === 'signature' && m.strokes && m.strokes.length) {
          out[slotKey] = {
            k: 'g',
            nm: m.name || '서명',
            sz: m.sizeMm || state.defaultSizeMm,
            st: simplifyStrokes(m.strokes),
          };
        } else if (m.kind === 'stamp' || m.dataUrl) {
          const cfg = m.cfg || { text: m.name || '도장', shape: 'circle', font: 'songmyung', color: '#C81E1E', vintage: 20 };
          out[slotKey] = {
            k: 's',
            nm: m.name || cfg.text || '도장',
            sz: m.sizeMm || state.defaultSizeMm,
            cfg,
          };
        }
      });
      return out;
    }

    function importFromShare(sharedMarks) {
      if (!sharedMarks || typeof sharedMarks !== 'object') return;
      let changed = false;
      Object.keys(sharedMarks).forEach((slotKey) => {
        const item = sharedMarks[slotKey];
        if (!item) return;
        if (item.k === 'g' && Array.isArray(item.st) && item.st.length) {
          const dataUrl = renderStrokesToDataUrl(item.st);
          if (dataUrl) {
            state.stampsBySlot[slotKey] = {
              id: 'shared_sig_' + slotKey,
              kind: 'signature',
              dataUrl,
              name: item.nm || '상대방 서명',
              strokes: item.st,
              sizeMm: item.sz || state.defaultSizeMm,
            };
            changed = true;
          }
        } else if (item.k === 's' && item.cfg) {
          const dataUrl = SE.generateDataUrl(item.cfg);
          state.stampsBySlot[slotKey] = {
            id: 'shared_st_' + slotKey,
            kind: 'stamp',
            dataUrl,
            name: item.nm || item.cfg.text || '도장',
            cfg: item.cfg,
            sizeMm: item.sz || state.defaultSizeMm,
          };
          changed = true;
        }
      });
      if (changed) {
        render();
        onChange(state.stampsBySlot);
      }
    }

    function applySavedStampById(id, targetSlot) {
      const slotKey = targetSlot || slots[0].key;
      const found = SE.loadSavedStamps().find((s) => s.id === id);
      if (!found) return false;
      const def = slots.find((s) => s.key === slotKey) || slots[0];
      state.stampsBySlot[slotKey] = {
        id: found.id,
        kind: 'stamp',
        dataUrl: found.dataUrl,
        name: found.name,
        cfg: found.cfg || { text: found.name, shape: found.shape || 'circle' },
        sizeMm: def.sizeMm || state.defaultSizeMm,
      };
      render();
      onChange(state.stampsBySlot);
      return true;
    }

    function applySavedSignatureById(id, targetSlot) {
      const slotKey = targetSlot || slots[0].key;
      const found = loadSavedSignatures().find((s) => s.id === id);
      if (!found) return false;
      const def = slots.find((s) => s.key === slotKey) || slots[0];
      state.stampsBySlot[slotKey] = {
        id: found.id,
        kind: 'signature',
        dataUrl: found.dataUrl,
        name: found.name,
        strokes: found.strokes || [],
        sizeMm: def.sizeMm || state.defaultSizeMm,
      };
      render();
      onChange(state.stampsBySlot);
      return true;
    }

    function hasAnyMark() {
      return Object.keys(state.stampsBySlot).some((k) => Boolean(state.stampsBySlot[k]));
    }

    function getAppliedSlots() {
      return Object.keys(state.stampsBySlot).filter((k) => Boolean(state.stampsBySlot[k]));
    }

    render();
    setTimeout(() => onChange(state.stampsBySlot), 0);

    return {
      getState: () => state.stampsBySlot,
      getSlotDefs: () => slots,
      hasAnyMark,
      getAppliedSlots,
      renderStampHtml,
      exportForShare,
      importFromShare,
      applySavedStampById,
      applySavedSignatureById,
      refresh: render,
    };
  }

  window.StampWidget = {
    create: createStampWidget,
    loadSavedSignatures,
    saveSignature,
    deleteSavedSignature,
    renderStrokesToDataUrl,
  };
})(window);
