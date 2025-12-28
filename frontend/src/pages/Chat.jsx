// import React, { useState, useEffect } from "react";
// import {
//   Drawer,
//   List,
//   Input,
//   Button,
//   Avatar,
//   Tag,
//   Space,
//   Divider,
//   Select,
//   Badge,
//   message,
//   Modal,
//   Form,
//   Card,
//   Typography,
//   Row,
//   Col,
// } from "antd";
// import {
//   MessageOutlined,
//   CloseOutlined,
//   SendOutlined,
//   UserOutlined,
//   TeamOutlined,
//   CustomerServiceOutlined,
//   ClockCircleOutlined,
//   CheckCircleOutlined,
//   InfoCircleOutlined,
//   MailOutlined,
//   UserSwitchOutlined,
//   SwapOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import dayjs from "dayjs";
// import "dayjs/locale/fr";
// import { useNotifications } from "../useNotifications";

// const { Option } = Select;
// const { TextArea } = Input;
// const { Title, Text } = Typography;

// const ReclamationChatSidebar = ({ reclamations, onReclamationUpdate }) => {
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [selectedReclamation, setSelectedReclamation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [statusModalVisible, setStatusModalVisible] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [transferModalVisible, setTransferModalVisible] = useState(false);
//   const [selectedCommercial, setSelectedCommercial] = useState(null);
//   const [commercials, setCommercials] = useState([]);
//   const [transferLoading, setTransferLoading] = useState(false);
//   const isAdmin = currentUser?.role?.toLowerCase() === "admin";
//   const isCommercial = currentUser?.role?.toLowerCase() === "commercial";
//   const { unreadCount, markAsRead, fetchUnreadCount } = useNotifications();

//   const handleReclamationSelect = async (reclamation) => {
//     setSelectedReclamation(reclamation);
//     if (reclamation) {
//       await markAsRead(reclamation._id);
//       // Refresh the count after marking as read
//       fetchUnreadCount();
//     }
//   };

//   useEffect(() => {
//     if (drawerVisible && isAdmin) {
//       fetchCommercials();
//     }
//   }, [drawerVisible, isAdmin]);

//   // Add this function to fetch commercial users
//   const fetchCommercials = async () => {
//     try {
//       const response = await axios.get("/commercials");
//       setCommercials(response.data);
//     } catch (error) {
//       console.error("Error fetching commercials:", error);
//       message.error("Erreur lors du chargement des commerciaux");
//     }
//   };

//   // Add this function to handle the transfer
//   const handleTransferReclamation = async () => {
//     if (!selectedCommercial || !selectedReclamation) return;

//     setTransferLoading(true);
//     try {
//       const response = await axios.post(
//         `/reclamations/${selectedReclamation._id}/transfer`,
//         {
//           commercialId: selectedCommercial._id,
//           commercialName:
//             `${selectedCommercial.prenom} ${selectedCommercial.nom}`.trim(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       console.log('Transfer response:', response);

//       if (response.status === 200) {
//         message.success("Réclamation transférée avec succès");
//         setTransferModalVisible(false);
//         setSelectedCommercial(null);

//         // Refresh the reclamation data
//         if (onReclamationUpdate) {
//           onReclamationUpdate();
//         }
//       }
//     } catch (error) {
//       console.error("Error transferring reclamation:", error);
//       message.error("Erreur lors du transfert de la réclamation");
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const decoded = jwtDecode(token);
//       setCurrentUser(decoded);
//     }
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (selectedReclamation) {
//       fetchMessages(selectedReclamation._id);
//     }
//   }, [selectedReclamation]);

//   // useEffect(() => {
//   //   calculateUnreadMessages();
//   // }, [reclamations, currentUser]);

//   // // Calculate unread messages from admins and commercials
//   // const calculateUnreadMessages = () => {
//   //   let count = 0;
//   //   reclamations.forEach((reclamation) => {
//   //     if (reclamation.messages && reclamation.messages.length > 0) {
//   //       reclamation.messages.forEach((message) => {
//   //         // Count messages from admins or commercials that are not from current user
//   //         if (
//   //           (message.senderType === "admin" ||
//   //             message.senderType === "commercial") &&
//   //           message.senderId !== currentUser?.userId
//   //         ) {
//   //           count++;
//   //         }
//   //       });
//   //     }
//   //   });
//   //   setUnreadCount(count);
//   // };

//   const fetchUsers = async () => {
//     try {
//       const [adminsRes, commercialsRes, managersRes] = await Promise.all([
//         axios.get("/admin"),
//         axios.get("/commercials"),
//         axios.get("/manager"),
//       ]);

//       const combinedUsers = [
//         ...adminsRes.data.map((admin) => ({
//           ...admin,
//           userType: "admin",
//         })),
//         ...commercialsRes.data.map((commercial) => ({
//           ...commercial,
//           userType: "commercial",
//         })),
//         ...managersRes.data.map((manager) => ({
//           ...manager,
//           userType: "manager",
//         })),
//       ];

//       setUsers(combinedUsers);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchMessages = async (reclamationId) => {
//     try {
//       const response = await axios.get(
//         `/reclamations/${reclamationId}/messages`
//       );
//       setMessages(response.data || []);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedReclamation) return;

//     try {
//       const token = localStorage.getItem("token");
//       const decodedToken = token ? jwtDecode(token) : null;

//       if (!decodedToken) {
//         message.error("Utilisateur non authentifié");
//         return;
//       }

//       const messageData = {
//         reclamationId: selectedReclamation._id,
//         content: newMessage,
//         senderId: decodedToken.userId,
//         senderType:
//           decodedToken.role?.toLowerCase() ||
//           decodedToken.userType?.toLowerCase() ||
//           "user",
//       };

//       const response = await axios.post("/reclamations/messages", messageData);
//       setMessages((prev) => [...prev, response.data]);
//       setNewMessage("");

//     } catch (error) {
//       console.error("Error sending message:", error);
//       message.error("Erreur lors de l'envoi du message");
//     }
//   };

//   const updateReclamationStatus = async () => {
//     if (!selectedReclamation || !selectedStatus) return;

//     try {
//       await axios.put(`/reclamations/${selectedReclamation._id}/status`, {
//         status: selectedStatus,
//       }, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         }
//       });

//       if (onReclamationUpdate) {
//         onReclamationUpdate();
//       }

//       setStatusModalVisible(false);
//       message.success("Statut mis à jour avec succès");
//     } catch (error) {
//       console.error("Error updating status:", error);
//       message.error("Erreur lors de la mise à jour du statut");
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       nouveau: "blue",
//       en_cours: "orange",
//       en_attente: "yellow",
//       resolu: "green",
//       ferme: "gray",
//       rejete: "red",
//     };
//     return colors[status] || "default";
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       nouveau: <InfoCircleOutlined />,
//       en_cours: <ClockCircleOutlined />,
//       en_attente: <ClockCircleOutlined />,
//       resolu: <CheckCircleOutlined />,
//       ferme: <CheckCircleOutlined />,
//       rejete: <CloseOutlined />,
//     };
//     return icons[status] || <InfoCircleOutlined />;
//   };

//   const getUserName = (userId, userType) => {
//     const user = users.find((u) => u._id === userId);
//     if (!user) return "Utilisateur inconnu";

//     if (user.userType === "admin" || userType === "admin")
//       return user.name || "Admin";
//     return `${user.prenom || ""} ${user.nom || ""}`.trim() || "Utilisateur";
//   };

//   const getUserAvatar = (userType) => {
//     const colors = {
//       admin: "#1890ff",
//       commercial: "#52c41a",
//       manager: "#722ed1",
//     };
//     return (
//       <Avatar
//         size="small"
//         style={{ backgroundColor: colors[userType] || "#ccc" }}
//         icon={<UserOutlined />}
//       />
//     );
//   };

//   // Helper function to format the creator name
//   const getCreatorName = (session) => {
//     if (!session) return "Inconnu";

//     // For admin users
//     if (session.name) return session.name;

//     // For commercial/manager users
//     if (session.nom || session.prenom) {
//       return `${session.prenom || ""} ${session.nom || ""}`.trim();
//     }

//     // Fallback
//     return session.email || "Utilisateur inconnu";
//   };

//   // Helper function to get creator email
//   const getCreatorEmail = (session) => {
//     if (!session) return "N/A";
//     return session.email || "N/A";
//   };

//   const filteredReclamations = reclamations.filter((reclamation) => {
//     if (!searchQuery) return true;

//     const searchTerm = searchQuery.toLowerCase();
//     const creatorName = getCreatorName(reclamation.session).toLowerCase();

//     return (
//       reclamation.numero_reclamation?.toLowerCase().includes(searchTerm) ||
//       reclamation.nom_reclamant?.toLowerCase().includes(searchTerm) ||
//       reclamation._id?.toLowerCase().includes(searchTerm) ||
//       creatorName.includes(searchTerm)
//     );
//   });

//   return (
//     <>
//       {/* Floating Chat Button with Notification Badge */}
//       <div
//         style={{
//           position: "fixed",
//           right: 20,
//           bottom: 20,
//           zIndex: 1000,
//         }}
//       >
//         <Badge
//           count={unreadCount}
//           size="small"
//           style={{
//             backgroundColor: "#ff4d4f",
//           }}
//         >
//           <Button
//             type="primary"
//             icon={<MessageOutlined  style={{ fontSize: "32px", marginRight: "2px" }}/>}
//             onClick={() => {
//               setDrawerVisible(true);
//             }}
//             style={{
//               borderRadius: "50%",
//               width: 60,
//               height: 60,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//               animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
//             }}
//           />
//         </Badge>
//       </div>

//       <style>
//         {`
//           @keyframes pulse {
//             0% { transform: scale(1); }
//             50% { transform: scale(1.1); }
//             100% { transform: scale(1); }
//           }
//           .reclamation-item {
//             transition: all 0.3s ease;
//             border-left: 3px solid transparent;
//             position: relative;
//           }
//           .reclamation-item:hover {
//             background-color: #f0f8ff;
//             border-left-color: #1890ff;
//           }
//           .reclamation-item.selected {
//             background-color: #e6f7ff;
//             border-left-color: #1890ff;
//           }
//           .message-bubble {
//             border-radius: 18px;
//             padding: 12px 16px;
//             max-width: 70%;
//             word-wrap: break-word;
//           }
//           .message-time {
//             font-size: 11px;
//             opacity: 0.7;
//           }
//           .creator-info {
//             background-color: #f9f9f9;
//             border-radius: 6px;
//             padding: 8px;
//             margin-top: 8px;
//           }
//           .unread-indicator {
//             position: absolute;
//             top: 12px;
//             left: 6px;
//             width: 10px;
//             height: 10px;
//             border-radius: 50%;
//             background-color: #ff4d4f;
//           }
//         `}
//       </style>

//       {/* Chat Drawer */}
//       <Drawer
//         title={
//           <div className="flex items-center justify-between">
//             <span className="flex items-center">
//               <CustomerServiceOutlined className="mr-2 text-blue-600" />
//               <span className="font-semibold">Centre de Réclamations</span>
//               {unreadCount > 0 && (
//                 <Badge
//                   count={unreadCount}
//                   size="small"
//                   style={{
//                     backgroundColor: "#ff4d4f",
//                     marginLeft: 8,
//                   }}
//                 />
//               )}
//             </span>
//             <Button
//               type="text"
//               icon={<CloseOutlined />}
//               onClick={() => setDrawerVisible(false)}
//               className="text-gray-500 hover:text-gray-700"
//             />
//           </div>
//         }
//         placement="right"
//         onClose={() => setDrawerVisible(false)}
//         visible={drawerVisible}
//         width={800}
//         bodyStyle={{ padding: 0 }}
//         headerStyle={{ borderBottom: "1px solid #f0f0f0" }}
//       >
//         <div className="flex h-full">
//           {/* Reclamations List Sidebar */}
//           <div className="w-1/3 border-r bg-gray-50">
//             <div className="p-3 border-b bg-white">
//               <Input
//                 placeholder="🔍 Rechercher une réclamation..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 allowClear
//                 className="rounded-full"
//               />
//             </div>

//             <div className="p-2">
//               <Text type="secondary" className="text-xs">
//                 {filteredReclamations.length} réclamation(s) trouvée(s)
//               </Text>
//             </div>

//             <div
//               className="overflow-y-auto"
//               style={{ height: "calc(100vh - 120px)" }}
//             >
//               <List
//                 dataSource={filteredReclamations}
//                 renderItem={(reclamation) => {
//                   const hasUnreadMessages =
//                     reclamation.messages &&
//                     reclamation.messages.some(
//                       (message) =>
//                         (message.senderType === "admin" ||
//                           message.senderType === "commercial") &&
//                         message.senderId !== currentUser?.userId
//                     );

//                   return (
//                     <List.Item
//                       className={`reclamation-item p-3 ${
//                         selectedReclamation?._id === reclamation._id
//                           ? "selected"
//                           : ""
//                       }`}
//                       // onClick={() => setSelectedReclamation(reclamation)}
//                       onClick={() => handleReclamationSelect(reclamation)}
//                       style={{
//                         border: "none",
//                         cursor: "pointer",
//                         paddingLeft: "20px",
//                       }}
//                     >
//                       {/* {hasUnreadMessages && (
//                         <div className="unread-indicator" />
//                       )} */}
//                       <div className="w-full">
//                         <div className="flex justify-between items-start mb-2">
//                           <div className="flex items-center">
//                             <Badge
//                               color={getStatusColor(reclamation.status)}
//                               className="mr-2"
//                             />
//                             <Text strong className="text-sm">
//                               #{reclamation.numero_reclamation}
//                             </Text>
//                           </div>
//                           <Tag
//                             color={getStatusColor(reclamation.status)}
//                             icon={getStatusIcon(reclamation.status)}
//                             className="m-0 text-xs"
//                           >
//                             {reclamation.status || "nouveau"}
//                           </Tag>
//                         </div>
//                         {reclamation.assignedToName && (
//                           <div className="mt-1">
//                             <Text type="secondary" className="text-xs">
//                               Assigné à: {reclamation.assignedToName}
//                             </Text>
//                           </div>
//                         )}

//                         <Text className="block text-sm mb-1">
//                           {reclamation.nom_reclamant}
//                         </Text>

//                         <div className="flex justify-between items-center">
//                           <Text type="secondary" className="text-xs">
//                             {reclamation.date_reclamation
//                               ? dayjs(reclamation.date_reclamation).format(
//                                   "DD/MM/YYYY"
//                                 )
//                               : "N/A"}
//                           </Text>

//                           {isAdmin && reclamation.date_cloture && (
//                             <Text type="secondary" className="text-xs">
//                               Clôture:{" "}
//                               {dayjs(reclamation.date_cloture).format(
//                                 "DD/MM/YYYY"
//                               )}
//                             </Text>
//                           )}
//                         </div>
//                         {isAdmin && (
//                           <Button
//                             type="default"
//                             size="small"
//                             onClick={() => setTransferModalVisible(true)}
//                             icon={<SwapOutlined />}
//                             className="flex items-center ml-2"
//                           >
//                             Transférer
//                           </Button>
//                         )}

//                         {/* Admin-only information */}
//                         {isAdmin && (
//                           <div className="creator-info mt-2">
//                             <Text type="secondary" className="text-xs block">
//                               ID: {reclamation._id}
//                             </Text>
//                             <Text type="secondary" className="text-xs block">
//                               Créé par: {getCreatorName(reclamation.session)}
//                             </Text>
//                             <Text type="secondary" className="text-xs block">
//                               <MailOutlined className="mr-1" />
//                               {getCreatorEmail(reclamation.session)}
//                             </Text>
//                             <Text type="secondary" className="text-xs block">
//                               Type: {reclamation.sessionModel || "N/A"}
//                             </Text>
//                             <Text type="secondary" className="text-xs block">
//                               Créé le:{" "}
//                               {reclamation.createdAt
//                                 ? dayjs(reclamation.createdAt).format(
//                                     "DD/MM/YYYY HH:mm"
//                                   )
//                                 : "N/A"}
//                             </Text>
//                           </div>
//                         )}
//                       </div>
//                     </List.Item>
//                   );
//                 }}
//                 locale={{ emptyText: "Aucune réclamation trouvée" }}
//               />
//             </div>
//           </div>

//           {/* Chat Messages Panel */}
//           <div className="w-2/3 flex flex-col bg-white">
//             {selectedReclamation ? (
//               <>
//                 {/* Chat Header */}
//                 <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-gray-50">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <Title level={4} className="m-0 mb-1">
//                         Réclamation #{selectedReclamation.numero_reclamation}
//                       </Title>
//                       <Text type="secondary" className="text-sm">
//                         Client: {selectedReclamation.nom_reclamant}
//                       </Text>
//                       {selectedReclamation.assignedToName && (
//                         <div className="mt-1">
//                           <Text type="secondary" className="text-sm">
//                             Assigné à: {selectedReclamation.assignedToName}
//                           </Text>
//                         </div>
//                       )}

//                       {/* Creator information in chat header */}
//                       {isAdmin && selectedReclamation.session && (
//                         <div className="mt-2">
//                           <Text type="secondary" className="text-xs">
//                             Créé par:{" "}
//                             {getCreatorName(selectedReclamation.session)}
//                             {selectedReclamation.session.email && (
//                               <span>
//                                 {" "}
//                                 ({getCreatorEmail(selectedReclamation.session)})
//                               </span>
//                             )}
//                           </Text>
//                           <Text type="secondary" className="text-xs">
//                             Type: {selectedReclamation.sessionModel}
//                           </Text>
//                         </div>
//                       )}
//                     </div>
//                     <Button
//                       type="primary"
//                       size="small"
//                       onClick={() => {
//                         setSelectedStatus(
//                           selectedReclamation.status || "nouveau"
//                         );
//                         setStatusModalVisible(true);
//                       }}
//                       className="flex items-center"
//                     >
//                       <Tag
//                         color={getStatusColor(
//                           selectedReclamation.status || "nouveau"
//                         )}
//                         icon={getStatusIcon(
//                           selectedReclamation.status || "nouveau"
//                         )}
//                         className="m-0 mr-1"
//                       >
//                         {selectedReclamation.status || "nouveau"}
//                       </Tag>
//                       Modifier
//                     </Button>
//                   </div>

//                   {/* Additional reclamation info */}
//                   <Row gutter={16} className="mt-3">
//                     <Col span={12}>
//                       <div className="flex items-center text-sm">
//                         <ClockCircleOutlined className="mr-1 text-gray-400" />
//                         <Text type="secondary">
//                           Créée:{" "}
//                           {selectedReclamation.date_reclamation
//                             ? dayjs(
//                                 selectedReclamation.date_reclamation
//                               ).format("DD/MM/YYYY")
//                             : "N/A"}
//                         </Text>
//                       </div>
//                     </Col>
//                     <Col span={12}>
//                       {selectedReclamation.date_cloture && (
//                         <div className="flex items-center text-sm">
//                           <CheckCircleOutlined className="mr-1 text-gray-400" />
//                           <Text type="secondary">
//                             Clôture:{" "}
//                             {dayjs(selectedReclamation.date_cloture).format(
//                               "DD/MM/YYYY"
//                             )}
//                           </Text>
//                         </div>
//                       )}
//                     </Col>
//                   </Row>
//                 </div>

//                 {/* Messages List */}
//                 <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//                   {messages.length === 0 ? (
//                     <div className="text-center py-8 text-gray-400">
//                       <MessageOutlined className="text-3xl mb-2" />
//                       <div>Aucun message</div>
//                       <div className="text-sm">
//                         Soyez le premier à commenter
//                       </div>
//                     </div>
//                   ) : (
//                     messages.map((message, index) => (
//                       <div
//                         key={index}
//                         className={`mb-4 flex ${
//                           message.senderId === currentUser?.userId
//                             ? "justify-end"
//                             : "justify-start"
//                         }`}
//                       >
//                         <div className="flex items-start gap-2 max-w-xs">
//                           {message.senderId !== currentUser?.userId &&
//                             getUserAvatar(message.senderType)}
//                           <div
//                             className={`message-bubble ${
//                               message.senderId === currentUser?.userId
//                                 ? "bg-blue-100 border border-blue-200"
//                                 : "bg-white border border-gray-200"
//                             }`}
//                           >
//                             <div className="text-sm">{message.content}</div>
//                             <div className="message-time mt-1">
//                               {getUserName(
//                                 message.senderId,
//                                 message.senderType
//                               )}{" "}
//                               •{" "}
//                               {message.timestamp
//                                 ? dayjs(message.timestamp).format("HH:mm")
//                                 : "N/A"}
//                             </div>
//                           </div>
//                           {message.senderId === currentUser?.userId &&
//                             getUserAvatar(message.senderType)}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 {/* Message Input */}
//                 <div className="p-4 border-t bg-white">
//                   <div className="flex gap-2">
//                     <TextArea
//                       placeholder="Écrivez votre message..."
//                       value={newMessage}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onPressEnter={(e) => {
//                         if (e.shiftKey) return; // Allow new line with Shift+Enter
//                         e.preventDefault();
//                         sendMessage();
//                       }}
//                       autoSize={{ minRows: 1, maxRows: 4 }}
//                       className="rounded-lg"
//                     />
//                     <Button
//                       type="primary"
//                       icon={<SendOutlined />}
//                       onClick={sendMessage}
//                       disabled={!newMessage.trim()}
//                       className="rounded-lg h-auto"
//                     >
//                       Envoyer
//                     </Button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center bg-gray-50">
//                 <div className="text-center text-gray-400 p-8">
//                   <TeamOutlined className="text-4xl mb-4" />
//                   <Title level={4} className="text-gray-400">
//                     Sélectionnez une réclamation
//                   </Title>
//                   <Text>
//                     Choisissez une réclamation dans la liste pour voir les
//                     discussions
//                   </Text>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Status Update Modal */}
//         <Modal
//           title={
//             <div className="flex items-center">
//               <InfoCircleOutlined className="mr-2 text-blue-500" />
//               <span>Modifier le statut de la réclamation</span>
//             </div>
//           }
//           visible={statusModalVisible}
//           onCancel={() => setStatusModalVisible(false)}
//           footer={[
//             <Button key="cancel" onClick={() => setStatusModalVisible(false)}>
//               Annuler
//             </Button>,
//             <Button
//               key="submit"
//               type="primary"
//               onClick={updateReclamationStatus}
//               icon={<CheckCircleOutlined />}
//             >
//               Mettre à jour
//             </Button>,
//           ]}
//           centered
//         >
//           <div className="mb-4">
//             <Text>Statut actuel: </Text>
//             <Tag color={getStatusColor(selectedReclamation?.status)}>
//               {selectedReclamation?.status || "nouveau"}
//             </Tag>
//           </div>

//           <Select
//             value={selectedStatus}
//             onChange={setSelectedStatus}
//             className="w-full"
//             placeholder="Sélectionnez un nouveau statut"
//           >
//             <Option value="nouveau">Nouveau</Option>
//             <Option value="en_cours">En cours</Option>
//             <Option value="en_attente">En attente</Option>
//             <Option value="resolu">Résolu</Option>
//             <Option value="rejete">Rejeté</Option>
//             {/* Only show "Fermé" option for admin users */}
//             {isAdmin && <Option value="ferme">Fermé</Option>}
//           </Select>
//         </Modal>
//         <Modal
//           title={
//             <div className="flex items-center">
//               <UserSwitchOutlined className="mr-2 text-blue-500" />
//               <span>Transférer la réclamation à un commercial</span>
//             </div>
//           }
//           visible={transferModalVisible}
//           onCancel={() => {
//             setTransferModalVisible(false);
//             setSelectedCommercial(null);
//           }}
//           footer={[
//             <Button
//               key="cancel"
//               onClick={() => {
//                 setTransferModalVisible(false);
//                 setSelectedCommercial(null);
//               }}
//             >
//               Annuler
//             </Button>,
//             <Button
//               key="submit"
//               type="primary"
//               onClick={handleTransferReclamation}
//               loading={transferLoading}
//               disabled={!selectedCommercial}
//               icon={<SwapOutlined />}
//             >
//               Transférer
//             </Button>,
//           ]}
//           centered
//         >
//           <div className="mb-4">
//             <Text>
//               Transférer la réclamation #
//               {selectedReclamation?.numero_reclamation} à:
//             </Text>
//           </div>

//           <Select
//             value={selectedCommercial?._id}
//             onChange={(value) => {
//               const commercial = commercials.find((c) => c._id === value);
//               setSelectedCommercial(commercial);
//             }}
//             className="w-full"
//             placeholder="Sélectionnez un commercial"
//             showSearch
//             optionFilterProp="children"
//             filterOption={(input, option) =>
//               option.children.toLowerCase().includes(input.toLowerCase())
//             }
//           >
//             {commercials.map((commercial) => (
//               <Option key={commercial._id} value={commercial._id}>
//                 {commercial.prenom} {commercial.nom} - {commercial.email}
//               </Option>
//             ))}
//           </Select>

//           {selectedCommercial && (
//             <div className="mt-4 p-3 bg-blue-50 rounded-md">
//               <Text strong>Commercial sélectionné:</Text>
//               <div className="mt-1">
//                 <Text>
//                   {selectedCommercial.prenom} {selectedCommercial.nom}
//                 </Text>
//                 <br />
//                 <Text type="secondary">{selectedCommercial.email}</Text>
//                 <br />
//                 <Text type="secondary">
//                   Téléphone: {selectedCommercial.phone || "N/A"}
//                 </Text>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </Drawer>
//     </>
//   );
// };

// export default ReclamationChatSidebar;


import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  Input,
  Button,
  Avatar,
  Tag,
  Space,
  Divider,
  Select,
  Badge,
  message,
  Modal,
  Form,
  Card,
  Typography,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  MailOutlined,
  UserSwitchOutlined,
  SwapOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useNotifications } from "../useNotifications";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReclamationChatSidebar = ({ reclamations, onReclamationUpdate }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedTransferUser, setSelectedTransferUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [managers, setManagers] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [activeTransferTab, setActiveTransferTab] = useState("commercials");
  
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const isManager = currentUser?.role?.toLowerCase() === "manager";
  const isCommercial = currentUser?.role?.toLowerCase() === "commercial";
  const { unreadCount, markAsRead, fetchUnreadCount } = useNotifications();

  const handleReclamationSelect = async (reclamation) => {
    setSelectedReclamation(reclamation);
    if (reclamation) {
      await markAsRead(reclamation._id);
      fetchUnreadCount();
    }
  };

  useEffect(() => {
    if (drawerVisible) {
      fetchAllUsers();
    }
  }, [drawerVisible]);

  const fetchAllUsers = async () => {
    try {
      const [adminsRes, commercialsRes, managersRes] = await Promise.all([
        axios.get("/admin"),
        axios.get("/commercials"),
        axios.get("/manager"),
      ]);

      setAdmins(adminsRes.data);
      setCommercials(commercialsRes.data);
      setManagers(managersRes.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleTransferReclamation = async () => {
    if (!selectedTransferUser || !selectedReclamation) return;

    setTransferLoading(true);
    try {
      let transferToModel;
      if (activeTransferTab === "admins") {
        transferToModel = "Admin";
      } else if (activeTransferTab === "managers") {
        transferToModel = "Manager";
      } else {
        transferToModel = "Commercial";
      }

      const response = await axios.post(
        `/reclamations/${selectedReclamation._id}/transfer`,
        {
          transferToId: selectedTransferUser._id,
          transferToName: `${selectedTransferUser.prenom || selectedTransferUser.name || ''} ${selectedTransferUser.nom || ''}`.trim(),
          transferToModel: transferToModel,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Réclamation transférée avec succès");
        setTransferModalVisible(false);
        setSelectedTransferUser(null);

        if (onReclamationUpdate) {
          onReclamationUpdate();
        }
      }
    } catch (error) {
      console.error("Error transferring reclamation:", error);
      message.error(error.response?.data?.error || "Erreur lors du transfert");
    } finally {
      setTransferLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedReclamation) {
      fetchMessages(selectedReclamation._id);
    }
  }, [selectedReclamation]);

  const fetchUsers = async () => {
    try {
      const [adminsRes, commercialsRes, managersRes] = await Promise.all([
        axios.get("/admin"),
        axios.get("/commercials"),
        axios.get("/manager"),
      ]);

      const combinedUsers = [
        ...adminsRes.data.map((admin) => ({
          ...admin,
          userType: "admin",
        })),
        ...commercialsRes.data.map((commercial) => ({
          ...commercial,
          userType: "commercial",
        })),
        ...managersRes.data.map((manager) => ({
          ...manager,
          userType: "manager",
        })),
      ];

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMessages = async (reclamationId) => {
    try {
      const response = await axios.get(
        `/reclamations/${reclamationId}/messages`
      );
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedReclamation) return;

    try {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;

      if (!decodedToken) {
        message.error("Utilisateur non authentifié");
        return;
      }

      const messageData = {
        reclamationId: selectedReclamation._id,
        content: newMessage,
        senderId: decodedToken.userId,
        senderType:
          decodedToken.role?.toLowerCase() ||
          decodedToken.userType?.toLowerCase() ||
          "user",
      };

      const response = await axios.post("/reclamations/messages", messageData);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");

    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Erreur lors de l'envoi du message");
    }
  };

  const updateReclamationStatus = async () => {
    if (!selectedReclamation || !selectedStatus) return;

    try {
      await axios.put(`/reclamations/${selectedReclamation._id}/status`, {
        status: selectedStatus,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (onReclamationUpdate) {
        onReclamationUpdate();
      }

      setStatusModalVisible(false);
      message.success("Statut mis à jour avec succès");
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      nouveau: "blue",
      en_cours: "orange",
      en_attente: "yellow",
      resolu: "green",
      ferme: "gray",
      rejete: "red",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      nouveau: <InfoCircleOutlined />,
      en_cours: <ClockCircleOutlined />,
      en_attente: <ClockCircleOutlined />,
      resolu: <CheckCircleOutlined />,
      ferme: <CheckCircleOutlined />,
      rejete: <CloseOutlined />,
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  const getUserName = (userId, userType) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return "Utilisateur inconnu";

    if (user.userType === "admin" || userType === "admin")
      return user.name || "Admin";
    return `${user.prenom || ""} ${user.nom || ""}`.trim() || "Utilisateur";
  };

  const getUserAvatar = (userType) => {
    const colors = {
      admin: "#1890ff",
      commercial: "#52c41a",
      manager: "#722ed1",
    };
    return (
      <Avatar
        size="small"
        style={{ backgroundColor: colors[userType] || "#ccc" }}
        icon={<UserOutlined />}
      />
    );
  };

  const getCreatorName = (session) => {
    if (!session) return "Inconnu";

    if (session.name) return session.name;

    if (session.nom || session.prenom) {
      return `${session.prenom || ""} ${session.nom || ""}`.trim();
    }

    return session.email || "Utilisateur inconnu";
  };

  const getCreatorEmail = (session) => {
    if (!session) return "N/A";
    return session.email || "N/A";
  };

  const canShowTransferButton = isAdmin || isManager || isCommercial;

  const getAvailableTransferTabs = () => {
    const tabs = [];
    
    if (isAdmin) {
      if (managers.length > 0) tabs.push("managers");
      if (commercials.length > 0) tabs.push("commercials");
      if (admins.length > 1) tabs.push("admins");
    } else if (isManager) {
      if (admins.length > 0) tabs.push("admins");
      if (commercials.length > 0) tabs.push("commercials");
    } else if (isCommercial) {
      if (admins.length > 0) tabs.push("admins");
      if (managers.length > 0) tabs.push("managers");
    }
    
    return tabs;
  };

  const renderUserList = (users, type) => {
    const label = type === 'admins' ? 'admin' : type === 'managers' ? 'manager' : 'commercial';
    
    return (
      <Select
        value={selectedTransferUser?._id}
        onChange={(value) => {
          const user = users.find((u) => u._id === value);
          setSelectedTransferUser(user);
        }}
        className="w-full"
        placeholder={`Sélectionnez un ${label}`}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {users
          .filter(user => user._id !== currentUser?.userId)
          .map((user) => (
            <Option key={user._id} value={user._id}>
              {type === 'admins' 
                ? `${user.name || 'Admin'} - ${user.email}`
                : `${user.prenom} ${user.nom} - ${user.email}`
              }
            </Option>
          ))}
      </Select>
    );
  };

  const TransferModalContent = () => {
    const getCurrentUserType = () => {
      if (isAdmin) return "Admin";
      if (isManager) return "Manager";
      if (isCommercial) return "Commercial";
      return "User";
    };

    const availableTabs = getAvailableTransferTabs();
    const shouldShowTabs = availableTabs.length > 1;

    return (
      <>
        <div className="mb-4">
          <Text>
            Vous êtes <Tag color="blue">{getCurrentUserType()}</Tag>
          </Text>
          <br />
          <Text>
            Transférer la réclamation #
            {selectedReclamation?.numero_reclamation} à:
          </Text>
        </div>

        {availableTabs.length === 0 ? (
          <Text type="danger">
            Aucun utilisateur disponible pour le transfert
          </Text>
        ) : shouldShowTabs ? (
          <Tabs 
            activeKey={activeTransferTab} 
            onChange={setActiveTransferTab}
            className="mb-4"
          >
            {availableTabs.includes('admins') && (
              <TabPane tab="Admins" key="admins">
                {renderUserList(admins, 'admins')}
              </TabPane>
            )}
            {availableTabs.includes('managers') && (
              <TabPane tab="Managers" key="managers">
                {renderUserList(managers, 'managers')}
              </TabPane>
            )}
            {availableTabs.includes('commercials') && (
              <TabPane tab="Commerciaux" key="commercials">
                {renderUserList(commercials, 'commercials')}
              </TabPane>
            )}
          </Tabs>
        ) : (
          <div className="mb-4">
            {activeTransferTab === 'admins' && renderUserList(admins, 'admins')}
            {activeTransferTab === 'managers' && renderUserList(managers, 'managers')}
            {activeTransferTab === 'commercials' && renderUserList(commercials, 'commercials')}
          </div>
        )}

        {selectedTransferUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <Text strong>Utilisateur sélectionné:</Text>
            <div className="mt-1">
              <Text>
                {selectedTransferUser.prenom || selectedTransferUser.name} {selectedTransferUser.nom || ''}
              </Text>
              <br />
              <Text type="secondary">{selectedTransferUser.email}</Text>
              <br />
              {selectedTransferUser.phone && (
                <Text type="secondary">
                  Téléphone: {selectedTransferUser.phone}
                </Text>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const filteredReclamations = reclamations.filter((reclamation) => {
    if (!searchQuery) return true;

    const searchTerm = searchQuery.toLowerCase();
    const creatorName = getCreatorName(reclamation.session).toLowerCase();

    return (
      reclamation.numero_reclamation?.toLowerCase().includes(searchTerm) ||
      reclamation.nom_reclamant?.toLowerCase().includes(searchTerm) ||
      reclamation._id?.toLowerCase().includes(searchTerm) ||
      creatorName.includes(searchTerm)
    );
  });

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 1000,
        }}
      >
        <Badge
          count={unreadCount}
          size="small"
          style={{
            backgroundColor: "#ff4d4f",
          }}
        >
          <Button
            type="primary"
            icon={<MessageOutlined  style={{ fontSize: "32px", marginRight: "2px" }}/>}
            onClick={() => {
              setDrawerVisible(true);
            }}
            style={{
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
            }}
          />
        </Badge>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .reclamation-item {
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
            position: relative;
          }
          .reclamation-item:hover {
            background-color: #f0f8ff;
            border-left-color: #1890ff;
          }
          .reclamation-item.selected {
            background-color: #e6f7ff;
            border-left-color: #1890ff;
          }
          .message-bubble {
            border-radius: 18px;
            padding: 12px 16px;
            max-width: 70%;
            word-wrap: break-word;
          }
          .message-time {
            font-size: 11px;
            opacity: 0.7;
          }
          .creator-info {
            background-color: #f9f9f9;
            border-radius: 6px;
            padding: 8px;
            margin-top: 8px;
          }
          .unread-indicator {
            position: absolute;
            top: 12px;
            left: 6px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #ff4d4f;
          }
        `}
      </style>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <CustomerServiceOutlined className="mr-2 text-blue-600" />
              <span className="font-semibold">Centre de demnades internes</span>
              {unreadCount > 0 && (
                <Badge
                  count={unreadCount}
                  size="small"
                  style={{
                    backgroundColor: "#ff4d4f",
                    marginLeft: 8,
                  }}
                />
              )}
            </span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={800}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <div className="flex h-full">
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-3 border-b bg-white">
              <Input
                placeholder="🔍 Rechercher une réclamation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="rounded-full"
              />
            </div>

            <div className="p-2">
              <Text type="secondary" className="text-xs">
                {filteredReclamations.length} réclamation(s) trouvée(s)
              </Text>
            </div>

            <div
              className="overflow-y-auto"
              style={{ height: "calc(100vh - 120px)" }}
            >
              <List
                dataSource={filteredReclamations}
                renderItem={(reclamation) => {
                  const hasUnreadMessages =
                    reclamation.messages &&
                    reclamation.messages.some(
                      (message) =>
                        (message.senderType === "admin" ||
                          message.senderType === "commercial" ||
                          message.senderType === "manager") &&
                        message.senderId !== currentUser?.userId
                    );

                  return (
                    <List.Item
                      className={`reclamation-item p-3 ${
                        selectedReclamation?._id === reclamation._id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleReclamationSelect(reclamation)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        paddingLeft: "20px",
                      }}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge
                              color={getStatusColor(reclamation.status)}
                              className="mr-2"
                            />
                            <Text strong className="text-sm">
                              #{reclamation.numero_reclamation}
                            </Text>
                          </div>
                          <Tag
                            color={getStatusColor(reclamation.status)}
                            icon={getStatusIcon(reclamation.status)}
                            className="m-0 text-xs"
                          >
                            {reclamation.status || "nouveau"}
                          </Tag>
                        </div>
                        
                        {reclamation.assignedToName && (
                          <div className="mt-1">
                            <Text type="secondary" className="text-xs">
                              Assigné à: {reclamation.assignedToName}
                            </Text>
                          </div>
                        )}

                        <Text className="block text-sm mb-1">
                          {reclamation.nom_reclamant}
                        </Text>

                        <div className="flex justify-between items-center">
                          <Text type="secondary" className="text-xs">
                            {reclamation.date_reclamation
                              ? dayjs(reclamation.date_reclamation).format(
                                  "DD/MM/YYYY"
                                )
                              : "N/A"}
                          </Text>

                          {(isAdmin || isManager) && reclamation.date_cloture && (
                            <Text type="secondary" className="text-xs">
                              Clôture:{" "}
                              {dayjs(reclamation.date_cloture).format(
                                "DD/MM/YYYY"
                              )}
                            </Text>
                          )}
                        </div>
                        
                        {canShowTransferButton && (
                          <Button
                            type="default"
                            size="small"
                            onClick={() => {
                              const availableTabs = getAvailableTransferTabs();
                              if (availableTabs.length > 0) {
                                setActiveTransferTab(availableTabs[0]);
                                setSelectedTransferUser(null);
                                setTransferModalVisible(true);
                              } else {
                                message.warning("Aucun utilisateur disponible pour le transfert");
                              }
                            }}
                            icon={<SwapOutlined />}
                            className="flex items-center ml-2 mt-2"
                          >
                            Transférer
                          </Button>
                        )}

                        {(isAdmin || isManager) && (
                          <div className="creator-info mt-2">
                            <Text type="secondary" className="text-xs block">
                              ID: {reclamation._id}
                            </Text>
                            <Text type="secondary" className="text-xs block">
                              Créé par: {getCreatorName(reclamation.session)}
                            </Text>
                            <Text type="secondary" className="text-xs block">
                              <MailOutlined className="mr-1" />
                              {getCreatorEmail(reclamation.session)}
                            </Text>
                            <Text type="secondary" className="text-xs block">
                              Type: {reclamation.sessionModel || "N/A"}
                            </Text>
                            <Text type="secondary" className="text-xs block">
                              Créé le:{" "}
                              {reclamation.createdAt
                                ? dayjs(reclamation.createdAt).format(
                                    "DD/MM/YYYY HH:mm"
                                  )
                                : "N/A"}
                            </Text>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
                locale={{ emptyText: "Aucune réclamation trouvée" }}
              />
            </div>
          </div>

          <div className="w-2/3 flex flex-col bg-white">
            {selectedReclamation ? (
              <>
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Title level={4} className="m-0 mb-1">
                        Réclamation #{selectedReclamation.numero_reclamation}
                      </Title>
                      <Text type="secondary" className="text-sm">
                        Client: {selectedReclamation.nom_reclamant}
                      </Text>
                      {selectedReclamation.assignedToName && (
                        <div className="mt-1">
                          <Text type="secondary" className="text-sm">
                            Assigné à: {selectedReclamation.assignedToName}
                          </Text>
                        </div>
                      )}

                      {(isAdmin || isManager) && selectedReclamation.session && (
                        <div className="mt-2">
                          <Text type="secondary" className="text-xs">
                            Créé par:{" "}
                            {getCreatorName(selectedReclamation.session)}
                            {selectedReclamation.session.email && (
                              <span>
                                {" "}
                                ({getCreatorEmail(selectedReclamation.session)})
                              </span>
                            )}
                          </Text>
                          <Text type="secondary" className="text-xs">
                            Type: {selectedReclamation.sessionModel}
                          </Text>
                        </div>
                      )}
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        setSelectedStatus(
                          selectedReclamation.status || "nouveau"
                        );
                        setStatusModalVisible(true);
                      }}
                      className="flex items-center"
                    >
                      <Tag
                        color={getStatusColor(
                          selectedReclamation.status || "nouveau"
                        )}
                        icon={getStatusIcon(
                          selectedReclamation.status || "nouveau"
                        )}
                        className="m-0 mr-1"
                      >
                        {selectedReclamation.status || "nouveau"}
                      </Tag>
                      Modifier
                    </Button>
                  </div>

                  <Row gutter={16} className="mt-3">
                    <Col span={12}>
                      <div className="flex items-center text-sm">
                        <ClockCircleOutlined className="mr-1 text-gray-400" />
                        <Text type="secondary">
                          Créée:{" "}
                          {selectedReclamation.date_reclamation
                            ? dayjs(
                                selectedReclamation.date_reclamation
                              ).format("DD/MM/YYYY")
                            : "N/A"}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      {selectedReclamation.date_cloture && (
                        <div className="flex items-center text-sm">
                          <CheckCircleOutlined className="mr-1 text-gray-400" />
                          <Text type="secondary">
                            Clôture:{" "}
                            {dayjs(selectedReclamation.date_cloture).format(
                              "DD/MM/YYYY"
                            )}
                          </Text>
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageOutlined className="text-3xl mb-2" />
                      <div>Aucun message</div>
                      <div className="text-sm">
                        Soyez le premier à commenter
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${
                          message.senderId === currentUser?.userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="flex items-start gap-2 max-w-xs">
                          {message.senderId !== currentUser?.userId &&
                            getUserAvatar(message.senderType)}
                          <div
                            className={`message-bubble ${
                              message.senderId === currentUser?.userId
                                ? "bg-blue-100 border border-blue-200"
                                : "bg-white border border-gray-200"
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="message-time mt-1">
                              {getUserName(
                                message.senderId,
                                message.senderType
                              )}{" "}
                              •{" "}
                              {message.timestamp
                                ? dayjs(message.timestamp).format("HH:mm")
                                : "N/A"}
                            </div>
                          </div>
                          {message.senderId === currentUser?.userId &&
                            getUserAvatar(message.senderType)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <TextArea
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onPressEnter={(e) => {
                        if (e.shiftKey) return;
                        e.preventDefault();
                        sendMessage();
                      }}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className="rounded-lg"
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="rounded-lg h-auto"
                    >
                      Envoyer
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400 p-8">
                  <TeamOutlined className="text-4xl mb-4" />
                  <Title level={4} className="text-gray-400">
                    Sélectionnez une réclamation
                  </Title>
                  <Text>
                    Choisissez une réclamation dans la liste pour voir les
                    discussions
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal
          title={
            <div className="flex items-center">
              <InfoCircleOutlined className="mr-2 text-blue-500" />
              <span>Modifier le statut de la réclamation</span>
            </div>
          }
          visible={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setStatusModalVisible(false)}>
              Annuler
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={updateReclamationStatus}
              icon={<CheckCircleOutlined />}
            >
              Mettre à jour
            </Button>,
          ]}
          centered
        >
          <div className="mb-4">
            <Text>Statut actuel: </Text>
            <Tag color={getStatusColor(selectedReclamation?.status)}>
              {selectedReclamation?.status || "nouveau"}
            </Tag>
          </div>

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-full"
            placeholder="Sélectionnez un nouveau statut"
          >
            <Option value="nouveau">Nouveau</Option>
            <Option value="en_cours">En cours</Option>
            <Option value="en_attente">En attente</Option>
            <Option value="resolu">Résolu</Option>
            <Option value="rejete">Rejeté</Option>
            {(isAdmin || isManager) && <Option value="ferme">Fermé</Option>}
          </Select>
        </Modal>
        
        <Modal
          title={
            <div className="flex items-center">
              <UserSwitchOutlined className="mr-2 text-blue-500" />
              <span>Transférer la réclamation</span>
            </div>
          }
          visible={transferModalVisible}
          onCancel={() => {
            setTransferModalVisible(false);
            setSelectedTransferUser(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setTransferModalVisible(false);
                setSelectedTransferUser(null);
              }}
            >
              Annuler
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleTransferReclamation}
              loading={transferLoading}
              disabled={!selectedTransferUser}
              icon={<SwapOutlined />}
            >
              Transférer
            </Button>,
          ]}
          centered
          width={600}
        >
          <TransferModalContent />
        </Modal>
      </Drawer>
    </>
  );
};

export default ReclamationChatSidebar;