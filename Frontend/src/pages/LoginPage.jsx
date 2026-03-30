import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setError('')
      await login(values)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__backdrop" />
      <Card className="login-card auth-card">
        <div className="auth-card__eyebrow">Influencer Platform</div>
        <Typography.Title level={2} className="auth-card__title">
          Admin Login
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="auth-card__description">
          Truy cập dashboard quản trị coupon, influencer, order và commission.
        </Typography.Paragraph>
        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Login
          </Button>
        </Form>
      </Card>
    </div>
  )
}
