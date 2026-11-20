/* ==========================================================================
   바로서식 (BaroDoc) — Homepage 5-Category Tabs & Korean Choseong Search
   Supports Choseong (ㅅㅈㅅ, ㅊㅇㅈ, ㄱㅈㅅ...), Korean keywords, and instant filtering
   ========================================================================== */

(function (window) {
  'use strict';

  const U = window.BaroUtils;

  function initHomeDirectory() {
    const searchInput = document.getElementById('homeSearchInput');
    const clearBtn = document.getElementById('homeSearchClear');
    const tabBtns = Array.from(document.querySelectorAll('[data-cat-tab]'));
    const tiles = Array.from(document.querySelectorAll('[data-dir-tile]'));
    const emptyState = document.getElementById('homeEmptyState');
    const resetEmptyBtn = document.getElementById('homeResetSearchBtn');
    const countEl = document.getElementById('homeResultCount');
    const utilitySection = document.getElementById('calculators');
    const formsSection = document.getElementById('tools');
    const formGrid = document.getElementById('homeFormsGrid');
    const utilGrid = document.getElementById('homeUtilityGrid');

    if (!searchInput || !tiles.length) return;

    let activeCat = 'all';

    // Precompute choseong tokens for ultra-fast matching across 52+ future forms
    const index = tiles.map((el) => {
      const title = el.getAttribute('data-title') || '';
      const keywords = el.getAttribute('data-keywords') || '';
      const cats = (el.getAttribute('data-categories') || '').split(',').map((c) => c.trim()).filter(Boolean);
      const group = el.getAttribute('data-group') || 'form'; // form | utility
      const tokens = [title, ...keywords.split(/\s+|,/)]
        .map((t) => t.trim())
        .filter(Boolean);
      const choTokens = tokens.map((t) => U.extractChoseong(t.toLowerCase()));
      return { el, title, keywords, cats, group, tokens, choTokens };
    });

    function matchesQuery(item, rawQuery) {
      const q = String(rawQuery || '').trim().toLowerCase().replace(/\s+/g, '');
      if (!q) return true;
      const isChoOnly = /^[ㄱ-ㅎ]+$/.test(q);
      if (isChoOnly) {
        // Match title choseong directly OR token prefix so 'ㅅㅈㅅ' -> 사직서 (not 퇴사정산)
        const titleCho = U.extractChoseong(item.title.toLowerCase().replace(/\s+/g, ''));
        if (titleCho.includes(q)) return true;
        for (let i = 0; i < item.choTokens.length; i++) {
          if (item.choTokens[i].startsWith(q)) return true;
        }
        return false;
      }
      const joined = (item.title + ' ' + item.keywords).toLowerCase().replace(/\s+/g, '');
      if (joined.includes(q)) return true;
      return false;
    }

    function applyFilter() {
      const query = searchInput.value.trim();
      const isSearching = query.length > 0;
      if (clearBtn) clearBtn.style.display = isSearching ? 'inline-flex' : 'none';

      let visibleForms = 0;
      let visibleUtils = 0;

      index.forEach((item) => {
        const catMatch = isSearching || activeCat === 'all' || item.cats.includes(activeCat);
        const queryMatch = matchesQuery(item, query);
        const show = catMatch && queryMatch;
        item.el.style.display = show ? '' : 'none';
        if (show) {
          if (item.group === 'form') visibleForms++;
          else visibleUtils++;
        }
      });

      const totalVisible = visibleForms + visibleUtils;

      if (formsSection) {
        formsSection.style.display = visibleForms > 0 ? '' : 'none';
      }
      if (utilitySection) {
        utilitySection.style.display = visibleUtils > 0 ? '' : 'none';
      }
      if (emptyState) {
        emptyState.style.display = totalVisible === 0 ? 'block' : 'none';
      }
      if (countEl) {
        if (isSearching) {
          countEl.textContent = `"${query}" 검색 결과 ${totalVisible}건`;
        } else if (activeCat === 'all') {
          countEl.textContent = `전체 ${totalVisible}종 바로 작성 가능`;
        } else {
          const activeBtn = tabBtns.find((b) => b.getAttribute('data-cat-tab') === activeCat);
          const label = activeBtn ? activeBtn.getAttribute('data-cat-label') : '';
          countEl.textContent = `${label} ${totalVisible}종`;
        }
      }

      // Keep category tab visual highlight synced
      tabBtns.forEach((b) => {
        const tabKey = b.getAttribute('data-cat-tab');
        b.classList.toggle('active', !isSearching && tabKey === activeCat);
        b.setAttribute('aria-selected', !isSearching && tabKey === activeCat ? 'true' : 'false');
      });

      // Avoid unused ref lint
      void formGrid;
      void utilGrid;
    }

    searchInput.addEventListener('input', applyFilter);

    searchInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const firstVisible = index.find((it) => it.el.style.display !== 'none');
        if (firstVisible && firstVisible.el.getAttribute('href')) {
          ev.preventDefault();
          window.location.href = firstVisible.el.getAttribute('href');
        }
      } else if (ev.key === 'Escape') {
        searchInput.value = '';
        applyFilter();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        applyFilter();
      });
    }

    if (resetEmptyBtn) {
      resetEmptyBtn.addEventListener('click', () => {
        searchInput.value = '';
        activeCat = 'all';
        applyFilter();
        searchInput.focus();
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCat = btn.getAttribute('data-cat-tab') || 'all';
        if (searchInput.value.trim()) {
          searchInput.value = '';
        }
        applyFilter();
      });
    });

    document.querySelectorAll('[data-search-demo]').forEach((chip) => {
      chip.addEventListener('click', () => {
        searchInput.value = chip.getAttribute('data-search-demo') || '';
        applyFilter();
        searchInput.focus();
      });
    });

    applyFilter();
  }

  document.addEventListener('DOMContentLoaded', initHomeDirectory);
})(window);
