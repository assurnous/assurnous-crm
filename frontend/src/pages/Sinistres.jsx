import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Form,
  Modal,
  Radio,
  message,
  Space,
  Tooltip,
} from "antd";
const { RangePicker } = DatePicker;
import { CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { ASSUREURS, RISQUES } from "../constants";
import { useNavigate } from "react-router-dom";

const { Option, OptGroup } = Select;
const Sinistres = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [allSinistres, setAllSinistres] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [loadingContrats, setLoadingContrats] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [filteredSinistres, setFilteredSinistres] = useState([]);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;

  const [filters, setFilters] = useState({
    periode: null,
    motif: "tous",
    assureur: "tous",
    risque: "tous",
    gestionaire: "tous",
    statutSinistre: "tous",
    search: "",
  });
  const sinistreExist = useWatch("sinistreExist", form);
  const contratExist = useWatch("contratExist", form);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
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
  useEffect(() => {
    const fetchSinistres = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get("/sinistres");
        console.log("Fetched sinistres:", response.data);
        const decodedToken = jwtDecode(token);
        const currentUserId = decodedToken?.userId;
        const role = decodedToken.role;
        const name = decodedToken.name;

        // Fix the filtering logic
        let filteredData = response.data.data || [];
        if (role !== "Admin") {
          filteredData = filteredData.filter(
            (sinistre) =>
              sinistre.session?._id === currentUserId ||
              sinistre.session === currentUserId ||
              sinistre.gestionnaire === name
          );
        }

        setAllSinistres(filteredData);
        setFilteredSinistres(filteredData);
      } catch (error) {
        console.error("Error fetching sinistre", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSinistres();
  }, [refreshTrigger]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterValues) => {
    let result = [...allSinistres]; // Use allSinistres instead of chatData

    // Date range filter
    if (
      filterValues.periode &&
      filterValues.periode[0] &&
      filterValues.periode[1]
    ) {
      result = result.filter((item) => {
        const sinistreDate = new Date(item.dateSinistre);
        return (
          sinistreDate >= filterValues.periode[0] &&
          sinistreDate <= filterValues.periode[1]
        );
      });
    }

    // Type de sinistre filter
    if (filterValues.typeSinistre && filterValues.typeSinistre !== "tous") {
      result = result.filter(
        (item) => item.typeSinistre === filterValues.typeSinistre
      );
    }

    // Délégation filter
    if (filterValues.delegation && filterValues.delegation !== "tous") {
      result = result.filter(
        (item) => item.delegation === filterValues.delegation
      );
    }

    // Risque filter
    if (filterValues.risque && filterValues.risque !== "tous") {
      result = result.filter((item) => item.risque === filterValues.risque);
    }

    // Gestionnaire filter
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter((item) => {
        // Get the gestionnaire ID from sinistreDetails
        const gestionnaireId = item.sinistreDetails?.gestionnaire;

        // Compare with the selected filter value
        return gestionnaireId === filterValues.gestionnaire;
      });
    }

    // Statut filter
    if (filterValues.statutSinistre && filterValues.statutSinistre !== "tous") {
      result = result.filter(
        (item) => item.statutSinistre === filterValues.statutSinistre
      );
    }

    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter((item) => {
        // Client information
        const clientName = `${item.sinistreDetails?.nom || ""} ${
          item.sinistreDetails?.prenom || ""
        }`.toLowerCase();
        const clientEmail = item.sinistreDetails?.email?.toLowerCase() || "";
        const clientPhone = item.sinistreDetails?.portable?.toLowerCase() || "";

        // Contract information
        const contractNumber =
          item.contratDetails?.contractNumber?.toLowerCase() || "";

        // Sinistre information
        const sinistreNumber = item.numeroSinistre?.toLowerCase() || "";
        const risque = item.risque?.toLowerCase() || "";
        const typeSinistre = item.typeSinistre?.toLowerCase() || "";
        const statutSinistre = item.statutSinistre?.toLowerCase() || "";
        const assureur = item.assureur?.toLowerCase() || "";
        const montantSinistre = item.montantSinistre?.toString() || "";

        // Address information
        const address = `${item.sinistreDetails?.numero_voie || ""} ${
          item.sinistreDetails?.code_postal || ""
        } ${item.sinistreDetails?.ville || ""}`.toLowerCase();

        return (
          clientName.includes(searchTerm) ||
          clientEmail.includes(searchTerm) ||
          clientPhone.includes(searchTerm) ||
          contractNumber.includes(searchTerm) ||
          sinistreNumber.includes(searchTerm) ||
          risque.includes(searchTerm) ||
          typeSinistre.includes(searchTerm) ||
          statutSinistre.includes(searchTerm) ||
          assureur.includes(searchTerm) ||
          montantSinistre.includes(searchTerm) ||
          address.includes(searchTerm)
        );
      });
    }

    setFilteredSinistres(result);
    setCurrentPage(1);
  };

  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    try {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;
      console.log("Decoded token:", decodedToken);

      if (!decodedToken) {
      
        return;
      }

      const isAdmin =
        decodedToken.role === "Admin" || decodedToken.role === "admin";
      const sessionId = decodedToken.userId;
      const sessionModel = isAdmin ? "Admin" : "Commercial";

      const formData = {
        ...values,
        session: sessionId,
        sessionModel: sessionModel,
        numeroSinistre: values.numeroSinistre,
        // Handle both cases of sinistreExist
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

      if (editingRecord) {
        const response = await axios.put(
          `/sinistres/${editingRecord._id}`,
          formData
        );
        setAllSinistres((prev) =>
          [...prev].map((item) =>
            item._id === editingRecord._id ? { ...response.data } : { ...item }
          )
        );
        setRefreshTrigger((prev) => prev + 1);
        setFilteredSinistres((prev) =>
          prev.map((item) =>
            item._id === editingRecord._id ? { ...response.data } : item
          )
        );

        message.success("Sinistre mise à jour avec succès");
      } else {
        const response = await axios.post("/sinistres", formData);
        setAllSinistres((prev) => [{ ...response.data }, ...prev]);
        setFilteredSinistres((prev) => [{ ...response.data }, ...prev]);
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);

        message.success("Sinistre ajoutée avec succès");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      console.error("Submission error details:", {
        error: error.response?.data || error.message,
        stack: error.stack,
      });
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
  };

  const handleDelete = async (record) => {
    try {
      const response = await axios.delete(`/sinistres/${record._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllSinistres(
        allSinistres.filter((sinistre) => sinistre._id !== record._id)
      );
      setFilteredSinistres(
        filteredSinistres.filter((sinistre) => sinistre._id !== record._id)
      );
    } catch (error) {
      console.error("Error deleting sinistre:", error);
    }
  };
  const handleEdit = async (record) => {
    console.log("Editing record:", record);
    setEditingRecord(record);
    setIsModalOpen(true);

    // Reset form first
    form.resetFields();
   
    // Prepare base form values
    const formValues = {
      // gestionnaire: clientData?.gestionnaire ? { name: clientData.gestionnaireName } : "",
      gestionnaire: record.sinistreDetails?.gestionnaireName || "",
      // Information section
      numeroSinistre: record.numeroSinistre || "",

      // Sinistre section
      sinistreExist: record.sinistreExist || "non",

      // Contract section
      contratExist: record.contratExist || "non",

      // Details
      risque: record.risque || "",
      assureur: record.assureur || "",

      // Détail du sinistre
      dateSinistre: record.dateSinistre ? dayjs(record.dateSinistre) : null,
      dateDeclaration: record.dateDeclaration
        ? dayjs(record.dateDeclaration)
        : null,
      statutSinistre: record.statutSinistre || "ouvert",
      typeSinistre: record.typeSinistre || "",
      responsabilite: record.responsabilite || "",
      montantSinistre: record.montantSinistre || 0,
      delegation: record.delegation || "non",
      // gestionnaire: record.session ? record.session.name : "",
      coordonnees_expert: record.coordonnees_expert || "",
      leadId: record.leadId || null,
    };

    // Handle sinistre information based on sinistreExist
    if (record.sinistreExist === "oui") {
      // For existing sinistré (from CRM)
      formValues.sinistreId = record.sinistreId || record.leadId;

      // Try to find matching client in clients list
      const matchingClient = clients.find(
        (client) =>
          client._id === (record.sinistreId || record.leadId) ||
          `${client.nom} ${client.prenom}` === record.sinistreSelect
      );

      if (matchingClient) {
        formValues.sinistreSelect = matchingClient._id;
      } else if (record.sinistreDetails) {
        formValues.sinistreSelect = record.sinistreDetails._id;
      }
    } else {
      // For manually entered sinistré
      formValues.sinistreNom = record.sinistreNom || "";
      formValues.sinistrePrenom = record.sinistrePrenom || "";
      formValues.sinistreInput = record.sinistreInput || "";
    }

    // Handle contrat information based on contratExist
    if (record.contratExist === "oui") {
      formValues.contratId = record.contratId;

      // Try to find matching contrat in contrats list
      const matchingContrat = contrats.find(
        (contrat) =>
          contrat._id === record.contratId ||
          contrat.numeroContrat === record.contratSelect
      );

      if (matchingContrat) {
        formValues.contratSelect = matchingContrat._id;
      } else if (record.contratDetails) {
        formValues.contratSelect = record.contratDetails._id;
      }
    } else {
      formValues.contratNumber = record.contratNumber || "";
      formValues.contratInput = record.contratInput || "";
    }

    // Set form values after a small delay to ensure form is ready
    setTimeout(() => {
      form.setFieldsValue(formValues);
    }, 100);
  };

  const handleLeadClick = (leadId) => {
    navigate(`/client/${leadId}`);
  };
  const columns = [
    {
      title: "N° sinistre",
      dataIndex: "numeroSinistre",
      key: "numeroSinistre",
    },
    // {
    //   title: "Client",
    //   key: "client",
    //   render: (_, record) => {
    //     if (record.sinistreExist === "oui") {
    //       // Check both possible populated fields
    //       if (record.sinistreDetails) {
    //         return `${record.sinistreDetails.nom} ${record.sinistreDetails.prenom}`;
    //       }
    //       if (record.leadId && typeof record.leadId === 'object') {
    //         return `${record.leadId.nom} ${record.leadId.prenom}`;
    //       }
    //       return "Client (non chargé)";
    //     } else {
    //       return `${record.sinistreNom || ''} ${record.sinistrePrenom || ''}`.trim() ||
    //              record.sinistreInput || "N/A";
    //     }
    //   },
    // },
    {
      title: "Client",
      key: "client",
      render: (_, record) => {
        const isClickable = record.sinistreExist === "oui";
        let clientName = "";

        if (isClickable) {
          if (record.sinistreDetails) {
            clientName = `${record.sinistreDetails.nom} ${record.sinistreDetails.prenom}`;
          } else if (record.leadId && typeof record.leadId === "object") {
            clientName = `${record.leadId.nom} ${record.leadId.prenom}`;
          } else {
            clientName = "Client (non chargé)";
          }
        } else {
          clientName =
            `${record.sinistreNom || ""} ${
              record.sinistrePrenom || ""
            }`.trim() ||
            record.sinistreInput ||
            "N/A";
        }

        return (
          <span
            onClick={() =>
              isClickable &&
              handleLeadClick(
                record.sinistreDetails?._id ||
                  (typeof record.leadId === "object"
                    ? record.leadId._id
                    : record.leadId)
              )
            }
            style={{
              cursor: isClickable ? "pointer" : "default",
              color: isClickable ? "#1890ff" : "inherit",
            }}
          >
            {clientName}
          </span>
        );
      },
    },
    {
      title: "N° contrat",
      key: "contrat",
      render: (_, record) => {
        if (record.contratExist === "oui") {
          if (record.contratDetails) {
            return (
              record.contratDetails.contractNumber || "Contrat (sans numéro)"
            );
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
    // {
    //   title: "N° contrat",
    //   key: "contrat",
    //   render: (_, record) => {
    //     if (record.contratExist === "oui") {
    //       // Case 1: Contract details are populated
    //       if (record.contratDetails?.numeroContrat) {
    //         return record.contratDetails.numeroContrat;
    //       }
    //       // Case 2: Contract exists but details not populated
    //       if (record.contratId) {
    //         return (
    //           <Tooltip title={`Référence: ${record.contratId}`}>
    //             <span style={{ color: "#faad14" }}>Contrat (référence)</span>
    //           </Tooltip>
    //         );
    //       }
    //       // Case 3: Manual contract input
    //       if (record.contratNumber) {
    //         return record.contratNumber;
    //       }
    //       return "N/A";
    //     } else {
    //       // Case 4: No contract exists
    //       return record.sinistreInput || "N/A";
    //     }
    //   },
    // },

    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Date sinistre",
      dataIndex: "dateSinistre",
      key: "dateSinistre",
      render: (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
    },
    {
      title: "Date déclaration",
      dataIndex: "dateDeclaration",
      key: "dateDeclaration",
      render: (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
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
      title: "Expert",
      dataIndex: "coordonnees_expert",
      key: "coordonnees_expert",
      render: (coordonnees_expert) => coordonnees_expert || "N/A",
    },
    {
      title: "Risque",
      dataIndex: "risque",
      key: "risque",
    },
    // {
    //   title: "Gestionnaire",
    //   key: "gestionnaire",
    //   render: (_, record) => {
    //     if (record.session) {
    //       if (typeof record.session === 'object') {
    //         return record.session.name || record.session.nom;
    //       }
    //       return "Gestionnaire (ID: " + record.session + ")";
    //     }
    //     return "N/A";
    //   },
    // },
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
          if (typeof record.session === "object") {
            return (
              record.session.name ||
              `${record.session.nom || ""} ${
                record.session.prenom || ""
              }`.trim()
            );
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

  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
          <h2 className="text-xs sm:text-sm font-semibold text-blue-800 text-center md:text-left">
            Sinistres ({allSinistres.length})
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
                  ENREGISTRER UN SINISTRE
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

            {/* Type de sinistre */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Type de sinistre
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("typeSinistre", value)}
                allowClear
              >
                <Option value="tous">Tous</Option>
                <Option value="dommage_corporel">Dommage corporel</Option>
                <Option value="dommage_materiel">Dommage matériel</Option>
                <Option value="dommage_corporel_matériel">
                  Dommage corporel et matériel
                </Option>
              </Select>
            </div>

            {/* Délégation */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Sinistre en délegation
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("delegation", value)}
                allowClear
              >
                <Option value="tous">Tous</Option>
                <Option value="oui">Oui</Option>
                <Option value="non">Non</Option>
              </Select>
            </div>

            {/* Risque */}
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
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="tous">Tous les risques</Option>
                {RISQUES.map((risque) => (
                  <Option key={risque.value} value={risque.value}>
                    {risque.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Gestionnaire */}
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
                    <Option
                      key={user._id}
                      value={user._id} // Store the raw user ID
                    >
                      {displayName} (
                      {user.userType === "admin" ? "Admin" : "Commercial"})
                    </Option>
                  );
                })}
              </Select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) =>
                  handleFilterChange("statutSinistre", value)
                }
                allowClear
              >
                <Option value="tous">Tous</Option>
                <Option value="en_cours">En cours</Option>
                <Option value="clo">Clos</Option>
                <Option value="reouvert">Réouvert</Option>
              </Select>
            </div>

            {/* Recherche */}
            <div>
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

        <div className="bg-white mt-4 rounded-lg shadow-md w-full  overflow-x-auto">
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
            dataSource={filteredSinistres.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredSinistres.length,
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
          <div className="bg-gray-100 p-2 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
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
          className="h-full overflow-y-auto ml-2 overflow-clip w-full"
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
              label="N° de sinistre"
              name="numeroSinistre"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input placeholder="Entrez le numéro de sinistre" />
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
                  {clients.map((client) => (
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

            {/* DÉTAIL DU SINISTRE */}
            <h2 className="text-sm font-semibold mt-12 mb-4">
              DÉTAIL DU SINISTRE
            </h2>

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

            <Form.Item
              label="Date de sinistre"
              name="dateSinistre"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker
                className="w-full"
                placeholder="Sélectionnez la date"
              />
            </Form.Item>

            <Form.Item
              label="Date de déclaration"
              name="dateDeclaration"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker
                className="w-full"
                placeholder="Sélectionnez la date"
              />
            </Form.Item>

            <Form.Item
              label="Statut du sinistre"
              name="statutSinistre"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select placeholder="-- Choisissez --">
                <Option value="en_cours">En cours</Option>
                <Option value="clo">Clos</Option>
                <Option value="reouvert">Réouvert</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Type de sinistre"
              name="typeSinistre"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                placeholder="-- Choisissez --"
                showSearch
                optionFilterProp="children"
                className="w-full"
              >
                <Option value="dommage_corporel">Dommage corporel</Option>
                <Option value="dommage_materiel">Dommage matériel</Option>
                <Option value="dommage_corporel_matériel">
                  Dommage corporel et matériel
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Responsabilité"
              name="responsabilite"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input placeholder="responsabilité" />
            </Form.Item>

            <Form.Item label="Montant du sinistre" name="montantSinistre">
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="Sinistre en délégation ?"
              name="delegation"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select placeholder="-- Choisissez --">
                <Option value="oui">Oui</Option>
                <Option value="non">Non</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Coordonnées de l'expert" name="coordonnees_expert">
              <Input placeholder="Coordonnées de l'expert" />
            </Form.Item>

            <Form.Item
              label="Gestionnaire"
              name="gestionnaire"
              rules={[
                {
                  required: true,
                  message: "Ce champ est obligatoire",
                  validator: (_, value) => {
                    try {
                      if (!value) return Promise.reject();
                      JSON.parse(value);
                      return Promise.resolve();
                    } catch {
                      return Promise.reject("Format de gestionnaire invalide");
                    }
                  },
                },
              ]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez--"
                showSearch
                optionFilterProp="children"
              >
                {users.map((user) => {
                  const displayName =
                    user.userType === "admin"
                      ? user.name
                      : `${user.nom} ${user.prenom}`;

                  return (
                    <Option
                      key={user._id}
                      value={JSON.stringify({
                        id: user._id,
                        model:
                          user.userType === "admin" ? "Admin" : "Commercial",
                      })}
                    >
                      {displayName} (
                      {user.userType === "admin" ? "Admin" : "Commercial"})
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
    </section>
  );
};

export default Sinistres;
