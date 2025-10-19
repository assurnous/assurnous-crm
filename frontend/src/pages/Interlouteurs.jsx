// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   message,
//   Popconfirm,
//   Avatar,
//   Card,
//   Tabs,
//   Tag,
//   Space,
//   Divider,
//   Badge,
//   Select,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   UserOutlined,
//   TeamOutlined,
//   SearchOutlined,
//   FilterOutlined
// } from "@ant-design/icons";
// import ListAdmin from "./Admin/ListAdmin";


// const { TabPane } = Tabs;
// const { Option } = Select;

// const getInitials = (prenom, nom) => {
//   if (!prenom || !nom) return "";
//   return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
// };

// const statusColors = {
//   active: "green",
//   inactive: "red",
//   pending: "orange"
// };

// const Interlouteurs = () => {
//   const [commercials, setCommercials] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentCommercial, setCurrentCommercial] = useState(null);
//   const [activeTab, setActiveTab] = useState("commerciaux");
//   const [searchText, setSearchText] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [form] = Form.useForm();

//   useEffect(() => {
//     fetchCommercials();
//   }, []);

//   const fetchCommercials = async () => {
//     try {
//       const response = await axios.get("/commercials");
//       console.log("Commercials fetched:", response.data);
//       setCommercials(response.data);
//     } catch (error) {
//       console.error("Error fetching commercials:", error);
//     }
//   };

//   const handleAddCommercial = () => {
//     setIsEditing(false);
//     setCurrentCommercial(null);
//     setIsModalVisible(true);
//   };

//   const handleEditCommercial = (commercial) => {
//     setIsEditing(true);
//     setCurrentCommercial(commercial);
//     form.setFieldsValue({
//       ...commercial,
//       password: "", 
//     });
//     setIsModalVisible(true);
//   };

//   const handleDeleteCommercial = async (commercialId) => {
//     try {
//       await axios.delete(`/commercials/${commercialId}`);
//       message.success("Commercial supprimé avec succès");
//       fetchCommercials();
//     } catch (error) {
//       console.error("Error deleting commercial:", error);
//       message.error("Erreur lors de la suppression du commercial");
//     }
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     form.resetFields();
//     setCurrentCommercial(null);
//   };

//   const handleSave = async (values) => {
//     try {
//       if (isEditing) {
//         const res = await axios.put(`/commercials/${currentCommercial._id}`, values);
//         console.log("Commercial updated:", res.data);
//         message.success("Commercial mis à jour avec succès");
//       } else {
//         const res = await axios.post("/commercials", values);
//         console.log("Commercial added:", res.data);
//         message.success("Commercial ajouté avec succès");
//       }
//       setIsModalVisible(false);
//       form.resetFields();
//       fetchCommercials();
//     } catch (error) {
//       console.error("Error saving commercial:", error);
//       message.error("Erreur lors de la sauvegarde du commercial");
//     }
//   };

//   const filteredCommercials = commercials.filter(commercial => {
//     const matchesSearch = 
//       commercial.nom.toLowerCase().includes(searchText.toLowerCase()) ||
//       commercial.prenom.toLowerCase().includes(searchText.toLowerCase()) ||
//       commercial.email.toLowerCase().includes(searchText.toLowerCase()) ||
//       commercial.phone.toLowerCase().includes(searchText.toLowerCase());
    
//     const matchesStatus = 
//       filterStatus === "all" || commercial.status === filterStatus;
    
//     return matchesSearch && matchesStatus;
//   });
//   const formatLastActivity = (dateString) => {
//     if (!dateString) return 'Never active';
    
//     const now = new Date();
//     const activityDate = new Date(dateString);
//     const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
//     // Time intervals in seconds
//     const minute = 60;
//     const hour = minute * 60;
//     const day = hour * 24;
//     const month = day * 30;
//     const year = day * 365;

//     if (diffInSeconds < minute) return 'Just now';
//     if (diffInSeconds < hour) {
//       const mins = Math.floor(diffInSeconds / minute);
//       return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
//     }
//     if (diffInSeconds < day) {
//       const hours = Math.floor(diffInSeconds / hour);
//       return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
//     }
//     if (diffInSeconds < month) {
//       const days = Math.floor(diffInSeconds / day);
//       return `${days} ${days === 1 ? 'day' : 'days'} ago`;
//     }
//     if (diffInSeconds < year) {
//       return activityDate.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric'
//       });
//     }
    
//     // For dates older than 1 year
//     return activityDate.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const columns = [
//     {
//       title: "COMMERCIAL",
//       key: "nomPrenom",
//       render: (text, record) => (
//         <div className="flex items-center">
//           {record.image ? (
//             <img
//               src={record.image}
//               alt="Commercial"
//               className="w-10 h-10 rounded-full mr-3"
//             />
//           ) : (
//             <Avatar
//               size={40}
//               className="mr-3 bg-blue-600 text-white"
//               icon={<UserOutlined />}
//             >
//               {getInitials(record.prenom, record.nom)}
//             </Avatar>
//           )}
//           <div>
//             <div className="font-medium text-gray-900">
//               {record.prenom} {record.nom}
//             </div>
//             <div className="text-gray-500 text-sm">{record.email}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "STATUS",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => (
//         <Tag color={statusColors[status] || "blue"} className="capitalize">
//           {status}
//         </Tag>
//       ),
//     },
//     {
//       title: "TÉLÉPHONE",
//       dataIndex: "phone",
//       key: "phone",
//       render: (phone) => (
//         <div className="text-gray-700">
//           {phone || <span className="text-gray-400">Non renseigné</span>}
//         </div>
//       ),
//     },
//     {
//       title: "LAST ACTIVITY",
//       key: "lastActivity",
//       render: (_, record) => (
//         <div className="text-gray-600">
//           {formatLastActivity(record.lastActivity)}
//           <div className="text-xs text-gray-400">
//             {record.lastActivity && new Date(record.lastActivity).toLocaleString()}
//           </div>
//         </div>
//       )
//     },
//     {
//       title: "ACTIONS",
//       key: "actions",
//       render: (text, record) => (
//         <Space size="middle">
//           <Button
//             type="text"
//             icon={<EditOutlined className="text-blue-600" />}
//             onClick={() => handleEditCommercial(record)}
//             className="action-button"
//           />
//           <Popconfirm
//             title="Êtes-vous sûr de vouloir supprimer ce commercial?"
//             onConfirm={() => handleDeleteCommercial(record._id)}
//             okText="Oui"
//             cancelText="Non"
//             placement="left"
//           >
//             <Button
//               type="text"
//               icon={<DeleteOutlined className="text-red-600" />}
//               className="action-button"
//             />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-4 mb-6">
//       <div className="crm-header">
//         <h1 className="crm-title">
//           <TeamOutlined className="mr-2" /> Gestion des Utilisateurs
//         </h1>
//         <div className="crm-actions">
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={handleAddCommercial}
//             className="add-button"
//           >
//             Nouveau Commercial
//           </Button>
//         </div>
//       </div>

//       <Card className="crm-card">
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           className="crm-tabs"
//         >
//           <TabPane
//             tab={
//               <span>
//                 <UserOutlined /> Commerciaux
//                 {commercials.length > 0 && (
//                   <Badge
//                     count={commercials.length}
//                     style={{ backgroundColor: '#1890ff', marginLeft: 8 }}
//                   />
//                 )}
//               </span>
//             }
//             key="commerciaux"
//           >
//             <div className="crm-filters">
//               <Input
//                 placeholder="Rechercher un commercial..."
//                 prefix={<SearchOutlined />}
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 className="search-input"
//               />
//               <Select
//                 placeholder="Statut"
//                 value={filterStatus}
//                 onChange={setFilterStatus}
//                 className="status-filter"
//                 allowClear
//               >
//                 <Option value="all">Tous les statuts</Option>
//                 <Option value="active">Actif</Option>
//                 <Option value="inactive">Inactif</Option>
//                 <Option value="pending">En attente</Option>
//               </Select>
//               <Button icon={<FilterOutlined />} className="advanced-filter">
//                 Filtres avancés
//               </Button>
//             </div>

//             <Divider className="crm-divider" />

//             <Table
//                      columns={[
//                       ...columns.map((col) => ({
//                         ...col,
//                         title: (
//                           <div className="flex flex-col items-center">
//                             <div className="text-xs">{col.title}</div>
                      
//                           </div>
//                         ),
//                       })),
//                     ]}
//               dataSource={filteredCommercials}
//               rowKey="_id"
//               className="crm-table"
//               scroll={{ x: '100%' }}
//               pagination={{
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '25', '50', '100'],
//                 showTotal: (total) => `Total: ${total} commerciaux`,
//               }}
//             />
//           </TabPane>
//           <TabPane
//             tab={
//               <span>
//                 <UserOutlined /> Administrateurs
//               </span>
//             }
//             key="administrateurs"
//           >
//             <ListAdmin />
//           </TabPane>
//         </Tabs>
//       </Card>

//       <Modal
//         title={
//           <span className="modal-title">
//             {isEditing ? "Modifier le Commercial" : "Nouveau Commercial"}
//           </span>
//         }
//         visible={isModalVisible}
//         onCancel={handleCancel}
//         footer={null}
//         centered
//         className="crm-modal"
//         width={700}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSave}>
//           <div className="form-grid">
//             <Form.Item
//               name="nom"
//               label="Nom"
//               rules={[{ required: true, message: "Veuillez entrer le nom" }]}
//               className="form-item"
//             >
//               <Input placeholder="Entrez le nom" />
//             </Form.Item>
//             <Form.Item
//               name="prenom"
//               label="Prénom"
//               rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
//               className="form-item"
//             >
//               <Input placeholder="Entrez le prénom" />
//             </Form.Item>
//           </div>

//           <div className="form-grid">
//             <Form.Item
//               name="email"
//               label="Email"
//               rules={[{ required: true, message: "Veuillez entrer l'email" }]}
//               className="form-item"
//             >
//               <Input type="email" placeholder="Entrez l'email" />
//             </Form.Item>
//             <Form.Item
//               name="phone"
//               label="Téléphone"
//               rules={[
//                 { required: true, message: "Veuillez entrer le téléphone" },
//               ]}
//               className="form-item"
//             >
//               <Input placeholder="Entrez le téléphone" />
//             </Form.Item>
//           </div>

//           <div className="form-grid">
//             <Form.Item
//               name="status"
//               label="Statut"
//               initialValue="active"
//               className="form-item"
//             >
//               <Select>
//                 <Option value="active">Actif</Option>
//                 <Option value="inactive">Inactif</Option>
//                 <Option value="pending">En attente</Option>
//               </Select>
//             </Form.Item>
//             <Form.Item
//               name="password"
//               label="Mot de passe"
//               rules={[
//                 {
//                   required: !isEditing,
//                   message: "Veuillez entrer le mot de passe",
//                 },
//               ]}
//               className="form-item"
//             >
//               <Input.Password placeholder="Entrez le mot de passe" />
//             </Form.Item>
//           </div>

//           <Form.Item className="form-actions">
//             <Space>
//               <Button onClick={handleCancel} className="cancel-button">
//                 Annuler
//               </Button>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 className="submit-button"
//               >
//                 {isEditing ? "Mettre à jour" : "Créer"}
//               </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Interlouteurs;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Avatar,
  Card,
  Tabs,
  Tag,
  Space,
  Divider,
  Badge,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  CrownOutlined
} from "@ant-design/icons";
import ListAdmin from "./Admin/ListAdmin";

const { TabPane } = Tabs;
const { Option } = Select;

const getInitials = (prenom, nom) => {
  if (!prenom || !nom) return "";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const statusColors = {
  active: "green",
  inactive: "red",
  pending: "orange"
};

const Interlouteurs = () => {
  const [commercials, setCommercials] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState("commercial"); // "commercial" or "manager"
  const [activeTab, setActiveTab] = useState("commerciaux");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCommercials();
    fetchManagers();
  }, []);

  const fetchCommercials = async () => {
    try {
      const response = await axios.get("/commercials");
      console.log("Commercials fetched:", response.data);
      setCommercials(response.data);
    } catch (error) {
      console.error("Error fetching commercials:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get("/manager");
      console.log("Managers fetched:", response.data);
      setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleAddUser = (type) => {
    setIsEditing(false);
    setCurrentUser(null);
    setUserType(type);
    setIsModalVisible(true);
  };

  const handleEditUser = (user, type) => {
    setIsEditing(true);
    setCurrentUser(user);
    setUserType(type);
    form.setFieldsValue({
      ...user,
      password: "", 
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId, type) => {
    try {
      const endpoint = type === "commercial" ? `/commercials/${userId}` : `/manager/${userId}`;
      await axios.delete(endpoint);
      message.success(`${type === "commercial" ? "Commercial" : "Manager"} supprimé avec succès`);
      
      if (type === "commercial") {
        fetchCommercials();
      } else {
        fetchManagers();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Erreur lors de la suppression du ${type === "commercial" ? "commercial" : "manager"}`);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentUser(null);
  };

  const handleSave = async (values) => {
    try {
      if (isEditing) {
        const endpoint = userType === "commercial" 
          ? `/commercials/${currentUser._id}` 
          : `/manager/${currentUser._id}`;
        const res = await axios.put(endpoint, values);
        console.log(`${userType} updated:`, res.data);
        message.success(`${userType === "commercial" ? "Commercial" : "Manager"} mis à jour avec succès`);
      } else {
        const endpoint = userType === "commercial" ? "/commercials" : "/manager";
        const res = await axios.post(endpoint, values);
        console.log(`${userType} added:`, res.data);
        message.success(`${userType === "commercial" ? "Commercial" : "Manager"} ajouté avec succès`);
      }
      
      setIsModalVisible(false);
      form.resetFields();
      
      if (userType === "commercial") {
        fetchCommercials();
      } else {
        fetchManagers();
      }
    } catch (error) {
      console.error(`Error saving ${userType}:`, error);
      message.error(`Erreur lors de la sauvegarde du ${userType === "commercial" ? "commercial" : "manager"}`);
    }
  };

  const filteredCommercials = commercials.filter(commercial => {
    const matchesSearch = 
      commercial.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
      commercial.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
      commercial.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      commercial.phone?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || commercial.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
      manager.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      manager.phone?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || manager.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Never active';
    
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    // Time intervals in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) return 'Just now';
    if (diffInSeconds < hour) {
      const mins = Math.floor(diffInSeconds / minute);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    if (diffInSeconds < day) {
      const hours = Math.floor(diffInSeconds / hour);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < month) {
      const days = Math.floor(diffInSeconds / day);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    if (diffInSeconds < year) {
      return activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    // For dates older than 1 year
    return activityDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const userColumns = (type) => [
    {
      title: type === "commercial" ? "COMMERCIAL" : "MANAGER",
      key: "nomPrenom",
      render: (text, record) => (
        <div className="flex items-center">
          {record.image ? (
            <img
              src={record.image}
              alt={type}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <Avatar
              size={40}
              className="mr-3 bg-blue-600 text-white"
              icon={<UserOutlined />}
            >
              {getInitials(record.prenom, record.nom)}
            </Avatar>
          )}
          <div>
            <div className="font-medium text-gray-900">
              {record.prenom} {record.nom}
            </div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "blue"} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: "TÉLÉPHONE",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <div className="text-gray-700">
          {phone || <span className="text-gray-400">Non renseigné</span>}
        </div>
      ),
    },
    {
      title: "LAST ACTIVITY",
      key: "lastActivity",
      render: (_, record) => (
        <div className="text-gray-600">
          {formatLastActivity(record.lastActivity)}
          <div className="text-xs text-gray-400">
            {record.lastActivity && new Date(record.lastActivity).toLocaleString()}
          </div>
        </div>
      )
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => handleEditUser(record, type)}
            className="action-button"
          />
          <Popconfirm
            title={`Êtes-vous sûr de vouloir supprimer ce ${type === "commercial" ? "commercial" : "manager"}?`}
            onConfirm={() => handleDeleteUser(record._id, type)}
            okText="Oui"
            cancelText="Non"
            placement="left"
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-red-600" />}
              className="action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 mb-6">
      <div className="crm-header">
        <h1 className="crm-title">
          <TeamOutlined className="mr-2" /> Gestion des Utilisateurs
        </h1>
        <div className="crm-actions">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddUser("commercial")}
              className="add-button"
            >
              Nouveau Commercial
            </Button>
            <Button
              type="primary"
              icon={<CrownOutlined />}
              onClick={() => handleAddUser("manager")}
              className="add-button"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Nouveau Manager
            </Button>
          </Space>
        </div>
      </div>

      <Card className="crm-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="crm-tabs"
        >
          <TabPane
            tab={
              <span>
                <UserOutlined /> Commerciaux
                {commercials.length > 0 && (
                  <Badge
                    count={commercials.length}
                    style={{ backgroundColor: '#1890ff', marginLeft: 8 }}
                  />
                )}
              </span>
            }
            key="commerciaux"
          >
            <div className="crm-filters">
              <Input
                placeholder="Rechercher un commercial..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <Select
                placeholder="Statut"
                value={filterStatus}
                onChange={setFilterStatus}
                className="status-filter"
                allowClear
              >
                <Option value="all">Tous les statuts</Option>
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
                <Option value="pending">En attente</Option>
              </Select>
              <Button icon={<FilterOutlined />} className="advanced-filter">
                Filtres avancés
              </Button>
            </div>

            <Divider className="crm-divider" />

            <Table
              columns={userColumns("commercial").map((col) => ({
                ...col,
                title: (
                  <div className="flex flex-col items-center">
                    <div className="text-xs">{col.title}</div>
                  </div>
                ),
              }))}
              dataSource={filteredCommercials}
              rowKey="_id"
              className="crm-table"
              scroll={{ x: '100%' }}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100'],
                showTotal: (total) => `Total: ${total} commerciaux`,
              }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <CrownOutlined /> Managers
                {managers.length > 0 && (
                  <Badge
                    count={managers.length}
                    style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
                  />
                )}
              </span>
            }
            key="managers"
          >
            <div className="crm-filters">
              <Input
                placeholder="Rechercher un manager..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <Select
                placeholder="Statut"
                value={filterStatus}
                onChange={setFilterStatus}
                className="status-filter"
                allowClear
              >
                <Option value="all">Tous les statuts</Option>
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
                <Option value="pending">En attente</Option>
              </Select>
              <Button icon={<FilterOutlined />} className="advanced-filter">
                Filtres avancés
              </Button>
            </div>

            <Divider className="crm-divider" />

            <Table
              columns={userColumns("manager").map((col) => ({
                ...col,
                title: (
                  <div className="flex flex-col items-center">
                    <div className="text-xs">{col.title}</div>
                  </div>
                ),
              }))}
              dataSource={filteredManagers}
              rowKey="_id"
              className="crm-table"
              scroll={{ x: '100%' }}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100'],
                showTotal: (total) => `Total: ${total} managers`,
              }}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <UserOutlined /> Administrateurs
              </span>
            }
            key="administrateurs"
          >
            <ListAdmin />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <span className="modal-title">
            {isEditing 
              ? `Modifier le ${userType === "commercial" ? "Commercial" : "Manager"}` 
              : `Nouveau ${userType === "commercial" ? "Commercial" : "Manager"}`
            }
          </span>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        className="crm-modal"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="form-grid">
            <Form.Item
              name="nom"
              label="Nom"
              rules={[{ required: true, message: "Veuillez entrer le nom" }]}
              className="form-item"
            >
              <Input placeholder="Entrez le nom" />
            </Form.Item>
            <Form.Item
              name="prenom"
              label="Prénom"
              rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
              className="form-item"
            >
              <Input placeholder="Entrez le prénom" />
            </Form.Item>
          </div>

          <div className="form-grid">
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Veuillez entrer l'email" }]}
              className="form-item"
            >
              <Input type="email" placeholder="Entrez l'email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Téléphone"
              rules={[
                { required: true, message: "Veuillez entrer le téléphone" },
              ]}
              className="form-item"
            >
              <Input placeholder="Entrez le téléphone" />
            </Form.Item>
          </div>

          <div className="form-grid">
            <Form.Item
              name="status"
              label="Statut"
              initialValue="active"
              className="form-item"
            >
              <Select>
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
                <Option value="pending">En attente</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                {
                  required: !isEditing,
                  message: "Veuillez entrer le mot de passe",
                },
              ]}
              className="form-item"
            >
              <Input.Password placeholder="Entrez le mot de passe" />
            </Form.Item>
          </div>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={handleCancel} className="cancel-button">
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                {isEditing ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Interlouteurs;