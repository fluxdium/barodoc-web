/* ==========================================================================
   바로서식 (BaroDoc) — Dedicated Stamp Maker Page Controller (/stamp/)
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;
  const SE = window.StampEngine;

  function initStampPage() {
    const canvas = document.getElementById('stampCanvas');
    if (!canvas) return;

    const today = new Date();
    const shortDate = `${String(today.getFullYear()).slice(-2)}.${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(today.getDate()).padStart(2, '0')}`;

    const cfg = SE.defaultConfig({
      text: '홍길동',
      shape: 'circle',
      font: 'songmyung',
      color: '#C81E1E',
      borderWidth: 14,
      fontSizeScale: 1.0,
      addInMark: true,
      inMarkChar: '印',
      layout: 'auto',
      vintage: 20,
      approvalDept: '담당',
      approvalDate: shortDate,
    });

    const elText = document.getElementById('stampText');
    const elFont = document.getElementById('stampFont');
    const elLayout = document.getElementById('stampLayout');
    const elAddIn = document.getElementById('stampAddIn');
    const elInChar = document.getElementById('stampInChar');
    const elBorder = document.getElementById('stampBorder');
    const elScale = document.getElementById('stampScale');
    const elVintage = document.getElementById('stampVintage');
    const elApprovalBox = document.getElementById('approvalExtraFields');
    const elApprovalDept = document.getElementById('approvalDept');
    const elApprovalDate = document.getElementById('approvalDate');
    const elDemoImg = document.getElementById('paperDemoSealImg');
    const elDemoName = document.getElementById('paperDemoName');
    const elTrayGrid = document.getElementById('savedTrayGrid');

    if (elApprovalDate) elApprovalDate.value = shortDate;

    function syncControlsVisibility() {
      if (elApprovalBox) {
        elApprovalBox.style.display = cfg.shape === 'approval' ? 'block' : 'none';
      }
      const layoutField = document.getElementById('layoutOptionWrap');
      if (layoutField) {
        layoutField.style.display = cfg.shape === 'circle' ? 'block' : 'none';
      }
      const inMarkWrap = document.getElementById('inMarkWrap');
      if (inMarkWrap) {
        inMarkWrap.style.display = cfg.shape === 'circle' || cfg.shape === 'square' ? 'block' : 'none';
      }
    }

    function updatePreview() {
      SE.drawStamp(canvas, cfg);
      const dataUrl = canvas.toDataURL('image/png');
      if (elDemoImg) elDemoImg.src = dataUrl;
      if (elDemoName) elDemoName.textContent = (cfg.text || '홍길동').trim();

      const lblBorder = document.getElementById('valBorder');
      if (lblBorder) lblBorder.textContent = `${cfg.borderWidth}px`;
      const lblScale = document.getElementById('valScale');
      if (lblScale) lblScale.textContent = `${Math.round(cfg.fontSizeScale * 100)}%`;
      const lblVintage = document.getElementById('valVintage');
      if (lblVintage) lblVintage.textContent = `${cfg.vintage}%`;
    }

    function renderSavedTray() {
      if (!elTrayGrid) return;
      const list = SE.loadSavedStamps();
      if (list.length === 0) {
        elTrayGrid.innerHTML =
          '<p class="field-help" style="grid-column:1/-1;margin:0;">아직 저장된 도장이 없습니다. 위에서 <strong>"내 도장함에 저장"</strong>을 누르면 7종 서식 페이지 어디서나 클릭 한 번으로 바로 찍을 수 있습니다.</p>';
        return;
      }
      elTrayGrid.innerHTML = list
        .map(
          (item) => `
          <div class="tray-item">
            <img src="${item.dataUrl}" alt="${U.escapeHtml(item.label)}">
            <div class="tray-item-name">${U.escapeHtml(item.label)}</div>
            <div class="tray-item-actions">
              <button type="button" class="btn btn-outline btn-sm" data-dl="${U.escapeHtml(
                item.id
              )}" style="padding:3px 7px;font-size:11.5px;">PNG</button>
              <button type="button" class="btn btn-ghost btn-sm" data-del="${U.escapeHtml(
                item.id
              )}" style="padding:3px 7px;font-size:11.5px;color:var(--seal-red);">삭제</button>
            </div>
          </div>
        `
        )
        .join('');

      elTrayGrid.querySelectorAll('[data-dl]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const found = SE.loadSavedStamps().find((s) => s.id === btn.getAttribute('data-dl'));
          if (found) SE.downloadDataUrl(found.dataUrl, `barodoc-stamp-${found.name}.png`);
        });
      });

      elTrayGrid.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', () => {
          SE.deleteStamp(btn.getAttribute('data-del'));
          U.showToast('저장된 도장을 삭제했습니다.');
          renderSavedTray();
        });
      });
    }

    // Bind Shape Buttons
    document.querySelectorAll('.shape-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        cfg.shape = btn.getAttribute('data-shape');

        // Helpful preset adjustments when switching to square company seal
        if (cfg.shape === 'square' && elText && elText.value.trim() === '홍길동') {
          elText.value = '바로서식주식회사인';
          cfg.text = '바로서식주식회사인';
        } else if (cfg.shape !== 'square' && elText && elText.value.trim() === '바로서식주식회사인') {
          elText.value = '홍길동';
          cfg.text = '홍길동';
        }

        syncControlsVisibility();
        updatePreview();
      });
    });

    // Bind Preset Chips
    document.querySelectorAll('[data-stamp-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-stamp-preset');
        if (type === 'personal') {
          cfg.text = '홍길동';
          cfg.shape = 'circle';
          cfg.font = 'songmyung';
          cfg.addInMark = true;
          cfg.inMarkChar = '印';
          cfg.color = '#C81E1E';
        } else if (type === 'oval') {
          cfg.text = '김서연';
          cfg.shape = 'oval';
          cfg.font = 'batang';
          cfg.color = '#C81E1E';
        } else if (type === 'company') {
          cfg.text = '바로상사대표이사인';
          cfg.shape = 'square';
          cfg.font = 'hahmlet';
          cfg.addInMark = false;
          cfg.color = '#C81E1E';
        } else if (type === 'approval') {
          cfg.text = '이팀장';
          cfg.shape = 'approval';
          cfg.font = 'gothic';
          cfg.approvalDept = '승인';
          cfg.color = '#DC2626';
        }
        if (elText) elText.value = cfg.text;
        if (elFont) elFont.value = cfg.font;
        if (elAddIn) elAddIn.checked = cfg.addInMark;
        if (elApprovalDept) elApprovalDept.value = cfg.approvalDept;
        document.querySelectorAll('.shape-btn').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-shape') === cfg.shape);
        });
        document.querySelectorAll('.color-swatch').forEach((s) => {
          s.classList.toggle('active', s.getAttribute('data-color') === cfg.color);
        });
        syncControlsVisibility();
        updatePreview();
      });
    });

    // Bind Color Swatches
    document.querySelectorAll('.color-swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        cfg.color = btn.getAttribute('data-color');
        updatePreview();
      });
    });

    if (elText) {
      elText.addEventListener('input', () => {
        cfg.text = elText.value;
        updatePreview();
      });
    }
    if (elFont) {
      elFont.addEventListener('change', () => {
        cfg.font = elFont.value;
        updatePreview();
      });
    }
    if (elLayout) {
      elLayout.addEventListener('change', () => {
        cfg.layout = elLayout.value;
        updatePreview();
      });
    }
    if (elAddIn) {
      elAddIn.addEventListener('change', () => {
        cfg.addInMark = elAddIn.checked;
        updatePreview();
      });
    }
    if (elInChar) {
      elInChar.addEventListener('change', () => {
        cfg.inMarkChar = elInChar.value;
        updatePreview();
      });
    }
    if (elBorder) {
      elBorder.addEventListener('input', () => {
        cfg.borderWidth = Number(elBorder.value);
        updatePreview();
      });
    }
    if (elScale) {
      elScale.addEventListener('input', () => {
        cfg.fontSizeScale = Number(elScale.value) / 100;
        updatePreview();
      });
    }
    if (elVintage) {
      elVintage.addEventListener('input', () => {
        cfg.vintage = Number(elVintage.value);
        updatePreview();
      });
    }
    if (elApprovalDept) {
      elApprovalDept.addEventListener('input', () => {
        cfg.approvalDept = elApprovalDept.value;
        updatePreview();
      });
    }
    if (elApprovalDate) {
      elApprovalDate.addEventListener('input', () => {
        cfg.approvalDate = elApprovalDate.value;
        updatePreview();
      });
    }

    const btnDownload = document.getElementById('downloadStampBtn');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        const safeName = (cfg.text || 'stamp').replace(/[^가-힣a-zA-Z0-9_-]/g, '') || 'stamp';
        SE.downloadDataUrl(dataUrl, `바로서식_투명도장_${safeName}.png`);
        U.showToast('투명 배경 PNG 도장이 다운로드되었습니다.');
      });
    }

    const btnSave = document.getElementById('saveStampBtn');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        SE.saveStamp(cfg, dataUrl);
        renderSavedTray();
        U.showToast('내 도장함에 저장되었습니다! 아래 서식을 누르면 자동으로 날인됩니다.');
      });
    }

    // Re-draw once web fonts finish loading so Korean seal font renders crisply
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updatePreview);
    }

    syncControlsVisibility();
    updatePreview();
    renderSavedTray();
  }

  document.addEventListener('DOMContentLoaded', initStampPage);
})(window);
