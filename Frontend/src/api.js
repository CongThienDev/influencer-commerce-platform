const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1'
const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return ''
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))

  if (!cookie) {
    return ''
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

function buildHeaders(options, method) {
  const headers = {
    ...(options.headers || {})
  }

  if (!headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCookieValue('csrf_token')
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
  }

  return headers
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function createRequestError(response, payload) {
  const message =
    payload?.message ||
    payload?.error ||
    response.statusText ||
    'Request failed'
  const error = new Error(message)
  error.status = response.status
  error.payload = payload
  return error
}

async function refreshSession() {
  const csrfToken = getCookieValue('csrf_token')
  const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {}

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers
  })

  return response.ok
}

async function parseResponse(response, responseType = 'json') {
  if (responseType === 'blob') {
    return response.blob()
  }

  if (responseType === 'text') {
    return response.text()
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.includes('text/')) {
    return response.text()
  }

  return null
}

async function request(path, options = {}, allowRefreshRetry = true) {
  const { responseType, ...fetchOptions } = options
  const method = (fetchOptions.method || 'GET').toUpperCase()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: buildHeaders(fetchOptions, method),
  })

  if (
    response.status === 401 &&
    allowRefreshRetry &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'
  ) {
    const didRefresh = await refreshSession()
    if (didRefresh) {
      return request(path, options, false)
    }
  }

  const data = await parseResponse(response, responseType)

  if (!response.ok) {
    throw createRequestError(response, data)
  }

  return data
}

function listResponse(data, meta, fallback) {
  return {
    data: Array.isArray(data) ? data : [],
    meta: meta || fallback
  }
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMe() {
  return request('/auth/me')
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function getDashboardSummary() {
  return request('/admin/dashboard/summary')
}

export function listInfluencers(params = {}) {
  return request(`/admin/influencers${buildQueryString(params)}`)
}

export function createInfluencer(payload) {
  return request('/admin/influencers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateInfluencer(id, payload) {
  return request(`/admin/influencers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function listCoupons(params = {}) {
  return request(`/admin/coupons${buildQueryString(params)}`)
}

export function createCoupon(payload) {
  return request('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCoupon(id, payload) {
  return request(`/admin/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function listOrders(params = {}) {
  return request(`/admin/orders${buildQueryString(params)}`)
}

export function listCommissions(params = {}) {
  return request(`/admin/commissions${buildQueryString(params)}`)
}

export function markCommissionPaid(id, payload = {}) {
  return request(`/admin/commissions/${id}/pay`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function exportCommissionsCsv(params = {}) {
  const csv = await request(
    `/admin/commissions/export.csv${buildQueryString(params)}`,
    {
      responseType: 'blob',
    }
  )

  return csv
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export { listResponse }
