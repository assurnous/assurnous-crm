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
} from "antd";
import { CloseOutlined, EditOutlined, DeleteOutlined, DownloadOutlined  } from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { ASSUREURS, RISQUES } from "../../constants";

const { Option } = Select;

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
      console.log("Decoded token:", decodedToken); // Debug token
      
      const currentUserId = decodedToken?.userId;
      const userName = decodedToken?.name;
      const userRole = decodedToken?.role || decodedToken?.userType; // Check both possible role fields
      
      try {
        setLoading(true);
        const response = await axios.get("/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const allLeads = response.data?.chatData || [];
        console.log("Raw leads data:", allLeads);
  
        // For admin, return all leads without filtering
        // if (userRole?.toLowerCase() === 'admin') { // Case-insensitive check
        //   console.log("Admin access - showing all leads", allLeads.length);
        //   setChatData(allLeads);
        //   return;
        // }
  
        // // For commercial, filter leads
        // const filteredLeads = allLeads.filter((lead) => {
        //   const commercial = lead.commercial || {};
        //   const clientcreatedByCommercial = lead.cree_par || "";
          
        //   return (
        //     (commercial._id === currentUserId && 
        //      commercial.nom === lastName && 
        //      commercial.prenom === firstName) ||
        //     clientcreatedByCommercial === userName
        //   );
        // });
  
        // console.log("Filtered leads for commercial:", filteredLeads);
        setChatData(allLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
        
      } finally {
        setLoading(false);
      }
    };
  
    fetchClients();
  }, [id, currentUserId, token]); // Removed userRole from dependencies
 
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await axios.get(`/lead/${id}`);
        const chatData = response.data.chat;
        setClient(response.data);
     
          form.setFieldsValue({
            gestionnaire: chatData.gestionnaire, // Just store the ID directly
            gestionnaireModel: chatData.gestionnaireModel,
            gestionnaireName: chatData.gestionnaireName
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
    setIsModalOpen(true); 
  };
  

  const handleCancel = () => {
    form.resetFields();
    setEditingRecord(null);
    setUploadedDocument(null);
    setIsModalOpen(false);
  };

  // Helper function to format devis items consistently
  const formatDevisItem = (sinistre) => ({
    key: sinistre._id,
    numero_sinistre: sinistre.numeroSinistre || "N/A",
    gestionnaire: sinistre.gestionnaireName || "N/A",
    risque: sinistre.risque || "N/A",
    assureur: sinistre.assureur || "N/A",
    statutSinistre: sinistre.statutSinistre || "N/A",
    typeSinistre: sinistre.typeSinistre || "N/A",
    dateSinistre: sinistre.dateSinistre 
      ? new Date(sinistre.dateSinistre).toLocaleDateString() 
      : "N/A",
      dateDeclaration: sinistre.dateDeclaration
      ? new Date(sinistre.dateDeclaration).toLocaleDateString()
      : "N/A",
    originalData: sinistre,
    documents: sinistre.documents || [],
    contratId: sinistre.contratId || "N/A",
    sinistreId: sinistre.sinistreId || "N/A"
  });

  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const isAdmin =
    decodedToken.role === "Admin" || decodedToken.role === "admin";
  const sessionId = decodedToken.userId;
  const sessionModel = isAdmin ? "Admin" : "Commercial";
    
    try {
      // Prepare form data with document if exists
      const formData = {
        ...values,
        documents: uploadedDocument ? [uploadedDocument] : [],
        numeroSinistre: values.numeroSinistre,
        gestionnaire:  gestionnaire,
        session: sessionId,
        coordonnees_expert: values.coordonnees_expert,
        sessionModel: sessionModel,
        leadId: id,
        ...(values.sinistreExist === "oui"
          ? {
              leadId: values.sinistreId,
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
      const response = await axios.put(
               `/sinistres/${editingRecord._id}`,
               formData
             );
     
      setSinistreData((prev) =>
        [...prev].map((item) =>
          item._id === editingRecord._id ? { ...response.data } : { ...item }
        )
      );
      setFilteredSinistre((prev) =>
        prev.map((item) =>
          item._id === editingRecord._id ? { ...response.data } : item
        )
      );
        message.success("Devis mis à jour avec succès");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        // CREATE NEW DEVIS
        response = await axios.post("/sinistres", formData);
        console.log("Created sinistre:", response.data);
        const newItem = formatDevisItem(response.data);
      
        setSinistreData(prev => [newItem, ...prev]);
        setFilteredSinistre(prev => [newItem, ...prev]);
        setSinistreData(prev => [response.data, ...prev]);
        setCurrentPage(1);
        message.success("Devis ajoutée avec succès");
          form.resetFields();
      setIsModalOpen(false);
      }
  
      setRefreshTrigger(prev => prev + 1);
      form.resetFields();
      setIsModalOpen(false);
      setEditingRecord(null);
      setUploadedDocument(null);
  
    } catch (error) {
      console.error("Error saving devis:", error);
    }
  };
  useEffect(() => {
    const fetchSinistresForLead = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;
      const userRole = decodedToken?.role;
      
      setLoading(true);
      try {
        const response = await axios.get(`/sinistres/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-ID": currentUserId,
            "X-User-Role": userRole,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
  
        console.log("Raw sinistres data:", response.data);
        
        // Format the data without potentially destructive operations
        const formattedData = response.data.data.map(sinistre => {
          const baseData = formatDevisItem ? formatDevisItem(sinistre) : {};
          
          return {
            ...baseData,
            ...sinistre,
            dateSinistre: sinistre.dateSinistre
              ? new Date(sinistre.dateSinistre).toLocaleDateString()
              : "N/A",
            dateDeclaration: sinistre.dateDeclaration
              ? new Date(sinistre.dateDeclaration).toLocaleDateString()
              : "N/A",
            gestionnaireName: sinistre.leadId.gestionnaireName || 
                             sinistre.session?.name || 
                             "N/A",
            contratExist: sinistre.contratExist || "non",
            contratDetails: sinistre.contratDetails || null,
            contratNumber: sinistre.contratDetails?.contractNumber || "N/A",
            sinistreDetails: sinistre.sinistreDetails || {},
            responsabilite: sinistre.responsabilite || "N/A",
            typeSinistre: sinistre.typeSinistre || "N/A",
            montantSinistre: sinistre.montantSinistre || "N/A",
            delegation: sinistre.delegation || "non",
            coordonnees_expert: sinistre.coordonnees_expert || "N/A"
          };
        });
  
        console.log("Formatted sinistres data:", formattedData);
        setSinistreData(formattedData);
        setFilteredSinistre(formattedData);
  
      } catch (error) {
        console.error("Error fetching sinistres:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSinistresForLead();
  }, [id, token, refreshTrigger]);

  // useEffect(() => {
  //   const fetchSinistresForLead = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;
  //     const decodedToken = token ? jwtDecode(token) : null;
  //     const currentUserId = decodedToken?.userId;
  //     const userRole = decodedToken?.role;
      
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(`/sinistres/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "X-User-ID": currentUserId,
  //           "X-User-Role": userRole,
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true,
  //       });
  
  //       console.log("Fetched sinistres:", response.data);
        
  //       // Use the formatDevisItem function we created
  //       const formattedData = response.data.data.map(sinistre => ({
  //         ...formatDevisItem(sinistre), // Use the shared formatting
  //         // Add additional fields specific to this view
  //         dateSinistre: sinistre.dateSinistre
  //           ? new Date(sinistre.dateSinistre).toLocaleDateString()
  //           : "N/A",
  //         dateDeclaration: sinistre.dateDeclaration
  //           ? new Date(sinistre.dateDeclaration).toLocaleDateString()
  //           : "N/A",
  //         gestionnaireName: sinistre.leadId.gestionnaireName || "N/A",
  //         contratExist: sinistre.contratExist || "non",
  //         contratDetails: sinistre.contratDetails || null,
  //         contratNumber: sinistre.contratDetails?.contractNumber || "N/A",
  //         sinistreDetails: sinistre.sinistreDetails || {},
  //         responsabilite: sinistre.responsabilite || "N/A",
  //         typeSinistre: sinistre.typeSinistre || "N/A",
  //         montantSinistre: sinistre.montantSinistre || "N/A",
  //         delegation: sinistre.delegation || "non",
  //         coordonnees_expert: sinistre.coordonnees_expert || "N/A"
  //       }));
  
  //       setSinistreData(formattedData);
  //       setFilteredSinistre(formattedData);
  
  //     } catch (error) {
  //       console.error("Error fetching sinistres:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchSinistresForLead();
  // }, [id, token, refreshTrigger]);
  // useEffect(() => {
  //   const fetchSinistresForLead = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) return;
  //     const decodedToken = token ? jwtDecode(token) : null;
  //     const currentUserId = decodedToken?.userId;
  //     const userRole = decodedToken?.role;
      
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(`/sinistres/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "X-User-ID": currentUserId,
  //           "X-User-Role": userRole,
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true,
  //       });
  //       console.log("Fetched sinistres:", response.data);
  //       const formattedData = response.data.data.map(sinistre => ({
  //         key: sinistre._id,
  //         dateSinistre: new Date(sinistre.dateSinistre).toLocaleDateString(),
  //         statutSinistre: sinistre.statutSinistre,
  //         gestionnaireName: devis.lead.gestionnaireName || "N/A",
  //         risque: sinistre.risque,
  //         assureur: sinistre.assureur,
  //         dateDeclaration: sinistre.dateDeclaration
  //           ? new Date(sinistre.dateDeclaration).toLocaleDateString()
  //           : "N/A",
  //           gestionnaire: sinistre.lead.gestionnaire,
  //         contratExist: sinistre.contratExist || "non",
  //         contratDetails: sinistre.contratDetails || null,
  //         contratSelect: sinistre.contratSelect || "N/A",
  //         sinistreInput: sinistre.sinistreInput || "N/A",
  //         sinistreDetails: sinistre.sinistreDetails || {},
  //         responsabilite: sinistre.responsabilite || "N/A",
  //         contratNumber: sinistre.contratDetails?.numeroContrat || "N/A",
  //         createdAt: sinistre.createdAt,
  //         typeSinistre: sinistre.typeSinistre,
  //         montantSinistre: sinistre.montantSinistre,
  //         originalData: sinistre
  //       }));
  
  //       setSinistreData(formattedData);
  //       setFilteredSinistre(formattedData);
  
  //     } catch (error) {
  //       console.error("Error fetching sinistres:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchSinistresForLead();
  // }, [id, token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch both admins and commercials
        const [adminsRes, commercialsRes] = await Promise.all([
          axios.get("/admin"),
          axios.get("/commercials"),
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
      dataIndex: "numero_sinistre",  // Changed from numeroSinistre to match formatted data
      key: "numero_sinistre",
    },
    {
      title: "N° contrat",
      key: "contrat",
      render: (_, record) => {
        if (record.contratExist === "oui") {
          if (record.contratDetails) {
            return record.contratDetails.contractNumber || "Contrat (sans numéro)";
          }
          if (record.contratSelect) {
            return record.contratSelect;
          }
          return "Contrat (référence)";
        } else {
          return record.sinistreInput || "N/A";
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
      dataIndex: "dateSinistre",  // This matches the formatted data
      key: "dateSinistre",
    },
    {
      title: "Date déclaration",
      dataIndex: "dateDeclaration",  // This matches the formatted data
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
      dataIndex: "typeSinistre",  // Changed to match API response field
      key: "typeSinistre",
      render: (type) => {
        const typeMap = {
          'dommage_corporel': 'Dommage corporel',
          'dommage_materiel': 'Dommage matériel',
          'dommage_corporel_matériel': 'Dommage corporel et matériel'
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
      dataIndex: "montantSinistre",  // Changed to match API response field
      key: "montantSinistre",
      render: (amount) => amount ? `${amount.toLocaleString()} €` : "N/A",
      sorter: (a, b) => (a.montantSinistre || 0) - (b.montantSinistre || 0),
    },
    {
      title: "Délégation",
      dataIndex: "delegation",  // Changed to match API response field
      key: "delegation",
      render: (delegation) => delegation === 'oui' ? 'Oui' : 'Non',
      filters: [
        { text: 'Oui', value: 'oui' },
        { text: 'Non', value: 'non' }
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
      dataIndex: "gestionnaireName",  // Changed to match formatted data
      key: "gestionnaireName",
      render: (gestionnaire, record) => (
        <>
          {gestionnaire || "N/A"}
          {/* {userRole === "Admin" && (
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.originalData.session?.email}
            </div>
          )} */}
        </>
      ),
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

const handleEdit = async (record) => {
  console.log("Editing record:", record);
  setEditingRecord(record);
  setIsModalOpen(true);

  // Reset form first
  form.resetFields();

  // Prepare base form values
  const formValues = {
    // Information section
    numeroSinistre: record.numeroSinistre || record.numero_sinistre || "",

    // Sinistre section
    sinistreExist: record.sinistreExist || "non",

    // Contract section
    contratExist: record.contratExist || "non",

    // Details
    risque: record.risque || "",
    assureur: record.assureur || "",

    // Détail du sinistre
    dateSinistre: record.dateSinistre ? dayjs(record.dateSinistre, 'DD/MM/YYYY') : null,
    dateDeclaration: record.dateDeclaration ? dayjs(record.dateDeclaration, 'DD/MM/YYYY') : null,
    statutSinistre: record.statutSinistre || "en_cours",
    typeSinistre: record.typeSinistre || "",
    responsabilite: record.responsabilite || "",
    montantSinistre: record.montantSinistre || 0,
    delegation: record.delegation || "non",
    expert: record.expert || "",
    coordonnees_expert: record.coordonnees_expert || "",
    
    // Handle both sinistreId and leadId cases
    sinistreId: record.sinistreId || (record.leadId?._id || record.leadId) || null,
    
    // Gestionnaire handling
    gestionnaire: record.gestionnaireName || 
                (record.session?.name || "") || 
                (record.gestionnaire ? JSON.parse(record.gestionnaire).id : "")
  };

  // Handle sinistre information based on sinistreExist
  if (record.sinistreExist === "oui") {
    const clientId = record.sinistreId || record.leadId?._id || record.leadId;
    const matchingClient = chatData.find(client => client._id === clientId);

    if (matchingClient) {
      formValues.sinistreSelect = matchingClient._id;
    } else if (record.leadId) {
      formValues.sinistreSelect = record.leadId._id;
    }
  } else {
    formValues.sinistreNom = record.leadId?.nom || "";
    formValues.sinistrePrenom = record.leadId?.prenom || "";
  }

  if (record.contratExist === "oui") {
    const matchingContrat = contrats.find(contrat => contrat._id === record.contratId);
    if (matchingContrat) {
      formValues.contratId = matchingContrat._id;  // Changed from contratSelect to contratId
    } else if (record.contratDetails) {
      formValues.contratId = record.contratDetails._id;  // Changed from contratSelect to contratId
    }
  }

  console.log("Form values to be set:", formValues);

  // Set form values without delay
  requestAnimationFrame(() => {
    try {
      form.setFieldsValue(formValues);
      console.log("Form values after setting:", form.getFieldsValue());
    } catch (error) {
      console.error("Error setting form values:", error);
    }
  });
};

useEffect(() => {
  if (isModalOpen) {
    const interval = setInterval(() => {
      console.log("Current form values:", form.getFieldsValue());
    }, 1000);
    return () => clearInterval(interval);
  }
}, [isModalOpen, form]);

  const showDeleteConfirm = (record) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer le sinistre?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return deleteDevis(record.key || record._id || record.id); // Use the correct ID property
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

  return (
    <div className="p-2">
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
        // pagination={{ pageSize: 10 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredSinistre.length,
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
        scroll={{ x: "max-content" }}
        rowKey={(record) => record._id}
      />

      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">
              {editingRecord ? "MODIFIER LE SINISTRE" : "ENREGISTRER UN SINISTRE"}
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
    gestionnaire: gestionnaire?._id || gestionnaire || null
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
                        rules={[{ required: true, message: "Ce champ est obligatoire" }]}
                      >
                        <Radio.Group>
                          <Radio value="oui">Oui</Radio>
                          <Radio value="non">Non</Radio>
                        </Radio.Group>
                      </Form.Item>
          
                      {/* If "oui" show Select */}
                      {/* If sinistré exists (oui) - show client select */}
                      {sinistreExist === "oui" && (
                        <Form.Item
                          label="Sinistré"
                          name="sinistreId"
                          rules={[
                            { required: true, message: "Ce champ est obligatoire" },
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
          
                      {/* If sinistré doesn't exist (non) - show manual entry fields */}
                      {sinistreExist === "non" && (
                        <>
                          <Form.Item
                            label="Nom du sinistré"
                            name="sinistreNom"
                            rules={[
                              {
                                required: true,
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
                                required: true,
                                message: "Le champ prénom du sinistré est obligatoire",
                              },
                            ]}
                          >
                            <Input placeholder="Entrez le prénom du sinistré" />
                          </Form.Item>
                          <Form.Item
                            label="Numéro de contrat*"
                            name="sinistreInput"
                            rules={[
                              {
                                required: true,
                                message: "Le champ numéro de sinistre est obligatoire",
                              },
                            ]}
                          >
                            <Input placeholder="Entrez le numéro de sinistre" />
                          </Form.Item>
                        </>
                      )}
          
                      {/* Only show contract section if sinistré exists (oui) */}
                      {sinistreExist === "oui" && (
                        <>
                          {/* Contract Existence Toggle */}
                          <Form.Item
                            label="Le contrat existe-t-il dans votre CRM ?"
                            name="contratExist"
                            rules={[
                              { required: true, message: "Ce champ est obligatoire" },
                            ]}
                          >
                            <Radio.Group>
                              <Radio value="oui">Oui</Radio>
                              <Radio value="non">Non</Radio>
                            </Radio.Group>
                          </Form.Item>
          
                          {/* If contract exists (oui) - show contract select */}
                          {contratExist === "oui" && (
                            <Form.Item
                              label="Contrat"
                              name="contratId"
                              rules={[
                                {
                                  required: true,
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
          
                          {/* If contract doesn't exist (non) - show manual entry */}
                          {contratExist === "non" && (
                            <Form.Item
                              label="Numéro de contrat"
                              name="contratNumber"
                              rules={[
                                {
                                  required: true,
                                  message: "Le champ numéro de contrat est obligatoire",
                                },
                              ]}
                            >
                              <Input placeholder="Entrez le numéro de contrat" />
                            </Form.Item>
                          )}
                        </>
                      )}


  <Form.Item
    name="risque"
    label="Risque"
    className="w-full"
  >
    <Select placeholder="-- Choisissez --" className="w-full">
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
    className="w-full"
  >
    <Select placeholder="-- Choisissez --" className="w-full">
      {ASSUREURS.map(assureur => (
        <Option key={assureur.value} value={assureur.value}>
          {assureur.label}
        </Option>
      ))}
    </Select>
  </Form.Item>

  {/* === DÉTAIL DU SINISTRE === */}
  <h2 className="text-sm font-semibold mt-3 mb-2">DÉTAIL DU SINISTRE</h2>

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
        <Option value="dommage_corporel_matériel">Dommage corporel et matériel</Option>
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
    <Input.TextArea placeholder="Coordonnées de l'expert" className="w-full" />
  </Form.Item>
{/* <Form.Item
              label={<span className="text-xs font-medium">GESTIONNAIRE*</span>}
              name="gestionnaire"
              className="mb-0"
            >
              {loading ? (
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Chargement..."
                  disabled
                />
              ) : (
                <Input
                  className="w-full text-xs h-7"
                  value={
                    gestionnaire
                      ? `${
                          gestionnaire.userType === "admin"
                            ? gestionnaire.name
                            : `${gestionnaire.nom} ${gestionnaire.prenom}`
                        } (${
                          gestionnaire.userType === "admin"
                            ? "Admin"
                            : "Commercial"
                        })`
                      : "Non spécifié"
                  }
                  disabled
                />
              )}
            </Form.Item> */}
             {/* <Form.Item
                          label={<span className="text-xs font-medium">GESTIONNAIRE*</span>}
                          name="gestionnaire"
                          className="mb-0"
                          style={{ display: 'none' }}
                        >
                          {loading ? (
                            <Input
                              className="w-full text-xs h-7"
                              placeholder="Chargement..."
                              disabled
                            />
                          ) : (
                            <Input
                              className="w-full text-xs h-7"
                              value={
                                gestionnaire
                                  ? `${
                                      gestionnaire.userType === "admin"
                                        ? gestionnaire.name
                                        : `${gestionnaire.nom} ${gestionnaire.prenom}`
                                    } (${
                                      gestionnaire.userType === "admin"
                                        ? "Admin"
                                        : "Commercial"
                                    })`
                                  : "Non spécifié"
                              }
                              disabled
                            />
                          )}
                        </Form.Item>
                      
                      
                               <Form.Item
                        label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
                        className="mb-0"
                      >
                        <Input
                          className="w-full text-xs h-7"
                          value={client?.gestionnaireName || "Non spécifié"}
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
                      </Form.Item> */}
                             <Form.Item
                        label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
                        className="mb-0"
                      >
                        <Input
                          className="w-full text-xs h-7"
                          value={form.getFieldValue('gestionnaireName') || "Non spécifié"}
                          disabled
                        />
                      </Form.Item>
                      
                      {/* Hidden fields for actual form submission */}
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
