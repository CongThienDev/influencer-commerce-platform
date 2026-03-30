import { Space, Typography } from 'antd'

export default function SectionHeader({ title, description, actions }) {
  return (
    <div className="section-header">
      <div className="section-header__copy">
        <Typography.Title level={3} className="section-header__title">
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Paragraph className="section-header__description">
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>
      {actions ? <Space wrap>{actions}</Space> : null}
    </div>
  )
}
