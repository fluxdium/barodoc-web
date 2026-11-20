/* ==========================================================================
   바로서식 (BaroDoc) — Form Workbench Core Runtime (Stage 1 Platform Engine)
   Supports both custom forms (register) & declarative schema forms (registerSchema)
   Integrates: Share Link (#d=), Profile Auto-Fill, Stamp/Signature, Presets,
   Live Legal Validation, Pre-Print Checklist, High-Res PNG Export, A4 Scaler
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SW = window.StampWidget;
  const P = window.BaroPlatform;
  const REGISTRY = {};

  function registerForm(key, def) {
    REGISTRY[key] = def;
  }

  function registerSchema(key, schema) {
    if (!P || typeof P.compileSchema !== 'function') return;
    REGISTRY[key] = P.compileSchema(schema);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  async function initFormWorkbench() {
    const root = document.getElementById('formWorkbench');
    if (!root) return;

    const formKey = root.getAttribute('data-form-key');
    const def = REGISTRY[formKey];
    if (!def) return;

    const DRAFT_KEY = `barodoc_draft_${formKey}_v1`;
    const editorContainer = document.getElementById('editorFormFields');
    const previewContainer = document.getElementById('a4PreviewTarget');
    const liveValBar = document.getElementById('liveValidationBar');
    const sharedBanner = document.getElementById('sharedLinkBanner');
    const rescaleA4 = U.setupA4Scaler();

    let fontMode = 'serif'; // serif | gothic
    let state = loadDraft() || clone(def.getInitialData());
    let sharedPayload = null;

    // 1. Check for serverless shared link (#d=...) BEFORE rendering
    if (P && typeof P.readShareHash === 'function') {
      sharedPayload = await P.readShareHash(formKey);
      if (sharedPayload && sharedPayload.s) {
        state = Object.assign(clone(def.getInitialData()), sharedPayload.s);
        if (sharedPayload.m === 'gothic' || sharedPayload.m === 'serif') {
          fontMode = sharedPayload.m;
          document.querySelectorAll('[data-font-mode]').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-font-mode') === fontMode);
          });
        }
        if (sharedBanner) {
          sharedBanner.style.display = 'flex';
          sharedBanner.innerHTML = `
            <div class="shared-banner-body">
              <strong>📩 상대방이 보낸 작성 · 서명 요청 서식입니다</strong>
              <span>보내신 분의 입력 내용과 도장/서명이 채워졌습니다. 본인 정보와 서명·도장만 추가해 바로 PDF로 저장하거나 링크로 회신하세요. (100% 브라우저 처리 · 서버 저장 없음)</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="dismissSharedBannerBtn">닫기</button>
          `;
          const dismissBtn = sharedBanner.querySelector('#dismissSharedBannerBtn');
          if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
              sharedBanner.style.display = 'none';
            });
          }
        }
      }
    }

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
        updateValidation();
      },
    });

    // Hydrate shared stamps/signatures if present
    if (sharedPayload && sharedPayload.t && stampWidget && typeof stampWidget.importFromShare === 'function') {
      stampWidget.importFromShare(sharedPayload.t);
    }

    function updateValidation() {
      if (P && liveValBar) {
        P.renderLiveValidationBar(liveValBar, formKey, def, state, stampWidget);
      }
    }

    function updateProfileButtonState() {
      const fillBtn = document.getElementById('profileFillBtn');
      if (!fillBtn || !P) return;
      const hasData = P.hasProfileData();
      fillBtn.textContent = hasData ? '내 정보 불러오기' : '내 정보 저장/불러오기';
      fillBtn.classList.toggle('has-profile', hasData);
    }

    function renderPreview() {
      if (!previewContainer) return;
      const html = def.renderA4(state, {
        fontClass: fontMode === 'gothic' ? 'font-gothic' : '',
        renderStamp: (slotKey, label, extraClass) =>
          stampWidget
            ? stampWidget.renderStampHtml(slotKey, label, extraClass)
            : `<span>${U.escapeHtml(label || '(인)')}</span>`,
      });
      previewContainer.innerHTML = html;
      requestAnimationFrame(rescaleA4);
    }

    const editorApi = {
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
        updateValidation();
      },
      setState: (nextState, options) => {
        state = nextState;
        saveDraft();
        renderPreview();
        if (!options || options.rerenderEditor !== false) {
          renderEditor();
        }
        updateValidation();
      },
      rerenderAll: () => {
        saveDraft();
        renderEditor();
        renderPreview();
        updateValidation();
      },
    };

    function renderEditor() {
      if (!editorContainer) return;
      def.renderEditor(editorContainer, state, editorApi);
      if (P && typeof P.injectPhrasePresets === 'function') {
        P.injectPhrasePresets(editorContainer, formKey, def, editorApi);
      }
    }

    // Bind Top Toolbar Actions
    const btnSample = document.getElementById('fillSampleBtn');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        state = clone(def.getSampleData());
        saveDraft();
        renderEditor();
        renderPreview();
        updateValidation();
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
        if (window.location.hash && window.location.hash.includes('d=')) {
          try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          } catch (e) {}
        }
        if (sharedBanner) sharedBanner.style.display = 'none';
        renderEditor();
        renderPreview();
        updateValidation();
        U.showToast('입력 내용을 초기화했습니다.');
      });
    }

    // Profile Auto-Fill & Settings
    const profileFillBtn = document.getElementById('profileFillBtn');
    if (profileFillBtn && P) {
      profileFillBtn.addEventListener('click', () => {
        P.triggerProfileFill(formKey, def, state, stampWidget, editorApi.setState, updateProfileButtonState);
      });
    }

    const profileConfigBtn = document.getElementById('profileConfigBtn');
    if (profileConfigBtn && P) {
      profileConfigBtn.addEventListener('click', () => {
        P.openProfileModal(formKey, def, state, stampWidget, editorApi.setState, updateProfileButtonState);
      });
    }

    // Serverless Counterparty Share Link Copy (#d=...)
    document.querySelectorAll('[data-share-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (P) {
          P.triggerShareCopy(formKey, state, def.getInitialData(), fontMode, stampWidget);
        }
      });
    });

    // High-Resolution A4 PNG Image Export
    document.querySelectorAll('[data-png-export]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (P) {
          P.exportA4ToPng(formKey);
        }
      });
    });

    // Pre-Print Missing Item & Legal Checklist Trigger
    document.querySelectorAll('[data-print-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (P && typeof P.handlePrintWithChecklist === 'function') {
          P.handlePrintWithChecklist(formKey, def, state, stampWidget, editorContainer);
        } else {
          U.triggerPrint();
        }
      });
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

    // Mobile Tabs (입력하기 / A4 미리보기) + Floating Bar Sync
    const grid = document.getElementById('workbenchGrid');
    const floatingBar = document.getElementById('mobileFloatingBar');
    const floatingToggleBtn = document.getElementById('mobileFloatingTabToggle');
    if (floatingBar) {
      document.body.classList.add('has-floating-bar');
    }

    function setMobileTab(target) {
      if (grid) grid.setAttribute('data-mobile-tab', target);
      document.querySelectorAll('[data-mobile-tab-btn]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-mobile-tab-btn') === target);
      });
      if (floatingToggleBtn) {
        floatingToggleBtn.textContent = target === 'preview' ? '내용 수정' : '미리보기';
      }
      if (target === 'preview') {
        requestAnimationFrame(rescaleA4);
      }
    }

    document.querySelectorAll('[data-mobile-tab-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMobileTab(btn.getAttribute('data-mobile-tab-btn'));
      });
    });

    if (floatingToggleBtn) {
      floatingToggleBtn.addEventListener('click', () => {
        const cur = grid ? grid.getAttribute('data-mobile-tab') : 'edit';
        setMobileTab(cur === 'preview' ? 'edit' : 'preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    updateProfileButtonState();
    renderEditor();
    renderPreview();
    updateValidation();
  }

  document.addEventListener('DOMContentLoaded', initFormWorkbench);

  window.BaroForms = {
    register: registerForm,
    registerSchema,
    getRegistry: () => REGISTRY,
  };
})(window);
