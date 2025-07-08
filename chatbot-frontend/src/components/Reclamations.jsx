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
import moment from "moment";

const { Option } = Select;

const Reclamations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allReclamations, setAllReclamations] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

  useEffect(() => {
    const fetchReclamations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get("/reclamations");
        const decodedToken = token ? jwtDecode(token) : null;
        const currentUserId = decodedToken?.userId;
        const role = decodedToken?.role;
        if (role === "Admin") {
          setAllReclamations(response.data.data || []);
        }

        const filteredData = response.data.data.filter(
          (reclamation) => reclamation.session === currentUserId
        );
        setAllReclamations(filteredData);
       
      } catch (error) {
        console.error("Error fetching reclamations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReclamations();
  }, [refreshTrigger]);

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue({
        existe_crm: "oui", // Set default value
      });
    }
  }, [isModalOpen, form]);
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
        message.error("Utilisateur non authentifié");
        return;
      }

      const formData = {
        ...values,
        session: decodedToken?.userId || decodedToken?.commercialId,
        leadId: selectedLeadId,
      };

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
      message.error(
        editingRecord
          ? "Erreur lors de la mise à jour de la réclamation"
          : "Erreur lors de l'ajout de la réclamation"
      );
      console.error(error);
    }
  };

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
      message.error("Erreur lors de la suppression de la réclamation");
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

  const columns = [
    {
      title: "N° réclamation",
      dataIndex: "numero_reclamation",
      key: "numero_reclamation",
    },
    {
      title: "Client",
      key: "client",
      render: (_, record) =>
        record.existe_crm === "oui"
          ? record.nom_reclamant
          : `${record.nom_reclamant_input || ""} ${
              record.prenom_reclamant_input || ""
            }`.trim(),
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
              onClick={() => handleDelete(record)}
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
          <h2 className="text-xs sm:text-sm font-semibold text-purple-900 text-center md:text-left">
            RECLAMTIONS ({allReclamations.length})
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
            <Button
              type="primary"
              className="w-full md:w-auto"
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
              >
                <Option value="tous">Tous</Option>
                <Option value="refus_indemnisation">
                  Refus d'indemnisation
                </Option>
                <Option value="delai_indemnisation">
                  Délai d'indemnisation
                </Option>
                <Option value="modification_contrat">
                  Modification de contrat
                </Option>
                <Option value="autre">Autre motif</Option>
              </Select>
            </div>

            {/* Assureur Filter */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Assureur
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("assureur", value)}
                value={filters.assureur}
              >
                <Option value="tous">Tous</Option>
                <Option value="axa">AXA</Option>
                <Option value="swisslife">SwissLife</Option>
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
              >
                <Option value="tous">Tous</Option>
                <Option value="resolue">Résolue</Option>
                <Option value="non_resolue">Non résolue</Option>
                <Option value="en_attente">En attente</Option>
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
                onChange={(value) =>
                  handleFilterChange("statut_reclamant", value)
                }
                value={filters.statut_reclamant}
              >
                <Option value="tous">Tous</Option>
                <Option value="particulier">Particulier</Option>
                <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
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
                <Option value="email">Email</Option>
                <Option value="telephone">Téléphone</Option>
                <Option value="autre">Autre</Option>
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
                <Option value="particulier">Particulier</Option>
                <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
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
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="axa">AXA</Option>
                <Option value="swisslife">SwissLife</Option>
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
              >
                {/* Dommages et sinistres */}
                <Option value="refus_indemnisation">
                  Refus d'indemnisation
                </Option>
                <Option value="delai_indemnisation">
                  Délai d'indemnisation trop long
                </Option>
                <Option value="montant_indemnisation">
                  Montant d'indemnisation insuffisant
                </Option>
                <Option value="sinistre_non_couvert">
                  Sinistre non couvert
                </Option>

                {/* Contrats et résiliations */}
                <Option value="resiliation">Problème de résiliation</Option>
                <Option value="modification_contrat">
                  Modification de contrat
                </Option>
                <Option value="erreur_contrat">Erreur dans le contrat</Option>

                {/* Paiements et primes */}
                <Option value="augmentation_prime">
                  Augmentation injustifiée de prime
                </Option>
                <Option value="paiement_non_credite">
                  Paiement non crédité
                </Option>
                <Option value="prelevement_irregulier">
                  Prélèvement irrégulier
                </Option>

                {/* Service client */}
                <Option value="absence_contact">
                  Absence de contact/retour
                </Option>
                <Option value="information_erronnee">
                  Information erronnée
                </Option>
                <Option value="service_non_conforme">
                  Service non conforme
                </Option>

                {/* Assurance auto spécifique */}
                <Option value="expertise_contentieux">
                  Contentieux expertise auto
                </Option>
                <Option value="vehicule_remplacement">
                  Véhicule de remplacement
                </Option>

                {/* Assurance habitation */}
                <Option value="degats_des_eaux">Dégâts des eaux</Option>
                <Option value="vol_habilitation">Vol sans habilitation</Option>

                {/* Divers */}
                <Option value="erreur_admin">Erreur administrative</Option>
                <Option value="donnees_personnelles">
                  Problème données personnelles
                </Option>
                <Option value="autre">Autre motif</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Service concerné"
              name="service_concerne"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              {/* <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="sav">SAV</Option>
                <Option value="support">Support</Option>
                <Option value="commercial">Commercial</Option>
              </Select> */}
              <Select
                className="w-full text-xs h-7 flex"
                placeholder="-- Sélectionnez --"
                mode="single"
                optionLabelProp="label"
                tagRender={({ label, value, closable, onClose }) => (
                  <Tag
                    color={
                      value === "souscription"
                        ? "blue"
                        : value === "sinistres"
                        ? "red"
                        : value === "relation_client"
                        ? "green"
                        : "orange"
                    }
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3, borderRadius: 12 }}
                  >
                    {label}
                  </Tag>
                )}
              >
                {/* Insurance-specific departments */}
                <Option value="souscription" label="Souscription">
                  <Space>
                    <Tag color="blue" style={{ borderRadius: 12 }}>
                      Souscription
                    </Tag>
                    <span>Création/modification contrats</span>
                  </Space>
                </Option>

                <Option value="sinistres" label="Sinistres">
                  <Space>
                    <Tag color="red" style={{ borderRadius: 12 }}>
                      Sinistres
                    </Tag>
                    <span>Gestion des déclarations</span>
                  </Space>
                </Option>

                <Option value="relation_client" label="Relation Client">
                  <Space>
                    <Tag color="green" style={{ borderRadius: 12 }}>
                      Relation Client
                    </Tag>
                    <span>Service après-vente</span>
                  </Space>
                </Option>

                <Option value="paiements" label="Paiements">
                  <Space>
                    <Tag color="orange" style={{ borderRadius: 12 }}>
                      Paiements
                    </Tag>
                    <span>Primes & facturation</span>
                  </Space>
                </Option>

                <Option value="expertise" label="Expertise">
                  <Space>
                    <Tag color="purple" style={{ borderRadius: 12 }}>
                      Expertise
                    </Tag>
                    <span>Évaluation sinistres</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Pris en charge par"
              name="prise_en_charge_par"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="agent1">Agent 1</Option>
                <Option value="agent2">Agent 2</Option>
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
                <Option value="niveau1">Niveau 1</Option>
                <Option value="niveau2">Niveau 2</Option>
                <Option value="niveau3">Niveau 3</Option>
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
                <Option value="resolue">Résolue</Option>
                <Option value="en_attente">En attente</Option>
                <Option value="non_resolue">Non résolue</Option>
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

export default Reclamations;
