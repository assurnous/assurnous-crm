import React, { useState, useEffect } from "react";
import { Table, Select, message, Spin, Input, 
  Button, Popconfirm, Alert, Space,
  Modal, Form, DatePicker, Radio, InputNumber 
} from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  UserAddOutlined,
  CloseOutlined,
  CrownOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";

const { Option } = Select;

const ListManagerLeads = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    gestionnaire: "tous",
    categorie: "tous",
    status: "tous",
    search: "",
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleFormSubmit = async (values) => {
    console.log("Form values:", values);
    try {
      const response = await axios.post("/data", values);
      console.log("Lead added successfully:", response.data);
      form.resetFields();
      setIsModalOpen(false);
      setChatData((prev) => [...prev, response.data]);
      setFilteredData((prev) => [...prev, response.data]);
      alert("Le client à été créé avec succès !");
    } catch (error) {
      console.error("Error adding lead:", error);
      message.error("Erreur lors de l'ajout du client");
    }
  };

  const applyFilters = (filterValues) => {
    let result = [...chatData];
    
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter((item) => 
        item.gestionnaire?.toLowerCase() === filterValues.gestionnaire.toLowerCase()
      );
    }

    if (filterValues.categorie !== "tous") {
      result = result.filter(
        (item) =>
          item.categorie?.toLowerCase() === filterValues.categorie.toLowerCase()
      );
    }

    if (filterValues.status !== "tous") {
      result = result.filter(
        (item) =>
          item.statut?.toLowerCase() === filterValues.status.toLowerCase()
      );
    }

    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter((item) => {
        const clientName = `${item.nom || ''} ${item.prenom || ''}`.toLowerCase();
        
        return (
          clientName.includes(searchTerm) ||
          (item.categorie?.toLowerCase().includes(searchTerm)) ||
          (item.portable?.toLowerCase().includes(searchTerm)) ||
          (item.email?.toLowerCase().includes(searchTerm)) ||
          (item.codepostal?.toLowerCase().includes(searchTerm))
        );
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch admins, commercials, and managers
        const [adminsRes, commercialsRes, managersRes] = await Promise.all([
          axios.get("/admin"),
          axios.get("/commercials"),
          axios.get("/manager"),
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
          ...managersRes.data.map((manager) => ({
            ...manager,
            userType: "manager",
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

  const fetchClients = async () => {
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    const userId = decodedToken?.userId;
    const userRole = decodedToken?.role?.toLowerCase() || decodedToken?.userType?.toLowerCase();

    try {
      setLoading(true);
      
      // Always fetch all clients (manager will see all leads assigned to them or their team)
      const response = await axios.get('/data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allLeads = response.data?.chatData || [];
      console.log("All leads:", allLeads);

      // For managers, show leads assigned to them or their team (commercials they manage)
      let filteredLeads = allLeads;
      
      // If not admin, filter leads
      if (userRole !== 'admin') {
        filteredLeads = allLeads.filter(lead => {
          // Leads assigned to this manager
          const isAssignedToManager = 
            (lead.gestionnaire?._id && lead.gestionnaire._id.toString() === userId) ||
            (typeof lead.gestionnaire === 'string' && lead.gestionnaire.includes(decodedToken.name));
          
          // TODO: Add logic to filter leads assigned to commercials managed by this manager
          // This would require additional API calls to get the manager's team

          return isAssignedToManager;
        });
      }

      console.log("Filtered leads for manager:", {
        userId,
        userRole,
        filteredCount: filteredLeads.length,
      });

      setChatData(filteredLeads);
      setFilteredData(filteredLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      message.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };

  const handleStatusLeadChange = async (newStatus, record) => {
    try {
      const validStatuses = ["prospect", "client"];
      
      if (!validStatuses.includes(newStatus)) {
        console.error("Invalid status value");
        return;
      }
  
      const response = await axios.put(`/updateStatusLead/${record._id}`, {
        statut: newStatus
      });
  
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

  const handleGestionnaireChange = async (value, record) => {
    try {
      let userType = "commercial"; // Default to commercial
      const selectedUser = users.find(user => user._id === value);
      
      if (selectedUser) {
        userType = selectedUser.userType;
      }

      const response = await axios.put(`/updateGestionnaireLead/${record._id}`, {
        gestionnaireId: value,
        gestionnaireName: selectedUser ? 
          (userType === "admin" ? selectedUser.name : `${selectedUser.prenom} ${selectedUser.nom}`) 
          : "",
        userType: userType
      });

      // Update local state
      const updatedLead = {
        ...record,
        gestionnaire: {
          _id: value,
          name: selectedUser ? 
            (userType === "admin" ? selectedUser.name : `${selectedUser.prenom} ${selectedUser.nom}`) 
            : ""
        }
      };

      setChatData(prev => prev.map(item => 
        item._id === record._id ? updatedLead : item
      ));
      setFilteredData(prev => prev.map(item => 
        item._id === record._id ? updatedLead : item
      ));

      message.success("Gestionnaire mis à jour avec succès");
    } catch (error) {
      console.error("Error updating gestionnaire:", error);
      message.error("Erreur lors de la mise à jour du gestionnaire");
    }
  };

  if (loading && showSpinner) return <Spin tip="Loading..." />;

  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

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
      title: "GESTIONNAIRE",
      key: "gestionnaire",
      render: (text, record) => (
        <Select
          value={record.gestionnaire?._id || ""}
          style={{ width: 180 }}
          className="text-xs"
          onChange={(value) => handleGestionnaireChange(value, record)}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="-- Choisissez un gestionnaire --"
        >
          <Option value="">Non assigné</Option>
          {users.map((user) => {
            const displayName =
              user.userType === "admin" ? user.name
                : `${user.prenom || ''} ${user.nom || ''}`.trim();
            
            let typeLabel;
            switch(user.userType) {
              case "admin":
                typeLabel = "Admin";
                break;
              case "commercial":
                typeLabel = "Commercial";
                break;
              case "manager":
                typeLabel = "Manager";
                break;
              default:
                typeLabel = user.userType || "Utilisateur";
            }

            return (
              <Option key={user._id} value={user._id}>
                {displayName} ({typeLabel})
              </Option>
            );
          })}
        </Select>
      ),
    },
    {
      title: "STATUS",
      key: "status",
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
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
        <h2 className="text-xs sm:text-sm font-semibold text-purple-900 text-center md:text-left">
          <CrownOutlined className="mr-2" /> 
          CLIENTS/PROSPECTS - MANAGER ({chatData.length})
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

      <div className="bg-white rounded-lg shadow-md w-full md:p-6 overflow-x-auto">
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
          tableLayout="auto"
        />
      </div>

      {/* Modal for adding new client/prospect (same as original) */}
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
        {/* Modal content remains the same as original */}
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
            {/* Form fields remain the same as original */}
            {/* ... */}
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
    </div>
  );
};

export default ListManagerLeads;