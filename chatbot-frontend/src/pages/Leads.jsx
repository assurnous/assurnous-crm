import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Spin,
  Table,
  Alert,
  Select,
  Button,
  Popconfirm,
  Space,
  message,
  Input,
  Form,
  DatePicker,
  Modal,
  Radio,
  InputNumber,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const { Option } = Select;

const Leads = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("tous");
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [filters, setFilters] = useState({
    gestionaire: "tous",
    categorie: "tous",
    status: "tous",
    search: "",
  });

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterValues) => {
    let result = [...chatData];
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter((item) => 
        item.gestionnaire?.toLowerCase() === filterValues.gestionnaire.toLowerCase()
      );
    }

    // Apply categorie filter
    if (filterValues.categorie !== "tous") {
      result = result.filter(
        (item) =>
          item.categorie?.toLowerCase() === filterValues.categorie.toLowerCase()
      );
    }

    // Apply status filter - updated to match your schema's "statut" field
    if (filterValues.status !== "tous") {
      result = result.filter(
        (item) =>
          item.statut?.toLowerCase() === filterValues.status.toLowerCase()
      );
    }

    // Apply search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nom?.toLowerCase().includes(searchTerm) ||
          item.prenom?.toLowerCase().includes(searchTerm) ||
          item.email?.toLowerCase().includes(searchTerm) ||
          item.portable?.includes(filterValues.search) ||
          item.gestionnaire?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(result);
    setCurrentPage(1);
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

  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    try {
      const response = await axios.post("/data", values);
      console.log("Lead added successfully:", response.data);
      form.resetFields();
      setIsModalOpen(false);
      setChatData((prev) => [...prev, response.data]); // Update chatData with the new lead
      setFilteredData((prev) => [...prev, response.data]); // Update filteredData with the new lead
      alert("Le client à été créé avec succès !");
      // Handle successful submission, e.g., show a success message or reset form
    } catch (error) {
      console.error("Error adding lead:", error);
      message.error("Erreur lors de l'ajout du client"); // Handle error (e.g., show error message)
    }
  };

  const handlePageChange = (value) => {
    setCurrentPage(value);
  };
  const handleLeadClick = (chatData) => {
    navigate(`/lead/${chatData._id}`);
  };

  const totalPages = Math.ceil(chatData.length / pageSize);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        setChatData(response.data.chatData);
   
        if (activeFilter === "prospect") {
          setFilteredData(
            response.data.chatData.filter((item) => item.type === "prospect")
          );
        } else if (activeFilter === "client") {
          setFilteredData(
            response.data.chatData.filter((item) => item.type === "client")
          );
        } else if (activeFilter === "tous") {
          setFilteredData(response.data.chatData);
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleStatusLeadChange = async (newStatus, record) => {
    try {
      const validStatuses = ["prospect", "client"];
      
      if (!validStatuses.includes(newStatus)) {
        console.error("Invalid status value");
        return;
      }
  
      const response = await axios.put(`/updateStatusLead/${record._id}`, {
        statut: newStatus  // Changed from statusLead to statut to match schema
      });
  
      // Update both states - changed 'type' to 'statut'
      setChatData((prev) =>
        prev.map((item) =>
          item._id === record._id ? { ...item, statut: newStatus } : item
        )
      );
      setFilteredData((prev) =>
        prev.map((item) =>
          item._id === record._id ? { ...item, statut: newStatus } : item
        )
      );
  
      console.log("Updated status:", response.data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);

      // Update both states
      setChatData((prev) => prev.filter((lead) => lead._id !== id));
      setFilteredData((prev) => prev.filter((lead) => lead._id !== id));

      message.success("Lead supprimé avec succès");
    } catch (error) {
      console.error("Error deleting coach:", error);
      message.error("Failed to delete coach");
    }
  };

  const columns = [
    {
      title: "Client",
      key: "client",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.nom} {record.prenom}
          </div>
        </div>
      ),
    },
    {
      title: "Categorie",
      key: "categorie",
      dataIndex: "categorie",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.categorie || ""}</div>
        </div>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "portable",
      key: "portable",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.portable || ""}</div>
        </div>
      ),
    },
    {
      title: "Mail",
      dataIndex: "email",
      key: "email",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.email || ""}</div>
        </div>
      ),
    },
    {
      title: "Devis en cours",
      dataIndex: "codepostal",
      key: "codepostal",
      render: (text) => text || "",
    },
    {
      title: "STATUS",
      key: "statut",
      render: (text, record) => (
        <Select
          value={record.statut || "prospect"}
          style={{ width: 90 }}
          onChange={(value) => handleStatusLeadChange(value, record)}
        >
          <Option value="prospect">Prospect</Option>
          <Option value="client">Client</Option>
        </Select>
      ),
    },
    {
      title: "Gestionnaire",
      dataIndex: "gestionnaire",
      key: "gestionnaire",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.gestionnaire || ""}</div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: "12px" }}>Action</span>,
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce lead ?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ backgroundColor: "red", color: "white" }}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && showSpinner) return <Spin tip="Loading..." />;

  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
        <h2 className="text-xs sm:text-sm font-semibold text-purple-900 text-center md:text-left">
          CLIENTS/PROSPECTS ({chatData.length})
        </h2>

        {/* Buttons container - column on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
          <Button type="primary" className="w-full md:w-auto">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              <span className="text-[10px] sm:text-xs whitespace-nowrap">
                IMPORTER VOTRE BASE CLIENTS/PROSPECTS
              </span>
            </div>
          </Button>

          <Button
            type="primary"
            className="w-full md:w-auto"
            onClick={showModal}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              <span className="text-[10px]  sm:text-xs whitespace-nowrap">
                ENREGISTRER UN CLIENT/PROSPECT
              </span>
            </div>
          </Button>
        </div>
      </div>

      <div className="p-4 bg-white mt-6 border-t rounded-md border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Gestionaire
            </label>
          
            <Select
  className="w-full text-xs h-7"
  placeholder="-- Choisissez le gestionnaire --"
  showSearch
  optionFilterProp="children"
  filterOption={(input, option) =>
    option.children.toLowerCase().includes(input.toLowerCase())
  }
  onChange={(value) => handleFilterChange("gestionnaire", value)}
>
  <Option value="tous">Tous</Option>
  {users.map((user) => {
    const displayName =
      user.userType === "admin"
        ? user.name
        : `${user.nom} ${user.prenom}`;

    return (
      <Option
        key={user._id}
        value={displayName}  // Store the exact format used in chatData
      >
        {displayName}
      </Option>
    );
  })}
</Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <Select
              className="w-full"
              placeholder="-- Choisissez --"
              onChange={(value) => handleFilterChange("categorie", value)}
              value={filters.categorie}
            >
              <Option value="tous">Tous</Option>
              <Option value="particulier">Particulier</Option>
              <Option value="professionnel">Professionnel</Option>
              <Option value="entreprise">Entreprise</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              className="w-full"
              placeholder="-- Choisissez --"
              onChange={(value) => handleFilterChange("status", value)}
              value={filters.status}
            >
              <Option value="tous">Tous</Option>
              <Option value="prospect">Prospect</Option>
              <Option value="client">Client</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <Input
              placeholder="Rechercher..."
              allowClear
              onChange={(e) => handleFilterChange("search", e.target.value)}
              value={filters.search}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 flex items-center rounded-md gap-4">
        <span className="font-thin text-gray-600">Afficher</span>
        <Select
          defaultValue={1}
          onChange={handlePageChange}
          className="w-20 border-gray-300"
          placeholder="-- Choisissez --"
        >
          {[...Array(totalPages)].map((_, index) => (
            <Option key={index + 1} value={index + 1}>
              {index + 1}
            </Option>
          ))}
        </Select>

        <span className="font-thin text-gray-600">résultats par page</span>
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
          dataSource={filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
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
              ENREGISTRER UN CLIENT/PROSPECT
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
            {/* === INFORMATIONS GÉNÉRALES === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">
              INFORMATIONS GÉNÉRALES
            </h2>

            {/* Catégorie */}
            <Form.Item
              label={<span className="text-xs font-medium">CATÉGORIE*</span>}
              name="categorie"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                onChange={() =>
                  form.setFieldsValue({
                    denomination_commerciale: undefined,
                    raison_sociale: undefined,
                    siret: undefined,
                  })
                }
              >
                <Option value="particulier">Particulier</Option>
                <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </Form.Item>

            {/* Statut */}
            <Form.Item
              label={<span className="text-xs font-medium">STATUS*</span>}
              name="statut"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="client">Client</Option>
                <Option value="prospect">Prospect</Option>
                <Option value="ancien_client">Ancien client</Option>
              </Select>
            </Form.Item>

            {/* Civilité */}
            <Form.Item
              label={<span className="text-xs font-medium">CIVILITÉ*</span>}
              name="civilite"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="monsieur">M.</Option>
                <Option value="madame">Mme</Option>
                <Option value="mademoiselle">Mlle</Option>
                <Option value="societe">Société</Option>
              </Select>
            </Form.Item>

            {/* === INFORMATIONS PERSONNELLES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              INFORMATIONS PERSONNELLES
            </h2>

            {/* Nom */}
            <Form.Item
              label={<span className="text-xs font-medium">NOM*</span>}
              name="nom"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Nom" />
            </Form.Item>

            {/* Nom de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">NOM DE NAISSANCE</span>
              }
              name="nom_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Nom de naissance"
              />
            </Form.Item>

            {/* Prénom */}
            <Form.Item
              label={<span className="text-xs font-medium">PRÉNOM*</span>}
              name="prenom"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Prénom" />
            </Form.Item>

            {/* Date de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">DATE DE NAISSANCE*</span>
              }
              name="date_naissance"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" format="DD/MM/YYYY" />
            </Form.Item>

            {/* Pays de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">PAYS DE NAISSANCE*</span>
              }
              name="pays_naissance"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                showSearch
              >
                <Option value="france">France</Option>
                <Option value="belgique">Belgique</Option>
                <Option value="suisse">Suisse</Option>
                <Option value="autre">Autre</Option>
              </Select>
            </Form.Item>

            {/* Code postal de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  CODE POSTAL DE NAISSANCE
                </span>
              }
              name="code_postal_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Code postal de naissance"
              />
            </Form.Item>

            {/* Commune de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMMUNE DE NAISSANCE
                </span>
              }
              name="commune_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Commune de naissance"
              />
            </Form.Item>

            {/* Situation familiale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  SITUATION FAMILIALE*
                </span>
              }
              name="situation_famille"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="celibataire">Célibataire</Option>
                <Option value="marie">Marié(e)</Option>
                <Option value="pacsé">Pacsé(e)</Option>
                <Option value="divorce">Divorcé(e)</Option>
                <Option value="veuf">Veuf(ve)</Option>
                <Option value="concubinage">Concubinage</Option>
              </Select>
            </Form.Item>

            {/* Enfants à charge */}
            <Form.Item
              label={
                <span className="text-xs font-medium">ENFANTS À CHARGE</span>
              }
              name="enfants_charge"
              className="mb-0"
            >
              <InputNumber
                className="w-full text-xs h-7"
                min={0}
                placeholder="Nombre d'enfants à charge"
              />
            </Form.Item>

            {/* === ADRESSE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">ADRESSE</h2>

            {/* N° et libellé de la voie */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  N° ET LIBELLÉ DE LA VOIE*
                </span>
              }
              name="numero_voie"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: 12 rue des Fleurs"
              />
            </Form.Item>

            {/* Complément d'adresse */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMPLÉMENT D'ADRESSE
                </span>
              }
              name="complement_adresse"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: Bâtiment B, Appartement 12"
              />
            </Form.Item>

            {/* Lieu-dit */}
            <Form.Item
              label={<span className="text-xs font-medium">LIEU-DIT</span>}
              name="lieu_dit"
              className="mb-0"
            >
              <Input className="w-full text-xs h-7" placeholder="Lieu-dit" />
            </Form.Item>

            {/* Code postal */}
            <Form.Item
              label={<span className="text-xs font-medium">CODE POSTAL*</span>}
              name="code_postal"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Code postal" />
            </Form.Item>

            {/* Ville */}
            <Form.Item
              label={<span className="text-xs font-medium">VILLE*</span>}
              name="ville"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Ville" />
            </Form.Item>

            {/* Inscrit sur Bloctel */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  INSCRIT SUR BLOCTEL*
                </span>
              }
              name="bloctel"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            {/* === COORDONNÉES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">COORDONNÉES</h2>

            {/* Téléphone portable */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE PORTABLE*</span>
              }
              name="portable"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
                inputProps={{
                  required: true,
                }}
              />
            </Form.Item>

            {/* Téléphone fixe */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE FIXE</span>
              }
              name="fixe"
              className="mb-0"
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="text-xs font-medium">EMAIL*</span>}
              name="email"
              className="mb-0"
              rules={[
                { required: true, message: "Ce champ est obligatoire" },
                { type: "email", message: "Email non valide" },
              ]}
            >
              <Input
                type="email"
                className="w-full text-xs h-7"
                placeholder="Email"
              />
            </Form.Item>

            <>
              <h2 className="text-sm font-semibold mt-6 mb-2">
                INFORMATIONS PROFESSIONNELLES
              </h2>

              {/* Activité de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    ACTIVITÉ DE L'ENTREPRISE*
                  </span>
                }
                name="activite_entreprise"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Activité principale"
                />
              </Form.Item>

              {/* Catégorie socioprofessionnelle */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CATÉGORIE SOCIOPROFESSIONNELLE*
                  </span>
                }
                name="categorie_professionnelle"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="agriculteur">Agriculteur</Option>
                  <Option value="artisan">Artisan, commerçant</Option>
                  <Option value="cadre">Cadre</Option>
                  <Option value="prof_interm">Profession intermédiaire</Option>
                  <Option value="employe">Employé</Option>
                  <Option value="ouvrier">Ouvrier</Option>
                  <Option value="retraite">Retraité</Option>
                  <Option value="sans_activite">
                    Sans activité professionnelle
                  </Option>
                </Select>
              </Form.Item>

              {/* Domaine d'activité */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DOMAINE D'ACTIVITÉ*
                  </span>
                }
                name="domaine_activite"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                  showSearch
                >
                  <Option value="agriculture">Agriculture</Option>
                  <Option value="industrie">Industrie</Option>
                  <Option value="construction">Construction</Option>
                  <Option value="commerce">Commerce</Option>
                  <Option value="transport">Transport</Option>
                  <Option value="information">Information/Communication</Option>
                  <Option value="finance">Finance/Assurance</Option>
                  <Option value="immobilier">Immobilier</Option>
                  <Option value="scientifique">
                    Activités scientifiques/techniques
                  </Option>
                  <Option value="administratif">
                    Activités administratives
                  </Option>
                  <Option value="public">Administration publique</Option>
                  <Option value="enseignement">Enseignement</Option>
                  <Option value="sante">Santé/Social</Option>
                  <Option value="art">Arts/Spectacles</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">STATUT JURIDIQUE*</span>
                }
                name="statut_juridique"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sasu">SASU</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="micro">Micro-entreprise</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DÉNOMINATION COMMERCIALE*
                  </span>
                }
                name="denomination_commerciale"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Nom commercial"
                />
              </Form.Item>

              {/* Raison sociale */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">RAISON SOCIALE</span>
                }
                name="raison_sociale"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Raison sociale"
                />
              </Form.Item>

              {/* Date de création */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">DATE DE CRÉATION</span>
                }
                name="date_creation"
                className="mb-0"
              >
                <DatePicker
                  className="w-full text-xs h-7"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              {/* SIRET */}
              <Form.Item
                label={<span className="text-xs font-medium">SIRET*</span>}
                name="siret"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  {
                    pattern: /^\d{14}$/,
                    message: "Le SIRET doit contenir 14 chiffres",
                  },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Numéro SIRET (14 chiffres)"
                />
              </Form.Item>

              {/* Forme juridique */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">FORME JURIDIQUE</span>
                }
                name="forme_juridique"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              {/* Téléphone de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    TÉLÉPHONE DE L'ENTREPRISE*
                  </span>
                }
                name="telephone_entreprise"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <PhoneInput
                  country={"fr"}
                  inputClass="w-full text-xs h-7"
                  containerClass="w-full"
                />
              </Form.Item>

              {/* Email de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    EMAIL DE L'ENTREPRISE*
                  </span>
                }
                name="email_entreprise"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { type: "email", message: "Email non valide" },
                ]}
              >
                <Input
                  type="email"
                  className="w-full text-xs h-7"
                  placeholder="Email professionnel"
                />
              </Form.Item>

              {/* Site internet */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">SITE INTERNET</span>
                }
                name="site_internet"
                className="mb-0"
                rules={[{ type: "url", message: "URL non valide" }]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="https://www.example.com"
                />
              </Form.Item>

              {/* Code NAF */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">CODE NAF/APE*</span>
                }
                name="code_naf"
                className="mb-0"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Ex: 62.02A"
                />
              </Form.Item>

              {/* IDCC */}
              <Form.Item
                label={<span className="text-xs font-medium">IDCC</span>}
                name="idcc"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Identifiant de convention collective"
                />
              </Form.Item>

              {/* Bénéficiaires effectifs */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    BÉNÉFICIAIRES EFFECTIFS
                  </span>
                }
                name="beneficiaires_effectifs"
                className="mb-0"
              >
                <Input.TextArea
                  rows={3}
                  className="w-full text-xs"
                  placeholder="Liste des bénéficiaires effectifs"
                />
              </Form.Item>

              {/* Chiffre d'affaires */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CHIFFRE D'AFFAIRES (€)
                  </span>
                }
                name="chiffre_affaires"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                  }
                  parser={(value) => value.replace(/\s/g, "")}
                  min={0}
                  placeholder="Montant en euros"
                />
              </Form.Item>

              {/* Effectif */}
              <Form.Item
                label={<span className="text-xs font-medium">EFFECTIF</span>}
                name="effectif"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  min={0}
                  placeholder="Nombre d'employés"
                />
              </Form.Item>

              {/* Période de clôture d'exercice */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    PÉRIODE DE CLÔTURE D'EXERCICE
                  </span>
                }
                name="periode_cloture"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="31/12">31 décembre</Option>
                  <Option value="30/06">30 juin</Option>
                  <Option value="31/03">31 mars</Option>
                  <Option value="30/09">30 septembre</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>
            </>

            {/* === SÉCURITÉ SOCIALE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              SÉCURITÉ SOCIALE
            </h2>

            {/* Régime de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  RÉGIME DE SÉCURITÉ SOCIALE*
                </span>
              }
              name="regime_securite_sociale"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="general">Régime général</Option>
                <Option value="agricole">Régime agricole</Option>
                <Option value="independant">Régime indépendant</Option>
                <Option value="fonctionnaire">Fonction publique</Option>
                <Option value="autre">Autre régime</Option>
              </Select>
            </Form.Item>

            {/* Numéro de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  NUMÉRO DE SÉCURITÉ SOCIALE*
                </span>
              }
              name="num_secu"
              className="mb-0"
              rules={[
                { required: true, message: "Ce champ est obligatoire" },
                {
                  pattern:
                    /^[12][0-9]{2}[0-1][0-9](2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$/,
                  message: "Format invalide (15 chiffres + clé)",
                },
              ]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Numéro de sécurité sociale"
              />
            </Form.Item>

            {/* === GESTION === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">GESTION</h2>

            {/* Type d'origine */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TYPE D'ORIGINE*</span>
              }
              name="type_origine"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="web">Site web</Option>
                <Option value="reseau">Réseaux sociaux</Option>
                <Option value="recommandation">Recommandation</Option>
                <Option value="salon">Salon/Événement</Option>
                <Option value="publicite">Publicité</Option>
                <Option value="autre">Autre</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-medium">GESTIONNAIRE*</span>}
              name="gestionnaire"
              className="mb-0"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez un gestionnaire --"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {users.map((user) => {
                  // Handle different field names between admin and commercial
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
              label={<span className="text-xs font-medium">CRÉÉ PAR*</span>}
              name="cree_par"
              className="mb-0"
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

            {/* Intermédiaire(s) */}
            <Form.Item
              label={
                <span className="text-xs font-medium">INTERMÉDIAIRE(S)</span>
              }
              name="intermediaire"
              className="mb-0"
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                mode="multiple"
              >
                <Option value="assureur">Assureur</Option>
                <Option value="agent">Agent général</Option>
                <Option value="courtier">Courtier</Option>
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

export default Leads;
