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
          <Routes>
              <Route path = {"/signup"} element = {<Signup/>}/>
              <Route path = {"/login"} element = {<Login/>}/>
              <Route path = {"/main"} element = {<Main/>}/>
              <Route path = {"/"} element = {<Navigate to = {"/Login"}/>}/>
          </Routes>
      </>
  )
}