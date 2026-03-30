const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('vi-VN')

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatMoney(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '—'
  }

  return moneyFormatter.format(numericValue)
}

export function formatNumber(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '—'
  }

  return numberFormatter.format(numericValue)
}

export function formatPercent(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '—'
  }

  return `${numberFormatter.format(numericValue * 100)}%`
}

export function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return dateTimeFormatter.format(date)
}
