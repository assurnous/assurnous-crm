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
} from "antd";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const Clientdigital = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("tous");
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    // Gestionnaire filter
    if (filterValues.gestionnaire && filterValues.gestionnaire !== "tous") {
      result = result.filter(client => {
        const gestionnaireDisplayName = client.gestionnaire?.name || 
                                      `${client.gestionnaire?.nom || ''} ${client.gestionnaire?.prenom || ''}`.trim();
        
        return (
          gestionnaireDisplayName === filterValues.gestionnaire ||
          client.gestionnaireName === filterValues.gestionnaire
        );
      });
    }

    // Catégorie filter
    if (filterValues.categorie && filterValues.categorie !== "tous") {
      result = result.filter(client => {
        return client.categorie === filterValues.categorie;
      });
    }

    // Statut filter
    if (filterValues.status && filterValues.status !== "tous") {
      result = result.filter(client => {
        return client.statut === filterValues.status;
      });
    }

    // Search filter
    if (filterValues.search) {
      const searchTerm = filterValues.search.toLowerCase();
      result = result.filter(client => {
        const fullName = `${client.nom || ''} ${client.prenom || ''}`.trim().toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = (client.portable || client.telephone_entreprise || '').toLowerCase();
        const company = (client.nom || '').toLowerCase();
        const agence = (client.agence || '').toLowerCase();
        const assurances = (client.assurances_interessees || []).join(' ').toLowerCase();
        const comment = (client.comment || '').toLowerCase();
        
        return (
          fullName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          company.includes(searchTerm) ||
          agence.includes(searchTerm) ||
          assurances.includes(searchTerm) ||
          comment.includes(searchTerm)
        );
      });
    }

    setFilteredData(result);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [adminsRes, commercialsRes, managersRes] = await Promise.all([
          axios.get("/admin"),
          axios.get("/commercials"),
          axios.get("/manager"),
        ]);

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
          }))
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

  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  const handleLeadClick = (chatData) => {
    navigate(`/client/${chatData._id}`);
  };

  const totalPages = Math.ceil(chatData.length / pageSize);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        setChatData(response.data.chatData);
        console.log("Fetched chat data:", response.data.chatData);

        if (activeFilter === "prospect") {
          setFilteredData(
            response.data.chatData.filter((item) => item.type === "prospect")
          );
        } else if (activeFilter === "client") {
          setFilteredData(
            response.data.chatData.filter((item) => item.type === "client")
          );
        } else if (activeFilter === "Gelé") {
          setFilteredData(response.data.chatData);
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
  }, [activeFilter, refreshTrigger]);

  const handleGestionnaireChange = async (selectedId, record) => {
    try {
      const selectedUser = users.find(user => user._id === selectedId);
      const displayName = selectedUser 
        ? selectedUser.userType === "admin" 
          ? selectedUser.name 
          : `${selectedUser.nom} ${selectedUser.prenom}`
        : null;

      const response = await axios.put(
        `/updateGestionnaireLead/${record._id}`,
        {
          gestionnaireId: selectedId || null,
          gestionnaireName: displayName || null,
          userType: selectedUser?.userType || null
        }
      );

      setChatData(prev => prev.map(item => 
        item._id === record._id 
          ? { 
              ...item, 
              gestionnaire: selectedId ? { _id: selectedId } : null,
              gestionnaireName: displayName 
            } 
          : item
      ));
      
      setFilteredData(prev => prev.map(item => 
        item._id === record._id 
          ? { 
              ...item, 
              gestionnaire: selectedId ? { _id: selectedId } : null,
              gestionnaireName: displayName 
            } 
          : item
      ));

      console.log("Updated gestionnaire:", response.data);
    } catch (error) {
      console.error("Error updating gestionnaire:", error);
    }
  };

  const handleStatusLeadChange = async (newStatus, record) => {
    try {
      const validStatuses = ["prospect", "client", "Gelé"];

      if (!validStatuses.includes(newStatus)) {
        console.error("Invalid status value");
        return;
      }

      const response = await axios.put(`/updateStatusLead/${record._id}`, {
        statut: newStatus,
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

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/lead/${id}`);

      setChatData((prev) => prev.filter((lead) => lead._id !== id));
      setFilteredData((prev) => prev.filter((lead) => lead._id !== id));

      message.success("Lead supprimé avec succès");
    } catch (error) {
      console.error("Error deleting lead:", error);
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
      title: "Agence",
      dataIndex: "agence",
      key: "agence",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">{record.agence || ""}</div>
        </div>
      ),
    },
    {
      title: "Assurances",
      key: "assurances_interessees",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.assurances_interessees ? record.assurances_interessees.join(', ') : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Rappel",
      dataIndex: "rappel_at",
      key: "rappel_at",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium">
            {record.rappel_at ? new Date(record.rappel_at).toLocaleDateString() : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Commentaire",
      dataIndex: "comment",
      key: "comment",
      render: (text, record) => (
        <div className="cursor-pointer" onClick={() => handleLeadClick(record)}>
          <div className="font-medium truncate max-w-xs">
            {record.comment || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Statut",
      key: "statut",
      render: (text, record) => (
        <Select
          value={record.statut || "prospect"}
          style={{
            width: 90,
            color: record.statut === "Gelé" ? "#ff4d4f" : "inherit",
            fontWeight: record.statut === "Gelé" ? "bold" : "normal",
          }}
          onChange={(value) => handleStatusLeadChange(value, record)}
        >
          <Option value="prospect">Prospect</Option>
          <Option value="client">Client</Option>
          <Option value="Gelé" style={{ color: "#ff4d4f" }}>
            Gelé
          </Option>
        </Select>
      ),
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
            let displayName;
            if (user.userType === "admin") {
              displayName = user.name;
            } else if (user.userType === "manager" || user.userType === "commercial") {
              displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
            } else {
              displayName = user.name || user.email || user._id;
            }
    
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
        <h2 className="text-xs sm:text-sm font-semibold text-blue-900 text-center md:text-left">
          CLIENTS DIGITAUX ({chatData.length})
        </h2>
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
                    value={displayName}
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
      
      <div className="bg-white rounded-lg shadow-md w-full overflow-x-auto">
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
          rowClassName={(record) =>
            record.statut === "Gelé" ? "frozen-row" : ""
          }
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
          onRow={(record) => ({
            style: {
              backgroundColor: record.statut === "Gelé" ? "#fff2f0" : "inherit",
            },
          })}
          bordered
          className="custom-table text-xs sm:text-sm"
          tableLayout="auto"
        />
      </div>
    </section>
  );
};

export default Clientdigital;