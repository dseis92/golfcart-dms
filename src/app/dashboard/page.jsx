"use client";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Typography } from "antd";

const columns = [
  { title: "WO#", dataIndex: "id", key: "id" },
  { title: "Cart", dataIndex: "cart", key: "cart" },
  { title: "Customer", dataIndex: "customer", key: "customer" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (s) => {
      const map = {
        intake: "default",
        estimate: "processing",
        approved: "success",
        in_progress: "warning",
        ready: "success",
        delivered: "default"
      };
      return <Tag color={map[s] || "default"} style={{ textTransform: "capitalize" }}>{s.replace("_"," ")}</Tag>;
    }
  }
];

const data = [
  { key: 1, id: "SO-1021", cart: "CART-201", customer: "J. Smith", status: "in_progress" },
  { key: 2, id: "SO-1022", cart: "CART-118", customer: "M. Cruz", status: "estimate" },
  { key: 3, id: "SO-1023", cart: "CART-034", customer: "A. Patel", status: "ready" }
];

export default function DashboardPage() {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>Dashboard</Typography.Title>
      <Row gutter={[16,16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Carts Available" value={42} />
            <Progress percent={76} size="small" style={{ marginTop: 12 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="In Service" value={7} />
            <Progress percent={35} status="active" size="small" style={{ marginTop: 12 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Ready for Pickup" value={5} />
            <Progress percent={62} status="success" size="small" style={{ marginTop: 12 }} />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Service Orders" bodyStyle={{ paddingTop: 0 }}>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </Space>
  );
}
