import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Select,
  Input,
  DatePicker,
  Form,
  InputNumber,
  Tag,
  Space 

} from "antd";
import { useNavigate } from "react-router-dom";
import { CloseOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, ExclamationCircleOutlined  } from "@ant-design/icons";
import {RISQUES, ASSUREURS} from "../constants";
import dayjs from "dayjs";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import FileUpload from "../components/TabsContent/FileUpload";

const { RangePicker } = DatePicker;

const { Option } = Select;


const MesDevis = () => {

  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [users, setUsers] = useState([]);
  const [devisData, setDevisData] = useState([]);
  const [filteredDevis, setFilteredDevis] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clients, setClients] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [filters, setFilters] = useState({
      periode: null,   
      gestionnaire: null, 
      client: null,        
      risque: null,       
      assureur: null,     
      statut: null,       
      search: "",    
    });      
   const navigate = useNavigate();

    const token = localStorage.getItem("token");
 const decodedToken = token ? jwtDecode(token) : null;
 const currentUserId = decodedToken?.userId;
 const userRole = decodedToken?.role;

 const handleFilterChange = (filterName, value) => {
  const newFilters = {
    ...filters,
    [filterName]: value,
  };
  setFilters(newFilters);
  applyFilters(newFilters);
};

const applyFilters = (filterValues) => {
  let result = [...devisData];

  // Date range filter
  if (filterValues.periode && filterValues.periode[0] && filterValues.periode[1]) {
    const [startDate, endDate] = filterValues.periode;
    result = result.filter(devis => {
      const devisDate = new Date(devis.date_effet);
      return devisDate >= startDate && devisDate <= endDate;
    });
  }
  
if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
  result = result.filter(devis => {
    // Find the user object that matches the selected ID
    const user = users.find(u => u._id === filterValues.gestionnaire);
    if (!user) return false;
    
    // Construct the display name to match against
    const displayName = user.userType === "admin" 
      ? user.name 
      : `${user.nom} ${user.prenom}`;
    
    // Check all possible locations for the gestionnaire name
    return (
      devis.lead?.gestionnaireName === displayName ||  // From lead object
      devis.gestionnaire === displayName ||            // Direct property
      devis.session?.name === displayName              // From session
    );
  });
}

// In your applyFilters function, modify the categorie filter to:
if (filterValues.categorie && filterValues.categorie !== "tous") {
  result = result.filter(devis => {
    // Access the categorie from the formatted data
    return devis.categorie === filterValues.categorie;
  });
}
  // Risque filter
  if (filterValues.risque) {
    result = result.filter(devis => devis.risque === filterValues.risque);
  }

  // Assureur filter
  if (filterValues.assureur) {
    result = result.filter(devis => devis.assureur === filterValues.assureur);
  }

  // Status filter
  if (filterValues.statut) {
    result = result.filter(devis => devis.statut === filterValues.statut);
  }
  

// Updated search filter
if (filterValues.search) {
  const searchTerm = filterValues.search.toLowerCase();
  result = result.filter(devis => {
    // Get the lead data from the original record
    const lead = devis.originalData?.lead;
    
    // Construct client name from lead or use clientId as fallback
    const clientName = lead 
      ? `${lead.nom || ''} ${lead.prenom || ''}`.trim().toLowerCase()
      : (devis.clientId || '').toLowerCase();
    
    // Check both devis number and client name
    return (
      (devis.numero_devis && devis.numero_devis.toLowerCase().includes(searchTerm)) ||
      (clientName && clientName.includes(searchTerm))
    );
  });
}

  setFilteredDevis(result);
};
  useEffect(() => {
    // const fetchClientsData = async () => {
    //   setClientLoading(true);
    //   try {
    //     const response = await axios.get("/data");
    //     console.log("Clients data fetched:", response.data);
    
        
    //     // Extract the chatData array from response
    //     const clientsData = response.data?.chatData || [];
    //     setClients(clientsData);
        
    //   } catch (error) {
    //     console.error("Error fetching clients data:", error);
    //     setClients([]);
    //   } finally {
    //     setClientLoading(false);
    //   }
    // };
    
    // fetchClientsData();
        const fetchClients = async () => {
              const token = localStorage.getItem("token");
              const decodedToken = jwtDecode(token);
              const userId = decodedToken?.userId;
              const userRole = decodedToken?.role?.toLowerCase(); // or userType
            
              try {
                setLoading(true);
                
                // Always fetch all clients (admin will use all, commercial will filter)
                const response = await axios.get('/data', {
                  headers: { Authorization: `Bearer ${token}` }
                });
            
                const allLeads = response.data?.chatData || [];
                console.log("All leads:", allLeads);
            
                const filteredLeads = allLeads.filter(lead => {
                  // ADMIN: See all clients
                  if (userRole === 'admin') {
                    return true;
                  }
            
                  // COMMERCIAL: Only see clients assigned to them via commercial field
                  if (userRole === 'commercial') {
                    const commercialId = 
                      typeof lead.commercial === 'string' 
                        ? lead.commercial 
                        : lead.commercial?._id?.toString();
                    return commercialId === userId;
                  }
            
                  // MANAGER: Only see clients assigned to them via manager field
                  if (userRole === 'manager') {
                    const managerId = 
                      typeof lead.manager === 'string' 
                        ? lead.manager 
                        : lead.manager?._id?.toString();
                    return managerId === userId;
                  }
            
                  // Default: no access if role not recognized
                  return false;
                });
            
                // Sort by createdAt in descending order (newest first)
                const sortedLeads = filteredLeads.sort((a, b) => {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                });
            
                console.log("Filtered and sorted leads:", {
                  userId,
                  userRole,
                  totalLeads: allLeads.length,
                  filteredCount: sortedLeads.length,
                  sampleLead: sortedLeads[0],
                  breakdown: {
                    admin: userRole === 'admin' ? 'ALL' : 'N/A',
                    commercial: userRole === 'commercial' ? sortedLeads.length : 'N/A',
                    manager: userRole === 'manager' ? sortedLeads.length : 'N/A'
                  }
                });
            
                setClients(sortedLeads);
              } catch (error) {
                console.error("Error fetching leads:", error);
                message.error("Failed to fetch leads");
              } finally {
                setLoading(false);
              }
            };
            fetchClients();
  }, []);

 




const showModal = () => {
  setEditingRecord(null); 
  setUploadedDocument(null); 
  form.resetFields();
  if (gestionnaire) {
    form.setFieldsValue({
      gestionnaire: gestionnaire._id || gestionnaire
    });
  }
  setIsModalOpen(true); 
};

const handleClientChange = (clientId) => {
  setSelectedLeadId(clientId);
  const selectedClient = clients.find((client) => client._id === clientId);
  if (selectedClient) {
    form.setFieldsValue({
      clientId: `${selectedClient.prenom} ${selectedClient.nom}`.trim(),
      email: selectedClient.email,
    });
  }
};
const handleCancel = () => {
  form.resetFields();
  setEditingRecord(null);
  setUploadedDocument(null);
  setIsModalOpen(false);
};

// Helper function to format devis items consistently
const formatDevisItem = (devis) => ({
  key: devis._id,
  numero_devis: devis.numero_devis,
  gestionnaire: devis.lead?.gestionnaire || "N/A",
  risque: devis.risque,
  assureur: devis.assureur,
  statut: devis.statut,
  source: devis.type_origine,
  date_effet: devis.date_effet
    ? new Date(devis.date_effet).toLocaleDateString()
    : "N/A",
  originalData: devis,
  documents: devis.documents || [],
});
const handleFormSubmit = async (values) => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const isAdmin = decodedToken.role === "Admin" || decodedToken.role === "admin";
  const isManager = decodedToken.role === "Manager" || decodedToken.role === "manager";
  const sessionId = decodedToken.userId;
  const sessionModel = isAdmin ? "Admin" : isManager ? "Manager" : "Commercial";
  
  try {
    // Prepare common data
    const commonData = {
      ...values,
      session: sessionId,
      sessionModel: sessionModel,
      lead: selectedLeadId,
    };

    let response;
    
    if (editingRecord) {
      // UPDATE EXISTING DEVIS
      const devisId = editingRecord.originalData?._id;
      if (!devisId) {
        throw new Error("Missing devis ID for update");
      }

      // Handle document for update
      let documents = editingRecord.originalData?.documents || [];
      
      if (uploadedDocument) {
        console.log('Uploaded document for update:', uploadedDocument);
        
        if (uploadedDocument instanceof File || uploadedDocument.file) {
          // Upload new file
          const fileToUpload = uploadedDocument.file || uploadedDocument;
          const uploadFormData = new FormData();
          uploadFormData.append('document', fileToUpload);
          
          console.log('Uploading file for update:', fileToUpload.name);
          
          const uploadResponse = await axios.post('/files/upload', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          console.log('Upload response for update:', uploadResponse.data);

          // FIX: Add proper error checking
          if (uploadResponse.data.success && uploadResponse.data.document) {
            documents = [{
              url: uploadResponse.data.document.url,
              name: uploadResponse.data.document.name || fileToUpload.name,
              originalName: uploadResponse.data.document.originalName || fileToUpload.name,
              type: uploadResponse.data.document.mimetype || fileToUpload.type,
              size: uploadResponse.data.document.size || fileToUpload.size,
              path: uploadResponse.data.document.name || fileToUpload.name
            }];
          } else {
            throw new Error('File upload failed or invalid response format');
          }
        } else if (uploadedDocument.url) {
          // Use existing uploaded document
          documents = [{
            url: uploadedDocument.url,
            name: uploadedDocument.name,
            originalName: uploadedDocument.originalName,
            type: uploadedDocument.type || uploadedDocument.mimetype,
            size: uploadedDocument.size,
            path: uploadedDocument.path || uploadedDocument.name
          }];
        }
      }

      response = await axios.put(`/devis/${devisId}`, {
        ...commonData,
        documents
      });

      // Update state
      setDevisData(prev => prev.map(item => 
        item.key === devisId ? formatDevisItem(response.data) : item
      ));
      setFilteredDevis(prev => prev.map(item => 
        item.key === devisId ? formatDevisItem(response.data) : item
      ));
      message.success("Devis mis à jour avec succès");
      
    } else {
      // CREATE NEW DEVIS
      let documents = [];
      
      if (uploadedDocument) {
        console.log('Uploaded document for create:', uploadedDocument);
        
        if (uploadedDocument instanceof File || uploadedDocument.file) {
          // Upload new file
          const fileToUpload = uploadedDocument.file || uploadedDocument;
          const uploadFormData = new FormData();
          uploadFormData.append('document', fileToUpload);
          
          console.log('Uploading file for create:', fileToUpload.name);
          
          const uploadResponse = await axios.post('/files/upload', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          console.log('Upload response for create:', uploadResponse.data);

          // FIX: Add proper error checking
          if (uploadResponse.data.success && uploadResponse.data.document) {
            documents = [{
              url: uploadResponse.data.document.url,
              name: uploadResponse.data.document.name || fileToUpload.name,
              originalName: uploadResponse.data.document.originalName || fileToUpload.name,
              type: uploadResponse.data.document.mimetype || fileToUpload.type,
              size: uploadResponse.data.document.size || fileToUpload.size,
              path: uploadResponse.data.document.name || fileToUpload.name
            }];
          } else {
            throw new Error('File upload failed or invalid response format');
          }
        } else if (uploadedDocument.url) {
          // Use existing uploaded document
          documents = [{
            url: uploadedDocument.url,
            name: uploadedDocument.name,
            originalName: uploadedDocument.originalName,
            type: uploadedDocument.type || uploadedDocument.mimetype,
            size: uploadedDocument.size,
            path: uploadedDocument.path || uploadedDocument.name
          }];
        }
      }

      response = await axios.post("/devis", {
        ...commonData,
        documents
      });

      const newItem = formatDevisItem(response.data);
      setDevisData(prev => [newItem, ...prev]);
      setFilteredDevis(prev => [newItem, ...prev]);
      setCurrentPage(1);
      message.success("Devis ajouté avec succès");
    }

    // Reset form and states
    setRefreshTrigger(prev => prev + 1);
    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
    setUploadedDocument(null);

  } catch (error) {
    console.error("Error saving devis:", error);
    console.error("Error details:", error.response?.data);
    message.error("Erreur lors de la sauvegarde du devis: " + (error.response?.data?.message || error.message));
  }
};
// const handleFormSubmit = async (values) => {
//   const token = localStorage.getItem("token");
//   const decodedToken = token ? jwtDecode(token) : null;
//   const isAdmin =
//   decodedToken.role === "Admin" || decodedToken.role === "admin";
// const sessionId = decodedToken.userId;
// const sessionModel = isAdmin ? "Admin" : "Commercial";
  
//   try {
//     // Prepare form data with document if exists
//     const formData = {
//       ...values,
//       documents: uploadedDocument ? [uploadedDocument] : [],
//       session: sessionId,
//       sessionModel: sessionModel,
//       lead: selectedLeadId,
//     };

//     let response;
    
//     if (editingRecord) {
//       // UPDATE EXISTING DEVIS
//       const devisId = editingRecord.originalData?._id;
//       if (!devisId) {
//         throw new Error("Missing devis ID for update");
//       }

//       response = await axios.put(`/devis/${devisId}`, formData);
//     setDevisData(prev => prev.map(item => 
//       item.key === devisId ? formatDevisItem(response.data) : item
//     ));
//     setFilteredDevis(prev => prev.map(item => 
//       item.key === devisId ? formatDevisItem(response.data) : item
//     ));
//       message.success("Devis mis à jour avec succès");
//       form.resetFields();
//       setIsModalOpen(false);
//     } else {
//       // CREATE NEW DEVIS
//       response = await axios.post("/devis", formData);
//       const newItem = formatDevisItem(response.data);
    
//       setDevisData(prev => [newItem, ...prev]);
//       setFilteredDevis(prev => [newItem, ...prev]);
//       // setDevisData(prev => [response.data, ...prev]);
//       setCurrentPage(1);
//       message.success("Devis ajoutée avec succès");
//         form.resetFields();
//     setIsModalOpen(false);
//     }

//     setRefreshTrigger(prev => prev + 1);
//     form.resetFields();
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     setUploadedDocument(null);

//   } catch (error) {
//     console.error("Error saving devis:", error);
//   }
// };


// useEffect(() => {
//   const fetchDevis = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
    
//     setLoading(true);
//     try {
//       const decodedToken = jwtDecode(token);
//       const currentUserId = decodedToken?.userId;
//       const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';

//       // Fetch all devis
//       const response = await axios.get("/devis");
//       console.log("Fetched devis:", response.data);
  
//       const allDevis = response.data || [];

//       // Filter based on role
//       let filteredData;
//       if (isAdmin) {
//         // Admins see all devis
//         filteredData = allDevis;
//       } else {
//         // Commercials only see their own devis
//         filteredData = allDevis.filter(
//           devis => devis.session?._id?.toString() === currentUserId
//         );
//       }

//       // Format the data
//       const formattedData = filteredData?.map(devis => ({
//         key: devis._id,
//         numero_devis: devis.numero_devis || "N/A",
//         gestionnaire:  devis.lead?.gestionnaireName ||  
//         "N/A",
//         risque: devis.risque || "N/A",
//         assureur: devis.assureur || "N/A",
//         statut: devis.statut || "N/A",
//         source: devis.type_origine || "N/A",
//         date_effet: devis.date_effet,
//         originalData: devis,
//         documents: devis.documents || [],
//         intermediaire: devis.intermediaire || "N/A",
//         clientId: devis.clientId || "N/A",
//         categorie: devis?.lead?.categorie || "N/A",  // This is correct
//       }));

//       setDevisData(formattedData);
//       setFilteredDevis(formattedData);

//     } catch (error) {
//       console.error("Error fetching devis:", error.response?.data || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchDevis();
// }, [refreshTrigger]);
// useEffect(() => {
//   const fetchDevis = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
    
//     setLoading(true);
//     try {
//       const decodedToken = jwtDecode(token);
//       const currentUserId = decodedToken?.userId;
//       const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';

//       // Fetch all devis
//       const response = await axios.get("/devis");
//       console.log("Fetched devis:", response.data);
  
//       const allDevis = response.data || [];

//       // Filter based on role
//       let filteredData;
//       if (isAdmin) {
//         // Admins see all devis
//         filteredData = allDevis;
//       } else {
//         // Commercials only see their own devis
//         filteredData = allDevis.filter(
//           devis => devis.session?._id?.toString() === currentUserId
//         );
//       }

//       // Sort by createdAt in descending order (newest first)
//       const sortedData = filteredData.sort((a, b) => {
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       });

//       // Format the data
//       const formattedData = sortedData?.map(devis => ({
//         key: devis._id,
//         numero_devis: devis.numero_devis || "N/A",
//         gestionnaire: devis.lead?.gestionnaireName || "N/A",
//         risque: devis.risque || "N/A",
//         assureur: devis.assureur || "N/A",
//         statut: devis.statut || "N/A",
//         source: devis.type_origine || "N/A",
//         date_effet: devis.date_effet,
//         originalData: devis,
//         documents: devis.documents || [],
//         intermediaire: devis.intermediaire || "N/A",
//         clientId: devis.clientId || "N/A",
//         categorie: devis?.lead?.categorie || "N/A",
//         // Add createdAt for reference if needed
//         createdAt: devis.createdAt
//       }));

//       setDevisData(formattedData);
//       setFilteredDevis(formattedData);

//     } catch (error) {
//       console.error("Error fetching devis:", error.response?.data || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchDevis();
// }, [refreshTrigger]);
// useEffect(() => {
//   const fetchAllDevis = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     try {
//       setLoading(true);
//       const decodedToken = jwtDecode(token);
//       const currentUserId = decodedToken?.userId;
//       const userRole = decodedToken?.role?.toLowerCase();
      
//       // Fetch all devis
//       const response = await axios.get("/devis", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       console.log("Fetched all devis:", {
//         count: response.data?.length,
//         firstDevis: response.data?.[0]
//       });

//       const allDevis = response.data || [];
      
//       // Filter based on user role
//       let filteredData;
      
//       if (userRole === 'admin') {
//         // Admin sees all
//         filteredData = allDevis;
//       } else if (userRole === 'manager') {
//         // Manager sees:
//         // 1. Devis where they are the lead's manager
//         // 2. Devis created by commercials who report to them
//         // 3. Devis they created themselves
        
//         // First, get all commercials managed by this manager
//         const commercialsResponse = await axios.get('/commercials', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         const allCommercials = commercialsResponse.data || [];
//         const managedCommercials = allCommercials.filter(commercial => 
//           commercial.manager === currentUserId || 
//           commercial.manager?.toString() === currentUserId ||
//           commercial.createdBy === currentUserId
//         );
        
//         const managedCommercialIds = managedCommercials.map(c => c._id);
        
//         console.log("Manager's team:", {
//           managerId: currentUserId,
//           managedCommercialIds,
//           allCommercialsCount: allCommercials.length,
//           managedCount: managedCommercials.length
//         });
        
//         filteredData = allDevis.filter(devis => {
//           const leadManager = devis.lead?.manager;
//           const sessionId = devis.session?._id?.toString();
//           const devisCreatorId = sessionId || devis.session;
          
//           // Check if manager is the lead's manager
//           const isLeadManager = leadManager === currentUserId || 
//                                leadManager?.toString() === currentUserId;
          
//           // Check if devis was created by a managed commercial
//           const isCreatedByTeam = managedCommercialIds.includes(devisCreatorId);
          
//           // Check if manager created the devis themselves
//           const isCreatedByManager = devisCreatorId === currentUserId;
          
//           return isLeadManager || isCreatedByTeam || isCreatedByManager;
//         });
        
//         console.log("Filtered devis for manager:", {
//           totalDevis: allDevis.length,
//           filteredCount: filteredData.length,
//           sampleFiltered: filteredData[0]
//         });
//       } else {
//         // Commercial sees only devis they created
//         filteredData = allDevis.filter(devis => {
//           const sessionId = devis.session?._id?.toString();
//           const devisCreatorId = sessionId || devis.session;
//           return devisCreatorId === currentUserId;
//         });
//       }

//       // Format the data
//       const formattedData = filteredData.map(devis => ({
//         key: devis._id,
//         numero_devis: devis.numero_devis || "N/A",
//         categorie: devis?.lead?.categorie || "N/A",
        
//         // Client info
//         clientName: devis.lead 
//           ? `${devis.lead.prenom || ''} ${devis.lead.nom || ''}`.trim()
//           : devis.clientId || "N/A",
        
//         // Gestionnaire info (from lead)
//         gestionnaire: devis.lead?.gestionnaireName || "N/A",
        
//         // Who created the devis
//         createdByName: devis.session 
//           ? `${devis.session.prenom || ''} ${devis.session.nom || ''}`.trim()
//           : devis.cree_par || "N/A",
        
//         // Devis details
//         risque: devis.risque,
//         assureur: devis.assureur,
//         statut: devis.statut,
//         source: devis.type_origine,
//         prime_proposee: devis.prime_proposee,
//         prime_actuelle: devis.prime_actuelle,
//         variation: devis.variation,
//         courtier: devis.courtier,
        
//         // Dates
//         date_effet: devis.date_effet
//           ? new Date(devis.date_effet).toLocaleDateString('fr-FR')
//           : "N/A",
//         createdAt: devis.createdAt
//           ? new Date(devis.createdAt).toLocaleDateString('fr-FR')
//           : "N/A",
        
//         // Original data for editing
//         originalData: devis,
//         documents: devis.documents || [],
        
//         // Additional info
//         intermediaire: devis.intermediaire || "N/A",
//         cree_par: devis.cree_par,
        
//         // For reference
//         leadManager: devis.lead?.manager,
//         sessionId: devis.session?._id,
//         sessionModel: devis.sessionModel,
//       }));

//       // Sort by creation date (newest first)
//       const sortedData = formattedData.sort((a, b) => {
//         return new Date(b.originalData.createdAt) - new Date(a.originalData.createdAt);
//       });

//       console.log("Final formatted data for display:", {
//         count: sortedData.length,
//         firstItem: sortedData[0]
//       });

//       setDevisData(sortedData);
//       setFilteredDevis(sortedData);
      
//     } catch (error) {
//       console.error("Error fetching devis:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAllDevis();
// }, [refreshTrigger]);
useEffect(() => {
  const fetchAllDevis = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const decodedToken = jwtDecode(token);
      const currentUserId = decodedToken?.userId;
      const userRole = decodedToken?.role?.toLowerCase();
      
      // Fetch all devis
      const response = await axios.get("/devis", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Fetched all devis:", {
        count: response.data?.length,
        firstDevis: response.data?.[0]
      });

      const allDevis = response.data || [];
      
      // Get user information and team structure
      let userManagerId = null;
      let managerId = currentUserId; // For managers, they are their own manager
      let teamUserIds = [currentUserId]; // Start with self
      
      if (userRole === 'commercial') {
        try {
          // Fetch current commercial's details
          const commercialsResponse = await axios.get('/commercials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const allCommercials = commercialsResponse.data || [];
          
          // Find current user in commercials
          const currentUserCommercial = allCommercials.find(c => 
            c._id === currentUserId || c._id?.toString() === currentUserId
          );
          
          // Get manager ID (manager or createdBy)
          userManagerId = currentUserCommercial?.manager || currentUserCommercial?.createdBy;
          managerId = userManagerId; // Commercial's manager ID
          
          console.log("Commercial's manager info (devis):", {
            currentUserId,
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
          
          console.log("Commercial team structure (devis):", {
            managerId,
            teamUserIds,
            teamSize: teamUserIds.length
          });
          
        } catch (error) {
          console.log("Error fetching commercials for devis:", error);
        }
      } else if (userRole === 'manager') {
        // Manager sees their own devis and all devis from their team
        try {
          const commercialsResponse = await axios.get('/commercials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const allCommercials = commercialsResponse.data || [];
          
          // Get all commercials under this manager
          const teamCommercials = allCommercials.filter(commercial => {
            const commercialManager = commercial.manager || commercial.createdBy;
            return commercialManager === currentUserId || 
                   commercialManager?.toString() === currentUserId;
          });
          
          // Add all commercial IDs from the team
          teamCommercials.forEach(commercial => {
            if (commercial._id && !teamUserIds.includes(commercial._id.toString())) {
              teamUserIds.push(commercial._id.toString());
            }
          });
          
          console.log("Manager team structure (devis):", {
            managerId: currentUserId,
            teamUserIds,
            teamCommercialsCount: teamCommercials.length
          });
          
        } catch (error) {
          console.log("Error fetching manager team for devis:", error);
        }
      }
      
      // Filter devis based on user role and team
      let filteredData;
      
      if (userRole === 'admin') {
        // Admin sees all
        filteredData = allDevis;
      } else if (userRole === 'manager' || userRole === 'commercial') {
        // Both manager and commercial see devis from their entire team
        filteredData = allDevis.filter(devis => {
          // Get the creator ID from various possible fields
          const sessionId = devis.session?._id?.toString();
          const devisCreatorId = sessionId || devis.session || devis.cree_par;
          
          // Get lead manager from devis lead
          const leadManager = devis.lead?.manager;
          
          // Check multiple conditions:
          // 1. Check if devis creator is in the team
          const isCreatedByTeam = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === devisCreatorId?.toString()
          );
          
          // 2. Check if lead manager is in the team (for devis assigned to team leads)
          const isTeamLeadManager = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === leadManager?.toString()
          );
          
          // 3. Check if gestionnaire is in the team (from lead)
          const gestionnaireId = devis.lead?.gestionnaire;
          const isTeamGestionnaire = teamUserIds.some(teamUserId => 
            teamUserId?.toString() === gestionnaireId?.toString()
          );
          
          return isCreatedByTeam || isTeamLeadManager || isTeamGestionnaire;
        });
        
        console.log(`${userRole} filtered devis:`, {
          totalDevis: allDevis.length,
          filteredCount: filteredData.length,
          teamUserIds,
          filterLogic: "Sees devis from entire team (manager + all commercials under manager)"
        });
      } else {
        // Other roles see only their own devis
        filteredData = allDevis.filter(devis => {
          const sessionId = devis.session?._id?.toString();
          const devisCreatorId = sessionId || devis.session || devis.cree_par;
          return devisCreatorId === currentUserId || 
                 devisCreatorId?.toString() === currentUserId;
        });
      }

      // Format the data
      const formattedData = filteredData.map(devis => {
        const sessionId = devis.session?._id?.toString();
        const devisCreatorId = sessionId || devis.session || devis.cree_par;
        const isCreatedBySelf = devisCreatorId === currentUserId || 
                               devisCreatorId?.toString() === currentUserId;
        const isCreatedByManager = managerId && (
          devisCreatorId === managerId || 
          devisCreatorId?.toString() === managerId
        );
        
        return {
          key: devis._id,
          numero_devis: devis.numero_devis || "N/A",
          categorie: devis?.lead?.categorie || "N/A",
          
          // Client info
          clientName: devis.lead 
            ? `${devis.lead.prenom || ''} ${devis.lead.nom || ''}`.trim()
            : devis.clientId || "N/A",
          
          // Gestionnaire info (from lead)
          gestionnaire: devis.lead?.gestionnaireName || "N/A",
          
          // Who created the devis
          createdByName: devis.session 
            ? `${devis.session.prenom || ''} ${devis.session.nom || ''}`.trim()
            : devis.cree_par || "N/A",
          
          // Devis details
          risque: devis.risque,
          assureur: devis.assureur,
          statut: devis.statut,
          source: devis.type_origine,
          prime_proposee: devis.prime_proposee,
          prime_actuelle: devis.prime_actuelle,
          variation: devis.variation,
          courtier: devis.courtier,
          
          // Dates
          date_effet: devis.date_effet
            ? new Date(devis.date_effet).toLocaleDateString('fr-FR')
            : "N/A",
          createdAt: devis.createdAt
            ? new Date(devis.createdAt).toLocaleDateString('fr-FR')
            : "N/A",
          
          // Original data for editing
          originalData: devis,
          documents: devis.documents || [],
          
          // Additional info
          intermediaire: devis.intermediaire || "N/A",
          cree_par: devis.cree_par,
          
          // Team visibility info
          isTeamDevis: !isCreatedBySelf,
          createdByType: isCreatedBySelf ? 'self' : 
                        isCreatedByManager ? 'manager' : 'team_member',
          
          // For reference
          leadManager: devis.lead?.manager,
          sessionId: devis.session?._id,
          sessionModel: devis.sessionModel,
        };
      });

      // Sort by creation date (newest first)
      const sortedData = formattedData.sort((a, b) => {
        return new Date(b.originalData.createdAt) - new Date(a.originalData.createdAt);
      });

      console.log("Final formatted data for display:", {
        count: sortedData.length,
        userRole,
        firstItem: sortedData[0],
        teamInfo: {
          isTeamDevis: sortedData[0]?.isTeamDevis,
          createdByType: sortedData[0]?.createdByType
        }
      });

      setDevisData(sortedData);
      setFilteredDevis(sortedData);
      
    } catch (error) {
      console.error("Error fetching devis:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllDevis();
}, [refreshTrigger]);

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

const handleLeadClick = (lead) => {
  // Extract the ID from the lead object
  const leadId = lead?._id || lead?.id;
  if (leadId) {
    navigate(`/client/${leadId}`);
  } else {
    console.error("No lead ID found:", lead);
    // Optionally show an error message to the user
    message.error("Could not navigate to client details");
  }
};
const columns = [
  {
    title: "N° devis",
    dataIndex: "numero_devis",
    key: "numero_devis",
    sorter: (a, b) => a.numero_devis.localeCompare(b.numero_devis),
  },
  {
    title: "Client",
    dataIndex: "clientId",
    key: "clientId",
    render: (clientId, record) => {
      // Get the lead data - checking multiple possible locations
      const lead = record.originalData?.lead || 
                  record.lead || 
                  record.leadId || 
                  record.sinistreDetails;
      
      // Extract name components with fallbacks
      const lastName = lead?.nom || "N/A";
      const firstName = lead?.prenom || "";
      
      return (
        <Button 
          type="link" 
          onClick={() => handleLeadClick(lead)}
          style={{ padding: 0 }}
        >
          {`${lastName} ${firstName}`.trim()}
        </Button>
      );
    },
  },
  // {
  //   title: "Gestionnaire",
  //   dataIndex: "gestionnaire",
  //   key: "gestionnaire",
  //   render: (gestionnaireId, record) => {
  //     // Get the name from the most reliable source in your data structure
  //     const gestionnaireName = 
  //     record.originalData?.session?.name ||          // From populated session
  //     record.originalData?.lead?.gestionnaireName || // From lead
  //     record.originalData?.intermediaire ||          // From intermediaire
  //     "N/A";// Final fallback
  
  //     return (
  //       <h1 
  //         style={{ padding: 0 }}
  //       >
  //         {gestionnaireName}
  //       </h1>
  //     );
  //   },
  // },
    {
        title: "Gestionnaire",
        dataIndex: "gestionnaire",
        key: "gestionnaire",
        render: (gestionnaireId, record) => {
          // Use the record directly, not originalData
          const gestionnaireName = 
            record.session?.nom && record.session?.prenom 
              ? `${record.session.nom} ${record.session.prenom}`
              : record.session?.nom 
              ? record.session.nom
              : record.intermediaire 
              ? record.intermediaire
              : "N/A";
      
          return (
            <h1 style={{ padding: 0 }}>
              {gestionnaireName}
            </h1>
          );
        },
      },
   
  {
    title: "Risque",
    dataIndex: "risque",
    key: "risque",
  },
  {
    title: "Assureur",
    dataIndex: "assureur",
    key: "assureur",
  },
  {
    title: "Statut",
    dataIndex: "statut",
    key: "statut",
    render: (statut) => {
      const statusMap = {
        etude: { color: "blue", text: "En étude" },
        devis_envoye: { color: "orange", text: "Devis envoyé" },
        attente_signature: { color: "purple", text: "En attente signature" },
        cloture_sans_suite: { color: "red", text: "Clôturé sans suite" },
      };
      return (
        <Tag color={statusMap[statut]?.color || "default"}>
          {statusMap[statut]?.text || statut}
        </Tag>
      );
    },
    filters: [
      { text: "En étude", value: "etude" },
      { text: "Devis envoyé", value: "devis_envoye" },
      { text: "En attente signature", value: "attente_signature" },
      { text: "Clôturé sans suite", value: "cloture_sans_suite" },
    ],
    onFilter: (value, record) => record.statut === value,
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
    render: (source) => {
      const sourceMap = {
        reseaux_sociaux: "Réseaux sociaux",
        site_web: "Site web",
        recommandation: "Recommandation",
      };
      return sourceMap[source] || source;
    },
  },
  {
    title: "Date d'effet",
    dataIndex: "date_effet",
    key: "date_effet",
    render: (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    },
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space size="middle">
     
      <Button
        icon={<DownloadOutlined />}
        onClick={() => {
          // Open first document in new tab
          window.open(record.documents[0].url, '_blank');
        }}
        type="text"
        title="Télécharger le document"
      />
 
   
      
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="text"
          />
      
      
          <Button
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.key)}
            type="text"
            danger
          />
      
      </Space>
    ),
  },
];

const handleEdit = (record) => {
setEditingRecord(record);
setIsModalOpen(true);

// Safely prepare document data for display
const document = record?.documents || [];
const documentList = document.map(doc => ({
  uid: doc._id || Math.random().toString(36).substring(2, 9),
  name: doc.name,
  status: 'done',
  url: doc.url,
  path: doc.path,
  response: doc // Keep full document reference
}));

console.log("Prepared document list:", documentList);

// Set all form values including documents
form.resetFields();
form.setFieldsValue({
  // Basic devis info
  numero_devis: record.originalData?.numero_devis,
  courtier: record.originalData?.courtier,
  risque: record.originalData?.risque,
  assureur: record.originalData?.assureur,
  statut: record.originalData?.statut,
  type_origine: record.originalData?.type_origine,
  lead: record.originalData?.lead?._id || selectedLeadId,
  
  // Dates
  date_effet: record.originalData?.date_effet 
    ? dayjs(record.originalData.date_effet)
    : null,
  date_creation: record.originalData?.date_creation
    ? dayjs(record.originalData.date_creation)
    : null,
  
  // Financial info
  prime_proposee: record.originalData?.prime_proposee,
  prime_actuelle: record.originalData?.prime_actuelle,
  variation: record.originalData?.variation,
  cree_par: record.originalData?.cree_par,
  intermediaire: record.originalData?.intermediaire,
  
  document: documentList[0] || null
});

// Set uploaded document state
setUploadedDocument(documentList[0] || null);
};





const showDeleteConfirm = (id) => {
  Modal.confirm({
    title: "Confirmer la suppression",
    content: "Êtes-vous sûr de vouloir supprimer le devis?",
    okText: "Oui",
    okType: "danger",
    cancelText: "Non",
    onOk() {
      return deleteDevis(id);
    },
  });
};
// delete devis
const deleteDevis = async (id) => {
  try {
    await axios.delete(`/devis/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setDevisData(devisData.filter((item) => item.key !== id))
    setFilteredDevis(filteredDevis.filter((item) => item.key !== id));
    message.success("Devis supprimé avec succès");
  } catch (error) {
    console.error("Error deleting devis:", error);
  }
};

 


  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
          <h2 className="text-xs sm:text-sm font-semibold text-blue-800 text-center md:text-left">
            Devis ({devisData.length})
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
            <Button type="secondary" onClick={showModal} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold md:w-auto">
              <div className="flex items-center  justify-center gap-2">
                <span className="text-lg">+</span>
                <span className="text-[10px] sm:text-xs whitespace-nowrap">
                  ENREGISTRER UN DEVIS
                </span>
              </div>
            </Button>

          </div>
        </div>
        <div className="p-4 bg-white mt-6 border-t rounded-md border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Gestionaire Select */}
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Période comprise entre
              </label>
              <RangePicker
                className="w-full"
                format="DD/MM/YYYY"
                onChange={(dates) => handleFilterChange("periode", dates)}
              />
            </div>

            <div>
             <label className="block text-[12px] font-medium text-gray-700 mb-1">
               Gestionnaire
             </label>
             <Select
               className="w-full"
               placeholder="-- Choisissez --"
               onChange={(value) => handleFilterChange('gestionnaire', value)}
               loading={loading}
               showSearch
               optionFilterProp="children"
               filterOption={(input, option) =>
                 option.children.toLowerCase().includes(input.toLowerCase())
               }
               allowClear
             >
               <Option value="tous">Tous les gestionnaires</Option>
               {users.map((user) => {
                 const displayName = user.userType === "admin" 
                   ? `${user.name}`
                   : `${user.nom} ${user.prenom}`;
                 
                 return (
                   <Option 
                     key={user._id} 
                     value={user._id}  // Store the raw user ID
                   >
                     {displayName} ({user.userType === "admin" ? "Admin" : "Commercial"})
                   </Option>
                 );
               })}
             </Select>
           </div>
              {/* Commissions Select */}
              <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Type de client
              </label>
              <Select
                className="w-full"
                allowClear
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("categorie", value)}
              >
               <Option value="tous">Tous les clients</Option>
               <Option value="particulier">Particulier</Option>
               <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </div>

            {/* Risque Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Risque
              </label>
              <Select
                className="w-full"
                allowClear
                showSearch
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("risque", value)}
              >
                 {RISQUES.map(risque => (
            <Option key={risque.value} value={risque.value}>
              {risque.label}
            </Option>
          ))}
              </Select>
            </div>

          

            {/* Assureur Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Assureur
              </label>
              <Select
              allowClear
              showSearch
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("assureur", value)}
              >
                   {ASSUREURS.map(assureur => (
                <Option key={assureur.value} value={assureur.value}>
                  {assureur.label}
                </Option>
              ))}
              </Select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select
            placeholder="Filtrer par statut"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange("statut", value)}
          >
             <Option value="etude">Etude</Option>
                      <Option value="devis_envoye">Devis envoyé</Option>
                      <Option value="attente_signature">En attente signature</Option>
                      <Option value="cloture_sans_suite">
                        Devis clôturé sans suite
                      </Option>
          </Select>
            </div>

            {/* Recherche Input */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <Input
                placeholder="Rechercher..."
                allowClear
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md w-full  overflow-x-auto">
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
          dataSource={filteredDevis.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredDevis.length,
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
          bordered
          className="custom-table text-xs sm:text-sm"
          // rowSelection={rowSelection}
          tableLayout="auto"
        />
      </div>
       <Modal
              title={
                <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
                  <span className="font-medium text-sm">
                    {editingRecord ? "MODIFIER LE DEVIS" : "ENREGISTRER UN DEVIS"}
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
              width="30%"
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
                  className="w-full space-y-4" // Increased vertical spacing
                >
                  {/* === INFORMATIONS GÉNÉRALES === */}
                  <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATION</h2>
      
                  <Form.Item
                    name="courtier"
                    label="Courtier"
                    initialValue="Assurnous EAB assurances"
                    className="w-full" // Ensure full width
                  >
                    <Input
                      readOnly
                      value="Assurnous EAB assurances"
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item
  label="Client"
  name="clientId"
  rules={[{ required: true, message: 'Veuillez sélectionner un client' }]}
>
  <Select
    showSearch
    optionFilterProp="children"
    className="w-full"
    loading={clientLoading}
    onChange={handleClientChange}
    placeholder="-- Sélectionnez un client --"
    filterOption={(input, option) => {
      const children = option.children?.props?.children || '';
      return String(children).toLowerCase().includes(input.toLowerCase());
    }}
    notFoundContent={clientLoading ? "Chargement..." : "Aucun client trouvé"}
  >
    {clients.map((client) => (
      <Option key={client._id} value={client._id}>
        <div className="flex justify-between">
          <span>
            {client.nom || ''} {client.prenom && `- ${client.prenom}`}
          </span>
       
        </div>
      </Option>
    ))}
  </Select>
</Form.Item>
      
                  {/* === RISQUE ET ASSUREUR === */}
                  <Form.Item
                    name="risque"
                    label="Risque"
                    rules={[
                      { required: false, message: "Veuillez sélectionner un risque" },
                    ]}
                    className="w-full"
                  >
                    <Select
          className="w-full text-xs h-7"
          placeholder="Sélectionnez un type de risque"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {RISQUES.map(risque => (
            <Option key={risque.value} value={risque.value}>
              {risque.label}
            </Option>
          ))}
        </Select>
                  </Form.Item>
      
                  <Form.Item
                    name="assureur"
                    label="Assureur"
                    rules={[
                      {
                        required: false,
                        message: "Veuillez sélectionner un assureur",
                      },
                    ]}
                    className="w-full"
                  >
                    <Select
              showSearch
              placeholder="Sélectionnez un assureur"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              className="w-full text-xs h-7"
            >
              {ASSUREURS.map(assureur => (
                <Option key={assureur.value} value={assureur.value}>
                  {assureur.label}
                </Option>
              ))}
            </Select>
                  </Form.Item>
      
                  {/* === STATUT ET NUMERO === */}
                  <Form.Item
                    name="statut"
                    label="Statut"
                    rules={[
                      { required: false, message: "Veuillez sélectionner un statut" },
                    ]}
                    className="w-full"
                  >
                    <Select placeholder="-- Choisissez --" className="w-full">
                      <Option value="etude">Etude</Option>
                      <Option value="devis_envoye">Devis envoyé</Option>
                      <Option value="attente_signature">En attente signature</Option>
                      <Option value="cloture_sans_suite">
                        Devis clôturé sans suite
                      </Option>
                    </Select>
                  </Form.Item>
      
                  <Form.Item
                    name="numero_devis"
                    label="N° de Devis"
                    rules={[
                      {
                        required: false,
                        message: "Le numéro de devis est obligatoire",
                      },
                    ]}
                    className="w-full"
                  >
                    <Input placeholder="N° de Devis" className="w-full" />
                  </Form.Item>
      
                  {/* === DATES === */}
                  <Form.Item
                    name="date_effet"
                    label="Date d'effet"
                    className="w-full"
                  >
                    <DatePicker className="w-full"  />
                  </Form.Item>
      
                 
                  <Form.Item
                    name="date_creation"
                    label="Date de création"
                    className="w-full"
                  >
                    <DatePicker className="w-full"  />
                  </Form.Item>
                
                  <Form.Item
  label={<span className="text-xs font-medium">GESTIONNAIRE*</span>}
  name="gestionnaire"
  className="mb-0"
  rules={[{ required: true, message: 'Veuillez sélectionner un gestionnaire' }]}
>
  <Select
    className="w-full text-xs h-7"
    placeholder={loading ? "Chargement..." : "-- Choisissez un gestionnaire --"}
    loading={loading}
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) => 
      option.children.toLowerCase().includes(input.toLowerCase())
    }
    disabled={loading}
  >
             {users.map((user) => {
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
                              {user.userType === "admin" ? "Admin" : user.userType === "manager" ? "Manager" : "Commercial"})
                          </Option>
                        );
                      })}
  </Select>
</Form.Item>
                  {/* === TYPE ET CREATEUR === */}
                  <Form.Item
                    name="type_origine"
                    label="Type d'origine"
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
      
                  <Form.Item
                    label={<span className="text-xs font-medium">CRÉÉ PAR*</span>}
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
                      {users.map((user) => {
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
                              {user.userType === "admin" ? "Admin" : user.userType === "manager" ? "Manager" : "Commercial"})
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
      
                  {/* === INTERMEDIAIRE === */}
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
                      {users.map((user) => {
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
                              {user.userType === "admin" ? "Admin" : user.userType === "manager" ? "Manager" : "Commercial"})
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
      
                  {/* === PRIMES === */}
                  <h2 className="text-sm font-semibold mt-3 mb-2">LE BUDGET</h2>
                  <Form.Item
                    name="prime_proposee"
                    label="Prime TTC proposée"
                    className="w-full"
                  >
                    <InputNumber
                      className="w-full"
                      addonAfter="€"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
      
                  <Form.Item
                    name="prime_actuelle"
                    label="Prime TTC actuelle"
                    className="w-full"
                  >
                    <InputNumber
                      className="w-full"
                      addonAfter="€"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
      
                  <Form.Item name="variation" label="Variation" className="w-full">
                    <InputNumber
                      className="w-full"
                      disabled
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
      
                  {/* === DOCUMENTS === */}
                  <h2 className="text-sm font-semibold mt-3 mb-2">DOCUMENTS</h2>
      
                  <Form.Item name="document" label="Devis Document">
                    {uploadedDocument ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={uploadedDocument.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {uploadedDocument.name}
                        </a>
                        <Button
                          type="link"
                          danger
                          onClick={() => setUploadedDocument(null)}
                          size="small"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <FileUpload onUploadSuccess={setUploadedDocument} />
                    )}
                  </Form.Item>
                </Form>
                {/* <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full text-xs h-7 mt-2 mb-4"
                >
                  Enregistrer
                </Button> */}
                  <button
                    type="submit"
                    htmlType="submit"
                    disabled={loading}
                    className={`inline-block w-full py-2 mt-2 mb-2 text-white font-medium rounded-md transition ${
                      loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() => form.submit()}
                  >
                    {loading
                      ? "Enregistrement..."
                      : editingRecord
                      ? "Modifier le devis"
                      : "Enregistrer le devis"}
                  </button>
              </div>
            </Modal>
    </section>
  );
};

export default MesDevis;
