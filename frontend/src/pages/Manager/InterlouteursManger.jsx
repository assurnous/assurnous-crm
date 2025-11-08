import React, { useState, useEffect, useContext, useCallback } from "react";
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
} from "@ant-design/icons";
import { UserContext } from "../../UserContext";

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

const InterlouteursManager = () => {
  const [commercials, setCommercials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCommercial, setCurrentCommercial] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Add this to prevent multiple fetches
  const [form] = Form.useForm();
  
  // Use your UserContext
  const { token, decodedToken, isLoggedIn } = useContext(UserContext);

  // Get current manager from decoded token - use useMemo to prevent unnecessary recalculations
  const currentManager = React.useMemo(() => {
    if (!decodedToken) return null;
    
    return {
      id: decodedToken.userId,
      role: decodedToken.role,
      name: decodedToken.name,
      nom: decodedToken.name.split(' ').slice(1).join(' ') || '',
      prenom: decodedToken.name.split(' ')[0] || '',
    };
  }, [decodedToken]); // Only recalculate when decodedToken changes

  // Memoize the fetch function
  const fetchCommercials = useCallback(async () => {
    if (!currentManager || !token || hasFetched) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/commercials/manager/${currentManager.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Commercials fetched:", response.data);
      setCommercials(response.data);
      setHasFetched(true); // Mark as fetched to prevent future calls
    } catch (error) {
      console.error("Error fetching commercials:", error);
      
      if (error.response?.status === 401) {
        message.error("Session expirée, veuillez vous reconnecter");
      } else {
        message.error("Erreur lors du chargement des commerciaux");
      }
    } finally {
      setLoading(false);
    }
  }, [currentManager, token, hasFetched]);

  // Check authentication and authorization - FIXED useEffect
  useEffect(() => {
    // Only run if we have a valid manager and haven't fetched yet
    if (currentManager && currentManager.role.toLowerCase() === 'manager' && !hasFetched) {
      fetchCommercials();
    }
  }, [currentManager, hasFetched, fetchCommercials]); // Add fetchCommercials to dependencies

  // Separate useEffect for authentication checks
  useEffect(() => {
    if (!isLoggedIn()) {
      message.error("Veuillez vous connecter");
      return;
    }

    if (currentManager && currentManager.role.toLowerCase() !== 'manager') {
      message.error("Accès non autorisé - Réservé aux managers");
      return;
    }
  }, [isLoggedIn, currentManager]);

  const handleAddCommercial = () => {
    if (!isLoggedIn() || !currentManager) {
      message.error("Veuillez vous connecter");
      return;
    }
    
    setIsEditing(false);
    setCurrentCommercial(null);
    setIsModalVisible(true);
  };

  const handleEditCommercial = (commercial) => {
    // Additional security check - ensure the commercial belongs to this manager
    if (commercial.createdBy !== currentManager.id) {
      message.error("Vous ne pouvez modifier que vos propres commerciaux");
      return;
    }
    
    setIsEditing(true);
    setCurrentCommercial(commercial);
    form.setFieldsValue({
      ...commercial,
      password: "", 
    });
    setIsModalVisible(true);
  };

  const handleDeleteCommercial = async (commercialId) => {
    try {
      await axios.delete(`/commercials/${commercialId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      message.success("Commercial supprimé avec succès");
      // Reset hasFetched to allow refetching
      setHasFetched(false);
    } catch (error) {
      console.error("Error deleting commercial:", error);
      
      if (error.response?.status === 401) {
        message.error("Session expirée");
      } else if (error.response?.status === 403) {
        message.error("Vous n'avez pas la permission de supprimer ce commercial");
      } else {
        message.error("Erreur lors de la suppression du commercial");
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentCommercial(null);
  };

  const handleSave = async (values) => {
    if (!isLoggedIn() || !currentManager) {
      message.error("Veuillez vous connecter");
      return;
    }

    try {
      if (isEditing) {
        const res = await axios.put(`/commercials/${currentCommercial._id}`, values, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Commercial updated:", res.data);
        message.success("Commercial mis à jour avec succès");
      } else {
        // Use the manager-specific endpoint
        const res = await axios.post("/commercial", values, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Commercial added:", res.data);
        message.success("Commercial ajouté avec succès");
      }
      
      setIsModalVisible(false);
      form.resetFields();
      // Reset hasFetched to trigger refetch
      setHasFetched(false);
    } catch (error) {
      console.error("Error saving commercial:", error);
      
      if (error.response?.status === 401) {
        message.error("Session expirée");
      } else if (error.response?.status === 400) {
        message.error("Données invalides");
      } else {
        message.error("Erreur lors de la sauvegarde du commercial");
      }
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

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Jamais actif';
    
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) return 'À l\'instant';
    if (diffInSeconds < hour) {
      const mins = Math.floor(diffInSeconds / minute);
      return `Il y a ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
    if (diffInSeconds < day) {
      const hours = Math.floor(diffInSeconds / hour);
      return `Il y a ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
    }
    if (diffInSeconds < month) {
      const days = Math.floor(diffInSeconds / day);
      return `Il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
    }
    if (diffInSeconds < year) {
      return activityDate.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    return activityDate.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const commercialColumns = [
    {
      title: "COMMERCIAL",
      key: "nomPrenom",
      render: (text, record) => (
        <div className="flex items-center">
          {record.image ? (
            <img
              src={record.image}
              alt="commercial"
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
              <Tag color="blue" className="ml-2 text-xs">
                Votre commercial
              </Tag>
            </div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "STATUT",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "blue"} className="capitalize">
          {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'En attente'}
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
      title: "DERNIÈRE ACTIVITÉ",
      key: "lastActivity",
      render: (_, record) => (
        <div className="text-gray-600">
          {formatLastActivity(record.lastActivity)}
          <div className="text-xs text-gray-400">
            {record.lastActivity && new Date(record.lastActivity).toLocaleString('fr-FR')}
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
            onClick={() => handleEditCommercial(record)}
            className="action-button"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce commercial?"
            onConfirm={() => handleDeleteCommercial(record._id)}
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

  // Show loading or error state
  if (!isLoggedIn()) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500">Veuillez vous connecter pour accéder à cette page</div>
      </div>
    );
  }

  if (currentManager && currentManager.role.toLowerCase() !== 'manager') {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500">Accès non autorisé. Cette page est réservée aux managers.</div>
      </div>
    );
  }

  return (
    <div className="p-4 mb-6">
      <div className="crm-header">
        <h1 className="crm-title">
          <TeamOutlined className="mr-2" /> 
          Gestion de Mes Commerciaux
          <Tag color="orange" className="ml-2">
            Manager: {currentManager?.prenom} {currentManager?.nom}
          </Tag>
        </h1>
        <div className="crm-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCommercial}
            className="add-button"
            loading={loading}
          >
            Nouveau Commercial
          </Button>
        </div>
      </div>

      <Card className="crm-card">
        <Tabs defaultActiveKey="commerciaux" className="crm-tabs">
          <TabPane
            tab={
              <span>
                <UserOutlined /> Mes Commerciaux
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

            <div className="mb-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-700 text-sm">
                💡 <strong>Information:</strong> Vous gérez ici uniquement les commerciaux que vous avez créés. 
                Chaque commercial que vous créez vous est automatiquement attribué.
              </p>
            </div>

            <Table
              columns={commercialColumns}
              dataSource={filteredCommercials}
              rowKey="_id"
              className="crm-table"
              loading={loading}
              scroll={{ x: '100%' }}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100'],
                showTotal: (total) => `Total: ${total} commerciaux`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <span className="modal-title">
            {isEditing 
              ? "Modifier le Commercial" 
              : "Nouveau Commercial"
            }
            <Tag color="blue" className="ml-2">
              Votre commercial
            </Tag>
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
              rules={[
                { required: true, message: "Veuillez entrer l'email" },
                { type: 'email', message: "Email invalide" }
              ]}
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
                {
                  min: 6,
                  message: "Le mot de passe doit contenir au moins 6 caractères"
                }
              ]}
              className="form-item"
            >
              <Input.Password placeholder="Entrez le mot de passe" />
            </Form.Item>
          </div>

          {!isEditing && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-blue-700 text-sm">
                ℹ️ Ce commercial vous sera automatiquement attribué et ne sera visible que par vous.
              </p>
            </div>
          )}

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={handleCancel} className="cancel-button">
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
                loading={loading}
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

export default InterlouteursManager;