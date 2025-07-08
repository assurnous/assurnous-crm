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

const { Option, OptGroup } = Select;
const Sinistres = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [allSinistres, setAllSinistres] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    periode: null,
    motif: "tous",
    assureur: "tous",
    risque: "tous",
    gestionaire: "tous",
    statutSinistre: "tous",
    search: "",
  });
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const sinistreExist = useWatch("sinistreExist", form);
  const contratExist = useWatch("contratExist", form);

  const handleClientChange = (clientId) => {
    setSelectedLeadId(clientId);
    const selectedClient = clients.find((client) => client._id === clientId);
    if (selectedClient) {
      form.setFieldsValue({
        sinistreSelect: `${selectedClient.prenom} ${selectedClient.nom}`.trim(),
      });
    }
  };

  useEffect(() => {
    const fetchSinistres = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get("/sinistres");
        const decodedToken = token ? jwtDecode(token) : null;
        const currentUserId = decodedToken?.userId;
        const role = decodedToken.role;
        const name = decodedToken.name;

        if (role === "Admin") {
          setAllSinistres(response.data.data || []);
        }
        const filtredSinistres = response.data.data.filter(
          (sinistre) => sinistre.session === currentUserId || sinistre.gestionnaire === name
        );
        setAllSinistres(filtredSinistres || []);
        
      } catch (error) {
        console.error("Error fetching reclamations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSinistres();
  }, [refreshTrigger]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const filteredSinistres = useMemo(() => {
    return allSinistres.filter((sinistre) => {
      if (filters.periode && filters.periode[0] && filters.periode[1]) {
        const claimDate = new Date(sinistre.dateSinistre);
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

    // In your filter function:
if (filters.gestionnaire && filters.gestionnaire !== "tous") {
  const selectedUser = users.find(u => u._id === filters.gestionnaire);
  if (selectedUser) {
    const gestionnaireName = selectedUser.userType === 'admin' 
      ? selectedUser.name 
      : `${selectedUser.nom} ${selectedUser.prenom}`;
    
    if (sinistre.gestionnaire !== gestionnaireName) {
      return false;
    }
  }
}
      // Motif filter
      if (filters.motif !== "tous" && sinistre.motif !== filters.motif) {
        return false;
      }

      // Assureur filter
      if (
        filters.assureur !== "tous" &&
        sinistre.assureur !== filters.assureur
      ) {
        return false;
      }

      // Issue filter
      if (filters.risque !== "tous" && sinistre.risque !== filters.risque) {
        return false;
      }

      // Statut réclamant filter (particulier/entreprise/professionnel)
      if (
        filters.statutSinistre !== "tous" &&
        sinistre.statutSinistre !== filters.statutSinistre
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches = [
          sinistre.sinistreSelect,
          sinistre.gestionnaire,
          sinistre.sinistreInput,
          sinistre.numeroSinistre,
          sinistre.contratSelect,
          sinistre.contratInput,
          sinistre.assureur,
          sinistre.risque,

        ].some((field) => field && field.toLowerCase().includes(searchLower));

        if (!matches) return false;
      }

      return true;
    });
  }, [allSinistres, filters]);

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
          `/sinistres/${editingRecord._id}`,
          formData
        );

        // Double update strategy
        setAllSinistres((prev) =>
          [...prev].map((item) =>
            item._id === editingRecord._id ? { ...response.data } : { ...item }
          )
        );
        setRefreshTrigger((prev) => prev + 1);

        message.success("Sinistre mise à jour avec succès");
      } else {
        const response = await axios.post("/sinistres", formData);
        setAllSinistres((prev) => [{ ...response.data }, ...prev]);
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);

        message.success("Sinistre ajoutée avec succès");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      message.error(
        editingRecord
          ? "Erreur lors de la mise à jour de la sinistre"
          : "Erreur lors de l'ajout de la sinistre"
      );
      console.error(error);
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

  const handleDelete = async (record) => {
    try {
      const response = await axios.delete(`/sinistres/${record._id}`);
      if (response.status === 200) {
        message.success("Sinistre supprimée avec succès");
        setAllSinistres((prev) =>
          prev.filter((item) => item._id !== record._id)
        );
      }
    } catch (error) {
      console.error("Error deleting sinistre:", error);
      message.error("Erreur lors de la suppression de la sinistre");
    }
  };

  const handleEdit = async (record) => {
    console.log("Editing record:", record);

    setEditingRecord(record);
    setIsModalOpen(true);

    // Reset form first
    form.resetFields();

    const formValues = {
      // Information section
      numeroSinistre: record.numeroSinistre || "",

      // Sinistre section
      sinistreExist: record.sinistreExist || "non",
      ...(record.sinistreExist === "oui" && {
        sinistreSelect: record.sinistreSelect,
      }),
      ...(record.sinistreExist === "non" && {
        sinistreInput: record.sinistreInput,
      }),

      // Contract section
      contratExist: record.contratExist || "non",
      ...(record.contratExist === "oui" && {
        contratSelect: record.contratSelect,
      }),
      ...(record.contratExist === "non" && {
        contratInput: record.contratInput,
      }),

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
      expert: record.expert || "",
      gestionnaire: record.gestionnaire || "",

      // References
      ...(record.session && { session: record.session }),
      ...(record.leadId && { leadId: record.leadId }),
      ...(record.createdBy && { createdBy: record.createdBy }),
    };

    // Handle client information
    if (record.sinistreExist === "oui") {
      const matchingClient = clients.find(
        (client) =>
          `${client.nom} ${client.prenom}` === record.sinistreSelect ||
          client.denomination_commerciale === record.sinistreSelect
      );
      formValues.sinistreSelect = matchingClient?._id || record.sinistreSelect;
    } else {
      formValues.sinistreInput = record.sinistreInput;
    }

    setTimeout(() => {
      form.setFieldsValue(formValues);
    }, 100);
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
      render: (_, record) =>
        record.contratExist === "oui"
          ? record.contratSelect
          : record.contratInput,
    },
    {
      title: "Client",
      key: "client",
      render: (_, record) =>
        record.sinistreExist === "oui"
          ? record.sinistreSelect
          : record.sinistreInput,
    },
    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Date de sinistre",
      dataIndex: "dateSinistre",
      key: "dateSinistre",
      render: (date) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
      sorter: (a, b) => new Date(a.dateSinistre) - new Date(b.dateSinistre),
    },
    {
      title: "Date de clôture",
      dataIndex: "date_cloture",
      key: "date_cloture",
    },
    {
      title: "Status",
      dataIndex: "statutSinistre",
      key: "statutSinistre",
    },
    {
      title: "Type de sinistre",
      dataIndex: "typeSinistre",
      key: "typeSinistre",
    },
    {
      title: "Délégation",
      dataIndex: "delegation",
      key: "delegation",
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
            Sinistres ({allSinistres.length})
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
                  ENREGISTRER UN SINISTRE
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
                Type de sinistre
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("categorie", value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="accident">Accident</Option>
                <Option value="vol">Vol</Option>
                <Option value="incendie">Incendie</Option>
                <Option value="dommages">Dommages</Option>
                <Option value="autre">Autre</Option>
              </Select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Sinistre en délegation
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("categorie", value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="oui">Oui</Option>
                <Option value="non">Non</Option>
              </Select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Risque
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("risque", value)}
              >
                <Option value="tous">Tous</Option>
                <OptGroup label="Risques Habitation">
                  <Option value="incendie">Incendie</Option>
                  <Option value="degat_eaux">Dégât des eaux</Option>
                  <Option value="tempete">Tempête</Option>
                  <Option value="cat_nat">Catastrophe naturelle</Option>
                  <Option value="bris_glace">Bris de glace</Option>
                </OptGroup>

                {/* Theft & Security */}
                <OptGroup label="Risques Vol/Sécurité">
                  <Option value="vol_effraction">Vol avec effraction</Option>
                  <Option value="vol_simple">Vol simple</Option>
                  <Option value="vandalisme">Vandalisme</Option>
                </OptGroup>

                {/* Vehicle Risks */}
                <OptGroup label="Risques Automobile">
                  <Option value="collision">Collision</Option>
                  <Option value="bris_parc">Bris sur parc</Option>
                  <Option value="vol_vehicule">Vol véhicule</Option>
                  <Option value="incendie_vehicule">Incendie véhicule</Option>
                </OptGroup>

                {/* Liability Risks */}
                <OptGroup label="Risques Responsabilité">
                  <Option value="rc_familiale">RC Familiale</Option>
                  <Option value="rc_professionnelle">RC Professionnelle</Option>
                  <Option value="rc_locative">RC Locative</Option>
                </OptGroup>

                {/* Health Risks */}
                <OptGroup label="Risques Santé">
                  <Option value="accident_corporel">Accident corporel</Option>
                  <Option value="invalidite">Invalidité</Option>
                  <Option value="deces">Décès</Option>
                </OptGroup>

                {/* Business Risks */}
                <OptGroup label="Risques Professionnels">
                  <Option value="perte_exploitation">
                    Perte d'exploitation
                  </Option>
                  <Option value="erreur_pro">Erreur professionnelle</Option>
                  <Option value="cyberattaque">Cyberattaque</Option>
                </OptGroup>

                {/* Special Risks */}
                <OptGroup label="Risques Spéciaux">
                  <Option value="attentat">Acte terroriste</Option>
                  <Option value="risque_chantier">Risque chantier</Option>
                  <Option value="risque_transport">Risque transport</Option>
                </OptGroup>
              </Select>
            </div>

            {/* Commissions Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Commissions
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("commissions", value)}
              >
                <Option value="toutes">Toutes</Option>
                <Option value="payee">Payée</Option>
                <Option value="en_attente">En attente</Option>
              </Select>
            </div>

            {/* Assureur Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Assureur
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("assureur", value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="axa">AXA</Option>
                <Option value="allianz">Allianz</Option>
                <Option value="swisslife">SwissLife</Option>
              </Select>
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
  >
    <Option value="tous">Tous les gestionnaires</Option>
    {users.map((user) => {
      const displayName = user.userType === "admin" 
        ? `${user.name}`
        : `${user.nom} ${user.prenom}`;
      
      return (
        <Option 
          key={`${user.userType}-${user._id}`} 
          value={user._id}  // Store user ID
        >
          {displayName}
        </Option>
      );
    })}
  </Select>
</div>

            {/* Status Select */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange('statutSinistre', value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="ouvert">Ouvert</Option>
                <Option value="ferme">Fermé</Option>
                <Option value="attente">En attente</Option>
              </Select>
            </div>

            {/* Recherche Input */}
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
            {sinistreExist === "oui" && (
              <Form.Item
                label="Sinistré"
                name="sinistreSelect"
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
            )}

            {/* If "non" show Input */}
            {sinistreExist === "non" && (
              <Form.Item
                label="Sinistré"
                name="sinistreInput"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez le nom ou ID du sinistre" />
              </Form.Item>
            )}

            <Form.Item
              label="Le contrat existe-t-il dans votre CRM ?"
              name="contratExist"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            {/* If "oui", show Select for contrats */}
            {contratExist === "oui" && (
              <Form.Item
                label="Contrat"
                name="contratSelect"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select placeholder="-- Choisissez --">
                  <Option value="contrat1">Contrat A - 001</Option>
                  <Option value="contrat2">Contrat B - 002</Option>
                  <Option value="contrat3">Contrat C - 003</Option>
                </Select>
              </Form.Item>
            )}

            {/* If "non", show Input for manual contrat entry */}
            {contratExist === "non" && (
              <Form.Item
                label="Numéro de contrat"
                name="contratInput"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez le numéro de contrat" />
              </Form.Item>
            )}

            {/* DÉTAIL DU SINISTRE */}
            <h2 className="text-sm font-semibold mt-12 mb-4">
              DÉTAIL DU SINISTRE
            </h2>

            <Form.Item
              label="Risque"
              name="risque"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                placeholder="-- Choisissez le risque --"
                showSearch
                optionFilterProp="children"
                className="w-full"
              >
                {/* Property Risks */}
                <OptGroup label="Risques Habitation">
                  <Option value="incendie">Incendie</Option>
                  <Option value="degat_eaux">Dégât des eaux</Option>
                  <Option value="tempete">Tempête</Option>
                  <Option value="cat_nat">Catastrophe naturelle</Option>
                  <Option value="bris_glace">Bris de glace</Option>
                </OptGroup>

                {/* Theft & Security */}
                <OptGroup label="Risques Vol/Sécurité">
                  <Option value="vol_effraction">Vol avec effraction</Option>
                  <Option value="vol_simple">Vol simple</Option>
                  <Option value="vandalisme">Vandalisme</Option>
                </OptGroup>

                {/* Vehicle Risks */}
                <OptGroup label="Risques Automobile">
                  <Option value="collision">Collision</Option>
                  <Option value="bris_parc">Bris sur parc</Option>
                  <Option value="vol_vehicule">Vol véhicule</Option>
                  <Option value="incendie_vehicule">Incendie véhicule</Option>
                </OptGroup>

                {/* Liability Risks */}
                <OptGroup label="Risques Responsabilité">
                  <Option value="rc_familiale">RC Familiale</Option>
                  <Option value="rc_professionnelle">RC Professionnelle</Option>
                  <Option value="rc_locative">RC Locative</Option>
                </OptGroup>

                {/* Health Risks */}
                <OptGroup label="Risques Santé">
                  <Option value="accident_corporel">Accident corporel</Option>
                  <Option value="invalidite">Invalidité</Option>
                  <Option value="deces">Décès</Option>
                </OptGroup>

                {/* Business Risks */}
                <OptGroup label="Risques Professionnels">
                  <Option value="perte_exploitation">
                    Perte d'exploitation
                  </Option>
                  <Option value="erreur_pro">Erreur professionnelle</Option>
                  <Option value="cyberattaque">Cyberattaque</Option>
                </OptGroup>

                {/* Special Risks */}
                <OptGroup label="Risques Spéciaux">
                  <Option value="attentat">Acte terroriste</Option>
                  <Option value="risque_chantier">Risque chantier</Option>
                  <Option value="risque_transport">Risque transport</Option>
                </OptGroup>
              </Select>
            </Form.Item>

            <Form.Item
              label="Assureur"
              name="assureur"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select placeholder="-- Choisissez --">
                <Option value="tous">Tous</Option>
                <Option value="axa">AXA</Option>
                <Option value="allianz">Allianz</Option>
                <Option value="swisslife">SwissLife</Option>
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
                <Option value="ouvert">Ouvert</Option>
                <Option value="ferme">Fermé</Option>
                <Option value="attente">En attente</Option>
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
                {/* Property Damage */}
                <Option value="incendie">Incendie</Option>
                <Option value="degat_eaux">Dégât des eaux</Option>
                <Option value="tempete">Tempête/Ouragan</Option>
                <Option value="grêle">Grêle</Option>
                <Option value="neige">Poids de la neige</Option>
                <Option value="cat_nat">Catastrophe naturelle</Option>
                <Option value="bris_glace">Bris de glace</Option>
                <Option value="electrique">Dommages électriques</Option>

                {/* Theft & Vandalism */}
                <Option value="vol">Vol avec effraction</Option>
                <Option value="vol_sans_effraction">Vol sans effraction</Option>
                <Option value="vandalisme">Vandalisme</Option>

                {/* Vehicle-related */}
                <Option value="accident_auto">Accident automobile</Option>
                <Option value="collision">Collision</Option>
                <Option value="bris_parc">Bris sur parc</Option>
                <Option value="incendie_vehicule">Incendie de véhicule</Option>

                {/* Liability */}
                <Option value="responsabilite_civile">
                  Responsabilité civile
                </Option>
                <Option value="dommage_tiers">Dommage aux tiers</Option>

                {/* Health/Life */}
                <Option value="accident_corporel">Accident corporel</Option>
                <Option value="invalidite">Invalidité</Option>
                <Option value="deces">Décès</Option>

                {/* Special Cases */}
                <Option value="attentat">Attentat/Acte terroriste</Option>
                <Option value="disparition">Disparition</Option>
                <Option value="recours_voisin">Recours voisinage</Option>

                {/* Business-specific */}
                <Option value="perte_exploitation">Perte d'exploitation</Option>
                <Option value="erreur_medecine">Erreur médicale</Option>
                <Option value="cyberrisque">Cyber-risque</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Responsabilité"
              name="responsabilite"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input placeholder="Ex: Responsabilité civile" />
            </Form.Item>

            <Form.Item label="Montant du sinistre" name="montantSinistre">
              <Input type="number" placeholder="Ex: 1000€" />
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

            <Form.Item label="Coordonnées de l'expert" name="expert">
              <Input placeholder="Nom, téléphone, email" />
            </Form.Item>

            <Form.Item
              label="Gestionnaire"
              name="gestionnaire"
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
