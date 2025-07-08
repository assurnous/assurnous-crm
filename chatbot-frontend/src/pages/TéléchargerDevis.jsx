import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Modal,
  Card,
  Statistic,
  Select,
  Input,
  DatePicker,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const { RangePicker } = DatePicker;

const { confirm } = Modal;

const MesDevis = () => {
  const [allCommands, setAllCommands] = useState([]);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHT: 0,
    totalTTC: 0,
    totalCommands: 0,
  });
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;

  const userRole = decodedUser?.role;

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get("/command", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response);
      const commandsData = response?.data;
      const decodedToken = token ? jwtDecode(token) : null;
      const currentUserId = decodedToken?.userId;
      const role = decodedToken.role;
      if (role === "Admin") {
        setAllCommands(commandsData); // Set only the "devis" commands
        updateStatistics(commandsData);
      } else {
        const filterecommand = commandsData.filter(
          (cmd) => cmd.session === currentUserId
        );

        // Filter commands to display only "devis" type
        const devisCommands = filterecommand.filter(
          (command) => command.command_type === "commande"
        );
        console.log("devisCommands", devisCommands);

        setAllCommands(devisCommands); // Set only the "devis" commands
        updateStatistics(devisCommands);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching commands:", error);
      message.error("Failed to fetch commands");
      setLoading(false);
    }
  };

  const updateStatistics = (commands) => {
    const totals = commands.reduce(
      (acc, cmd) => ({
        totalHT: acc.totalHT + (cmd.totalHT || 0),
        totalTTC: acc.totalTTC + (cmd.totalTTC || 0),
        totalCommands: acc.totalCommands + 1,
      }),
      { totalHT: 0, totalTTC: 0, totalCommands: 0 }
    );

    setStats(totals);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    window.location.href = `/lead/${record.lead}`;
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    confirm({
      title: "Confirm Deletion",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this command?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteCommand(id),
    });
  };

  const deleteCommand = async (id) => {
    try {
      await axios.delete(`/command/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Command deleted successfully");
      fetchCommands(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting command:", error);
      message.error("Failed to delete command");
    }
  };

  const safeRender = (value, fallback = "N/A") => {
    return value !== undefined && value !== null ? value : fallback;
  };

  const columns = [
    {
      title: "N° devis",
      dataIndex: "numero_contrat",
      key: "numero_contrat",
    },
    {
      title: "Risque",
      dataIndex: "risque",
      key: "risque",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Assureur",
      dataIndex: "assureur",
      key: "assureur",
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Date d'effet",
      dataIndex: "date_effet",
      key: "date_effet",
    },
    {
      title: "Prime TTC",
      dataIndex: "prime_ttc",
      key: "prime_ttc",
    },
    {
      title: "Gestionnaire",
      dataIndex: "gestionnaire",
      key: "gestionnaire",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small">Voir</Button>
          <Button size="small" danger>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-t-md shadow-sm gap-3 md:gap-0">
          <h2 className="text-xs sm:text-sm font-semibold text-purple-900 text-center md:text-left">
            Devis ({allCommands.length})
          </h2>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-4">
            <Button type="primary" className="w-full md:w-auto">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">+</span>
                <span className="text-[10px] sm:text-xs whitespace-nowrap">
                  ENREGISTRER UN DEVIS
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
                Gestionaire
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez -"
                // onChange={(value) => handleFilterChange('gestionaire', value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="gestionaire1">Gestionaire 1</Option>
                <Option value="gestionaire2">Gestionaire 2</Option>
              </Select>
            </div>
              {/* Commissions Select */}
              <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Type de client
              </label>
              <Select
                className="w-full"
                placeholder="-- Choisissez --"
                onChange={(value) => handleFilterChange("client", value)}
              >
                <Option value="payee">Actif</Option>
                <Option value="en_attente">Inactif</Option>
              </Select>
            </div>

            {/* Risque Select */}
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
                <Option value="auto">Auto</Option>
                <Option value="habitation">Habitation</Option>
                <Option value="sante">Santé</Option>
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
                <Option value="macif">Macif</Option>
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
                // onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="tous">Tous</Option>
                <Option value="actif">Actif</Option>
                <Option value="inactif">Inactif</Option>
                <Option value="en_attente">En attente</Option>
              </Select>
            </div>

            {/* Recherche Input */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <Input
                placeholder="Rechercher..."
                allowClear
                // onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md w-full  overflow-x-auto">
        <Table
          columns={[
            ...columns.map((col) => ({
              ...col,
              title: (
                <div className="flex flex-col items-center">
                  <div className="text-xs">{col.title}</div>
                  {/* {col.key !== "action" && (
                                  <Input
                                    placeholder={`${col.title}`}
                                    onChange={(e) => handleColumnSearch(e, col.key)}
                                    // className="mt-2 text-sm sm:text-base w-full sm:w-auto"
                                    size="medium"
                                  />
                                )} */}
                </div>
              ),
            })),
          ]}
          dataSource={allCommands.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: allCommands.length,
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
    </section>
  );
};

export default MesDevis;
