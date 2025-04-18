import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useNavigate, NavLink } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async values => {
    setLoading(true)
    try {
      await axios.post('/api/login', {
        username: values.username,
        password: values.password
      })
      message.success('Login successful')
      navigate('/main')
    } catch {
      message.error('Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="form-container">
      <h2>Sign In</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign In
          </Button>
        </Form.Item>
      </Form>
      <div className="link-row">
        <NavLink to="/signup">No account? Sign Up</NavLink>
      </div>
    </div> //ok
  )
}
