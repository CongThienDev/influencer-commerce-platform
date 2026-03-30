import {
  Alert,
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import {
  downloadBlob,
  exportCommissionsCsv,
  listCommissions,
  listInfluencers,
  markCommissionPaid,
} from '../../api'
import SectionHeader from '../../components/SectionHeader'
import StatusTag from '../../components/StatusTag'
import { formatDateTime, formatMoney, formatPercent } from '../../lib/formatters'
import { usePaginatedResource } from '../../hooks/usePaginatedResource'

const PAGE_SIZE = 10

export default function CommissionsPage() {
  const [influencers, setInfluencers] = useState([])
  const [influencerLoading, setInfluencerLoading] = useState(false)

  const { data, meta, loading, error, query, setQuery, refresh } =
    usePaginatedResource(listCommissions, { page: 1, limit: PAGE_SIZE })

  useEffect(() => {
    let active = true

    async function loadInfluencers() {
      setInfluencerLoading(true)

      try {
        const response = await listInfluencers({ page: 1, limit: 100 })
        if (active) {
          setInfluencers(response?.data || [])
        }
      } catch (listError) {
        if (active) {
          setInfluencers([])
        }
      } finally {
        if (active) {
          setInfluencerLoading(false)
        }
      }
    }

    void loadInfluencers()

    return () => {
      active = false
    }
  }, [])

  const applyFilters = (values = {}) => {
    setQuery({
      ...query,
      page: 1,
      ...values,
    })
  }

  const markPaid = async (record) => {
    try {
      await markCommissionPaid(record.id, { note: 'Marked paid from admin dashboard' })
      message.success('Commission marked as paid')
      refresh()
    } catch (actionError) {
      message.error(actionError.message || 'Unable to mark commission as paid')
    }
  }

  const exportCsv = async () => {
    try {
      const csvBlob = await exportCommissionsCsv({
        status: query.status,
        influencer_id: query.influencer_id,
      })
      downloadBlob(csvBlob, `commissions-${query.status || 'all'}.csv`)
      message.success('CSV export started')
    } catch (exportError) {
      message.error(exportError.message || 'Unable to export commissions')
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Influencer',
        dataIndex: 'influencer_name',
        key: 'influencer_name',
        render: (value, record) => value || record.influencer_id,
      },
      {
        title: 'Orders',
        dataIndex: 'order_id',
        key: 'order_id',
        render: (value) => value || '—',
      },
      {
        title: 'Revenue',
        key: 'revenue',
        render: (_, record) =>
          formatMoney(record.revenue ?? record.order_total ?? record.total_amount),
      },
      {
        title: 'Commission',
        dataIndex: 'commission_amount',
        key: 'commission_amount',
        render: (value, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{formatMoney(value)}</Typography.Text>
            <Typography.Text type="secondary">
              {formatPercent(record.commission_rate)}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value) => <StatusTag status={value} />,
      },
      {
        title: 'Paid at',
        dataIndex: 'paid_at',
        key: 'paid_at',
        render: (value) => formatDateTime(value),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) =>
          record.status === 'pending' ? (
            <Popconfirm
              title="Mark this commission as paid?"
              description="This will update the payout status for finance reconciliation."
              okText="Mark paid"
              okButtonProps={{ danger: false }}
              onConfirm={() => markPaid(record)}
            >
              <Button type="link">Mark paid</Button>
            </Popconfirm>
          ) : (
            <Typography.Text type="secondary">No actions</Typography.Text>
          ),
      },
    ],
    []
  )

  return (
    <div className="page-stack">
      <SectionHeader
        title="Commissions"
        description="Xem trạng thái commission, mark as paid và xuất CSV cho finance reconciliation."
        actions={[
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={exportCsv}
            disabled={!data.length}
          >
            Export CSV
          </Button>,
          <Button key="refresh" icon={<ReloadOutlined />} onClick={refresh}>
            Refresh
          </Button>,
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được danh sách commission"
          description={error.message}
        />
      ) : null}

      <Card className="panel-card">
        <Space wrap className="filters-bar">
          <Select
            placeholder="Status"
            allowClear
            value={query.status}
            style={{ width: 180 }}
            onChange={(value) => applyFilters({ status: value || undefined })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
          <Select
            placeholder="Influencer"
            allowClear
            loading={influencerLoading}
            value={query.influencer_id}
            style={{ width: 280 }}
            onChange={(value) => applyFilters({ influencer_id: value || undefined })}
            options={influencers.map((item) => ({
              value: item.id,
              label: `${item.name} (${item.email})`,
            }))}
            showSearch
            filterOption={(input, option) =>
              String(option?.label || '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: meta.page,
            pageSize: meta.limit,
            total: meta.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              setQuery({
                ...query,
                page,
                limit: pageSize,
              })
            },
          }}
        />
      </Card>
    </div>
  )
}
