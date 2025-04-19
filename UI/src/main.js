import "./WeShare.css";
import {React, useState} from "react";
import {
    Form,
    Input,
    Button,
    Space,
    Card,
    message,
    Typography,
    Breadcrumb, Layout, Menu, theme, Avatar, Table, DatePicker, Modal
} from "antd";
import {
    SearchOutlined,
    UserOutlined
} from "@ant-design/icons";
import { NavLink, useNavigate} from "react-router-dom";
import moment from 'moment';
import axios from "axios";

const { RangePicker } = DatePicker;
const Main = () => {
    const { Header, Content, Footer, Sider } = Layout;
    const [current, setCurrent] = useState('trips');
    const [userTrips, setUserTrips] = useState(false);
    let navigate = useNavigate();
    const onClick_Menu = e => {
        console.log('click ', e);
        setCurrent(e.key);
        if (current === 'trips') {
            setUserTrips(true)
        } else {
            setUserTrips(false);
        }
    };
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const onSearch = async (values) => {
        setLoading(true);
        const start_time = values.dateRange ? values.dateRange[0].format('YYYY-MM-DDTHH:mm') : '';
        const end_time = values.dateRange ? values.dateRange[1].format('YYYY-MM-DDTHH:mm') : '';
        const params = {
            starting_location: values.pickupLocation,
            end_destination: values.dropoffLocation,
            start_time: start_time,
            end_time: end_time,
            passenger_count: values.passengerCount,
        };
        try {
            const response = await axios.get('/rides/search', { params });
            setData(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                //no rides found, show empty
                setData([]); //clear the previous result
                message.info('No rides found matching the criteria');
              } else {
                console.error('Error fetching rides:', error);
                message.error('Error fetching ride data');
              }
        }
        setLoading(false);
    };
    const columns = [
        { title: 'Ride ID', dataIndex: 'id', key: 'id' },
        { title: 'Starting Location', dataIndex: 'starting_location', key: 'starting_location' },
        { title: 'End Destination', dataIndex: 'end_destination', key: 'end_destination' },
        {
            title: 'Ride Time',
            dataIndex: 'ride_time',
            key: 'ride_time',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
        },
        { title: 'Number of Passengers', dataIndex: 'number_of_passengers', key: 'number_of_passengers' },
        { title: 'Description', dataIndex: 'ride_description', key: 'ride_description' },
        { key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a>Add</a>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Layout>
                <Header style={{ background: "#e7e7e7", display: 'flex', alignItems: 'center', minHeight: 90}}>
                    <Space direction="horizontal" size="middle" style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{width:'70px'}}></div>
                        <Avatar size={64} icon={<UserOutlined />} onClick={()=>{navigate('/login')}}/>
                        <div style={{width:'500px'}}></div>
                        <Menu onClick={onClick_Menu} selectedKeys={[current]} mode="horizontal" items={[{
                                label: 'Search Trips',
                                key: 'trips',
                                icon: <SearchOutlined/>
                            }, {
                                label: 'Your Trips',
                                key: 'own_trip',
                                icon: <UserOutlined/>
                            }]} style={{ background: "#e7e7e7", width: 250, display: 'flex', alignItems: 'center'}}  disabledOverflow/>
                    </Space>
                </Header>
                    <Layout
                        style={{  background:"#FFFFFF" }}
                    >
                        <Content style={{ padding: '0 24px', minHeight: 900 }}>
                            {userTrips ? (
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
                                ) : (
                                <div style={{ padding: '100px' }}>
                                    <Form layout="vertical" onFinish={onSearch}>
                                        <Form.Item label="Starting Location" name="pickupLocation">
                                            <Input placeholder="e.g. Champaign" />
                                        </Form.Item>
                                        <Form.Item label="End Destination" name="dropoffLocation">
                                            <Input placeholder="e.g. Chicago" />
                                        </Form.Item>
                                        <Form.Item label="Date and Time Range" name="dateRange">
                                            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
                                        </Form.Item>
                                        <Form.Item
                                            label="Number of Passengers"
                                            name="passengerCount"
                                            initialValue={1}
                                            rules={[{ required: true, message: 'Please input number of passengers' }]}
                                        >
                                            <Input type="number" min={1} />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                Search
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                    <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
                                </div>
                            )}

                        </Content>
                    </Layout>
            </Layout>
        </>
    );
}

export default Main;