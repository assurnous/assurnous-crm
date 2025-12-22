import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Spin,
  Table,
  Alert,
  Select,
  Button,
  Popconfirm,
  Space,
  message,
  Input,
  Modal, Typography, Card
} from "antd";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, SwapOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";



const { Title, Text } = Typography;

const { Option } = Select;

const Clientdigital = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("tous");
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


const [transferModalVisible, setTransferModalVisible] = useState(false);
const [selectedClient, setSelectedClient] = useState(null);
const [selectedCommercial, setSelectedCommercial] = useState(null);
const [selectedManager, setSelectedManager] = useState(null);
const [commercials, setCommercials] = useState([]);
const [managers, setManagers] = useState([]);
const [transferring, setTransferring] = useState(false);

  const [filters, setFilters] = useState({
    gestionaire: "tous",
    categorie: "tous",
    status: "tous",
    search: "",
  });

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Fetch commercials and managers for transfer
const fetchUsersForTransfer = async () => {
  try {
    const [commercialsRes, managersRes] = await Promise.all([
      axios.get("/commercials"),
      axios.get("/manager"),
    ]);
    
    setCommercials(commercialsRes.data);
    setManagers(managersRes.data);
  } catch (error) {
    console.error("Error fetching users for transfer:", error);
  }
};

// Add this useEffect to fetch users on component mount
useEffect(() => {
  fetchUsersForTransfer();
}, []);

// Open Transfer Modal
const openTransferModal = (client) => {
  setSelectedClient(client);
  setSelectedCommercial(null);
  setSelectedManager(null);
  setTransferModalVisible(true);
};

// Handle Transfer
const handleTransfer = async () => {
  if (!selectedCommercial && !selectedManager) {
    message.warning("Veuillez sélectionner un commercial ou un manager");
    return;
  }

  try {
    setTransferring(true);
    const token = localStorage.getItem("token");
    
    // First, unassign from current gestionnaire if exists
    if (selectedClient.gestionnaire?._id) {
      try {
        await axios.post("/transfer-leads", {
          leadIds: [selectedClient._id],
          commercialId: selectedClient.gestionnaire._id,
          id: [selectedClient._id]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (unassignError) {
        console.log("No existing assignment or error unassigning:", unassignError);
      }
    }

    // Assign to new gestionnaire
    if (selectedCommercial) {
      await axios.post("/transfer-leads", {
        leadIds: [selectedClient._id],
        commercialId: selectedCommercial
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else if (selectedManager) {
      await axios.post("/transfer-leads", {
        leadIds: [selectedClient._id],
        managerId: selectedManager
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    message.success("Client transféré avec succès");
    setTransferModalVisible(false);
    setRefreshTrigger(prev => prev + 1);
    
  } catch (error) {
    console.error("Error transferring client:", error);
    message.error("Erreur lors du transfert: " + (error.response?.data?.message || error.message));
  } finally {
    setTransferring(false);
  }
};
  
  const applyFilters = (filterValues) => {
    let result = [...chatData];

    // Gestionnaire filter
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter(client => {
        const gestionnaireDisplayName = client.gestionnaire?.name || 
                                      `${client.gestionnaire?.nom || ''} ${client.gestionnaire?.prenom || ''}`.trim();
        
        return (
          gestionnaireDisplayName === filterValues.gestionnaire ||
          client.gestionnaireName === filterValues.gestionnaire
        );
      });
    }

    // Catégorie filter
    if (filterValues.categorie && filterValues.categorie !== "tous") {
      result = result.filter(client => {
        return client.categorie === filterValues.categorie;
      });
    }

    // Statut filter
    if (filterValues.status && filterValues.status !== "tous") {
      result = result.filter(client => {
        return client.statut === filterValues.status;
      });
    }

    // Search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter(client => {
        const fullName = `${client.nom || ''} ${client.prenom || ''}`.trim().toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = (client.portable || client.telephone_entreprise || '').toLowerCase();
        const company = (client.nom || '').toLowerCase();
        const agence = (client.agence || '').toLowerCase();
        const assurances = (client.assurances_interessees || []).join(' ').toLowerCase();
        const comment = (client.comment || '').toLowerCase();
        
        return (
          fullName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          company.includes(searchTerm) ||
          agence.includes(searchTerm) ||
          assurances.includes(searchTerm) ||
          comment.includes(searchTerm)
        );
      });
    }

    setFilteredData(result);
  };

  useEffect(() => {
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
          }))
        ];

        setUsers(combinedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };

  const totalPages = Math.ceil(chatData.length / pageSize);

 
  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const response = await axios.get("/data");
  //       const allData = response.data.chatData;
        
  //       // Filter for digital clients - those that have digital-specific fields
  //       const digitalClients = allData.filter(item => 
  //         item.agence && 
  //         item.assurances_interessees && 
  //         item.rappel_at && 
  //         item.comment
  //       );
  
  //       // Sort by creation date (newest first)
  //       const sortedData = digitalClients.sort((a, b) => {
  //         const dateA = new Date(a.createdAt);
  //         const dateB = new Date(b.createdAt);
  //         return dateB - dateA; // Descending order (newest first)
  //       });
  
  //       setChatData(sortedData);
  //       setFilteredData(sortedData); // Initialize filteredData with sorted data
  
  //       // Apply active filter if needed
  //       if (activeFilter === "prospect") {
  //         setFilteredData(
  //           sortedData.filter((item) => item.statut === "prospect")
  //         );
  //       } else if (activeFilter === "client") {
  //         setFilteredData(
  //           sortedData.filter((item) => item.statut === "client")
  //         );
  //       } else if (activeFilter === "Gelé") {
  //         setFilteredData(sortedData.filter((item) => item.statut === "Gelé"));
  //       } else if (activeFilter === "tous") {
  //         setFilteredData(sortedData);
  //       }
  //     } catch (err) {
  //       setError("Failed to fetch data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   getUserData();
  // }, [activeFilter, refreshTrigger]);
 

  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null); // Clear any previous errors
        
  //       // Check if user is authenticated
  //       const user = getCurrentUser();
  //       console.log('Decoded user from token:', user);
        
  //       if (!user) {
  //         console.log('No user found, redirecting to login');
  //         navigate("/login");
  //         return;
  //       }
        
  //       // Get token for authorization header
  //       const token = localStorage.getItem("token");
  //       console.log('Token from localStorage:', token);
        
  //       if (!token) {
  //         console.log('No token in localStorage');
  //         navigate("/login");
  //         return;
  //       }
        
  //       // Make the request with fetch API
  //       console.log('Making request to /data with token');
        
  //       try {
  //         const fetchResponse = await axios.get('/datas', {
  //           method: 'GET',
  //           headers: {
  //             'Authorization': `Bearer ${token}`,
  //             'Content-Type': 'application/json'
  //           }
  //         });
          
  //         console.log('Fetch response status:', fetchResponse.status);
          
  //         if (!fetchResponse.ok) {
  //           const errorText = await fetchResponse.text();
  //           console.log('Fetch error response:', errorText);
  //           throw new Error(`Fetch failed: ${fetchResponse.status} ${errorText}`);
  //         }
          
  //         const fetchData = await fetchResponse.json();
  //         console.log('Fetch success - Data received:', fetchData);
  //         console.log('Number of clients:', fetchData.chatData?.length);
  //         console.log('User can see villes:', fetchData.userVilles);
          
  //         // PROCESS THE DATA HERE - This is the missing part!
  //         const allData = fetchData.chatData;
          
  //         if (!allData || !Array.isArray(allData)) {
  //           console.error('Invalid chatData in response:', fetchData);
  //           setError("No valid data received from server");
  //           return;
  //         }
          
  //         // Filter for digital clients
  //         const digitalClients = allData.filter(item => 
  //           item.agence && 
  //           item.assurances_interessees && 
  //           item.rappel_at && 
  //           item.comment
  //         );
          
  //         console.log(`Filtered ${digitalClients.length} digital clients from ${allData.length} total records`);
    
  //         // Sort by creation date
  //         const sortedData = digitalClients.sort((a, b) => {
  //           const dateA = new Date(a.createdAt || a.date_creation || 0);
  //           const dateB = new Date(b.createdAt || b.date_creation || 0);
  //           return dateB - dateA;
  //         });
    
  //         console.log('Setting chatData with', sortedData.length, 'items');
  //         setChatData(sortedData);
  //         setFilteredData(sortedData);
          
 
          
  //       } catch (fetchError) {
  //         console.error('Fetch API error:', fetchError);
        

  //       }
        
  //     } catch (err) {
  //       console.error('Error in getUserData:', {
  //         name: err.name,
  //         message: err.message,
  //         response: err.response ? {
  //           status: err.response.status,
  //           data: err.response.data
  //         } : 'No response'
  //       });
        
  //       if (err.response?.status === 401) {
  //         console.log('401 Unauthorized');
  //         localStorage.removeItem("token");
  //         navigate("/login");
  //       } else {
  //         setError("Failed to fetch data: " + (err.message || "Unknown error"));
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
    
  //   getUserData();
  // }, [activeFilter, refreshTrigger, navigate]);
  // Update your useEffect to include authentication
  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       setLoading(true);
        
  //       // Check if user is authenticated
  //       const user = getCurrentUser();
  //       console.log('user', user)
  //       if (!user) {
  //         // Redirect to login if no token
  //         navigate("/login");
  //         return;
  //       }
        
  //       // Get token for authorization header
  //       const token = localStorage.getItem("token");
        
  //       const response = await axios.get("/data", {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         }
  //       });
        
  //       const allData = response.data.chatData;
        
  //       // Filter for digital clients
  //       const digitalClients = allData.filter(item => 
  //         item.agence && 
  //         item.assurances_interessees && 
  //         item.rappel_at && 
  //         item.comment
  //       );

  //       // Sort by creation date (newest first)
  //       const sortedData = digitalClients.sort((a, b) => {
  //         const dateA = new Date(a.createdAt);
  //         const dateB = new Date(b.createdAt);
  //         return dateB - dateA;
  //       });

  //       setChatData(sortedData);
  //       setFilteredData(sortedData);

  //       // Apply active filter if needed
  //       if (activeFilter === "prospect") {
  //         setFilteredData(
  //           sortedData.filter((item) => item.statut === "prospect")
  //         );
  //       } else if (activeFilter === "client") {
  //         setFilteredData(
  //           sortedData.filter((item) => item.statut === "client")
  //         );
  //       } else if (activeFilter === "Gelé") {
  //         setFilteredData(sortedData.filter((item) => item.statut === "Gelé"));
  //       } else if (activeFilter === "tous") {
  //         setFilteredData(sortedData);
  //       }
  //     } catch (err) {
  //       if (err.response?.status === 401) {
  //         // Token expired or invalid
  //         localStorage.removeItem("token");
  //         navigate("/login");
  //       } else {
  //         setError("Failed to fetch data: " + (err.response?.data?.message || err.message));
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getUserData();
  // }, [activeFilter, refreshTrigger, navigate]);
  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = getCurrentUser();
        
        if (!user) {
          navigate("/login");
          return;
        }
        
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }
        
        // Make the request
        const response = await axios.get('/datas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Data received:', response.data);
        console.log('User can see villes:', response.data.userVilles);
        console.log('Total clients received:', response.data.chatData?.length);
        
        const allData = response.data.chatData;
        const userAllowedAgences = response.data.userVilles || [];
        
        if (!allData || !Array.isArray(allData)) {
          console.error('Invalid chatData in response:', response.data);
          setError("No valid data received from server");
          return;
        }
        
        // First, filter by user's allowed agences
        let filteredByAgence = allData;
        
        if (userAllowedAgences.length > 0) {
          filteredByAgence = allData.filter(item => {
            const itemAgence = item.agence?.toUpperCase() || '';
            return userAllowedAgences.some(allowedAgence => 
              itemAgence === allowedAgence?.toUpperCase()
            );
          });
          
          console.log(`After agence filtering: ${filteredByAgence.length} clients (from ${allData.length})`);
        }
        
        // Then filter for digital clients
        const digitalClients = filteredByAgence.filter(item => 
          item.agence && 
          item.assurances_interessees && 
          item.rappel_at && 
          item.comment
        );
        
        console.log(`After digital filtering: ${digitalClients.length} digital clients`);
        
        // Sort by creation date
        const sortedData = digitalClients.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date_creation || 0);
          const dateB = new Date(b.createdAt || b.date_creation || 0);
          return dateB - dateA;
        });
        
        console.log('Final data to display:', sortedData.length, 'items');
        console.log('Sample items:', sortedData.slice(0, 2));
        
        setChatData(sortedData);
        setFilteredData(sortedData);
        
      } catch (err) {
        console.error('Error in getUserData:', err);
        
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch data: " + (err.message || "Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    };
    
    getUserData();
  }, [activeFilter, refreshTrigger, navigate]);
  const handleGestionnaireChange = async (selectedId, record) => {
    try {
      const selectedUser = users.find(user => user._id === selectedId);
      const displayName = selectedUser 
        ? selectedUser.userType === "admin" 
          ? selectedUser.name 
          : `${selectedUser.nom} ${selectedUser.prenom}`
        : null;

      const response = await axios.put(
        `/updateGestionnaireLead/${record._id}`,
        {
          gestionnaireId: selectedId || null,
          gestionnaireName: displayName || null,
          userType: selectedUser?.userType || null
        }
      );

      setChatData(prev => prev.map(item => 
        item._id === record._id 
          ? { 
              ...item, 
              gestionnaire: selectedId ? { _id: selectedId } : null,
              gestionnaireName: displayName 
            } 
          : item
      ));
      
      setFilteredData(prev => prev.map(item => 
        item._id === record._id 
          ? { 
              ...item, 
              gestionnaire: selectedId ? { _id: selectedId } : null,
              gestionnaireName: displayName 
            } 
          : item
      ));

      console.log("Updated gestionnaire:", response.data);
    } catch (error) {
      console.error("Error updating gestionnaire:", error);
    }
  };

  const handleStatusLeadChange = async (newStatus, record) => {
    try {
      const validStatuses = ["prospect", "client", "Gelé"];

      if (!validStatuses.includes(newStatus)) {
        console.error("Invalid status value");
        return;
      }

      const response = await axios.put(`/updateStatusLead/${record._id}`, {
        statut: newStatus,
      });

      setChatData((prev) =>
        prev.map((item) =>
          item._id === record._id ? { ...item, statut: newStatus } : item
        )
      );
      setFilteredData((prev) =>
        prev.map((item) =>
          item._id === record._id ? { ...item, statut: newStatus } : item
        )
      );

      console.log("Updated status:", response.data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);

      setChatData((prev) => prev.filter((lead) => lead._id !== id));
      setFilteredData((prev) => prev.filter((lead) => lead._id !== id));

      message.success("Lead supprimé avec succès");
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const columns = [
    {
      title: "Client",
      key: "client",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.nom} {record.prenom}
          </div>
        </div>
      ),
    },
    {
      title: "Categorie",
      key: "categorie",
      dataIndex: "categorie",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.categorie || ""}</div>
        </div>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "portable",
      key: "portable",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.portable || ""}</div>
        </div>
      ),
    },
    {
      title: "Mail",
      dataIndex: "email",
      key: "email",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.email || ""}</div>
        </div>
      ),
    },
    {
      title: "Agence",
      dataIndex: "agence",
      key: "agence",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.agence || ""}</div>
        </div>
      ),
    },
    {
      title: "Assurances",
      key: "assurances_interessees",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.assurances_interessees ? record.assurances_interessees.join(', ') : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Rappel",
      dataIndex: "rappel_at",
      key: "rappel_at",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.rappel_at ? new Date(record.rappel_at).toLocaleDateString() : ""}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Commentaire",
    //   dataIndex: "comment",
    //   key: "comment",
    //   render: (text, record) => (
    //     <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
    //       <div className="font-medium truncate max-w-xs">
    //         {record.comment || ""}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Commentaire",
      dataIndex: "comment",
      key: "comment",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium truncate max-w-xs" title={record.comment || ""}>
            {record.comment ? 
              record.comment.split(/\s+/).slice(0, 4).join(' ') + (record.comment.split(/\s+/).length > 4 ? '...' : '') 
              : ""
            }
          </div>
        </div>
      ),
    },
    {
      title: "Statut",
      key: "statut",
      render: (text, record) => (
        <Select
          value={record.statut || "prospect"}
          style={{
            width: 90,
            color: record.statut === "Gelé" ? "#ff4d4f" : "inherit",
            fontWeight: record.statut === "Gelé" ? "bold" : "normal",
          }}
          onChange={(value) => handleStatusLeadChange(value, record)}
        >
          <Option value="prospect">Prospect</Option>
          <Option value="client">Client</Option>
          <Option value="Gelé" style={{ color: "#ff4d4f" }}>
            Gelé
          </Option>
        </Select>
      ),
    },
    // {
    //   title: "GESTIONNAIRE",
    //   key: "gestionnaire",
    //   render: (text, record) => (
    //     <Select
    //       value={record.gestionnaire?._id || ""}
    //       style={{ width: 180 }}
    //       className="text-xs"
    //       onChange={(value) => handleGestionnaireChange(value, record)}
    //       showSearch
    //       optionFilterProp="children"
    //       filterOption={(input, option) =>
    //         option.children.toLowerCase().includes(input.toLowerCase())
    //       }
    //       placeholder="-- Choisissez un gestionnaire --"
    //     >
    //       <Option value="">Non assigné</Option>
    //       {users.map((user) => {
    //         let displayName;
    //         if (user.userType === "admin") {
    //           displayName = user.name;
    //         } else if (user.userType === "manager" || user.userType === "commercial") {
    //           displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    //         } else {
    //           displayName = user.name || user.email || user._id;
    //         }
    
    //         let typeLabel;
    //         switch(user.userType) {
    //           case "admin":
    //             typeLabel = "Admin";
    //             break;
    //           case "commercial":
    //             typeLabel = "Commercial";
    //             break;
    //           case "manager":
    //             typeLabel = "Manager";
    //             break;
    //           default:
    //             typeLabel = user.userType || "Utilisateur";
    //         }
    
    //         return (
    //           <Option key={user._id} value={user._id}>
    //             {displayName} ({typeLabel})
    //           </Option>
    //         );
    //       })}
    //     </Select>
    //   ),
    // },
    // {
    //   title: "GESTIONNAIRE",
    //   key: "gestionnaire",
    //   render: (text, record) => {
    //     // Check if gestionnaire exists and has data
    //     const hasGestionnaire = record.gestionnaire && record.gestionnaire._id;
    //     const gestionnaireName = record.gestionnaireName || 
    //                             (record.gestionnaire ? 
    //                               (record.gestionnaire.userType === 'admin' ? 
    //                                 record.gestionnaire.name : 
    //                                 `${record.gestionnaire.nom || ''} ${record.gestionnaire.prenom || ''}`.trim()
    //                               ) : 
    //                               null
    //                             );
    
    //     return (
    //       <Select
    //         value={hasGestionnaire ? record.gestionnaire._id : ""}
    //         style={{ width: 180 }}
    //         className="text-xs"
    //         onChange={(value) => handleGestionnaireChange(value, record)}
    //         showSearch
    //         optionFilterProp="children"
    //         filterOption={(input, option) =>
    //           option.children.toLowerCase().includes(input.toLowerCase())
    //         }
    //         placeholder="-- Choisissez un gestionnaire --"
    //       >
    //         <Option value="">Non assigné</Option>
    //         {users.map((user) => {
    //           // Determine display name based on user type
    //           let displayName;
    //           if (user.userType === "admin") {
    //             displayName = user.name;
    //           } else if (user.userType === "manager" || user.userType === "commercial") {
    //             displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    //           } else {
    //             // Fallback for any other user types
    //             displayName = user.name || user.email || user._id;
    //           }
    
    //           // Determine display type label
    //           let typeLabel;
    //           switch(user.userType) {
    //             case "admin":
    //               typeLabel = "Admin";
    //               break;
    //             case "commercial":
    //               typeLabel = "Commercial";
    //               break;
    //             case "manager":
    //               typeLabel = "Manager";
    //               break;
    //             default:
    //               typeLabel = user.userType || "Utilisateur";
    //           }
    
    //           return (
    //             <Option key={user._id} value={user._id}>
    //               {displayName} ({typeLabel})
    //             </Option>
    //           );
    //         })}
    //       </Select>
    //     );
    //   },
    // },
    // {
    //   title: <span style={{ fontSize: "12px" }}>Action</span>,
    //   key: "action",
    //   render: (text, record) => (
    //     <Space size="middle">
    //       <Popconfirm
    //         title="Êtes-vous sûr de vouloir supprimer ce lead ?"
    //         onConfirm={() => handleDelete(record._id)}
    //         okText="Yes"
    //         cancelText="No"
    //       >
    //         <Button
    //           icon={<DeleteOutlined />}
    //           style={{ backgroundColor: "red", color: "white" }}
    //           danger
    //           size="small"
    //         />
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
    {
      title: <span style={{ fontSize: "12px" }}>Actions</span>,
      key: "actions",
      render: (text, record) => {
        const currentUser = getCurrentUser();
        const canTransfer = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager');
        
        return (
          <Space size="small">
            {canTransfer && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                size="small"
                onClick={() => openTransferModal(record)}
                style={{ backgroundColor: "#1890ff" }}
              >
                Transférer
              </Button>
            )}
            
            <Popconfirm
              title="Êtes-vous sûr de vouloir supprimer ce lead ?"
              onConfirm={() => handleDelete(record._id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button
                icon={<DeleteOutlined />}
                style={{ backgroundColor: "red", color: "white" }}
                danger
                size="small"
              />
            </Popconfirm>
          </Space>
        );
      },
    }
  ];

  if (loading && showSpinner) return <Spin tip="Loading..." />;

  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
        <h2 className="text-xs sm:text-sm font-semibold text-blue-900 text-center md:text-left">
          CLIENTS DIGITAUX ({chatData.length})
        </h2>
      </div>

      <div className="p-4 bg-white mt-6 border-t rounded-md border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Gestionaire
            </label>
            <Select
              className="w-full text-xs h-7"
              placeholder="-- Choisissez le gestionnaire --"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => handleFilterChange("gestionnaire", value)}
            >
              <Option value="tous">Tous</Option>
              {users.map((user) => {
                const displayName =
                  user.userType === "admin"
                    ? user.name
                    : `${user.nom} ${user.prenom}`;

                return (
                  <Option
                    key={user._id}
                    value={displayName}
                  >
                    {displayName}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <Select
              className="w-full"
              placeholder="-- Choisissez --"
              onChange={(value) => handleFilterChange("categorie", value)}
              value={filters.categorie}
            >
              <Option value="tous">Tous</Option>
              <Option value="particulier">Particulier</Option>
              <Option value="professionnel">Professionnel</Option>
              <Option value="entreprise">Entreprise</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              className="w-full"
              placeholder="-- Choisissez --"
              onChange={(value) => handleFilterChange("status", value)}
              value={filters.status}
            >
              <Option value="tous">Tous</Option>
              <Option value="prospect">Prospect</Option>
              <Option value="client">Client</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <Input
              placeholder="Rechercher..."
              allowClear
              onChange={(e) => handleFilterChange("search", e.target.value)}
              value={filters.search}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 flex items-center rounded-md gap-4">
        <span className="font-thin text-gray-600">Afficher</span>
        <Select
          defaultValue={1}
          onChange={handlePageChange}
          className="w-20 border-gray-300"
          placeholder="-- Choisissez --"
        >
          {[...Array(totalPages)].map((_, index) => (
            <Option key={index + 1} value={index + 1}>
              {index + 1}
            </Option>
          ))}
        </Select>

        <span className="font-thin text-gray-600">résultats par page</span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md w-full overflow-x-auto">
        <Table
          columns={[
            ...columns.map((col) => ({
              ...col,
              title: (
                <div className="flex flex-col items-center">
                  <div className="text-xs">{col.title}</div>
                </div>
              ),
            })),
          ]}
          rowClassName={(record) =>
            record.statut === "Gelé" ? "frozen-row" : ""
          }
          dataSource={filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowKey={(record) => record._id}
          onRow={(record) => ({
            style: {
              backgroundColor: record.statut === "Gelé" ? "#fff2f0" : "inherit",
            },
          })}
          bordered
          className="custom-table text-xs sm:text-sm"
          tableLayout="auto"
        />
      </div>
      {/* Transfer Modal */}
<Modal
  title={
    <div className="flex items-center gap-2">
      <SwapOutlined className="text-blue-600" />
      <span>Transférer le client</span>
    </div>
  }
  open={transferModalVisible}
  onCancel={() => setTransferModalVisible(false)}
  footer={[
    <Button key="cancel" onClick={() => setTransferModalVisible(false)}>
      Annuler
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      loading={transferring}
      onClick={handleTransfer}
      disabled={!selectedCommercial && !selectedManager}
    >
      Transférer
    </Button>,
  ]}
  width={600}
>
  {selectedClient && (
    <div className="space-y-4">
      <Card size="small">
        <div className="flex items-center justify-between">
          <div>
            <Text strong>Client sélectionné:</Text>
            <div className="mt-1">
              <div className="font-medium">{selectedClient.nom} {selectedClient.prenom}</div>
              <div className="text-sm text-gray-500">{selectedClient.email}</div>
              <div className="text-sm text-gray-500">{selectedClient.portable}</div>
            </div>
          </div>
          <div className="text-right">
            <Text type="secondary">Actuellement assigné à:</Text>
            <div className="font-medium">
              {selectedClient.gestionnaireName || "Non transferer"}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transférer à un Commercial
          </label>
          <Select
            placeholder="Sélectionner un commercial"
            style={{ width: '100%' }}
            value={selectedCommercial}
            onChange={setSelectedCommercial}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value="">-- Non transféré --</Option>
            {commercials.map((commercial) => (
              <Option key={commercial._id} value={commercial._id}>
                {commercial.prenom} {commercial.nom} - {commercial.email}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transférer à un Manager
          </label>
          <Select
            placeholder="Sélectionner un manager"
            style={{ width: '100%' }}
            value={selectedManager}
            onChange={setSelectedManager}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option value="">-- Non transféré --</Option>
            {managers.map((manager) => (
              <Option key={manager._id} value={manager._id}>
                {manager.prenom} {manager.nom} - {manager.email}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <Text type="secondary" className="text-sm">
          <InfoCircleOutlined className="mr-2" />
          Note: Le client sera désassigné de son gestionnaire actuel et réassigné au nouveau gestionnaire sélectionné.
        </Text>
      </div>
    </div>
  )}
</Modal>
    </section>
  );
};

export default Clientdigital;