/* ==========================================================================
   바로서식 (BaroDoc) — Universal Stamp Picker & Inline Quick-Stamp Widget
   Shared across all 7 form pages for 1-click stamp application
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SE = window.StampEngine;

  function createStampWidget(options) {
    const container = document.getElementById(options.containerId || 'stampWidgetContainer');
    if (!container) return null;

    // slots: [{ key: 'primary', label: '작성자 (인)', defaultName: '홍길동', defaultShape: 'circle' }, ...]
    const slots = options.slots || [
      { key: 'primary', label: '작성자 도장 (인)', defaultName: '홍길동', defaultShape: 'circle' },
    ];
    const onChange = typeof options.onChange === 'function' ? options.onChange : function () {};

    const state = {
      activeSlot: slots[0].key,
      stampsBySlot: {}, // { slotKey: { id, dataUrl, name, sizeMm } | null }
      defaultSizeMm: options.defaultSizeMm || 18,
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
          dataUrl: found.dataUrl,
          name: found.name,
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

    function render() {
      const saved = SE.loadSavedStamps();
      const activeDef = getActiveSlotDef();
      const current = state.stampsBySlot[state.activeSlot];
      const currentSize = (current && current.sizeMm) || activeDef.sizeMm || state.defaultSizeMm;

      let slotTabsHtml = '';
      if (slots.length > 1) {
        slotTabsHtml = `
          <div class="stamp-slot-tabs" role="tablist">
            ${slots
              .map((s) => {
                const applied = Boolean(state.stampsBySlot[s.key]);
                return `<button type="button" class="stamp-slot-tab ${
                  s.key === state.activeSlot ? 'active' : ''
                }" data-slot="${U.escapeHtml(s.key)}">${U.escapeHtml(s.label)}${
                  applied ? ' ✓' : ''
                }</button>`;
              })
              .join('')}
          </div>
        `;
      }

      let savedHtml = '';
      if (saved.length > 0) {
        savedHtml = `
          <div class="saved-stamps-grid">
            ${saved
              .map((item) => {
                const isSelected = current && current.id === item.id;
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
          </div>
        `;
      } else {
        savedHtml = `
          <p class="field-help" style="margin:0 0 8px;">
            저장된 도장이 없습니다. 아래에 이름을 입력해 3초 만에 즉시 찍거나,
            <a href="/stamp/" style="color:var(--seal-red);font-weight:700;text-decoration:underline;">도장 만들기</a>에서 상세 디자인할 수 있습니다.
          </p>
        `;
      }

      const rawSuggested =
        (typeof options.getSuggestedName === 'function' && options.getSuggestedName(state.activeSlot)) ||
        activeDef.defaultName ||
        '홍길동';
      const suggestedName = String(rawSuggested).replace(/\s+/g, '').slice(0, 9);

      container.innerHTML = `
        <div class="stamp-widget">
          <div class="stamp-widget-head">
            <strong>● 도장 날인 (선택)</strong>
            <a href="/stamp/" class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:12px;">상세 도장 만들기 ↗</a>
          </div>
          ${slotTabsHtml}
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
          ${
            current
              ? `
            <div class="stamp-controls-row">
              <label style="display:flex;align-items:center;gap:6px;flex:1;margin:0;">
                <span style="white-space:nowrap;font-weight:700;">크기</span>
                <input type="range" id="stampSizeSlider" min="12" max="28" step="1" value="${currentSize}" style="flex:1;">
                <span style="width:36px;text-align:right;">${currentSize}mm</span>
              </label>
              <button type="button" class="btn btn-outline btn-sm" id="clearSlotStampBtn" style="padding:4px 8px;font-size:12px;">날인 해제</button>
            </div>
          `
              : ''
          }
        </div>
      `;

      // Bind events
      container.querySelectorAll('.stamp-slot-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeSlot = btn.getAttribute('data-slot');
          render();
        });
      });

      container.querySelectorAll('.saved-stamp-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-stamp-id');
          const cur = state.stampsBySlot[state.activeSlot];
          if (cur && cur.id === id) {
            state.stampsBySlot[state.activeSlot] = null;
          } else {
            const found = SE.loadSavedStamps().find((s) => s.id === id);
            if (found) {
              state.stampsBySlot[state.activeSlot] = {
                id: found.id,
                dataUrl: found.dataUrl,
                name: found.name,
                sizeMm: activeDef.sizeMm || state.defaultSizeMm,
              };
            }
          }
          render();
          onChange(state.stampsBySlot);
        });
      });

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
            dataUrl: savedItem.dataUrl,
            name: savedItem.name,
            sizeMm: activeDef.sizeMm || (shape === 'square' ? 21 : state.defaultSizeMm),
          };
          U.showToast(`"${name}" 도장을 생성해 서식에 날인했습니다.`);
          render();
          onChange(state.stampsBySlot);
        });
      }

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
      const stamp = state.stampsBySlot[slotKey];
      const label = placeholderText !== undefined ? placeholderText : '(인)';
      const cls = extraClass ? `stamp-anchor ${extraClass}` : 'stamp-anchor';
      if (!stamp || !stamp.dataUrl) {
        return `<span class="${cls}"><span class="in-label">${U.escapeHtml(label)}</span></span>`;
      }
      const mm = stamp.sizeMm || state.defaultSizeMm;
      return `
        <span class="${cls}">
          <span class="in-label">${U.escapeHtml(label)}</span>
          <img class="stamp-overlay" src="${stamp.dataUrl}" alt="${U.escapeHtml(stamp.name)} 도장" style="width:${mm}mm;height:${mm}mm;">
        </span>
      `;
    }

    render();
    // Notify initial state (e.g. when ?stamp=auto pre-populated)
    setTimeout(() => onChange(state.stampsBySlot), 0);

    return {
      getState: () => state.stampsBySlot,
      renderStampHtml,
      refresh: render,
    };
  }

  window.StampWidget = {
    create: createStampWidget,
  };
})(window);
