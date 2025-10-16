// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Table,
//   Button,
//   Space,
//   Modal,
//   Form,
//   Input,
//   Select,
//   message,
//   Popconfirm,
// } from "antd";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   PlusOutlined,
//   UploadOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { useNavigate, Link, useParams } from "react-router-dom";
// import "tailwindcss/tailwind.css";
// import { Spin, Alert } from "antd";

// const { Option } = Select;

// const AffectuerLead = () => {
//   const [chatData, setChatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [commercials, setCommercials] = useState([]);
//   const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
//   const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
//   const [showSpinner, setShowSpinner] = useState(false);
//   const [form] = Form.useForm();
//   const [assignForm] = Form.useForm();
//   const [unassignForm] = Form.useForm();
//   const [selectedLeads, setSelectedLeads] = useState([]);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredData, setFilteredData] = useState([]);

//   const handlePageChange = (value) => {
//     setCurrentPage(value);
//   };
//   const totalPages = Math.ceil(chatData.length / pageSize);

  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const response = await axios.get("/data");
  //       console.log("Fetched data leads:", response.data);
  //       console.log("Fetched leads:", response.data.chatData);

  //       setChatData(response.data.chatData);
  //     } catch (err) {
  //       console.error("Failed to fetch data:", err);
  //       setError("Failed to fetch data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   getUserData();
  // }, []);
//   useEffect(() => {
//     const getUserData = async () => {
//       try {
//         const response = await axios.get("/data");
//         console.log("Fetched data leads:", response.data);
//         console.log("Fetched leads:", response.data.chatData);

//         if (response.data && response.data.chatData) {
//           // Filter chatData to get "all" or "nouveau" types
//           const filteredData = response.data.chatData.filter(
//             (chat) => chat.type === "all" || chat.type === "nouveau"
//           );

//           // Check if any of the filtered data contains the 'commercial' field
//           const commercialExists = filteredData.some((chat) => chat.commercial);

//           if (commercialExists) {
//             setChatData(filteredData); // Set filtered data if 'commercial' doesn't exist
//             console.log("Fetched leads (without commercial):", filteredData);
//           } else {
//             // If 'commercial' exists, do something else if needed (e.g., handle that case)
//             console.log("Commercial data exists, handle accordingly");
//           }
//         } else {
//           setChatData([]); // Fallback to an empty array if chatData is missing
//           console.error("chatData is missing in the response");
//         }
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getUserData();
//   }, []);

//   // useEffect(() => {
//   //     const getUserData = async () => {
//   //       try {
//   //         const response = await axios.get("/data");
//   //         console.log("Fetched data leads:", response.data);
//   //         console.log("Fetched leads:", response.data.chatData);
//   //         if (response.data && response.data.chatData) {
//   //           const filteredData = response.data.chatData.filter(chat => chat.type === "all" || chat.type === "nouveau");
//   //           setChatData(filteredData);
//   //           console.log("Fetched leads:", filteredData);
//   //         } else {
//   //           setChatData([]); // Fallback to an empty array
//   //           console.error("chatData is missing in the response");
//   //         }
//   //       } catch (err) {
//   //         console.error("Failed to fetch data:", err);
//   //         setError("Failed to fetch data");
//   //       } finally {
//   //         setLoading(false);
//   //       }
//   //     };
//   //     getUserData();
//   //   }, []);
//   useEffect(() => {
//     fetchCommercials();
//   }, []);

//   // const handleColumnSearch = async (e, columnKey) => {
//   //   const value = e.target.value.toLowerCase().trim();
//   //   setSearchQuery(value);

//   //   try {
//   //     // If search value is empty, show all data
//   //     if (value === '') {
//   //       setFilteredData(chatData);
//   //       return;
//   //     }

//   //     // If searching on 'commercial', handle 'N/A' or empty value cases
//   //     if (columnKey === "commercial") {
//   //       const filteredData = chatData.filter((item) => {
//   //         const commercialValue = item[columnKey]
//   //           ? `${item[columnKey].prenom} ${item[columnKey].nom}`.toLowerCase()
//   //           : "n/a"; // Set 'n/a' as default if commercial is empty or null

//   //         return commercialValue.includes(value);
//   //       });
//   //       setFilteredData(filteredData);
//   //       return;
//   //     }

//   //     // Default search (for other fields)
//   //     const response = await axios.get("/search", {
//   //       params: {
//   //         query: value,
//   //         columnKey: columnKey,
//   //       },
//   //     });
//   //     setFilteredData(response.data);
//   //   } catch (error) {
//   //     console.error("Error in search:", error);
//   //     message.error("Error while searching.");
//   //   }
//   // };
//   const handleColumnSearch = async (e, columnKey) => {
//     const value = e.target.value.toLowerCase().trim();
//     setSearchQuery(value);

//     try {
//       // If search value is empty, show all sorted data
//       if (value === "") {
//         setFilteredData([]); // Clear filtered data to show original sorted data
//         return;
//       }

//       // If searching on 'commercial', handle 'N/A' or empty value cases
//       if (columnKey === "commercial") {
//         const filteredData = chatData.filter((item) => {
//           const commercialValue = item[columnKey]
//             ? `${item[columnKey].prenom} ${item[columnKey].nom}`.toLowerCase()
//             : "n/a";

//           return commercialValue.includes(value);
//         });

//         // Sort the filtered results too
//         const sortedFilteredData = filteredData.sort((a, b) => {
//           const aHasCommercial = a.commercial && a.commercial !== null;
//           const bHasCommercial = b.commercial && b.commercial !== null;

//           if (!aHasCommercial && bHasCommercial) return -1;
//           if (aHasCommercial && !bHasCommercial) return 1;
//           return new Date(b.createdAt) - new Date(a.createdAt);
//         });

//         setFilteredData(sortedFilteredData);
//         return;
//       }

//       // Default search (for other fields)
//       const response = await axios.get("/search", {
//         params: {
//           query: value,
//           columnKey: columnKey,
//         },
//       });

//       // Sort the search results too
//       const sortedSearchResults = response.data.sort((a, b) => {
//         const aHasCommercial = a.commercial && a.commercial !== null;
//         const bHasCommercial = b.commercial && b.commercial !== null;

//         if (!aHasCommercial && bHasCommercial) return -1;
//         if (aHasCommercial && !bHasCommercial) return 1;
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       });

//       setFilteredData(sortedSearchResults);
//     } catch (error) {
//       console.error("Error in search:", error);
//       message.error("Error while searching.");
//     }
//   };

//   const handleAssign = async (values) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         message.error("No token found, please login first");
//         return;
//       }

//       await axios.post(
//         "/assign-leads",
//         {
//           id: selectedLeads,
//           commercialId: values.commercial,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const updatedLeads = chatData.map((lead) => {
//         if (selectedLeads.includes(lead._id)) {
//           return {
//             ...lead,
//             commercial: commercials.find(
//               (com) => com._id === values.commercial
//             ),
//           };
//         }
//         return lead; // Fix here, it was returning `chatData`
//       });
//       setChatData(updatedLeads);
//       message.success("Leads assigned to commercial successfully");
//       setIsAssignModalVisible(false);
//       setSelectedLeads([]);
//     } catch (error) {
//       console.error("Error assigning leads:", error);
//       message.error("Failed to assign leads");
//     }
//   };
//   const fetchCommercials = async () => {
//     try {
//       const response = await axios.get("/commercials");
//       setCommercials(response.data);
//       console.log("Fetched commercials:", response.data);
//     } catch (error) {
//       console.error("Error fetching commercials:", error);
//       message.error("Failed to fetch commercials");
//     }
//   };

//   const handleUnassign = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         message.error("No token found, please login first");
//         return;
//       }
//       await axios.post(
//         "/unassign-leads",
//         {
//           id: selectedLeads,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const updatedLeads = chatData.map((lead) => {
//         if (selectedLeads.includes(lead._id)) {
//           return {
//             ...lead,
//             commercial: null,
//           };
//         }
//         return lead;
//       });
//       setChatData(updatedLeads);
//       message.success("Leads unassigned from commercial successfully");
//       setIsUnassignModalVisible(false);
//       setSelectedLeads([]);
//     } catch (error) {
//       console.error("Error unassigning leads:", error);
//       message.error("Failed to unassign leads");
//     }
//   };

//   if (loading && showSpinner) return <Spin tip="Loading..." />;

//   if (error)
//     return <Alert message="Error" description={error} type="error" showIcon />;

//   const columns = [
//     {
//       title: "Prénom et Nom",
//       key: "nom",
//       dataIndex: "nom",
//       render: (text, record) => (
//         <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
//           <div>{`${record.nom || ""}`}</div>
//         </div>
//       ),
//     },

//     {
//       title: "Email",
//       key: "email" || "email1",
//       dataIndex: "email" || "email1",
//       render: (text, record) => (
//         <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
//           <div className="text-gray-500 text-xs">
//             {record.verification_email === "Non"
//               ? record.email1 || ""
//               : record.email || ""}
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Address",
//       dataIndex: "address",
//       key: "address",
//       render: (text) => text || "",
//     },
//     {
//       title: "code postal",
//       dataIndex: "codepostal",
//       key: "codepostal",
//       render: (text) => text || "",
//     },
//     {
//       title: "Ville",
//       dataIndex: "ville",
//       key: "ville",
//       render: (text) => text || "",
//     },
//     {
//       title: "TELEPHONE",
//       dataIndex: "phone",
//       key: "phone",
//       render: (text) => text || "",
//     },
//     {
//       title: "Statut",
//       dataIndex: "statut",
//       key: "statut",
//       render: (text, record) => text || record.statut || "",
//     },
//     {
//       title: "DATE",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (date) => {
//         if (!date) return "-";
//         const formattedDate = new Date(date);
//         const day = formattedDate.toLocaleDateString("en-GB");
//         const time = formattedDate.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//         return (
//           <div
//             className="cursor-pointer"
//             onClick={() => handleLeadClick(record)}
//           >
//             <div>{day}</div>
//             <div className="text-gray-500 text-sm">{time}</div>
//           </div>
//         );
//       },
//     },

//     // {
//     //   title: "Commentaire",
//     //   dataIndex: "commentaire",
//     //   key: "commentaire",
//     //   render: (text, record) => (
//     //     <div className="text-gray-500 text-xs">
//     //       {record.commentaire ||
//     //         ""}
//     //     </div>
//     //   ),
//     // },
//     {
//       title: "Commentaires",
//       dataIndex: "commentaire",
//       key: "commentaire",
//       render: (text, record) => (
//         <div className="text-gray-500 text-xs">
//           {record.commentaire && <div>{record.commentaire}</div>}
//           {record.comment && <div>{record.comment}</div>}
//           {!record.commentaire && !record.comment && "-"}
//         </div>
//       ),
//     },

//     {
//       title: "commercial",
//       key: "commercial",
//       dataIndex: "commercial",
//       render: (text, record) => {
//         // Handle both string ID and populated object
//         if (!record.commercial) {
//           return "N/A";
//         }

//         // If commercial is a string ID
//         if (typeof record.commercial === "string") {
//           // Find the commercial in your commercials state
//           const commercial = commercials.find(
//             (com) => com._id === record.commercial
//           );
//           return commercial ? `${commercial.prenom} ${commercial.nom}` : "N/A";
//         }

//         // If commercial is a populated object
//         if (record.commercial.prenom && record.commercial.nom) {
//           return `${record.commercial.prenom} ${record.commercial.nom}`;
//         }

//         return "N/A";
//       },
//     },
//     {
//       title: <span style={{ fontSize: "12px" }}>Action</span>,
//       key: "action",
//       render: (text, record) => (
//         <Space size="middle">
//           <Popconfirm
//             title="Êtes-vous sûr de vouloir supprimer ce lead ?"
//             onConfirm={() => handleDelete(record._id)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <Button
//               icon={<DeleteOutlined />}
//               style={{ backgroundColor: "red", color: "white" }}
//               danger
//               size="small"
//             />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   const rowSelection = {
//     onChange: (selectedRowKeys) => {
//       setSelectedLeads(selectedRowKeys);
//     },
//     selectedRowKeys: selectedLeads,
//   };
//   const handleDelete = async (id) => {
//     try {
//       const response = await axios.delete(`/lead/${id}`);

//       console.log("Chat deleted successfully:", response.data);
//       setChatData(chatData.filter((lead) => lead._id !== id));
//       message.success("Coach deleted successfully");
//     } catch (error) {
//       console.error("Error deleting coach:", error);
//       message.error("Failed to delete coach");
//     }
//   };

//   return (
//     <div className="md:p-4 p-1 w-full">
//       <h1 className="text-xl font-bold mb-4">Affectation des Leads</h1>

//       <div className="flex-1 space-y-4 justify-between mb-4">
//         <div className="flex md:flex-row md:space-y-0 flex-col space-y-4">
//           <Button
//             type=""
//             className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
//             onClick={() => setIsAssignModalVisible(true)}
//           >
//             Affecter les Leads au Commercial
//           </Button>
//           <Button
//             type=""
//             onClick={() => setIsUnassignModalVisible(true)}
//             className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold lg:ml-2"
//           >
//             Désaffecter les leads du Commercial
//           </Button>
//         </div>
//       </div>
//       <div className="mb-4 p-4 flex items-center rounded-md gap-4">
//         <span className="font-thin text-gray-600">Afficher</span>
//         <Select
//           defaultValue={1}
//           onChange={handlePageChange}
//           className="w-20 border-gray-300"
//         >
//           {[...Array(totalPages)].map((_, index) => (
//             <Option key={index + 1} value={index + 1}>
//               {index + 1}
//             </Option>
//           ))}
//         </Select>

//         <span className="font-thin text-gray-600">résultats par page</span>
//       </div>
//       <div className="mb-4">
//         <span className="font-semibold text-gray-700">
//           Total Leads: {filteredData.length}
//         </span>
//       </div>
//       <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 overflow-x-auto">
//         <Table
//           dataSource={filteredData.length ? filteredData : chatData}
//           columns={[
//             ...columns.map((col) => ({
//               ...col,
//               title: (
//                 <div className="flex flex-col items-center">
//                   <div className="text-xs">{col.title}</div>
//                   {col.key !== "action" &&
//                     col.key !== "createdAt" &&
//                     col.key !== "commentaire" && (
//                       <Input
//                         placeholder={`${col.title}`}
//                         onChange={(e) => handleColumnSearch(e, col.key)}
//                         className="mt-2"
//                         size="medium"
//                         style={{ width: "120%" }}
//                         placeholderStyle={{ fontSize: "2px" }}
//                       />
//                     )}
//                 </div>
//               ),
//             })),
//           ]}
//           rowKey={(record) => record._id}
//           // pagination={false}
//           pagination={{
//             current: currentPage,
//             pageSize,
//             total: chatData.length,
//             onChange: (page) => setCurrentPage(page),
//           }}
//           bordered
//           rowSelection={rowSelection}
//           className="custom-table text-xs sm:text-sm"
//           tableLayout="auto"
//         />
//       </div>
//       <Modal
//         title="Affecter les leads au Commercial"
//         visible={isAssignModalVisible}
//         onCancel={() => setIsAssignModalVisible(false)}
//         footer={null}
//       >
//         <Form form={assignForm} onFinish={handleAssign}>
//           <Form.Item
//             name="commercial"
//             label="Commercial"
//             rules={[
//               {
//                 required: true,
//                 message: "Veuillez sélectionner un commercial",
//               },
//             ]}
//           >
//             <Select placeholder="Sélectionnez un commercial">
//               {commercials.map((commercial) => (
//                 <Option key={commercial._id} value={commercial._id}>
//                   {commercial.nom} {commercial.prenom}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//           <Form.Item>
//             <Button
//               className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
//               htmlType="submit"
//             >
//               Affecter
//             </Button>
//             <Button
//               onClick={() => setIsAssignModalVisible(false)}
//               className="ml-2"
//             >
//               Annuler
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//       <Modal
//         title="Désaffecter les Leads du Commercial"
//         visible={isUnassignModalVisible}
//         onCancel={() => setIsUnassignModalVisible(false)}
//         footer={null}
//       >
//         <Form form={unassignForm} onFinish={handleUnassign}>
//           <Form.Item>
//             <Button
//               className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
//               htmlType="submit"
//             >
//               Désaffecter
//             </Button>
//             <Button
//               onClick={() => setIsUnassignModalVisible(false)}
//               className="ml-2"
//             >
//               Annuler
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AffectuerLead;
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AffectuerLead = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commercials, setCommercials] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [unassignForm] = Form.useForm();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
    // Helper function to check if a lead has a commercial
    const hasCommercial = (lead) => {
      if (!lead.commercial) return false;
      if (typeof lead.commercial === 'string') return lead.commercial !== '';
      if (typeof lead.commercial === 'object') return lead.commercial !== null;
      return false;
    };
  

  // Sort data: unassigned leads first, then by creation date
  const sortedData = useMemo(() => {
    const dataToSort = filteredData.length > 0 ? filteredData : chatData;
    
    return [...dataToSort].sort((a, b) => {
      // Check if lead has commercial
      const aHasCommercial = hasCommercial(a);
      const bHasCommercial = hasCommercial(b);
      
      // Unassigned leads come first
      if (!aHasCommercial && bHasCommercial) return -1;
      if (aHasCommercial && !bHasCommercial) return 1;
      
      // If same commercial status, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [chatData, filteredData]);


  // Helper function to get commercial name for display and search
  const getCommercialName = (lead) => {
    if (!hasCommercial(lead)) return "N/A";
    
    if (typeof lead.commercial === 'string') {
      const commercial = commercials.find(com => com._id === lead.commercial);
      return commercial ? `${commercial.prenom} ${commercial.nom}` : "N/A";
    }
    
    if (lead.commercial.prenom && lead.commercial.nom) {
      return `${lead.commercial.prenom} ${lead.commercial.nom}`;
    }
    
    return "N/A";
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        console.log("Fetched data leads:", response.data);
        console.log("Fetched leads:", response.data.chatData);

        setChatData(response.data.chatData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    fetchCommercials();
  }, []);

  // Fixed commercial column search
  const handleColumnSearch = async (e, columnKey) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchQuery(value);

    try {
      // If search value is empty, clear filtered data
      if (value === "") {
        setFilteredData([]);
        return;
      }

      // Special handling for commercial column search
      if (columnKey === "commercial") {
        const filteredResults = chatData.filter((item) => {
          const commercialName = getCommercialName(item).toLowerCase();
          return commercialName.includes(value);
        });
        setFilteredData(filteredResults);
        return;
      }

      // Default search for other fields
      const response = await axios.get("/search", {
        params: {
          query: value,
          columnKey: columnKey,
        },
      });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error in search:", error);
      message.error("Error while searching.");
    }
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.post(
        "/assign-leads",
        {
          id: selectedLeads,
          commercialId: values.commercial,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const updatedLeads = chatData.map((lead) => {
        if (selectedLeads.includes(lead._id)) {
          return {
            ...lead,
            commercial: commercials.find((com) => com._id === values.commercial),
          };
        }
        return lead;
      });
      
      setChatData(updatedLeads);
      message.success("Leads assigned to commercial successfully");
      setIsAssignModalVisible(false);
      setSelectedLeads([]);
    } catch (error) {
      console.error("Error assigning leads:", error);
      message.error("Failed to assign leads");
    }
  };

  const fetchCommercials = async () => {
    try {
      const response = await axios.get("/commercials");
      setCommercials(response.data);
      console.log("Fetched commercials:", response.data);
    } catch (error) {
      console.error("Error fetching commercials:", error);
      message.error("Failed to fetch commercials");
    }
  };

  const handleUnassign = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }
      await axios.post(
        "/unassign-leads",
        {
          id: selectedLeads,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedLeads = chatData.map((lead) => {
        if (selectedLeads.includes(lead._id)) {
          return {
            ...lead,
            commercial: null,
          };
        }
        return lead;
      });
      setChatData(updatedLeads);
      message.success("Leads unassigned from commercial successfully");
      setIsUnassignModalVisible(false);
      setSelectedLeads([]);
    } catch (error) {
      console.error("Error unassigning leads:", error);
      message.error("Failed to unassign leads");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);
      console.log("Chat deleted successfully:", response.data);
      setChatData(chatData.filter((lead) => lead._id !== id));
      message.success("Lead deleted successfully");
    } catch (error) {
      console.error("Error deleting lead:", error);
      message.error("Failed to delete lead");
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedLeads(selectedRowKeys);
    },
    selectedRowKeys: selectedLeads,
  };

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };
  const columns = [
    {
      title: "Prénom et Nom",
      key: "nom",
      dataIndex: "nom",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
           <div className="font-medium">
            {record.nom} {record.prenom}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      render: (text, record) => (
        <div className="text-gray-500 text-xs">
          {record.verification_email === "Non"
            ? record.email1 || ""
            : record.email || ""}
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "",
    },
    {
      title: "code postal",
      dataIndex: "codepostal",
      key: "codepostal",
      render: (text) => text || "",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
      render: (text) => text || "",
    },
    {
      title: "TELEPHONE",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (text, record) => text || record.statut || "",
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        if (!date) return "-";
        const formattedDate = new Date(date);
        const day = formattedDate.toLocaleDateString("en-GB");
        const time = formattedDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div>
            <div>{day}</div>
            <div className="text-gray-500 text-sm">{time}</div>
          </div>
        );
      },
    },
    {
      title: "Commentaires",
      dataIndex: "commentaire",
      key: "commentaire",
      render: (text, record) => (
        <div className="text-gray-500 text-xs">
          {record.commentaire && <div>{record.commentaire}</div>}
          {record.comment && <div>{record.comment}</div>}
          {!record.commentaire && !record.comment && "-"}
        </div>
      ),
    },
    {
      title: "commercial",
      key: "commercial",
      dataIndex: "commercial",
      render: (text, record) => {
        const commercialName = getCommercialName(record);
        // Highlight unassigned leads
        if (commercialName === "N/A") {
          return <span style={{ color: 'red', fontWeight: 'semibold' }}>NON AFFECTÉ</span>;
        }
        return commercialName;
      },
    },
    {
      title: <span style={{ fontSize: "12px" }}>Action</span>,
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce lead ?"
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
    <div className="md:p-4 p-1 w-full">
      <h1 className="text-xl font-bold mb-4">Affectation des Leads</h1>

      <div className="flex-1 space-y-4 justify-between mb-4">
        <div className="flex md:flex-row md:space-y-0 flex-col space-y-4">
          <Button
            type=""
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            onClick={() => setIsAssignModalVisible(true)}
            disabled={selectedLeads.length === 0}
          >
            Affecter les Leads au Commercial ({selectedLeads.length})
          </Button>
          <Button
            type=""
            onClick={() => setIsUnassignModalVisible(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold lg:ml-2"
            disabled={selectedLeads.length === 0}
          >
            Désaffecter les leads du Commercial ({selectedLeads.length})
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <span className="font-semibold text-gray-700">
          Total Leads: {sortedData.length}
          {filteredData.length > 0 && ` (Filtered: ${filteredData.length})`}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 overflow-x-auto">
        <Table
          dataSource={sortedData}
          columns={columns.map((col) => ({
            ...col,
            title: (
              <div className="flex flex-col items-center">
                <div className="text-xs">{col.title}</div>
                {col.key !== "action" && col.key !== "createdAt" && col.key !== "commentaire" && col.key !=="comment" && (
                  <Input
                    placeholder={`Search ${col.title}`}
                    onChange={(e) => handleColumnSearch(e, col.key)}
                    className="mt-2"
                    size="small"
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            ),
          }))}
          rowKey={(record) => record._id}
          pagination={{
            current: currentPage,
            pageSize,
            total: sortedData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          bordered
          rowSelection={rowSelection}
          className="custom-table text-xs sm:text-sm"
          tableLayout="auto"
        />
      </div>

      <Modal
        title="Affecter les leads au Commercial"
        visible={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
      >
        <Form form={assignForm} onFinish={handleAssign}>
          <Form.Item
            name="commercial"
            label="Commercial"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un commercial",
              },
            ]}
          >
            <Select placeholder="Sélectionnez un commercial">
              {commercials.map((commercial) => (
                <Option key={commercial._id} value={commercial._id}>
                  {commercial.nom} {commercial.prenom}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              htmlType="submit"
            >
              Affecter
            </Button>
            <Button
              onClick={() => setIsAssignModalVisible(false)}
              className="ml-2"
            >
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Désaffecter les Leads du Commercial"
        visible={isUnassignModalVisible}
        onCancel={() => setIsUnassignModalVisible(false)}
        footer={null}
      >
        <Form form={unassignForm} onFinish={handleUnassign}>
          <Form.Item>
            <p>Êtes-vous sûr de vouloir désaffecter {selectedLeads.length} lead(s) ?</p>
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              htmlType="submit"
            >
              Désaffecter
            </Button>
            <Button
              onClick={() => setIsUnassignModalVisible(false)}
              className="ml-2"
            >
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AffectuerLead;