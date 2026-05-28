const COUNTRY_URL = 'CountryCodes.json';
const DEFAULT_COUNTRY_ISO = 'IN';
const $ = (selector) => document.querySelector(selector);

const elements = {
  loader: $('#loader'),
  dropdown: $('#dropdown'),
  phone: $('#phoneno'),
  paste: $('#pasteBtn'),
  whatsapp: $('#whatsapp'),
  telegram: $('#telegram'),
  signal: $('#signal'),
  error: $('#error'),
  errorTitle: $('#error-h4'),
  errorBody: $('#error-body'),
  installButton: $('#installAppBtn'),
  installHelp: $('#installHelp'),
  connectionStatus: $('#connectionStatus')
};

let deferredInstallPrompt = null;

function digitsOnly(value = '') {
  return (String(value).match(/\d/g) || []).join('');
}

function normalizeDialingCode(code = '') {
  const firstCode = String(code).split(',')[0].trim();
  return `+${digitsOnly(firstCode)}`;
}

function showError(title, message) {
  if (!elements.error || !elements.errorTitle || !elements.errorBody) return;
  elements.errorTitle.textContent = title;
  elements.errorBody.textContent = message;
  elements.error.classList.remove('hide');
}

function clearError() {
  elements.error?.classList.add('hide');
}

function setControlsDisabled(disabled) {
  [elements.dropdown, elements.phone, elements.paste, elements.whatsapp, elements.telegram, elements.signal]
    .forEach((el) => { if (el) el.disabled = disabled; });
}

function populateCountries(countries) {
  if (!elements.dropdown) return;
  const fragment = document.createDocumentFragment();
  const normalized = countries
    .map((country) => ({
      ...country,
      normalizedCode: normalizeDialingCode(country.code),
      codeDigits: digitsOnly(normalizeDialingCode(country.code))
    }))
    .filter((country) => country.normalizedCode.length > 1);

  for (const country of normalized) {
    const option = document.createElement('option');
    option.value = country.normalizedCode;
    option.dataset.iso = country.iso || '';
    option.dataset.digits = country.codeDigits;
    option.textContent = `${country.country} (${country.code})`;
    fragment.append(option);
  }

  elements.dropdown.replaceChildren(fragment);
  const indiaIndex = Array.from(elements.dropdown.options).findIndex((option) => option.dataset.iso === DEFAULT_COUNTRY_ISO);
  elements.dropdown.selectedIndex = indiaIndex >= 0 ? indiaIndex : 0;
  updatePhoneFromDropdown({ onlyIfEmpty: true });
}

async function loadCountries() {
  setControlsDisabled(true);
  try {
    const response = await fetch(COUNTRY_URL, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Country list request failed: ${response.status}`);
    populateCountries(await response.json());
  } catch (error) {
    console.error(error);
    showError('COUNTRY LIST UNAVAILABLE', 'Country codes could not be loaded. Please refresh the page or try again when the app is online.');
  } finally {
    setControlsDisabled(false);
  }
}

function findCountryFromNumber(value) {
  if (!elements.dropdown) return;
  const numberDigits = digitsOnly(value);
  if (!numberDigits) return;
  let bestMatch = null;
  for (const option of elements.dropdown.options) {
    const codeDigits = option.dataset.digits;
    if (codeDigits && numberDigits.startsWith(codeDigits)) {
      if (!bestMatch || codeDigits.length > bestMatch.dataset.digits.length) bestMatch = option;
    }
  }
  if (bestMatch) elements.dropdown.value = bestMatch.value;
}

function updatePhoneFromDropdown({ onlyIfEmpty = false } = {}) {
  if (!elements.phone || !elements.dropdown) return;
  if (onlyIfEmpty && elements.phone.value.trim()) return;
  elements.phone.value = digitsOnly(elements.dropdown.value);
}

async function pastePhoneNumber() {
  clearError();
  try {
    const text = await navigator.clipboard.readText();
    if (elements.phone) elements.phone.value = digitsOnly(text);
    findCountryFromNumber(text);
    elements.phone?.focus();
  } catch {
    showError('PASTE UNAVAILABLE', 'Clipboard access was blocked by the browser. Please paste the phone number manually.');
  }
}

function buildServiceUrl(service, rawDigits, plusNumber) {
  const isMobileLike = /android|iphone|ipad|ipod|kindle/i.test(navigator.userAgent);
  switch (service) {
    case 'whatsapp': return isMobileLike ? `https://api.whatsapp.com/send/?phone=${rawDigits}` : `https://wa.me/${rawDigits}`;
    case 'telegram': return isMobileLike ? `tg://resolve?phone=${rawDigits}` : `https://t.me/${plusNumber}`;
    case 'signal': return isMobileLike ? `sgnl://p/${rawDigits}` : `https://signal.me/#p/${plusNumber}`;
    default: return '';
  }
}

function handleLink(service) {
  clearError();
  const rawDigits = digitsOnly(elements.phone?.value || '');
  const plusNumber = `+${rawDigits}`;
  if (!rawDigits) return showError('EMPTY FIELD', 'No phone number was entered.');
  if (rawDigits.length < 8) return showError('INVALID PHONE NUMBER', 'Phone number is less than 8 digits.');
  if (!elements.dropdown?.value) return showError('INVALID PHONE NUMBER', 'No country code selected.');
  const serviceLabel = service[0].toUpperCase() + service.slice(1);
  if (!window.confirm(`Redirect to ${serviceLabel}?`)) return;
  const url = buildServiceUrl(service, rawDigits, plusNumber);
  if (url) window.location.assign(url);
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function updateInstallUi({ installed = false } = {}) {
  if (!elements.installButton) return;
  if (installed || isStandaloneMode()) {
    elements.installButton.hidden = true;
    if (elements.installHelp) elements.installHelp.textContent = 'ClickToChat is installed and ready for offline use.';
    return;
  }
  elements.installButton.hidden = !deferredInstallPrompt;
}

function setupInstallPrompt() {
  updateInstallUi();
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUi();
  });
  elements.installButton?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    elements.installButton.disabled = true;
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    elements.installButton.disabled = false;
    elements.installButton.hidden = true;
    if (elements.installHelp) {
      elements.installHelp.textContent = choice.outcome === 'accepted'
        ? 'Install started. You can launch ClickToChat from your app list.'
        : 'Install dismissed. You can still use ClickToChat in the browser.';
    }
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallUi({ installed: true });
  });
}

function updateConnectionStatus() {
  if (!elements.connectionStatus) return;
  const online = navigator.onLine;
  elements.connectionStatus.hidden = false;
  elements.connectionStatus.classList.toggle('online', online);
  elements.connectionStatus.classList.toggle('offline', !online);
  elements.connectionStatus.textContent = online
    ? 'Online — app updates and chat links can use the network.'
    : 'Offline — the app shell and country list are available. Native chat app links will still be attempted.';
  if (online) {
    window.setTimeout(() => {
      if (elements.connectionStatus) elements.connectionStatus.hidden = true;
    }, 3500);
  }
}

function setupEvents() {
  elements.paste?.addEventListener('click', pastePhoneNumber);
  elements.phone?.addEventListener('paste', (event) => {
    event.preventDefault();
    clearError();
    const text = (event.clipboardData || window.clipboardData).getData('text');
    elements.phone.value = digitsOnly(text);
    findCountryFromNumber(text);
  });
  elements.phone?.addEventListener('input', () => { clearError(); findCountryFromNumber(elements.phone.value); });
  elements.dropdown?.addEventListener('change', () => { clearError(); updatePhoneFromDropdown(); });
  elements.whatsapp?.addEventListener('click', () => handleLink('whatsapp'));
  elements.telegram?.addEventListener('click', () => handleLink('telegram'));
  elements.signal?.addEventListener('click', () => handleLink('signal'));
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

function hideLoader() {
  if (!elements.loader) return;
  elements.loader.classList.add('hidden');
  elements.loader.addEventListener('transitionend', () => elements.loader.remove(), { once: true });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.info('Service worker registered:', registration.scope);
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  try {
    setupEvents();
    setupInstallPrompt();
    updateConnectionStatus();
    await loadCountries();
  } catch (error) {
    console.error('App initialization failed:', error);
    showError('APP INITIALIZATION FAILED', 'The app could not initialize completely. Please refresh the page.');
  } finally {
    hideLoader();
  }
});

registerServiceWorker();
