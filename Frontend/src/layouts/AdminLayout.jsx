import {
  Avatar,
  Button,
  Drawer,
  Layout,
  Menu,
  Space,
  Typography,
  Grid,
  message,
} from 'antd'
import {
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoneyCollectOutlined,
  ShoppingOutlined,
  TeamOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getMe, logout } from '../api'
import { formatDateTime } from '../lib/formatters'

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <DashboardOutlined />,
  },
  {
    key: 'influencers',
    label: 'Influencers',
    path: '/admin/influencers',
    icon: <TeamOutlined />,
  },
  {
    key: 'coupons',
    label: 'Coupons',
    path: '/admin/coupons',
    icon: <TagOutlined />,
  },
  {
    key: 'orders',
    label: 'Orders',
    path: '/admin/orders',
    icon: <ShoppingOutlined />,
  },
  {
    key: 'commissions',
    label: 'Commissions',
    path: '/admin/commissions',
    icon: <MoneyCollectOutlined />,
  },
]

function getActiveMenuKey(pathname) {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path))
  return match?.key || 'dashboard'
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let active = true

    getMe()
      .then((profile) => {
        if (active) {
          setUser(profile)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const activeKey = useMemo(
    () => getActiveMenuKey(location.pathname),
    [location.pathname]
  )

  const pageMeta = useMemo(() => {
    const activeItem = NAV_ITEMS.find((item) => item.key === activeKey)
    return {
      title: activeItem?.label || 'Dashboard',
      description:
        activeKey === 'dashboard'
          ? 'Operational overview for coupons, influencers, orders, and commissions'
          : `Manage ${activeItem?.label || 'module'}`,
    }
  }, [activeKey])

  const menuItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      })),
    []
  )

  const navigateTo = (menuKey) => {
    const target = NAV_ITEMS.find((item) => item.key === menuKey)
    if (!target) {
      return
    }

    navigate(target.path)
    setDrawerOpen(false)
  }

  const onLogout = async () => {
    try {
      await logout()
      message.success('Logged out successfully.')
      navigate('/login', { replace: true })
    } catch (error) {
      message.error(error.message || 'Failed to log out.')
      navigate('/login', { replace: true })
    }
  }

  const sidebarMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[activeKey]}
      items={menuItems}
      onClick={({ key }) => navigateTo(key)}
      className="admin-sider__menu"
    />
  )

  return (
    <Layout className="admin-shell">
      {!isMobile ? (
        <Layout.Sider
          width={272}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          className="admin-sider"
        >
          <div className="admin-brand">
            <div className="admin-brand__mark">ICP</div>
            {!collapsed ? (
              <div>
                <Typography.Text className="admin-brand__eyebrow">
                  Admin Console
                </Typography.Text>
                <Typography.Title level={5} className="admin-brand__title">
                  Influencer Platform
                </Typography.Title>
              </div>
            ) : null}
          </div>
          {sidebarMenu}
          <div className="admin-sider__footer">
            {!collapsed ? (
              <Typography.Text type="secondary" className="admin-sider__footer-copy">
                Synced {formatDateTime(new Date())}
              </Typography.Text>
            ) : null}
          </div>
        </Layout.Sider>
      ) : null}

      <Layout className="admin-shell__main">
        <div className="admin-topbar">
          <Space align="center" size="middle">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                className="admin-topbar__icon-button"
              />
            ) : (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed((previous) => !previous)}
                className="admin-topbar__icon-button"
              />
            )}
            <div>
              <Typography.Text className="admin-topbar__eyebrow">
                Admin dashboard
              </Typography.Text>
              <Typography.Title level={4} className="admin-topbar__title">
                {pageMeta.title}
              </Typography.Title>
            </div>
          </Space>

          <Space align="center" size="middle">
            <div className="admin-topbar__user">
              <Avatar className="admin-topbar__avatar">
                {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
              </Avatar>
              <div className="admin-topbar__user-copy">
                <Typography.Text className="admin-topbar__user-name">
                  {user?.name || 'Admin'}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {user?.email || 'Authenticated session'}
                </Typography.Text>
              </div>
            </div>
            <Button icon={<LogoutOutlined />} onClick={onLogout}>
              Logout
            </Button>
          </Space>
        </div>

        <div className="admin-content">
          <div className="admin-content__panel">
            <Typography.Text className="admin-content__subtitle">
              {pageMeta.description}
            </Typography.Text>
            <Outlet context={{ user, pageTitle: pageMeta.title }} />
          </div>
        </div>
      </Layout>

      <Drawer
        open={drawerOpen}
        placement="left"
        onClose={() => setDrawerOpen(false)}
        width={280}
        className="admin-drawer"
      >
        <div className="admin-brand admin-brand--drawer">
          <div className="admin-brand__mark">ICP</div>
          <div>
            <Typography.Text className="admin-brand__eyebrow">
              Admin Console
            </Typography.Text>
            <Typography.Title level={5} className="admin-brand__title">
              Influencer Platform
            </Typography.Title>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => navigateTo(key)}
          className="admin-sider__menu admin-sider__menu--drawer"
        />
      </Drawer>
    </Layout>
  )
}
