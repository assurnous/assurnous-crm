import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Tooltip,
  Statistic
} from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  UserOutlined,
  SolutionOutlined 
} from "@ant-design/icons";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AffectuerLead = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commercials, setCommercials] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
  const [assignType, setAssignType] = useState("commercial"); // "commercial" or "manager"
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [unassignForm] = Form.useForm();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();

  // Helper function to check if a lead has a commercial
  const hasCommercial = (lead) => {
    if (!lead.commercial) return false;
    if (typeof lead.commercial === 'string') return lead.commercial !== '';
    if (typeof lead.commercial === 'object') return lead.commercial !== null;
    return false;
  };

  // Helper function to check if a lead has a manager
  const hasManager = (lead) => {
    if (!lead.manager) return false;
    if (typeof lead.manager === 'string') return lead.manager !== '';
    if (typeof lead.manager === 'object') return lead.manager !== null;
    return false;
  };

  // Check if selected leads are eligible for commercial assignment
  const canAssignToCommercial = useMemo(() => {
    if (selectedLeads.length === 0) return false;
    
    return selectedLeads.every(leadId => {
      const lead = chatData.find(item => item._id === leadId);
      return lead && !hasCommercial(lead) && !hasManager(lead);
    });
  }, [selectedLeads, chatData]);

  // Check if selected leads are eligible for manager assignment
  const canAssignToManager = useMemo(() => {
    if (selectedLeads.length === 0) return false;
    
    return selectedLeads.every(leadId => {
      const lead = chatData.find(item => item._id === leadId);
      return lead && !hasManager(lead) && !hasCommercial(lead);
    });
  }, [selectedLeads, chatData]);

  // Check if selected leads can be unassigned from commercial
  const canUnassignFromCommercial = useMemo(() => {
    if (selectedLeads.length === 0) return false;
    
    return selectedLeads.every(leadId => {
      const lead = chatData.find(item => item._id === leadId);
      return lead && hasCommercial(lead);
    });
  }, [selectedLeads, chatData]);

  // Check if selected leads can be unassigned from manager
  const canUnassignFromManager = useMemo(() => {
    if (selectedLeads.length === 0) return false;
    
    return selectedLeads.every(leadId => {
      const lead = chatData.find(item => item._id === leadId);
      return lead && hasManager(lead);
    });
  }, [selectedLeads, chatData]);

  // Get assignment status for tooltip
  const getAssignmentStatus = useMemo(() => {
    if (selectedLeads.length === 0) return "Aucun client sélectionné";

    const selectedLeadsData = chatData.filter(item => selectedLeads.includes(item._id));
    
    const hasCommercialAssigned = selectedLeadsData.some(lead => hasCommercial(lead));
    const hasManagerAssigned = selectedLeadsData.some(lead => hasManager(lead));
    const hasMixedAssignment = hasCommercialAssigned && hasManagerAssigned;
    const allFree = selectedLeadsData.every(lead => !hasCommercial(lead) && !hasManager(lead));

    if (allFree) return "Tous les clients sélectionnés sont libres";
    if (hasCommercialAssigned && !hasManagerAssigned) return "Certains clients sont déjà affectés à un commercial";
    if (hasManagerAssigned && !hasCommercialAssigned) return "Certains clients sont déjà affectés à un manager";
    if (hasMixedAssignment) return "Les clients sélectionnés ont des affectations mixtes";

    return "Statut d'affectation";
  }, [selectedLeads, chatData]);

  // Sort data: unassigned leads first, then by creation date
  const sortedData = useMemo(() => {
    const dataToSort = filteredData.length > 0 ? filteredData : chatData;
    
    return [...dataToSort].sort((a, b) => {
      // Check if lead has commercial or manager
      const aHasAssignment = hasCommercial(a) || hasManager(a);
      const bHasAssignment = hasCommercial(b) || hasManager(b);
      
      // Unassigned leads come first
      if (!aHasAssignment && bHasAssignment) return -1;
      if (aHasAssignment && !bHasAssignment) return 1;
      
      // If same assignment status, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [chatData, filteredData]);

  // Helper function to get commercial name for display and search
  const getCommercialName = (lead) => {
    if (!hasCommercial(lead)) return "N/A";
    
    if (typeof lead.commercial === 'string') {
      const commercial = commercials.find(com => com._id === lead.commercial);
      return commercial ? `${commercial.prenom} ${commercial.nom}` : "N/A";
    }
    
    if (lead.commercial.prenom && lead.commercial.nom) {
      return `${lead.commercial.prenom} ${lead.commercial.nom}`;
    }
    
    return "N/A";
  };

  // Helper function to get manager name for display and search
  const getManagerName = (lead) => {
    if (!hasManager(lead)) return "N/A";
    
    if (typeof lead.manager === 'string') {
      const manager = managers.find(mgr => mgr._id === lead.manager);
      return manager ? `${manager.prenom} ${manager.nom}` : "N/A";
    }
    
    if (lead.manager.prenom && lead.manager.nom) {
      return `${lead.manager.prenom} ${lead.manager.nom}`;
    }
    
    return "N/A";
  };

  // Get assignment type for a lead
  const getAssignmentType = (lead) => {
    if (hasCommercial(lead)) return "commercial";
    if (hasManager(lead)) return "manager";
    return "none";
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        setChatData(response.data.chatData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    fetchCommercials();
    fetchManagers();
  }, []);

  // Fixed commercial column search
  const handleColumnSearch = async (e, columnKey) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchQuery(value);

    try {
      // If search value is empty, clear filtered data
      if (value === "") {
        setFilteredData([]);
        return;
      }

      // Special handling for commercial column search
      if (columnKey === "commercial") {
        const filteredResults = chatData.filter((item) => {
          const commercialName = getCommercialName(item).toLowerCase();
          return commercialName.includes(value);
        });
        setFilteredData(filteredResults);
        return;
      }

      // Special handling for manager column search
      if (columnKey === "manager") {
        const filteredResults = chatData.filter((item) => {
          const managerName = getManagerName(item).toLowerCase();
          return managerName.includes(value);
        });
        setFilteredData(filteredResults);
        return;
      }

      // Default search for other fields
      const response = await axios.get("/search", {
        params: {
          query: value,
          columnKey: columnKey,
        },
      });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error in search:", error);
      message.error("Error on recherche.");
    }
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      const endpoint = assignType === "commercial" ? "/assign-leads" : "/assign-manager";
      const field = assignType === "commercial" ? "commercial" : "manager";
      const idField = assignType === "commercial" ? "commercialId" : "managerId";

      // Double-check on frontend before sending request
      const invalidLeads = selectedLeads.filter(leadId => {
        const lead = chatData.find(item => item._id === leadId);
        return hasCommercial(lead) || hasManager(lead);
      });

      if (invalidLeads.length > 0) {
        message.error("Certains clients sélectionnés sont déjà affectés");
        return;
      }

      await axios.post(
        endpoint,
        {
          id: selectedLeads,
          [idField]: values[field],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const updatedLeads = chatData.map((lead) => {
        if (selectedLeads.includes(lead._id)) {
          const sourceList = assignType === "commercial" ? commercials : managers;
          const assignedPerson = sourceList.find(person => person._id === values[field]);
          return {
            ...lead,
            [field]: assignedPerson,
          };
        }
        return lead;
      });
      
      setChatData(updatedLeads);
      message.success(`Clients affectés au ${assignType === "commercial" ? "commercial" : "manager"} avec succès`);
      setIsAssignModalVisible(false);
      setSelectedLeads([]);
      assignForm.resetFields();
    } catch (error) {
      console.error(`Error assigning leads to ${assignType}:`, error);
      message.error(`Échec de l'affectation des clients au ${assignType === "commercial" ? "commercial" : "manager"}`);
    }
  };
// Statistics calculations
const stats = useMemo(() => {
  const totalClients = chatData.length;
  const assignedToCommercial = chatData.filter(lead => hasCommercial(lead)).length;
  const assignedToManager = chatData.filter(lead => hasManager(lead)).length;
  const unassigned = totalClients - assignedToCommercial - assignedToManager;
  
  return { totalClients, assignedToCommercial, assignedToManager, unassigned };
}, [chatData]);
  const fetchCommercials = async () => {
    try {
      const response = await axios.get("/commercials");
      setCommercials(response.data);
      console.log("Fetched commercials:", response.data);
    } catch (error) {
      console.error("Error :", error);
      message.error("Échec de la récupération des commerciaux");
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get("/manager");
      setManagers(response.data);
      console.log("Fetched managers:", response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
      message.error("Échec de la récupération des managers");
    }
  };

  const handleUnassign = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      const endpoint = assignType === "commercial" ? "/unassign-leads" : "/unassign-manager";
      const field = assignType === "commercial" ? "commercial" : "manager";

      await axios.post(
        endpoint,
        {
          id: selectedLeads,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const updatedLeads = chatData.map((lead) => {
        if (selectedLeads.includes(lead._id)) {
          return {
            ...lead,
            [field]: null,
          };
        }
        return lead;
      });
      
      setChatData(updatedLeads);
      message.success(`Clients désaffectés du ${assignType === "commercial" ? "commercial" : "manager"} avec succès`);
      setIsUnassignModalVisible(false);
      setSelectedLeads([]);
    } catch (error) {
      console.error(`Error unassigning ${assignType}:`, error);
      message.error(`Échec de la désaffectation des clients du ${assignType === "commercial" ? "commercial" : "manager"}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);
      console.log("Chat deleted successfully:", response.data);
      setChatData(chatData.filter((lead) => lead._id !== id));
      message.success("Lead supprimé avec succès");
    } catch (error) {
      console.error("Error deleting lead:", error);
      message.error("Échec de la suppression du client");
    }
  };

  const openAssignModal = (type) => {
    setAssignType(type);
    setIsAssignModalVisible(true);
  };

  const openUnassignModal = (type) => {
    setAssignType(type);
    setIsUnassignModalVisible(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedLeads(selectedRowKeys);
    },
    selectedRowKeys: selectedLeads,
    getCheckboxProps: (record) => ({
      disabled: false, // You can add logic here to disable selection of already assigned leads if needed
    }),
  };

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };

  

  const columns = [
    {
      title: "Prénom et Nom",
      key: "nom",
      dataIndex: "nom",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.nom} {record.prenom}
          </div>
          <div className="text-xs text-gray-500">
            {getAssignmentType(record) === "commercial" && "✓ Affecté à un commercial"}
            {getAssignmentType(record) === "manager" && "✓ Affecté à un manager"}
            {getAssignmentType(record) === "none" && "⏳ Non affecté"}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      render: (text, record) => (
        <div className="text-gray-500 text-xs">
          {record.verification_email === "Non"
            ? record.email1 || ""
            : record.email || ""}
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "",
    },
    {
      title: "code postal",
      dataIndex: "codepostal",
      key: "codepostal",
      render: (text) => text || "",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
      render: (text) => text || "",
    },
    {
      title: "TELEPHONE",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (text, record) => text || record.statut || "",
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        if (!date) return "-";
        const formattedDate = new Date(date);
        const day = formattedDate.toLocaleDateString("en-GB");
        const time = formattedDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div>
            <div>{day}</div>
            <div className="text-gray-500 text-sm">{time}</div>
          </div>
        );
      },
    },
    {
      title: "Commentaires",
      dataIndex: "commentaire",
      key: "commentaire",
      render: (text, record) => (
        <div className="text-gray-500 text-xs">
          {record.commentaire && <div>{record.commentaire}</div>}
          {record.comment && <div>{record.comment}</div>}
          {!record.commentaire && !record.comment && "-"}
        </div>
      ),
    },
    {
      title: "Commercial",
      key: "commercial",
      dataIndex: "commercial",
      render: (text, record) => {
        const commercialName = getCommercialName(record);
        if (commercialName === "N/A") {
          return <Tag color="gray">NON AFFECTÉ</Tag>;
        }
        return <Tag color="blue">{commercialName}</Tag>;
      },
    },
    {
      title: "Manager",
      key: "manager",
      dataIndex: "manager",
      render: (text, record) => {
        const managerName = getManagerName(record);
        if (managerName === "N/A") {
          return <Tag color="gray">NON AFFECTÉ</Tag>;
        }
        return <Tag color="green">{managerName}</Tag>;
      },
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

  return (
    <div className="md:p-4 p-1 w-full">
      <h1 className="text-xl font-bold mb-4">Affectation des clients</h1>
      <Row gutter={16} className="mb-6">
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic
          title="Total Clients"
          value={stats.totalClients}
          valueStyle={{ color: '#3f8600' }}
          prefix={<TeamOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic
          title="Affectés Commercial"
          value={stats.assignedToCommercial}
          valueStyle={{ color: '#1890ff' }}
          prefix={<UserAddOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic
          title="Affectés Manager"
          value={stats.assignedToManager}
          valueStyle={{ color: '#722ed1' }}
          prefix={<SolutionOutlined />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic
          title="Non Affectés"
          value={stats.unassigned}
          valueStyle={{ color: '#cf1322' }}
          prefix={<UserOutlined />}
        />
      </Card>
    </Col>
  </Row>
      {/* Assignment Status Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <InfoCircleOutlined className="text-blue-500 mr-2" />
          <span className="text-sm text-blue-700 font-medium">
            {getAssignmentStatus}
          </span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          • Un client ne peut être affecté qu'à un commercial OU un manager, pas aux deux
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={canAssignToCommercial ? "" : "Seuls les clients non affectés peuvent être assignés à un commercial"}>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                onClick={() => openAssignModal("commercial")}
                disabled={!canAssignToCommercial}
              >
                Affecter au Commercial ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={canUnassignFromCommercial ? "" : "Seuls les clients affectés à un commercial peuvent être désaffectés"}>
              <Button
                icon={<UserDeleteOutlined />}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={() => openUnassignModal("commercial")}
                disabled={!canUnassignFromCommercial}
              >
                Désaffecter du Commercial ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={canAssignToManager ? "" : "Seuls les clients non affectés peuvent être assignés à un manager"}>
              <Button
                type="primary"
                icon={<TeamOutlined />}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                onClick={() => openAssignModal("manager")}
                disabled={!canAssignToManager}
              >
                Affecter au Manager ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip title={canUnassignFromManager ? "" : "Seuls les clients affectés à un manager peuvent être désaffectés"}>
              <Button
                icon={<UserDeleteOutlined />}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold"
                onClick={() => openUnassignModal("manager")}
                disabled={!canUnassignFromManager}
              >
                Désaffecter du Manager ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      <div className="mb-4">
        <span className="font-semibold text-gray-700">
          Total clients: {sortedData.length}
          {filteredData.length > 0 && ` (Filtered: ${filteredData.length})`}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 overflow-x-auto">
        <Table
          dataSource={sortedData}
          columns={columns.map((col) => ({
            ...col,
            title: (
              <div className="flex flex-col items-center">
                <div className="text-xs">{col.title}</div>
                {col.key !== "action" && col.key !== "createdAt" && col.key !== "commentaire" && col.key !== "comment" && (
                  <Input
                    placeholder={`Search ${col.title}`}
                    onChange={(e) => handleColumnSearch(e, col.key)}
                    className="mt-2"
                    size="small"
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            ),
          }))}
          rowKey={(record) => record._id}
          pagination={{
            current: currentPage,
            pageSize,
            total: sortedData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          bordered
          rowSelection={rowSelection}
          className="custom-table text-xs sm:text-sm"
          tableLayout="auto"
        />
      </div>

      {/* Assign Modal */}
      <Modal
        title={`Affecter les clients au ${assignType === "commercial" ? "Commercial" : "Manager"}`}
        visible={isAssignModalVisible}
        onCancel={() => {
          setIsAssignModalVisible(false);
          assignForm.resetFields();
        }}
        footer={null}
      >
        <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <div className="text-sm text-yellow-700">
            <strong>Note:</strong> {selectedLeads.length} client(s) seront affectés au {assignType === "commercial" ? "commercial" : "manager"} sélectionné.
          </div>
        </div>
        <Form form={assignForm} onFinish={handleAssign}>
          <Form.Item
            name={assignType === "commercial" ? "commercial" : "manager"}
            label={assignType === "commercial" ? "Commercial" : "Manager"}
            rules={[
              {
                required: true,
                message: `Veuillez sélectionner un ${assignType === "commercial" ? "commercial" : "manager"}`,
              },
            ]}
          >
            <Select placeholder={`Sélectionnez un ${assignType === "commercial" ? "commercial" : "manager"}`}>
              {(assignType === "commercial" ? commercials : managers).map((person) => (
                <Option key={person._id} value={person._id}>
                  {person.prenom} {person.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                Affecter
              </Button>
              <Button
                onClick={() => {
                  setIsAssignModalVisible(false);
                  assignForm.resetFields();
                }}
              >
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Unassign Modal */}
      <Modal
        title={`Désaffecter les clients du ${assignType === "commercial" ? "Commercial" : "Manager"}`}
        visible={isUnassignModalVisible}
        onCancel={() => setIsUnassignModalVisible(false)}
        footer={null}
      >
        <Form form={unassignForm} onFinish={handleUnassign}>
          <Form.Item>
            <div className="mb-4 p-3 bg-orange-50 rounded border border-orange-200">
              <div className="text-sm text-orange-700">
                <strong>Attention:</strong> Êtes-vous sûr de vouloir désaffecter {selectedLeads.length} client(s) du {assignType === "commercial" ? "commercial" : "manager"} ?
              </div>
            </div>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Désaffecter
              </Button>
              <Button
                onClick={() => setIsUnassignModalVisible(false)}
              >
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AffectuerLead;