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
  Popconfirm,
  Upload,
  Spin,
  Divider,
  Typography,
  Row,
  Col,
  Alert,
  Popover,
  Card,
} from "antd";
import { CloseOutlined, EditOutlined, DeleteOutlined, DownloadOutlined  } from "@ant-design/icons";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import FileUpload from "./FileUpload";
import { jwtDecode } from "jwt-decode";
// import moment from "moment";
import dayjs from "dayjs";
import { ASSUREURS, RISQUES } from "../../constants";

const { Option } = Select;

const SinistreTabContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [devisData, setDevisData] = useState([]);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDevis, setFilteredDevis] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState(null);
  const [chatData, setChatData] = useState([]);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;


  const handleStatusFilter = (value) => {
    setStatusFilter(value);

    if (value === "all") {
      setFilteredDevis(devisData);
    } else {
      const filtered = devisData.filter((devis) => devis.statut === value);
      setFilteredDevis(filtered);
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
        if (userRole?.toLowerCase() === 'admin') { // Case-insensitive check
          console.log("Admin access - showing all leads", allLeads.length);
          setChatData(allLeads);
          return;
        }
  
        // For commercial, filter leads
        const filteredLeads = allLeads.filter((lead) => {
          const commercial = lead.commercial || {};
          const clientcreatedByCommercial = lead.cree_par || "";
          
          return (
            (commercial._id === currentUserId && 
             commercial.nom === lastName && 
             commercial.prenom === firstName) ||
            clientcreatedByCommercial === userName
          );
        });
  
        console.log("Filtered leads for commercial:", filteredLeads);
        setChatData(filteredLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
        message.error("Failed to fetch leads");
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

        if (chatData?.gestionnaire) {
          setGestionnaire(chatData.gestionnaire);
          form.setFieldsValue({
            gestionnaire: chatData.gestionnaire._id || chatData.gestionnaire,
          });
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, form, users]);


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
    const currentUserId = decodedToken?.userId;
    
    try {
      // Prepare form data with document if exists
      const formData = {
        ...values,
        documents: uploadedDocument ? [uploadedDocument] : [],
        gestionnaire: gestionnaire.name || gestionnaire._id,
        session: currentUserId,
        lead: id,
      };
  
      let response;
      
      if (editingRecord) {
        // UPDATE EXISTING DEVIS
        const devisId = editingRecord.originalData?._id;
        if (!devisId) {
          throw new Error("Missing devis ID for update");
        }
  
        response = await axios.put(`/devis/${devisId}`, formData);
      setDevisData(prev => prev.map(item => 
        item.key === devisId ? formatDevisItem(response.data) : item
      ));
      setFilteredDevis(prev => prev.map(item => 
        item.key === devisId ? formatDevisItem(response.data) : item
      ));
        message.success("Devis mis à jour avec succès");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        // CREATE NEW DEVIS
        response = await axios.post("/sinistres", formData);
        const newItem = formatDevisItem(response.data);
      
        setDevisData(prev => [newItem, ...prev]);
        setFilteredDevis(prev => [newItem, ...prev]);
        setDevisData(prev => [response.data, ...prev]);
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

  

  // useEffect(() => {
  //   const fetchAllSinistresByID = async () => {
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

  //       const formattedData = response.data.data.map((devis, index) => ({
  //         key: devis._id,
  //         numero_devis: devis.numero_devis,
  //         gestionnaire: devis.lead.gestionnaire,
  //         risque: devis.risque,
  //         assureur: devis.assureur,
  //         statut: devis.statut,
  //         source: devis.type_origine,
  //         date_effet: devis.date_effet
  //           ? new Date(devis.date_effet).toLocaleDateString()
  //           : "N/A",
  //         originalData: devis,
  //         documents: devis.documents || [],
  //         intermediaire: devis.intermediaire || "N/A",
          
  //       }));

  //       setDevisData(formattedData);
  //       setFilteredDevis(formattedData); // Initialize filtered data with all devis

  //     } catch (error) {
  //       console.error(
  //         "Error fetching devis:",
  //         error.response?.data || error.message
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

 
  //     fetchAllSinistresByID();
  // }, []);

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
        console.log("Fetched sinistres:", response.data);
        const formattedData = response.data.data.map(sinistre => ({
          key: sinistre._id,
          numeroSinistre: sinistre.numeroSinistre,
          dateSinistre: new Date(sinistre.dateSinistre).toLocaleDateString(),
          statutSinistre: sinistre.statutSinistre,
          risque: sinistre.risque,
          assureur: sinistre.assureur,
          dateDeclaration: sinistre.dateDeclaration
            ? new Date(sinistre.dateDeclaration).toLocaleDateString()
            : "N/A",
          gestionnaire: sinistre.gestionnaire || "N/A",
          contratExist: sinistre.contratExist || "non",
          contratDetails: sinistre.contratDetails || null,
          contratSelect: sinistre.contratSelect || "N/A",
          sinistreInput: sinistre.sinistreInput || "N/A",
          sinistreDetails: sinistre.sinistreDetails || {},
          responsabilite: sinistre.responsabilite || "N/A",
          contratNumber: sinistre.contratDetails?.numeroContrat || "N/A",
          createdAt: sinistre.createdAt,
          typeSinistre: sinistre.typeSinistre,
          montantSinistre: sinistre.montantSinistre,
          originalData: sinistre
        }));
  
        setDevisData(formattedData);
        setFilteredDevis(formattedData);
  
      } catch (error) {
        console.error("Error fetching sinistres:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSinistresForLead();
  }, [id, token]);

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

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };
 
  const columns = [
    {
      title: "N° sinistre",
      dataIndex: "numeroSinistre",
      key: "numeroSinistre",
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
          'en_cours': 'En cours',
          'clo': 'Clôturé',
          'reouvert': 'Réouvert'
        };
        return statusMap[status] || status;
      },
      filters: [
        { text: 'En cours', value: 'en_cours' },
        { text: 'Clôturé', value: 'clo' },
        { text: 'Réouvert', value: 'reouvert' }
      ],
      onFilter: (value, record) => record.statutSinistre === value,
    },
    {
      title: "Type",
      dataIndex: "typeSinistre",
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
      dataIndex: "montantSinistre",
      key: "montantSinistre",
      render: (amount) => amount ? `${amount.toLocaleString()} €` : "N/A",
      sorter: (a, b) => (a.montantSinistre || 0) - (b.montantSinistre || 0),
    },
    {
      title: "Délégation",
      dataIndex: "delegation",
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
      key: "gestionnaire",
      render: (_, record) => {
        // First check sinistreDetails.gestionnaireName (your data shows this exists)
        if (record.sinistreDetails?.gestionnaireName) {
          return record.sinistreDetails.gestionnaireName;
        }
        
        // Fallback to session name if available
        if (record.session) {
          if (typeof record.session === 'object') {
            return record.session.name || `${record.session.nom || ''} ${record.session.prenom || ''}`.trim();
          }
          // return `Gestionnaire (ID: ${record.session})`;
        }
        
        // Final fallback
        return "N/A";
      },
    },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
    gestionnaire: record.originalData?.lead.gestionnaire,
    intermediaire: record.originalData?.intermediaire,
    
    document: documentList[0] || null
  });

  // Set uploaded document state
  setUploadedDocument(documentList[0] || null);
};



 

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce devis?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return deleteDevis(id);
      },
    });
  };

  const deleteDevis = async (id) => {
    try {
      await axios.delete(`/devis/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDevisData(devisData.filter((item) => item.key !== id));
      setFilteredDevis(filteredDevis.filter((item) => item.key !== id));
      message.success("Devis supprimé avec succès");
    } catch (error) {
      console.error("Error deleting devis:", error);
      message.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
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
            <Option value="etude">En étude</Option>
            <Option value="devis_envoye">Devis envoyé</Option>
            <Option value="attente_signature">En attente signature</Option>
            <Option value="cloture_sans_suite">Clôturé sans suite</Option>
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
        dataSource={filteredDevis}
        loading={loading}
        bordered
        // pagination={{ pageSize: 10 }}
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
        scroll={{ x: "max-content" }}
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
>
  {/* === INFORMATIONS === */}
  <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATIONS</h2>

  <Form.Item
    name="numero_sinistre"
    label="N° du sinistre"
    rules={[{ required: false, message: "Ce champ est obligatoire" }]}
    className="w-full"
  >
    <Input placeholder="N° du sinistre" className="w-full" />
  </Form.Item>

  {/* === LE SINISTRE === */}
  <h2 className="text-sm font-semibold mt-3 mb-2">LE SINISTRE</h2>

  <Form.Item
    name="sinistre_existe_crm"
    label="Le sinistré existe-t-il dans votre CRM ?"
    className="w-full"
  >
    <Radio.Group>
      <Radio value="oui">Oui</Radio>
      <Radio value="non">Non</Radio>
    </Radio.Group>
  </Form.Item>

  <Form.Item
  name="sinistre"
  label="Sinistré"
  className="w-full"
  rules={[{ required: true, message: 'Veuillez sélectionner un sinistré' }]}
>
  <Select
    showSearch
    placeholder="Sélectionnez un sinistré"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
    className="w-full"
  >
    {chatData
      .filter(lead => {
        // For admin, show all clients
        if (userRole === 'Admin') return true;
        
        // For commercial, only show their own clients
        const commercial = lead.commercial || {};
        const clientcreatedByCommercial = lead.cree_par || {};
        const decodedToken = jwtDecode(localStorage.getItem("token"));
        const name = decodedToken?.name || "";
        
        return (
          (commercial._id === currentUserId && 
           commercial.nom === lastName && 
           commercial.prenom === firstName) ||
          clientcreatedByCommercial === name
        );
      })
      .map(lead => (
        <Option key={lead._id} value={lead.nom}>
          {`${lead.nom} ${lead.prenom || ''}`} - {lead.email || ''}
        </Option>
      ))
    }
  </Select>
</Form.Item>

  <Form.Item
    name="contrat_existe_crm"
    label="Le contrat existe-t-il dans votre CRM ?"
    className="w-full"
  >
    <Radio.Group>
      <Radio value="oui">Oui</Radio>
      <Radio value="non">Non</Radio>
    </Radio.Group>
  </Form.Item>

  <Form.Item
    name="numero_contrat"
    label="Numéro de contrat"
    className="w-full"
  >
    <Input placeholder="Numéro de contrat" className="w-full" />
  </Form.Item>

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
    name="date_sinistre"
    label="Date du sinistre"
    className="w-full"
  >
    <DatePicker className="w-full" />
  </Form.Item>

  <Form.Item
    name="date_declaration"
    label="Date de déclaration *"
    className="w-full"
  >
    <DatePicker className="w-full" />
  </Form.Item>

  <Form.Item
    name="statut_sinistre"
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
    name="type_sinistre"
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
    name="montant_sinistre"
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
    name="sinistre_delegation"
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
<Form.Item
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
