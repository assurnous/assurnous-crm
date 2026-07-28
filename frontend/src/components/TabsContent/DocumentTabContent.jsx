// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   Button,
// // //   Form,
// // //   Input,
// // //   Select,
// // //   Table,
// // //   Modal,
// // //   Space,
// // //   message,
// // //   Spin,
// // // } from "antd";
// // // import {
// // //   UploadOutlined,
// // //   DeleteOutlined,
// // //   EyeOutlined,
// // //   CloseOutlined,
// // // } from "@ant-design/icons";
// // // import axios from "axios";
// // // import { useParams } from "react-router-dom";
// // // import UploadDocument from "./UploadDocument";

// // // const { Option } = Select;

// // // const DocumentTabContent = () => {
// // //   const [documents, setDocuments] = useState([]);
// // //   const [filteredDocuments, setFilteredDocuments] = useState([]);
// // //   const [isModalVisible, setIsModalVisible] = useState(false);
// // //   const [uploadedDocument, setUploadedDocument] = useState(null);
// // //   const [form] = Form.useForm();
// // //   const [selectedFamily, setSelectedFamily] = useState("");
// // //   const [selectedType, setSelectedType] = useState("");
// // //   const [pageSize, setPageSize] = useState(30);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [referenceOptions, setReferenceOptions] = useState([]);
// // //   const [loadingReferences, setLoadingReferences] = useState(false);
// // //   const [loading, setLoading] = useState(false);
// // //   const { id } = useParams(); // Assuming you're using react-router for routing
// // //   const [searchParams, setSearchParams] = useState({
// // //     documentType: "",
// // //     referenceNumber: "",
// // //   });

// // //   // API endpoints for each document family
// // //   const apiEndpoints = {
// // //     devis: "/contrat",
// // //     reclamation: "/reclamations",
// // //     sinistre: "/sinistres/",
// // //   };

// // //   // Fetch documents for this lead
// // //   const fetchDocuments = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const response = await axios.get(`/documents/${id}`);
// // //       setDocuments(response.data);
// // //       setFilteredDocuments(response.data);
// // //     } catch (error) {
// // //       // message.error("Failed to fetch documents");
// // //       console.error("Error fetching documents:", error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // Fetch reference options from backend based on selected family
// // //   const fetchReferenceOptions = async () => {
// // //     if (!selectedFamily || !apiEndpoints[selectedFamily]) return;

// // //     try {
// // //       setLoadingReferences(true);
// // //       const response = await axios.get(apiEndpoints[selectedFamily]);
// // //       setReferenceOptions(response.data);
// // //     } catch (error) {
// // //       console.error(`Error fetching ${selectedFamily} options:`, error);
// // //     } finally {
// // //       setLoadingReferences(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchDocuments();
// // //   }, [id]);

// // //   useEffect(() => {
// // //     fetchReferenceOptions();
// // //   }, [selectedFamily]);

// // //   const handleTypeChange = (value) => {
// // //     setSelectedType(value);
// // //     form.setFieldsValue({ documentName: undefined }); // Reset document name when type changes
// // //   };

// // //   const documentTypes = {
// // //     client: [
// // //       "Attestation carte vitale",
// // //       "Carte d'identité",
// // //       "Passport",
// // //       "Permis de conduire",
// // //       "RIB",
// // //       "Carte grise",
// // //       "Autre document",
// // //     ],
// // //     devis: [
// // //       "Photo",
// // //       "Permis de conduire",
// // //       "Carte d'identité",
// // //       "RIB",
// // //       "Carte grise",
// // //       "Certificat provisoire d'immatriculation (CPI)",
// // //       "Bulletin d'adhésion",
// // //       "Conditions particulières",
// // //       "Conditions générales",
// // //       "Mandat SEPA",
// // //       "Fiche d'information et de conseil",
// // //       "Attestation sur l'honneur de non-sinistralité",
// // //       "Cession",
// // //       "Relevé d'information",
// // //       "Relevé de sinistres",
// // //       "Demande d'assurance",
// // //       "Mandat de résiliation",
// // //       "Lettre recommandée électronique de résiliation (LRE)",
// // //       "Constat amiable",
// // //       "Contrôle technique",
// // //       "Photographie",
// // //       "Devis",
// // //       "Facture",
// // //       "Courrier",
// // //       "Avenant",
// // //       "Déclaration de sinistre",
// // //       "Autre document",
// // //     ],
// // //     comptabilite: ["Documents comptabilité"],
// // //     // devis: [
// // //     //   "Bulletin d'adhésion non signé",
// // //     //   "Bulletin d'adhésion signé",
// // //     //   "Conditions générales",
// // //     //   "Conditions particulières",
// // //     //   "Convention d'assistance",
// // //     //   "Fiche d'information et de conseil",
// // //     //   "Fiche d'information et de conseil signé",
// // //     //   "IPID",
// // //     //   "Mandat HAMON",
// // //     //   "Mandat HAMON signé",
// // //     //   "Notice d'information",
// // //     //   "Mandat SEPA non signé",
// // //     //   "Plaquette",
// // //     //   "Mandat SEPA signé",
// // //     //   "Devis",
// // //     //   "Mandat RIA",
// // //     //   "Mandat RIA signé",
// // //     //   "Tableau de garanties",
// // //     //   "Devis valant Fiche d'information et de conseil",
// // //     //   "Propositions d'assurance non signé",
// // //     //   "Plaquette Courtier",
// // //     //   "Propositions d'assurance signé",
// // //     //   "Carte grise",
// // //     //   "Relevé d'information",
// // //     //   "Autre document",
// // //     // ],
// // //     reclamation: ["Numéro de réclamation", "Autre document"],
// // //     sinistre: ["Numéro de sinistre", "Autre document"],
// // //     autres: ["Déclaration de sinistre", "Autre document"],
// // //   };

// // //   const getReferenceLabel = (family) => {
// // //     switch (family) {
// // //       case "devis":
// // //         return "Numéro de devis/contrat";
// // //       // case "reclamation":
// // //       //   return "Numéro de réclamation";
// // //       case "comptabilite":
// // //         return "Numéro de document comptabilité";
// // //       // case "sinistre":
// // //       //   return "Numéro de sinistre";
// // //       case "autres":
// // //         return "Référence document";
// // //       default:
// // //         return "Référence";
// // //     }
// // //   };

// // //   const showModal = () => {
// // //     setIsModalVisible(true);
// // //   };

// // //   const handleCancel = () => {
// // //     setIsModalVisible(false);
// // //     form.resetFields();
// // //     setUploadedDocument(null);
// // //     setSelectedFamily("");
// // //     setSelectedType("");
// // //     setReferenceOptions([]);
// // //   };

// // //   const handleFamilyChange = (value) => {
// // //     setSelectedFamily(value);
// // //     setSelectedType("");
// // //     form.setFieldsValue({
// // //       type: undefined,
// // //       referenceNumber: undefined,
// // //       documentName: undefined,
// // //     });
// // //   };

// // //   const handleUploadSuccess = (uploadResponse) => {
// // //     setUploadedDocument({
// // //       file: uploadResponse.file,
// // //       name: uploadResponse.name,
// // //       url: uploadResponse.url,
// // //       // Include any other fields from the response
// // //       ...uploadResponse,
// // //     });
// // //   };

// // //   // const handleFormSubmit = async (values) => {
// // //   //   try {
// // //   //     if (!uploadedDocument) {
// // //   //       return;
// // //   //     }

// // //   //     const payload = {
// // //   //       family: values.family,
// // //   //       type: values.type,
// // //   //       referenceNumber: values.referenceNumber || null,
// // //   //       documentName: values.documentName || null,
// // //   //       firebaseUrl: uploadedDocument.url,
// // //   //       file: uploadedDocument.file,
// // //   //       lead: id,
// // //   //     };

// // //   //     const formData = new FormData();
// // //   //     Object.entries(payload).forEach(([key, value]) => {
// // //   //       if (value !== undefined && value !== null) {
// // //   //         formData.append(key, value);
// // //   //       }
// // //   //     });

// // //   //     setLoading(true);
// // //   //     const response = await axios.post(`/documents/${id}`, formData, {
// // //   //       headers: {
// // //   //         "Content-Type": "multipart/form-data",
// // //   //       },
// // //   //     });

// // //   //     // Update state with the complete document data from the response
// // //   //     const newDocument = {
// // //   //       ...response.data.data,
// // //   //       _id: response.data.data._id, // Ensure _id is included
// // //   //       key: response.data.data._id, // Add key property for table rowKey
// // //   //     };

// // //   //     setDocuments(prev => [...prev, newDocument]);
// // //   //     setFilteredDocuments(prev => [...prev, newDocument]);

// // //   //     message.success("Document ajouté avec succès");
// // //   //     handleCancel();
// // //   //   } catch (error) {
// // //   //     console.error("Error submitting form:", error);
// // //   //   } finally {
// // //   //     setLoading(false);
// // //   //   }
// // //   // };
// // //   const handleFormSubmit = async (values) => {
// // //     try {
// // //       console.log("=== FRONTEND: Starting form submission ===");
// // //       console.log("Form values:", values);
// // //       console.log("Uploaded document:", uploadedDocument);

// // //       if (!uploadedDocument?.file) {
// // //         message.error("Veuillez sélectionner un fichier");
// // //         return;
// // //       }

// // //       setLoading(true);

// // //       // Create FormData
// // //       const formData = new FormData();
// // //       formData.append("file", uploadedDocument.file);
// // //       formData.append("family", values.family);
// // //       formData.append("type", values.type);

// // //       if (values.referenceNumber) {
// // //         formData.append("referenceNumber", values.referenceNumber);
// // //       }

// // //       if (values.documentName) {
// // //         formData.append("documentName", values.documentName);
// // //       }

// // //       // Log FormData contents
// // //       console.log("FormData contents:");
// // //       for (let [key, value] of formData.entries()) {
// // //         console.log(
// // //           key,
// // //           value instanceof File ? `${value.name} (${value.type})` : value
// // //         );
// // //       }

// // //       console.log("Sending request to backend...");
// // //       const response = await axios.post(`/documents/${id}`, formData, {
// // //         headers: {
// // //           "Content-Type": "multipart/form-data",
// // //         },
// // //         timeout: 45000, // Increased timeout
// // //       });

// // //       console.log("Backend response received:", response.data);

// // //       if (response.data.success) {
// // //         const newDocument = {
// // //           ...response.data.data,
// // //           key: response.data.data._id,
// // //         };

// // //         setDocuments((prev) => [...prev, newDocument]);
// // //         setFilteredDocuments((prev) => [...prev, newDocument]);

// // //         message.success("Document ajouté avec succès");
// // //         handleCancel();
// // //       } else {
// // //         throw new Error(response.data.message || "Upload failed");
// // //       }
// // //     } catch (error) {
// // //       console.error("Submission error:", error);

// // //       if (error.code === "ECONNABORTED") {
// // //         message.error("Timeout - le serveur met trop de temps à répondre");
// // //       } else if (error.response?.status === 400) {
// // //         message.error(error.response.data?.message || "Erreur de validation");
// // //       } else if (error.response?.status === 413) {
// // //         message.error("Fichier trop volumineux (max 10MB)");
// // //       } else if (error.response?.status === 500) {
// // //         message.error("Erreur serveur - contactez l'administrateur");
// // //       } else {
// // //         message.error(
// // //           error.response?.data?.message || "Erreur lors de l'upload"
// // //         );
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //       console.log("=== FRONTEND: Form submission finished ===");
// // //     }
// // //   };
// // //   const handleDeleteDocument = async (documentId) => {
// // //     Modal.confirm({
// // //       title: "Confirmer la suppression",
// // //       content: "Êtes-vous sûr de vouloir supprimer ce document?",
// // //       okText: "Oui",
// // //       cancelText: "Non",
// // //       onOk: async () => {
// // //         try {
// // //           await axios.delete(`/documents/${documentId}`);

// // //           // Option 1: Optimistic update
// // //           setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
// // //           setFilteredDocuments((prev) =>
// // //             prev.filter((doc) => doc._id !== documentId)
// // //           );

// // //           // Option 2: Or refresh the full list (more reliable)
// // //           // await fetchDocuments();

// // //           message.success("Document supprimé avec succès");
// // //         } catch (error) {
// // //           console.error("Error deleting document:", error);
// // //         }
// // //       },
// // //     });
// // //   };

// // //   const handleSearch = (field, value) => {
// // //     const newSearchParams = { ...searchParams, [field]: value };
// // //     setSearchParams(newSearchParams);

// // //     const filtered = documents.filter((doc) => {
// // //       return (
// // //         (!newSearchParams.documentType ||
// // //           doc.type === newSearchParams.documentType) &&
// // //         (!newSearchParams.referenceNumber ||
// // //           (doc.referenceNumber &&
// // //             doc.referenceNumber.includes(newSearchParams.referenceNumber)))
// // //       );
// // //     });
// // //     setFilteredDocuments(filtered);
// // //   };

// // //   const columns = [
// // //     {
// // //       title: "Famille de document",
// // //       dataIndex: "family",
// // //       key: "family",
// // //     },
// // //     {
// // //       title: "Type de document",
// // //       dataIndex: "type",
// // //       key: "type",
// // //     },
// // //     {
// // //       title: "N° (contrat, devis, réclamation, sinistre)",
// // //       dataIndex: "referenceNumber",
// // //       key: "referenceNumber",
// // //     },
// // //     {
// // //       title: "Date de l'ajout",
// // //       dataIndex: "uploadDate",
// // //       key: "uploadDate",
// // //       render: (date) => new Date(date).toLocaleDateString(),
// // //     },
// // //     {
// // //       title: "Actions",
// // //       key: "actions",
// // //       render: (_, record) => (
// // //         <Space size="middle">
// // //           <Button
// // //             type="link"
// // //             icon={<EyeOutlined />}
// // //             onClick={() => window.open(record.firebaseStorageUrl, "_blank")}
// // //           />
// // //           <Button
// // //             type="link"
// // //             danger
// // //             icon={<DeleteOutlined />}
// // //             onClick={() => handleDeleteDocument(record._id)}
// // //           />
// // //         </Space>
// // //       ),
// // //     },
// // //   ];

// // //   const shouldShowReferenceField = () => {
// // //     // For client documents, show reference only when "Autre document" is selected
// // //     if (selectedFamily === "client") {
// // //       return selectedType === "Autre document";
// // //     }
// // //     // For other families, always show reference field
// // //     return selectedFamily && selectedFamily !== "client";
// // //   };

// // //   const shouldShowDocumentNameField = () => {
// // //     // Show document name field when "Autre document" is selected in any family
// // //     return selectedType === "Autre document";
// // //   };

// // //   return (
// // //     <div className="p-4">
// // //       <div className="flex justify-between items-center mb-4">
// // //         <Button type="primary" onClick={showModal} icon={<UploadOutlined />}>
// // //           AJOUTER UN DOCUMENT
// // //         </Button>

// // //         <div className="flex items-center gap-4">
// // //           <div>
// // //             <div className="text-xs font-medium mb-1">Type de document</div>
// // //             <Select
// // //               placeholder="-- Choisissez --"
// // //               allowClear
// // //               style={{ width: 150 }}
// // //               onChange={(value) => handleSearch("documentType", value)}
// // //               value={searchParams.documentType}
// // //             >
// // //               {Object.values(documentTypes)
// // //                 .flat()
// // //                 .filter((v, i, a) => a.indexOf(v) === i)
// // //                 .map((type) => (
// // //                   <Option key={type} value={type}>
// // //                     {type}
// // //                   </Option>
// // //                 ))}
// // //             </Select>
// // //           </div>

// // //           <div>
// // //             <div className="text-xs font-medium mb-1">
// // //               N° (contrat, devis, réclamation, sinistre)
// // //             </div>
// // //             <Input
// // //               placeholder="N° de référence"
// // //               onChange={(e) => handleSearch("referenceNumber", e.target.value)}
// // //               value={searchParams.referenceNumber}
// // //             />
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <Table
// // //         columns={[
// // //           ...columns.map((col) => ({
// // //             ...col,
// // //             title: (
// // //               <div className="flex flex-col items-center">
// // //                 <div className="text-xs">{col.title}</div>
// // //               </div>
// // //             ),
// // //           })),
// // //         ]}
// // //         dataSource={filteredDocuments.slice(
// // //           (currentPage - 1) * pageSize,
// // //           currentPage * pageSize
// // //         )}
// // //         pagination={{
// // //           current: currentPage,
// // //           pageSize,
// // //           total: filteredDocuments.length,
// // //           // onChange: (page) => setCurrentPage(page),
// // //           onChange: (page, pageSize) => {
// // //             setCurrentPage(page);
// // //             setPageSize(pageSize);
// // //           },
// // //           showSizeChanger: true,
// // //           pageSizeOptions: ["10", "20", "30", "50", "100"],
// // //           showTotal: (total, range) =>
// // //             `${range[0]}-${range[1]} of ${total} items`,
// // //         }}
// // //         loading={loading}
// // //         bordered
// // //         rowKey="_id"
// // //       />

// // //       <Modal
// // //         title={
// // //           <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
// // //             <span className="font-medium text-sm">Ajouter un document</span>
// // //             <button
// // //               onClick={handleCancel}
// // //               className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
// // //             >
// // //               <CloseOutlined className="text-xs" />
// // //             </button>
// // //           </div>
// // //         }
// // //         open={isModalVisible}
// // //         onCancel={handleCancel}
// // //         footer={null}
// // //         width="30%"
// // //         style={{
// // //           position: "fixed",
// // //           right: 0,
// // //           top: 0,
// // //           bottom: 0,
// // //           height: "100vh",
// // //           margin: 0,
// // //           padding: 0,
// // //           overflow: "hidden",
// // //         }}
// // //         bodyStyle={{
// // //           height: "calc(100vh - 49px)",
// // //           padding: 0,
// // //           margin: 0,
// // //         }}
// // //         maskStyle={{
// // //           backgroundColor: "rgba(0, 0, 0, 0.1)",
// // //         }}
// // //         closeIcon={null}
// // //       >
// // //         <Form
// // //           form={form}
// // //           layout="vertical"
// // //           className="p-4"
// // //           onFinish={handleFormSubmit}
// // //         >
// // //           <Form.Item
// // //             name="family"
// // //             label="Famille de document"
// // //             rules={[{ required: false, message: "Ce champ est obligatoire" }]}
// // //           >
// // //             <Select
// // //               placeholder="-- Choisissez --"
// // //               onChange={handleFamilyChange}
// // //             >
// // //               {/* <Option value="client">Documents clients</Option> */}
// // //               <Option value="devis">Documents devis/contrats</Option>
// // //               <Option value="comptabilite">Document comptabilité</Option>
// // //               {/* <Option value="reclamation">Documents réclamation</Option> */}
// // //               <Option value="sinistre">Documents sinistre</Option>
// // //               {/* <Option value="autres">Autres documents</Option> */}
// // //             </Select>
// // //           </Form.Item>

// // //           <Form.Item
// // //             name="type"
// // //             label="Type de document"
// // //             rules={[{ required: false, message: "Ce champ est obligatoire" }]}
// // //           >
// // //             <Select
// // //               placeholder="-- Choisissez --"
// // //               disabled={!selectedFamily}
// // //               onChange={handleTypeChange}
// // //             >
// // //               {selectedFamily &&
// // //                 documentTypes[selectedFamily].map((type) => (
// // //                   <Option key={type} value={type}>
// // //                     {type}
// // //                   </Option>
// // //                 ))}
// // //             </Select>
// // //           </Form.Item>

// // //           {shouldShowReferenceField() && (
// // //             <Form.Item
// // //               name="referenceNumber"
// // //               label={getReferenceLabel(selectedFamily)}
// // //               rules={[{ required: false, message: "Ce champ est obligatoire" }]}
// // //             >
// // //               {selectedFamily === "client" ? (
// // //                 <Input placeholder="Entrez la référence du document" />
// // //               ) : (
// // //                 <Spin spinning={loadingReferences}>
// // //                   {/* <Select
// // //                     placeholder={`Sélectionnez ${getReferenceLabel(
// // //                       selectedFamily
// // //                     )}`}
// // //                     showSearch
// // //                     optionFilterProp="children"
// // //                     filterOption={(input, option) =>
// // //                       option.children
// // //                         .toLowerCase()
// // //                         .indexOf(input.toLowerCase()) >= 0
// // //                     }
// // //                     notFoundContent={
// // //                       loadingReferences
// // //                         ? "Chargement..."
// // //                         : "Aucune option trouvée"
// // //                     }
// // //                   >
// // //                     {referenceOptions?.map((option) => (
// // //                       <Option key={option._id} value={option.referenceNumber}>
// // //                         {option.referenceNumber}{" "}
// // //                         {option.clientName ? `- ${option.clientName}` : ""}
// // //                         {option.sinistreNumber ? ` - ${option.sinistreNumber}` : ""}
// // //                         {option.reclamationNumber ? ` - ${option.reclamationNumber}` : ""}
// // //                         {option.devisNumber ? ` - ${option.devisNumber}` : ""}
// // //                         {option.contractNumber ? ` - ${option.contractNumber}` : ""}
// // //                       </Option>
// // //                     ))}
// // //                   </Select> */}
// // //                   <Input
// // //                     placeholder={`Entrez ${getReferenceLabel(selectedFamily)}`}
// // //                     onChange={(e) =>
// // //                       handleSearch("referenceNumber", e.target.value)
// // //                     }
// // //                     value={searchParams.referenceNumber}
// // //                   />
// // //                 </Spin>
// // //               )}
// // //             </Form.Item>
// // //           )}

// // //           {shouldShowDocumentNameField() && (
// // //             <Form.Item
// // //               name="documentName"
// // //               label="Nom du document"
// // //               rules={[
// // //                 {
// // //                   required: false,
// // //                   message: "Veuillez entrer le nom du document",
// // //                 },
// // //               ]}
// // //             >
// // //               <Input placeholder="Entrez le nom du document" />
// // //             </Form.Item>
// // //           )}

// // //           {/* <Form.Item
// // //             name="document"
// // //             label="Choisissez un document"
// // //             rules={[
// // //               { required: false, message: "Un document est obligatoire" },
// // //             ]}
// // //           >
// // //             {uploadedDocument ? (
// // //               <div className="flex items-center gap-2">
// // //                 <a
// // //                   // href={url.createObjectURL(uploadedDocument.file)}
// // //                   target="_blank"
// // //                   rel="noopener noreferrer"
// // //                   className="text-blue-500 hover:underline"
// // //                 >
// // //                   {uploadedDocument.name}
// // //                 </a>
// // //                 <Button
// // //                   type="link"
// // //                   danger
// // //                   onClick={() => setUploadedDocument(null)}
// // //                   size="small"
// // //                 >
// // //                   Supprimer
// // //                 </Button>
// // //               </div>
// // //             ) : (
// // //               <UploadDocument
// // //                 onUploadSuccess={(firebaseResponse) => {
// // //                   // The FileUpload sends response.data.document
// // //                   handleUploadSuccess({
// // //                     file: firebaseResponse.file, // Make sure this is included in the response
// // //                     name: firebaseResponse.name,
// // //                     url: firebaseResponse.url,
// // //                   });
// // //                 }}
// // //               />
// // //             )}
// // //           </Form.Item> */}
// // //           <Form.Item
// // //             name="document"
// // //             label="Choisissez un document"
// // //             rules={[{ required: true, message: "Un document est obligatoire" }]}
// // //           >
// // //             <input
// // //               type="file"
// // //               accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
// // //               onChange={(e) => {
// // //                 const file = e.target.files[0];
// // //                 if (file) {
// // //                   setUploadedDocument({
// // //                     file: file,
// // //                     name: file.name,
// // //                   });
// // //                 }
// // //               }}
// // //               disabled={loading}
// // //             />
// // //           </Form.Item>
// // //         </Form>
// // //         {/* <div className="flex justify-start mt-4 p-4 border-t">
// // //           <Button type="primary" onClick={() => form.submit()}>
// // //             Ajouter le document
// // //           </Button>
// // //         </div> */}
// // //         <div className="flex justify-start mt-4 p-4 border-t">
// // //           <Button
// // //             type="primary"
// // //             onClick={() => form.submit()}
// // //             loading={loading} // Show loading state on button
// // //             disabled={!uploadedDocument} // Disable if no document uploaded
// // //           >
// // //             {loading ? "Ajout en cours..." : "Ajouter le document"}
// // //           </Button>
// // //         </div>
// // //       </Modal>
// // //     </div>
// // //   );
// // // };

// // // export default DocumentTabContent;
// // import React, { useState, useEffect } from "react";
// // import { Button, Select, Input, Table, Modal, Space, message } from "antd";
// // import {
// //   UploadOutlined,
// //   DeleteOutlined,
// //   EyeOutlined,
// //   EditOutlined,
// //   CheckOutlined,
// //   CloseOutlined,
// //   PaperClipOutlined,
// // } from "@ant-design/icons";
// // import axios from "axios";
// // import { useParams } from "react-router-dom";

// // const { Option } = Select;

// // // Document type lists per family (unchanged from before)
// // const documentTypes = {
// //   client: [
// //     "Attestation carte vitale",
// //     "Carte d'identité",
// //     "Passport",
// //     "Permis de conduire",
// //     "RIB",
// //     "Carte grise",
// //     "Autre document",
// //   ],
// //   devis: [
// //     "Photo",
// //     "Permis de conduire",
// //     "Carte d'identité",
// //     "RIB",
// //     "Carte grise",
// //     "Certificat provisoire d'immatriculation (CPI)",
// //     "Bulletin d'adhésion",
// //     "Conditions particulières",
// //     "Conditions générales",
// //     "Mandat SEPA",
// //     "Fiche d'information et de conseil",
// //     "Attestation sur l'honneur de non-sinistralité",
// //     "Cession",
// //     "Relevé d'information",
// //     "Relevé de sinistres",
// //     "Demande d'assurance",
// //     "Mandat de résiliation",
// //     "Lettre recommandée électronique de résiliation (LRE)",
// //     "Constat amiable",
// //     "Contrôle technique",
// //     "Photographie",
// //     "Devis",
// //     "Facture",
// //     "Courrier",
// //     "Avenant",
// //     "Déclaration de sinistre",
// //     "Autre document",
// //   ],
// //   comptabilite: ["Documents comptabilité"],
// //   reclamation: ["Numéro de réclamation", "Autre document"],
// //   sinistre: ["Numéro de sinistre", "Autre document"],
// //   autres: ["Déclaration de sinistre", "Autre document"],
// // };

// // const familyLabels = {
// //   devis: "Documents devis/contrats",
// //   comptabilite: "Document comptabilité",
// //   sinistre: "Documents sinistre",
// // };

// // const emptyRow = () => ({
// //   family: undefined,
// //   type: undefined,
// //   referenceNumber: "",
// //   documentName: "",
// //   file: null,
// //   fileName: "",
// // });

// // const DocumentTabContent = () => {
// //   const [documents, setDocuments] = useState([]);
// //   const [filteredDocuments, setFilteredDocuments] = useState([]);
// //   const [pageSize, setPageSize] = useState(30);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const { id } = useParams();

// //   // Inline "add new document" row state
// //   const [isAdding, setIsAdding] = useState(false);
// //   const [newRow, setNewRow] = useState(emptyRow());

// //   // Inline "edit existing document" row state
// //   const [editingId, setEditingId] = useState(null);
// //   const [editRow, setEditRow] = useState(emptyRow());

// //   const fetchDocuments = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get(`/documents/${id}`);
// //       setDocuments(response.data);
// //       setFilteredDocuments(response.data);
// //     } catch (error) {
// //       console.error("Error fetching documents:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchDocuments();
// //   }, [id]);

// //   const getReferenceLabel = (family) => {
// //     switch (family) {
// //       case "devis":
// //         return "Numéro de devis/contrat";
// //       case "comptabilite":
// //         return "Numéro de document comptabilité";
// //       case "autres":
// //         return "Référence document";
// //       default:
// //         return "N° de référence";
// //     }
// //   };

// //   const shouldShowDocumentNameField = (type) => type === "Autre document";

// //   // ---------- Add new row ----------
// //   const startAdding = () => {
// //     setEditingId(null); // don't allow adding + editing at once
// //     setIsAdding(true);
// //     setNewRow(emptyRow());
// //   };

// //   const cancelAdding = () => {
// //     setIsAdding(false);
// //     setNewRow(emptyRow());
// //   };

// //   const handleNewFamilyChange = (value) => {
// //     setNewRow((prev) => ({ ...prev, family: value, type: undefined }));
// //   };

// //   const handleNewFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       setNewRow((prev) => ({ ...prev, file, fileName: file.name }));
// //     }
// //   };

// //   const handleSaveNew = async () => {
// //     if (!newRow.family || !newRow.type) {
// //       message.error("Merci de choisir une famille et un type de document");
// //       return;
// //     }
// //     if (!newRow.file) {
// //       message.error("Merci de sélectionner un fichier");
// //       return;
// //     }
// //     if (shouldShowDocumentNameField(newRow.type) && !newRow.documentName) {
// //       message.error("Merci d'indiquer le nom du document");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const formData = new FormData();
// //       formData.append("file", newRow.file);
// //       formData.append("family", newRow.family);
// //       formData.append("type", newRow.type);
// //       if (newRow.referenceNumber) {
// //         formData.append("referenceNumber", newRow.referenceNumber);
// //       }
// //       if (newRow.documentName) {
// //         formData.append("documentName", newRow.documentName);
// //       }

// //       const response = await axios.post(`/documents/${id}`, formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //         timeout: 45000,
// //       });

// //       if (response.data.success) {
// //         const newDocument = { ...response.data.data, key: response.data.data._id };
// //         setDocuments((prev) => [newDocument, ...prev]);
// //         setFilteredDocuments((prev) => [newDocument, ...prev]);
// //         message.success("Document ajouté avec succès");
// //         cancelAdding();
// //       } else {
// //         throw new Error(response.data.message || "Upload failed");
// //       }
// //     } catch (error) {
// //       console.error("Submission error:", error);
// //       if (error.code === "ECONNABORTED") {
// //         message.error("Timeout - le serveur met trop de temps à répondre");
// //       } else if (error.response?.status === 413) {
// //         message.error("Fichier trop volumineux (max 10MB)");
// //       } else {
// //         message.error(error.response?.data?.message || "Erreur lors de l'upload");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ---------- Edit existing row ----------
// //   const startEditing = (record) => {
// //     setIsAdding(false); // don't allow adding + editing at once
// //     setEditingId(record._id);
// //     setEditRow({
// //       family: record.family,
// //       type: record.type,
// //       referenceNumber: record.referenceNumber || "",
// //       documentName: record.documentName || "",
// //       file: null,
// //       fileName: "",
// //     });
// //   };

// //   const cancelEditing = () => {
// //     setEditingId(null);
// //     setEditRow(emptyRow());
// //   };

// //   const handleEditFamilyChange = (value) => {
// //     setEditRow((prev) => ({ ...prev, family: value, type: undefined }));
// //   };

// //   const handleEditFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       setEditRow((prev) => ({ ...prev, file, fileName: file.name }));
// //     }
// //   };

// //   const handleSaveEdit = async (documentId) => {
// //     if (!editRow.family || !editRow.type) {
// //       message.error("Merci de choisir une famille et un type de document");
// //       return;
// //     }
// //     if (shouldShowDocumentNameField(editRow.type) && !editRow.documentName) {
// //       message.error("Merci d'indiquer le nom du document");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const formData = new FormData();
// //       formData.append("family", editRow.family);
// //       formData.append("type", editRow.type);
// //       formData.append("referenceNumber", editRow.referenceNumber || "");
// //       formData.append("documentName", editRow.documentName || "");
// //       if (editRow.file) {
// //         formData.append("file", editRow.file);
// //       }

// //       const response = await axios.put(`/documents/${documentId}`, formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //         timeout: 45000,
// //       });

// //       if (response.data.success) {
// //         const updated = response.data.data;
// //         const merge = (list) =>
// //           list.map((doc) => (doc._id === documentId ? { ...doc, ...updated } : doc));
// //         setDocuments(merge);
// //         setFilteredDocuments(merge);
// //         message.success("Document modifié avec succès");
// //         cancelEditing();
// //       } else {
// //         throw new Error(response.data.message || "Update failed");
// //       }
// //     } catch (error) {
// //       console.error("Update error:", error);
// //       message.error(error.response?.data?.message || "Erreur lors de la modification");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ---------- Delete ----------
// //   const handleDeleteDocument = async (documentId) => {
// //     Modal.confirm({
// //       title: "Confirmer la suppression",
// //       content: "Êtes-vous sûr de vouloir supprimer ce document?",
// //       okText: "Oui",
// //       cancelText: "Non",
// //       onOk: async () => {
// //         try {
// //           await axios.delete(`/documents/${documentId}`);
// //           setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
// //           setFilteredDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
// //           message.success("Document supprimé avec succès");
// //         } catch (error) {
// //           console.error("Error deleting document:", error);
// //         }
// //       },
// //     });
// //   };

// //   // ---------- Column renderers ----------

// //   const renderFamilyCell = (text, record) => {
// //     if (record._id === "new-row") {
// //       return (
// //         <Select
// //           placeholder="Famille de document"
// //           style={{ width: 170 }}
// //           value={newRow.family}
// //           onChange={handleNewFamilyChange}
// //         >
// //           {Object.keys(familyLabels).map((fam) => (
// //             <Option key={fam} value={fam}>
// //               {familyLabels[fam]}
// //             </Option>
// //           ))}
// //         </Select>
// //       );
// //     }
// //     if (record._id === editingId) {
// //       return (
// //         <Select
// //           placeholder="Famille de document"
// //           style={{ width: 170 }}
// //           value={editRow.family}
// //           onChange={handleEditFamilyChange}
// //         >
// //           {Object.keys(familyLabels).map((fam) => (
// //             <Option key={fam} value={fam}>
// //               {familyLabels[fam]}
// //             </Option>
// //           ))}
// //         </Select>
// //       );
// //     }
// //     return text;
// //   };

// //   const renderTypeCell = (text, record) => {
// //     if (record._id === "new-row") {
// //       return (
// //         <div className="flex flex-col gap-1">
// //           <Select
// //             placeholder="Type de document"
// //             style={{ width: 200 }}
// //             disabled={!newRow.family}
// //             value={newRow.type}
// //             onChange={(value) => setNewRow((prev) => ({ ...prev, type: value }))}
// //           >
// //             {(newRow.family ? documentTypes[newRow.family] : []).map((t) => (
// //               <Option key={t} value={t}>
// //                 {t}
// //               </Option>
// //             ))}
// //           </Select>
// //           {shouldShowDocumentNameField(newRow.type) && (
// //             <Input
// //               placeholder="Nom du document"
// //               size="small"
// //               value={newRow.documentName}
// //               onChange={(e) => setNewRow((prev) => ({ ...prev, documentName: e.target.value }))}
// //             />
// //           )}
// //         </div>
// //       );
// //     }
// //     if (record._id === editingId) {
// //       return (
// //         <div className="flex flex-col gap-1">
// //           <Select
// //             placeholder="Type de document"
// //             style={{ width: 200 }}
// //             disabled={!editRow.family}
// //             value={editRow.type}
// //             onChange={(value) => setEditRow((prev) => ({ ...prev, type: value }))}
// //           >
// //             {(editRow.family ? documentTypes[editRow.family] : []).map((t) => (
// //               <Option key={t} value={t}>
// //                 {t}
// //               </Option>
// //             ))}
// //           </Select>
// //           {shouldShowDocumentNameField(editRow.type) && (
// //             <Input
// //               placeholder="Nom du document"
// //               size="small"
// //               value={editRow.documentName}
// //               onChange={(e) => setEditRow((prev) => ({ ...prev, documentName: e.target.value }))}
// //             />
// //           )}
// //         </div>
// //       );
// //     }
// //     return text;
// //   };

// //   const renderReferenceCell = (text, record) => {
// //     if (record._id === "new-row") {
// //       return (
// //         <Input
// //           placeholder={getReferenceLabel(newRow.family)}
// //           value={newRow.referenceNumber}
// //           onChange={(e) => setNewRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
// //         />
// //       );
// //     }
// //     if (record._id === editingId) {
// //       return (
// //         <Input
// //           placeholder={getReferenceLabel(editRow.family)}
// //           value={editRow.referenceNumber}
// //           onChange={(e) => setEditRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
// //         />
// //       );
// //     }
// //     return text;
// //   };

// //   const renderDateCell = (dateValue, record) => {
// //     if (record._id === "new-row") {
// //       return (
// //         <label className="flex items-center gap-1 cursor-pointer text-blue-600">
// //           <PaperClipOutlined />
// //           <span className="text-xs truncate max-w-[110px]">
// //             {newRow.fileName || "Choisir un fichier"}
// //           </span>
// //           <input
// //             type="file"
// //             className="hidden"
// //             accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
// //             onChange={handleNewFileChange}
// //           />
// //         </label>
// //       );
// //     }
// //     if (record._id === editingId) {
// //       return (
// //         <label className="flex items-center gap-1 cursor-pointer text-blue-600">
// //           <PaperClipOutlined />
// //           <span className="text-xs truncate max-w-[110px]">
// //             {editRow.fileName || "Remplacer le fichier"}
// //           </span>
// //           <input
// //             type="file"
// //             className="hidden"
// //             accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
// //             onChange={handleEditFileChange}
// //           />
// //         </label>
// //       );
// //     }
// //     return dateValue ? new Date(dateValue).toLocaleDateString() : "";
// //   };

// //   const renderActionsCell = (_, record) => {
// //     if (record._id === "new-row") {
// //       return (
// //         <Space size="middle">
// //           <Button
// //             type="link"
// //             icon={<CheckOutlined />}
// //             onClick={handleSaveNew}
// //             loading={loading}
// //           />
// //           <Button type="link" danger icon={<CloseOutlined />} onClick={cancelAdding} />
// //         </Space>
// //       );
// //     }
// //     if (record._id === editingId) {
// //       return (
// //         <Space size="middle">
// //           <Button
// //             type="link"
// //             icon={<CheckOutlined />}
// //             onClick={() => handleSaveEdit(record._id)}
// //             loading={loading}
// //           />
// //           <Button type="link" danger icon={<CloseOutlined />} onClick={cancelEditing} />
// //         </Space>
// //       );
// //     }
// //     return (
// //       <Space size="middle">
// //         <Button
// //           type="link"
// //           icon={<EyeOutlined />}
// //           onClick={() => window.open(record.firebaseStorageUrl, "_blank")}
// //         />
// //         <Button type="link" icon={<EditOutlined />} onClick={() => startEditing(record)} />
// //         <Button
// //           type="link"
// //           danger
// //           icon={<DeleteOutlined />}
// //           onClick={() => handleDeleteDocument(record._id)}
// //         />
// //       </Space>
// //     );
// //   };

// //   const columns = [
// //     {
// //       title: "Famille de document",
// //       dataIndex: "family",
// //       key: "family",
// //       render: renderFamilyCell,
// //     },
// //     {
// //       title: "Type de document",
// //       dataIndex: "type",
// //       key: "type",
// //       render: renderTypeCell,
// //     },
// //     {
// //       title: "N° (contrat, devis, réclamation, sinistre)",
// //       dataIndex: "referenceNumber",
// //       key: "referenceNumber",
// //       render: renderReferenceCell,
// //     },
// //     {
// //       title: "Date de l'ajout",
// //       dataIndex: "uploadDate",
// //       key: "uploadDate",
// //       render: renderDateCell,
// //     },
// //     {
// //       title: "Actions",
// //       key: "actions",
// //       render: renderActionsCell,
// //     },
// //   ];

// //   const pagedData = filteredDocuments.slice(
// //     (currentPage - 1) * pageSize,
// //     currentPage * pageSize
// //   );

// //   const dataSource = isAdding
// //     ? [{ _id: "new-row", key: "new-row" }, ...pagedData]
// //     : pagedData;

// //   return (
// //     <div className="p-4">
// //       <div className="flex justify-between items-center mb-4">
// //         <Button
// //           type="primary"
// //           onClick={startAdding}
// //           icon={<UploadOutlined />}
// //           disabled={isAdding}
// //         >
// //           AJOUTER UN DOCUMENT
// //         </Button>
// //       </div>

// //       <Table
// //         columns={columns.map((col) => ({
// //           ...col,
// //           title: (
// //             <div className="flex flex-col items-center">
// //               <div className="text-xs">{col.title}</div>
// //             </div>
// //           ),
// //         }))}
// //         dataSource={dataSource}
// //         pagination={{
// //           current: currentPage,
// //           pageSize,
// //           total: filteredDocuments.length,
// //           onChange: (page, size) => {
// //             setCurrentPage(page);
// //             setPageSize(size);
// //           },
// //           showSizeChanger: true,
// //           pageSizeOptions: ["10", "20", "30", "50", "100"],
// //           showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
// //         }}
// //         loading={loading}
// //         bordered
// //         rowKey="_id"
// //       />
// //     </div>
// //   );
// // };

// // export default DocumentTabContent;
// import React, { useState, useEffect } from "react";
// import { Button, Select, Input, Table, Modal, Space, message } from "antd";
// import {
//   UploadOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   EditOutlined,
//   CheckOutlined,
//   CloseOutlined,
//   PaperClipOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { useParams } from "react-router-dom";

// const { Option } = Select;

// // Document type lists per family (unchanged from before)
// const documentTypes = {
//   client: [
//     "Attestation carte vitale",
//     "Carte d'identité",
//     "Passport",
//     "Permis de conduire",
//     "RIB",
//     "Carte grise",
//     "Autre document",
//   ],
//   devis: [
//     "Photo",
//     "Permis de conduire",
//     "Carte d'identité",
//     "RIB",
//     "Carte grise",
//     "Certificat provisoire d'immatriculation (CPI)",
//     "Bulletin d'adhésion",
//     "Conditions particulières",
//     "Conditions générales",
//     "Mandat SEPA",
//     "Fiche d'information et de conseil",
//     "Attestation sur l'honneur de non-sinistralité",
//     "Cession",
//     "Relevé d'information",
//     "Relevé de sinistres",
//     "Demande d'assurance",
//     "Mandat de résiliation",
//     "Lettre recommandée électronique de résiliation (LRE)",
//     "Constat amiable",
//     "Contrôle technique",
//     "Photographie",
//     "Devis",
//     "Facture",
//     "Courrier",
//     "Avenant",
//     "Déclaration de sinistre",
//     "Autre document",
//   ],
//   comptabilite: ["Documents comptabilité"],
//   reclamation: ["Numéro de réclamation", "Autre document"],
//   sinistre: ["Numéro de sinistre", "Autre document"],
//   autres: ["Déclaration de sinistre", "Autre document"],
// };

// const familyLabels = {
//   devis: "Documents devis/contrats",
//   comptabilite: "Document comptabilité",
//   sinistre: "Documents sinistre",
// };

// const emptyRow = () => ({
//   family: undefined,
//   type: undefined,
//   referenceNumber: "",
//   documentName: "",
//   file: null,
//   fileName: "",
// });

// const DocumentTabContent = () => {
//   const [documents, setDocuments] = useState([]);
//   const [filteredDocuments, setFilteredDocuments] = useState([]);
//   const [pageSize, setPageSize] = useState(30);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const { id } = useParams();

//   // Inline "add new document" row state
//   const [isAdding, setIsAdding] = useState(false);
//   const [newRow, setNewRow] = useState(emptyRow());

//   // Inline "edit existing document" row state
//   const [editingId, setEditingId] = useState(null);
//   const [editRow, setEditRow] = useState(emptyRow());

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/documents/${id}`);
//       setDocuments(response.data);
//       setFilteredDocuments(response.data);
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocuments();
//   }, [id]);

//   const getReferenceLabel = (family) => {
//     switch (family) {
//       case "devis":
//         return "Numéro de devis/contrat";
//       case "comptabilite":
//         return "Numéro de document comptabilité";
//       case "autres":
//         return "Référence document";
//       default:
//         return "N° de référence";
//     }
//   };

//   const shouldShowDocumentNameField = (type) => type === "Autre document";

//   // ---------- Add new row ----------
//   const startAdding = () => {
//     setEditingId(null); // don't allow adding + editing at once
//     setIsAdding(true);
//     setNewRow(emptyRow());
//   };

//   const cancelAdding = () => {
//     setIsAdding(false);
//     setNewRow(emptyRow());
//   };

//   const handleNewFamilyChange = (value) => {
//     setNewRow((prev) => ({ ...prev, family: value, type: undefined }));
//   };

//   const handleNewFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setNewRow((prev) => ({ ...prev, file, fileName: file.name }));
//     }
//   };

//   const handleSaveNew = async () => {
//     if (!newRow.family || !newRow.type) {
//       message.error("Merci de choisir une famille et un type de document");
//       return;
//     }
//     if (!newRow.file) {
//       message.error("Merci de sélectionner un fichier");
//       return;
//     }
//     if (shouldShowDocumentNameField(newRow.type) && !newRow.documentName) {
//       message.error("Merci d'indiquer le nom du document");
//       return;
//     }

//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("file", newRow.file);
//       formData.append("family", newRow.family);
//       formData.append("type", newRow.type);
//       if (newRow.referenceNumber) {
//         formData.append("referenceNumber", newRow.referenceNumber);
//       }
//       if (newRow.documentName) {
//         formData.append("documentName", newRow.documentName);
//       }

//       const response = await axios.post(`/documents/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 45000,
//       });

//       if (response.data.success) {
//         const newDocument = { ...response.data.data, key: response.data.data._id };
//         setDocuments((prev) => [newDocument, ...prev]);
//         setFilteredDocuments((prev) => [newDocument, ...prev]);
//         message.success("Document ajouté avec succès");
//         cancelAdding();
//       } else {
//         throw new Error(response.data.message || "Upload failed");
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       if (error.code === "ECONNABORTED") {
//         message.error("Timeout - le serveur met trop de temps à répondre");
//       } else if (error.response?.status === 413) {
//         message.error("Fichier trop volumineux (max 10MB)");
//       } else {
//         message.error(error.response?.data?.message || "Erreur lors de l'upload");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Edit existing row ----------
//   const startEditing = (record) => {
//     setIsAdding(false); // don't allow adding + editing at once
//     setEditingId(record._id);
//     setEditRow({
//       family: record.family,
//       type: record.type,
//       referenceNumber: record.referenceNumber || "",
//       documentName: record.documentName || "",
//       file: null,
//       fileName: "",
//     });
//   };

//   const cancelEditing = () => {
//     setEditingId(null);
//     setEditRow(emptyRow());
//   };

//   const handleEditFamilyChange = (value) => {
//     setEditRow((prev) => ({ ...prev, family: value, type: undefined }));
//   };

//   const handleEditFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setEditRow((prev) => ({ ...prev, file, fileName: file.name }));
//     }
//   };

//   const handleSaveEdit = async (documentId) => {
//     if (!editRow.family || !editRow.type) {
//       message.error("Merci de choisir une famille et un type de document");
//       return;
//     }
//     if (shouldShowDocumentNameField(editRow.type) && !editRow.documentName) {
//       message.error("Merci d'indiquer le nom du document");
//       return;
//     }

//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("family", editRow.family);
//       formData.append("type", editRow.type);
//       formData.append("referenceNumber", editRow.referenceNumber || "");
//       formData.append("documentName", editRow.documentName || "");
//       if (editRow.file) {
//         formData.append("file", editRow.file);
//       }

//       const response = await axios.put(`/documents/${documentId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 45000,
//       });

//       if (response.data.success) {
//         const updated = response.data.data;
//         const merge = (list) =>
//           list.map((doc) => (doc._id === documentId ? { ...doc, ...updated } : doc));
//         setDocuments(merge);
//         setFilteredDocuments(merge);
//         message.success("Document modifié avec succès");
//         cancelEditing();
//       } else {
//         throw new Error(response.data.message || "Update failed");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       message.error(error.response?.data?.message || "Erreur lors de la modification");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Delete ----------
//   const handleDeleteDocument = async (documentId) => {
//     Modal.confirm({
//       title: "Confirmer la suppression",
//       content: "Êtes-vous sûr de vouloir supprimer ce document?",
//       okText: "Oui",
//       cancelText: "Non",
//       onOk: async () => {
//         try {
//           await axios.delete(`/documents/${documentId}`);
//           setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
//           setFilteredDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
//           message.success("Document supprimé avec succès");
//         } catch (error) {
//           console.error("Error deleting document:", error);
//         }
//       },
//     });
//   };

//   // ---------- Column renderers ----------

//   const renderFamilyCell = (text, record) => {
//     if (record._id === "new-row") {
//       return (
//         <Select
//           placeholder="Famille de document"
//           style={{ width: 170 }}
//           value={newRow.family}
//           onChange={handleNewFamilyChange}
//         >
//           {Object.keys(familyLabels).map((fam) => (
//             <Option key={fam} value={fam}>
//               {familyLabels[fam]}
//             </Option>
//           ))}
//         </Select>
//       );
//     }
//     if (record._id === editingId) {
//       return (
//         <Select
//           placeholder="Famille de document"
//           style={{ width: 170 }}
//           value={editRow.family}
//           onChange={handleEditFamilyChange}
//         >
//           {Object.keys(familyLabels).map((fam) => (
//             <Option key={fam} value={fam}>
//               {familyLabels[fam]}
//             </Option>
//           ))}
//         </Select>
//       );
//     }
//     return text;
//   };

//   const renderTypeCell = (text, record) => {
//     if (record._id === "new-row") {
//       return (
//         <div className="flex flex-col gap-1">
//           <Select
//             placeholder="Type de document"
//             style={{ width: 200 }}
//             disabled={!newRow.family}
//             value={newRow.type}
//             onChange={(value) => setNewRow((prev) => ({ ...prev, type: value }))}
//           >
//             {(newRow.family ? documentTypes[newRow.family] : []).map((t) => (
//               <Option key={t} value={t}>
//                 {t}
//               </Option>
//             ))}
//           </Select>
//           {shouldShowDocumentNameField(newRow.type) && (
//             <Input
//               placeholder="Nom du document"
//               size="small"
//               value={newRow.documentName}
//               onChange={(e) => setNewRow((prev) => ({ ...prev, documentName: e.target.value }))}
//             />
//           )}
//         </div>
//       );
//     }
//     if (record._id === editingId) {
//       return (
//         <div className="flex flex-col gap-1">
//           <Select
//             placeholder="Type de document"
//             style={{ width: 200 }}
//             disabled={!editRow.family}
//             value={editRow.type}
//             onChange={(value) => setEditRow((prev) => ({ ...prev, type: value }))}
//           >
//             {(editRow.family ? documentTypes[editRow.family] : []).map((t) => (
//               <Option key={t} value={t}>
//                 {t}
//               </Option>
//             ))}
//           </Select>
//           {shouldShowDocumentNameField(editRow.type) && (
//             <Input
//               placeholder="Nom du document"
//               size="small"
//               value={editRow.documentName}
//               onChange={(e) => setEditRow((prev) => ({ ...prev, documentName: e.target.value }))}
//             />
//           )}
//         </div>
//       );
//     }
//     return text;
//   };

//   const renderReferenceCell = (text, record) => {
//     if (record._id === "new-row") {
//       return (
//         <Input
//           placeholder={getReferenceLabel(newRow.family)}
//           value={newRow.referenceNumber}
//           onChange={(e) => setNewRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
//         />
//       );
//     }
//     if (record._id === editingId) {
//       return (
//         <Input
//           placeholder={getReferenceLabel(editRow.family)}
//           value={editRow.referenceNumber}
//           onChange={(e) => setEditRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
//         />
//       );
//     }
//     return text;
//   };

//   const renderDateCell = (dateValue, record) => {
//     if (record._id === "new-row") {
//       return (
//         <label className="flex items-center gap-1 cursor-pointer text-blue-600">
//           <PaperClipOutlined />
//           <span className="text-xs truncate max-w-[110px]">
//             {newRow.fileName || "Choisir un fichier"}
//           </span>
//           <input
//             type="file"
//             className="hidden"
//             accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
//             onChange={handleNewFileChange}
//           />
//         </label>
//       );
//     }
//     if (record._id === editingId) {
//       return (
//         <label className="flex items-center gap-1 cursor-pointer text-blue-600">
//           <PaperClipOutlined />
//           <span className="text-xs truncate max-w-[110px]">
//             {editRow.fileName || "Remplacer le fichier"}
//           </span>
//           <input
//             type="file"
//             className="hidden"
//             accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
//             onChange={handleEditFileChange}
//           />
//         </label>
//       );
//     }
//     return dateValue ? new Date(dateValue).toLocaleDateString() : "";
//   };

//   const renderActionsCell = (_, record) => {
//     if (record._id === "new-row") {
//       return (
//         <Space size="middle">
//           <Button
//             type="link"
//             icon={<CheckOutlined />}
//             onClick={handleSaveNew}
//             loading={loading}
//           />
//           <Button type="link" danger icon={<CloseOutlined />} onClick={cancelAdding} />
//         </Space>
//       );
//     }
//     if (record._id === editingId) {
//       return (
//         <Space size="middle">
//           <Button
//             type="link"
//             icon={<CheckOutlined />}
//             onClick={() => handleSaveEdit(record._id)}
//             loading={loading}
//           />
//           <Button type="link" danger icon={<CloseOutlined />} onClick={cancelEditing} />
//         </Space>
//       );
//     }
//     return (
//       <Space size="middle">
//         <Button
//           type="link"
//           icon={<EyeOutlined />}
//           onClick={() => window.open(record.firebaseStorageUrl, "_blank")}
//         />
//         <Button type="link" icon={<EditOutlined />} onClick={() => startEditing(record)} />
//         <Button
//           type="link"
//           danger
//           icon={<DeleteOutlined />}
//           onClick={() => handleDeleteDocument(record._id)}
//         />
//       </Space>
//     );
//   };

//   const columns = [
//     {
//       title: "Famille de document",
//       dataIndex: "family",
//       key: "family",
//       render: renderFamilyCell,
//     },
//     {
//       title: "Type de document",
//       dataIndex: "type",
//       key: "type",
//       render: renderTypeCell,
//     },
//     {
//       title: "N° de référance",
//       dataIndex: "referenceNumber",
//       key: "referenceNumber",
//       render: renderReferenceCell,
//     },
//     {
//       title: "Date de l'ajout",
//       dataIndex: "uploadDate",
//       key: "uploadDate",
//       render: renderDateCell,
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: renderActionsCell,
//     },
//   ];

//   const pagedData = filteredDocuments.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const dataSource = isAdding
//     ? [{ _id: "new-row", key: "new-row" }, ...pagedData]
//     : pagedData;

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <Button
//           type="primary"
//           onClick={startAdding}
//           icon={<UploadOutlined />}
//           disabled={isAdding}
//         >
//           AJOUTER UN DOCUMENT
//         </Button>
//       </div>

//       <Table
//         columns={columns.map((col) => ({
//           ...col,
//           title: (
//             <div className="flex flex-col items-center">
//               <div className="text-xs">{col.title}</div>
//             </div>
//           ),
//         }))}
//         dataSource={dataSource}
//         pagination={{
//           current: currentPage,
//           pageSize,
//           total: filteredDocuments.length,
//           onChange: (page, size) => {
//             setCurrentPage(page);
//             setPageSize(size);
//           },
//           showSizeChanger: true,
//           pageSizeOptions: ["10", "20", "30", "50", "100"],
//           showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
//         }}
//         loading={loading}
//         bordered
//         rowKey="_id"
//       />
//     </div>
//   );
// };

// export default DocumentTabContent;
import React, { useState, useEffect } from "react";
import { Button, Select, Input, Table, Modal, Space, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useParams } from "react-router-dom";

const { Option } = Select;

// Document type lists per family (unchanged from before)
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
    "Photo",
    "Permis de conduire",
    "Carte d'identité",
    "RIB",
    "Carte grise",
    "Certificat provisoire d'immatriculation (CPI)",
    "Bulletin d'adhésion",
    "Conditions particulières",
    "Conditions générales",
    "Mandat SEPA",
    "Fiche d'information et de conseil",
    "Attestation sur l'honneur de non-sinistralité",
    "Cession",
    "Relevé d'information",
    "Relevé de sinistres",
    "Demande d'assurance",
    "Mandat de résiliation",
    "Lettre recommandée électronique de résiliation (LRE)",
    "Constat amiable",
    "Contrôle technique",
    "Photographie",
    "Devis",
    "Facture",
    "Courrier",
    "Avenant",
    "Déclaration de sinistre",
    "Autre document",
  ],
  comptabilite: ["Documents comptabilité"],
  reclamation: ["Numéro de réclamation", "Autre document"],
  sinistre: ["Autre document"],
  // sinistre: ["Numéro de sinistre", "Autre document"],

  autres: ["Déclaration de sinistre", "Autre document"],
};

const familyLabels = {
  devis: "Documents devis/contrats",
  comptabilite: "Document comptabilité",
  sinistre: "Autre document",
};

const emptyRow = () => ({
  family: undefined,
  type: undefined,
  referenceNumber: "",
  documentName: "",
  file: null,
  fileName: "",
});

// Helper function to format date with time
const formatDateWithTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const DocumentTabContent = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Filter states
  const [familyFilter, setFamilyFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [referenceFilter, setReferenceFilter] = useState("");

  // Inline "add new document" row state
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState(emptyRow());

  // Inline "edit existing document" row state
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(emptyRow());

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/documents/${id}`);
      console.log("Fetched documents:", response.data);
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  // Apply filters whenever filters or documents change
  useEffect(() => {
    let filtered = [...documents];

    // Filter by family
    if (familyFilter.length > 0) {
      filtered = filtered.filter(doc => familyFilter.includes(doc.family));
    }

    // Filter by type
    if (typeFilter.length > 0) {
      filtered = filtered.filter(doc => typeFilter.includes(doc.type));
    }

    // Filter by reference number (search)
    if (referenceFilter) {
      const searchTerm = referenceFilter.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.referenceNumber && doc.referenceNumber.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [documents, familyFilter, typeFilter, referenceFilter]);

  const getReferenceLabel = (family) => {
    switch (family) {
      case "devis":
        return "Référence document";
      case "comptabilite":
        return "Numéro de document comptabilité";
      case "autres":
        return "Référence document";
      default:
        return "N° de référence";
    }
  };

  const shouldShowDocumentNameField = (type) => type === "Autre document";

  // ---------- Add new row ----------
  const startAdding = () => {
    setEditingId(null); // don't allow adding + editing at once
    setIsAdding(true);
    setNewRow(emptyRow());
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewRow(emptyRow());
  };

  const handleNewFamilyChange = (value) => {
    setNewRow((prev) => ({ ...prev, family: value, type: undefined }));
  };

  const handleNewFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRow((prev) => ({ ...prev, file, fileName: file.name }));
    }
  };

  const handleSaveNew = async () => {
    if (!newRow.family || !newRow.type) {
      message.error("Merci de choisir une famille et un type de document");
      return;
    }
    if (!newRow.file) {
      message.error("Merci de sélectionner un fichier");
      return;
    }
    if (shouldShowDocumentNameField(newRow.type) && !newRow.documentName) {
      message.error("Merci d'indiquer le nom du document");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", newRow.file);
      formData.append("family", newRow.family);
      formData.append("type", newRow.type);
      if (newRow.referenceNumber) {
        formData.append("referenceNumber", newRow.referenceNumber);
      }
      if (newRow.documentName) {
        formData.append("documentName", newRow.documentName);
      }

      const response = await axios.post(`/documents/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 45000,
      });

      if (response.data.success) {
        const newDocument = { ...response.data.data, key: response.data.data._id };
        setDocuments((prev) => [newDocument, ...prev]);
        message.success("Document ajouté avec succès");
        cancelAdding();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.code === "ECONNABORTED") {
        message.error("Timeout - le serveur met trop de temps à répondre");
      } else if (error.response?.status === 413) {
        message.error("Fichier trop volumineux (max 10MB)");
      } else {
        message.error(error.response?.data?.message || "Erreur lors de l'upload");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Edit existing row ----------
  const startEditing = (record) => {
    setIsAdding(false); // don't allow adding + editing at once
    setEditingId(record._id);
    setEditRow({
      family: record.family,
      type: record.type,
      referenceNumber: record.referenceNumber || "",
      documentName: record.documentName || "",
      file: null,
      fileName: "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRow(emptyRow());
  };

  const handleEditFamilyChange = (value) => {
    setEditRow((prev) => ({ ...prev, family: value, type: undefined }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditRow((prev) => ({ ...prev, file, fileName: file.name }));
    }
  };

  const handleSaveEdit = async (documentId) => {
    if (!editRow.family || !editRow.type) {
      message.error("Merci de choisir une famille et un type de document");
      return;
    }
    if (shouldShowDocumentNameField(editRow.type) && !editRow.documentName) {
      message.error("Merci d'indiquer le nom du document");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("family", editRow.family);
      formData.append("type", editRow.type);
      formData.append("referenceNumber", editRow.referenceNumber || "");
      formData.append("documentName", editRow.documentName || "");
      if (editRow.file) {
        formData.append("file", editRow.file);
      }

      const response = await axios.put(`/documents/${documentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 45000,
      });

      if (response.data.success) {
        const updated = response.data.data;
        const merge = (list) =>
          list.map((doc) => (doc._id === documentId ? { ...doc, ...updated } : doc));
        setDocuments(merge);
        message.success("Document modifié avec succès");
        cancelEditing();
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error(error.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Delete ----------
  const handleDeleteDocument = async (documentId) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce document?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await axios.delete(`/documents/${documentId}`);
          setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
          message.success("Document supprimé avec succès");
        } catch (error) {
          console.error("Error deleting document:", error);
        }
      },
    });
  };

  // Get unique values for filters
  const getUniqueFamilies = () => {
    const families = documents.map(doc => doc.family).filter(Boolean);
    return [...new Set(families)];
  };

  const getUniqueTypes = () => {
    const types = documents.map(doc => doc.type).filter(Boolean);
    return [...new Set(types)];
  };

  // ---------- Column renderers ----------

  const renderFamilyCell = (text, record) => {
    if (record._id === "new-row") {
      return (
        <Select
          placeholder="Famille de document"
          style={{ width: 170 }}
          value={newRow.family}
          onChange={handleNewFamilyChange}
        >
          {Object.keys(familyLabels).map((fam) => (
            <Option key={fam} value={fam}>
              {familyLabels[fam]}
            </Option>
          ))}
        </Select>
      );
    }
    if (record._id === editingId) {
      return (
        <Select
          placeholder="Famille de document"
          style={{ width: 170 }}
          value={editRow.family}
          onChange={handleEditFamilyChange}
        >
          {Object.keys(familyLabels).map((fam) => (
            <Option key={fam} value={fam}>
              {familyLabels[fam]}
            </Option>
          ))}
        </Select>
      );
    }
    return familyLabels[text] || text;
  };

  // const renderTypeCell = (text, record) => {
  //   if (record._id === "new-row") {
  //     return (
  //       <div className="flex flex-col gap-1">
  //         <Select
  //           placeholder="Type de document"
  //           style={{ width: 200 }}
  //           disabled={!newRow.family}
  //           value={newRow.type}
  //           onChange={(value) => setNewRow((prev) => ({ ...prev, type: value }))}
  //         >
  //           {(newRow.family ? documentTypes[newRow.family] : []).map((t) => (
  //             <Option key={t} value={t}>
  //               {t}
  //             </Option>
  //           ))}
  //         </Select>
  //         {shouldShowDocumentNameField(newRow.type) && (
  //           <Input
  //             placeholder="Nom du document"
  //             size="small"
  //             value={newRow.documentName}
  //             onChange={(e) => setNewRow((prev) => ({ ...prev, documentName: e.target.value }))}
  //           />
  //         )}
  //       </div>
  //     );
  //   }
  //   if (record._id === editingId) {
  //     return (
  //       <div className="flex flex-col gap-1">
  //         <Select
  //           placeholder="Type de document"
  //           style={{ width: 200 }}
  //           disabled={!editRow.family}
  //           value={editRow.type}
  //           onChange={(value) => setEditRow((prev) => ({ ...prev, type: value }))}
  //         >
  //           {(editRow.family ? documentTypes[editRow.family] : []).map((t) => (
  //             <Option key={t} value={t}>
  //               {t}
  //             </Option>
  //           ))}
  //         </Select>
  //         {shouldShowDocumentNameField(editRow.type) && (
  //           <Input
  //             placeholder="Nom du document"
  //             size="small"
  //             value={editRow.documentName}
  //             onChange={(e) => setEditRow((prev) => ({ ...prev, documentName: e.target.value }))}
  //           />
  //         )}
  //       </div>
  //     );
  //   }
  //   return text;
  // };
  const renderTypeCell = (text, record) => {
    if (record._id === "new-row") {
      return (
        <div className="flex flex-col gap-1">
          <Select
            placeholder="Type de document"
            style={{ width: 200 }}
            disabled={!newRow.family}
            value={newRow.type}
            onChange={(value) => setNewRow((prev) => ({ ...prev, type: value }))}
          >
            {(newRow.family && documentTypes[newRow.family] ? documentTypes[newRow.family] : []).map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          {shouldShowDocumentNameField(newRow.type) && (
            <Input
              placeholder="Nom du document"
              size="small"
              value={newRow.documentName}
              onChange={(e) => setNewRow((prev) => ({ ...prev, documentName: e.target.value }))}
            />
          )}
        </div>
      );
    }
    if (record._id === editingId) {
      return (
        <div className="flex flex-col gap-1">
          <Select
            placeholder="Type de document"
            style={{ width: 200 }}
            disabled={!editRow.family}
            value={editRow.type}
            onChange={(value) => setEditRow((prev) => ({ ...prev, type: value }))}
          >
            {(editRow.family && documentTypes[editRow.family] ? documentTypes[editRow.family] : []).map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
          {shouldShowDocumentNameField(editRow.type) && (
            <Input
              placeholder="Nom du document"
              size="small"
              value={editRow.documentName}
              onChange={(e) => setEditRow((prev) => ({ ...prev, documentName: e.target.value }))}
            />
          )}
        </div>
      );
    }
    return text;
  };
  const renderReferenceCell = (text, record) => {
    if (record._id === "new-row") {
      return (
        <Input
          placeholder={getReferenceLabel(newRow.family)}
          value={newRow.referenceNumber}
          onChange={(e) => setNewRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
        />
      );
    }
    if (record._id === editingId) {
      return (
        <Input
          placeholder={getReferenceLabel(editRow.family)}
          value={editRow.referenceNumber}
          onChange={(e) => setEditRow((prev) => ({ ...prev, referenceNumber: e.target.value }))}
        />
      );
    }
    return text;
  };

  // Updated date renderer with HH:MM and update date
  // const renderDateCell = (dateValue, record) => {
  //   if (record._id === "new-row") {
  //     return (
  //       <label className="flex items-center gap-1 cursor-pointer text-blue-600">
  //         <PaperClipOutlined />
  //         <span className="text-xs truncate max-w-[110px]">
  //           {newRow.fileName || "Choisir un fichier"}
  //         </span>
  //         <input
  //           type="file"
  //           className="hidden"
  //           accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
  //           onChange={handleNewFileChange}
  //         />
  //       </label>
  //     );
  //   }
  //   if (record._id === editingId) {
  //     return (
  //       <label className="flex items-center gap-1 cursor-pointer text-blue-600">
  //         <PaperClipOutlined />
  //         <span className="text-xs truncate max-w-[110px]">
  //           {editRow.fileName || "Remplacer le fichier"}
  //         </span>
  //         <input
  //           type="file"
  //           className="hidden"
  //           accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
  //           onChange={handleEditFileChange}
  //         />
  //       </label>
  //     );
  //   }
    
  //   // For existing documents - show upload date with time and update date if modified
  //   return (
  //     <div className="flex flex-col">
  //       <div className="text-sm">
  //         {formatDateWithTime(record.uploadDate)}
  //       </div>
  //       {record.updateDate && record.updateDate !== record.uploadDate && (
  //         <div className="text-xs text-gray-500 mt-1 border-t border-gray-200 pt-1">
  //           <span className="font-medium">Mise à jour:</span> {formatDateWithTime(record.updateDate)}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
  // Updated date renderer with HH:MM and update date
const renderDateCell = (dateValue, record) => {
  // Handle "new row" case (adding a new document)
  if (record._id === "new-row") {
    return (
      <label className="flex items-center gap-1 cursor-pointer text-blue-600">
        <PaperClipOutlined />
        <span className="text-xs truncate max-w-[110px]">
          {newRow.fileName || "Choisir un fichier"}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleNewFileChange}
        />
      </label>
    );
  }
  
  // Handle "editing row" case (editing an existing document)
  if (record._id === editingId) {
    return (
      <label className="flex items-center gap-1 cursor-pointer text-blue-600">
        <PaperClipOutlined />
        <span className="text-xs truncate max-w-[110px]">
          {editRow.fileName || "Remplacer le fichier"}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleEditFileChange}
        />
      </label>
    );
  }
  
  // For existing documents - show upload date with time and update date if modified
  const uploadDateFormatted = formatDateWithTime(record.uploadDate);
  const updateDateFormatted = record.updateDate ? formatDateWithTime(record.updateDate) : null;
  
  return (
    <div className="flex flex-col">
      <div className="text-sm">
        {uploadDateFormatted || "Date non disponible"}
      </div>
      {updateDateFormatted && record.updateDate !== record.uploadDate && (
        <div className="text-xs text-blue-600 mt-1 border-t border-gray-200 pt-1">
          <span className="font-medium">Mise à jour:</span> {updateDateFormatted}
        </div>
      )}
    </div>
  );
};

  const renderActionsCell = (_, record) => {
    if (record._id === "new-row") {
      return (
        <Space size="middle">
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={handleSaveNew}
            loading={loading}
          />
          <Button type="link" danger icon={<CloseOutlined />} onClick={cancelAdding} />
        </Space>
      );
    }
    if (record._id === editingId) {
      return (
        <Space size="middle">
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={() => handleSaveEdit(record._id)}
            loading={loading}
          />
          <Button type="link" danger icon={<CloseOutlined />} onClick={cancelEditing} />
        </Space>
      );
    }
    return (
      <Space size="middle">
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => window.open(record.firebaseStorageUrl, "_blank")}
        />
        <Button type="link" icon={<EditOutlined />} onClick={() => startEditing(record)} />
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteDocument(record._id)}
        />
      </Space>
    );
  };

  const columns = [
    {
      title: "Famille de document",
      dataIndex: "family",
      key: "family",
      render: renderFamilyCell,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            mode="multiple"
            placeholder="Filtrer par famille"
            style={{ width: 200 }}
            value={selectedKeys.length > 0 ? selectedKeys : familyFilter}
            onChange={(values) => {
              setSelectedKeys(values);
              setFamilyFilter(values);
              confirm({ closeDropdown: false });
            }}
          >
            {getUniqueFamilies().map(fam => (
              <Option key={fam} value={fam}>
                {familyLabels[fam] || fam}
              </Option>
            ))}
          </Select>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => {
                setSelectedKeys(familyFilter);
                confirm();
              }}
            >
              OK
            </Button>
            <Button 
              size="small"
              onClick={() => {
                setSelectedKeys([]);
                setFamilyFilter([]);
                clearFilters();
                confirm();
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      ),
      filterMultiple: true,
      onFilter: (value, record) => familyFilter.includes(record.family),
      filteredValue: familyFilter.length > 0 ? familyFilter : null,
    },
    {
      title: "Type de document",
      dataIndex: "type",
      key: "type",
      render: renderTypeCell,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            mode="multiple"
            placeholder="Filtrer par type"
            style={{ width: 200 }}
            value={selectedKeys.length > 0 ? selectedKeys : typeFilter}
            onChange={(values) => {
              setSelectedKeys(values);
              setTypeFilter(values);
              confirm({ closeDropdown: false });
            }}
          >
            {getUniqueTypes().map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => {
                setSelectedKeys(typeFilter);
                confirm();
              }}
            >
              OK
            </Button>
            <Button 
              size="small"
              onClick={() => {
                setSelectedKeys([]);
                setTypeFilter([]);
                clearFilters();
                confirm();
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      ),
      filterMultiple: true,
      onFilter: (value, record) => typeFilter.includes(record.type),
      filteredValue: typeFilter.length > 0 ? typeFilter : null,
    },
    {
      title: "N° de référance",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      render: renderReferenceCell,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Rechercher par référence"
            value={selectedKeys[0] || referenceFilter}
            onChange={(e) => {
              setSelectedKeys(e.target.value ? [e.target.value] : []);
              setReferenceFilter(e.target.value);
              confirm({ closeDropdown: false });
            }}
            onPressEnter={() => confirm()}
            style={{ width: 200, marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              type="primary" 
              size="small"
              onClick={() => confirm()}
            >
              OK
            </Button>
            <Button 
              size="small"
              onClick={() => {
                setSelectedKeys([]);
                setReferenceFilter("");
                clearFilters();
                confirm();
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        if (!referenceFilter) return true;
        return record.referenceNumber && 
               record.referenceNumber.toLowerCase().includes(referenceFilter.toLowerCase());
      },
      filteredValue: referenceFilter ? [referenceFilter] : null,
    },
    {
      title: "Date de l'ajout / Mise à jour",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: renderDateCell,
    },
    {
      title: "Actions",
      key: "actions",
      render: renderActionsCell,
    },
  ];

  // Get the data for the table (excluding new-row from filters)
  const tableData = documents.filter(doc => doc._id !== "new-row");

  // Calculate paginated data
  const pagedData = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const dataSource = isAdding
    ? [{ _id: "new-row", key: "new-row" }, ...pagedData]
    : pagedData;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          onClick={startAdding}
          icon={<UploadOutlined />}
          disabled={isAdding}
        >
          AJOUTER UN DOCUMENT
        </Button>
      </div>

      <Table
        columns={columns.map((col) => ({
          ...col,
          title: (
            <div className="flex flex-col items-center">
              <div className="text-xs">{col.title}</div>
            </div>
          ),
        }))}
        dataSource={dataSource}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredDocuments.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        loading={loading}
        bordered
        rowKey="_id"
      />
    </div>
  );
};

export default DocumentTabContent;