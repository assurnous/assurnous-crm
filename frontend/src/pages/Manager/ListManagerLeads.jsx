import React, { useState, useEffect, useMemo } from "react";
import { Table, Select, message, Spin, Input, 
Button, Popconfirm, Alert, Space,
Modal, Form, DatePicker, Radio, InputNumber,
  Card,
  Row,
  Col, Tooltip,
    Statistic, Tag
 } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  UserAddOutlined,
  CloseOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  InfoCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import ImportLeads from "../../components/ImportLeads";



const { Option } = Select;

const ListManagerLeads = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commercials, setCommercials] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    gestionaire: "tous",
    categorie: "tous",
    status: "tous",
    agence: "tous",
    search: "",
  });
    const [selectedCategorie, setSelectedCategorie] = useState('');
  const [activeColumnSearches, setActiveColumnSearches] = useState({});
   const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
      const [isOpenModalImport, setIsOpenModalImport] = useState(false);
    const [assignForm] = Form.useForm();
    const [unassignForm] = Form.useForm();
    const [currentManagerId, setCurrentManagerId] = useState(null);


    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        setCurrentManagerId(decodedToken?.userId);
      }
    }, []);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };


  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    
    try {
      const formData = { ...values };
      
      // Handle gestionnaire fields
      if (values.gestionnaire) {
        const selectedGestionnaire = users.find(user => user._id === values.gestionnaire);
        if (selectedGestionnaire) {
          formData.gestionnaireModel = selectedGestionnaire.userType === 'admin' ? 'Admin' : 'Commercial';
          formData.gestionnaireName = selectedGestionnaire.userType === 'admin' 
            ? selectedGestionnaire.name 
            : `${selectedGestionnaire.nom} ${selectedGestionnaire.prenom}`;
        }
      }
      
   
  
      console.log("Submitting complete data:", formData);
      
      const response = await axios.post("/data", formData);
      console.log("Lead added successfully:", response.data);
      
      form.resetFields();
      setIsModalOpen(false);
      setChatData((prev) => [...prev, response.data]);
      setFilteredData((prev) => [...prev, response.data]);
      message.success("Le client a été créé avec succès !");
      
    } catch (error) {
      console.error("Error adding lead:", error);
      message.error("Erreur lors de l'ajout du client");
    }
  };
  // Helper function to get manager name for display and search
const getManagerName = (lead) => {
  if (!hasManager(lead)) return "N/A";

  if (typeof lead.manager === "string") {
    const manager = managers.find((mgr) => mgr._id === lead.manager);
    return manager ? `${manager.prenom} ${manager.nom}` : "N/A";
  }

  if (lead.manager.prenom && lead.manager.nom) {
    return `${lead.manager.prenom} ${lead.manager.nom}`;
  }

  return "N/A";
};


  const applyFilters = (filterValues) => {
    let result = [...chatData]; // Start with all client data

    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter((client) => {
        const commercialName = getCommercialName(client);
        const managerName = getManagerName(client);

        // Return true if either name matches (case-insensitive)
        return (
          (commercialName.toLowerCase() !== "n/a" &&
            commercialName
              .toLowerCase()
              .includes(filterValues.gestionnaire.toLowerCase())) ||
          (managerName.toLowerCase() !== "n/a" &&
            managerName
              .toLowerCase()
              .includes(filterValues.gestionnaire.toLowerCase()))
        );
      });
    }

    // Catégorie filter - FIX: Add strict comparison
    if (filterValues.categorie && filterValues.categorie !== "tous") {
      result = result.filter((client) => {
        return client.categorie === filterValues.categorie;
      });
    }

    // Statut filter - FIX: Add strict comparison
    if (filterValues.status && filterValues.status !== "tous") {
      result = result.filter((client) => {
        return client.statut === filterValues.status;
      });
    }
    // Agence filter
if (filterValues.agence && filterValues.agence !== "tous") {
  result = result.filter((client) => {
    return client.agence === filterValues.agence;
  });
}

    // Search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter((client) => {
        // Construct searchable fields
        const fullName = `${client.nom || ""} ${client.prenom || ""}`
          .trim()
          .toLowerCase();
        const email = (client.email || "").toLowerCase();
        const phone = (
          client.portable ||
          client.telephone_entreprise ||
          ""
        ).toLowerCase();
        const company = (client.nom || "").toLowerCase(); // For entreprises

        return (
          fullName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          company.includes(searchTerm)
        );
      });
    }

    // Set filteredData - will be empty array if no results
    setFilteredData(result);
  };
  // const applyFilters = (filterValues) => {
  //   let result = [...chatData];
  //   if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
  //     result = result.filter((item) => 
  //       item.gestionnaire?.toLowerCase() === filterValues.gestionnaire.toLowerCase()
  //     );
  //   }

  //   // Apply categorie filter
  //   if (filterValues.categorie !== "tous") {
  //     result = result.filter(
  //       (item) =>
  //         item.categorie?.toLowerCase() === filterValues.categorie.toLowerCase()
  //     );
  //   }

  //   // Apply status filter - updated to match your schema's "statut" field
  //   if (filterValues.status !== "tous") {
  //     result = result.filter(
  //       (item) =>
  //         item.statut?.toLowerCase() === filterValues.status.toLowerCase()
  //     );
  //   }

  //   if (filterValues.search) {
  //     const searchTerm = filterValues.search.toLowerCase();
  //     result = result.filter((item) => {
  //       // Client name (nom + prenom)
  //       const clientName = `${item.nom || ''} ${item.prenom || ''}`.toLowerCase();
        
  //       // All searchable fields from your columns
  //       return (
  //         clientName.includes(searchTerm) ||
  //         (item.categorie?.toLowerCase().includes(searchTerm)) ||
  //         (item.portable?.toLowerCase().includes(searchTerm)) ||
  //         (item.email?.toLowerCase().includes(searchTerm)) ||
  //         (item.codepostal?.toLowerCase().includes(searchTerm))
  //       );
  //     });
  //   }

  //   setFilteredData(result);
  //   setCurrentPage(1);
  // };
  const handleImportSuccess = async () => {
    setIsOpenModalImport(false);
    message.success("Données importées avec succès");
  
    // Fetch updated data WITH FILTERING
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.userId;
      
      const response = await axios.get("/data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allData = response.data.chatData;
  
      // **APPLY THE SAME FILTERING LOGIC AS fetchClients**
      const userLeads = allData.filter(lead => {
        // Check if user is gestionnaire
        let isGestionnaire = false;
        if (lead.gestionnaire) {
          if (typeof lead.gestionnaire === 'string') {
            isGestionnaire = lead.gestionnaire === userId;
          } else if (lead.gestionnaire._id) {
            isGestionnaire = lead.gestionnaire._id.toString() === userId;
          }
        }
        
        // Check other assignments
        const commercialId = typeof lead.commercial === 'string' 
          ? lead.commercial 
          : lead.commercial?._id?.toString();
        const isCommercial = commercialId === userId;
        
        const managerId = typeof lead.manager === 'string' 
          ? lead.manager 
          : lead.manager?._id?.toString();
        const isManager = managerId === userId;
        
        const isCreator = lead.cree_par && lead.cree_par.includes(decodedToken.name);
        
        return isGestionnaire || isCommercial || isManager || isCreator;
      });
  
      // Simple filter: exclude digital clients
      const regularClients = userLeads.filter((item) => {
        const isDigitalClient =
          item.agence &&
          item.assurances_interessees &&
          item.assurances_interessees.length > 0 &&
          item.rappel_at &&
          item.comment &&
          item.comment.trim() !== "";
  
        return !isDigitalClient;
      });
  
      // Sort by creation date (newest first)
      const sortedData = regularClients.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      setChatData(sortedData);
  
      // Check if any filters are active
      const hasActiveFilters =
        filters.gestionnaire !== "tous" ||
        filters.categorie !== "tous" ||
        filters.status !== "tous" ||
        filters.search;
  
      if (hasActiveFilters) {
        // Reapply filters to the new data
        applyFilters(filters);
      } else {
        // If no filters, set filteredData to the same as chatData
        setFilteredData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching updated data:", error);
      message.error("Erreur lors du chargement des données mises à jour");
    } finally {
      setLoading(false);
    }
  };
  // const handleImportSuccess = async () => {
  //   setIsOpenModalImport(false);
  //   message.success("Données importées avec succès");

  //   // Fetch updated data
  //   try {
  //     setLoading(true);
  //     const response = await axios.get("/data");
  //     const allData = response.data.chatData;

  //     // Simple filter: exclude clients that have ALL digital fields populated
  //     const regularClients = allData.filter((item) => {
  //       const isDigitalClient =
  //         item.agence &&
  //         item.assurances_interessees &&
  //         item.assurances_interessees.length > 0 &&
  //         item.rappel_at &&
  //         item.comment &&
  //         item.comment.trim() !== "";

  //       return !isDigitalClient;
  //     });

  //     // Sort by creation date (newest first)
  //     const sortedData = regularClients.sort((a, b) => {
  //       return new Date(b.createdAt) - new Date(a.createdAt);
  //     });

  //     setChatData(sortedData);

  //     // Check if any filters are active
  //     const hasActiveFilters =
  //       filters.gestionnaire !== "tous" ||
  //       filters.categorie !== "tous" ||
  //       filters.status !== "tous" ||
  //       filters.search;

  //     if (hasActiveFilters) {
  //       // Reapply filters to the new data
  //       applyFilters(filters);
  //     } else {
  //       // If no filters, set filteredData to the same as chatData
  //       setFilteredData(sortedData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching updated data:", error);
  //     message.error("Erreur lors du chargement des données mises à jour");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
            const assignedCommercial = commercials.find(
              (com) => com._id === values.commercial
            );
            return {
              ...lead,
              commercial: assignedCommercial,
            };
          }
          return lead;
        });
  
        setChatData(updatedLeads);
        setFilteredData(updatedLeads);
        message.success("Clients affectés au commercial avec succès");
        setIsAssignModalVisible(false);
        setSelectedLeads([]);
        assignForm.resetFields();
      } catch (error) {
        console.error("Error assigning leads to commercial:", error);
        message.error("Échec de l'affectation des clients au commercial");
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
          setFilteredData(updatedLeads);
          message.success("Clients désaffectés du commercial avec succès");
          setIsUnassignModalVisible(false);
          setSelectedLeads([]);
        } catch (error) {
          console.error("Error unassigning commercial:", error);
          message.error("Échec de la désaffectation des clients du commercial");
        }
      };
    

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch both admins and commercials
        const [adminsRes, commercialsRes, managersRes] = await Promise.all([
          axios.get("/admin"),
          axios.get("/commercials"),
           axios.get("/manager"),
        ]);

        // Combine and format the data
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

 
  // const fetchClients = async () => {
  //   const token = localStorage.getItem("token");
  //   const decodedToken = jwtDecode(token);
  //   const userId = decodedToken?.userId;
  //   const userName = decodedToken?.name;
    
  
  //   try {
  //     setLoading(true);
      
  //     const response = await axios.get('/my-leads', {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  
  //     const allLeads = response.data?.chatData || [];
  //     console.log("Total leads from API:", allLeads.length);
  
  //     const filteredLeads = allLeads.filter(lead => {
    
  
  //       // **FIXED: Check if user is gestionnaire**
  //       let isGestionnaire = false;
        
  //       if (lead.gestionnaire) {
  //         if (typeof lead.gestionnaire === 'string') {
  //           // If gestionnaire is a string ID (most common case)
  //           isGestionnaire = lead.gestionnaire === userId;
  //         } else if (lead.gestionnaire._id) {
  //           // If gestionnaire is a populated object
  //           isGestionnaire = lead.gestionnaire._id.toString() === userId;
  //         }
  //       }
        
       
  
  //       // Check if user is the assigned commercial
  //       let isCommercial = false;
  //       if (lead.commercial) {
  //         const commercialId = typeof lead.commercial === 'string' 
  //           ? lead.commercial 
  //           : lead.commercial?._id?.toString();
  //         isCommercial = commercialId === userId;
  //       }
  
  //       // Check if user is the assigned manager
  //       let isManager = false;
  //       if (lead.manager) {
  //         const managerId = typeof lead.manager === 'string' 
  //           ? lead.manager 
  //           : lead.manager?._id?.toString();
  //         isManager = managerId === userId;
  //       }
        
  //       // Check by creator name (fallback)
  //       const isCreator = lead.cree_par && lead.cree_par.includes(userName);
        
  //       const shouldShow = isGestionnaire || isCommercial || isManager || isCreator;
        
  //       if (shouldShow) {
  //         console.log(`✅ Showing lead: ${lead.nom} ${lead.prenom}`);
  //       }
        
  //       return shouldShow;
  //     });
  
  //     console.log(`Filtered results: ${filteredLeads.length} of ${allLeads.length}`);
      
  //     // Sort by createdAt (newest first)
  //     const sortedLeads = filteredLeads.sort((a, b) => {
  //       return new Date(b.createdAt) - new Date(a.createdAt);
  //     });
  
  //     setChatData(sortedLeads);
  //     setFilteredData(sortedLeads);
  //   } catch (error) {
  //     console.error("Error fetching leads:", error);
  //     message.error("Failed to fetch leads");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchClients = async () => {
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.userId;
    const userName = decodedToken?.name;
    const userRole = decodedToken?.role?.toLowerCase();
    
  
    try {
      setLoading(true);
      
      const response = await axios.get('/my-leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const allLeads = response.data?.chatData || [];
      console.log("Total leads from API:", allLeads.length);
  
      // Get user information and team structure
      let userManagerId = null;
      let managerId = userId; // For managers, they are their own manager
      let teamUserIds = [userId]; // Start with self
      
      if (userRole === 'commercial') {
        try {
          // Fetch current commercial's details
          const commercialsResponse = await axios.get('/commercials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const allCommercials = commercialsResponse.data || [];
          
          // Find current user in commercials
          const currentUserCommercial = allCommercials.find(c => 
            c._id === userId || c._id?.toString() === userId
          );
          
          // Get manager ID (manager or createdBy)
          userManagerId = currentUserCommercial?.manager || currentUserCommercial?.createdBy;
          managerId = userManagerId; // Commercial's manager ID
          
          console.log("Commercial's manager info (clients):", {
            userId,
            managerId,
            commercialData: currentUserCommercial
          });
          
          // Get ALL users under this manager (including manager and all commercials)
          if (managerId) {
            // Add manager to team
            teamUserIds.push(managerId);
            
            // Add all commercials under this manager
            const teamCommercials = allCommercials.filter(commercial => {
              const commercialManager = commercial.manager || commercial.createdBy;
              return commercialManager === managerId || 
                     commercialManager?.toString() === managerId;
            });
            
            // Add all commercial IDs from the team
            teamCommercials.forEach(commercial => {
              if (commercial._id && !teamUserIds.includes(commercial._id.toString())) {
                teamUserIds.push(commercial._id.toString());
              }
            });
          }
          
          console.log("Commercial team structure (clients):", {
            managerId,
            teamUserIds,
            teamSize: teamUserIds.length
          });
          
        } catch (error) {
          console.log("Error fetching commercials for clients:", error);
        }
      } else if (userRole === 'manager') {
        // Manager sees their own clients and all clients from their team
        try {
          const commercialsResponse = await axios.get('/commercials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const allCommercials = commercialsResponse.data || [];
          
          // Get all commercials under this manager
          const teamCommercials = allCommercials.filter(commercial => {
            const commercialManager = commercial.manager || commercial.createdBy;
            return commercialManager === userId || 
                   commercialManager?.toString() === userId;
          });
          
          // Add all commercial IDs from the team
          teamCommercials.forEach(commercial => {
            if (commercial._id && !teamUserIds.includes(commercial._id.toString())) {
              teamUserIds.push(commercial._id.toString());
            }
          });
          
          console.log("Manager team structure (clients):", {
            managerId: userId,
            teamUserIds,
            teamCommercialsCount: teamCommercials.length
          });
          
        } catch (error) {
          console.log("Error fetching manager team for clients:", error);
        }
      }
  
      // Get all commercials for name matching (do this once, outside the filter)
      let allCommercialsForNames = [];
      if (userRole === 'manager' || userRole === 'commercial') {
        try {
          const commercialsResponse = await axios.get('/commercials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          allCommercialsForNames = commercialsResponse.data || [];
        } catch (error) {
          console.log("Could not fetch commercials for name matching:", error);
        }
      }
  
      // Filter leads based on user role and team
      let filteredLeads;
      
      if (userRole === 'admin') {
        // Admin sees all leads
        filteredLeads = allLeads;
        console.log("Admin - showing all leads:", filteredLeads.length);
        
      } else if (userRole === 'manager' || userRole === 'commercial') {
        // Both manager and commercial see leads from their entire team
        // Get all team members' names for creator name matching
        const teamMembers = allCommercialsForNames.filter(commercial => 
          teamUserIds.includes(commercial._id?.toString())
        );
        
        filteredLeads = allLeads.filter(lead => {
          // Get manager from lead
          const leadManagerId = lead.manager?._id?.toString() || lead.manager;
          
          // Get gestionnaire from lead
          const gestionnaireId = lead.gestionnaire?._id?.toString() || lead.gestionnaire;
          
          // Get commercial from lead
          const commercialId = lead.commercial?._id?.toString() || lead.commercial;
          
          // Get creator (cree_par) from lead
          const creatorName = lead.cree_par;
          
          // Check multiple conditions:
          // 1. Check if lead manager is in the team
          const isTeamLeadManager = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === leadManagerId?.toString()
          );
          
          // 2. Check if gestionnaire is in the team
          const isTeamGestionnaire = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === gestionnaireId?.toString()
          );
          
          // 3. Check if commercial is in the team
          const isTeamCommercial = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === commercialId?.toString()
          );
          
          // 4. Check by creator name (for backward compatibility)
          // Look for any team member's name in the cree_par field
          let isCreatedByTeam = false;
          if (creatorName && teamMembers.length > 0) {
            // Check if creatorName contains any team member's name
            isCreatedByTeam = teamMembers.some(member => {
              const memberName = `${member.prenom || ''} ${member.nom || ''}`.trim();
              return creatorName.includes(memberName) || 
                     memberName.includes(creatorName);
            });
          }
          
          return isTeamLeadManager || isTeamGestionnaire || isTeamCommercial || isCreatedByTeam;
        });
        
        console.log(`${userRole} filtered clients:`, {
          totalLeads: allLeads.length,
          filteredCount: filteredLeads.length,
          teamUserIds,
          teamMembersCount: teamMembers.length,
          filterLogic: "Sees clients from entire team (manager + all commercials under manager)"
        });
        
      } else {
        // Other roles see only leads they are associated with (original logic)
        filteredLeads = allLeads.filter(lead => {
          // Check if user is gestionnaire
          let isGestionnaire = false;
          if (lead.gestionnaire) {
            if (typeof lead.gestionnaire === 'string') {
              // If gestionnaire is a string ID (most common case)
              isGestionnaire = lead.gestionnaire === userId;
            } else if (lead.gestionnaire._id) {
              // If gestionnaire is a populated object
              isGestionnaire = lead.gestionnaire._id.toString() === userId;
            }
          }
          
          // Check if user is the assigned commercial
          let isCommercial = false;
          if (lead.commercial) {
            const commercialId = typeof lead.commercial === 'string' 
              ? lead.commercial 
              : lead.commercial?._id?.toString();
            isCommercial = commercialId === userId;
          }
  
          // Check if user is the assigned manager
          let isManager = false;
          if (lead.manager) {
            const managerId = typeof lead.manager === 'string' 
              ? lead.manager 
              : lead.manager?._id?.toString();
            isManager = managerId === userId;
          }
          
          // Check by creator name (fallback)
          const isCreator = lead.cree_par && lead.cree_par.includes(userName);
          
          const shouldShow = isGestionnaire || isCommercial || isManager || isCreator;
          
          if (shouldShow) {
            console.log(`✅ Showing lead: ${lead.nom} ${lead.prenom}`);
          }
          
          return shouldShow;
        });
        console.log("Other role - filtered count:", filteredLeads.length);
      }
  
      // Add team information to each lead
      const leadsWithTeamInfo = filteredLeads.map(lead => {
        const leadManagerId = lead.manager?._id?.toString() || lead.manager;
        const gestionnaireId = lead.gestionnaire?._id?.toString() || lead.gestionnaire;
        const commercialId = lead.commercial?._id?.toString() || lead.commercial;
        
        // Determine if lead belongs to current user
        const isMyLead = leadManagerId === userId || 
                        gestionnaireId === userId || 
                        commercialId === userId;
        
        // Determine if lead belongs to manager
        const isManagerLead = leadManagerId === managerId || 
                             gestionnaireId === managerId;
        
        return {
          ...lead,
          // Team visibility info
          isTeamClient: !isMyLead,
          clientType: isMyLead ? 'self' : 
                     isManagerLead ? 'manager' : 'team_member',
          
          // Formatted names for display
          managerName: lead.manager 
            ? `${lead.manager.prenom || ''} ${lead.manager.nom || ''}`.trim()
            : "Non assigné",
          
          commercialName: lead.commercial 
            ? `${lead.commercial.prenom || ''} ${lead.commercial.nom || ''}`.trim()
            : "Non assigné",
          
          gestionnaireName: lead.gestionnaireName || 
            (lead.gestionnaire && typeof lead.gestionnaire === 'object' 
              ? `${lead.gestionnaire.prenom || ''} ${lead.gestionnaire.nom || ''}`.trim()
              : "Non assigné"),
        };
      });
  
      // Sort by createdAt (newest first)
      const sortedLeads = leadsWithTeamInfo.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      console.log("Final clients data:", {
        count: sortedLeads.length,
        sample: sortedLeads[0],
        teamInfo: {
          isTeamClient: sortedLeads[0]?.isTeamClient,
          clientType: sortedLeads[0]?.clientType
        }
      });
  
      setChatData(sortedLeads);
      setFilteredData(sortedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      message.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };
  const fetchManagerCommercials = async () => {
    try {
      if (!currentManagerId) {
        console.log("No manager ID found");
        return;
      }
      
      console.log("Fetching commercials for manager ID:", currentManagerId);
      // const response = await axios.get(`/commercials/manager/${currentManagerId}`);
       const token = localStorage.getItem("token"); // Get token
    
    const response = await axios.get(`/commercials/manager/${currentManagerId}`, {
      headers: { 
        Authorization: `Bearer ${token}` // Add Authorization header
      }
    });
      
      console.log("API Response:", response.data);
      console.log("Number of commercials:", response.data.length);
      console.log("Commercial IDs:", response.data.map(c => c._id));
      
      // Assuming the API returns an array of commercial objects
      setCommercials(response.data);
    } catch (error) {
      console.error("Error fetching manager's commercials:", error.response?.data || error.message);
      // Fallback to fetching all commercials if specific endpoint fails
      fetchCommercials();
    }
  };

  useEffect(() => {
    if (currentManagerId) {
      fetchManagerCommercials(); // Fetch only manager's commercials
    }
    fetchClients();
    // fetchClients();
  }, []); 
 
 
  // useEffect(() => {
  //   fetchCommercials();
  //   fetchClients();
  // }, []);

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

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };
  const handleStatusLeadChange = async (newStatus, record) => {
    try {
      const validStatuses = ["prospect", "client"];
      
      if (!validStatuses.includes(newStatus)) {
        console.error("Invalid status value");
        return;
      }
  
      const response = await axios.put(`/updateStatusLead/${record._id}`, {
        statut: newStatus  // Changed from statusLead to statut to match schema
      });
  
      // Update both states - changed 'type' to 'statut'
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
  const applyColumnSearches = (searches) => {
    console.log("Applying searches:", searches);

    // If no active searches, show all data
    if (Object.keys(searches).length === 0) {
      console.log("No active searches, showing all data");
      setFilteredData([...chatData]); 
      return;
    }

    // Start with all data
    let result = [...chatData];

    // Apply each column search
    Object.entries(searches).forEach(([columnKey, searchTerm]) => {
      if (searchTerm && searchTerm.trim() !== "") {
        console.log(`Filtering by ${columnKey}: "${searchTerm}"`);

        result = result.filter((item) => {
          // Get the value to search in this column
          const columnValue = getColumnValue(item, columnKey);

          // Check if it matches the search term
          const matches = columnValue.toLowerCase().includes(searchTerm);

          console.log(
            `Item ${item.nom}: ${columnKey}="${columnValue}", matches=${matches}`
          );
          return matches;
        });

        console.log(`After filtering by ${columnKey}: ${result.length} items`);
      }
    });

    // If no results found, set empty array (will show "no data" in table)
    if (result.length === 0) {
      console.log("No results found for search");
      setFilteredData([]); // Empty array
    } else {
      setFilteredData(result);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);

      // Update chatData
      const newChatData = chatData.filter((lead) => lead._id !== id);
      setChatData(newChatData);

      // Also update filteredData if it exists
      if (filteredData.length > 0) {
        const newFilteredData = filteredData.filter((lead) => lead._id !== id);
        setFilteredData(newFilteredData);
      }

      // Remove from selectedLeads if it's selected
      setSelectedLeads((prev) => prev.filter((leadId) => leadId !== id));

      message.success("Client supprimé avec succès");
    } catch (error) {
      console.error("Error deleting lead:", error);
      message.error("Échec de la suppression du client");
    }
  };

  // Helper function to get column value
  const getColumnValue = (item, columnKey) => {
    switch (columnKey) {
      case "nom":
        return `${item.nom || ""} ${item.prenom || ""}`.trim();

      case "email":
        return item.verification_email === "Non"
          ? item.email1 || item.email || ""
          : item.email || "";

      case "address":
        return item.address || "";

      case "codepostal":
        return item.codepostal || "";

      case "ville":
        return item.ville || "";

      case "phone":
        return item.phone || item.portable || "";

      case "statut":
        return item.statut || "";

      case "comment":
        return item.comment || "";

      case "commercial":
        const commercialName = getCommercialName(item);
        return commercialName === "N/A" ? "" : commercialName;

      case "manager":
        const managerName = getManagerName(item);
        return managerName === "N/A" ? "" : managerName;

      case "createdAt":
        if (!item.createdAt) return "";
        const date = new Date(item.createdAt);
        return (
          date.toLocaleDateString("en-GB") +
          " " +
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );

      default:
        return "";
    }
  };
  const handleColumnSearch = (e, columnKey) => {
    const value = e.target.value.trim();
    console.log(`Searching ${columnKey} for: "${value}"`);

    // Update active column searches
    const newSearches = { ...activeColumnSearches };

    if (value === "") {
      // Remove this column from active searches
      delete newSearches[columnKey];
    } else {
      // Add/update this column search
      newSearches[columnKey] = value.toLowerCase();
    }

    setActiveColumnSearches(newSearches);

    // Apply all active column searches
    applyColumnSearches(newSearches);
  };
  const hasCommercial = (lead) => {
    if (!lead.commercial) return false;
    if (typeof lead.commercial === "string") return lead.commercial !== "";
    if (typeof lead.commercial === "object") return lead.commercial !== null;
    return false;
  };
  const hasManager = (lead) => {
    if (!lead.manager) return false;
    if (typeof lead.manager === "string") return lead.manager !== "";
    if (typeof lead.manager === "object") return lead.manager !== null;
    return false;
  };
  const showModalImport = () => {
    setIsOpenModalImport(true);
  };
  const handleCancelImport = () => {
    setIsOpenModalImport(false);
  };

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedLeads(selectedRowKeys);
    },
    selectedRowKeys: selectedLeads,
    getCheckboxProps: (record) => ({
      disabled: false, // You can add logic here to disable selection of already assigned leads if needed
    }),
  };

  const getCommercialName = (lead) => {
    if (!hasCommercial(lead)) return "N/A";

    if (typeof lead.commercial === "string") {
      const commercial = commercials.find((com) => com._id === lead.commercial);
      return commercial ? `${commercial.prenom} ${commercial.nom}` : "N/A";
    }

    if (lead.commercial.prenom && lead.commercial.nom) {
      return `${lead.commercial.prenom} ${lead.commercial.nom}`;
    }

    return "N/A";
  };

    const stats = useMemo(() => {
      const totalClients = chatData.length;
      const assignedToCommercial = chatData.filter((lead) =>
        hasCommercial(lead)
      ).length;
      const assignedToManager = chatData.filter((lead) =>
        hasManager(lead)
      ).length;
      const unassigned = totalClients - assignedToCommercial - assignedToManager;
  
      return {
        totalClients,
        assignedToCommercial,
        assignedToManager,
        unassigned,
      };
    }, [chatData]);

    // Add this sorting logic before your table render
const sortedData = useMemo(() => {
  // Apply sorting: unassigned clients first, then by creation date
  return [...filteredData].sort((a, b) => {
    // Check if client has commercial assignment
    const aHasCommercial = hasCommercial(a);
    const bHasCommercial = hasCommercial(b);
    
    // Unassigned clients come first
    if (!aHasCommercial && bHasCommercial) return -1;
    if (aHasCommercial && !bHasCommercial) return 1;
    
    // If same assignment status, sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}, [filteredData, chatData]);

      const canAssignToCommercial = useMemo(() => {
        if (selectedLeads.length === 0) return false;
    
        return selectedLeads.every((leadId) => {
          const lead = chatData.find((item) => item._id === leadId);
          return lead && !hasCommercial(lead) && !hasManager(lead);
        });
      }, [selectedLeads, chatData]);
    
      // Check if selected leads are eligible for manager assignment
      const canAssignToManager = useMemo(() => {
        if (selectedLeads.length === 0) return false;
    
        return selectedLeads.every((leadId) => {
          const lead = chatData.find((item) => item._id === leadId);
          return lead && !hasManager(lead) && !hasCommercial(lead);
        });
      }, [selectedLeads, chatData]);
    
      // Check if selected leads can be unassigned from commercial
      const canUnassignFromCommercial = useMemo(() => {
        if (selectedLeads.length === 0) return false;
    
        return selectedLeads.every((leadId) => {
          const lead = chatData.find((item) => item._id === leadId);
          return lead && hasCommercial(lead);
        });
      }, [selectedLeads, chatData]);
    
      // Check if selected leads can be unassigned from manager
      const canUnassignFromManager = useMemo(() => {
        if (selectedLeads.length === 0) return false;
    
        return selectedLeads.every((leadId) => {
          const lead = chatData.find((item) => item._id === leadId);
          return lead && hasManager(lead);
        });
      }, [selectedLeads, chatData]);
 

      const getAssignmentStatus = useMemo(() => {
        if (selectedLeads.length === 0) return "Aucun client sélectionné";
    
        const selectedLeadsData = chatData.filter((item) =>
          selectedLeads.includes(item._id)
        );
    
        const hasCommercialAssigned = selectedLeadsData.some((lead) =>
          hasCommercial(lead)
        );
        const hasManagerAssigned = selectedLeadsData.some((lead) =>
          hasManager(lead)
        );
        const hasMixedAssignment = hasCommercialAssigned && hasManagerAssigned;
        const allFree = selectedLeadsData.every(
          (lead) => !hasCommercial(lead) && !hasManager(lead)
        );
    
        // if (allFree) return "Tous les clients sélectionnés sont libres";
        // if (hasCommercialAssigned && !hasManagerAssigned)
        //   return "Certains clients sont déjà affectés à un commercial";
        // if (hasManagerAssigned && !hasCommercialAssigned)
        //   return "Certains clients sont déjà affectés à un manager";
        // if (hasMixedAssignment)
        //   return "Les clients sélectionnés ont des affectations mixtes";
    
        // return "Statut d'affectation";
      }, [selectedLeads, chatData]);

      const getAssignmentType = (lead) => {
        if (hasCommercial(lead)) return "commercial";
        // if (hasManager(lead)) return "manager";
        return "none";
      };

  if (loading && showSpinner) return <Spin tip="Loading..." />;

  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

  const columns = [
    // {
    //   title: "Client",
    //   key: "client",
    //   render: (text, record) => (
    //     <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
    //       <div className="font-medium">
    //         {record.nom} {record.prenom}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Client",
      key: "nom",
      dataIndex: "nom",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.nom} {record.prenom}
          </div>
          <div className="text-xs text-gray-500">
            {getAssignmentType(record) === "commercial" &&
              "✓ Affecté à un commercial"}
            {getAssignmentType(record) === "none" && "⏳ Non affecté"}
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
    // {
    //   title: "Assurances",
    //   key: "assurances_interessees",
    //   render: (text, record) => (
    //     <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
    //       <div className="font-medium">
    //         {record.assurances_interessees ? record.assurances_interessees.join(', ') : ""}
    //       </div>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Rappel",
    //   dataIndex: "rappel_at",
    //   key: "rappel_at",
    //   render: (text, record) => (
    //     <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
    //       <div className="font-medium">
    //         {record.rappel_at ? new Date(record.rappel_at).toLocaleDateString() : ""}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Commentaires",
      dataIndex: "commentaire",
      key: "commentaire",
      render: (text, record) => {
        const commentText = record.commentaire || record.comment || "";
        
        // Truncate to 3-5 words
        const words = commentText.split(" ");
        const truncated = words.slice(0, 5).join(" ");
        const displayText = words.length > 5 ? `${truncated}...` : truncated;
        
        return (
          <div className="text-gray-500 text-xs">
            {commentText ? displayText : "-"}
          </div>
        );
      },
    },
    // {
    //   title: "Devis en cours",
    //   dataIndex: "codepostal",
    //   key: "codepostal",
    //   render: (text) => text || "",
    // },
    {
      title: "STATUS",
      key: "status",
      render: (text, record) => (
        <Select
          value={record.statut || "prospect"}
          style={{ width: 90 }}
          onChange={(value) => handleStatusLeadChange(value, record)}
        >
          <Option value="prospect">Prospect</Option>
          <Option value="client">Client</Option>
        </Select>
      ),
    },
      // {
      //     title: "Commercial",
      //     key: "commercial",
      //     dataIndex: "commercial",
      //     render: (text, record) => {
      //       const commercialName = getCommercialName(record);
      //       if (commercialName === "N/A") {
      //         return <Tag color="red">NON AFFECTÉ</Tag>;
      //       }
      //       return <Tag color="blue">{commercialName}</Tag>;
      //     },
      //   },
    // {
    //   title: "Commentaires",
    //   dataIndex: "commentaire",
    //   key: "commentaire",
    //   render: (text, record) => (
    //     <div className="text-gray-500 text-xs">
    //       {record.commentaire && <div>{record.commentaire}</div>}
    //       {record.comment && <div>{record.comment}</div>}
    //       {!record.commentaire && !record.comment && "-"}
    //     </div>
    //   ),
    // },
  
    // {
    //   title: "Gestionnaire",
    //   dataIndex: "gestionnaire",
    //   key: "gestionnaire",
    //   render: (text, record) => (
    //     <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
    //       <div className="font-medium">{record.gestionnaire || ""}</div>
    //     </div>
    //   ),
    // },
      {
                  title: "Action",
                  key: "action",
                  render: (text, record) => (
                    <Space size="middle">
                      <Tooltip title="Voir détails">
                        <Button
                          icon={<EyeOutlined />}
                          type="primary"
                          size="small"
                          onClick={() => handleLeadClick(record)}
                        />
                      </Tooltip>
                      <Popconfirm
                title="Êtes-vous sûr de vouloir supprimer ce client ?"
                onConfirm={() => handleDelete(record._id)}
                okText="Oui"
                cancelText="Non"
              >
                <Tooltip title="Supprimer">
                  <Button icon={<DeleteOutlined />} danger size="small" />
                </Tooltip>
              </Popconfirm>
                    </Space>
                  ),
                },
  ];

  return (
    <div className="p-4">
    <div className="flex  mb-6 flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
        <h2 className="text-xs sm:text-sm font-semibold text-purple-900 text-center md:text-left">
          CLIENTS/PROSPECTS ({chatData.length})
        </h2>

        {/* Buttons container - column on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
 <Button
            type="primary"
            className="w-full  md:w-auto"
            onClick={showModalImport}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg pb-1">+</span>
              <span className="text-[10px] sm:text-xs whitespace-nowrap">
                IMPORTER VOTRE BASE CLIENTS/PROSPECTS
              </span>
            </div>
          </Button>

          <Button
            type="primary"
            className="w-full md:w-auto"
            onClick={showModal}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              <span className="text-[10px]  sm:text-xs whitespace-nowrap">
                ENREGISTRER UN CLIENT/PROSPECT
              </span>
            </div>
          </Button>
        </div>
      </div>

         <Row gutter={16} className="mb-6">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Clients"
                    value={stats.totalClients}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Affectés aux Commerciaux"
                    value={stats.assignedToCommercial}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<UserAddOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Non Affectés"
                    value={stats.unassigned}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<UserDeleteOutlined />}
                  />
                </Card>
              </Col>
            </Row>
      
            {/* Assignment Status Info */}
            {/* <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <InfoCircleOutlined className="text-blue-500 mr-2" />
                <span className="text-sm text-blue-700 font-medium">
                  {getAssignmentStatus}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                • Vous pouvez affecter des clients aux commerciaux de votre équipe
              </div>
            </div> */}
      
            {/* Action Buttons */}
            {/* <Card className="mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Tooltip
                    title={
                      canAssignToCommercial
                        ? ""
                        : "Seuls les clients non affectés peuvent être assignés à un commercial"
                    }
                  >
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                      onClick={() => setIsAssignModalVisible(true)}
                      // disabled={!canAssignToCommercial}
                    >
                      Affecter au Commercial ({selectedLeads.length})
                    </Button>
                  </Tooltip>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Tooltip
                    title={
                      canUnassignFromCommercial
                        ? ""
                        : "Seuls les clients affectés à un commercial peuvent être désaffectés"
                    }
                  >
                    <Button
                      icon={<UserDeleteOutlined />}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                      onClick={() => setIsUnassignModalVisible(true)}
                      // disabled={!canUnassignFromCommercial}
                    >
                      Désaffecter du Commercial ({selectedLeads.length})
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </Card> */}

      {/* <div className="p-4 bg-white mt-6 border-t rounded-md border-gray-200 shadow-sm">
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
        value={displayName}  // Store the exact format used in chatData
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
      </div> */}


   <div className="p-4 bg-white mt-4 border-t rounded-md border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
  <label className="block text-[12px] font-medium text-gray-700 mb-1">
    Gestionnaire
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
    value={filters.gestionnaire}
  >
    <Option value="tous">Tous</Option>
    
    {/* Show current manager first */}
    {users
      .filter(user => user.userType === "manager" && user._id === currentManagerId)
      .map((manager) => {
        console.log("Current manager in dropdown:", manager);
        return (
          <Option key={manager._id} value={`${manager.prenom} ${manager.nom}`}>
            {`${manager.prenom} ${manager.nom}`} (Manager)
          </Option>
        );
      })}

{commercials
  .filter(commercial => {
    // The commercials array should already contain only manager's commercials
    // But let's double-check by verifying they have the correct manager ID
    return commercial.createdBy === currentManagerId;
  })
  .map((commercial) => {
    console.log("Manager's commercial in dropdown:", commercial);
    return (
      <Option key={commercial._id} value={`${commercial.prenom} ${commercial.nom}`}>
        {`${commercial.prenom} ${commercial.nom}`} (Commercial)
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
    Agence
  </label>
  <Select
    className="w-full"
    placeholder="-- Choisissez --"
    onChange={(value) => handleFilterChange("agence", value)}
    value={filters.agence}
  >
    <Option value="tous">Toutes</Option>
    <Option value="LENS">LENS</Option>
    <Option value="VALENCIENNES">VALENCIENNES</Option>
    <Option value="LILLE">LILLE</Option>
  </Select>
</div>
<div className="mt-1">
                  
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


      <div className="bg-white rounded-lg shadow-md w-full md:p-6 overflow-x-auto">
      <Table
            columns={columns.map((col) => ({
                      ...col,
                      title: (
                        <div className="flex flex-col items-center">
                          <div className="text-xs">{col.title}</div>
                          {col.key !== "action" &&
                            col.key !== "createdAt" &&
                            col.key !== "commentaire" &&
                            col.key !== "comment" && (
                              <Input
                                placeholder={`Rechercher ${col.title}`}
                                onChange={(e) => handleColumnSearch(e, col.key)}
                                value={activeColumnSearches[col.key] || ""}
                                className="mt-2"
                                size="small"
                                style={{ width: "100%" }}
                              />
                            )}
                        </div>
                      ),
                    }))}
          // dataSource={filteredData.slice(
          //   (currentPage - 1) * pageSize,
          //   currentPage * pageSize
          // )}
          dataSource={sortedData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            // total: filteredData.length,
            total: sortedData.length,
            // onChange: (page) => setCurrentPage(page),
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
          bordered
          className="custom-table text-xs sm:text-sm"
          rowSelection={rowSelection}
          tableLayout="auto"
        />
      </div>

      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">
              ENREGISTRER UN CLIENT/PROSPECT
            </span>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="25%"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
        bodyStyle={{
          height: "calc(100vh - 49px)",
          padding: 0,
          margin: 0,
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
        closeIcon={null}
      >
        <div
          className="h-full overflow-y-auto ml-4 w-full"
          style={{ scrollbarWidth: "thin" }}
        >
          <Form
            form={form}
            onFinish={handleFormSubmit}
            layout="vertical"
            className="space-y-2 w-full"
          >
            {/* === INFORMATIONS GÉNÉRALES === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">
              INFORMATIONS GÉNÉRALES
            </h2>

            {/* Catégorie */}
            <Form.Item
              label={<span className="text-xs font-medium">CATÉGORIE</span>}
              name="categorie"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                onChange={(value) => {
                  setSelectedCategorie(value);
                  form.setFieldsValue({
                    denomination_commerciale: undefined,
                    raison_sociale: undefined,
                    siret: undefined,
                  });
                }}
              >
                <Option value="particulier">Particulier</Option>
                <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </Form.Item>

            {/* Statut */}
            <Form.Item
              label={<span className="text-xs font-medium">STATUS</span>}
              name="statut"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="client">Client</Option>
                <Option value="prospect">Prospect</Option>
                <Option value="ancien_client">Ancien client</Option>
              </Select>
            </Form.Item>

            {/* Civilité */}
            <Form.Item
              label={<span className="text-xs font-medium">CIVILITÉ</span>}
              name="civilite"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="monsieur">M.</Option>
                <Option value="madame">Mme</Option>
                <Option value="mademoiselle">Mlle</Option>
                <Option value="societe">Société</Option>
              </Select>
            </Form.Item>

            {/* === INFORMATIONS PERSONNELLES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              INFORMATIONS PERSONNELLES
            </h2>

            {/* Nom */}
            <Form.Item
              label={<span className="text-xs font-medium">NOM</span>}
              name="nom"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Nom" />
            </Form.Item>

            {/* Nom de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">NOM DE NAISSANCE</span>
              }
              name="nom_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Nom de naissance"
              />
            </Form.Item>

            {/* Prénom */}
            <Form.Item
              label={<span className="text-xs font-medium">PRÉNOM</span>}
              name="prenom"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Prénom" />
            </Form.Item>

            {/* Date de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">DATE DE NAISSANCE</span>
              }
              name="date_naissance"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" format="DD/MM/YYYY" />
            </Form.Item>

            {/* Pays de naissance */}
               <Form.Item
             label={
               <span className="text-xs font-medium">PAYS DE NAISSANCE</span>
             }
             name="pays_naissance"
             className="mb-0"
             rules={[{ required: false, message: "Ce champ est obligatoire" }]}
           >
             <Input 
               className="w-full text-xs h-7" 
               placeholder="Ex: France, Belgique, Suisse..." 
             />
           </Form.Item>

            {/* Code postal de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  CODE POSTAL DE NAISSANCE
                </span>
              }
              name="code_postal_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Code postal de naissance"
              />
            </Form.Item>

            {/* Commune de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMMUNE DE NAISSANCE
                </span>
              }
              name="commune_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Commune de naissance"
              />
            </Form.Item>

            {/* Situation familiale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  SITUATION FAMILIALE
                </span>
              }
              name="situation_famille"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="celibataire">Célibataire</Option>
                <Option value="marie">Marié(e)</Option>
                <Option value="pacsé">Pacsé(e)</Option>
                <Option value="divorce">Divorcé(e)</Option>
                <Option value="veuf">Veuf(ve)</Option>
                <Option value="concubinage">Concubinage</Option>
              </Select>
            </Form.Item>

            {/* Enfants à charge */}
            <Form.Item
              label={
                <span className="text-xs font-medium">ENFANTS À CHARGE</span>
              }
              name="enfants_charge"
              className="mb-0"
            >
              <InputNumber
                className="w-full text-xs h-7"
                min={0}
                placeholder="Nombre d'enfants à charge"
              />
            </Form.Item>

            {/* === ADRESSE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">ADRESSE</h2>

            {/* N° et libellé de la voie */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  N° ET LIBELLÉ DE LA VOIE
                </span>
              }
              name="numero_voie"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: 12 rue des Fleurs"
              />
            </Form.Item>

            {/* Complément d'adresse */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMPLÉMENT D'ADRESSE
                </span>
              }
              name="complement_adresse"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: Bâtiment B, Appartement 12"
              />
            </Form.Item>

            {/* Lieu-dit */}
            <Form.Item
              label={<span className="text-xs font-medium">LIEU-DIT</span>}
              name="lieu_dit"
              className="mb-0"
            >
              <Input className="w-full text-xs h-7" placeholder="Lieu-dit" />
            </Form.Item>

            {/* Code postal */}
            <Form.Item
              label={<span className="text-xs font-medium">CODE POSTAL</span>}
              name="code_postal"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Code postal" />
            </Form.Item>

            {/* Ville */}
            <Form.Item
              label={<span className="text-xs font-medium">VILLE</span>}
              name="ville"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Ville" />
            </Form.Item>

            {/* Inscrit sur Bloctel */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  INSCRIT SUR BLOCTEL
                </span>
              }
              name="bloctel"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            {/* === COORDONNÉES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">COORDONNÉES</h2>

            {/* Téléphone portable */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE PORTABLE</span>
              }
              name="portable"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
                inputProps={{
                  required: true,
                }}
              />
            </Form.Item>

            {/* Téléphone fixe */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE FIXE</span>
              }
              name="fixe"
              className="mb-0"
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="text-xs font-medium">EMAIL</span>}
              name="email"
              className="mb-0"
              rules={[
                { required: false, message: "Ce champ est obligatoire" },
                { type: "email", message: "Email non valide" },
              ]}
            >
              <Input
                type="email"
                className="w-full text-xs h-7"
                placeholder="Email"
              />
            </Form.Item>
  {selectedCategorie !== 'particulier' && (
            <>
              <h2 className="text-sm font-semibold mt-6 mb-2">
                INFORMATIONS PROFESSIONNELLES
              </h2>

    
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    ACTIVITÉ DE L'ENTREPRISE
                  </span>
                }
                name="activite_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Activité principale"
                />
              </Form.Item>

      
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CATÉGORIE SOCIOPROFESSIONNELLE
                  </span>
                }
                name="categorie_professionnelle"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="agriculteur">Agriculteur</Option>
                  <Option value="artisan">Artisan, commerçant</Option>
                  <Option value="cadre">Cadre</Option>
                  <Option value="prof_interm">Profession intermédiaire</Option>
                  <Option value="employe">Employé</Option>
                  <Option value="ouvrier">Ouvrier</Option>
                  <Option value="retraite">Retraité</Option>
                  <Option value="sans_activite">
                    Sans activité professionnelle
                  </Option>
                </Select>
              </Form.Item>


              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DOMAINE D'ACTIVITÉ
                  </span>
                }
                name="domaine_activite"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                  showSearch
                >
                  <Option value="agriculture">Agriculture</Option>
                  <Option value="industrie">Industrie</Option>
                  <Option value="construction">Construction</Option>
                  <Option value="commerce">Commerce</Option>
                  <Option value="transport">Transport</Option>
                  <Option value="information">Information/Communication</Option>
                  <Option value="finance">Finance/Assurance</Option>
                  <Option value="immobilier">Immobilier</Option>
                  <Option value="scientifique">
                    Activités scientifiques/techniques
                  </Option>
                  <Option value="administratif">
                    Activités administratives
                  </Option>
                  <Option value="public">Administration publique</Option>
                  <Option value="enseignement">Enseignement</Option>
                  <Option value="sante">Santé/Social</Option>
                  <Option value="art">Arts/Spectacles</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">STATUT JURIDIQUE</span>
                }
                name="statut_juridique"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sasu">SASU</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="micro">Micro-entreprise</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DÉNOMINATION COMMERCIALE
                  </span>
                }
                name="denomination_commerciale"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Nom commercial"
                />
              </Form.Item>

         
              <Form.Item
                label={
                  <span className="text-xs font-medium">RAISON SOCIALE</span>
                }
                name="raison_sociale"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Raison sociale"
                />
              </Form.Item>

        
              <Form.Item
                label={
                  <span className="text-xs font-medium">DATE DE CRÉATION</span>
                }
                name="date_creation"
                className="mb-0"
              >
                <DatePicker
                  className="w-full text-xs h-7"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-medium">SIRET</span>}
                name="siret"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
              
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Numéro SIRET (14 chiffres)"
                />
              </Form.Item>

        
              <Form.Item
                label={
                  <span className="text-xs font-medium">FORME JURIDIQUE</span>
                }
                name="forme_juridique"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    TÉLÉPHONE DE L'ENTREPRISE
                  </span>
                }
                name="telephone_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <PhoneInput
                  country={"fr"}
                  inputClass="w-full text-xs h-7"
                  containerClass="w-full"
                />
              </Form.Item>

         
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    EMAIL DE L'ENTREPRISE
                  </span>
                }
                name="email_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                  { type: "email", message: "Email non valide" },
                ]}
              >
                <Input
                  type="email"
                  className="w-full text-xs h-7"
                  placeholder="Email professionnel"
                />
              </Form.Item>

        
              <Form.Item
                label={
                  <span className="text-xs font-medium">SITE INTERNET</span>
                }
                name="site_internet"
                className="mb-0"
                rules={[{ type: "url", message: "URL non valide" }]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="https://www.example.com"
                />
              </Form.Item>

    
              <Form.Item
                label={
                  <span className="text-xs font-medium">CODE NAF/APE</span>
                }
                name="code_naf"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Ex: 62.02A"
                />
              </Form.Item>

     
              <Form.Item
                label={<span className="text-xs font-medium">IDCC</span>}
                name="idcc"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Identifiant de convention collective"
                />
              </Form.Item>

        
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    BÉNÉFICIAIRES EFFECTIFS
                  </span>
                }
                name="beneficiaires_effectifs"
                className="mb-0"
              >
                <Input.TextArea
                  rows={3}
                  className="w-full text-xs"
                  placeholder="Liste des bénéficiaires effectifs"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CHIFFRE D'AFFAIRES (€)
                  </span>
                }
                name="chiffre_affaires"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                  }
                  parser={(value) => value.replace(/\s/g, "")}
                  min={0}
                  placeholder="Montant en euros"
                />
              </Form.Item>

    
              <Form.Item
                label={<span className="text-xs font-medium">EFFECTIF</span>}
                name="effectif"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  min={0}
                  placeholder="Nombre d'employés"
                />
              </Form.Item>

  
              <Form.Item
  label={
    <span className="text-xs font-medium">
      PÉRIODE DE CLÔTURE D'EXERCICE
    </span>
  }
  name="periode_cloture"
  className="mb-0"
>
  <DatePicker
    className="w-full text-xs h-7"
    format="DD/MM/YYYY"
    placeholder="Sélectionnez une date"
    picker="date"
  />
</Form.Item>
            </>
            )}

            {/* === SÉCURITÉ SOCIALE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              SÉCURITÉ SOCIALE
            </h2>

            {/* Régime de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  RÉGIME DE SÉCURITÉ SOCIALE
                </span>
              }
              name="regime_securite_sociale"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="general">Régime général</Option>
                <Option value="agricole">Régime agricole</Option>
                <Option value="independant">Régime indépendant</Option>
                <Option value="fonctionnaire">Fonction publique</Option>
                <Option value="autre">Autre régime</Option>
              </Select>
            </Form.Item>

            {/* Numéro de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  NUMÉRO DE SÉCURITÉ SOCIALE
                </span>
              }
              name="num_secu"
              className="mb-0"
              rules={[
                { required: false, message: "Ce champ est obligatoire" },
              ]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Numéro de sécurité sociale"
              />
            </Form.Item>

            {/* === GESTION === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">GESTION</h2>

            {/* Type d'origine */}
            <Form.Item
                         name="type_origine"
                         label={
                           <span className="text-xs font-medium">Type d'origin</span>
                         }
                         className="w-full"
                       >
                         <Select placeholder="Choisissez" className="w-full">
                           <Option value="co_courtage">Co-courtage</Option>
                           <Option value="indicateur_affaires">
                             Indicateur d'affaires
                           </Option>
                           <Option value="weedo_market">Weedo market</Option>
                           <Option value="recommandation">Recommandation</Option>
                           <Option value="reseaux_sociaux">Réseaux sociaux</Option>
                           <Option value="autre">Autre</Option>
                         </Select>
                       </Form.Item>

            {/* <Form.Item
              label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
              name="gestionnaire"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez un gestionnaire --"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {users.map((user) => {
                  // Handle different field names between admin and commercial
                  const displayName =
                    user.userType === "admin"
                      ? user.name
                      : `${user.nom} ${user.prenom}`;

                  return (
                    <Option
                      key={`${user.userType}-${user._id}`}
                      value={displayName}
                    >
                      {displayName} (
                      {user.userType === "admin" ? "Admin" : "Commercial"})
                    </Option>
                  );
                })}
              </Select>
            </Form.Item> */}
            <Form.Item
  label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
  name="gestionnaire"
  className="mb-0"
  rules={[{ required: true, message: "Ce champ est obligatoire" }]}
>
  <Select
    className="w-full text-xs h-7"
    placeholder="-- Choisissez un gestionnaire --"
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
  >
    {/* {users.map((user) => {
      const displayName =
        user.userType === "admin"
          ? user.name
          : `${user.nom} ${user.prenom}`;

      return (
        <Option
          key={`${user.userType}-${user._id}`}
          value={user._id} // Store the ID instead of display name
        >
          {displayName} (
          {user.userType === "admin" ? "Admin" : "Commercial"})
        </Option>
      );
    })} */}
      {users.map((user) => {
              // Determine display name based on user type
              let displayName;
              if (user.userType === "admin") {
                displayName = user.name;
              } else if (user.userType === "manager" || user.userType === "commercial") {
                displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
              } else {
                // Fallback for any other user types
                displayName = user.name || user.email || user._id;
              }
    
              // Determine display type label
              let typeLabel;
              switch(user.userType) {
                case "admin":
                  typeLabel = "Admin";
                  break;
                case "commercial":
                  typeLabel = "Commercial";
                  break;
                case "manager":
                  typeLabel = "Manager";
                  break;
                default:
                  typeLabel = user.userType || "Utilisateur";
              }
    
              return (
                <Option key={user._id} value={user._id}>
                  {displayName} ({typeLabel})
                </Option>
              );
            })}
  </Select>
</Form.Item>
<Form.Item name="gestionnaireModel" hidden>
  <Input />
</Form.Item>

            <Form.Item
              label={<span className="text-xs font-medium">CRÉÉ PAR</span>}
              name="cree_par"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez un créateur --"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {/* {users.map((user) => {
                  const displayName =
                    user.userType === "admin"
                      ? user.name
                      : `${user.nom} ${user.prenom}`;

                  return (
                    <Option
                      key={`${user.userType}-${user._id}`}
                      value={displayName}
                    >
                      {displayName} (
                      {user.userType === "admin" ? "Admin" : "Commercial"})
                    </Option>
                  );
                })} */}
                  {users.map((user) => {
              // Determine display name based on user type
              let displayName;
              if (user.userType === "admin") {
                displayName = user.name;
              } else if (user.userType === "manager" || user.userType === "commercial") {
                displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
              } else {
                // Fallback for any other user types
                displayName = user.name || user.email || user._id;
              }
    
              // Determine display type label
              let typeLabel;
              switch(user.userType) {
                case "admin":
                  typeLabel = "Admin";
                  break;
                case "commercial":
                  typeLabel = "Commercial";
                  break;
                case "manager":
                  typeLabel = "Manager";
                  break;
                default:
                  typeLabel = user.userType || "Utilisateur";
              }
    
              return (
                <Option key={user._id} value={user._id}>
                  {displayName} ({typeLabel})
                </Option>
              );
            })}
              </Select>
            </Form.Item>

            <Form.Item
                        label={<span className="text-xs font-medium">INTERMÉDIAIRE</span>}
                        name="intermediaire"
                        className="mb-0"
                        rules={[{ required: false, message: "Ce champ est obligatoire" }]}
                      >
                        <Select
                          className="w-full text-xs h-7"
                          placeholder="-- Choisissez un intermediaire--"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {/* {users.map((user) => {
                            const displayName =
                              user.userType === "admin"
                                ? user.name
                                : `${user.nom} ${user.prenom}`;
          
                            return (
                              <Option
                                key={`${user.userType}-${user._id}`}
                                value={displayName}
                              >
                                {displayName} (
                                {user.userType === "admin" ? "Admin" : "Commercial"})
                              </Option>
                            );
                          })} */}
                            {users.map((user) => {
              // Determine display name based on user type
              let displayName;
              if (user.userType === "admin") {
                displayName = user.name;
              } else if (user.userType === "manager" || user.userType === "commercial") {
                displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
              } else {
                // Fallback for any other user types
                displayName = user.name || user.email || user._id;
              }
    
              // Determine display type label
              let typeLabel;
              switch(user.userType) {
                case "admin":
                  typeLabel = "Admin";
                  break;
                case "commercial":
                  typeLabel = "Commercial";
                  break;
                case "manager":
                  typeLabel = "Manager";
                  break;
                default:
                  typeLabel = user.userType || "Utilisateur";
              }
    
              return (
                <Option key={user._id} value={user._id}>
                  {displayName} ({typeLabel})
                </Option>
              );
            })}
                        </Select>
                      </Form.Item>
          </Form>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full text-xs h-7 mt-2 mb-4"
            onClick={() => form.submit()}
          >
            Enregistrer
          </Button>
        </div>
      </Modal>
       <Modal
              title={
                <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-start sticky top-0 z-10 border-b">
                  <span className="font-medium text-sm">
                    IMPORTER VOTRE BASE CLIENT/PROSPECT
                  </span>
                  <button
                    onClick={handleCancelImport}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
                  >
                    <CloseOutlined className="text-xs" />
                  </button>
                </div>
              }
              open={isOpenModalImport}
              onCancel={handleCancelImport}
              footer={null}
              width="40%"
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
                margin: 0,
                padding: 0,
                overflow: "hidden",
              }}
              bodyStyle={{
                height: "calc(100vh - 49px)",
                padding: 0,
                margin: 0,
              }}
              maskStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
              closeIcon={null}
            >
              <ImportLeads onImportSuccess={handleImportSuccess} />
            </Modal>

         {/* Assign Modal */}
            <Modal
              title="Affecter les clients au Commercial"
              visible={isAssignModalVisible}
              onCancel={() => {
                setIsAssignModalVisible(false);
                assignForm.resetFields();
              }}
              footer={null}
            >
              <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-sm text-yellow-700">
                  <strong>Note:</strong> {selectedLeads.length} client(s) seront
                  affectés au commercial sélectionné.
                </div>
              </div>
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
                    {/* {commercials.map((commercial) => (
                      <Option key={commercial._id} value={commercial._id}>
                        {commercial.prenom} {commercial.nom}
                      </Option>
                    ))} */}
                 {commercials
  .filter(commercial => {
    return commercial.createdBy === currentManagerId;
  })
  .map((commercial) => {
    return (
      <Option key={commercial._id} value={commercial._id}>
        {commercial.prenom} {commercial.nom}
      </Option>
    );
  })}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                      Affecter
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAssignModalVisible(false);
                        assignForm.resetFields();
                      }}
                    >
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
      
            {/* Unassign Modal */}
            <Modal
              title="Désaffecter les clients du Commercial"
              visible={isUnassignModalVisible}
              onCancel={() => setIsUnassignModalVisible(false)}
              footer={null}
            >
              <Form form={unassignForm} onFinish={handleUnassign}>
                <Form.Item>
                  <div className="mb-4 p-3 bg-orange-50 rounded border border-orange-200">
                    <div className="text-sm text-orange-700">
                      <strong>Attention:</strong> Êtes-vous sûr de vouloir désaffecter{" "}
                      {selectedLeads.length} client(s) du commercial ?
                    </div>
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      Désaffecter
                    </Button>
                    <Button onClick={() => setIsUnassignModalVisible(false)}>
                      Annuler
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
    </div>
  );
};

export default ListManagerLeads;
