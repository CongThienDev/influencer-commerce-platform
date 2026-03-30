const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1';
const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

function buildHeaders(options, method) {
  const headers = {
    ...(options.headers || {})
  };

  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCookieValue('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return headers;
}

async function refreshSession() {
  const csrfToken = getCookieValue('csrf_token');
  const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {};

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers
  });

  return response.ok;
}

async function request(path, options = {}, allowRefreshRetry = true) {
  const method = (options.method || 'GET').toUpperCase();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: buildHeaders(options, method),
    ...options
  });

  if (
    response.status === 401 &&
    allowRefreshRetry &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'
  ) {
    const didRefresh = await refreshSession();
    if (didRefresh) {
      return request(path, options, false);
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request('/auth/me');
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function getDashboardSummary() {
  return request('/admin/dashboard/summary');
}
