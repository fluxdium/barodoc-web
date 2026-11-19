/* ==========================================================================
   바로문서 (BaroDoc) — Web3Forms Contact Form Handler (/contact/)
   ========================================================================== */

(function (window) {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const typeSelect = document.getElementById('inquiryType');
    const subjectInput = document.getElementById('formSubject');
    const emailInput = document.getElementById('replyEmail');
    const messageInput = document.getElementById('inquiryMessage');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const statusBox = document.getElementById('contactStatus');

    function syncSubject() {
      if (!typeSelect || !subjectInput) return;
      const selectedType = typeSelect.value || '오류 제보';
      subjectInput.value = `[바로문서 문의] ${selectedType}`;
    }

    function showStatus(type, text) {
      if (!statusBox) return;
      statusBox.className = `contact-status ${type}`;
      statusBox.textContent = text;
      statusBox.hidden = false;
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', syncSubject);
    }
    syncSubject();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      syncSubject();

      const accessKeyInput = form.querySelector('input[name="access_key"]');
      const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';
      const msg = messageInput ? messageInput.value.trim() : '';

      if (msg.length < 5) {
        showStatus('error', '문의 내용을 5자 이상 자세히 입력해 주세요.');
        if (messageInput) messageInput.focus();
        return;
      }

      if (!accessKey || accessKey === '여기에_Web3Forms_키_입력') {
        showStatus(
          'warn',
          '아직 Web3Forms Access Key가 설정되지 않았습니다. 관리자 설정(site-config.json)에 발급받은 키를 입력한 뒤 다시 시도해 주세요.'
        );
        return;
      }

      const origText = submitBtn ? submitBtn.textContent : '문의 보내기';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '전송 중...';
      }
      if (statusBox) statusBox.hidden = true;

      try {
        const formData = new FormData(form);
        // Optional reply email: remove empty field so Web3Forms doesn't display blank line
        if (emailInput && !emailInput.value.trim()) {
          formData.delete('reply_email');
        }

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          showStatus(
            'success',
            '문의가 정상적으로 접수되었습니다. 남겨주신 내용은 영업일 기준 1~3일 이내에 확인하겠습니다.'
          );
          form.reset();
          syncSubject();
        } else {
          showStatus(
            'error',
            data.message
              ? `문의 전송에 실패했습니다: ${data.message}`
              : '문의 전송 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          );
        }
      } catch (err) {
        showStatus('error', '네트워크 연결을 확인한 뒤 잠시 후 다시 시도해 주세요.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initContactForm);
})(window);
