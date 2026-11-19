/* ==========================================================================
   바로문서 (BaroDoc) — Form Workbench Core Runtime
   Manages draft persistence, mobile tabs, font toggle, stamp sync, A4 print
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SW = window.StampWidget;
  const REGISTRY = {};

  function registerForm(key, def) {
    REGISTRY[key] = def;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function initFormWorkbench() {
    const root = document.getElementById('formWorkbench');
    if (!root) return;

    const formKey = root.getAttribute('data-form-key');
    const def = REGISTRY[formKey];
    if (!def) return;

    const DRAFT_KEY = `barodoc_draft_${formKey}_v1`;
    const editorContainer = document.getElementById('editorFormFields');
    const previewContainer = document.getElementById('a4PreviewTarget');
    const rescaleA4 = U.setupA4Scaler();

    let fontMode = 'serif'; // serif | gothic
    let state = loadDraft() || clone(def.getInitialData());

    function loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Object.assign(clone(def.getInitialData()), parsed);
      } catch (e) {
        return null;
      }
    }

    function saveDraft() {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      } catch (e) {}
    }

    const stampWidget = SW.create({
      containerId: 'stampWidgetContainer',
      slots: def.stampSlots,
      defaultSizeMm: def.defaultStampMm || 18,
      getSuggestedName: (slotKey) => {
        if (typeof def.getSuggestedStampName === 'function') {
          return def.getSuggestedStampName(state, slotKey);
        }
        return '';
      },
      onChange: () => {
        renderPreview();
      },
    });

    function renderPreview() {
      if (!previewContainer) return;
      const html = def.renderA4(state, {
        fontClass: fontMode === 'gothic' ? 'font-gothic' : '',
        renderStamp: (slotKey, label, extraClass) =>
          stampWidget ? stampWidget.renderStampHtml(slotKey, label, extraClass) : `<span>${U.escapeHtml(label || '(인)')}</span>`,
      });
      previewContainer.innerHTML = html;
      requestAnimationFrame(rescaleA4);
    }

    function renderEditor() {
      if (!editorContainer) return;
      def.renderEditor(editorContainer, state, {
        updateField: (field, value, options) => {
          state[field] = value;
          saveDraft();
          renderPreview();
          if (options && options.rerenderEditor) {
            renderEditor();
          }
          if (typeof def.onFieldUpdated === 'function') {
            def.onFieldUpdated(editorContainer, state, field);
          }
        },
        setState: (nextState, options) => {
          state = nextState;
          saveDraft();
          renderPreview();
          if (!options || options.rerenderEditor !== false) {
            renderEditor();
          }
        },
        rerenderAll: () => {
          saveDraft();
          renderEditor();
          renderPreview();
        },
      });
    }

    // Bind Top Toolbar Actions
    const btnSample = document.getElementById('fillSampleBtn');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        state = clone(def.getSampleData());
        saveDraft();
        renderEditor();
        renderPreview();
        if (stampWidget) stampWidget.refresh();
        U.showToast('예시 데이터를 채웠습니다. 본인 내용으로 수정해 사용해 보세요.');
      });
    }

    const btnReset = document.getElementById('resetFormBtn');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state = clone(def.getInitialData());
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}
        renderEditor();
        renderPreview();
        U.showToast('입력 내용을 초기화했습니다.');
      });
    }

    document.querySelectorAll('[data-print-trigger]').forEach((btn) => {
      btn.addEventListener('click', U.triggerPrint);
    });

    // Font Toggle (명조 / 고딕)
    document.querySelectorAll('[data-font-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        fontMode = btn.getAttribute('data-font-mode');
        document.querySelectorAll('[data-font-mode]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-font-mode') === fontMode);
        });
        renderPreview();
      });
    });

    // Mobile Tabs (입력하기 / A4 미리보기)
    const grid = document.getElementById('workbenchGrid');
    document.querySelectorAll('[data-mobile-tab-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-mobile-tab-btn');
        if (grid) grid.setAttribute('data-mobile-tab', target);
        document.querySelectorAll('[data-mobile-tab-btn]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-mobile-tab-btn') === target);
        });
        if (target === 'preview') {
          requestAnimationFrame(rescaleA4);
        }
      });
    });

    renderEditor();
    renderPreview();
  }

  document.addEventListener('DOMContentLoaded', initFormWorkbench);

  window.BaroForms = {
    register: registerForm,
  };
})(window);
