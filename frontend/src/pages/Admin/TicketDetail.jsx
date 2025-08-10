import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Descriptions,
  Divider,
  List,
  Form,
  Input,
  Select,
  Space,
  Avatar,
  Popconfirm,
  message,
  Badge,
  Timeline,
  Collapse,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "moment/locale/fr";
import { jwtDecode } from "jwt-decode";
const { Option } = Select;
const { Panel } = Collapse;

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false); 
   const [userRole, setUserRole] = useState(''); 
  const [form] = Form.useForm();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);
  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/tickets/${id}`);
        setTicket(response.data);
      } catch (error) {
        message.error("Failed to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  // Handle status change
  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.put(`/tickets/${id}`, { status });
      setTicket(response.data);
      message.success("Status updated successfully");
    } catch (error) {
      message.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };



  // Delete ticket
  const handleDeleteTicket = async () => {
    try {
      await axios.delete(`/tickets/${id}`);
      message.success("Ticket deleted successfully");
      navigate("/tickets");
    } catch (error) {
      message.error("Failed to delete ticket");
    }
  };

  // Status tag component
  const StatusTag = ({ status }) => {
    const statusMap = {
      open: { color: "orange", icon: <ClockCircleOutlined />, text: "Open" },
      in_progress: {
        color: "blue",
        icon: <ClockCircleOutlined />,
        text: "In Progress",
      },
      resolved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Resolved",
      },
      closed: { color: "gray", icon: <CloseCircleOutlined />, text: "Closed" },
    };

    return (
      <Tag
        icon={statusMap[status]?.icon}
        color={statusMap[status]?.color}
        style={{ fontWeight: "bold" }}
      >
        {statusMap[status]?.text}
      </Tag>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityMap = {
      high: { color: "red", text: "High" },
      medium: { color: "orange", text: "Medium" },
      low: { color: "green", text: "Low" },
    };

    return (
      <Badge
        color={priorityMap[priority]?.color}
        text={priorityMap[priority]?.text}
        style={{ fontWeight: "bold" }}
      />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">Loading ticket details...</div>
    );
  }

  if (!ticket) {
    return <div className="container mx-auto p-6">Ticket not found</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Retour aux réclamations
      </Button>

      <Card
        title={`Ticket #${ticket._id.slice(-6).toUpperCase()}`}
        loading={loading}
        extra={
          <Space>
            {userRole === "Admin" && (
              <Popconfirm
                title="Êtes-vous sûr de vouloir supprimer ce ticket ?"
                onConfirm={handleDeleteTicket}
                okText="Oui"
                cancelText="Non"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Supprimer
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
        className="shadow-lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ticket Details */}
          <div className="lg:col-span-2">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Title">
                <span className="font-semibold">{ticket.title}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {ticket.description}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={ticket.status} />
                <Select
                  value={ticket.status}
                  onChange={handleStatusChange}
                  loading={updatingStatus}
                  style={{ width: 150, marginLeft: 10 }}
                >
                  <Option value="open">Open</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {moment(ticket.createdAt).format("LLL")}
              </Descriptions.Item>
              {ticket.closedAt && (
                <Descriptions.Item label="Closed At">
                  {moment(ticket.closedAt).format("LLL")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Client Information */}
            <Collapse ghost className="mt-6">
              <Panel header="Client Information" key="1">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Name">
                    {ticket.client?.nom || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {ticket.client?.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {ticket.client?.phone || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {ticket.client?.address || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
            </Collapse>
          </div>

          {/* Right Column - Activity */}
          <div>
            <Card title="Activity Timeline" className="mb-6">
              <Timeline mode="left">
                <Timeline.Item
                  color="green"
                  label={moment(ticket.createdAt).format("LLL")}
                >
                  Ticket created by {ticket.createdBy?.name || "System"}
                </Timeline.Item>

                {ticket.comments?.map((comment, index) => (
                  <Timeline.Item
                    key={index}
                    color="blue"
                    label={moment(comment.createdAt).format("LLL")}
                  >
                    <strong>{comment.postedBy?.name || "Unknown"}</strong> added
                    a comment
                  </Timeline.Item>
                ))}

                {ticket.closedAt && (
                  <Timeline.Item
                    color="red"
                    label={moment(ticket.closedAt).format("LLL")}
                  >
                    Ticket closed by {ticket.closedBy?.name || "System"}
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TicketDetail;
