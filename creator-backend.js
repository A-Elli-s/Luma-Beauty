(() => {
  const API_BASE = (window.LUMA_CONFIG && window.LUMA_CONFIG.creatorApiUrl) || '';
  const REF_KEY = 'lumaCreatorRef';
  const REF_TS_KEY = 'lumaCreatorRefTimestamp';
  const ATTRIBUTION_DAYS = 30;

  const cleanCode = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);

  function captureReferral() {
    const params = new URLSearchParams(window.location.search);
    const incoming = cleanCode(params.get('ref') || params.get('creator'));
    if (!incoming) return;
    localStorage.setItem(REF_KEY, incoming);
    localStorage.setItem(REF_TS_KEY, String(Date.now()));
    if (API_BASE) {
      fetch(`${API_BASE}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorCode: incoming, landingPath: window.location.pathname })
      }).catch(() => {});
    }
  }

  function currentReferral() {
    const code = cleanCode(localStorage.getItem(REF_KEY));
    const timestamp = Number(localStorage.getItem(REF_TS_KEY) || 0);
    if (!code || !timestamp || Date.now() - timestamp > ATTRIBUTION_DAYS * 86400000) {
      localStorage.removeItem(REF_KEY);
      localStorage.removeItem(REF_TS_KEY);
      return '';
    }
    return code;
  }

  async function submitApplication(form, status) {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.acceptedTerms = true;
    if (!API_BASE) {
      localStorage.setItem('lumaCreatorApplicationDraft', JSON.stringify(payload));
      status.textContent = 'Application saved as a draft on this device. Online submission activates when the backend URL is connected.';
      status.classList.add('saved');
      return;
    }
    status.textContent = 'Submitting application…';
    const response = await fetch(`${API_BASE}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Application could not be submitted.');
    localStorage.removeItem('lumaCreatorApplicationDraft');
    form.reset();
    status.textContent = `Application received. Reference: ${result.applicationId || 'submitted'}.`;
    status.classList.add('saved');
  }

  document.addEventListener('DOMContentLoaded', () => {
    captureReferral();
    const form = document.getElementById('creatorApplication');
    const status = document.getElementById('creatorFormStatus');
    if (!form || !status) return;
    const raw = localStorage.getItem('lumaCreatorApplicationDraft');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        Object.entries(data).forEach(([key, value]) => {
          const input = form.elements.namedItem(key);
          if (input && typeof input.value !== 'undefined' && input.type !== 'checkbox') input.value = value;
        });
      } catch (_) {}
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try { await submitApplication(form, status); }
      catch (error) { status.textContent = error.message; status.classList.remove('saved'); }
      finally { if (button) button.disabled = false; }
    });
  });

  window.LumaCreator = { currentReferral, captureReferral };
})();