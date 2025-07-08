// import React, { useState, useEffect } from "react";
// import {
//   Calendar,
//   Modal,
//   Button,
//   Checkbox,
//   Divider,
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   TimePicker,
// } from "antd";
// import { UserOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import moment from "moment";
// import "moment/locale/fr";
// import dayjs from "dayjs";
// import "dayjs/locale/fr";
// dayjs.locale("fr");

// const { Option } = Select;

// // Set French locale for moment
// moment.locale("fr");

// const MyCalendar = () => {
//   const [selectedEvents, setSelectedEvents] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(moment());
//   const [myEvents, setMyEvents] = useState([]);
//   const [allUsersEvents, setAllUsersEvents] = useState([]);
//   const [showAll, setShowAll] = useState(false);
//   const [showTasks, setShowTasks] = useState(true);
//   const [showAppointments, setShowAppointments] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [chatData, setChatData] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedLeadId, setSelectedLeadId] = useState(null);
//   const [form] = Form.useForm();
//   const [eventDetailsModalVisible, setEventDetailsModalVisible] =
//     useState(false);
//   const [selectedEventDetails, setSelectedEventDetails] = useState(null);
//   const [activeFilter, setActiveFilter] = useState("all"); // New state for active filter

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (token) {
//       const decoded = jwtDecode(token);
//       setCurrentUser(decoded.userId);
//       fetchMyEvents(decoded.userId);
//       fetchAllUsersEvents();
//     }

//     // Fetch client data
//     const getUserData = async () => {
//       try {
//         const response = await axios.get("/data");
//         console.log("Fetched data:", response.data);
//         setChatData(response.data.chatData);
//       } catch (err) {
//         console.error("Failed to fetch client data:", err);
//       }
//     };

//     getUserData();
//   }, [token]);

//   // const handleClientChange = (value) => {
//   //   setSelectedClientId(value);
//   //   form.setFieldsValue({ leadId: value });
//   // };
//   const handleClientChange = (clientId) => {
//     setSelectedLeadId(clientId);
//     const selectedClient = chatData.find((client) => client._id === clientId);
//     if (selectedClient) {
//       form.setFieldsValue({
//         nom: selectedClient.nom,
//         address: selectedClient.address,
//         ville: selectedClient.ville,
//         codepostal: selectedClient.codepostal,
//         email: selectedClient.email || selectedClient.email1,
//         phone: selectedClient.phone,
//         siret: selectedClient.siret,
//         raissociale: selectedClient.societe,
//       });
//     }
//   };

//   const fetchMyEvents = async (userId) => {
//     try {
//       const response = await axios.get(`/events?userId=${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formattedEvents = response.data.map((event) => ({
//         ...event,
//         color: "#1890ff",
//         formattedTime: formatTime(event.event_time),
//       }));

//       setMyEvents(formattedEvents);
//     } catch (error) {
//       console.error("Erreur lors de la récupération de mes événements:", error);
//     }
//   };

//   const fetchAllUsersEvents = async () => {
//     try {
//       const response = await axios.get("/events", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("All users events:", response.data);

//       const formattedEvents = response.data.map((event) => ({
//         ...event,
//         color: "#ff4d4f",
//         formattedTime: formatTime(event.event_time),
//       }));

//       setAllUsersEvents(formattedEvents);
//     } catch (error) {
//       console.error(
//         "Erreur lors de la récupération de tous les événements:",
//         error
//       );
//     }
//   };
//   const handleCancel = () => {
//     setIsModalVisible(false);
//     form.resetFields();
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "";
//     return timeString.includes("h") ? timeString.replace("h", ":") : timeString;
//   };

//   // const showModal = () => {
//   //   if (selectedDate) {
//   //     form.setFieldsValue({
//   //       event_date: selectedDate.format("YYYY-MM-DD"),
//   //     });
//   //   }
//   //   setIsModalVisible(true);
//   // };

//   //   const handleFormSubmitCalendar = async (values) => {
//   //     const token = localStorage.getItem("token");
//   //     const decodedToken = token ? jwtDecode(token) : null;
//   //     if (!decodedToken) {
//   //       alert("User not authenticated");
//   //       return;
//   //     }

//   //     const session = decodedToken.userId;

//   //     const eventData = {
//   //       ...values,
//   //       session,
//   //       leadId: id, // You might need to define 'id' from your context
//   //     };
//   // console.log('eventData', eventData)
//   //     try {
//   //       const response = await axios.post("/events", eventData, {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       });
//   //       console.log("Event added successfully:", response.data);
//   //       form.resetFields();
//   //       setIsModalVisible(false);
//   //       fetchMyEvents(session); // Refresh events
//   //       alert("Événement créé avec succès !");
//   //     } catch (error) {
//   //       console.error("Error adding event:", error);
//   //       alert("Erreur lors de la création de l'événement");
//   //     }
//   //   };

//   // const handleFormSubmitCalendar = async (values) => {
//   //   const token = localStorage.getItem("token");
//   //   const decodedToken = token ? jwtDecode(token) : null;

//   //   if (!decodedToken) {
//   //     alert("User not authenticated");
//   //     return;
//   //   }

//   //   const session = decodedToken.userId;

//   //   // Ensure proper date formatting
//   //   const eventData = {
//   //     ...values,
//   //     session,
//   //     leadId: selectedLeadId, // Use the state you already have
//   //     event_date: values.event_date
//   //       ? moment(values.event_date).format("YYYY-MM-DD")
//   //       : null,
//   //   };

//   //   try {
//   //     const response = await axios.post("/events", eventData, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     console.log("Event added successfully:", response.data);
//   //     form.resetFields();
//   //     setIsModalVisible(false);
//   //     fetchMyEvents(session);
//   //     alert("Événement créé avec succès !");
//   //   } catch (error) {
//   //     console.error("Error adding event:", error);
//   //     alert("Erreur lors de la création de l'événement");
//   //   }
//   // };
//   // const dateCellRender = (value) => {
//   //   const dateStr = value.format("YYYY-MM-DD");
//   //   let eventsToShow = showAll ? [...myEvents, ...allUsersEvents] : myEvents;

//   //   return eventsToShow
//   //     .filter((event) => {
//   //       const eventDate = event.event_date
//   //         ? moment(event.event_date).format("YYYY-MM-DD")
//   //         : null;
//   //       const isTask = event.objective === "Tâche";

//   //       return (
//   //         eventDate === dateStr &&
//   //         ((showTasks && isTask) || (showAppointments && !isTask))
//   //       );
//   //     })
//   //     .map((event, index) => (
//   //       <div key={`${dateStr}-${index}`}>
//   //         <div
//   //           className="event-item"
//   //           style={{
//   //             backgroundColor: event.color,
//   //             color: "#ffffff",
//   //             padding: "4px 8px",
//   //             marginBottom: "4px",
//   //             borderRadius: "4px",
//   //             fontSize: "12px",
//   //             cursor: "pointer",
//   //           }}
//   //           onClick={() => (window.location.href = `/lead/${event.lead}`)}
//   //         >
//   //           {event.formattedTime} - {event.objective}
//   //         </div>
//   //       </div>
//   //     ));
//   // };

//   const showModal = () => {
//     if (selectedDate) {
//       form.setFieldsValue({
//         event_date: dayjs(selectedDate), // Send dayjs object instead of string
//       });
//     }
//     setIsModalVisible(true);
//   };

//   const handleFormSubmitCalendar = async (values) => {
//     const token = localStorage.getItem("token");
//     const decodedToken = token ? jwtDecode(token) : null;

//     if (!decodedToken) {
//       alert("User not authenticated");
//       return;
//     }

//     const session = decodedToken.userId;

//     // Ensure proper date formatting with dayjs
//     const eventData = {
//       ...values,
//       session,
//       leadId: selectedLeadId,
//       event_date: values.event_date
//         ? dayjs(values.event_date).format("YYYY-MM-DD")
//         : null,
//       createdBy: {
//         id: decodedToken.userId,
//         name: decodedToken.name,
//         role: decodedToken.role,
//       },
//     };
//     console.log("eventData", eventData);

//     try {
//       const response = await axios.post("/events", eventData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Event added successfully:", response.data);
//       form.resetFields();
//       setIsModalVisible(false);
//       fetchMyEvents(session);
//       alert("Événement créé avec succès !");
//     } catch (error) {
//       console.error("Error adding event:", error);
//       alert("Erreur lors de la création de l'événement");
//     }
//   };

//   function darkenColor(color) {
//     return color;
//   }
//   const dateCellRender = (value) => {
//     const dateStr = value.format("YYYY-MM-DD");
//     let eventsToShow = showAll ? [...myEvents, ...allUsersEvents] : myEvents;

//     return eventsToShow
//       .filter((event) => {
//         const eventDate = event.event_date
//           ? dayjs(event.event_date).format("YYYY-MM-DD")
//           : null;
//         const isTask = event.objective === "Tâche";

//         return (
//           eventDate === dateStr &&
//           ((showTasks && isTask) || (showAppointments && !isTask))
//         );
//       })
//       .map((event, index) => {
//         const eventColor =
//           event.objective === "Rendez-vous" ? "#1890ff" : "#52c41a";

//         return (
//           <div key={`${dateStr}-${index}`}>
//             <div
//               className="event-item"
//               style={{
//                 backgroundColor: eventColor,
//                 color: "#ffffff",
//                 padding: "4px 8px",
//                 marginBottom: "4px",
//                 borderRadius: "4px",
//                 fontSize: "12px",
//                 cursor: "pointer",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 borderLeft: `3px solid ${darkenColor(eventColor, 20)}`,
//                 boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
//               }}
//               onClick={() => {
//                 setSelectedEventDetails(event);
//                 setEventDetailsModalVisible(true);
//               }}
//             >
//               <div style={{ fontWeight: "bold" }}>{event.formattedTime}</div>
//               <div style={{ fontWeight: "bold" }}>{event.objective}</div>
//             </div>
//           </div>
//         );
//       });
//   };

//   return (
//     <div className="calendar-container">
//       <Modal
//         title={`Détails de l'événement`}
//         open={eventDetailsModalVisible}
//         onCancel={() => setEventDetailsModalVisible(false)}
//         footer={null}
//         width={600}
//       >
//         {selectedEventDetails && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="font-bold">Date:</div>
//                 <div>
//                   {dayjs(selectedEventDetails.event_date).format(
//                     "dddd, D MMMM YYYY"
//                   )}
//                 </div>
//               </div>
//               <div>
//                 <div className="font-bold">Heure:</div>
//                 <div>{selectedEventDetails.formattedTime}</div>
//               </div>
//             </div>

//             <div>
//               <div className="font-bold">Type:</div>
//               <div>{selectedEventDetails.objective}</div>
//             </div>

//             {selectedEventDetails.comment && (
//               <div>
//                 <div className="font-bold">Commentaire:</div>
//                 <div>{selectedEventDetails.comment}</div>
//               </div>
//             )}

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="font-bold">Créé par:</div>
//                 <div>{selectedEventDetails.createdBy?.name || "Inconnu"}</div>
//               </div>
//               <div>
//                 <div className="font-bold">Client:</div>
//                 <div>{selectedEventDetails.nom || "Client sans nom"}</div>
//               </div>
//             </div>

//             {selectedEventDetails.lead && (
//               <div className="mt-4">
//                 <Button
//                   type="primary"
//                   onClick={() =>
//                     (window.location.href = `/lead/${selectedEventDetails.lead}`)
//                   }
//                 >
//                   Voir la fiche client
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>
//       {/* Sidebar - 20% width */}
//       <div className="sidebar">
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           className="new-event-btn"
//           onClick={showModal}
//         >
//           Nouveau
//         </Button>

//         <div className="section">
//           <div className="section-header">
//             <UserOutlined className="icon-blue" />
//             <span className="section-title font-semibold">Moi</span>
//           </div>
//           <div className="event-list">
//             {myEvents.map((event, index) => (
//               <div key={`me-${index}`} className="event-preview">
//                 <span className="event-time">{event.formattedTime}</span>
//                 <span className="event-title">{event.objective}</span>
//               </div>
//             ))}
//             {myEvents.length > 2 && (
//               <div className="more-events">+ {myEvents.length - 5} plus</div>
//             )}
//           </div>
//         </div>

//         <div className="section">
//           <div className="section-header">
//             <TeamOutlined className="icon-red" />
//             <span className="section-title font-bold">Tous</span>
//           </div>
//           <div className="event-list">
//             {allUsersEvents.slice(0, 5).map((event, index) => (
//               <div key={`all-${index}`} className="event-preview">
//                 <span className="event-time">{event.formattedTime}</span>
//                 <span className="event-title">{event.objective}</span>
//               </div>
//             ))}
//             {allUsersEvents.length > 5 && (
//               <div className="more-events">
//                 + {allUsersEvents.length - 5} plus
//               </div>
//             )}
//           </div>
//         </div>

//         <Divider className="divider" />

//         <div className="filter-options">
//           <Checkbox
//             checked={showAll}
//             onChange={(e) => setShowAll(e.target.checked)}
//             className="filter-checkbox"
//           >
//             Voir tous
//           </Checkbox>

//           <div className="sub-filters">
//             <Checkbox
//               checked={showTasks}
//               onChange={(e) => setShowTasks(e.target.checked)}
//               className="filter-checkbox"
//             >
//               Tâches
//             </Checkbox>

//             <Checkbox
//               checked={showAppointments}
//               onChange={(e) => setShowAppointments(e.target.checked)}
//               className="filter-checkbox"
//             >
//               Rendez-vous
//             </Checkbox>
//           </div>
//         </div>
//       </div>

//       {/* Calendar - 80% width */}
//       <div className="calendar-view">
//         <div className="calendar-wrapper">
//           <Calendar
//             dateCellRender={dateCellRender}
//             fullscreen={true}
//             onSelect={(value) => {
//               const dateStr = value.format("YYYY-MM-DD");
//               const matchingEvents = (
//                 showAll ? [...myEvents, ...allUsersEvents] : myEvents
//               ).filter(
//                 (event) =>
//                   dayjs(event.event_date).format("YYYY-MM-DD") === dateStr
//               );
//               setSelectedEvents(matchingEvents);
//               setSelectedDate(value.toDate()); // Convert dayjs to Date object if needed
//             }}
//             headerRender={({ value, onChange }) => (
//               <div className="calendar-header">
//                 <Button onClick={() => onChange(value.subtract(1, "month"))}>
//                   &lt;
//                 </Button>
//                 <div className="month-title">{value.format("MMMM YYYY")}</div>
//                 <Button onClick={() => onChange(value.add(1, "month"))}>
//                   &gt;
//                 </Button>
//               </div>
//             )}
//           />

//           {/* Add event modal */}
//           <Modal
//             title="Ajouter un Événement"
//             open={isModalVisible}
//             onCancel={handleCancel}
//             footer={null}
//           >
//             <Form
//               form={form}
//               onFinish={handleFormSubmitCalendar}
//               layout="vertical"
//               className="space-y-4"
//             >
//               <Form.Item
//                 name="nom"
//                 label="Sélectionner le client"
//                 rules={[{ required: true, message: "Client est requis" }]}
//               >
//                 <Select
//                   showSearch
//                   optionFilterProp="children"
//                   className="w-full"
//                   onChange={handleClientChange}
//                   placeholder="Sélectionnez un client"
//                 >
//                   {chatData.map((client) => (
//                     <Option key={client._id} value={client._id}>
//                       {client.nom || "Client sans nom"}{" "}
//                       {client.phone ? `- ${client.phone}` : ""}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               <Form.Item name="leadId" hidden>
//                 <Input />
//               </Form.Item>

//               <Form.Item
//                 label="Date"
//                 name="event_date"
//                 rules={[{ required: true, message: "La date est requise" }]}
//               >
//                 <DatePicker
//                   className="w-full"
//                   placeholder="Sélectionnez une date"
//                   format="YYYY-MM-DD"
//                 />
//               </Form.Item>

//               <Form.Item
//                 label="Heure"
//                 name="event_time"
//                 rules={[{ required: true }]}
//               >
//                 <Input placeholder="HH:mm" />
//               </Form.Item>

//               <Form.Item
//                 label="Type"
//                 name="objective"
//                 rules={[
//                   { required: true, message: "Veuillez sélectionner un type" },
//                 ]}
//               >
//                 <Select placeholder="Sélectionnez un type">
//                   <Option value="Tâche">Tâche</Option>
//                   <Option value="Rendez-vous">Rendez-vous</Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item label="Description" name="comment">
//                 <Input.TextArea rows={4} />
//               </Form.Item>

//               <Button type="primary" htmlType="submit" className="w-full">
//                 Ajouter Événement
//               </Button>
//             </Form>
//           </Modal>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyCalendar;

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
  Avatar
} from "antd";
import { UserOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
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
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [activeFilter, setActiveFilter] = useState("me");
  const [currentUserRole, setCurrentUserRole] = useState(null); // New state for user role
  

  const token = localStorage.getItem("token");

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

  const fetchMyEvents = async (userId) => {
    try {
      const response = await axios.get(`/events?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedEvents = response.data.map((event) => ({
        ...event,
        color: event.objective === "Tâche" ? "#52c41a" : "#1890ff",
        formattedTime: formatTime(event.event_time),
        isMine: true
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
        isMine: false
      }));
      console.log("All users events:", formattedEvents);

      setAllUsersEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors de la récupération de tous les événements:", error);
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
      eventsToShow = myEvents;
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
              cursor: "pointer"
            }}
            onClick={() => {
              setSelectedEventDetails(event);
              setEventDetailsModalVisible(true);
            }}
          >
            <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            <span>{event.formattedTime} - {event.objective}</span>
            <span style={{ fontSize: "11px", opacity: 0.8 }}>{event.createdBy?.name}</span>
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
        <Badge count={filteredEvents.length} style={{ backgroundColor: '#1890ff' }} />
      </div>
    ) : null;
  };

  return (
    <div className="calendar-container">
      <Modal
        title={`Détails de l'événement`}
        open={eventDetailsModalVisible}
        onCancel={() => setEventDetailsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEventDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold">Date:</div>
                <div>
                  {dayjs(selectedEventDetails.event_date).format("dddd, D MMMM YYYY")}
                </div>
              </div>
              <div>
                <div className="font-bold">Heure:</div>
                <div>{selectedEventDetails.formattedTime}</div>
              </div>
            </div>

            <div>
              <div className="font-bold">Type:</div>
              <div>{selectedEventDetails.objective}</div>
            </div>

            {selectedEventDetails.comment && (
              <div>
                <div className="font-bold">Commentaire:</div>
                <div>{selectedEventDetails.comment}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold">Créé par:</div>
                <div>{selectedEventDetails.createdBy?.name || "Inconnu"}</div>
              </div>
              <div>
                <div className="font-bold">Client:</div>
                <div>{selectedEventDetails.nom || "Client sans nom"}</div>
              </div>
            </div>

            {selectedEventDetails.lead && (
              <div className="mt-4">
                <Button
                  type="primary"
                  onClick={() => window.location.href = `/lead/${selectedEventDetails.lead}`}
                >
                  Voir la fiche client
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Simplified Sidebar */}
      <div className="sidebar" style={{ width: 250, padding: 16, background: '#fafafa', borderRight: '1px solid #e8e8e8' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ marginBottom: 16, width: '100%' }}
        >
          Nouveau
        </Button>

       
        
        {/* <List
          itemLayout="horizontal"
          dataSource={[
            { key: 'me', icon: <UserOutlined />, label: 'Moi', active: activeFilter === 'me' },
            { key: 'all', icon: <TeamOutlined />, label: 'Tous', active: activeFilter === 'all' }
          ]}
          renderItem={item => (
            <List.Item 
              style={{ 
                cursor: 'pointer',
                background: item.active ? '#e6f7ff' : 'transparent',
                padding: '8px',
                borderRadius: '4px'
              }}
              onClick={() => setActiveFilter(item.key)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={item.icon} style={{ backgroundColor: item.active ? '#1890ff' : '#d9d9d9' }} />}
                title={item.label}
              />
            </List.Item>
          )}
        /> */}
  {currentUserRole === 'Admin' && (
    <>
     <Divider orientation="left">Filtres</Divider>
    <List
      itemLayout="horizontal"
      dataSource={[
        { key: 'me', icon: <UserOutlined />, label: 'Moi', active: activeFilter === 'me' },
        { key: 'all', icon: <TeamOutlined />, label: 'Tous', active: activeFilter === 'all' }
      ]}
      renderItem={item => (
        <List.Item 
          style={{ 
            cursor: 'pointer',
            background: item.active ? '#e6f7ff' : 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }}
          onClick={() => setActiveFilter(item.key)}
        >
          <List.Item.Meta
            avatar={<Avatar icon={item.icon} style={{ backgroundColor: item.active ? '#1890ff' : '#d9d9d9' }} />}
            title={item.label}
          />
        </List.Item>
      )}
    />
    </>
  )}
        <Divider orientation="left">Types</Divider>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedEventDetails(event);
                setEventDetailsModalVisible(true);
              }}
            >
              <List.Item.Meta
                    title={
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{event.formattedTime} - {event.objective}</span>
                        <span style={{ fontSize: "12px", color: "#666" }}>{event.createdBy?.name}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Button onClick={() => onChange(value.subtract(1, 'month'))}>
                &lt;
              </Button>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                {value.format('MMMM YYYY')}
              </div>
              <Button onClick={() => onChange(value.add(1, 'month'))}>
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
                    {client.nom || "Client sans nom"} {client.phone ? `- ${client.phone}` : ""}
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