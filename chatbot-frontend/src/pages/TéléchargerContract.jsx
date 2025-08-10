import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Select,
  Input,
  DatePicker,
  Form,
  Radio,
  Tag,
  Switch,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import FileUpload from "../components/TabsContent/FileUpload";
import { ASSUREURS, RISQUES } from "../constants";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;


const AllCommands = () => {
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
   const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [contratData, setContratData] = useState([]);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filteredContrat, setFilteredContrat] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [filters, setFilters] = useState({
    periode: null,       
    risque: null,         
    assureur: null,         
    gestionnaire: null,    
    categorie: null,       
    status: null,          
    search: "",
    isForecast: null,
  });

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;

  const showModal = () => {
    setEditingRecord(null);
    setUploadedDocument(null);
    form.resetFields();
    if (gestionnaire) {
      form.setFieldsValue({
        gestionnaire: gestionnaire._id || gestionnaire,
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingRecord(null);
    setUploadedDocument(null);
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
  
  const applyFilters = (filterValues) => {
    let result = [...contratData];
  
    // Apply date range filter
    if (filterValues.periode && filterValues.periode[0] && filterValues.periode[1]) {
      const [startDate, endDate] = filterValues.periode;
      result = result.filter(contrat => {
        const effectiveDate = new Date(contrat.effectiveDate);
        return effectiveDate >= startDate && effectiveDate <= endDate;
      });
    }


   
  
    // Apply risk type filter
    if (filterValues.risque) {
      result = result.filter(contrat => contrat.riskType === filterValues.risque);
    }
  
 
    if (filterValues.isForecast !== null) {
      result = result.filter(contrat => {
        // Strict boolean comparison
        return contrat.isForecast === filterValues.isForecast;
      })

    }

    
    // Apply insurer filter
    if (filterValues.assureur) {
      result = result.filter(contrat => contrat.insurer === filterValues.assureur);
    }
  
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter(contrat => {
        // Find the user object that matches the selected ID
        const user = users.find(u => u._id === filterValues.gestionnaire);
        if (!user) return false;
        
        // Construct the display name to match against
        const displayName = user.userType === "admin" 
          ? user.name 
          : `${user.nom} ${user.prenom}`;
        
        // Check all possible locations for the gestionnaire name
        return (
          contrat.lead?.gestionnaireName === displayName ||  // From lead object
          contrat.gestionnaire === displayName ||            // Direct property
          contrat.session?.name === displayName              // From session
        );
      });
    }
 
    if (filterValues.categorie && filterValues.categorie !== "tous") {
      result = result.filter(contrat => {
        // Access the categorie from the formatted data
        return contrat.categorie === filterValues.categorie;
      });
    }
  
    // Apply status filter
    if (filterValues.status) {
      result = result.filter(contrat => contrat.status === filterValues.status);
    }
  
    
// Updated search filter
if (filterValues.search) {
  const searchTerm = filterValues.search.toLowerCase();
  result = result.filter(contrat => {
    // Get the lead data from the original record
    const lead = contrat.originalData?.lead;
    
    // Construct client name from lead or use clientId as fallback
    const clientName = lead 
      ? `${lead.nom || ''} ${lead.prenom || ''}`.trim().toLowerCase()
      : (contrat.clientId || '').toLowerCase();
    
    // Check both devis number and client name
    return (
      (contrat.contractNumber && contrat.contractNumber.toLowerCase().includes(searchTerm)) ||
      (clientName && clientName.includes(searchTerm))
    );
  });
}
    setFilteredContrat(result);
  };

  const handleClientChange = (clientId) => {
    setSelectedLeadId(clientId);
    const selectedClient = clients.find((client) => client._id === clientId);
    
    if (selectedClient) {
      console.log('Selected client gestionnaire info:', {
        clientGestionnaireId: selectedClient.gestionnaire,
        clientGestionnaireName: selectedClient.gestionnaireName,
        allUsers: users
      });
  
      // Try to find matching user by ID or name
      const gestionnaireUser = users.find(user => 
        user._id === selectedClient.gestionnaire ||
        user.id === selectedClient.gestionnaire ||
        (user.userType === "admin" && user.name === selectedClient.gestionnaireName) ||
        (user.userType === "commercial" && 
         `${user.nom} ${user.prenom}` === selectedClient.gestionnaireName)
      );
  
      const displayName = gestionnaireUser
        ? gestionnaireUser.userType === "admin"
          ? gestionnaireUser.name
          : `${gestionnaireUser.nom} ${gestionnaireUser.prenom}`
        : selectedClient.gestionnaireName || "Non spécifié";
  
      form.setFieldsValue({
        clientId: `${selectedClient.prenom} ${selectedClient.nom}`.trim(),
        email: selectedClient.email,
        gestionnaire: displayName,
        gestionnaireId: gestionnaireUser?._id || selectedClient.gestionnaire,
        gestionnaireModel: selectedClient.gestionnaireModel || "Admin",
        gestionnaireName: displayName
      });
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
          ...adminsRes.data.map(admin => ({
            ...admin,
            userType: "admin",
            id: admin._id,
            // Standardize name fields
            name: admin.name || admin.nom || admin.email.split('@')[0]
          })),
          ...commercialsRes.data.map(commercial => ({
            ...commercial,
            userType: "commercial",
            id: commercial._id,
            // Ensure all commercial have nom/prenom
            nom: commercial.nom || commercial.name?.split(' ')[0] || "",
            prenom: commercial.prenom || commercial.name?.split(' ')[1] || ""
          }))
        ];
  
        console.log('Combined users data:', combinedUsers);
        setUsers(combinedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
  }, []);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       // Fetch both admins and commercials
  //       const [adminsRes, commercialsRes] = await Promise.all([
  //         axios.get("/admin"),
  //         axios.get("/commercials"),
  //       ]);

  //       // Combine and format the data
  //       const combinedUsers = [
  //         ...adminsRes.data.map((admin) => ({
  //           ...admin,
  //           userType: "admin",
  //         })),
  //         ...commercialsRes.data.map((commercial) => ({
  //           ...commercial,
  //           userType: "commercial",
  //         })),
  //       ];

  //       setUsers(combinedUsers);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  const formatContratItem = (contrat) => ({
    key: contrat._id,
    contractNumber: contrat.contractNumber,
    gestionnaire: contrat.lead?.gestionnaire || "N/A",
    riskType: contrat.riskType,
    insurer: contrat.insurer,
    status: contrat.status,
    source: contrat.type_origine,
    prime: contrat.prime,
    paymentMethod: contrat.paymentMethod,
    anniversary: contrat.anniversary,
    paymentType: contrat.paymentType,
    cree_par: contrat.cree_par,
    lead: contrat.lead,
    effectiveDate: contrat.effectiveDate,
    date_effet: contrat.effectiveDate
      ? new Date(contrat.effectiveDate).toLocaleDateString()
      : "N/A",
    originalData: contrat,
    documents: contrat.documents || [],
  });

  const handleFormSubmit = async (values) => {
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
      session: sessionId,
        sessionModel: sessionModel,
        lead: selectedLeadId,
        isForecast: Boolean(values.isForecast),
        gestionnaire: values.gestionnaireId,
        gestionnaireModel: values.gestionnaireModel,
        gestionnaireName: values.gestionnaireName
      };

      let response;

      if (editingRecord) {
        const contratId = editingRecord.originalData?._id;
        console.log("Updating contrat with ID:", contratId);
        if (!contratId) {
          throw new Error("Missing contrat ID for update");
        }
      
        response = await axios.put(`/contrat/${contratId}`, formData);
        setContratData((prev) =>
          prev.map((item) =>
            item.key === contratId ? formatContratItem(response.data) : item
          )
        );
        setFilteredContrat((prev) =>
          prev.map((item) =>
            item.key === contratId ? formatContratItem(response.data) : item
          )
        );
        message.success("Contrat mis à jour avec succès");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        // CREATE NEW CONTRAT
        response = await axios.post("/contrat", formData);
        const newItem = formatContratItem(response.data);

        setContratData((prev) => [newItem, ...prev]);
        setFilteredContrat((prev) => [newItem, ...prev]);
        setCurrentPage(1);
        message.success("Contrat ajoutée avec succès");
        form.resetFields();
        setIsModalOpen(false);
      }

      setRefreshTrigger((prev) => prev + 1);
      form.resetFields();
      setIsModalOpen(false);
      setEditingRecord(null);
      setUploadedDocument(null);
    } catch (error) {
      console.error("Error saving contrat:", error);
    }
  };

  useEffect(() => {
    const fetchAllContrats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
     
  

      try {
        setLoading(true);
            const decodedToken = jwtDecode(token);
              const currentUserId = decodedToken?.userId;
              const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';
        const response = await axios.get("/contrat");
        console.log("Fetched contrats:", response.data);

        const allContrat = response.data || [];

        let filteredData;
        if (isAdmin) {
          // Admins see all devis
          filteredData = allContrat;
        } else {
          // Commercials only see their own devis
          filteredData = allContrat.filter(
            contrat => contrat.session?._id?.toString() === currentUserId
          );
        }

        const formattedData = filteredData.map(contrat => ({
          key: contrat._id,
          contractNumber: contrat.contractNumber,
          categorie: contrat?.lead?.categorie || "N/A",  // This is correct
          clientName: contrat.lead 
    ? `${contrat.lead.prenom} ${contrat.lead.nom}` 
    : contrat.clientId || "N/A",
    gestionnaire:  contrat.lead?.gestionnaireName || "N/A", 
          riskType: contrat.riskType,
          insurer: contrat.insurer,
          status: contrat.status,
          source: contrat.type_origine,
          commissionRate: contrat.commissionRate,
          recurrentCommission: contrat.recurrentCommission,
          prime: contrat.prime,
          clientId: contrat.clientId || "N/A",
          courtier: contrat.courtier || "Assurnous EAB assurances",
          paymentMethod: contrat.paymentMethod,
          anniversary: contrat.anniversary,
          brokerageFees: contrat.brokerageFees,
          paymentType: contrat.paymentType,
          cree_par: contrat.cree_par,
          type_origine: contrat.type_origine,
          competitionContract: contrat.competitionContract,
          effectiveDate: contrat.effectiveDate,
          date_effet: contrat.effectiveDate
            ? new Date(contrat.effectiveDate).toLocaleDateString()
            : "N/A",
          originalData: contrat,
          documents: contrat.documents || [],
          intermediaire: contrat.intermediaire || "N/A",
          isForecast: Boolean(contrat.isForecast)
        }));
        setContratData(formattedData);
        setFilteredContrat(formattedData);
      } catch (error) {
        console.error(
          "Error fetching contrats:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    
      fetchAllContrats();
  }, [refreshTrigger]);

  // useEffect(() => {
  //   const fetchClientsData = async () => {
  //     setClientLoading(true);
  //     try {
  //       const response = await axios.get("/data");
  //       console.log("Clients data fetched:", response.data);

  //       // Extract the chatData array from response
  //       const clientsData = response.data?.chatData || [];
  //       setClients(clientsData);
  //     } catch (error) {
  //       console.error("Error fetching clients data:", error);
  //       setClients([]);
  //     } finally {
  //       setClientLoading(false);
  //     }
  //   };

  //   fetchClientsData();
  // }, []);

  useEffect(() => {
    const fetchClientsData = async () => {
      setClientLoading(true);
      try {
        const response = await axios.get("/data");
        console.log("Full clients data:", {
          rawResponse: response.data,
          chatData: response.data?.chatData?.map(c => ({
            _id: c._id,
            nom: c.nom,
            prenom: c.prenom,
            gestionnaire: c.gestionnaire,
            gestionnaireName: c.gestionnaireName
          }))
        });
        setClients(response.data?.chatData || []);
      } catch (error) {
        console.error("Error fetching clients data:", error);
        setClients([]);
      } finally {
        setClientLoading(false);
      }
    };
  
    fetchClientsData();
  }, []);
  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer le contrat?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return deleteContract(id);
      },
    });
  };

  const deleteContract = async (id) => {
    try {
      await axios.delete(`/contrat/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContratData(contratData.filter((item) => item.key !== id));
      setFilteredContrat(filteredContrat.filter((item) => item.key !== id));
      message.success("Contrat supprimé avec succès");
    } catch (error) {
      console.error("Error deleting contrat:", error);
    }
  };
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);

    // Safely prepare document data for display
    const document = record?.documents || [];
    const documentList = document.map((doc) => ({
      uid: doc._id || Math.random().toString(36).substring(2, 9),
      name: doc.name,
      status: "done",
      url: doc.url,
      path: doc.path,
      response: doc, // Keep full document reference
    }));

    console.log("Prepared document list:", documentList);

    // Set all form values including documents
    form.resetFields();
    form.setFieldsValue({
      contractNumber: record.contractNumber,
      courtier: record.courtier,
      riskType: record.riskType,
      anniversary: record.anniversary,
      competitionContract: record.competitionContract,
      paymentType: record.paymentType,
      paymentMethod: record.paymentMethod,
      brokerageFees: record.brokerageFees,
      competitionContract: record.competitionContract,
      type_origine: record.type_origine,
      insurer: record.insurer,
      status: record.status,
      lead: record.lead?._id || record.lead,
      type_origine: record.type_origine,
      prime: record.prime,
      commissionRate: record.commissionRate,
      recurrentCommission: record.recurrentCommission,
      isForecast: record.isForecast || false,
      date_effet: record.date_effet,
      // Dates
      effectiveDate: record.effectiveDate
        ? dayjs(record.effectiveDate)
        : null,
      cree_par: record.cree_par,
      gestionnaire: record.gestionnaire,
      intermediaire: record.intermediaire,
      clientId: record.clientId || "N/A",
      document: documentList[0] || null,
    });

    // Set uploaded document state
    setUploadedDocument(documentList[0] || null);
  };

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
      title: "N° contrat",
      dataIndex: "contractNumber",
      key: "contractNumber",
      sorter: (a, b) => a.contractNumber.localeCompare(b.contractNumber),
    },
    // {
    //   title: "Client",
    //   dataIndex: "clientId",
    //   key: "clientId",
    //   render: (clientId, record) => (
    //     <Button
    //       type="link"
    //       onClick={() => handleLeadClick(record.originalData.lead)}
    //       style={{ padding: 0 }}
    //     >
    //       {clientId || "N/A"}
    //     </Button>
    //   ),
    // },
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

    {
      title: "Risque",
      dataIndex: "riskType",
      key: "riskType",
    },
    {
      title: "Assureur",
      dataIndex: "insurer",
      key: "insurer",
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          en_cours: { color: "green", text: "En cours" },
          mise_en_demeure: { color: "volcano", text: "Mise en demeure" },
          reduit: { color: "cyan", text: "Réduit" },
          resilie: { color: "magenta", text: "Résilié" },
          sans_effet: { color: "default", text: "Sans effet" },
          suspendu: { color: "gold", text: "Suspendu" },
          temporaire: { color: "lime", text: "Temporaire" },
        };
        return (
          <Tag color={statusMap[status]?.color || "default"}>
            {statusMap[status]?.text || status}
          </Tag>
        );
      },
      filters: [
        { text: "En cours", value: "en_cours" },
        { text: "Mise en demeure", value: "mise_en_demeure" },
        { text: "Réduit", value: "reduit" },
        { text: "Résilié", value: "resilie" },
        { text: "Sans effet", value: "sans_effet" },
        { text: "Suspendu", value: "suspendu" },
        { text: "Temporaire", value: "temporaire" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Prime TTC",
      dataIndex: "prime",
      key: "prime",
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
    },
    {
      title: "Date d'échéance",
      dataIndex: "anniversary",
      key: "anniversary",
    },
    {
      title: "Commissions",
      dataIndex: "recurrentCommission",
      key: "recurrentCommission",
    },

    {
      title: "Gestionnaire",
      dataIndex: "gestionnaire",
      key: "gestionnaire",
      render: (gestionnaireId, record) => {
        // Get the name from the most reliable source in your data structure
        const gestionnaireName = 
        record.originalData?.session?.name ||          // From populated session
        record.originalData?.lead?.gestionnaireName || // From lead
        record.originalData?.intermediaire ||          // From intermediaire
        "N/A";// Final fallback                             // Final fallback
    
        return (
          <h1 
            style={{ padding: 0 }}
          >
            {gestionnaireName}
          </h1>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.documents?.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                // Open first document in new tab
                window.open(record.documents[0].url, "_blank");
              }}
              type="text"
              title="Télécharger le document"
            />
          )}
          {(userRole === "Admin" ||
            record.originalData.session?._id === currentUserId) && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="text"
            />
          )}
          {userRole === "Admin" && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record.key)}
              type="text"
              danger
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
          <h2 className="text-xs sm:text-sm font-semibold text-blue-800 text-center md:text-left">
            Contrats ({contratData.length})
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
            <Button
              type="secondary"
              className="w-full bg-yellow-400 hover:bg-yellow-500 font-semibold text-black md:w-auto"
              onClick={showModal}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">+</span>
                <span className="text-[10px] sm:text-xs whitespace-nowrap">
                  ENREGISTRER UN CONTRAT
                </span>
              </div>
            </Button>
          </div>
        </div>
        <div className="p-4 bg-white mt-6 border-t rounded-md border-gray-200 shadow-sm">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Date Range Picker */}
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

    {/* Risk Type Select */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
        Risque
      </label>
      <Select
        className="w-full"
        placeholder="-- Choisissez --"
        onChange={(value) => handleFilterChange("risque", value)}
        allowClear
        showSearch
      >
        {RISQUES.map((risque) => (
          <Option key={risque.value} value={risque.value}>
            {risque.label}
          </Option>
        ))}
      </Select>
    </div>
    <div>
  <label className="block text-[12px] font-medium text-gray-700 mb-1">
    Commissions
  </label>
  <Select
  className="w-full"
  placeholder="-- Choisissez --"
  allowClear
  onChange={(value) => {
    // Convert string to proper boolean/null
    let boolValue = null;
    if (value === "true") boolValue = true;
    if (value === "false") boolValue = false;
    handleFilterChange("isForecast", boolValue);
  }}
>
  <Option value="toutes">Toutes</Option>
  <Option value="true">Prévisionnelles</Option>
  <Option value="false">Non prévisionnelles</Option>
</Select>
</div>


    {/* Insurer Select */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
        Assureur
      </label>
      <Select
        className="w-full"
        placeholder="-- Choisissez --"
        onChange={(value) => handleFilterChange("assureur", value)}
        allowClear
        showSearch
      >
        {ASSUREURS.map((assureur) => (
          <Option key={assureur.value} value={assureur.value}>
            {assureur.label}
          </Option>
        ))}
      </Select>
    </div>

    {/* Manager Select */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
        Gestionnaire
      </label>
      <Select
        className="w-full"
        placeholder="-- Choisissez --"
        onChange={(value) => handleFilterChange("gestionnaire", value)}
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
          const displayName =
            user.userType === "admin"
              ? `${user.name}`
              : `${user.nom} ${user.prenom}`;

          return (
            <Option key={user._id} value={user._id}>
              {displayName} (
              {user.userType === "admin" ? "Admin" : "Commercial"})
            </Option>
          );
        })}
      </Select>
    </div>

    {/* Category Select */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
      Type de client
      </label>
      <Select
        className="w-full"
        placeholder="-- Choisissez --"
        onChange={(value) => handleFilterChange("categorie", value)}
        allowClear
      >
        <Option value="tous">Tous les clients</Option>
        <Option value="particulier">Particulier</Option>
        <Option value="professionnel">Professionnel</Option>
        <Option value="entreprise">Entreprise</Option>
      </Select>
    </div>

    {/* Status Select */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
        Statut
      </label>
      <Select
        className="w-full"
        placeholder="Filtrer par statut"
        allowClear
        onChange={(value) => handleFilterChange("status", value)}
      >
        <Option value="en_cours">En cours</Option>
        <Option value="mise_en_demeure">Mise en demeure</Option>
        <Option value="reduit">Réduit</Option>
        <Option value="resilie">Résilié</Option>
        <Option value="sans_effet">Sans effet</Option>
        <Option value="suspendu">Suspendu</Option>
        <Option value="temporaire">Temporaire</Option>
      </Select>
    </div>

    {/* Search Input */}
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1">
        Recherche
      </label>
      <Input
        placeholder="Rechercher..."
        allowClear
        onChange={(e) => handleFilterChange("search", e.target.value)}
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
          dataSource={filteredContrat.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredContrat.length,
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
          // rowSelection={rowSelection}
          tableLayout="auto"
        />
      </div>
      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">
              {editingRecord ? "MODIFIER LE CONTRAT" : "ENREGISTRER UN CONTRAT"}
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
          >
            {/* INFORMATION SECTION */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">INFORMATIONS</h2>
              <Form.Item
                label="Client"
                name="clientId"
                rules={[
                  {
                    required: true,
                    message: "Veuillez sélectionner un client",
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  className="w-full"
                  loading={clientLoading}
                  onChange={handleClientChange}
                  placeholder="-- Sélectionnez un client --"
                  filterOption={(input, option) => {
                    const children = option.children?.props?.children || "";
                    return String(children)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                  notFoundContent={
                    clientLoading ? "Chargement..." : "Aucun client trouvé"
                  }
                >
                  {clients.map((client) => (
                    <Option key={client._id} value={client._id}>
                      <div className="flex justify-between">
                        <span>
                          {client.nom || ""}{" "}
                          {client.prenom && `- ${client.prenom}`}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            
            </div>

            {/* CONTRACT SECTION */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">CONTRAT</h2>

              <Form.Item
                name="contractNumber"
                label="N° contrat"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="N° contrat" />
              </Form.Item>

              <Form.Item
                name="riskType"
                label="Risque"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select placeholder="-- Choisissez --">
                  {RISQUES.map((risque) => (
                    <Option key={risque.value} value={risque.value}>
                      {risque.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="insurer"
                label="Assureur"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="-- Choisissez --"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {ASSUREURS.map((assureur) => (
                    <Option key={assureur.value} value={assureur.value}>
                      {assureur.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="effectiveDate"
                label="Date d'effet"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="anniversary" label="Echéance anniversaire">
                <Input placeholder="jour/mois" />
              </Form.Item>

              <Form.Item name="competitionContract" label="Contrat concurrence">
                <Radio.Group>
                  <Radio value="oui">oui</Radio>
                  <Radio value="non">non</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="paymentType" label="Type de paiement">
                <Select placeholder="Choisissez">
                  <Option value="annuel">Annuel</Option>
                  <Option value="mensuel">Mensuel</Option>
                  <Option value="prime_unique">Prime unique</Option>
                  <Option value="semestriel">Semestriel</Option>
                  <Option value="trimestriel">Trimestriel</Option>
                  <Option value="versements_libres">Versements libres</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Statut"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select placeholder="Choisissez">
                  <Option value="en_cours">En cours</Option>
                  <Option value="mise_en_demeure">Mise en demeure</Option>
                  <Option value="reduit">Réduit</Option>
                  <Option value="resilie">Résilié</Option>
                  <Option value="sans_effet">Sans effet</Option>
                  <Option value="suspendu">Suspendu</Option>
                  <Option value="temporaire">Temporaire</Option>
                </Select>
              </Form.Item>

              <Form.Item name="paymentMethod" label="Modalité de paiement">
                <Select placeholder="Choisissez">
                  <Option value="cb">CB</Option>
                  <Option value="cheque">Chèque</Option>
                  <Option value="prelevement">Prélèvement</Option>
                </Select>
              </Form.Item>

              <Form.Item name="prime" label="Prime TTC">
                <Input addonAfter="€" />
              </Form.Item>

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
              {/* <Form.Item
                label={
                  <span className="text-xs font-medium">GESTIONNAIRE*</span>
                }
                name="gestionnaire"
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: "Veuillez sélectionner un gestionnaire",
                  },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder={
                    loading
                      ? "Chargement..."
                      : "-- Choisissez un gestionnaire --"
                  }
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
                        {user.userType === "admin" ? "Admin" : "Commercial"})
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item> */}
            <Form.Item
  label={<span className="text-xs font-medium">GESTIONNAIRE*</span>}
  name="gestionnaire"  // This should be the display name
  className="mb-0"
  rules={[
    {
      required: true,
      message: "Veuillez sélectionner un gestionnaire",
    },
  ]}
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
        <Option key={user._id} value={displayName}>  {/* Use display name as value */}
          {displayName} ({user.userType === "admin" ? "Admin" : "Commercial"})
        </Option>
      );
    })}
  </Select>
</Form.Item>

<Form.Item name="gestionnaireId" hidden>
  <Input />
</Form.Item>
<Form.Item name="gestionnaireModel" hidden>
  <Input />
</Form.Item>
<Form.Item name="gestionnaireName" hidden>
  <Input />
</Form.Item>

              <Form.Item
                label={<span className="text-xs font-medium">CRÉÉ PAR*</span>}
                name="cree_par"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
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
                        {user.userType === "admin" ? "Admin" : "Commercial"})
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">INTERMÉDIAIRE</span>
                }
                name="intermediaire"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
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
                        {user.userType === "admin" ? "Admin" : "Commercial"})
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </div>

            {/* COMMISSIONS SECTION */}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">COMMISSIONS</h2>
              <Form.Item
                name="isForecast"
                label="Prévisionnel"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="prévisionnelle"
                  unCheckedChildren="non prévisionnelle"
                />
              </Form.Item>

              <Form.Item name="commissionRate" label="Taux de commission">
                <Input addonAfter="%" />
              </Form.Item>

              <Form.Item name="brokerageFees" label="Frais de courtage">
                <Input addonAfter="€" />
              </Form.Item>

              <Form.Item
                name="recurrentCommission"
                label="Commission récurrente"
              >
                <Input addonAfter="€" />
              </Form.Item>
            </div>

            {/* RATTACHEMENT SECTION */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">RATTACHEMENT</h2>
              <Form.Item
                name="courtier"
                label="Courtier"
                initialValue="Assurnous EAB assurances"
                className="w-full"
              >
                <Input
                  readOnly
                  value="Assurnous EAB assurances"
                  className="w-full"
                />
              </Form.Item>
              <h2 className="text-sm font-semibold mt-3 mb-2">DOCUMENTS</h2>

              <Form.Item name="document" label="Contrat Document">
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
            </div>
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
              ? "Modifier le contrat"
              : "Enregistrer le contrat"}
          </button>
        </div>
      </Modal>
    </section>
  );
};

export default AllCommands;
