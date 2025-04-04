import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Table, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;

const RideSearch = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const pickupDatetime = values.dateRange ? values.dateRange[0].format('YYYY-MM-DDTHH:mm') : '';
    const dropoffDatetime = values.dateRange ? values.dateRange[1].format('YYYY-MM-DDTHH:mm') : '';
    const params = {
      pickup_location: values.pickupLocation,
      dropoff_location: values.dropoffLocation,
      pickup_datetime: pickupDatetime,
      dropoff_datetime: dropoffDatetime,
      passenger_count: values.passengerCount,
    };
    try {
      const response = await axios.get('/api/search', { params });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      message.error('Error fetching ride data');
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
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ride Search</h1>
      <Form layout="vertical" onFinish={onFinish}>
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
  );
};

export default RideSearch;
