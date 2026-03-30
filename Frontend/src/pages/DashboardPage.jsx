import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, logout } from '../api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_commission: 0
  });

  useEffect(() => {
    getDashboardSummary()
      .then((data) => setSummary(data))
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-container">
      <Space
        align="center"
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Admin Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            Overview hệ thống coupon/influencer
          </Typography.Text>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Revenue" value={summary.total_revenue} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Orders" value={summary.total_orders} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Commission" value={summary.total_commission} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

