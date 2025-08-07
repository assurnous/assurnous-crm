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
  Spin,
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

const DevisTabContent = () => {
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

  // Fetch chat data on component mount
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
        response = await axios.post("/devis", formData);
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

  

  useEffect(() => {
    const fetchAllDevis = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;
      const userRole = decodedToken?.role;
      setLoading(true);

      try {
        const response = await axios.get(`/devis/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-ID": currentUserId,
            "X-User-Role": userRole,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const formattedData = response.data.data.map((devis, index) => ({
          key: devis._id,
          numero_devis: devis.numero_devis,
          gestionnaire: devis.lead.gestionnaire,
          risque: devis.risque,
          assureur: devis.assureur,
          statut: devis.statut,
          source: devis.type_origine,
          date_effet: devis.date_effet
            ? new Date(devis.date_effet).toLocaleDateString()
            : "N/A",
          originalData: devis,
          documents: devis.documents || [],
          contratNumber: devis.contratDetails?.numero_contrat || "N/A",
          intermediaire: devis.intermediaire || "N/A",
        }));

        setDevisData(formattedData);
        setFilteredDevis(formattedData); // Initialize filtered data with all devis

      } catch (error) {
        console.error(
          "Error fetching devis:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUserId && userRole) {
      fetchAllDevis();
    }
  }, [id, currentUserId, userRole, token]);


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
      title: "N° devis",
      dataIndex: "numero_devis",
      key: "numero_devis",
      sorter: (a, b) => a.numero_devis.localeCompare(b.numero_devis),
    },
    {
      title: "Gestionnaire",
      dataIndex: "gestionnaire",
      key: "gestionnaire",
      render: (gestionnaire, record) => (
        <>
          {gestionnaire}
          {userRole === "Admin" && (
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.originalData.session?.email}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Risque",
      dataIndex: "risque",
      key: "risque",
    },
    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut) => {
        const statusMap = {
          etude: { color: "blue", text: "En étude" },
          devis_envoye: { color: "orange", text: "Devis envoyé" },
          attente_signature: { color: "purple", text: "En attente signature" },
          cloture_sans_suite: { color: "red", text: "Clôturé sans suite" },
        };
        return (
          <Tag color={statusMap[statut]?.color || "default"}>
            {statusMap[statut]?.text || statut}
          </Tag>
        );
      },
      filters: [
        { text: "En étude", value: "etude" },
        { text: "Devis envoyé", value: "devis_envoye" },
        { text: "En attente signature", value: "attente_signature" },
        { text: "Clôturé sans suite", value: "cloture_sans_suite" },
      ],
      onFilter: (value, record) => record.statut === value,
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
             {record.documents?.length > 0 && (
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            // Open first document in new tab
            window.open(record.documents[0].url, '_blank');
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
            Enregistrer un devis
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
              {editingRecord ? "MODIFIER LE DEVIS" : "ENREGISTRER UN DEVIS"}
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
            className="w-full space-y-4" // Increased vertical spacing
            initialValues={{
              gestionnaire: gestionnaire?._id || gestionnaire || null
            }}
          >
            {/* === INFORMATIONS GÉNÉRALES === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">INFORMATION</h2>

            <Form.Item
              name="courtier"
              label="Courtier"
              initialValue="Assurnous EAB assurances"
              className="w-full" // Ensure full width
            >
              <Input
                readOnly
                value="Assurnous EAB assurances"
                className="w-full"
              />
            </Form.Item>

            {/* === RISQUE ET ASSUREUR === */}
            <Form.Item
              name="risque"
              label="Risque"
              rules={[
                { required: false, message: "Veuillez sélectionner un risque" },
              ]}
              className="w-full"
            >
              <Select
    className="w-full text-xs h-7"
    placeholder="Sélectionnez un type de risque"
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  >
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
              rules={[
                {
                  required: false,
                  message: "Veuillez sélectionner un assureur",
                },
              ]}
              className="w-full"
            >
              <Select
        showSearch
        placeholder="Sélectionnez un assureur"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        className="w-full text-xs h-7"
      >
        {ASSUREURS.map(assureur => (
          <Option key={assureur.value} value={assureur.value}>
            {assureur.label}
          </Option>
        ))}
      </Select>
            </Form.Item>

            {/* === STATUT ET NUMERO === */}
            <Form.Item
              name="statut"
              label="Statut *"
              rules={[
                { required: false, message: "Veuillez sélectionner un statut" },
              ]}
              className="w-full"
            >
              <Select placeholder="-- Choisissez --" className="w-full">
                <Option value="etude">Etude</Option>
                <Option value="devis_envoye">Devis envoyé</Option>
                <Option value="attente_signature">En attente signature</Option>
                <Option value="cloture_sans_suite">
                  Devis clôturé sans suite
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="numero_devis"
              label="N° de Devis *"
              rules={[
                {
                  required: false,
                  message: "Le numéro de devis est obligatoire",
                },
              ]}
              className="w-full"
            >
              <Input placeholder="N° de Devis" className="w-full" />
            </Form.Item>

            {/* === DATES === */}
            <Form.Item
              name="date_effet"
              label="Date d'effet"
              className="w-full"
            >
              <DatePicker className="w-full"  />
            </Form.Item>

           
            <Form.Item
              name="date_creation"
              label="Date de création"
              className="w-full"
            >
              <DatePicker className="w-full"  />
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
            {/* === TYPE ET CREATEUR === */}
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

            <Form.Item
              label={<span className="text-xs font-medium">CRÉÉ PAR*</span>}
              name="cree_par"
              className="mb-0"
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

            {/* === INTERMEDIAIRE === */}
            <Form.Item
              label={<span className="text-xs font-medium">INTERMÉDIAIRE</span>}
              name="intermediaire"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
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

            {/* === PRIMES === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">LE BUDGET</h2>
            <Form.Item
              name="prime_proposee"
              label="Prime TTC proposée"
              className="w-full"
            >
              <InputNumber
                className="w-full"
                addonAfter="€"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="prime_actuelle"
              label="Prime TTC actuelle"
              className="w-full"
            >
              <InputNumber
                className="w-full"
                addonAfter="€"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item name="variation" label="Variation" className="w-full">
              <InputNumber
                className="w-full"
                disabled
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* === DOCUMENTS === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">DOCUMENTS</h2>

            <Form.Item name="document" label="Devis Document">
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
          </Form>
          {/* <Button
            type="primary"
            htmlType="submit"
            className="w-full text-xs h-7 mt-2 mb-4"
          >
            Enregistrer
          </Button> */}
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
                ? "Modifier le devis"
                : "Enregistrer le devis"}
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default DevisTabContent;
