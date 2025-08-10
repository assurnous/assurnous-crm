import React, { useState, useEffect } from "react";
import {
  Calendar,
  Modal,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  Badge,
  List,
  message
} from "antd";
import { DeleteOutlined, PlusOutlined, EyeOutlined  } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");

const { Option } = Select;

const MyCalendar = () => {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [myEvents, setMyEvents] = useState([]);
  const [allUsersEvents, setAllUsersEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showAppointments, setShowAppointments] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [form] = Form.useForm();
  const [eventDetailsModalVisible, setEventDetailsModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [activeFilter, setActiveFilter] = useState("me");
  const [currentUserRole, setCurrentUserRole] = useState(null); // New state for user role

  const token = localStorage.getItem("token");



const handleDeleteEvent = async (eventId) => {
  try {
    setDeleteLoading(true);
    await axios.delete(`/event/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    message.success("Événement supprimé avec succès");
    setEventDetailsModalVisible(false);
    
    // Refresh events list
    if (token) {
      const decoded = jwtDecode(token);
      fetchMyEvents(decoded.userId);
      fetchAllUsersEvents();
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    message.error("Erreur lors de la suppression de l'événement");
  } finally {
    setDeleteLoading(false);
  }
};

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded.userId);
      fetchMyEvents(decoded.userId);
      setCurrentUserRole(decoded.role); // Add this line
      fetchAllUsersEvents();
    }

    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        setChatData(response.data.chatData);
      } catch (err) {
        console.error("Failed to fetch client data:", err);
      }
    };

    getUserData();
  }, [token]);

  const handleClientChange = (clientId) => {
    setSelectedLeadId(clientId);
    const selectedClient = chatData.find((client) => client._id === clientId);
    if (selectedClient) {
      form.setFieldsValue({
        nom: selectedClient.nom,
        address: selectedClient.address,
        ville: selectedClient.ville,
        codepostal: selectedClient.codepostal,
        email: selectedClient.email || selectedClient.email1,
        phone: selectedClient.phone,
        siret: selectedClient.siret,
        raissociale: selectedClient.societe,
      });
    }
  };

  useEffect(() => {
    console.log("Filtered today's events:", getFilteredEvents(dayjs()));
  }, [showTasks, showAppointments, myEvents]);

  const fetchMyEvents = async (userId) => {
    try {
      const response = await axios.get(`/events?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedEvents = response.data.map((event) => ({
        ...event,
        color: event.objective === "Tâche" ? "#52c41a" : "#1890ff",
        formattedTime: formatTime(event.event_time),
        isMine: true,
      }));
      console.log("My events:", formattedEvents);

      setMyEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors de la récupération de mes événements:", error);
    }
  };

  const fetchAllUsersEvents = async () => {
    try {
      const response = await axios.get("/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedEvents = response.data.map((event) => ({
        ...event,
        color: event.objective === "Tâche" ? "#87d068" : "#597ef7",
        formattedTime: formatTime(event.event_time),
        isMine: false,
      }));


      setAllUsersEvents(formattedEvents);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de tous les événements:",
        error
      );
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.includes("h") ? timeString.replace("h", ":") : timeString;
  };

  const showModal = () => {
    if (selectedDate) {
      form.setFieldsValue({
        event_date: dayjs(selectedDate),
      });
    }
    setIsModalVisible(true);
  };

  const handleFormSubmitCalendar = async (values) => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;

    if (!decodedToken) {
      alert("User not authenticated");
      return;
    }

    const session = decodedToken.userId;

    const eventData = {
      ...values,
      session,
      leadId: selectedLeadId,
      event_date: values.event_date
        ? dayjs(values.event_date).format("YYYY-MM-DD")
        : null,
      createdBy: {
        id: decodedToken.userId,
        name: decodedToken.name,
        role: decodedToken.role,
      },
    };

    try {
      const response = await axios.post("/events", eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      form.resetFields();
      setIsModalVisible(false);
      fetchMyEvents(session);
      fetchAllUsersEvents();
      alert("Événement créé avec succès !");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Erreur lors de la création de l'événement");
    }
  };

  
  const getFilteredEvents = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    let eventsToShow = [];

    if (activeFilter === "me") {
      eventsToShow = [...myEvents];
    } else if (activeFilter === "all") {
      eventsToShow = [...myEvents, ...allUsersEvents];
    }

    return eventsToShow.filter((event) => {
      const eventDate = event.event_date
        ? dayjs(event.event_date).format("YYYY-MM-DD")
        : null;
        const isTask = event.objective === "Tâche";

      return (
        eventDate === dateStr &&
        ((showTasks && isTask) || (showAppointments && !isTask))
      );
    });
  };

  const dateCellRender = (date) => {
    const filteredEvents = getFilteredEvents(date);

    return (
      <div className="day-events-container">
        {filteredEvents.map((event, index) => (
          <div
            key={index}
            className="calendar-event"
            style={{
              backgroundColor: event.color,
              color: "white",
              margin: "2px 0",
              padding: "2px 4px",
              borderRadius: "3px",
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedEventDetails(event);
              setEventDetailsModalVisible(true);
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {event.formattedTime} - {event.objective}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>
                {event.createdBy?.name}
              </span>
            </div>
            {event.comment && (
              <div style={{ fontStyle: "italic" }}>
                {event.comment.substring(0, 20)}...
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const monthCellRender = (date) => {
    const filteredEvents = getFilteredEvents(date);
    return filteredEvents.length > 0 ? (
      <div className="month-event-indicator">
        <Badge
          count={filteredEvents.length}
          style={{ backgroundColor: "#1890ff" }}
        />
      </div>
    ) : null;
  };

  return (
    // <div className="calendar-container">
    //   <Modal
    //     title={`Détails de l'événement`}
    //     open={eventDetailsModalVisible}
    //     footer={[
    //       <Button 
    //         key="cancel" 
    //         onClick={() => setEventDetailsModalVisible(false)}
    //       >
    //         Fermer
    //       </Button>,
    //       <Button
    //         key="delete"
    //         type="primary"
    //         danger
    //         onClick={() => handleDeleteEvent(selectedEventDetails._id)}
    //         loading={deleteLoading} // Add this state if you want loading indicator
    //       >
    //         Supprimer
    //       </Button>
    //     ]}
        
    //     width={600}
    //   >
    //     {selectedEventDetails && (
    //       <div className="space-y-4">
    //         <div className="grid grid-cols-2 gap-4">
    //           <div>
    //             <div className="font-bold">Date:</div>
    //             <div>
    //               {dayjs(selectedEventDetails.event_date).format(
    //                 "dddd, D MMMM YYYY"
    //               )}
    //             </div>
    //           </div>
    //           <div>
    //             <div className="font-bold">Heure:</div>
    //             <div>{selectedEventDetails.formattedTime}</div>
    //           </div>
    //         </div>

    //         <div>
    //           <div className="font-bold">Type:</div>
    //           <div>{selectedEventDetails.objective}</div>
    //         </div>

    //         {selectedEventDetails.comment && (
    //           <div>
    //             <div className="font-bold">Commentaire:</div>
    //             <div>{selectedEventDetails.comment}</div>
    //           </div>
    //         )}

    //         <div className="grid grid-cols-2 gap-4">
    //           <div>
    //             <div className="font-bold">Créé par:</div>
    //             <div>{selectedEventDetails.createdBy?.name || "Inconnu"}</div>
    //           </div>
    //           <div>
    //             <div className="font-bold">Client:</div>
    //             <div>{selectedEventDetails.nom || "Client sans nom"}</div>
    //           </div>
    //         </div>

    //         {selectedEventDetails.lead && (
    //           <div className="mt-4">
    //             <Button
    //               type="primary"
    //               onClick={() =>
    //                 (window.location.href = `/client/${selectedEventDetails.lead}`)
    //               }
    //             >
    //               Voir la fiche client
    //             </Button>
    //           </div>
    //         )}
    //       </div>
    //     )}
    //   </Modal>
    <div className="calendar-container">
  <Modal
    title={
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-lg font-semibold">Détails de l'événement</span>
      </div>
    }
    open={eventDetailsModalVisible}
    onCancel={() => setEventDetailsModalVisible(false)}
    footer={[
      <Button 
        key="cancel" 
        onClick={() => setEventDetailsModalVisible(false)}
        className="mr-2"
      >
        Fermer
      </Button>,
      <Button
        key="delete"
        type="primary"
        danger
        onClick={() => handleDeleteEvent(selectedEventDetails._id)}
        loading={deleteLoading}
        icon={<DeleteOutlined />}
      >
        Supprimer
      </Button>
    ]}
    width={650}
    bodyStyle={{ padding: '24px' }}
  >
    {selectedEventDetails && (
      <div className="space-y-6">
        {/* Header with colored type badge */}
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedEventDetails.objective === "Tâche" 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedEventDetails.objective}
            </span>
            <h3 className="mt-2 text-xl font-semibold text-gray-800">
              {selectedEventDetails.nom || "Client sans nom"}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Créé par</div>
            <div className="font-medium">
              {selectedEventDetails.createdBy?.name || "Inconnu"}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">
                  {dayjs(selectedEventDetails.event_date).format("dddd, D MMMM YYYY")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Heure</div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  {selectedEventDetails.formattedTime}
                </span>
              </div>
            </div>
          </div>

          {selectedEventDetails.comment && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-500">Commentaire</div>
              <div className="p-3 bg-white rounded-md border border-gray-200">
                {selectedEventDetails.comment}
              </div>
            </div>
          )}
        </div>

        {/* Client card */}
        {selectedEventDetails.lead && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">Client</div>
                <div className="font-semibold">
                  {selectedEventDetails.nom || "Client sans nom"}
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => window.location.href = `/client/${selectedEventDetails.lead}`}
                icon={<EyeOutlined />}
              >
                Voir la fiche
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </Modal>


      {/* Simplified Sidebar */}
      <div
        className="sidebar"
        style={{
          width: 250,
          padding: 16,
          background: "#fafafa",
          borderRight: "1px solid #e8e8e8",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ marginBottom: 16, width: "100%" }}
        >
          Nouveau
        </Button>

{/*        
        {currentUserRole === "Admin" && (
          <>
            <Divider orientation="left">Filtres</Divider>
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  key: "me",
                  icon: <UserOutlined />,
                  label: "Moi",
                  active: activeFilter === "me",
                },
                {
                  key: "all",
                  icon: <TeamOutlined />,
                  label: "Tous",
                  active: activeFilter === "all",
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{
                    cursor: "pointer",
                    background: item.active ? "#e6f7ff" : "transparent",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                  onClick={() => setActiveFilter(item.key)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={item.icon}
                        style={{
                          backgroundColor: item.active ? "#1890ff" : "#d9d9d9",
                        }}
                      />
                    }
                    title={item.label}
                  />
                </List.Item>
              )}
            />
          </>
        )} */}
        <Divider orientation="left">Filtres</Divider>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Checkbox
            checked={showTasks}
            onChange={(e) => setShowTasks(e.target.checked)}
          >
            Tâches
          </Checkbox>
          <Checkbox
            checked={showAppointments}
            onChange={(e) => setShowAppointments(e.target.checked)}
          >
            Rendez-vous
          </Checkbox>
        </div>

        <Divider orientation="left">Aujourd'hui</Divider>

        <List
          size="small"
          dataSource={getFilteredEvents(dayjs())}
          renderItem={(event) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedEventDetails(event);
                setEventDetailsModalVisible(true);
              }}
            >
              <List.Item.Meta
                title={
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      {event.formattedTime} - {event.objective}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {event.createdBy?.name}
                    </span>
                  </div>
                }
                description={event.nom || "Client sans nom"}
              />
            </List.Item>
          )}
        />
      </div>

      {/* Calendar View */}
      <div className="calendar-view" style={{ flex: 1, padding: 16 }}>
        <Calendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          fullscreen={true}
          onSelect={(value) => {
            setSelectedDate(value);
            const matchingEvents = getFilteredEvents(value);
            setSelectedEvents(matchingEvents);
          }}
          headerRender={({ value, onChange }) => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Button onClick={() => onChange(value.subtract(1, "month"))}>
                &lt;
              </Button>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>
                {value.format("MMMM YYYY")}
              </div>
              <Button onClick={() => onChange(value.add(1, "month"))}>
                &gt;
              </Button>
            </div>
          )}
        />

        {/* Add Event Modal */}
        <Modal
          title="Ajouter un Événement"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleFormSubmitCalendar}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="nom"
              label="Sélectionner le client"
              rules={[{ required: true, message: "Client est requis" }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                className="w-full"
                onChange={handleClientChange}
                placeholder="Sélectionnez un client"
              >
                {chatData.map((client) => (
                  <Option key={client._id} value={client._id}>
                    {client.nom || "Client sans nom"}{" "}
                    {client.phone ? `- ${client.phone}` : ""}{" "}
                    {client.prenom ? `- ${client.prenom}` : ""}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="leadId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="Date"
              name="event_date"
              rules={[{ required: true, message: "La date est requise" }]}
            >
              <DatePicker
                className="w-full"
                placeholder="Sélectionnez une date"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="Heure"
              name="event_time"
              rules={[{ required: true }]}
            >
              <Input placeholder="HH:mm" />
            </Form.Item>

            <Form.Item
              label="Type"
              name="objective"
              rules={[
                { required: true, message: "Veuillez sélectionner un type" },
              ]}
            >
              <Select placeholder="Sélectionnez un type">
                <Option value="Tâche">Tâche</Option>
                <Option value="Rendez-vous">Rendez-vous</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="comment">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Button type="primary" htmlType="submit" className="w-full">
              Ajouter Événement
            </Button>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MyCalendar;
