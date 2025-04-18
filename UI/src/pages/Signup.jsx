import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useNavigate, NavLink } from 'react-router-dom'
import axios from 'axios'

export default function Signup() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async values => {
    setLoading(true)
    try {
      await axios.post('/api/register', {
        username: values.username,
        email: values.email,
        password: values.password
      })
      message.success('Registration successful')
      navigate('/main')
    } catch {
      message.error('Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <div className="link-row">
        <NavLink to="/">Have an account? Sign In</NavLink>
      </div>
    </div>
  )
}
