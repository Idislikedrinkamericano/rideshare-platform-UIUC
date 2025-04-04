import "./WeShare.css";
import React from "react";
import {
    Form,
    Input,
    Button,
    Space,
    Layout,
    Card,
    message,
    Typography,
} from "antd";
import { NavLink, useNavigate} from "react-router-dom";

const Login = () => {
    const {Title} = Typography;
    let navigate = useNavigate();
    return (
        <>
            <Layout style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#87eaf9" }}>
                <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "1000px", background: "#FFFFFF" }}>
                    <Space direction="vertical" size="small" style={{ display: "flex"}}>
                        <Space direction="horizontal" size="small" style={{ display: "flex"}}>
                            <div style={{width:'30px'}}></div>
                            <Title level={2} style={{ margin: '50px',display: "flex"}}>
                                Welcome to WeShare
                            </Title>
                        </Space>
                        <Form name="basic" labelCol={{ span: 6 }} style={{ maxWidth: 1000 }} initialValues = {{ remember: true }} autoComplete = "off">
                            <Form.Item label = {
                                <span style = {{ fontSize: 16, width: '200px'}}>
                              Username
                            </span>
                            } name = "username" rules = {[{ required: true, message: "Please input your userName!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label = {
                                <span style = {{ fontSize: 16, width: '200px'}}>
                              Password
                            </span>
                            } name = "Password" rules = {[{ required: true, message: "Please input your password!" }]}>
                                <Input.Password />
                            </Form.Item>

                            <Space direction="horizontal">
                                <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
                                    <Button htmlType="submit" type="primary" style={{ width: 100 }}  onClick = {() => {navigate('/main')}}>
                                        Log In
                                    </Button>
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 18, span: 16 }}>
                                    <Button htmlType="submit" type="primary" style={{ width: 100 }} onClick={()=>{ navigate('/signup') }}>
                                        Sign Up
                                    </Button>
                                </Form.Item>
                            </Space>
                        </Form>
                    </Space>
                </Card>
            </Layout>
        </>
    );
}

export default Login;