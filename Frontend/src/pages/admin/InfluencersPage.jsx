import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import {
  createInfluencer,
  listInfluencers,
  updateInfluencer,
} from '../../api'
import SectionHeader from '../../components/SectionHeader'
import StatusTag from '../../components/StatusTag'
import { formatDateTime, formatMoney, formatNumber } from '../../lib/formatters'
import { usePaginatedResource } from '../../hooks/usePaginatedResource'

const PAGE_SIZE = 10

export default function InfluencersPage() {
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const { data, meta, loading, error, query, setQuery, refresh } =
    usePaginatedResource(listInfluencers, { page: 1, limit: PAGE_SIZE })

  const loadInfluencerTable = (values = {}) => {
    setQuery({
      ...query,
      page: 1,
      ...values,
    })
  }

  useEffect(() => {
    if (!modalOpen) {
      form.resetFields()
      setEditingRecord(null)
    }
  }, [form, modalOpen])

  const openCreateModal = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'active',
    })
    setModalOpen(true)
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      handle: record.handle,
      status: record.status,
    })
    setModalOpen(true)
  }

  const saveInfluencer = async () => {
    const values = await form.validateFields()
    const payload = {
      name: values.name,
      email: values.email,
      handle: values.handle || null,
      status: values.status,
    }

    try {
      if (editingRecord) {
        await updateInfluencer(editingRecord.id, payload)
        message.success('Influencer updated successfully.')
      } else {
        await createInfluencer(payload)
        message.success('Influencer created successfully.')
      }

      setModalOpen(false)
      refresh()
    } catch (saveError) {
      message.error(saveError.message || 'Failed to save influencer.')
    }
  }

  const deactivateInfluencer = async (record) => {
    try {
      await updateInfluencer(record.id, { status: 'inactive' })
      message.success('Influencer deactivated successfully.')
      refresh()
    } catch (actionError) {
      message.error(actionError.message || 'Failed to deactivate influencer.')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.handle || 'No handle'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Codes',
      dataIndex: 'total_codes',
      key: 'total_codes',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value) => formatMoney(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => <StatusTag status={value} />,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
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
              title="Are you sure you want to deactivate this influencer?"
              description="They will no longer receive new attributions."
              okText="Yes, deactivate"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => deactivateInfluencer(record)}
            >
              <Button type="link" danger>
                Deactivate
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        title="Influencers"
        description="Manage influencer profiles, status, and attributed revenue."
        actions={[
          <Button key="refresh" icon={<ReloadOutlined />} onClick={refresh}>
            Refresh
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Create influencer
          </Button>,
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load influencers"
          description={error.message}
        />
      ) : null}

      <Card className="panel-card">
        <Space wrap className="filters-bar">
          <Input.Search
            allowClear
            placeholder="Search name or email"
            defaultValue={query.search}
            onSearch={(value) => loadInfluencerTable({ search: value || undefined })}
            style={{ width: 280 }}
          />
          <Select
            value={query.status}
            placeholder="Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => loadInfluencerTable({ status: value || undefined })}
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
          locale={{
            emptyText: loading ? 'Loading influencers...' : 'No influencers found.',
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

      <Modal
        title={editingRecord ? 'Edit influencer' : 'Create influencer'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={saveInfluencer}
        okText={editingRecord ? 'Save changes' : 'Create'}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="Anna Lee" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Email is invalid' },
            ]}
          >
            <Input placeholder="anna@example.com" />
          </Form.Item>
          <Form.Item label="Handle" name="handle">
            <Input placeholder="@anna" />
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
