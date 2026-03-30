import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles.css'
import App from './App'

const theme = {
  token: {
    colorPrimary: '#1649ff',
    borderRadius: 14,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
