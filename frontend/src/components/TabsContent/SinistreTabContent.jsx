// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   Table,
//   Tag,
//   Space,
//   Input,
//   Select,
//   Form,
//   Modal,
//   DatePicker,
//   InputNumber,
//   message,
//   Radio,
//   Tooltip,
// } from "antd";
// import {
//   CloseOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   DownloadOutlined,
// } from "@ant-design/icons";
// import { useWatch } from "antd/es/form/Form";
// import "react-phone-input-2/lib/style.css";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import dayjs from "dayjs";
// import { ASSUREURS, RISQUES } from "../../constants";

// const { Option } = Select;

// const SinistreTabContent = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { id } = useParams();
//   const [sinistreData, setSinistreData] = useState([]);
//   const [gestionnaire, setGestionnaire] = useState(null);
//   const [uploadedDocument, setUploadedDocument] = useState(null);
//   const [pageSize, setPageSize] = useState(30);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filteredSinistre, setFilteredSinistre] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [chatData, setChatData] = useState([]);
//   const [client, setClient] = useState([]);
//   const token = localStorage.getItem("token");
//   const decodedToken = token ? jwtDecode(token) : null;
//   const currentUserId = decodedToken?.userId;
//   const userRole = decodedToken?.role;
//   const [contrats, setContrats] = useState([]);
//   const [loadingContrats, setLoadingContrats] = useState(false);
//   const sinistreExist = useWatch("sinistreExist", form);
//   const contratExist = useWatch("contratExist", form);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   useEffect(() => {
//     const fetchContrats = async () => {
//       try {
//         setLoadingContrats(true);
//         const response = await axios.get("/contrat");
//         console.log("Fetched contracts:", response.data);
//         setContrats(response.data);
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       } finally {
//         setLoadingContrats(false);
//       }
//     };

//     fetchContrats();
//   }, []);

//   const handleStatusFilter = (value) => {
//     setStatusFilter(value);

//     if (value === "all") {
//       setFilteredSinistre(sinistreData);
//     } else {
//       const filtered = sinistreData.filter((devis) => devis.statut === value);
//       setFilteredSinistre(filtered);
//     }
//   };

//   useEffect(() => {
//     const fetchClients = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const decodedToken = jwtDecode(token);
//       console.log("Decoded token:", decodedToken); // Debug token

//       const currentUserId = decodedToken?.userId;
//       const userName = decodedToken?.name;
//       const userRole = decodedToken?.role || decodedToken?.userType; // Check both possible role fields

//       try {
//         setLoading(true);
//         const response = await axios.get("/data", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const allLeads = response.data?.chatData || [];
//         setChatData(allLeads);
//       } catch (error) {
//         console.error("Error fetching leads:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClients();
//   }, [id, currentUserId, token]); // Removed userRole from dependencies

//   useEffect(() => {
//     const fetchChatData = async () => {
//       try {
//         const response = await axios.get(`/lead/${id}`);
//         const chatData = response.data.chat;
//         setClient(response.data);

//         form.setFieldsValue({
//           gestionnaire: chatData.gestionnaire, // Just store the ID directly
//           gestionnaireModel: chatData.gestionnaireModel,
//           gestionnaireName: chatData.gestionnaireName,
//         });
//       } catch (error) {
//         console.error("Error fetching chat data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatData();
//   }, [id, form, users]);

//   // const showModal = () => {
//   //   setIsModalOpen(true);
//   // };
//   const showModal = () => {
//     const token = localStorage.getItem("token");
//     const decodedToken = token ? jwtDecode(token) : null;
//     const isAdmin =
//       decodedToken?.role === "Admin" || decodedToken?.role === "admin";
//     const sessionId = decodedToken?.userId;

//     // Find the current user
//     const currentUser = users.find((user) => user._id === sessionId);
//     const gestionnaireName = currentUser
//       ? currentUser.userType === "admin"
//         ? currentUser.name
//         : `${currentUser.nom} ${currentUser.prenom}`
//       : "Non spécifié";

//     // Set default values for new sinistre
//     form.setFieldsValue({
//       gestionnaire: sessionId,
//       gestionnaireModel: isAdmin ? "Admin" : "Commercial",
//       gestionnaireName: gestionnaireName,
//     });

//     setIsModalOpen(true);
//     setEditingRecord(null); // Ensure we're in create mode
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     setEditingRecord(null);
//     setUploadedDocument(null);
//     setIsModalOpen(false);
//   };

//   const formatDevisItem = (sinistre) => ({
//     key: sinistre._id,
//     numero_sinistre: sinistre.numeroSinistre || "N/A",
//     gestionnaire: sinistre.gestionnaireName || "N/A", // Changed from gestionnaireName to gestionnaire
//     risque: sinistre.risque || "N/A",
//     assureur: sinistre.assureur || "N/A",
//     statutSinistre: sinistre.statutSinistre || "N/A",
//     typeSinistre: sinistre.typeSinistre || "N/A",
//     dateSinistre: sinistre.dateSinistre
//       ? new Date(sinistre.dateSinistre).toLocaleDateString("fr-FR")
//       : "N/A",
//     dateDeclaration: sinistre.dateDeclaration
//       ? new Date(sinistre.dateDeclaration).toLocaleDateString("fr-FR")
//       : "N/A",
//     responsabilite: sinistre.responsabilite || "N/A",
//     montantSinistre: sinistre.montantSinistre || 0,
//     delegation: sinistre.delegation || "non",
//     coordonnees_expert: sinistre.coordonnees_expert || "N/A",
//     originalData: sinistre,
//     documents: sinistre.documents || [],
//     contratId: sinistre.contratId || "N/A",
//     sinistreId: sinistre.sinistreId || "N/A",
//     gestionnaireName: sinistre.gestionnaireName || "N/A", // Keep this for the gestionnaire column
//     contratExist: sinistre.contratExist || "non",
//   });

//   const handleFormSubmit = async (values) => {
//     console.log("Form values:", values);
//     const token = localStorage.getItem("token");
//     const decodedToken = token ? jwtDecode(token) : null;
//     const isAdmin =
//       decodedToken.role === "Admin" || decodedToken.role === "admin";
//     const sessionId = decodedToken.userId;
//     const sessionModel = isAdmin ? "Admin" : "Commercial";

//     let gestionnaireModel = null;
//     if (values.gestionnaire) {
//       const selectedUser = users.find(
//         (user) => user._id === values.gestionnaire
//       );
//       gestionnaireModel =
//         selectedUser?.userType === "admin" ? "Admin" : "Commercial";
//     }

//     try {
//       // Prepare form data
//       const formData = {
//         ...values,
//         documents: uploadedDocument ? [uploadedDocument] : [],
//         numeroSinistre: values.numeroSinistre,
//         gestionnaire: values.gestionnaire || null,
//         gestionnaireModel: gestionnaireModel,
//         session: sessionId,
//         coordonnees_expert: values.coordonnees_expert,
//         sessionModel: sessionModel,
//         leadId: id, // This is the client ID
//         ...(values.sinistreExist === "oui"
//           ? {
//               sinistreId: values.sinistreId,
//             }
//           : {
//               sinistreNom: values.sinistreNom,
//               sinistrePrenom: values.sinistrePrenom,
//               sinistreInput: values.sinistreInput,
//             }),
//       };

//       let response;

//       if (editingRecord) {
//         // UPDATE
//         response = await axios.put(`/sinistres/${editingRecord._id}`, formData);

//         setSinistreData((prev) =>
//           prev.map((item) =>
//             item._id === editingRecord._id
//               ? formatDevisItem(response.data)
//               : item
//           )
//         );
//         setFilteredSinistre((prev) =>
//           prev.map((item) =>
//             item._id === editingRecord._id
//               ? formatDevisItem(response.data)
//               : item
//           )
//         );
//         message.success("Sinistre mis à jour avec succès");
//       } else {
//         // CREATE NEW SINISTRE
//         response = await axios.post("/sinistres", formData);
//         console.log("Created sinistre response:", response.data);

//         // Use the sinistre's actual _id, not leadId
//         const newSinistre = response.data;
//         const newItem = formatDevisItem(newSinistre);

//         // Update state with the new sinistre
//         setSinistreData((prev) => [newItem, ...prev]);
//         setFilteredSinistre((prev) => [newItem, ...prev]);

//         console.log(
//           "New sinistre ID for future GET requests:",
//           newSinistre._id
//         );
//         message.success("Sinistre ajouté avec succès");
//       }

//       form.resetFields();
//       setIsModalOpen(false);
//       setEditingRecord(null);
//       setUploadedDocument(null);
//       setRefreshTrigger((prev) => prev + 1);
//     } catch (error) {
//       console.error("Error saving sinistre:", error);
//       message.error("Erreur lors de la sauvegarde du sinistre");
//     }
//   };

//   // useEffect(() => {
//   //   const fetchSinistresForLead = async () => {
//   //     const token = localStorage.getItem("token");
//   //     if (!token || !id) return;

//   //     const decodedToken = jwtDecode(token);
//   //     const currentUserId = decodedToken?.userId;
//   //     const userRole = decodedToken?.role;

//   //     setLoading(true);
//   //     try {
//   //       const response = await axios.get(`/sinistres/${id}`, {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "X-User-ID": currentUserId,
//   //           "X-User-Role": userRole,
//   //         },
//   //       });

//   //       console.log("Raw sinistres data:", response.data);

//   //       if (response.data.success && response.data.data) {
//   //         // Handle both array and single object responses
//   //         let sinistresArray;

//   //         if (Array.isArray(response.data.data)) {
//   //           // If data is already an array
//   //           sinistresArray = response.data.data;
//   //         } else {
//   //           // If data is a single object, wrap it in an array
//   //           sinistresArray = [response.data.data];
//   //         }

//   //         console.log(`Processing ${sinistresArray.length} sinistre(s)`);

//   //         // Format the data properly
//   //         const formattedData = sinistresArray.map((sinistre) => {
//   //           const contratNumber =
//   //             sinistre.contratId && sinistre.contratId.contractNumber
//   //               ? sinistre.contratId.contractNumber
//   //               : "N/A";
//   //           return {
//   //             key: sinistre._id,
//   //             numero_sinistre: sinistre.numeroSinistre || "N/A",
//   //             gestionnaire:
//   //               sinistre.gestionnaireName ||
//   //               (sinistre.gestionnaire
//   //                 ? `${sinistre.gestionnaire.nom || ""} ${
//   //                     sinistre.gestionnaire.prenom || ""
//   //                   }`.trim()
//   //                 : "N/A"),
//   //             risque: sinistre.risque || "N/A",
//   //             // contratNumber: contratNumber,
//   //             assureur: sinistre.assureur || "N/A",
//   //             statutSinistre: sinistre.statutSinistre || "N/A",
//   //             typeSinistre: sinistre.typeSinistre || "N/A",
//   //             dateSinistre: sinistre.dateSinistre
//   //               ? new Date(sinistre.dateSinistre).toLocaleDateString("fr-FR")
//   //               : "N/A",
//   //             dateDeclaration: sinistre.dateDeclaration
//   //               ? new Date(sinistre.dateDeclaration).toLocaleDateString("fr-FR")
//   //               : "N/A",
//   //             responsabilite: sinistre.responsabilite || "N/A",
//   //             montantSinistre: sinistre.montantSinistre || 0,
//   //             delegation: sinistre.delegation || "non",
//   //             coordonnees_expert: sinistre.coordonnees_expert || "N/A",
//   //             originalData: sinistre,
//   //             documents: sinistre.documents || [],
//   //             contratId: sinistre.contratId ? sinistre.contratId._id : "N/A",
//   //             sinistreId: sinistre.sinistreId || "N/A",
//   //             gestionnaireName: sinistre.gestionnaireName || "N/A",
//   //             contratExist: sinistre.contratExist || "non",
//   //             contratNumber: sinistre.contratNumber,
//   //           };
//   //         });

//   //         console.log("Formatted sinistres data:", formattedData);
//   //         setSinistreData(formattedData);
//   //         setFilteredSinistre(formattedData);
//   //       } else {
//   //         console.log("No sinistres data found");
//   //         setSinistreData([]);
//   //         setFilteredSinistre([]);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching sinistres:", error);

//   //       // Handle different error scenarios
//   //       if (error.response?.status === 404) {
//   //         console.log("No sinistres found for this lead");
//   //         setSinistreData([]);
//   //         setFilteredSinistre([]);
//   //       } else {
//   //         // For other errors, set empty arrays
//   //         setSinistreData([]);
//   //         setFilteredSinistre([]);
//   //       }
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchSinistresForLead();
//   // }, [id, refreshTrigger]);
//   useEffect(() => {
//     const fetchSinistresForLead = async () => {
//       const token = localStorage.getItem("token");
//       if (!token || !id) return;
      
//       setLoading(true);
//       try {
//         // Use the new endpoint to get ALL sinistres
//         const response = await axios.get(`/sinistres/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
  
//         console.log("All sinistres for lead:", response.data);
        
//         if (response.data.success && Array.isArray(response.data.data)) {
//           const sinistresArray = response.data.data;
          
//           console.log(`Processing ${sinistresArray.length} sinistre(s)`);
  
//           // const formattedData = sinistresArray.map(sinistre => {
//           //   // Extract contract number from contratId object
//           //   const contratNumber = sinistre.contratId && sinistre.contratId.contractNumber 
//           //     ? sinistre.contratId.contractNumber 
//           //     : (sinistre.contratNumber || "N/A");
  
//           //   return {
//           //     key: sinistre._id,
//           //     numero_sinistre: sinistre.numeroSinistre || "N/A",
//           //     gestionnaire: sinistre.gestionnaireName || 
//           //                  (sinistre.gestionnaire ? 
//           //                    `${sinistre.gestionnaire.nom || ''} ${sinistre.gestionnaire.prenom || ''}`.trim() 
//           //                    : "N/A"),
//           //     risque: sinistre.risque || "N/A",
//           //     contratNumber: contratNumber,
//           //     assureur: sinistre.assureur || "N/A",
//           //     statutSinistre: sinistre.statutSinistre || "N/A",
//           //     typeSinistre: sinistre.typeSinistre || "N/A",
//           //     dateSinistre: sinistre.dateSinistre 
//           //       ? new Date(sinistre.dateSinistre).toLocaleDateString('fr-FR') 
//           //       : "N/A",
//           //     dateDeclaration: sinistre.dateDeclaration
//           //       ? new Date(sinistre.dateDeclaration).toLocaleDateString('fr-FR')
//           //       : "N/A",
//           //     responsabilite: sinistre.responsabilite || "N/A",
//           //     montantSinistre: sinistre.montantSinistre || 0,
//           //     delegation: sinistre.delegation || "non",
//           //     coordonnees_expert: sinistre.coordonnees_expert || "N/A",
//           //     originalData: sinistre,
//           //     documents: sinistre.documents || [],
//           //     contratId: sinistre.contratId ? sinistre.contratId._id : "N/A",
//           //     sinistreId: sinistre.sinistreId || "N/A",
//           //     gestionnaireName: sinistre.gestionnaireName || "N/A",
//           //     contratExist: sinistre.contratExist || "non",
//           //     sinistreExist: sinistre.sinistreExist || "non",
//           //     sinistreNom: sinistre.sinistreNom || "N/A",
//           //     sinistrePrenom: sinistre.sinistrePrenom || "N/A",
//           //     sinistreInput: sinistre.sinistreInput || "N/A",
//           //   };
//           // });
//           const formattedData = sinistresArray.map(sinistre => {
//             // CORRECTED: Extract contract number based on contratExist condition
//             let contratNumber = "N/A";
            
//             // if (sinistre.contratExist === "oui") {
//             //   // Contract exists in CRM - get from populated contratId
//             //   contratNumber = sinistre.contratId && sinistre.contratId.contractNumber 
//             //     ? sinistre.contratId.contractNumber 
//             //     : "N/A";
//             // } else if (sinistre.contratExist === "non") {
//             //   // Contract doesn't exist in CRM - get from direct field
//             //   contratNumber = sinistre.sinistreInput || "N/A";
//             // }
//             if (sinistre.contratExist === "oui") {
//               // Contract exists in CRM - get from populated contratId
//               contratNumber = sinistre.contratId && sinistre.contratId.contractNumber 
//                 ? sinistre.contratId.contractNumber 
//                 : "N/A";
//             } else if (sinistre.contratExist === "non") {
//               // Contract doesn't exist in CRM - get from direct field
//               contratNumber = sinistre.contratNumber || "N/A";
//             }
            
//             // SPECIAL CASE: When sinistreExist === "non", check sinistreInput for contract number
//             if (sinistre.sinistreExist === "non" && (contratNumber === "N/A" || !contratNumber)) {
//               contratNumber = sinistre.sinistreInput || "N/A";
//             }

      
          
//             return {
//               key: sinistre._id,
//               numero_sinistre: sinistre.numeroSinistre || "N/A",
//                     gestionnaire: sinistre.gestionnaireName || 
//                     (sinistre.gestionnaire ? 
//                       `${sinistre.gestionnaire.nom || ''} ${sinistre.gestionnaire.prenom || ''}`.trim() 
//                       : "N/A"),
//               risque: sinistre.risque || "N/A",
//               contratNumber: contratNumber,
//               assureur: sinistre.assureur || "N/A",
//               statutSinistre: sinistre.statutSinistre || "N/A",
//               typeSinistre: sinistre.typeSinistre || "N/A",
//               dateSinistre: sinistre.dateSinistre 
//                 ? new Date(sinistre.dateSinistre).toLocaleDateString('fr-FR') 
//                 : "N/A",
//               dateDeclaration: sinistre.dateDeclaration
//                 ? new Date(sinistre.dateDeclaration).toLocaleDateString('fr-FR')
//                 : "N/A",
//               responsabilite: sinistre.responsabilite || "N/A",
//               montantSinistre: sinistre.montantSinistre || 0,
//               delegation: sinistre.delegation || "non",
//               coordonnees_expert: sinistre.coordonnees_expert || "N/A",
//               originalData: sinistre,
//               documents: sinistre.documents || [],
//               contratId: sinistre.contratId ? sinistre.contratId._id : null,
//               sinistreId: sinistre.sinistreId || null,
//               gestionnaireName: sinistre.gestionnaireName || "N/A",
//               contratExist: sinistre.contratExist || "non",
//               sinistreExist: sinistre.sinistreExist || "non",
//               sinistreNom: sinistre.sinistreNom || "N/A",
//               sinistrePrenom: sinistre.sinistrePrenom || "N/A",
//               sinistreInput: sinistre.sinistreInput || "N/A"
//             };
//           });
//           console.log("Formatted sinistres data:", formattedData);
//           setSinistreData(formattedData);
//           setFilteredSinistre(formattedData);
//         } else {
//           console.log("No sinistres data found");
//           setSinistreData([]);
//           setFilteredSinistre([]);
//         }
  
//       } catch (error) {
//         console.error("Error fetching sinistres:", error);
//         setSinistreData([]);
//         setFilteredSinistre([]);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchSinistresForLead();
//   }, [id, refreshTrigger]);
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // Fetch both admins and commercials
//         const [adminsRes, commercialsRes] = await Promise.all([
//           axios.get("/admin"),
//           axios.get("/commercials"),
//         ]);

//         // Combine and format the data
//         const combinedUsers = [
//           ...adminsRes.data.map((admin) => ({
//             ...admin,
//             userType: "admin",
//           })),
//           ...commercialsRes.data.map((commercial) => ({
//             ...commercial,
//             userType: "commercial",
//           })),
//         ];

//         setUsers(combinedUsers);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const columns = [
//     {
//       title: "N° sinistre",
//       dataIndex: "numero_sinistre",
//       key: "numero_sinistre",
//     },

//     // {
//     //   title: "N° contrat",
//     //   dataIndex: "contratNumber", // Use the new contratNumber field
//     //   key: "contratNumber",
//     //   render: (contratNumber, record) => {
//     //     if (record.originalData.contratExist === "oui") {
//     //       return contratNumber || "N/A";
//     //     } else {
//     //       return record.originalData.sinistreInput || "N/A";
//     //     }
//     //   },
//     // },
//     // {
//     //   title: "N° contrat",
//     //   dataIndex: "contratNumber",
//     //   key: "contratNumber",
//     //   render: (contratNumber, record) => {
//     //     if (record.originalData.contratExist === "oui") {
//     //       return contratNumber || "N/A";
//     //     } 
//     //   },
//     // },
//     {
//       title: "N° contrat",
//       dataIndex: "contratNumber",
//       key: "contratNumber",
//       render: (contratNumber, record) => {
//         const { contratExist } = record.originalData;
        
//         if (contratExist === "oui") {
//           // Show contract number from CRM
//           return (
//             <Tag color="green">
//               {contratNumber || "N/A"}
//             </Tag>
//           );
//         } else if (contratExist === "non") {
//           // Show manually entered contract number
//           return (
//             <Tag color="orange">
//               {contratNumber || "Non applicable"}
//             </Tag>
//           );
//         } else if (record.originalData.sinistreExist === "non") {
//           return (
//             <Tag color="orange">
//               {contratNumber || "Non renseigné"}
//             </Tag>
//           );
//         }
//       },
//     },
//     {
//       title: "Assureur",
//       dataIndex: "assureur",
//       key: "assureur",
//     },
//     {
//       title: "Date sinistre",
//       dataIndex: "dateSinistre", // Already formatted as string
//       key: "dateSinistre",
//     },
//     {
//       title: "Date déclaration",
//       dataIndex: "dateDeclaration", // Already formatted as string
//       key: "dateDeclaration",
//     },
//     {
//       title: "Statut",
//       dataIndex: "statutSinistre",
//       key: "statutSinistre",
//       render: (status) => {
//         const statusMap = {
//           en_cours: "En cours",
//           clo: "Clôturé",
//           reouvert: "Réouvert",
//         };
//         return statusMap[status] || status;
//       },
//       filters: [
//         { text: "En cours", value: "en_cours" },
//         { text: "Clôturé", value: "clo" },
//         { text: "Réouvert", value: "reouvert" },
//       ],
//       onFilter: (value, record) => record.statutSinistre === value,
//     },
//     {
//       title: "Type",
//       dataIndex: "typeSinistre",
//       key: "typeSinistre",
//       render: (type) => {
//         const typeMap = {
//           dommage_corporel: "Dommage corporel",
//           dommage_materiel: "Dommage matériel",
//           dommage_corporel_matériel: "Dommage corporel et matériel",
//         };
//         return typeMap[type] || type;
//       },
//     },
//     {
//       title: "Responsabilité",
//       dataIndex: "responsabilite",
//       key: "responsabilite",
//     },
//     {
//       title: "Montant",
//       dataIndex: "montantSinistre",
//       key: "montantSinistre",
//       render: (amount) => (amount ? `${amount.toLocaleString()} €` : "N/A"),
//       sorter: (a, b) => (a.montantSinistre || 0) - (b.montantSinistre || 0),
//     },
//     {
//       title: "Délégation",
//       dataIndex: "delegation",
//       key: "delegation",
//       render: (delegation) => (delegation === "oui" ? "Oui" : "Non"),
//       filters: [
//         { text: "Oui", value: "oui" },
//         { text: "Non", value: "non" },
//       ],
//       onFilter: (value, record) => record.delegation === value,
//     },
//     {
//       title: "Risque",
//       dataIndex: "risque",
//       key: "risque",
//     },
//     {
//       title: "Gestionnaire",
//       dataIndex: "gestionnaire",
//       key: "gestionnaire",
//       render: (gestionnaire, record) => <>{gestionnaire || "N/A"}</>,
//     },
//     {
//       title: "Actions",
//       key: "action",
//       render: (_, record) => (
//         <Space size="middle">
//           <Tooltip title="Modifier">
//             <Button
//               type="text"
//               icon={<EditOutlined />}
//               onClick={() => handleEdit(record)}
//             />
//           </Tooltip>
//           <Tooltip title="Supprimer">
//             <Button
//               type="text"
//               danger
//               icon={<DeleteOutlined />}
//               onClick={() => showDeleteConfirm(record)}
//             />
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];
//   // const handleEdit = async (record) => {
//   //   console.log("Editing record:", record);
//   //   setEditingRecord(record);
//   //   setIsModalOpen(true);

//   //   // Reset form first
//   //   form.resetFields();

//   //   // Prepare base form values
//   //   const formValues = {
//   //     // Information section
//   //     numeroSinistre: record.numeroSinistre || record.numero_sinistre || "",

//   //     // Sinistre section
//   //     sinistreExist: record.sinistreExist || "non",

//   //     // Contract section
//   //     contratExist: record.contratExist || "non",

//   //     // Details
//   //     risque: record.risque || "",
//   //     assureur: record.assureur || "",

//   //     // Détail du sinistre
//   //     dateSinistre: record.dateSinistre ? dayjs(record.dateSinistre, 'DD/MM/YYYY') : null,
//   //     dateDeclaration: record.dateDeclaration ? dayjs(record.dateDeclaration, 'DD/MM/YYYY') : null,
//   //     statutSinistre: record.statutSinistre || "en_cours",
//   //     typeSinistre: record.typeSinistre || "",
//   //     responsabilite: record.responsabilite || "",
//   //     montantSinistre: record.montantSinistre || 0,
//   //     delegation: record.delegation || "non",
//   //     expert: record.expert || "",
//   //     coordonnees_expert: record.coordonnees_expert || "",

//   //     // Handle both sinistreId and leadId cases
//   //     sinistreId: record.sinistreId || (record.leadId?._id || record.leadId) || null,

//   //     // Gestionnaire handling
//   //     gestionnaire: record.gestionnaireName ||
//   //                 (record.session?.name || "") ||
//   //                 (record.gestionnaire ? JSON.parse(record.gestionnaire).id : "")
//   //   };

//   //   // Handle sinistre information based on sinistreExist
//   //   if (record.sinistreExist === "oui") {
//   //     const clientId = record.sinistreId || record.leadId?._id || record.leadId;
//   //     const matchingClient = chatData.find(client => client._id === clientId);

//   //     if (matchingClient) {
//   //       formValues.sinistreSelect = matchingClient._id;
//   //     } else if (record.leadId) {
//   //       formValues.sinistreSelect = record.leadId._id;
//   //     }
//   //   } else {
//   //     formValues.sinistreNom = record.leadId?.nom || "";
//   //     formValues.sinistrePrenom = record.leadId?.prenom || "";
//   //   }

//   //   if (record.contratExist === "oui") {
//   //     const matchingContrat = contrats.find(contrat => contrat._id === record.contratId);
//   //     if (matchingContrat) {
//   //       formValues.contratId = matchingContrat._id;  // Changed from contratSelect to contratId
//   //     } else if (record.contratDetails) {
//   //       formValues.contratId = record.contratDetails._id;  // Changed from contratSelect to contratId
//   //     }
//   //   }

//   //   console.log("Form values to be set:", formValues);

//   //   // Set form values without delay
//   //   requestAnimationFrame(() => {
//   //     try {
//   //       form.setFieldsValue(formValues);
//   //       console.log("Form values after setting:", form.getFieldsValue());
//   //     } catch (error) {
//   //       console.error("Error setting form values:", error);
//   //     }
//   //   });
//   // };
//   const handleEdit = (record) => {
//     console.log("Editing record:", record);

//     // Extract the gestionnaire name from the record
//     const gestionnaireName =
//       record.originalData.gestionnaireName ||
//       (record.originalData.gestionnaire
//         ? `${record.originalData.gestionnaire.nom || ""} ${
//             record.originalData.gestionnaire.prenom || ""
//           }`.trim()
//         : "Non spécifié");

//     console.log("Extracted gestionnaireName:", gestionnaireName);

//     // Set form values
//     form.setFieldsValue({
//       ...record.originalData,
//       dateSinistre: record.originalData.dateSinistre
//         ? dayjs(record.originalData.dateSinistre)
//         : null,
//       dateDeclaration: record.originalData.dateDeclaration
//         ? dayjs(record.originalData.dateDeclaration)
//         : null,
//       // Sinistre section
//       sinistreExist: record.sinistreExist || "non",

//       // Contract section
//       contratExist: record.contratExist || "non",
//       gestionnaire:
//         record.originalData.gestionnaire?._id ||
//         record.originalData.gestionnaire,
//       gestionnaireModel: record.originalData.gestionnaireModel || "Commercial",
//       gestionnaireName: gestionnaireName,
//     });

//     setEditingRecord(record.originalData);
//     setIsModalOpen(true);
//   };
//   useEffect(() => {
//     if (isModalOpen) {
//       const interval = setInterval(() => {
//         console.log("Current form values:", form.getFieldsValue());
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [isModalOpen, form]);

//   const showDeleteConfirm = (record) => {
//     Modal.confirm({
//       title: "Confirmer la suppression",
//       content: "Êtes-vous sûr de vouloir supprimer le sinistre?",
//       okText: "Oui",
//       okType: "danger",
//       cancelText: "Non",
//       onOk() {
//         return deleteDevis(record.key || record._id || record.id); // Use the correct ID property
//       },
//     });
//   };

//   const deleteDevis = async (id) => {
//     try {
//       await axios.delete(`/sinistres/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setSinistreData(sinistreData.filter((item) => item.key !== id));
//       setFilteredSinistre(filteredSinistre.filter((item) => item.key !== id));
//       message.success("Sinistre supprimé avec succès");
//     } catch (error) {
//       console.error("Error deleting Sinistre:", error);
//     }
//   };

//   return (
//     <div className="p-2">
//       <div className="flex justify-between mb-4">
//         <div>
//           <Button type="primary" className="bg-blue-600" onClick={showModal}>
//             Enregistrer un sinistre
//           </Button>
//         </div>
//         <div className="flex space-x-2">
//           <Select
//             placeholder="Filtrer par statut"
//             allowClear
//             style={{ width: 200 }}
//             value={statusFilter}
//             onChange={handleStatusFilter}
//           >
//             <Option value="all">Tous les statuts</Option>
//             <Option value="tous">Tous</Option>
//             <Option value="en_cours">En cours</Option>
//             <Option value="clo">Clos</Option>
//             <Option value="reouvert">Réouvert</Option>
//           </Select>
//         </div>
//       </div>

//       <Table
//         columns={[
//           ...columns.map((col) => ({
//             ...col,
//             title: (
//               <div className="flex flex-col items-center">
//                 <div className="text-xs">{col.title}</div>
//               </div>
//             ),
//           })),
//         ]}
//         dataSource={filteredSinistre.slice(
//           (currentPage - 1) * pageSize,
//           currentPage * pageSize
//         )}
//         loading={loading}
//         bordered
//         // pagination={{ pageSize: 10 }}
//         pagination={{
//           current: currentPage,
//           pageSize,
//           total: filteredSinistre.length,
//           // onChange: (page) => setCurrentPage(page),
//           onChange: (page, pageSize) => {
//             setCurrentPage(page);
//             setPageSize(pageSize);
//           },
//           showSizeChanger: true,
//           pageSizeOptions: ["10", "20", "30", "50", "100"],
//           showTotal: (total, range) =>
//             `${range[0]}-${range[1]} of ${total} items`,
//         }}
//         onRow={(record) => ({
//           onClick: (e) => {
//             // Check if the click was on an action button
//             if (e.target.closest('.ant-btn, .ant-space, .ant-tooltip')) {
//               return; // Don't navigate if clicking on actions
//             }
//             window.location.href = `/Sinistres/${record.originalData._id}`;
//           },
//           style: { 
//             cursor: 'pointer',
//             transition: 'background-color 0.2s'
//           },
//           onMouseEnter: (e) => {
//             e.currentTarget.style.backgroundColor = '#f5f5f5';
//           },
//           onMouseLeave: (e) => {
//             e.currentTarget.style.backgroundColor = '';
//           },
//         })}
//         scroll={{ x: "max-content" }}
//         rowKey={(record) => record._id}
//       />

//       <Modal
//         title={
//           <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
//             <span className="font-medium text-sm">
//               {editingRecord
//                 ? "MODIFIER LE SINISTRE"
//                 : "ENREGISTRER UN SINISTRE"}
//             </span>
//             <button
//               onClick={handleCancel}
//               className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
//             >
//               <CloseOutlined className="text-xs" />
//             </button>
//           </div>
//         }
//         open={isModalOpen}
//         onCancel={handleCancel}
//         footer={null}
//         width="30%"
//         style={{
//           position: "fixed",
//           right: 0,
//           top: 0,
//           bottom: 0,
//           height: "100vh",
//           margin: 0,
//           padding: 0,
//           overflow: "hidden",
//         }}
//         bodyStyle={{
//           height: "calc(100vh - 49px)",
//           padding: 0,
//           margin: 0,
//         }}
//         maskStyle={{
//           backgroundColor: "rgba(0, 0, 0, 0.1)",
//         }}
//         closeIcon={null}
//       >
//         <div
//           className="h-full overflow-y-auto ml-4 w-full"
//           style={{ scrollbarWidth: "thin" }}
//         >
//           <Form
//             form={form}
//             onFinish={handleFormSubmit}
//             layout="vertical"
//             className="w-full space-y-4"
//             initialValues={{
//               gestionnaire: gestionnaire?._id || gestionnaire || null,
//             }}
//           >
//             {/* === INFORMATIONS === */}
//             <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATIONS</h2>

//             <Form.Item
//               name="numeroSinistre"
//               label="N° du sinistre"
//               rules={[{ required: false, message: "Ce champ est obligatoire" }]}
//               className="w-full"
//             >
//               <Input placeholder="N° du sinistre" className="w-full" />
//             </Form.Item>

//             {/* LE SINISTRE */}
//             <h2 className="text-sm font-semibold mt-16 mb-4">LE SINISTRE</h2>

//             <Form.Item
//               label="Le sinistré existe-t-il dans votre CRM ?"
//               name="sinistreExist"
//               rules={[{ required: false, message: "Ce champ est obligatoire" }]}
//             >
//               <Radio.Group>
//                 <Radio value="oui">Oui</Radio>
//                 <Radio value="non">Non</Radio>
//               </Radio.Group>
//             </Form.Item>

//             {/* If "oui" show Select */}
//             {/* If sinistré exists (oui) - show client select */}
//             {sinistreExist === "oui" && (
//               <Form.Item
//                 label="Sinistré"
//                 name="sinistreId"
//                 rules={[
//                   { required: false, message: "Ce champ est obligatoire" },
//                 ]}
//               >
//                 <Select
//                   showSearch
//                   optionFilterProp="children"
//                   placeholder="-- Choisissez un sinistré --"
//                   loading={loadingClients}
//                   filterOption={(input, option) =>
//                     option.children.toLowerCase().includes(input.toLowerCase())
//                   }
//                 >
//                   {chatData.map((client) => (
//                     <Option key={client._id} value={client._id}>
//                       {client.nom} {client.prenom}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             )}

//             {/* If sinistré doesn't exist (non) - show manual entry fields */}
//             {sinistreExist === "non" && (
//               <>
//                 <Form.Item
//                   label="Nom du sinistré"
//                   name="sinistreNom"
//                   rules={[
//                     {
//                       required: false,
//                       message: "Le champ nom du sinistré est obligatoire",
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Entrez le nom du sinistré" />
//                 </Form.Item>

//                 <Form.Item
//                   label="Prénom du sinistré"
//                   name="sinistrePrenom"
//                   rules={[
//                     {
//                       required: false,
//                       message: "Le champ prénom du sinistré est obligatoire",
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Entrez le prénom du sinistré" />
//                 </Form.Item>
//                 <Form.Item
//                   label="Numéro de contrat"
//                   name="sinistreInput"
//                   rules={[
//                     {
//                       required: false,
//                       message: "Le champ numéro de sinistre est obligatoire",
//                     },
//                   ]}
//                 >
//                   <Input placeholder="Entrez le numéro de sinistre" />
//                 </Form.Item>
//               </>
//             )}

//             {/* Only show contract section if sinistré exists (oui) */}
//             {sinistreExist === "oui" && (
//               <>
//                 {/* Contract Existence Toggle */}
//                 <Form.Item
//                   label="Le contrat existe-t-il dans votre CRM ?"
//                   name="contratExist"
//                   rules={[
//                     { required: false, message: "Ce champ est obligatoire" },
//                   ]}
//                 >
//                   <Radio.Group>
//                     <Radio value="oui">Oui</Radio>
//                     <Radio value="non">Non</Radio>
//                   </Radio.Group>
//                 </Form.Item>

//                 {/* If contract exists (oui) - show contract select */}
//                 {contratExist === "oui" && (
//                   <Form.Item
//                     label="Contrat"
//                     name="contratId"
//                     rules={[
//                       {
//                         required: false,
//                         message: "Le champ contrat est obligatoire",
//                       },
//                     ]}
//                   >
//                     <Select
//                       placeholder={
//                         loadingContrats
//                           ? "Chargement..."
//                           : "-- Choisissez un contrat --"
//                       }
//                       loading={loadingContrats}
//                       showSearch
//                       optionFilterProp="children"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                     >
//                       {contrats.map((contrat) => (
//                         <Option key={contrat._id} value={contrat._id}>
//                           {contrat.contractNumber} - {contrat.insurer}
//                         </Option>
//                       ))}
//                     </Select>
//                   </Form.Item>
//                 )}

//                 {/* If contract doesn't exist (non) - show manual entry */}
//                 {contratExist === "non" && (
//                   <Form.Item
//                     label="Numéro de contrat"
//                     name="contratNumber"
//                     rules={[
//                       {
//                         required: false,
//                         message: "Le champ numéro de contrat est obligatoire",
//                       },
//                     ]}
//                   >
//                     <Input placeholder="Entrez le numéro de contrat" />
//                   </Form.Item>
//                 )}
//               </>
//             )}

//             <Form.Item name="risque" label="Risque" className="w-full">
//               <Select placeholder="-- Choisissez --" className="w-full">
//                 {RISQUES.map((risque) => (
//                   <Option key={risque.value} value={risque.value}>
//                     {risque.label}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>

//             <Form.Item name="assureur" label="Assureur" className="w-full">
//               <Select placeholder="-- Choisissez --" className="w-full">
//                 {ASSUREURS.map((assureur) => (
//                   <Option key={assureur.value} value={assureur.value}>
//                     {assureur.label}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>

//             {/* === DÉTAIL DU SINISTRE === */}
//             <h2 className="text-sm font-semibold mt-3 mb-2">
//               DÉTAIL DU SINISTRE
//             </h2>

//             <Form.Item
//               name="dateSinistre"
//               label="Date du sinistre"
//               className="w-full"
//             >
//               <DatePicker className="w-full" />
//             </Form.Item>

//             <Form.Item
//               name="dateDeclaration"
//               label="Date de déclaration *"
//               className="w-full"
//             >
//               <DatePicker className="w-full" />
//             </Form.Item>

//             <Form.Item
//               name="statutSinistre"
//               label="Statut du sinistre"
//               className="w-full"
//             >
//               <Select placeholder="-- Choisissez --" className="w-full">
//                 <Option value="en_cours">En cours</Option>
//                 <Option value="clo">Clos</Option>
//                 <Option value="reouvert">Réouvert</Option>
//               </Select>
//             </Form.Item>

//             <Form.Item
//               name="typeSinistre"
//               label="Type de sinistre"
//               className="w-full"
//             >
//               <Select placeholder="-- Choisissez --" className="w-full">
//                 <Option value="dommage_corporel">Dommage corporel</Option>
//                 <Option value="dommage_materiel">Dommage matériel</Option>
//                 <Option value="dommage_corporel_matériel">
//                   Dommage corporel et matériel
//                 </Option>
//               </Select>
//             </Form.Item>

//             <Form.Item
//               name="responsabilite"
//               label="Responsabilité"
//               className="w-full"
//             >
//               <Input placeholder="Responsabilité" className="w-full" />
//             </Form.Item>

//             <Form.Item
//               name="montantSinistre"
//               label="Montant du sinistre"
//               className="w-full"
//             >
//               <InputNumber
//                 className="w-full"
//                 addonAfter="€"
//                 style={{ width: "100%" }}
//               />
//             </Form.Item>

//             <Form.Item
//               name="delegation"
//               label="Sinistre en délégation *"
//               className="w-full"
//             >
//               <Radio.Group>
//                 <Radio value="oui">Oui</Radio>
//                 <Radio value="non">Non</Radio>
//               </Radio.Group>
//             </Form.Item>

//             <Form.Item
//               name="coordonnees_expert"
//               label="Coordonnées de l'expert"
//               className="w-full"
//             >
//               <Input.TextArea
//                 placeholder="Coordonnées de l'expert"
//                 className="w-full"
//               />
//             </Form.Item>

//             <Form.Item
//               label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
//               className="mb-0"
//             >
//               <Input
//                 className="w-full text-xs h-7"
//                 value={form.getFieldValue("gestionnaireName") || "Non spécifié"}
//                 disabled
//               />
//             </Form.Item>

//             {/* Hidden fields for actual form submission */}
//             <Form.Item name="gestionnaire" noStyle>
//               <Input type="hidden" />
//             </Form.Item>
//             <Form.Item name="gestionnaireModel" noStyle>
//               <Input type="hidden" />
//             </Form.Item>
//             <Form.Item name="gestionnaireName" noStyle>
//               <Input type="hidden" />
//             </Form.Item>
//           </Form>

//           <button
//             type="submit"
//             htmlType="submit"
//             disabled={loading}
//             className={`inline-block w-full py-2 mt-2 mb-2 text-white font-medium rounded-md transition ${
//               loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//             onClick={() => form.submit()}
//           >
//             {loading
//               ? "Enregistrement..."
//               : editingRecord
//               ? "Modifier le sinistre"
//               : "Enregistrer le sinistre"}
//           </button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default SinistreTabContent;
import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Form,
  Modal,
  DatePicker,
  InputNumber,
  message,
  Radio,
  Tooltip,
  Tabs,
  Upload,
  Popconfirm,
  List,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  PlusOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { ASSUREURS, RISQUES } from "../../constants";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SinistreTabContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [sinistreData, setSinistreData] = useState([]);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredSinistre, setFilteredSinistre] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [client, setClient] = useState([]);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;
  const [contrats, setContrats] = useState([]);
  const [loadingContrats, setLoadingContrats] = useState(false);
  const sinistreExist = useWatch("sinistreExist", form);
  const contratExist = useWatch("contratExist", form);
  const [loadingClients, setLoadingClients] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Document states
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState("sinistres");
  // Ajouter cet état près des autres states
const [selectedSinistreId, setSelectedSinistreId] = useState(null);
const [sinistreFilter, setSinistreFilter] = useState("all");
const [filteredDocuments, setFilteredDocuments] = useState([]);


// Fonction pour filtrer les documents par sinistre
const handleSinistreFilter = (value) => {
  setSinistreFilter(value);
  
  if (value === "all") {
    setFilteredDocuments(documents);
  } else {
    const filtered = documents.filter((doc) => doc.sinistreId === value);
    setFilteredDocuments(filtered);
  }
};

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        setLoadingContrats(true);
        const response = await axios.get("/contrat");
        console.log("Fetched contracts:", response.data);
        setContrats(response.data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoadingContrats(false);
      }
    };

    fetchContrats();
  }, []);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);

    if (value === "all") {
      setFilteredSinistre(sinistreData);
    } else {
      const filtered = sinistreData.filter((devis) => devis.statut === value);
      setFilteredSinistre(filtered);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);

      const currentUserId = decodedToken?.userId;
      const userName = decodedToken?.name;
      const userRole = decodedToken?.role || decodedToken?.userType;

      try {
        setLoading(true);
        const response = await axios.get("/data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allLeads = response.data?.chatData || [];
        setChatData(allLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [id, currentUserId, token]);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await axios.get(`/lead/${id}`);
        const chatData = response.data.chat;
        setClient(response.data);

        form.setFieldsValue({
          gestionnaire: chatData.gestionnaire,
          gestionnaireModel: chatData.gestionnaireModel,
          gestionnaireName: chatData.gestionnaireName,
        });
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, form, users]);

  const showModal = () => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const isAdmin =
      decodedToken?.role === "Admin" || decodedToken?.role === "admin";
    const sessionId = decodedToken?.userId;

    const currentUser = users.find((user) => user._id === sessionId);
    const gestionnaireName = currentUser
      ? currentUser.userType === "admin"
        ? currentUser.name
        : `${currentUser.nom} ${currentUser.prenom}`
      : "Non spécifié";

    form.setFieldsValue({
      gestionnaire: sessionId,
      gestionnaireModel: isAdmin ? "Admin" : "Commercial",
      gestionnaireName: gestionnaireName,
    });

    setIsModalOpen(true);
    setEditingRecord(null);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingRecord(null);
    setUploadedDocument(null);
    setIsModalOpen(false);
  };

  const formatDevisItem = (sinistre) => ({
    key: sinistre._id,
    numero_sinistre: sinistre.numeroSinistre || "N/A",
    gestionnaire: sinistre.gestionnaireName || "N/A",
    risque: sinistre.risque || "N/A",
    assureur: sinistre.assureur || "N/A",
    statutSinistre: sinistre.statutSinistre || "N/A",
    typeSinistre: sinistre.typeSinistre || "N/A",
    dateSinistre: sinistre.dateSinistre
      ? new Date(sinistre.dateSinistre).toLocaleDateString("fr-FR")
      : "N/A",
    dateDeclaration: sinistre.dateDeclaration
      ? new Date(sinistre.dateDeclaration).toLocaleDateString("fr-FR")
      : "N/A",
    responsabilite: sinistre.responsabilite || "N/A",
    montantSinistre: sinistre.montantSinistre || 0,
    delegation: sinistre.delegation || "non",
    coordonnees_expert: sinistre.coordonnees_expert || "N/A",
    originalData: sinistre,
    documents: sinistre.documents || [],
    contratId: sinistre.contratId || "N/A",
    sinistreId: sinistre.sinistreId || "N/A",
    gestionnaireName: sinistre.gestionnaireName || "N/A",
    contratExist: sinistre.contratExist || "non",
  });

  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const isAdmin =
      decodedToken.role === "Admin" || decodedToken.role === "admin";
    const sessionId = decodedToken.userId;
    const sessionModel = isAdmin ? "Admin" : "Commercial";

    let gestionnaireModel = null;
    if (values.gestionnaire) {
      const selectedUser = users.find(
        (user) => user._id === values.gestionnaire
      );
      gestionnaireModel =
        selectedUser?.userType === "admin" ? "Admin" : "Commercial";
    }

    try {
      const formData = {
        ...values,
        documents: uploadedDocument ? [uploadedDocument] : [],
        numeroSinistre: values.numeroSinistre,
        gestionnaire: values.gestionnaire || null,
        gestionnaireModel: gestionnaireModel,
        session: sessionId,
        coordonnees_expert: values.coordonnees_expert,
        sessionModel: sessionModel,
        leadId: id,
        ...(values.sinistreExist === "oui"
          ? {
              sinistreId: values.sinistreId,
            }
          : {
              sinistreNom: values.sinistreNom,
              sinistrePrenom: values.sinistrePrenom,
              sinistreInput: values.sinistreInput,
            }),
      };

      let response;

      if (editingRecord) {
        response = await axios.put(`/sinistres/${editingRecord._id}`, formData);

        setSinistreData((prev) =>
          prev.map((item) =>
            item._id === editingRecord._id
              ? formatDevisItem(response.data)
              : item
          )
        );
        setFilteredSinistre((prev) =>
          prev.map((item) =>
            item._id === editingRecord._id
              ? formatDevisItem(response.data)
              : item
          )
        );
        message.success("Sinistre mis à jour avec succès");
      } else {
        response = await axios.post("/sinistres", formData);
        console.log("Created sinistre response:", response.data);

        const newSinistre = response.data;
        const newItem = formatDevisItem(newSinistre);

        setSinistreData((prev) => [newItem, ...prev]);
        setFilteredSinistre((prev) => [newItem, ...prev]);

        console.log(
          "New sinistre ID for future GET requests:",
          newSinistre._id
        );
        message.success("Sinistre ajouté avec succès");
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingRecord(null);
      setUploadedDocument(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving sinistre:", error);
      message.error("Erreur lors de la sauvegarde du sinistre");
    }
  };

  useEffect(() => {
    const fetchSinistresForLead = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/sinistres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        console.log("All sinistres for lead:", response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          const sinistresArray = response.data.data;
          
          console.log(`Processing ${sinistresArray.length} sinistre(s)`);

          const formattedData = sinistresArray.map(sinistre => {
            let contratNumber = "N/A";
            
            if (sinistre.contratExist === "oui") {
              contratNumber = sinistre.contratId && sinistre.contratId.contractNumber 
                ? sinistre.contratId.contractNumber 
                : "N/A";
            } else if (sinistre.contratExist === "non") {
              contratNumber = sinistre.contratNumber || "N/A";
            }
            
            if (sinistre.sinistreExist === "non" && (contratNumber === "N/A" || !contratNumber)) {
              contratNumber = sinistre.sinistreInput || "N/A";
            }

            return {
              key: sinistre._id,
              numero_sinistre: sinistre.numeroSinistre || "N/A",
              gestionnaire: sinistre.gestionnaireName || 
                           (sinistre.gestionnaire ? 
                             `${sinistre.gestionnaire.nom || ''} ${sinistre.gestionnaire.prenom || ''}`.trim() 
                             : "N/A"),
              risque: sinistre.risque || "N/A",
              contratNumber: contratNumber,
              assureur: sinistre.assureur || "N/A",
              statutSinistre: sinistre.statutSinistre || "N/A",
              typeSinistre: sinistre.typeSinistre || "N/A",
              dateSinistre: sinistre.dateSinistre 
                ? new Date(sinistre.dateSinistre).toLocaleDateString('fr-FR') 
                : "N/A",
              dateDeclaration: sinistre.dateDeclaration
                ? new Date(sinistre.dateDeclaration).toLocaleDateString('fr-FR')
                : "N/A",
              responsabilite: sinistre.responsabilite || "N/A",
              montantSinistre: sinistre.montantSinistre || 0,
              delegation: sinistre.delegation || "non",
              coordonnees_expert: sinistre.coordonnees_expert || "N/A",
              originalData: sinistre,
              documents: sinistre.documents || [],
              contratId: sinistre.contratId ? sinistre.contratId._id : null,
              sinistreId: sinistre.sinistreId || null,
              gestionnaireName: sinistre.gestionnaireName || "N/A",
              contratExist: sinistre.contratExist || "non",
              sinistreExist: sinistre.sinistreExist || "non",
              sinistreNom: sinistre.sinistreNom || "N/A",
              sinistrePrenom: sinistre.sinistrePrenom || "N/A",
              sinistreInput: sinistre.sinistreInput || "N/A"
            };
          });
          
          console.log("Formatted sinistres data:", formattedData);
          setSinistreData(formattedData);
          setFilteredSinistre(formattedData);
        } else {
          console.log("No sinistres data found");
          setSinistreData([]);
          setFilteredSinistre([]);
        }
  
      } catch (error) {
        console.error("Error fetching sinistres:", error);
        setSinistreData([]);
        setFilteredSinistre([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSinistresForLead();
  }, [id, refreshTrigger]);


  // const fetchDocuments = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
      
  //     // Récupérer tous les sinistres pour ce client
  //     const sinistresResponse = await axios.get(`/sinistres/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "x-user-id": decodedToken?.userId,
  //         "x-user-role": decodedToken?.role,
  //       },
  //     });
  
  //     if (sinistresResponse.data.success && Array.isArray(sinistresResponse.data.data)) {
  //       // Collecter tous les documents de tous les sinistres et contrats
  //       let allDocuments = [];
  
  //       sinistresResponse.data.data.forEach(sinistre => {
  //         // Documents directs du sinistre
  //         if (sinistre.documents && Array.isArray(sinistre.documents)) {
  //           sinistre.documents.forEach(doc => {
  //             allDocuments.push({
  //               ...doc,
  //               source: 'sinistre',
  //               sinistreNumero: sinistre.numeroSinistre,
  //               uploadedBy: sinistre.gestionnaire // Utiliser le gestionnaire du sinistre
  //             });
  //           });
  //         }
  
  //         // Documents du contrat associé
  //         if (sinistre.contratId && sinistre.contratId.documents && Array.isArray(sinistre.contratId.documents)) {
  //           sinistre.contratId.documents.forEach(doc => {
  //             allDocuments.push({
  //               ...doc,
  //               source: 'contrat',
  //               sinistreNumero: sinistre.numeroSinistre,
  //               contratNumber: sinistre.contratId.contractNumber,
  //               uploadedBy: sinistre.contratId.gestionnaireName // Utiliser le gestionnaire du contrat
  //             });
  //           });
  //         }
  //       });
  
  //       console.log("All documents collected:", allDocuments);
  //       setDocuments(allDocuments);
  //     } else {
  //       setDocuments([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching documents:", error);
  //     message.error("Erreur lors du chargement des documents");
  //   }
  // };
 
  // const fetchDocuments = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
      
  //     // Récupérer tous les sinistres pour ce client
  //     const sinistresResponse = await axios.get(`/sinistres/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "x-user-id": decodedToken?.userId,
  //         "x-user-role": decodedToken?.role,
  //       },
  //     });
  
  //     if (sinistresResponse.data.success && Array.isArray(sinistresResponse.data.data)) {
  //       let allDocuments = [];
  
  //       for (const sinistre of sinistresResponse.data.data) {
  //         // Récupérer les détails complets des documents du sinistre
  //         if (sinistre.documents && Array.isArray(sinistre.documents) && sinistre.documents.length > 0) {
  //           for (const documentId of sinistre.documents) {
  //             try {
  //               // Récupérer les détails du document par son ID
  //               const documentResponse = await axios.get(`/documentes/${documentId}`, {
  //                 headers: {
  //                   Authorization: `Bearer ${token}`,
  //                   "x-user-id": decodedToken?.userId,
  //                   "x-user-role": decodedToken?.role,
  //                 },
  //               });
  
  //               if (documentResponse.data.success) {
  //                 const documentData = documentResponse.data.data;
  //                 allDocuments.push({
  //                   ...documentData,
  //                   _id: documentId,
  //                   source: 'sinistre',
  //                   sinistreNumero: sinistre.numeroSinistre,
  //                   sinistreId: sinistre._id,
  //                   uploadedBy: sinistre.gestionnaire
  //                 });
  //               }
  //             } catch (docError) {
  //               console.error(`Error fetching document ${documentId}:`, docError);
  //             }
  //           }
  //         }
  //       }
  
  //       console.log("All documents collected:", allDocuments);
  //       setDocuments(allDocuments);
  //       setFilteredDocuments(allDocuments); // Initialiser les documents filtrés
  //     } else {
  //       setDocuments([]);
  //       setFilteredDocuments([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching documents:", error);
  //     message.error("Erreur lors du chargement des documents");
  //   }
  // };
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Récupérer tous les sinistres pour ce client
      const sinistresResponse = await axios.get(`/sinistres/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });
  
      if (sinistresResponse.data.success && Array.isArray(sinistresResponse.data.data)) {
        let allDocuments = [];
  
        for (const sinistre of sinistresResponse.data.data) {
          // Récupérer les détails complets des documents du sinistre
          if (sinistre.documents && Array.isArray(sinistre.documents) && sinistre.documents.length > 0) {
            for (const documentId of sinistre.documents) {
              try {
                // Récupérer les détails du document par son ID
                const documentResponse = await axios.get(`/documentes/${documentId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "x-user-id": decodedToken?.userId,
                    "x-user-role": decodedToken?.role,
                  },
                });
  
                if (documentResponse.data.success) {
                  const documentData = documentResponse.data.data;
                  allDocuments.push({
                    ...documentData,
                    _id: documentId,
                    source: 'sinistre',
                    sinistreNumero: sinistre.numeroSinistre,
                    sinistreId: sinistre._id,
                    uploadedBy: sinistre.gestionnaire
                  });
                }
              } catch (docError) {
                console.error(`Error fetching document ${documentId}:`, docError);
                // Si l'appel API échoue, créer un document basique avec l'ID
                allDocuments.push({
                  _id: documentId,
                  filename: `Document ${documentId}`,
                  source: 'sinistre',
                  sinistreNumero: sinistre.numeroSinistre,
                  sinistreId: sinistre._id,
                  uploadedBy: sinistre.gestionnaire,
                  fileType: 'Unknown',
                  fileSize: 0,
                  createdAt: new Date().toISOString()
                });
              }
            }
          }
        }
  
        console.log("All documents collected:", allDocuments);
        setDocuments(allDocuments);
        setFilteredDocuments(allDocuments);
      } else {
        setDocuments([]);
        setFilteredDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      message.error("Erreur lors du chargement des documents");
    }
  };
  const handleFileUpload = async (values) => {
    const formData = new FormData();
    formData.append("document", values.document.file);
    formData.append("description", values.description || "");
  
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Vérifier s'il y a des sinistres disponibles
      if (sinistreData.length === 0) {
        message.error("Veuillez d'abord créer un sinistre avant d'uploader des documents");
        return;
      }
  
      // Si un sinistre est sélectionné, l'utiliser, sinon prendre le premier
      const sinistreIdToUse = selectedSinistreId || sinistreData[0].originalData._id;
      
      console.log("Uploading document to sinistre:", sinistreIdToUse);
  
      const uploadResponse = await axios.post(
        `/sinistres/${sinistreIdToUse}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const newDocument = uploadResponse.data.data;
      
      // Trouver le sinistre correspondant pour obtenir son numéro
      const targetSinistre = sinistreData.find(s => s.originalData._id === sinistreIdToUse);
      
      setDocuments((prev) => [{
        ...newDocument,
        source: 'sinistre',
        sinistreNumero: targetSinistre?.numero_sinistre || 'N/A',
        sinistreId: sinistreIdToUse
      }, ...prev]);
      
      setIsUploadModalVisible(false);
      uploadForm.resetFields();
      setSelectedSinistreId(null); // Reset la sélection
      message.success("Document uploadé avec succès");
      
      // Recharger les documents
      fetchDocuments();
      
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(
        error.response?.data?.message || "Erreur lors de l'upload du document"
      );
    } finally {
      setUploading(false);
    }
  };
 
    const handleDeleteDocument = async (documentId, sinistreId = null) => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Supprimer le document de la base de données
        await axios.delete(`/documentes/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
          },
        });
    
        // 2. Si le document est associé à un sinistre, le retirer du sinistre aussi
        if (sinistreId) {
          try {
            await axios.put(`/sinistres/${sinistreId}/remove-document`, {
              documentId: documentId
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                "x-user-id": decodedToken?.userId,
                "x-user-role": decodedToken?.role,
              },
            });
          } catch (sinistreError) {
            console.error("Error removing document from sinistre:", sinistreError);
            // Ne pas bloquer la suppression si l'erreur vient seulement de la dissociation
            if (sinistreError.response?.status !== 404) {
              throw sinistreError;
            }
          }
        }
    
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
        message.success("Document supprimé avec succès");
      } catch (error) {
        console.error("Error deleting document:", error);
        message.error(
          error.response?.data?.message ||
            "Erreur lors de la suppression du document"
        );
      }
    };




  const documentColumns = [
    {
      title: "Nom du fichier",
      dataIndex: "filename",
      key: "filename",
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
          <Tag color={record.source === 'contrat' ? 'blue' : 'green'} size="small">
            {record.source === 'contrat' ? 'Contrat' : 'Sinistre'}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source, record) => (
        <div>
          <div>{source === 'contrat' ? 'Contrat' : 'Sinistre'}</div>
          {record.sinistreNumero && (
            <div className="text-xs text-gray-500">Sinistre: {record.sinistreNumero}</div>
          )}
        </div>
      ),
      filters: [
        { text: 'Sinistre', value: 'sinistre' },
        { text: 'Contrat', value: 'contrat' },
      ],
      onFilter: (value, record) => record.source === value,
    },
 

    {
      title: "Uploadé par",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      render: (uploadedBy, record) => {
        if (typeof uploadedBy === 'string') {
          return uploadedBy;
        } else if (uploadedBy && typeof uploadedBy === 'object') {
          return `${uploadedBy.nom || ""} ${uploadedBy.prenom || ""}`.trim() || "N/A";
        }
        return "N/A";
      },
    },
    {
      title: "Date d'upload",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record)}
          >
            Télécharger
          </Button>
        
            <Popconfirm
              title="Supprimer le document"
              description="Êtes-vous sûr de vouloir supprimer ce document ?"
              onConfirm={() => handleDeleteDocument(record._id, record.sinistreId)}
              okText="Oui"
              cancelText="Non"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Supprimer
              </Button>
            </Popconfirm>
  
        </Space>
      ),
    },
  ];
  
  // Modifier la fonction de téléchargement pour utiliser l'URL correcte
  const handleDownloadDocument = async (document) => {
    try {
      if (document.firebaseUrl) {
        window.open(document.firebaseUrl, "_blank");
      } else if (document.url) {
        window.open(document.url, "_blank");
      } else {
        message.error("URL du document non disponible");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      message.error("Erreur lors du téléchargement du document");
    }
  };



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [adminsRes, commercialsRes] = await Promise.all([
          axios.get("/admin"),
          axios.get("/commercials"),
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

  const columns = [
    {
      title: "N° sinistre",
      dataIndex: "numero_sinistre",
      key: "numero_sinistre",
    },
    {
      title: "N° contrat",
      dataIndex: "contratNumber",
      key: "contratNumber",
      render: (contratNumber, record) => {
        const { contratExist } = record.originalData;
        
        if (contratExist === "oui") {
          return (
            <Tag color="green">
              {contratNumber || "N/A"}
            </Tag>
          );
        } else if (contratExist === "non") {
          return (
            <Tag color="orange">
              {contratNumber || "Non applicable"}
            </Tag>
          );
        } else if (record.originalData.sinistreExist === "non") {
          return (
            <Tag color="orange">
              {contratNumber || "Non renseigné"}
            </Tag>
          );
        }
      },
    },
    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Date sinistre",
      dataIndex: "dateSinistre",
      key: "dateSinistre",
    },
    {
      title: "Date déclaration",
      dataIndex: "dateDeclaration",
      key: "dateDeclaration",
    },
    {
      title: "Statut",
      dataIndex: "statutSinistre",
      key: "statutSinistre",
      render: (status) => {
        const statusMap = {
          en_cours: "En cours",
          clo: "Clôturé",
          reouvert: "Réouvert",
        };
        return statusMap[status] || status;
      },
      filters: [
        { text: "En cours", value: "en_cours" },
        { text: "Clôturé", value: "clo" },
        { text: "Réouvert", value: "reouvert" },
      ],
      onFilter: (value, record) => record.statutSinistre === value,
    },
    {
      title: "Type",
      dataIndex: "typeSinistre",
      key: "typeSinistre",
      render: (type) => {
        const typeMap = {
          dommage_corporel: "Dommage corporel",
          dommage_materiel: "Dommage matériel",
          dommage_corporel_matériel: "Dommage corporel et matériel",
        };
        return typeMap[type] || type;
      },
    },
    {
      title: "Responsabilité",
      dataIndex: "responsabilite",
      key: "responsabilite",
    },
    {
      title: "Montant",
      dataIndex: "montantSinistre",
      key: "montantSinistre",
      render: (amount) => (amount ? `${amount.toLocaleString()} €` : "N/A"),
      sorter: (a, b) => (a.montantSinistre || 0) - (b.montantSinistre || 0),
    },
    {
      title: "Délégation",
      dataIndex: "delegation",
      key: "delegation",
      render: (delegation) => (delegation === "oui" ? "Oui" : "Non"),
      filters: [
        { text: "Oui", value: "oui" },
        { text: "Non", value: "non" },
      ],
      onFilter: (value, record) => record.delegation === value,
    },
    {
      title: "Risque",
      dataIndex: "risque",
      key: "risque",
    },
    {
      title: "Gestionnaire",
      dataIndex: "gestionnaire",
      key: "gestionnaire",
      render: (gestionnaire, record) => <>{gestionnaire || "N/A"}</>,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    console.log("Editing record:", record);

    const gestionnaireName =
      record.originalData.gestionnaireName ||
      (record.originalData.gestionnaire
        ? `${record.originalData.gestionnaire.nom || ""} ${
            record.originalData.gestionnaire.prenom || ""
          }`.trim()
        : "Non spécifié");

    console.log("Extracted gestionnaireName:", gestionnaireName);

    form.setFieldsValue({
      ...record.originalData,
      dateSinistre: record.originalData.dateSinistre
        ? dayjs(record.originalData.dateSinistre)
        : null,
      dateDeclaration: record.originalData.dateDeclaration
        ? dayjs(record.originalData.dateDeclaration)
        : null,
      sinistreExist: record.sinistreExist || "non",
      contratExist: record.contratExist || "non",
      gestionnaire:
        record.originalData.gestionnaire?._id ||
        record.originalData.gestionnaire,
      gestionnaireModel: record.originalData.gestionnaireModel || "Commercial",
      gestionnaireName: gestionnaireName,
    });

    setEditingRecord(record.originalData);
    setIsModalOpen(true);
  };

  const showDeleteConfirm = (record) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer le sinistre?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return deleteDevis(record.key || record._id || record.id);
      },
    });
  };

  const deleteDevis = async (id) => {
    try {
      await axios.delete(`/sinistres/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSinistreData(sinistreData.filter((item) => item.key !== id));
      setFilteredSinistre(filteredSinistre.filter((item) => item.key !== id));
      message.success("Sinistre supprimé avec succès");
    } catch (error) {
      console.error("Error deleting Sinistre:", error);
    }
  };
  // Synchroniser filteredDocuments quand documents change
useEffect(() => {
  if (sinistreFilter === "all") {
    setFilteredDocuments(documents);
  } else {
    const filtered = documents.filter((doc) => doc.sinistreId === sinistreFilter);
    setFilteredDocuments(filtered);
  }
}, [documents, sinistreFilter]);

  // Load documents when Documents tab is active
  useEffect(() => {
    if (activeTabKey === "documents") {
      fetchDocuments();
    }
  }, [activeTabKey, refreshTrigger]);

  return (
    <div className="p-2">
      <Tabs 
        activeKey={activeTabKey} 
        onChange={setActiveTabKey}
        className="w-full"
      >
        <TabPane tab="Sinistres" key="sinistres">
          <div className="flex justify-between mb-4">
            <div>
              <Button type="primary" className="bg-blue-600" onClick={showModal}>
                Enregistrer un sinistre
              </Button>
            </div>
            <div className="flex space-x-2">
              <Select
                placeholder="Filtrer par statut"
                allowClear
                style={{ width: 200 }}
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <Option value="all">Tous les statuts</Option>
                <Option value="tous">Tous</Option>
                <Option value="en_cours">En cours</Option>
                <Option value="clo">Clos</Option>
                <Option value="reouvert">Réouvert</Option>
              </Select>
            </div>
          </div>

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
            dataSource={filteredSinistre.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            loading={loading}
            bordered
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredSinistre.length,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "30", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            onRow={(record) => ({
              onClick: (e) => {
                if (e.target.closest('.ant-btn, .ant-space, .ant-tooltip')) {
                  return;
                }
                window.location.href = `/Sinistres/${record.originalData._id}`;
              },
              style: { 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = '';
              },
            })}
            scroll={{ x: "max-content" }}
            rowKey={(record) => record._id}
          />
        </TabPane>

        {/* <TabPane tab="Documents" key="documents">
          <div className="mb-4">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadModalVisible(true)}
            >
              Uploader Document
            </Button>
          </div>

          <Table
            // columns={documentColumns}
            columns={[
              ...documentColumns.map((col) => ({
                ...col,
                title: (
                  <div className="flex flex-col items-center">
                    <div className="text-xs">{col.title}</div>
                  </div>
                ),
              })),
            ]}
            dataSource={documents}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: "max-content" }}
          />
        </TabPane> */}
        <TabPane tab="Documents" key="documents">
  <div className="mb-4 flex justify-between items-center">
    <div className="flex space-x-2">
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setIsUploadModalVisible(true)}
      >
        Uploader Document
      </Button>
    </div>
    
    {/* Filtre par sinistre */}
    <div className="flex space-x-2 items-center">
      <span className="text-sm text-gray-600">Filtrer par sinistre:</span>
      <Select
        placeholder="Tous les sinistres"
        style={{ width: 200 }}
        value={sinistreFilter}
        onChange={handleSinistreFilter}
        allowClear
      >
        <Option value="all">Tous les sinistres</Option>
        {sinistreData.map((sinistre) => (
          <Option key={sinistre.originalData._id} value={sinistre.originalData._id}>
            {sinistre.numero_sinistre} - {sinistre.originalData.typeSinistre}
          </Option>
        ))}
      </Select>
      
      {/* Afficher le compteur de documents */}
      <div className="text-sm text-gray-500">
        {filteredDocuments.length} document(s)
        {sinistreFilter !== "all" && ` pour ce sinistre`}
      </div>
    </div>
  </div>

  <Table
    columns={documentColumns.map((col) => ({
      ...col,
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">{col.title}</div>
        </div>
      ),
    }))}
    dataSource={filteredDocuments}
    rowKey="_id"
    pagination={{ pageSize: 10 }}
    loading={loading}
    scroll={{ x: "max-content" }}
    locale={{
      emptyText: (
        <div className="text-center py-8">
          <FileTextOutlined className="text-4xl text-gray-300 mb-2" />
          <p>
            {sinistreFilter === "all" 
              ? "Aucun document trouvé" 
              : "Aucun document pour ce sinistre"}
          </p>
          <Button type="link" onClick={() => setIsUploadModalVisible(true)}>
            Uploader un document
          </Button>
        </div>
      )
    }}
  />
</TabPane>
      </Tabs>

    
<Modal
  title="Uploader un document"
  open={isUploadModalVisible}
  onCancel={() => {
    setIsUploadModalVisible(false);
    uploadForm.resetFields();
    setSelectedSinistreId(null);
  }}
  footer={null}
>
  <Form form={uploadForm} layout="vertical" onFinish={handleFileUpload}>
    {/* Sélection du sinistre - Afficher seulement s'il y a plusieurs sinistres */}
    {sinistreData.length > 1 && (
      <Form.Item
        label="Sélectionner un sinistre"
        name="selectedSinistre"
        rules={[{ required: true, message: "Veuillez sélectionner un sinistre" }]}
      >
        <Select
          placeholder="-- Choisissez un sinistre --"
          onChange={(value) => setSelectedSinistreId(value)}
          value={selectedSinistreId}
        >
          {sinistreData.map((sinistre) => (
            <Option key={sinistre.originalData._id} value={sinistre.originalData._id}>
              {sinistre.numero_sinistre} - {sinistre.originalData.typeSinistre} ({sinistre.originalData.statutSinistre})
            </Option>
          ))}
        </Select>
      </Form.Item>
    )}

    {/* Afficher une info si un seul sinistre existe */}
    {sinistreData.length === 1 && (
      <div className="mb-4 p-2 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          Document sera associé au sinistre: <strong>{sinistreData[0].numero_sinistre}</strong>
        </p>
      </div>
    )}

    <Form.Item
      name="document"
      label="Document"
      rules={[
        { required: true, message: "Veuillez sélectionner un fichier" },
      ]}
    >
      <Upload
        beforeUpload={(file) => {
          return false;
        }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Sélectionner le fichier</Button>
      </Upload>
    </Form.Item>

    <Form.Item name="description" label="Description (optionnel)">
      <Input.TextArea rows={3} placeholder="Description du document" />
    </Form.Item>

    <Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={uploading}>
          Uploader
        </Button>
        <Button
          onClick={() => {
            setIsUploadModalVisible(false);
            uploadForm.resetFields();
            setSelectedSinistreId(null);
          }}
        >
          Annuler
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>

      {/* Existing Sinistre Modal */}
      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">
              {editingRecord
                ? "MODIFIER LE SINISTRE"
                : "ENREGISTRER UN SINISTRE"}
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
            className="w-full space-y-4"
            initialValues={{
              gestionnaire: gestionnaire?._id || gestionnaire || null,
            }}
          >
            {/* === INFORMATIONS === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATIONS</h2>

            <Form.Item
              name="numeroSinistre"
              label="N° du sinistre"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
              className="w-full"
            >
              <Input placeholder="N° du sinistre" className="w-full" />
            </Form.Item>

            {/* LE SINISTRE */}
            <h2 className="text-sm font-semibold mt-16 mb-4">LE SINISTRE</h2>

            <Form.Item
              label="Le sinistré existe-t-il dans votre CRM ?"
              name="sinistreExist"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            {sinistreExist === "oui" && (
              <Form.Item
                label="Sinistré"
                name="sinistreId"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="-- Choisissez un sinistré --"
                  loading={loadingClients}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {chatData.map((client) => (
                    <Option key={client._id} value={client._id}>
                      {client.nom} {client.prenom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {sinistreExist === "non" && (
              <>
                <Form.Item
                  label="Nom du sinistré"
                  name="sinistreNom"
                  rules={[
                    {
                      required: false,
                      message: "Le champ nom du sinistré est obligatoire",
                    },
                  ]}
                >
                  <Input placeholder="Entrez le nom du sinistré" />
                </Form.Item>

                <Form.Item
                  label="Prénom du sinistré"
                  name="sinistrePrenom"
                  rules={[
                    {
                      required: false,
                      message: "Le champ prénom du sinistré est obligatoire",
                    },
                  ]}
                >
                  <Input placeholder="Entrez le prénom du sinistré" />
                </Form.Item>
                <Form.Item
                  label="Numéro de contrat"
                  name="sinistreInput"
                  rules={[
                    {
                      required: false,
                      message: "Le champ numéro de sinistre est obligatoire",
                    },
                  ]}
                >
                  <Input placeholder="Entrez le numéro de sinistre" />
                </Form.Item>
              </>
            )}

            {sinistreExist === "oui" && (
              <>
                <Form.Item
                  label="Le contrat existe-t-il dans votre CRM ?"
                  name="contratExist"
                  rules={[
                    { required: false, message: "Ce champ est obligatoire" },
                  ]}
                >
                  <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
                  </Radio.Group>
                </Form.Item>

                {contratExist === "oui" && (
                  <Form.Item
                    label="Contrat"
                    name="contratId"
                    rules={[
                      {
                        required: false,
                        message: "Le champ contrat est obligatoire",
                      },
                    ]}
                  >
                    <Select
                      placeholder={
                        loadingContrats
                          ? "Chargement..."
                          : "-- Choisissez un contrat --"
                      }
                      loading={loadingContrats}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {contrats.map((contrat) => (
                        <Option key={contrat._id} value={contrat._id}>
                          {contrat.contractNumber} - {contrat.insurer}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {contratExist === "non" && (
                  <Form.Item
                    label="Numéro de contrat"
                    name="contratNumber"
                    rules={[
                      {
                        required: false,
                        message: "Le champ numéro de contrat est obligatoire",
                      },
                    ]}
                  >
                    <Input placeholder="Entrez le numéro de contrat" />
                  </Form.Item>
                )}
              </>
            )}

            <Form.Item name="risque" label="Risque" className="w-full">
              <Select placeholder="-- Choisissez --" className="w-full">
                {RISQUES.map((risque) => (
                  <Option key={risque.value} value={risque.value}>
                    {risque.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="assureur" label="Assureur" className="w-full">
              <Select placeholder="-- Choisissez --" className="w-full">
                {ASSUREURS.map((assureur) => (
                  <Option key={assureur.value} value={assureur.value}>
                    {assureur.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* === DÉTAIL DU SINISTRE === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">
              DÉTAIL DU SINISTRE
            </h2>

            <Form.Item
              name="dateSinistre"
              label="Date du sinistre"
              className="w-full"
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="dateDeclaration"
              label="Date de déclaration *"
              className="w-full"
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="statutSinistre"
              label="Statut du sinistre"
              className="w-full"
            >
              <Select placeholder="-- Choisissez --" className="w-full">
                <Option value="en_cours">En cours</Option>
                <Option value="clo">Clos</Option>
                <Option value="reouvert">Réouvert</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="typeSinistre"
              label="Type de sinistre"
              className="w-full"
            >
              <Select placeholder="-- Choisissez --" className="w-full">
                <Option value="dommage_corporel">Dommage corporel</Option>
                <Option value="dommage_materiel">Dommage matériel</Option>
                <Option value="dommage_corporel_matériel">
                  Dommage corporel et matériel
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="responsabilite"
              label="Responsabilité"
              className="w-full"
            >
              <Input placeholder="Responsabilité" className="w-full" />
            </Form.Item>

            <Form.Item
              name="montantSinistre"
              label="Montant du sinistre"
              className="w-full"
            >
              <InputNumber
                className="w-full"
                addonAfter="€"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="delegation"
              label="Sinistre en délégation *"
              className="w-full"
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="coordonnees_expert"
              label="Coordonnées de l'expert"
              className="w-full"
            >
              <Input.TextArea
                placeholder="Coordonnées de l'expert"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                value={form.getFieldValue("gestionnaireName") || "Non spécifié"}
                disabled
              />
            </Form.Item>

            <Form.Item name="gestionnaire" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="gestionnaireModel" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="gestionnaireName" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </Form>

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
              ? "Modifier le sinistre"
              : "Enregistrer le sinistre"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SinistreTabContent;