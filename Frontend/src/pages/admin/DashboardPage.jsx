import { Alert, Card, Col, Empty, Row, Space, Statistic, Table, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { getDashboardSummary } from '../../api'
import SectionHeader from '../../components/SectionHeader'
import { formatMoney, formatNumber } from '../../lib/formatters'
import StatusTag from '../../components/StatusTag'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getDashboardSummary()
      setSummary(response)
    } catch (dashboardError) {
      setError(dashboardError)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSummary()
  }, [])

  const topInfluencers = useMemo(
    () => summary?.top_influencers || [],
    [summary]
  )

  const topInfluencerColumns = [
    {
      title: 'Influencer',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.influencer_id}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => formatMoney(value),
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      render: (value) => formatMoney(value),
    },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        title="Dashboard"
        description="Theo dõi nhanh doanh thu, số đơn và top influencer tạo doanh thu cao nhất."
        actions={[
          <button
            key="refresh"
            type="button"
            className="ghost-action"
            onClick={loadSummary}
          >
            <ReloadOutlined />
            Refresh
          </button>,
        ]}
      />

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được dashboard summary"
          description={error.message}
          action={
            <button type="button" className="ghost-action" onClick={loadSummary}>
              Retry
            </button>
          }
        />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="metric-card" loading={loading}>
            <Statistic
              title="Total Revenue"
              value={summary?.total_revenue}
              formatter={(value) => formatMoney(value)}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card" loading={loading}>
            <Statistic
              title="Total Orders"
              value={summary?.total_orders}
              formatter={(value) => formatNumber(value)}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="metric-card" loading={loading}>
            <Statistic
              title="Total Commission"
              value={summary?.total_commission}
              formatter={(value) => formatMoney(value)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title="Top 5 Influencers"
            className="panel-card"
            loading={loading}
            extra={<StatusTag status="active" />}
          >
            {topInfluencers.length ? (
              <Table
                rowKey="influencer_id"
                columns={topInfluencerColumns}
                dataSource={topInfluencers}
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty description="Chưa có dữ liệu top influencers" />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card
            title="System Snapshot"
            className="panel-card"
            loading={loading}
          >
            <Space direction="vertical" size="middle" className="stack-full">
              <div className="snapshot-card">
                <Typography.Text type="secondary">Revenue / Order</Typography.Text>
                <Typography.Title level={4} className="snapshot-card__value">
                  {formatMoney(summary?.total_orders ? summary.total_revenue / summary.total_orders : 0)}
                </Typography.Title>
              </div>
              <div className="snapshot-card">
                <Typography.Text type="secondary">Commission / Order</Typography.Text>
                <Typography.Title level={4} className="snapshot-card__value">
                  {formatMoney(
                    summary?.total_orders ? summary.total_commission / summary.total_orders : 0
                  )}
                </Typography.Title>
              </div>
              <div className="snapshot-card">
                <Typography.Text type="secondary">Data status</Typography.Text>
                <Typography.Title level={4} className="snapshot-card__value">
                  Live
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
