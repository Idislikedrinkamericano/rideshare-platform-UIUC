import React from 'react'
import { Layout, Button, Space } from 'antd'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './login'
import Signup from './signup'
import Main from './main'
import './WeShare.css'

export default function WeShare() {
  const navigate = useNavigate()
  return (
    <>
      <Layout.Header className="ws-header">
        <Space>
          <Button type="primary" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/signup')}>Sign Up</Button>
        </Space>
      </Layout.Header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Main />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}