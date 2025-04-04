import "./WeShare.css";
import {React, useState} from "react";
import {Form,
    Input,
    Button,
    Space,
    Card,
    message,
    Typography,
    Breadcrumb, Layout, Menu, theme, Avatar} from "antd";
import { UserOutlined } from '@ant-design/icons';
import { NavLink, useNavigate} from "react-router-dom";

const Main = () => {
    const { Header, Content, Footer, Sider } = Layout;
    const { Search } = Input;
    const items = [
        {
            label: 'Current Trip',
            key: 'trips',
        },
        {
            label: 'Your Trip',
            key: 'own_trip',
        }]
    const [current, setCurrent] = useState('trips');
    const onClick = e => {
        console.log('click ', e);
        setCurrent(e.key);
    };
    return (
        <>
            <Layout>
                <Header style={{ background: "#87eaf9", display: 'flex', alignItems: 'center', minHeight: 100}}>
                    <Space direction="horizontal" size="middle" style={{ display: "flex", justifyContent: "space-between" }}>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <div style={{width:'30px'}}></div>
                        <Search placeholder="" style={{ width: 300, marginTop: 15}} />
                        <div style={{width:'900px'}}></div>
                        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} style={{ background: "#87eaf9", minHeight: 120, display: 'flex', alignItems: 'center'}}/>
                    </Space>
                </Header>
                    <Layout
                        style={{  background:"#FFFFFF" }}
                    >
                        <Content style={{ padding: '0 24px', minHeight: 900 }}>
                            <Space direction="vertical" size="middle" style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{width:'30px'}}></div>
                                <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "1650px", height: "190px", background: "#c2fcae" }}>
                                    Information
                                </Card>
                                <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "1650px", height: "190px", background: "#c2fcae" }}>
                                    Information
                                </Card>
                                <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "1650px", height: "190px", background: "#ffd6e8" }}>
                                    Information
                                </Card>
                                <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "1650px", height: "190px", background: "#ffe4c9" }}>
                                    Add Your Trip
                                </Card>
                            </Space>
                        </Content>
                    </Layout>
            </Layout>
        </>
    );
}

export default Main;