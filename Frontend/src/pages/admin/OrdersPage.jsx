import {
  Alert,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { listInfluencers, listOrders } from '../../api'
import SectionHeader from '../../components/SectionHeader'
import { formatDateTime, formatMoney } from '../../lib/formatters'
import { usePaginatedResource } from '../../hooks/usePaginatedResource'

const PAGE_SIZE = 10

export default function OrdersPage() {
  const [influencers, setInfluencers] = useState([])
  const [influencerLoading, setInfluencerLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)

  const { data, meta, loading, error, query, setQuery, refresh } =
    usePaginatedResource(listOrders, { page: 1, limit: PAGE_SIZE })

  useEffect(() => {
    let active = true

    async function loadInfluencers() {
      setInfluencerLoading(true)

      try {
        const response = await listInfluencers({ page: 1, limit: 100 })
        if (active) {
          setInfluencers(response?.data || [])
        }
      } catch {
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

  const onDateRangeChange = (range) => {
    setDateRange(range || [])

    if (!range || !range.length) {
      applyFilters({ from: undefined, to: undefined })
      return
    }

    applyFilters({
      from: range[0]?.toISOString(),
      to: range[1]?.toISOString(),
    })
  }

  const columns = useMemo(
    () => [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (value) => formatMoney(value),
      },
      {
        title: 'Coupon',
        dataIndex: 'coupon_code',
        key: 'coupon_code',
        render: (value) => value || '—',
      },
      {
        title: 'Influencer',
        dataIndex: 'influencer_name',
        key: 'influencer_name',
        render: (value, record) => value || record.influencer_id || '—',
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value) => formatDateTime(value),
      },
    ],
    []
  )

  return (
    <div className="page-stack">
      <SectionHeader
        title="Orders"
        description="Order list with coupon attribution details."
        actions={[
          <button key="refresh" type="button" className="ghost-action" onClick={refresh}>
            <ReloadOutlined />
            Refresh
          </button>,
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load orders"
          description={error.message}
        />
      ) : null}

      <Card className="panel-card">
        <Space wrap className="filters-bar">
          <Input.Search
            allowClear
            placeholder="Coupon code"
            defaultValue={query.coupon_code}
            onSearch={(value) => applyFilters({ coupon_code: value || undefined })}
            style={{ width: 240 }}
          />
          <Select
            placeholder="Influencer"
            allowClear
            loading={influencerLoading}
            style={{ width: 280 }}
            value={query.influencer_id}
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
          <DatePicker.RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            showTime
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{
            emptyText: loading ? 'Loading orders...' : 'No orders found.',
          }}
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
