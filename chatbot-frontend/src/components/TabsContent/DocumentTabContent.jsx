import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Table,
  Modal,
  Space,
  message,
  Spin,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useParams } from "react-router-dom";
import UploadDocument from "./UploadDocument";

const { Option } = Select;

const DocumentTabContent = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [form] = Form.useForm();
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [referenceOptions, setReferenceOptions] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Assuming you're using react-router for routing
  const [searchParams, setSearchParams] = useState({
    documentType: "",
    referenceNumber: "",
  });

  // API endpoints for each document family
  const apiEndpoints = {
    devis: "/contrat",
    reclamation: "/reclamations",
    sinistre: "/sinistres/",
  };

  // Fetch documents for this lead
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/documents/${id}`);
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      // message.error("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference options from backend based on selected family
  const fetchReferenceOptions = async () => {
    if (!selectedFamily || !apiEndpoints[selectedFamily]) return;

    try {
      setLoadingReferences(true);
      const response = await axios.get(apiEndpoints[selectedFamily]);
      setReferenceOptions(response.data);
    } catch (error) {
      message.error(`Failed to fetch ${selectedFamily} options`);
      console.error(`Error fetching ${selectedFamily} options:`, error);
    } finally {
      setLoadingReferences(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  useEffect(() => {
    fetchReferenceOptions();
  }, [selectedFamily]);

  const handleTypeChange = (value) => {
    setSelectedType(value);
    form.setFieldsValue({ documentName: undefined }); // Reset document name when type changes
  };

  const documentTypes = {
    client: [
      "Attestation carte vitale",
      "Carte d'identité",
      "Passport",
      "Permis de conduire",
      "RIB",
      "Carte grise",
      "Autre document",
    ],
    devis: [
      "Bulletin d'adhésion non signé",
      "Bulletin d'adhésion signé",
      "Conditions générales",
      "Conditions particulières",
      "Convention d'assistance",
      "Fiche d'information et de conseil",
      "Fiche d'information et de conseil signé",
      "IPID",
      "Mandat HAMON",
      "Mandat HAMON signé",
      "Notice d'information",
      "Mandat SEPA non signé",
      "Plaquette",
      "Mandat SEPA signé",
      "Devis",
      "Mandat RIA",
      "Mandat RIA signé",
      "Tableau de garanties",
      "Devis valant Fiche d'information et de conseil",
      "Propositions d'assurance non signé",
      "Plaquette Courtier",
      "Propositions d'assurance signé",
      "Carte grise",
      "Relevé d'information",
      "Autre document",
    ],
    reclamation: ["Numéro de réclamation", "Autre document"],
    sinistre: ["Numéro de sinistre", "Autre document"],
    autres: ["Déclaration de sinistre", "Autre document"],
  };

  const getReferenceLabel = (family) => {
    switch (family) {
      case "devis":
        return "Numéro de devis/contrat";
      case "reclamation":
        return "Numéro de réclamation";
      case "sinistre":
        return "Numéro de sinistre";
      case "autres":
        return "Référence document";
      default:
        return "Référence";
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadedDocument(null);
    setSelectedFamily("");
    setSelectedType("");
    setReferenceOptions([]);
  };

  const handleFamilyChange = (value) => {
    setSelectedFamily(value);
    setSelectedType("");
    form.setFieldsValue({
      type: undefined,
      referenceNumber: undefined,
      documentName: undefined,
    });
  };

  const handleUploadSuccess = (uploadResponse) => {

    setUploadedDocument({
      file: uploadResponse.file,
      name: uploadResponse.name,
      url: uploadResponse.url,
      // Include any other fields from the response
      ...uploadResponse,
    });
  };

  const handleFormSubmit = async (values) => {
    try {
      if (!uploadedDocument) {
        message.error("Veuillez télécharger un document valide");
        return;
      }
  
      const payload = {
        family: values.family,
        type: values.type,
        referenceNumber: values.referenceNumber || null,
        documentName: values.documentName || null,
        firebaseUrl: uploadedDocument.url,
        file: uploadedDocument.file,
      };
  
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
  
      setLoading(true);
      const response = await axios.post(`/documents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Update state with the complete document data from the response
      const newDocument = {
        ...response.data.data,
        _id: response.data.data._id, // Ensure _id is included
        key: response.data.data._id, // Add key property for table rowKey
      };
  
      setDocuments(prev => [...prev, newDocument]);
      setFilteredDocuments(prev => [...prev, newDocument]);
  
      message.success("Document ajouté avec succès");
      handleCancel();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        error.response?.data?.message || "Erreur lors de l'envoi du document"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce document?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`/documents/${documentId}`);
          
          // Option 1: Optimistic update
          setDocuments(prev => prev.filter(doc => doc._id !== documentId));
          setFilteredDocuments(prev => prev.filter(doc => doc._id !== documentId));
          
          // Option 2: Or refresh the full list (more reliable)
          // await fetchDocuments();
          
          message.success("Document supprimé avec succès");
        } catch (error) {
          console.error("Error deleting document:", error);
          message.error("Erreur lors de la suppression du document");
        }
      }
    });
  };
  // const handleFormSubmit = async (values) => {
  //   try {
  //     if (!uploadedDocument) {
  //       message.error("Veuillez télécharger un document valide");
  //       return;
  //     }

  //     const payload = {
  //       family: values.family,
  //       type: values.type,
  //       referenceNumber: values.referenceNumber,
  //       documentName: values.documentName,
  //       firebaseUrl: uploadedDocument.url,
  //       // Include the file only if backend expects it
  //       file: uploadedDocument.file,
  //     };

  //     const formData = new FormData();
  //     Object.entries(payload).forEach(([key, value]) => {
  //       if (value !== undefined && value !== null) {
  //         formData.append(key, value);
  //       }
  //     });
  //     console.log("Submitting form data:", formData);
  //     console.log("Form values:", values);
  //     console.log("Uploaded document:", uploadedDocument);
  //     console.log("payload:", payload);

  //     setLoading(true);
  //     const response = await axios.post(`/documents/${id}`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     console.log("Document upload response:", response.data);

  //     // Update state optimistically
  //     setDocuments((prev) => [...prev, response.data]);
  //     setFilteredDocuments((prev) => [...prev, response.data]);

  //     message.success("Document ajouté avec succès");
  //     handleCancel();
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     console.error("Error details:", error.response?.data);

  //     message.error(
  //       error.response?.data?.message || "Erreur lors de l'envoi du document"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDeleteDocument = async (key) => {
  //   try {
  //     await axios.delete(`/documents/${key}`);
  //     setDocuments(documents.filter((doc) => doc.key !== key));
  //     setFilteredDocuments(filteredDocuments.filter((doc) => doc.key !== key));
  //     message.success("Document supprimé avec succès");
  //   } catch (error) {
  //     message.error("Erreur lors de la suppression du document");
  //     console.error("Error deleting document:", error);
  //   }
  // };

  const handleSearch = (field, value) => {
    const newSearchParams = { ...searchParams, [field]: value };
    setSearchParams(newSearchParams);

    const filtered = documents.filter((doc) => {
      return (
        (!newSearchParams.documentType ||
          doc.type === newSearchParams.documentType) &&
        (!newSearchParams.referenceNumber ||
          (doc.referenceNumber &&
            doc.referenceNumber.includes(newSearchParams.referenceNumber)))
      );
    });
    setFilteredDocuments(filtered);
  };

  const columns = [
    {
      title: "Famille de document",
      dataIndex: "family",
      key: "family",
    },
    {
      title: "Type de document",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "N° (contrat, devis, réclamation, sinistre)",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Date de l'ajout",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(record.firebaseStorageUrl, "_blank")}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDocument(record._id)}
          />
        </Space>
      ),
    },
  ];

  const shouldShowReferenceField = () => {
    // For client documents, show reference only when "Autre document" is selected
    if (selectedFamily === "client") {
      return selectedType === "Autre document";
    }
    // For other families, always show reference field
    return selectedFamily && selectedFamily !== "client";
  };

  const shouldShowDocumentNameField = () => {
    // Show document name field when "Autre document" is selected in any family
    return selectedType === "Autre document";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button type="primary" onClick={showModal} icon={<UploadOutlined />}>
          AJOUTER UN DOCUMENT
        </Button>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs font-medium mb-1">Type de document</div>
            <Select
              placeholder="-- Choisissez --"
              style={{ width: 150 }}
              onChange={(value) => handleSearch("documentType", value)}
              value={searchParams.documentType}
            >
              {Object.values(documentTypes)
                .flat()
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
            </Select>
          </div>

          <div>
            <div className="text-xs font-medium mb-1">
              N° contrat / N° devis
            </div>
            <Input
              placeholder="N° contrat / N° devis"
              onChange={(e) => handleSearch("referenceNumber", e.target.value)}
              value={searchParams.referenceNumber}
            />
          </div>
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
        loading={loading}
        bordered
        rowKey="_id"
      />

      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">Ajouter un document</span>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>
        }
        open={isModalVisible}
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
        <Form
          form={form}
          layout="vertical"
          className="p-4"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="family"
            label="Famille de document"
            rules={[{ required: false, message: "Ce champ est obligatoire" }]}
          >
            <Select
              placeholder="-- Choisissez --"
              onChange={handleFamilyChange}
            >
              <Option value="client">Documents clients</Option>
              <Option value="devis">Documents devis/contrats</Option>
              <Option value="reclamation">Documents réclamation</Option>
              <Option value="sinistre">Documents sinistre</Option>
              <Option value="autres">Autres documents</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Type de document"
            rules={[{ required: false, message: "Ce champ est obligatoire" }]}
          >
            <Select
              placeholder="-- Choisissez --"
              disabled={!selectedFamily}
              onChange={handleTypeChange}
            >
              {selectedFamily &&
                documentTypes[selectedFamily].map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {shouldShowReferenceField() && (
            <Form.Item
              name="referenceNumber"
              label={getReferenceLabel(selectedFamily)}
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              {selectedFamily === "client" ? (
                <Input placeholder="Entrez la référence du document" />
              ) : (
                <Spin spinning={loadingReferences}>
                  {/* <Select
                    placeholder={`Sélectionnez ${getReferenceLabel(
                      selectedFamily
                    )}`}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    notFoundContent={
                      loadingReferences
                        ? "Chargement..."
                        : "Aucune option trouvée"
                    }
                  >
                    {referenceOptions?.map((option) => (
                      <Option key={option._id} value={option.referenceNumber}>
                        {option.referenceNumber}{" "}
                        {option.clientName ? `- ${option.clientName}` : ""}
                        {option.sinistreNumber ? ` - ${option.sinistreNumber}` : ""}
                        {option.reclamationNumber ? ` - ${option.reclamationNumber}` : ""}
                        {option.devisNumber ? ` - ${option.devisNumber}` : ""}
                        {option.contractNumber ? ` - ${option.contractNumber}` : ""}
                      </Option>
                    ))}
                  </Select> */}
                  <Input
                    placeholder={`Entrez ${getReferenceLabel(selectedFamily)}`}
                    onChange={(e) =>
                      handleSearch("referenceNumber", e.target.value)
                    }
                    value={searchParams.referenceNumber}
                  />
                </Spin>
              )}
            </Form.Item>
          )}

          {shouldShowDocumentNameField() && (
            <Form.Item
              name="documentName"
              label="Nom du document"
              rules={[
                {
                  required: false,
                  message: "Veuillez entrer le nom du document",
                },
              ]}
            >
              <Input placeholder="Entrez le nom du document" />
            </Form.Item>
          )}

          <Form.Item
            name="document"
            label="Choisissez un document"
            rules={[
              { required: false, message: "Un document est obligatoire" },
            ]}
          >
            {uploadedDocument ? (
              <div className="flex items-center gap-2">
                <a
                  // href={url.createObjectURL(uploadedDocument.file)}
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
                  Supprimer
                </Button>
              </div>
            ) : (
              <UploadDocument
                onUploadSuccess={(firebaseResponse) => {
                  // The FileUpload sends response.data.document
                  handleUploadSuccess({
                    file: firebaseResponse.file, // Make sure this is included in the response
                    name: firebaseResponse.name,
                    url: firebaseResponse.url,
                  });
                }}
              />
            )}
          </Form.Item>
        </Form>
        <div className="flex justify-start mt-4 p-4 border-t">
          <Button type="primary" onClick={() => form.submit()}>
            Ajouter le document
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentTabContent;
