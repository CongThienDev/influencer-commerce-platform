import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import {
  createCoupon,
  listCoupons,
  listInfluencers,
  updateCoupon,
} from '../../api'
import SectionHeader from '../../components/SectionHeader'
import StatusTag from '../../components/StatusTag'
import { formatDateTime, formatMoney, formatNumber } from '../../lib/formatters'
import { usePaginatedResource } from '../../hooks/usePaginatedResource'

const PAGE_SIZE = 10

function toDateValue(value) {
  return value ? dayjs(value) : null
}

function toIsoString(value) {
  return value ? value.toISOString() : null
}

export default function CouponsPage() {
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [influencers, setInfluencers] = useState([])
  const [influencerLoading, setInfluencerLoading] = useState(false)

  const { data, meta, loading, error, query, setQuery, refresh } =
    usePaginatedResource(listCoupons, { page: 1, limit: PAGE_SIZE })

  useEffect(() => {
    let active = true

    async function loadInfluencerOptions() {
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

    void loadInfluencerOptions()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!modalOpen) {
      form.resetFields()
      setEditingRecord(null)
    }
  }, [form, modalOpen])

  const loadCouponTable = (values = {}) => {
    setQuery({
      ...query,
      page: 1,
      ...values,
    })
  }

  const openCreateModal = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'active',
      discount_type: 'percent',
    })
    setModalOpen(true)
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      code: record.code,
      influencer_id: record.influencer_id,
      discount_type: record.discount_type,
      discount_value: record.discount_value,
      usage_limit: record.usage_limit,
      valid_from: toDateValue(record.valid_from),
      valid_to: toDateValue(record.valid_to),
      slug: record.slug,
      status: record.status,
    })
    setModalOpen(true)
  }

  const saveCoupon = async () => {
    const values = await form.validateFields()

    const payload = {
      influencer_id: values.influencer_id,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      usage_limit: values.usage_limit ?? null,
      valid_from: toIsoString(values.valid_from),
      valid_to: toIsoString(values.valid_to),
      slug: values.slug || null,
      status: values.status,
    }

    try {
      if (editingRecord) {
        await updateCoupon(editingRecord.id, payload)
        message.success('Coupon updated')
      } else {
        await createCoupon({
          code: values.code,
          ...payload,
        })
        message.success('Coupon created')
      }

      setModalOpen(false)
      refresh()
    } catch (saveError) {
      message.error(saveError.message || 'Unable to save coupon')
    }
  }

  const disableCoupon = async (record) => {
    try {
      await updateCoupon(record.id, { status: 'inactive' })
      message.success('Coupon disabled')
      refresh()
    } catch (actionError) {
      message.error(actionError.message || 'Unable to disable coupon')
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        render: (value, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.slug || 'No slug'}</Typography.Text>
          </Space>
        ),
      },
      {
        title: 'Influencer',
        dataIndex: 'influencer_name',
        key: 'influencer_name',
        render: (value, record) => value || record.influencer_id,
      },
      {
        title: 'Discount',
        key: 'discount',
        render: (_, record) =>
          record.discount_type === 'percent'
            ? `${formatNumber(record.discount_value)}%`
            : formatMoney(record.discount_value),
      },
      {
        title: 'Used',
        dataIndex: 'used_count',
        key: 'used_count',
        render: (value) => formatNumber(value),
      },
      {
        title: 'Revenue',
        key: 'revenue',
        render: (_, record) => formatMoney(record.total_revenue ?? record.revenue),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value) => <StatusTag status={value} />,
      },
      {
        title: 'Valid to',
        dataIndex: 'valid_to',
        key: 'valid_to',
        render: (value) => formatDateTime(value),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => openEditModal(record)}>
              Edit
            </Button>
            {record.status === 'active' ? (
              <Popconfirm
                title="Disable this coupon?"
                description="This coupon will stop validating for checkout flows."
                okText="Disable"
                okButtonProps={{ danger: true }}
                onConfirm={() => disableCoupon(record)}
              >
                <Button type="link" danger>
                  Disable
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      },
    ],
    []
  )

  return (
    <div className="page-stack">
      <SectionHeader
        title="Coupons"
        description="Tạo và quản lý coupon code, influence mapping, giới hạn sử dụng và trạng thái kích hoạt."
        actions={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={refresh}>
            Refresh
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Create coupon
          </Button>,
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được danh sách coupon"
          description={error.message}
        />
      ) : null}

      <Card className="panel-card">
        <Space wrap className="filters-bar">
          <Input.Search
            allowClear
            placeholder="Search code or slug"
            defaultValue={query.search}
            onSearch={(value) => loadCouponTable({ search: value || undefined })}
            style={{ width: 280 }}
          />
          <Select
            value={query.status}
            placeholder="Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => loadCouponTable({ status: value || undefined })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
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

      <Modal
        title={editingRecord ? 'Edit coupon' : 'Create coupon'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={saveCoupon}
        okText={editingRecord ? 'Save changes' : 'Create'}
        width={720}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: 'Code is required' }]}
          >
            <Input placeholder="ANNA10" disabled={Boolean(editingRecord)} />
          </Form.Item>
          <Form.Item
            label="Influencer"
            name="influencer_id"
            rules={[{ required: true, message: 'Influencer is required' }]}
          >
            <Select
              showSearch
              loading={influencerLoading}
              placeholder="Select influencer"
              options={influencers.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.email})`,
              }))}
              filterOption={(input, option) =>
                String(option?.label || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Space align="start" className="form-grid">
            <Form.Item
              label="Discount type"
              name="discount_type"
              rules={[{ required: true, message: 'Discount type is required' }]}
            >
              <Select
                style={{ width: 200 }}
                options={[
                  { value: 'percent', label: 'Percent' },
                  { value: 'fixed', label: 'Fixed' },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Discount value"
              name="discount_value"
              rules={[{ required: true, message: 'Discount value is required' }]}
            >
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item label="Usage limit" name="usage_limit">
              <InputNumber min={1} style={{ width: 200 }} />
            </Form.Item>
          </Space>
          <Space align="start" className="form-grid">
            <Form.Item label="Valid from" name="valid_from">
              <DatePicker showTime style={{ width: 200 }} />
            </Form.Item>
            <Form.Item label="Valid to" name="valid_to">
              <DatePicker showTime style={{ width: 200 }} />
            </Form.Item>
          </Space>
          <Form.Item label="Slug" name="slug">
            <Input placeholder="anna" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
