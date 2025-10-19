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
  Statistic,
} from "antd";
import {
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const { Option } = Select;

const ManagerAffectation = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commercials, setCommercials] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
  const [assignForm] = Form.useForm();
  const [unassignForm] = Form.useForm();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [currentManagerId, setCurrentManagerId] = useState(null);

  // Helper function to check if a lead has a commercial
  const hasCommercial = (lead) => {
    if (!lead.commercial) return false;
    if (typeof lead.commercial === "string") return lead.commercial !== "";
    if (typeof lead.commercial === "object") return lead.commercial !== null;
    return false;
  };

  // Helper function to check if a lead has a manager
  const hasManager = (lead) => {
    if (!lead.manager) return false;
    if (typeof lead.manager === "string") return lead.manager !== "";
    if (typeof lead.manager === "object") return lead.manager !== null;
    return false;
  };

  // Check if selected leads are eligible for commercial assignment
  const canAssignToCommercial = useMemo(() => {
    if (selectedLeads.length === 0) return false;

    return selectedLeads.every((leadId) => {
      const lead = chatData.find((item) => item._id === leadId);
      return lead && !hasCommercial(lead);
    });
  }, [selectedLeads, chatData]);

  // Check if selected leads can be unassigned from commercial
  const canUnassignFromCommercial = useMemo(() => {
    if (selectedLeads.length === 0) return false;

    return selectedLeads.every((leadId) => {
      const lead = chatData.find((item) => item._id === leadId);
      return lead && hasCommercial(lead);
    });
  }, [selectedLeads, chatData]);

  // Get assignment status for tooltip
  const getAssignmentStatus = useMemo(() => {
    if (selectedLeads.length === 0) return "Aucun client sélectionné";

    const selectedLeadsData = chatData.filter((item) =>
      selectedLeads.includes(item._id)
    );

    const hasCommercialAssigned = selectedLeadsData.some((lead) =>
      hasCommercial(lead)
    );
    const allFree = selectedLeadsData.every((lead) => !hasCommercial(lead));

    if (allFree) return "Tous les clients sélectionnés sont libres";
    if (hasCommercialAssigned)
      return "Certains clients sont déjà affectés à un commercial";

    return "Statut d'affectation";
  }, [selectedLeads, chatData]);

  // Statistics
  const stats = useMemo(() => {
    const totalClients = chatData.length;
    const assignedToCommercial = chatData.filter((lead) =>
      hasCommercial(lead)
    ).length;
    const unassigned = totalClients - assignedToCommercial;

    return { totalClients, assignedToCommercial, unassigned };
  }, [chatData]);

  // Sort data: unassigned leads first, then by creation date
  const sortedData = useMemo(() => {
    const dataToSort = filteredData.length > 0 ? filteredData : chatData;

    return [...dataToSort].sort((a, b) => {
      // Check if lead has commercial
      const aHasCommercial = hasCommercial(a);
      const bHasCommercial = hasCommercial(b);

      // Unassigned leads come first
      if (!aHasCommercial && bHasCommercial) return -1;
      if (aHasCommercial && !bHasCommercial) return 1;

      // If same commercial status, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [chatData, filteredData]);

  // Helper function to get commercial name for display and search
  const getCommercialName = (lead) => {
    if (!hasCommercial(lead)) return "N/A";

    if (typeof lead.commercial === "string") {
      const commercial = commercials.find((com) => com._id === lead.commercial);
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

    if (typeof lead.manager === "string") {
      const manager = managers.find((mgr) => mgr._id === lead.manager);
      return manager ? `${manager.prenom} ${manager.nom}` : "N/A";
    }

    if (lead.manager.prenom && lead.manager.nom) {
      return `${lead.manager.prenom} ${lead.manager.nom}`;
    }

    return "N/A";
  };

  useEffect(() => {
    // Get current manager ID from token
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentManagerId(decodedToken?.userId);
    }

    const getUserData = async () => {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.userId;
      const userRole = decodedToken?.role?.toLowerCase();
      try {
        const response = await axios.get("/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allLeads = response.data?.chatData || [];
        console.log("All leads:", allLeads);

        const filteredLeads = allLeads.filter((lead) => {
          // Check if user is the assigned manager
          const managerId =
            typeof lead.manager === "string"
              ? lead.manager
              : lead.manager?._id?.toString();
          const isManager = managerId === userId;

          return isManager;
        });
        const sortedLeads = filteredLeads.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setChatData(sortedLeads);
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
  }, []);

  // Search function
  const handleColumnSearch = async (e, columnKey) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchQuery(value);

    try {
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

      // Default search for other fields
      const filteredResults = chatData.filter((item) => {
        const fieldValue = item[columnKey]?.toString().toLowerCase() || "";
        return fieldValue.includes(value);
      });
      setFilteredData(filteredResults);
    } catch (error) {
      console.error("Error in search:", error);
      message.error("Erreur lors de la recherche");
    }
  };

  const handleAssign = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.post(
        "/assign-leads",
        {
          id: selectedLeads,
          commercialId: values.commercial,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedLeads = chatData.map((lead) => {
        if (selectedLeads.includes(lead._id)) {
          const assignedCommercial = commercials.find(
            (com) => com._id === values.commercial
          );
          return {
            ...lead,
            commercial: assignedCommercial,
          };
        }
        return lead;
      });

      setChatData(updatedLeads);
      message.success("Clients affectés au commercial avec succès");
      setIsAssignModalVisible(false);
      setSelectedLeads([]);
      assignForm.resetFields();
    } catch (error) {
      console.error("Error assigning leads to commercial:", error);
      message.error("Échec de l'affectation des clients au commercial");
    }
  };

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

  const handleUnassign = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found, please login first");
        return;
      }

      await axios.post(
        "/unassign-leads",
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
            commercial: null,
          };
        }
        return lead;
      });

      setChatData(updatedLeads);
      message.success("Clients désaffectés du commercial avec succès");
      setIsUnassignModalVisible(false);
      setSelectedLeads([]);
    } catch (error) {
      console.error("Error unassigning commercial:", error);
      message.error("Échec de la désaffectation des clients du commercial");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);
      console.log("Client deleted successfully:", response.data);
      setChatData(chatData.filter((lead) => lead._id !== id));
      message.success("Client supprimé avec succès");
    } catch (error) {
      console.error("Error deleting client:", error);
      message.error("Échec de la suppression du client");
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedLeads(selectedRowKeys);
    },
    selectedRowKeys: selectedLeads,
  };

  if (loading) return <Spin tip="Loading..." />;
  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

  const handleLeadClick = (clientData) => {
    navigate(`/client/${clientData._id}`);
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
            {hasCommercial(record)
              ? "✓ Affecté à un commercial"
              : "⏳ Non affecté"}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      render: (text, record) => (
        <div className="text-gray-500 text-xs">{record.email || ""}</div>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "portable",
      key: "portable",
      render: (text) => text || "-",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
      render: (text) => text || "-",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (text) => (
        <Tag
          color={
            text === "client"
              ? "green"
              : text === "prospect"
              ? "blue"
              : "orange"
          }
        >
          {text?.toUpperCase() || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("fr-FR");
      },
    },
    {
      title: "Commercial",
      key: "commercial",
      dataIndex: "commercial",
      render: (text, record) => {
        const commercialName = getCommercialName(record);
        if (commercialName === "N/A") {
          return <Tag color="red">NON AFFECTÉ</Tag>;
        }
        return <Tag color="blue">{commercialName}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Voir détails">
            <Button
              icon={<EyeOutlined />}
              type="primary"
              size="small"
              onClick={() => handleLeadClick(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce client ?"
            onConfirm={() => handleDelete(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tooltip title="Supprimer">
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="md:p-4 p-1 w-full">
      <h1 className="text-xl font-bold mb-4">Gestion des Clients - Manager</h1>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Clients"
              value={stats.totalClients}
              valueStyle={{ color: "#3f8600" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Affectés aux Commerciaux"
              value={stats.assignedToCommercial}
              valueStyle={{ color: "#1890ff" }}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Non Affectés"
              value={stats.unassigned}
              valueStyle={{ color: "#cf1322" }}
              prefix={<UserDeleteOutlined />}
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
          • Vous pouvez affecter des clients aux commerciaux de votre équipe
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Tooltip
              title={
                canAssignToCommercial
                  ? ""
                  : "Seuls les clients non affectés peuvent être assignés à un commercial"
              }
            >
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                onClick={() => setIsAssignModalVisible(true)}
                disabled={!canAssignToCommercial}
              >
                Affecter au Commercial ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Tooltip
              title={
                canUnassignFromCommercial
                  ? ""
                  : "Seuls les clients affectés à un commercial peuvent être désaffectés"
              }
            >
              <Button
                icon={<UserDeleteOutlined />}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={() => setIsUnassignModalVisible(true)}
                disabled={!canUnassignFromCommercial}
              >
                Désaffecter du Commercial ({selectedLeads.length})
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      <div className="mb-4">
        <span className="font-semibold text-gray-700">
          Total clients: {sortedData.length}
          {filteredData.length > 0 && ` (Filtrés: ${filteredData.length})`}
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
                {col.key !== "action" && col.key !== "createdAt" && (
                  <Input
                    placeholder={`Rechercher ${col.title}`}
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
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          bordered
          rowSelection={rowSelection}
          className="custom-table text-xs sm:text-sm"
          tableLayout="auto"
        />
      </div>

      {/* Assign Modal */}
      <Modal
        title="Affecter les clients au Commercial"
        visible={isAssignModalVisible}
        onCancel={() => {
          setIsAssignModalVisible(false);
          assignForm.resetFields();
        }}
        footer={null}
      >
        <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <div className="text-sm text-yellow-700">
            <strong>Note:</strong> {selectedLeads.length} client(s) seront
            affectés au commercial sélectionné.
          </div>
        </div>
        <Form form={assignForm} onFinish={handleAssign}>
          <Form.Item
            name="commercial"
            label="Commercial"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un commercial",
              },
            ]}
          >
            <Select placeholder="Sélectionnez un commercial">
              {commercials.map((commercial) => (
                <Option key={commercial._id} value={commercial._id}>
                  {commercial.prenom} {commercial.nom}
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
        title="Désaffecter les clients du Commercial"
        visible={isUnassignModalVisible}
        onCancel={() => setIsUnassignModalVisible(false)}
        footer={null}
      >
        <Form form={unassignForm} onFinish={handleUnassign}>
          <Form.Item>
            <div className="mb-4 p-3 bg-orange-50 rounded border border-orange-200">
              <div className="text-sm text-orange-700">
                <strong>Attention:</strong> Êtes-vous sûr de vouloir désaffecter{" "}
                {selectedLeads.length} client(s) du commercial ?
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
              <Button onClick={() => setIsUnassignModalVisible(false)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerAffectation;
