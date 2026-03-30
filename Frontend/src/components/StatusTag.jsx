import { Tag } from 'antd'

const STATUS_CONFIG = {
  active: { color: 'green', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  pending: { color: 'gold', label: 'Pending' },
  paid: { color: 'blue', label: 'Paid' },
}

export default function StatusTag({ status }) {
  const key = String(status || '').toLowerCase()
  const config = STATUS_CONFIG[key] || {
    color: 'default',
    label: status || 'Unknown',
  }

  return <Tag color={config.color}>{config.label}</Tag>
}
