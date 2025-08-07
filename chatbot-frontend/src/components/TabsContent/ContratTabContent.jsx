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
    Row,
    Col,
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

const ContratTabContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [contratData, setContratData] = useState([]);
  const [gestionnaire, setGestionnaire] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredContrat, setFilteredContrat] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState(null);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;


  const handleStatusFilter = (value) => {
    setStatusFilter(value);

    if (value === "all") {
      setFilteredContrat(contratData);
    } else {
      const filtered = contratData.filter((contrat) => contrat.status === value);
      setFilteredContrat(filtered);
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
      changeStatus: contrat.changeStatus,
      anniversary: contrat.anniversary,
      paymentType: contrat.paymentType,
      cree_par: contrat.cree_par,

    date_effet: contrat.effectiveDate
      ? new Date(contrat.effectiveDate).toLocaleDateString()
      : "N/A",
    originalData: contrat,
    documents: contrat.documents || [],
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
        const contratId = editingRecord.originalData?._id;
        if (!contratId) {
          throw new Error("Missing contrat ID for update");
        }
  
        response = await axios.put(`/contrat/${contratId}`, formData);
      setContratData(prev => prev.map(item => 
        item.key === contratId ? formatContratItem(response.data) : item
      ));
      setFilteredContrat(prev => prev.map(item => 
        item.key === contratId ? formatContratItem(response.data) : item
      ));
        message.success("Contrat mis à jour avec succès");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        // CREATE NEW CONTRAT
        response = await axios.post("/contrat", formData);
        const newItem = formatContratItem(response.data);
      
        setContratData(prev => [newItem, ...prev]);
        setFilteredContrat(prev => [newItem, ...prev]);
        setCurrentPage(1);
        message.success("Contrat ajoutée avec succès");
          form.resetFields();
      setIsModalOpen(false);
      }
  
      setRefreshTrigger(prev => prev + 1);
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
      const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;
      const userRole = decodedToken?.role;
      setLoading(true);

      try {
        const response = await axios.get(`/contrat/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-ID": currentUserId,
            "X-User-Role": userRole,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const formattedData = response.data.data.map((contrat, index) => ({
          key: contrat._id,
          contractNumber: contrat.contractNumber,
          gestionnaire: contrat.lead.gestionnaire,
          riskType: contrat.riskType,
          insurer: contrat.insurer,
          status: contrat.status,
          source: contrat.type_origine,
          prime: contrat.prime,
          paymentMethod: contrat.paymentMethod,
            changeStatus: contrat.changeStatus,
            anniversary: contrat.anniversary,
            paymentType: contrat.paymentType,
            cree_par: contrat.cree_par,

          date_effet: contrat.effectiveDate
            ? new Date(contrat.effectiveDate).toLocaleDateString()
            : "N/A",
          originalData: contrat,
          documents: contrat.documents || [],
          intermediaire: contrat.intermediaire || "N/A",
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

    if (id && currentUserId && userRole) {
      fetchAllContrats();
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
      title: "N° contrat",
      dataIndex: "contractNumber",
      key: "contractNumber",
      sorter: (a, b) => a.contractNumber.localeCompare(b.contractNumber),
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
          etude: { color: "blue", text: "En étude" },
          devis_envoye: { color: "orange", text: "Devis envoyé" },
          attente_signature: { color: "purple", text: "En attente signature" },
          cloture_sans_suite: { color: "red", text: "Clôturé sans suite" },
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
        { text: "Temporaire", value: "temporaire" }
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
    contractNumber: record.originalData?.contractNumber,
    courtier: record.originalData?.courtier,
    riskType: record.originalData?.riskType,
    changeStatus: record.originalData?.changeStatus,
    anniversary: record.originalData?.anniversary,
    competitionContract: record.originalData?.competitionContract,
    paymentType: record.originalData?.paymentType,
    paymentMethod: record.originalData?.paymentMethod,
    insurer: record.originalData?.insurer,
    status: record.originalData?.status,
    type_origine: record.originalData?.type_origine,
    prime: record.originalData?.prime,
    commissionRate: record.originalData?.commissionRate,
    brokerageFees: record.originalData?.brokerageFees,
    recurrentCommission: record.originalData?.recurrentCommission,
    
    // Dates
    effectiveDate: record.originalData?.effectiveDate 
      ? dayjs(record.originalData.effectiveDate)
      : null,
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
      content: "Êtes-vous sûr de vouloir supprimer le contrat ?",
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
            Enregistrer un contrat
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
    <Option value="en_cours">En cours</Option>
    <Option value="mise_en_demeure">Mise en demeure</Option>
    <Option value="reduit">Réduit</Option>
    <Option value="resilie">Résilié</Option>
    <Option value="sans_effet">Sans effet</Option>
    <Option value="suspendu">Suspendu</Option>
    <Option value="temporaire">Temporaire</Option>
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
        dataSource={filteredContrat}
        loading={loading}
        bordered
        // pagination={{ pageSize: 10 }}
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
        scroll={{ x: "max-content" }}
      />

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
          name="changeStatus"
          label="Souhaitez vous changer le statut du prospect en client ?"
          className="mb-4"
        >
          <Radio.Group>
            <Radio value="oui">Oui</Radio>
            <Radio value="non">Non</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      {/* CONTRACT SECTION */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">CONTRAT</h2>
       
            <Form.Item
              name="contractNumber"
              label="N° contrat"
              rules={[{ required: false, message: 'Ce champ est obligatoire' }]}
            >
              <Input placeholder="N° contrat" />
            </Form.Item>
        
    
            <Form.Item
              name="riskType"
              label="Risque"
              rules={[{ required: false, message: 'Ce champ est obligatoire' }]}
            >
              <Select placeholder="-- Choisissez --">
                {RISQUES.map(risque => (
                  <Option key={risque.value} value={risque.value}>
                    {risque.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
        

      
            <Form.Item
              name="insurer"
              label="Assureur"
              rules={[{ required: false, message: 'Ce champ est obligatoire' }]}
            >
              <Select 
                showSearch
                placeholder="-- Choisissez --"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {ASSUREURS.map(assureur => (
                  <Option key={assureur.value} value={assureur.value}>
                    {assureur.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
         
            <Form.Item
              name="effectiveDate"
              label="Date d'effet"
              rules={[{ required: false, message: 'Ce champ est obligatoire' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
        
            <Form.Item
              name="anniversary"
              label="Echéance anniversaire"
            >
              <Input placeholder="jour/mois" />
            </Form.Item>
       
            <Form.Item
              name="competitionContract"
              label="Contrat concurrence"
            >
              <Radio.Group>
                <Radio value="oui">oui</Radio>
                <Radio value="non">non</Radio>
              </Radio.Group>
            </Form.Item>
         
            <Form.Item
              name="paymentType"
              label="Type de paiement"
            >
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
              rules={[{ required: false, message: 'Ce champ est obligatoire' }]}
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
          
            <Form.Item
              name="paymentMethod"
              label="Modalité de paiement"
            >
              <Select placeholder="Choisissez">
              <Option value="cb">CB</Option>
    <Option value="cheque">Chèque</Option>
    <Option value="prelevement">Prélèvement</Option>
              </Select>
            </Form.Item>
        
            <Form.Item
              name="prime"
              label="Prime TTC"
            >
              <Input 
                addonAfter="€" 
              />
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
      </div>

      {/* COMMISSIONS SECTION */}
     
      <div className="mb-6">
  <h2 className="text-lg font-semibold mb-4">COMMISSIONS</h2>
  

      <Form.Item
        name="commissionRate"
        label="Taux de commission"
      >
        <Input 
          addonAfter="%" 
        />
      </Form.Item>
   
      <Form.Item
        name="brokerageFees"
        label="Frais de courtage"
      >
        <Input 
          addonAfter="€" 
        />
      </Form.Item>
   
      <Form.Item
        name="recurrentCommission"
        label="Commission récurrente"
      >
        <Input 
          addonAfter="€" 
        />
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
    </div>
  );
};

export default ContratTabContent;
