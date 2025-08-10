import { useState, useEffect } from "react";
import { Button, Card, Empty, Tag, Pagination, Input, Modal, Form, message } from "antd";
import { SearchOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { ASSUREURS, RISQUES } from "../constants";

const PAGE_SIZE = 20;

const Catalogue = () => {
  const [activeTab, setActiveTab] = useState("assureurs");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [form] = Form.useForm();

  // Add IDs to your constants since they don't have them
  const assureursWithIds = ASSUREURS.map((item, index) => ({ ...item, id: index + 1 }));
  const risquesWithIds = RISQUES.map((item, index) => ({ ...item, id: index + 1 }));

  // Filter data based on search term
  const filteredData = (activeTab === "assureurs" ? assureursWithIds : risquesWithIds)
    .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalItems = filteredData.length;

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredData.slice(startIndex, endIndex);
  };

  // Fetch saved credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await axios.get("/credential");
        setCredentials(response.data);
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };
    fetchCredentials();
  }, []);

  // Handle item click
  const handleItemClick = (item) => {
    setSelectedItem(item);
    // Find if credentials exist for this item
    const existingCreds = credentials.find(c => c.itemValue === item.value && c.type === activeTab);
    form.setFieldsValue({
      identifiant: existingCreds?.identifiant || "",
      motDePasse: existingCreds?.motDePasse || "",
      url: existingCreds?.url || ""
    });
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        itemId: selectedItem.id,
        itemValue: selectedItem.value,
        itemLabel: selectedItem.label,
        type: activeTab
      };
      console.log("Saving credentials:", payload);

      // Check if credentials exist for this item
      const existingCreds = credentials.find(c => c.itemValue === selectedItem.value && c.type === activeTab);

      if (existingCreds) {
        // Update existing credentials
        await axios.put(`/credential/${existingCreds._id}`, payload);
        message.success("Identifiants mis à jour avec succès");
      } else {
        // Create new credentials
        await axios.post("/credential", payload);
        message.success("Identifiants enregistrés avec succès");
      }

      // Refresh credentials
      const response = await axios.get("/credential");
      setCredentials(response.data);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error saving credentials:", error);
      message.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="catalogue-container">
      {/* Header Section */}
      <div className="catalogue-header">
        <h1 className="catalogue-title">Notre Catalogue</h1>
        <div className="search-container">
          <Input
            placeholder={`Rechercher un ${activeTab === "assureurs" ? "assureur" : "produit"}...`}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 300 }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <Button
          type={activeTab === "assureurs" ? "primary" : "default"}
          onClick={() => {
            setActiveTab("assureurs");
            setCurrentPage(1);
            setSearchTerm("");
          }}
        >
          Assureurs
        </Button>
        <Button
          type={activeTab === "risques" ? "primary" : "default"}
          onClick={() => {
            setActiveTab("risques");
            setCurrentPage(1);
            setSearchTerm("");
          }}
        >
          Produits (Risques)
        </Button>
      </div>

      {/* Content Section */}
      <div className="catalogue-content">
        {filteredData.length > 0 ? (
          <>
            <div className="items-grid">
              {getCurrentPageItems().map((item) => {
                const hasCredentials = credentials.some(
                  c => c.itemValue === item.value && c.type === activeTab
                );
                
                return (
                  <Card
                    key={item.value}
                    className={`item-card ${hasCredentials ? 'has-credentials' : ''}`}
                    hoverable
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="item-content">
                      <h3 className="item-label">{item.label}</h3>
                      <Tag 
                        color={activeTab === "assureurs" ? "blue" : "geekblue"} 
                        className="item-value"
                      >
                        {item.value}
                      </Tag>
                      {hasCredentials && (
                        <Tag color="green" className="credentials-tag">
                          Identifiants enregistrés
                        </Tag>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={totalItems}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty description={`Aucun ${activeTab === "assureurs" ? "assureur" : "produit"} trouvé`} />
        )}
      </div>

      {/* Credentials Modal */}
      <Modal
        title={`Identifiants pour ${selectedItem?.label}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Annuler
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Enregistrer
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="identifiant"
            label="Identifiant"
            rules={[{ required: true, message: "Veuillez saisir l'identifiant" }]}
          >
            <Input placeholder="Saisissez l'identifiant" />
          </Form.Item>
          <Form.Item
            name="motDePasse"
            label="Mot de passe"
            rules={[{ required: true, message: "Veuillez saisir le mot de passe" }]}
          >
            <Input placeholder="Saisissez le mot de passe" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: "Veuillez saisir l'URL" }]}
          >
            <Input placeholder="Saisissez l'URL d'accès" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Catalogue;