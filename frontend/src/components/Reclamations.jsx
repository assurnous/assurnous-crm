import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Modal,
  Form,
  Radio,
  message,
  Tooltip,
  Space,
  Tag,
} from "antd";
const { RangePicker } = DatePicker;
import { CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ASSUREURS } from "../constants";
import ReclamationChatSidebar from "../pages/Chat";

const { Option } = Select;

const Reclamations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [allReclamations, setAllReclamations] = useState([]);
  const [showOtherServiceInput, setShowOtherServiceInput] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filteredReclamationsForChat, setFilteredReclamationsForChat] = useState([]);
  const [filters, setFilters] = useState({
    periode: null,
    motif: "tous",
    assureur: "tous",
    issue: "tous",
    gestionaire: "tous",
    statut_reclamant: "tous",
    search: "",
  });

  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };
  const filteredReclamations = useMemo(() => {
    return allReclamations.filter((reclamation) => {
      if (filters.periode && filters.periode[0] && filters.periode[1]) {
        const claimDate = new Date(reclamation.date_reclamation);
        const startDate = new Date(filters.periode[0]);
        const endDate = new Date(filters.periode[1]);

        // Normalize dates to midnight for day comparison
        const normalizedClaim = new Date(
          claimDate.getFullYear(),
          claimDate.getMonth(),
          claimDate.getDate()
        );
        const normalizedStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const normalizedEnd = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        if (
          normalizedClaim < normalizedStart ||
          normalizedClaim > normalizedEnd
        ) {
          return false;
        }
      }

      // Motif filter
      if (filters.motif !== "tous" && reclamation.motif !== filters.motif) {
        return false;
      }

      // Assureur filter
      if (
        filters.assureur !== "tous" &&
        reclamation.assureur !== filters.assureur
      ) {
        return false;
      }

      // Issue filter
      if (filters.issue !== "tous" && reclamation.issue !== filters.issue) {
        return false;
      }

      // Statut réclamant filter (particulier/entreprise/professionnel)
      if (
        filters.statut_reclamant !== "tous" &&
        reclamation.statut_reclamant !== filters.statut_reclamant
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = [
          reclamation.numero_reclamation,
          reclamation.nom_reclamant,
          reclamation.nom_reclamant_input,
          reclamation.reference,
          reclamation.commentaire,
        ].some((field) => field && field.toLowerCase().includes(searchLower));

        if (!matches) return false;
      }

      return true;
    });
  }, [allReclamations, filters]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
  };
  // const fetchReclamations = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
    
  //   setLoading(true);
  //   try {
  //     const decodedToken = jwtDecode(token);
  //     const currentUserId = decodedToken?.userId;
  //     const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';

  //     // Fetch all reclamations
  //     const response = await axios.get("/reclamations");
  //     const allReclamations = response.data.data || [];

  //     // Filter based on role
  //     let filteredData;
  //     if (isAdmin) {
  //       // Admins see all reclamations
  //       filteredData = allReclamations;
  //     } else {
  //       // Commercials only see their own reclamations
  //       filteredData = allReclamations.filter(
  //         reclamation => reclamation.session?._id.toString() === currentUserId
  //       );
  //     }

  //     setAllReclamations(filteredData);
     
      
  //   } catch (error) {
  //     console.error("Error fetching reclamations:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchReclamations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setLoading(true);
    try {
      const decodedToken = jwtDecode(token);
      const currentUserId = decodedToken?.userId;
      const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';
  
      // Fetch all reclamations
      const response = await axios.get("/reclamations");
      const allReclamations = response.data.data || [];
  
      // Filter based on role
      let filteredData;
      if (isAdmin) {
        // Admins see all reclamations
        filteredData = allReclamations;
      } else {
        // Commercials see their own reclamations AND assigned reclamations
        filteredData = allReclamations.filter(
          reclamation => 
            reclamation.session?._id.toString() === currentUserId ||
            reclamation.assignedTo?.toString() === currentUserId
        );
      }
  
      setAllReclamations(filteredData);
      
    } catch (error) {
      console.error("Error fetching reclamations:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {

    fetchReclamations();
  }, [refreshTrigger]);

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue({
        existe_crm: "oui", // Set default value
      });
    }
  }, [isModalOpen, form]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !allReclamations.length) return;
    
    const decodedToken = jwtDecode(token);
    const currentUserId = decodedToken?.userId;
    const isAdmin = decodedToken?.role?.toLowerCase() === 'admin';
  
    let filtered = allReclamations;
    if (!isAdmin) {
      filtered = allReclamations.filter(
        reclamation => 
          reclamation.session?._id.toString() === currentUserId ||
          reclamation.assignedTo?.toString() === currentUserId
      );
    }
    
    setFilteredReclamationsForChat(filtered);
  }, [allReclamations]);
  const handleEdit = async (record) => {
    console.log("Editing record:", record);

    setEditingRecord(record);
    setIsModalOpen(true);

    // Reset form first
    form.resetFields();

    // Prepare the form values
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
      leadId: record.lead || record.leadId || null,
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
      const matchingClient = clients.find(
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

  const handleFormSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;

      if (!decodedToken) {
        return;
      }
      const isAdmin = decodedToken.role === 'Admin' || decodedToken.role === 'admin';
      const sessionId = decodedToken.userId;
      const sessionModel = isAdmin ? 'Admin' : 'Commercial';

      const formData = {
        ...values,
        session: sessionId,
        sessionModel: sessionModel,
        leadId: selectedLeadId,
      };
      console.log("Form Data:", formData);

      if (editingRecord) {
        const response = await axios.put(
          `/reclamations/${editingRecord._id}`,
          formData
        );

        // Double update strategy
        setAllReclamations((prev) =>
          [...prev].map((item) =>
            item._id === editingRecord._id ? { ...response.data } : { ...item }
          )
        );
        setRefreshTrigger((prev) => prev + 1);

        message.success("Réclamation mise à jour avec succès");
      } else {
        const response = await axios.post("/reclamations", formData);

        setAllReclamations((prev) => [{ ...response.data }, ...prev]);
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);

        message.success("Réclamation ajoutée avec succès");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      console.error(error);
    }
  };
  
  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer le sinistre ?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        return handleDelete(id);
      },
    });
  }
  const handleDelete = async (record) => {
    try {
      const respoanse = await axios.delete(`/reclamations/${record._id}`);
      if (respoanse.status === 200) {
        message.success("Réclamation supprimée avec succès");
        setAllReclamations((prevReclamations) =>
          prevReclamations.filter((item) => item._id !== record._id)
        );
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

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
        console.log("Combined Users:", combinedUsers);

        setUsers(combinedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/data");
        setClients(response.data.chatData || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = (clientId) => {
    setSelectedLeadId(clientId);
    const selectedClient = clients.find((client) => client._id === clientId);
    if (selectedClient) {
      form.setFieldsValue({
        nom_reclamant: `${selectedClient.prenom} ${selectedClient.nom}`.trim(),
        email: selectedClient.email,
        portable: selectedClient.portable,
        existe_crm: "oui",
      });
    }
  };

  const handleLeadClick = (lead) => {
    // Extract ID whether we get the full object or just the ID
    const leadId = lead?._id || lead;
    
    if (!leadId) {
      console.error("No lead ID provided for navigation");
      message.error("Could not navigate to client details");
      return;
    }
    
    navigate(`/client/${leadId}`);
  };

  const columns = [
    {
      title: "N° réclamation",
      dataIndex: "numero_reclamation",
      key: "numero_reclamation",
    },
    {
      title: "Client",
      key: "client",
      render: (_, record) => {
        // For non-CRM cases (existe_crm="non")
        if (record.existe_crm === "non") {
          const fullName = `${record.nom_reclamant_input || ''} ${record.prenom_reclamant_input || ''}`.trim();
          return (
            <span style={{ cursor: 'default' }}>  {/* No click for non-CRM cases */}
              {fullName || 'N/A'}
            </span>
          );
        }
        
        // For CRM cases (existe_crm="oui")
        if (record.leadId && typeof record.leadId === 'object') {
          // Case 1: leadId has nom/prenom
          if (record.leadId.nom) {
            const fullName = `${record.leadId.nom} ${record.leadId.prenom || ''}`.trim();
            return (
              <span 
                onClick={() => handleLeadClick(record.leadId._id)}  // Pass just the ID
                style={{ cursor: 'pointer', color: '#1890ff' }}
              >
                {fullName}
              </span>
            );
          }
        }
        
        // Case 2: nom_reclamant is a string (ID or name)
        if (typeof record.nom_reclamant === 'string') {
          // If it's an ID format (like "689665e1f27ff0e71f56c1fd")
          if (/^[0-9a-f]{24}$/i.test(record.nom_reclamant)) {
            return (
              <span 
                onClick={() => handleLeadClick(record.nom_reclamant)}  // Pass the ID
                style={{ cursor: 'pointer', color: '#1890ff' }}
              >
                {'Client'}  {/* Or some default text since we don't have the name */}
              </span>
            );
          }
          // If it's a name string (like "Jean Dupont")
          return (
            <span style={{ cursor: 'default' }}>
              {record.nom_reclamant || 'N/A'}
            </span>
          );
        }
        
        // Default case
        return 'N/A';
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
      render: (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
      sorter: (a, b) =>
        new Date(a.date_reclamation) - new Date(b.date_reclamation),
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Assigné à",
      key: "assignedTo",
      render: (_, record) => {
        if (record.assignedToName) {
          return record.assignedToName;
        }
        if (record.assignedTo && typeof record.assignedTo === 'object') {
          return `${record.assignedTo.prenom || ''} ${record.assignedTo.nom || ''}`.trim();
        }
        return "Non assigné";
      },
    },
    {
      title: "Date de clôture",
      dataIndex: "date_cloture",
      key: "date_cloture",
      render: (date) => {
        if (!date) return;
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
      sorter: (a, b) => new Date(a.date_cloture) - new Date(b.date_cloture),
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

  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
          <h2 className="text-xs sm:text-sm font-semibold text-blue-900 text-center md:text-left">
            RECLAMTIONS ({allReclamations.length})
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
            <Button
              type="secondary"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold md:w-auto"
              onClick={showModal}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">+</span>
                <span className="text-[10px] sm:text-xs whitespace-nowrap">
                  ENREGISTRER UNE RECLAMTION
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

            {/* Motif Filter */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Motif
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("motif", value)}
                value={filters.motif}
                allowClear
                showSearch
              >
                <Option value="tous">Tous</Option>
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
            </div>

            {/* Assureur Filter */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Assureur
              </label>
              <Select
                className="w-full"
                allowClear
                showSearch
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("assureur", value)}
                value={filters.assureur}
              >
                    <Option value="tous">Tous les risques</Option>
                    {ASSUREURS.map(assureur => (
          <Option key={assureur.value} value={assureur.value}>
            {assureur.label}
          </Option>
        ))}
              </Select>
            </div>

            {/* Issue Filter */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Issue
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("issue", value)}
                value={filters.issue}
                allowClear
              >
                <Option value="tous">Tous</Option>
                <Option value="defavorable">Défavorable</Option>
                <Option value="defense_portefeuille">
                  Défense de portefeuille
                </Option>
                <Option value="favorable">Favorable</Option>
                <Option value="partielle">Partielle</Option>
              </Select>
            </div>

            {/* Statut Réclamant Filter */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Statut Réclamant
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                allowClear
                onChange={(value) =>
                  handleFilterChange("statut_reclamant", value)
                }
                value={filters.statut_reclamant}
              >
                <Option value="tous">Tous</Option>
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
            </div>

            {/* Search Input */}
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <Input
                placeholder="Rechercher par numéro, nom, référence..."
                allowClear
                onChange={(e) => handleFilterChange("search", e.target.value)}
                value={filters.search}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md w-full mt-4 overflow-x-auto">
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
            dataSource={filteredReclamations}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredReclamations.length,
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
      </div>
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
            {/* === INFORMATION === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATIONS</h2>

            <Form.Item
              label="N° de la réclamation"
              name="numero_reclamation"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="N° de la réclamation"
              />
            </Form.Item>

            <Form.Item
              label="Date de réclamation"
              name="date_reclamation"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" />
            </Form.Item>

            <Form.Item
              label="Canal de réclamation"
              name="canal_reclamation"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" />
            </Form.Item>

            <Form.Item
              label="Déclarant"
              name="declarant"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
                      {clients.map((client) => (
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
                    required: true,
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
      <ReclamationChatSidebar 
          // reclamations={allReclamations} 
          onReclamationUpdate={fetchReclamations}
          reclamations={filteredReclamationsForChat} 
        />
    </section>
  );
};

export default Reclamations;
