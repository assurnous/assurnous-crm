import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Popconfirm, Space, Button, message } from "antd";
import { useParams } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";

const CalendarEvents = () => {
  const [leadsEvents, setLeadsEvents] = useState({}); // Store events grouped by lead ID
  const { id } = useParams(); // Get leadId from URL

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(`/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }); // Fetch all events
      console.log("Fetched Events:", response.data);
      const dataEvent = response?.data;
      const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;

      const filterevent = dataEvent.filter(
        (event) => event.session === currentUserId
      );
      // Group events by lead ID
      const groupedEvents = filterevent.reduce((acc, event) => {
        const leadId = event.lead;
        if (!acc[leadId]) {
          acc[leadId] = [];
        }
        acc[leadId].push({ ...event, key: event._id }); // Add key for Ant Design table
        return acc;
      }, {});

      setLeadsEvents(groupedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    // Fetch events initially
    fetchEvents();

    // Set up polling to fetch events every 5 seconds
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [id]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/event/${id}`);
      message.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting coach:", error);
      message.error("Failed to delete coach");
    }
  };

  // Define table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "event_date",
      key: "event_date",
    },
    {
      title: "Heure",
      dataIndex: "event_time",
      key: "event_time",
    },
    {
      title: "Objectif",
      dataIndex: "objective",
      key: "objective",
    },
    {
      title: "Commentaire",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: <span style={{ fontSize: "12px" }}>Action</span>,
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this coach?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ backgroundColor: "red", color: "white" }}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Calendrier
      </h2>

      {/* Render a table for each lead */}
      {Object.keys(leadsEvents).length > 0 ? (
        Object.entries(leadsEvents).map(([leadId, events]) => (
          <div
            key={leadId}
            className="bg-white border border-gray-200 shadow-md rounded-lg p-4 mb-8"
          >
            <Table
                      columns={[
              ...columns.map((col) => ({
                ...col,
                title: (
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold">{col.title}</div>
                  </div>
                ),
              })),
            ]}
              dataSource={events}
              pagination={false}
            />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600 text-lg">
          Aucun événement trouvé.
        </p>
      )}
    </div>
  );
};

export default CalendarEvents;
