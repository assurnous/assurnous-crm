import React, { useState, useEffect } from "react";
import { Table, Select, Button, Space, Modal, Form, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash, faFileUpload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import DocUpload from "../components/TabsContent/DocUpload";

const { Option } = Select;

const DocumentList = () => {
  const [form] = Form.useForm();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
    const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
   const [uploadedDocument, setUploadedDocument] = useState(null);

    const handleCancel = () => {
    setIsModalOpen(false);

    setUploadedDocument(null);
  };

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
    setUploadedDocument(null);
  
  };
  // Categories for the filter
  const categories = [
    { value: "all", label: "Tous les documents" },
    { value: "documents-courtier", label: "Documents courtier" },
    { value: "conventions-partenaire", label: "Conventions partenaires" },
    { value: "procedures-internes", label: "Procédures internes" },
    { value: "archives", label: "Archives" },
  ];

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/document");
      setDocuments(response.data);
      setFilteredDocuments(response.data); // Initialize filtered documents
    } catch (error) {

      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents based on selected category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.category === selectedCategory));
    }
  }, [selectedCategory, documents]);

  // const handleFormSubmit = async (values) => {
  //   try {
  //     if (!uploadedDocument) {
  //       return;
  //     }
  
  //     const formData = new FormData();
  //     formData.append("name", values.name);
  //     formData.append("category", values.category);
  //     formData.append("document", uploadedDocument); // Append the File object directly
      
  //     console.log("FormData entries:");
  //     for (let [key, value] of formData.entries()) {
  //       console.log(key, value);
  //     }
  
  //     await axios.post("/document", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  
  //     message.success("Document ajouté avec succès");
  //     setIsModalOpen(false);
  //     form.resetFields();
  //     setUploadedDocument(null);
  //     fetchDocuments();
  //   } catch (error) {
  //     console.error("Error uploading document:", error.response?.data || error.message);
  //   }
  // }
  const handleFormSubmit = async (values) => {
    try {
      if (!uploadedDocument) {
        message.error("Veuillez sélectionner un fichier");
        return;
      }
  
      // If uploadedDocument already has a URL (from DocUpload), just create the document record
      if (uploadedDocument.url) {
        const payload = {
          name: values.name,
          category: values.category,
          url: uploadedDocument.url,
          originalName: uploadedDocument.originalName,
          type: uploadedDocument.type,
          size: uploadedDocument.size
        };
  
        await axios.post("/document", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        message.success("Document ajouté avec succès");
        setIsModalOpen(false);
        form.resetFields();
        setUploadedDocument(null);
        fetchDocuments();
      } else {
        // Fallback: upload the file directly
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        formData.append("document", uploadedDocument);
  
        await axios.post("/document", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        message.success("Document ajouté avec succès");
        setIsModalOpen(false);
        form.resetFields();
        setUploadedDocument(null);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error uploading document:", error.response?.data || error.message);
      message.error("Erreur lors de l'ajout du document");
    }
  }
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/document/${id}`);
      setDocuments(documents.filter(doc => doc._id !== id));
      message.success("Document supprimé avec succès");
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDownload = (id) => {
    window.open(`/document/${id}/download`, '_blank');
  };

  const columns = [
    {
      title: "Nom du document",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Catégorie",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <span className="capitalize">
          {categories.find(c => c.value === category)?.label || category}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
           <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            // Use the direct url property
            window.open(record.url, '_blank');
          }}
          type="text"
          title="Télécharger le document"
        />
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faTrash} className="text-red-500" />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-purple-900 mb-2">LISTE DE CONFORMITÉ</h1>
      <p className="mb-6 text-gray-600 font-semibold">
        Gestion des documents juridiques du cabinet
      </p>

      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setSelectedCategory}
          >
            {categories.map(category => (
              <Option key={category.value} value={category.value}>
                {category.label}
              </Option>
            ))}
          </Select>
          <Button onClick={fetchDocuments}>
            Actualiser
          </Button>
        </div>
        <Button 
          type="primary" 
          onClick={showModal}
        >
          Ajouter Document
        </Button>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
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
          dataSource={filteredDocuments.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredDocuments.length,
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
          rowKey="_id"
          loading={loading}
        />
      </div>

      <Modal
         title={
                <div className="bg-gray-100 p-2 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
                  <span className="font-medium text-sm">
                    NOUVEAU DOCUMENT
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
        <Form form={form} layout="vertical"  onFinish={handleFormSubmit}>
          <Form.Item
            label="Nom du document"
            name="name"
            rules={[{ required: true, message: "Ce champ est obligatoire" }]}
          >
            <input className="w-full p-2 border rounded" />
          </Form.Item>

          <Form.Item
            label="Catégorie"
            name="category"
            rules={[{ required: true, message: "Sélectionnez une catégorie" }]}
          >
            <Select>
              {categories.filter(c => c.value !== "all").map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

         <Form.Item name="document" label="Pdf Document">
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
                    <DocUpload onUploadSuccess={setUploadedDocument} />
                  )}
                </Form.Item>
              </Form>
                      
        <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full text-xs h-7 mt-2 mb-4"
                  onClick={() => form.submit()}
                >
                  Enregistrer
                </Button>
      </Modal>
    
    </div>
  );
};

export default DocumentList;