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
  Divider,
  Upload,
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

const ReclamtionTabContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
    const [showOtherServiceInput, setShowOtherServiceInput] = useState(false);
  const { id } = useParams();
  const [reclamtionData, setReclamtionData] = useState([]);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredReclamation, setFilteredReclamation] = useState([]);
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
      setFilteredReclamation(reclamtionData);
    } else {
      const filtered = reclamtionData.filter((devis) => devis.statut === value);
      setFilteredReclamation(filtered);
    }
  };

  const handleClientChange = (clientId) => {
    setSelectedLeadId(clientId);
    const selectedClient = chatData.find((client) => client._id === clientId);
    if (selectedClient) {
      form.setFieldsValue({
        nom_reclamant: `${selectedClient.prenom} ${selectedClient.nom}`.trim(),
        email: selectedClient.email,
        portable: selectedClient.portable,
        existe_crm: "oui",
      });
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

    if (!decodedToken) {
      message.error("Utilisateur non authentifié");
      return;
    }
    const isAdmin = decodedToken.role === 'Admin' || decodedToken.role === 'admin';
    const sessionId = decodedToken.userId;
    const sessionModel = isAdmin ? 'Admin' : 'Commercial';
    
    try {
      // Prepare form data with document if exists
      const formData = {
        ...values,
        documents: uploadedDocument ? [uploadedDocument] : [],
        gestionnaire: gestionnaire.name || gestionnaire._id,
        session: sessionId,
        sessionModel: sessionModel,
        lead: id,
      };
  
      let response;
      
      if (editingRecord) {
        // UPDATE EXISTING DEVIS
        const reclamationId = editingRecord.originalData?._id;
        console.log("Editing reclamation ID:", reclamationId);
        if (!reclamationId) {
          throw new Error("Missing devis ID for update");
        }
  
        response = await axios.put(`/reclamations/${reclamationId}`, formData);
      setReclamtionData(prev => prev.map(item => 
        item.key === reclamationId ? formatDevisItem(response.data) : item
      ));
      setFilteredReclamation(prev => prev.map(item => 
        item.key === reclamationId ? formatDevisItem(response.data) : item
      ));
        message.success("Reclamation mise à jour avec succès");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        // CREATE NEW RECLAMATION
        response = await axios.post("/reclamations", formData);
        const newItem = formatDevisItem(response.data);
      
        setReclamtionData(prev => [newItem, ...prev]);
        setFilteredReclamation(prev => [newItem, ...prev]);
        setReclamtionData(prev => [response.data, ...prev]);
        setCurrentPage(1);
        message.success("Reclamation ajoutée avec succès");
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
    const fetchAllReclamations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/reclamations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-ID": jwtDecode(token).userId,
            "X-User-Role": jwtDecode(token).role
          }
        });
  
        console.log("Full API response:", response.data);
  
        const formattedData = response.data.data?.map(reclamation => ({
          key: reclamation._id,
          nom_reclamant: reclamation.nom_reclamant || 
          `${reclamation.leadId?.nom || ""} ${reclamation.leadId?.prenom || ""}`.trim(),
existe_crm: reclamation.existe_crm,
leadId: reclamation.leadId,
          numero_reclamation: reclamation.numero_reclamation,
          gestionnaire: reclamation.leadId?.gestionnaireName || "N/A",
          risque: reclamation.risque || "N/A",
          assureur: reclamation.assureur,
          statut: reclamation.statut_reclamant,
          source: reclamation.canal_reclamation,
          motif: reclamation.motif || "N/A",
          date_effet: reclamation.date_reclamation 
            ? new Date(reclamation.date_reclamation).toLocaleDateString()
            : "N/A",
          originalData: reclamation,
          documents: reclamation.attachments || [],
     
          date_reclamation: reclamation.date_reclamation
            ? new Date(reclamation.date_reclamation).toLocaleDateString()
            : "N/A",
            issue: reclamation.issue || "N/A",
          date_cloture: reclamation.date_cloture,
          intermediaire: reclamation.declarant || "N/A"
        })) || [];
  
        setReclamtionData(formattedData);
        setFilteredReclamation(formattedData);
  
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllReclamations();
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


  const columns = [
    {
      title: "N° réclamation",
      dataIndex: "numero_reclamation",
      key: "numero_reclamation",
    },
    // {
    //   title: "Client",
    //   key: "client",
    //   render: (_, record) =>
    //     record.existe_crm === "oui"
    //       ? record.nom_reclamant
    //       : `${record.nom_reclamant_input || ""} ${
    //           record.prenom_reclamant_input || ""
    //         }`.trim(),
    // },
    {
      title: "Client",
      key: "client",
      render: (_, record) => {
        // If CRM exists, check both possible locations for name
        if (record.existe_crm === "oui") {
          return record.nom_reclamant || 
                 `${record.leadId?.nom || ""} ${record.leadId?.prenom || ""}`.trim();
        }
        // Fallback to input fields if no CRM
        return `${record.nom_reclamant_input || ""} ${record.prenom_reclamant_input || ""}`.trim();
      },
    },
    {
      title: "Motif",
      dataIndex: "motif",
      key: "motif",
    },
    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Date de réclamation",
      dataIndex: "date_reclamation",
      key: "date_reclamation",
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Date de clôture",
      dataIndex: "date_cloture",
      key: "date_cloture",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
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
  

  // Set all form values including documents
  form.resetFields();
 const formValues = {
       numero_reclamation: record.numero_reclamation,
       date_reclamation: record.date_reclamation
         ? dayjs(record.date_reclamation)
         : null,
       canal_reclamation: record.canal_reclamation,
       date_accuse: record.date_accuse ? dayjs(record.date_accuse) : null,
       declarant: record.declarant,
       statut_reclamant: record.statut_reclamant || "particulier",
       existe_crm: record.existe_crm || "oui",
       assureur: record.assureur,
       motif: record.motif,
       leadId: record.lead || null,
       service_concerne: record.service_concerne,
       prise_en_charge_par: record.prise_en_charge_par,
       niveau_traitement: record.niveau_traitement,
       reference: record.reference,
       commentaire: record.commentaire,
       issue: record.issue,
       nom_reclamant_input: record.nom_reclamant_input || "",
       prenom_reclamant_input: record.prenom_reclamant_input || "",
     };
 
     // Handle client information
     if (record.existe_crm === "oui") {
       const matchingClient = chatData.find(
         (client) =>
           `${client.nom} ${client.prenom}` === record.nom_reclamant ||
           client.denomination_commerciale === record.nom_reclamant
       );
       formValues.nom_reclamant = matchingClient?._id || record.nom_reclamant;
     } else {
       formValues.nom_reclamant_input = record.nom_reclamant_input;
       formValues.prenom_reclamant_input = record.prenom_reclamant_input;
     }

     setTimeout(() => {
      form.setFieldsValue(formValues);
    }, 100);
};



 

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer la déclaration?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return deleteReclamation(id);
      },
    });
  };

  const deleteReclamation = async (id) => {
    try {
      await axios.delete(`/reclamations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReclamtionData(reclamtionData.filter((item) => item.key !== id));
      setFilteredReclamation(filteredReclamation.filter((item) => item.key !== id));
      message.success("Déclaration supprimée avec succès");
    } catch (error) {
      console.error("Error deleting déclaration:", error);
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
          Enregistrer une réclamation
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
        dataSource={filteredReclamation}
        loading={loading}
        bordered
        // pagination={{ pageSize: 10 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredReclamation.length,
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
              {/* ENREGISTRER UNE RECLAMATION */}
              {editingRecord
                ? "MODIFIER UNE RECLAMATION"
                : "ENREGISTRER UNE RECLAMATION"}
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
            className="space-y-2 w-full"
          >
            {/* === INFORMATION === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATIONS</h2>

            <Form.Item
              label="N° de la réclamation"
              name="numero_reclamation"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="N° de la réclamation"
              />
            </Form.Item>

            <Form.Item
              label="Date de réclamation"
              name="date_reclamation"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" />
            </Form.Item>

            <Form.Item
              label="Canal de réclamation"
              name="canal_reclamation"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="courrier">Courrier</Option>
                <Option value="mail">Mail</Option>
                <Option value="oral">Oral</Option>
                <Option value="telephone">Téléphone</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Date d'accusé de réclamation"
              name="date_accuse"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" />
            </Form.Item>

            <Form.Item
              label="Déclarant"
              name="declarant"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez--"
                showSearch
                optionFilterProp="children"
              >
                <Option value="acpr">ACPR</Option>
                <Option value="association_consommateurs">
                  Association de consommateurs
                </Option>
                <Option value="avocat">Avocat</Option>
                <Option value="cnil">CNIL</Option>
                <Option value="ddpp">DDPP</Option>
                <Option value="mandataire">Mandataire</Option>
                <Option value="reclamant">Réclamant</Option>
              </Select>
            </Form.Item>

            {/* === LE RÉCLAMANT === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">LE RÉCLAMANT</h2>

            <Form.Item
              label="Statut du réclamant"
              name="statut_reclamant"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="ancient_client" label="Ancient client">
                  Ancient client
                </Option>
                <Option value="ayant_droit" label="Ayant-droit">
                  Ayant-droit
                </Option>
                <Option value="beneficiaire" label="Bénéficiaire">
                  Bénéficiaire
                </Option>
                <Option value="client" label="Client">
                  Client
                </Option>
                <Option value="prospect" label="Prospect">
                  Prospect
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Existe-t-il dans votre CRM ?"
              name="existe_crm"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
              initialValue="oui" // Set default value
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {() => {
                return form.getFieldValue("existe_crm") === "oui" ? (
                  <Form.Item
                    label="Nom du réclamant"
                    name="nom_reclamant"
                    rules={[
                      { required: true, message: "Ce champ est obligatoire" },
                    ]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      className="w-full"
                      onChange={handleClientChange}
                      placeholder="-- Choisissez --"
                      loading={loading}
                    >
                      {chatData.map((client) => (
                        <Option key={client._id} value={client._id}>
                          {client.nom} {client.prenom && `- ${client.prenom}`}
                          {client.denomination_commerciale &&
                            ` (${client.denomination_commerciale})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      label="Nom du réclamant"
                      name="nom_reclamant_input"
                      rules={[
                        {
                          required: form.getFieldValue("existe_crm") === "non",
                          message: "Ce champ est obligatoire",
                        },
                      ]}
                    >
                      <Input placeholder="Nom du réclamant" />
                    </Form.Item>
                    <Form.Item
                      label="Prénom du réclamant"
                      name="prenom_reclamant_input"
                      rules={[
                        {
                          required: form.getFieldValue("existe_crm") === "non",
                          message: "Ce champ est obligatoire",
                        },
                      ]}
                    >
                      <Input placeholder="Prénom du réclamant" />
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>

            {/* === DÉTAIL DE LA RÉCLAMATION === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              DÉTAIL DE LA RÉCLAMATION
            </h2>

            <Form.Item
              label="Assureur"
              name="assureur"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select placeholder="-- Choisissez --" className="w-full">
                {ASSUREURS.map((assureur) => (
                  <Option key={assureur.value} value={assureur.value}>
                    {assureur.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Motif de la réclamation"
              name="motif"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                showSearch
                optionFilterProp="children"
              >
                <Select.OptGroup label="Souscription">
                  <Option value="demarchage">Démarchage</Option>
                  <Option value="engagement_conteste">
                    Engagement contesté
                  </Option>
                  <Option value="documents_contractuels">
                    Documents Contractuels
                  </Option>
                  <Option value="abus_faiblesse">Abus de Faiblesse</Option>
                  <Option value="premier_contrat_non_resilie">
                    1er contrat non résilié
                  </Option>
                  <Option value="signature_contrat">
                    Signature du contrat
                  </Option>
                </Select.OptGroup>

                {/* Gestion du contrat */}
                <Select.OptGroup label="Gestion du contrat">
                  <Option value="delai_traitement">Délai de traitement</Option>
                  <Option value="teletransmission">Télétransmission</Option>
                  <Option value="carte_tiers_payant">Carte Tiers Payant</Option>
                  <Option value="espace_client">Espace client</Option>
                  <Option value="documents_contractuels_gestion">
                    Documents contractuels
                  </Option>
                  <Option value="mecintentement_general">
                    Mécontentement général
                  </Option>
                </Select.OptGroup>

                {/* Indemnisation/Prestation */}
                <Select.OptGroup label="Indemnisation/Prestation">
                  <Option value="garantie">Garantie</Option>
                  <Option value="prestations">Prestations</Option>
                  <Option value="liquidation_professionnel_sante">
                    Liquidation Professionnel de Santé
                  </Option>
                  <Option value="mecintentement_general_indemnisation">
                    Mécontentement général
                  </Option>
                </Select.OptGroup>

                {/* Tarification */}
                <Select.OptGroup label="Tarification">
                  <Option value="cotisations">Cotisations</Option>
                  <Option value="reglement_cotisation">
                    Réglement Cotisation
                  </Option>
                  <Option value="tarif">Tarif</Option>
                </Select.OptGroup>

                {/* Fin du contrat */}
                <Select.OptGroup label="Fin du contrat">
                  <Option value="resiliation">Résiliation</Option>
                  <Option value="renonciation">Rénonciation</Option>
                  <Option value="resiliation_deces">Résiliation Décès</Option>
                </Select.OptGroup>
              </Select>
            </Form.Item>

            <Form.Item
              label="Service concerné"
              name="service_concerne"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7 flex"
                placeholder="-- Sélectionnez --"
                mode="single"
                optionLabelProp="label"
                onChange={(value) => {
                  setShowOtherServiceInput(value === "autre");
                }}
                tagRender={({ label, value, closable, onClose }) => (
                  <Tag
                    color={
                      value === "assureur"
                        ? "blue"
                        : value === "cabinet"
                        ? "green"
                        : value === "courtier"
                        ? "orange"
                        : value === "partenaire"
                        ? "purple"
                        : "gray"
                    }
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3, borderRadius: 12 }}
                  >
                    {label}
                  </Tag>
                )}
              >
                <Option value="assureur" label="Assureur">
                  <Space>
                    <Tag color="blue" style={{ borderRadius: 12 }}>
                      Assureur
                    </Tag>
                    <span>Service de l'assureur</span>
                  </Space>
                </Option>

                <Option value="cabinet" label="Cabinet">
                  <Space>
                    <Tag color="green" style={{ borderRadius: 12 }}>
                      Cabinet
                    </Tag>
                    <span>Service du cabinet</span>
                  </Space>
                </Option>

                <Option value="courtier" label="Courtier du cabinet">
                  <Space>
                    <Tag color="orange" style={{ borderRadius: 12 }}>
                      Courtier
                    </Tag>
                    <span>Courtier du cabinet</span>
                  </Space>
                </Option>

                <Option value="partenaire" label="Partenaire">
                  <Space>
                    <Tag color="purple" style={{ borderRadius: 12 }}>
                      Partenaire
                    </Tag>
                    <span>Service partenaire</span>
                  </Space>
                </Option>

                <Option value="autre" label="Autre">
                  <Space>
                    <Tag color="gray" style={{ borderRadius: 12 }}>
                      Autre
                    </Tag>
                    <span>Autre service</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
            {showOtherServiceInput && (
              <Form.Item
                name="autre_service"
                label="Précisez*"
                rules={[
                  {
                    required: false,
                    message: "Le champ autre service est obligatoire",
                  },
                ]}
              >
                <Input
                  placeholder="Précisez le service"
                  className="w-full text-xs h-7"
                />
              </Form.Item>
            )}

            <Form.Item
              label="Pris en charge par"
              name="prise_en_charge_par"
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
                      {user.userType === "admin" ? "Admin" : "Commercial"})
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              label="Niveau de traitement"
              name="niveau_traitement"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="1">1</Option>
                <Option value="2">2</Option>
                <Option value="2S">2S</Option>
                <Option value="3">3</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Référence (devis, contrat, sinistre, etc.)"
              name="reference"
            >
              <Input className="w-full text-xs h-7" placeholder="Référence" />
            </Form.Item>

            <Form.Item
              label="Commentaire"
              name="commentaire"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input.TextArea
                rows={3}
                className="w-full text-xs"
                placeholder="Commentaire"
              />
            </Form.Item>

            <Form.Item
              label="Issue"
              name="issue"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="defavorable">Défavorable</Option>
                <Option value="defense_portefeuille">
                  Défense de portefeuille
                </Option>
                <Option value="favorable">Favorable</Option>
                <Option value="partielle">Partielle</Option>
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
    </div>
  );
};

export default ReclamtionTabContent;
