// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Form,
//   Input,
//   Select,
//   Table,
//   Modal,
//   Space,
//   message,
//   Spin,
//   Tag,
// } from "antd";
// import {
//   UploadOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   DownloadOutlined,
//   CloseOutlined,
//   FileTextOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import dayjs from "dayjs";

// const { Option } = Select;

// const DevoirConseil = () => {
//   const [documents, setDocuments] = useState([]);
//   const [filteredDocuments, setFilteredDocuments] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [uploadedDocument, setUploadedDocument] = useState(null);
//   const [form] = Form.useForm();
//   const [pageSize, setPageSize] = useState(30);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const { id } = useParams(); // Get chatId from URL params
  
//   // Search parameters
//   const [searchParams, setSearchParams] = useState({
//     documentType: "",
//     referenceNumber: "",
//   });



//   // Fetch only Devoir de Conseil documents for this lead
//   const fetchDocuments = async () => {
//     try {
//       if (!id) {
//         message.warning("Aucun chat sélectionné");
//         return;
//       }

//       setLoading(true);
//       const response = await axios.get(`/documents/${id}`);
      
//       // Filter ONLY for Devoir de Conseil documents
//       const devoirDocs = response.data.filter(doc => 
//         doc.family === 'Devoir de Conseil'
//       );
      
//       setDocuments(devoirDocs);
//       setFilteredDocuments(devoirDocs);
//     } catch (error) {
//       console.error("Error fetching Devoir de Conseil documents:", error);
//       message.error("Erreur lors du chargement des documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       fetchDocuments();
//     }
//   }, [id]);

//   // Apply search filters
//   const handleSearch = (field, value) => {
//     const newSearchParams = { ...searchParams, [field]: value };
//     setSearchParams(newSearchParams);

//     const filtered = documents.filter((doc) => {
//       return (
//         (!newSearchParams.documentType ||
//           doc.type === newSearchParams.documentType) &&
//         (!newSearchParams.referenceNumber ||
//           (doc.referenceNumber &&
//             doc.referenceNumber.toLowerCase().includes(newSearchParams.referenceNumber.toLowerCase())))
//       );
//     });
//     setFilteredDocuments(filtered);
//     setCurrentPage(1); // Reset to first page
//   };

//   // Open modal to add new document
//   const showModal = () => {
//     if (!id) {
//       message.warning("Veuillez sélectionner un chat d'abord");
//       return;
//     }
//     setIsModalVisible(true);
//   };

//   // Close modal and reset form
//   const handleCancel = () => {
//     setIsModalVisible(false);
//     form.resetFields();
//     setUploadedDocument(null);
//   };

//   // Handle type change
//   const handleTypeChange = (value) => {
//     form.setFieldsValue({ documentName: undefined }); // Reset document name when type changes
//   };

//   // Handle file upload
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file size (max 10MB)
//       if (file.size > 10 * 1024 * 1024) {
//         message.error("Le fichier ne doit pas dépasser 10MB");
//         return;
//       }

//       // Validate file type
//       const allowedTypes = [
//         "application/pdf",
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ];
      
//       if (!allowedTypes.includes(file.type)) {
//         message.error("Type de fichier non supporté. Utilisez PDF, JPG, PNG ou DOC/DOCX");
//         return;
//       }

//       setUploadedDocument({
//         file: file,
//         name: file.name,
//       });
//     }
//   };

//   // Handle form submission
//   const handleFormSubmit = async (values) => {
//     try {
//       console.log("=== Devoir de Conseil: Starting form submission ===");
//       console.log("Form values:", values);
      
//       if (!uploadedDocument?.file) {
//         message.error("Veuillez sélectionner un fichier");
//         return;
//       }

//       if (!id) {
//         message.error("Chat ID manquant");
//         return;
//       }

//       setLoading(true);

//       // Create FormData - family is ALWAYS "Devoir de Conseil"
//       const formData = new FormData();
//       formData.append('file', uploadedDocument.file);
//       formData.append('family', 'Devoir de Conseil'); // Fixed family
//       formData.append('type', values.type);
      
//       // Reference number is required for all Devoir de Conseil documents
//       if (values.referenceNumber) {
//         formData.append('referenceNumber', values.referenceNumber);
//       }
      
//       // Document name only required for "Autre document"
//       if (values.type === 'Autre document' && values.documentName) {
//         formData.append('documentName', values.documentName);
//       }

//       console.log("Sending request to backend...");
//       const response = await axios.post(`/documents/${id}`, formData, {
//         headers: { 
//           "Content-Type": "multipart/form-data",
//         },
//         timeout: 45000,
//       });

//       console.log("Backend response:", response.data);

//       if (response.data.success) {
//         const newDocument = { 
//           ...response.data.data, 
//           key: response.data.data._id,
//           family: 'Devoir de Conseil' // Ensure family is set
//         };

//         setDocuments(prev => [...prev, newDocument]);
//         setFilteredDocuments(prev => [...prev, newDocument]);

//         message.success("Document Devoir de Conseil ajouté avec succès");
//         handleCancel();
//       } else {
//         throw new Error(response.data.message || "Upload failed");
//       }

//     } catch (error) {
//       console.error("Submission error:", error);
      
//       if (error.code === 'ECONNABORTED') {
//         message.error("Timeout - le serveur met trop de temps à répondre");
//       } else if (error.response?.status === 400) {
//         message.error(error.response.data?.message || "Erreur de validation");
//       } else if (error.response?.status === 413) {
//         message.error("Fichier trop volumineux (max 10MB)");
//       } else if (error.response?.status === 500) {
//         message.error("Erreur serveur - contactez l'administrateur");
//       } else {
//         message.error(error.response?.data?.message || "Erreur lors de l'upload");
//       }
//     } finally {
//       setLoading(false);
//       console.log("=== Devoir de Conseil: Form submission finished ===");
//     }
//   };

//   // Handle document deletion
//   const handleDeleteDocument = async (documentId) => {
//     Modal.confirm({
//       title: 'Confirmer la suppression',
//       content: 'Êtes-vous sûr de vouloir supprimer ce document?',
//       okText: 'Oui',
//       cancelText: 'Non',
//       onOk: async () => {
//         try {
//           await axios.delete(`/documents/${documentId}`);
          
//           // Remove from state
//           setDocuments(prev => prev.filter(doc => doc._id !== documentId));
//           setFilteredDocuments(prev => prev.filter(doc => doc._id !== documentId));
          
//           message.success("Document supprimé avec succès");
//         } catch (error) {
//           console.error("Error deleting document:", error);
//           message.error("Erreur lors de la suppression du document");
//         }
//       }
//     });
//   };

//   // Handle document view
//   const handleViewDocument = (document) => {
//     if (document.firebaseStorageUrl) {
//       window.open(document.firebaseStorageUrl, "_blank");
//     } else {
//       message.warning("Lien du document non disponible");
//     }
//   };

//   // Handle download
//   const handleDownloadDocument = (document) => {
//     if (document.firebaseStorageUrl) {
//       const link = document.createElement('a');
//       link.href = document.firebaseStorageUrl;
//       link.download = document.originalFileName || document.documentName || 'document';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } else {
//       message.warning("Lien du document non disponible");
//     }
//   };

//   // Table columns - inspired by your DocumentTabContent but simplified
//   const columns = [
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Type de document</div>
//         </div>
//       ),
//       dataIndex: "type",
//       key: "type",
//       width: 200,
//       render: (text) => (
//         <Tag color="blue" style={{ margin: 0, fontSize: '12px' }}>
//           {text}
//         </Tag>
//       ),
//     },
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Numéro de référence</div>
//         </div>
//       ),
//       dataIndex: "referenceNumber",
//       key: "referenceNumber",
//       width: 150,
//       render: (text) => text || <span className="text-gray-400">-</span>,
//     },
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Nom du document</div>
//         </div>
//       ),
//       dataIndex: "documentName",
//       key: "documentName",
//       width: 180,
//       render: (text, record) => text || record.originalFileName || "-",
//     },
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Date de l'ajout</div>
//         </div>
//       ),
//       dataIndex: "uploadDate",
//       key: "uploadDate",
//       width: 120,
//       render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : "-",
//       sorter: (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate),
//     },
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Famille</div>
//         </div>
//       ),
//       dataIndex: "family",
//       key: "family",
//       width: 100,
//       render: () => (
//         <Tag color="purple" style={{ margin: 0, fontSize: '12px' }}>
//           Devoir de Conseil
//         </Tag>
//       ),
//     },
//     {
//       title: (
//         <div className="flex flex-col items-center">
//           <div className="text-xs">Actions</div>
//         </div>
//       ),
//       key: "actions",
//       width: 150,
//       fixed: 'right',
//       render: (_, record) => (
//         <Space size="small">
//           <Button
//             type="link"
//             icon={<EyeOutlined />}
//             onClick={() => handleViewDocument(record)}
//             title="Voir le document"
//             size="small"
//           />
//           <Button
//             type="link"
//             icon={<DownloadOutlined />}
//             onClick={() => handleDownloadDocument(record)}
//             title="Télécharger"
//             size="small"
//           />
//           <Button
//             type="link"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDeleteDocument(record._id)}
//             title="Supprimer"
//             size="small"
//           />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-4">
//       {/* Header with Add Button */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center gap-3">
//           <FileTextOutlined className="text-purple-600 text-lg" />
//           <div>
//             <h2 className="font-medium text-lg">Documents Devoir de Conseil</h2>
//             <p className="text-xs text-gray-500">Documents réglementaires et fiches de conseil</p>
//           </div>
//         </div>
        
//         <Button 
//           type="primary" 
//           onClick={showModal} 
//           icon={<UploadOutlined />}
//           disabled={!id}
//         >
//           AJOUTER UN DOCUMENT
//         </Button>
//       </div>

//       {/* Search Filters */}
//       <div className="flex items-center gap-4 mb-4">
//         <div className="flex-1">
//           <div className="text-xs font-medium mb-1">Type de document</div>
//           <Input
//             placeholder="Rechercher par Type de document"
//             // onChange={(e) => handleSearch("referenceNumber", e.target.value)}
//             // value={searchParams.referenceNumber}
//           />
//         </div>

//         <div className="flex-1">
//           <div className="text-xs font-medium mb-1">Numéro de référence</div>
//           <Input
//             placeholder="Rechercher par référence..."
//             onChange={(e) => handleSearch("referenceNumber", e.target.value)}
//             value={searchParams.referenceNumber}
//           />
//         </div>
//       </div>

//       {/* Documents Count */}
//       <div className="mb-3">
//         <div className="text-sm text-gray-600">
//           <span className="font-medium">{filteredDocuments.length}</span> document(s) trouvé(s)
//         </div>
//       </div>

//       {/* Documents Table */}
//       <Table
//         columns={columns}
//         dataSource={filteredDocuments.slice(
//           (currentPage - 1) * pageSize,
//           currentPage * pageSize
//         )}
//         pagination={{
//           current: currentPage,
//           pageSize,
//           total: filteredDocuments.length,
//           onChange: (page, pageSize) => {
//             setCurrentPage(page);
//             setPageSize(pageSize);
//           },
//           showSizeChanger: true,
//           pageSizeOptions: ["10", "20", "30", "50", "100"],
//           showTotal: (total, range) =>
//             `${range[0]}-${range[1]} sur ${total} documents`,
//         }}
//         loading={loading}
//         bordered
//         rowKey="_id"
//         size="middle"
//         scroll={{ x: 900 }}
//         locale={{ emptyText: "Aucun document Devoir de Conseil trouvé" }}
//       />

//       {/* Add Document Modal (Right Sidebar Style - Inspired by your design) */}
//       <Modal
//         title={
//           <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
//             <span className="font-medium text-sm">Ajouter un document Devoir de Conseil</span>
//             <button
//               onClick={handleCancel}
//               className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
//             >
//               <CloseOutlined className="text-xs" />
//             </button>
//           </div>
//         }
//         open={isModalVisible}
//         onCancel={handleCancel}
//         footer={null}
//         width="30%"
//         style={{
//           position: "fixed",
//           right: 0,
//           top: 0,
//           bottom: 0,
//           height: "100vh",
//           margin: 0,
//           padding: 0,
//           overflow: "hidden",
//         }}
//         bodyStyle={{
//           height: "calc(100vh - 49px)",
//           padding: 0,
//           margin: 0,
//           overflowY: 'auto',
//         }}
//         maskStyle={{
//           backgroundColor: "rgba(0, 0, 0, 0.1)",
//         }}
//         closeIcon={null}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           className="p-4"
//           onFinish={handleFormSubmit}
//           initialValues={{ family: 'Devoir de Conseil' }}
//         >
//           {/* Hidden family field - always Devoir de Conseil */}
//           <Form.Item name="family" hidden>
//             <Input type="hidden" value="Devoir de Conseil" />
//           </Form.Item>

//           <Form.Item
//             name="type"
//             label="Type de document"
//             rules={[{ required: true, message: "Ce champ est obligatoire" }]}
//           >
//                <Input  placeholder="Type de document" value="Devoir de Conseil" />
//           </Form.Item>

//           {/* Reference Number - Always required for Devoir de Conseil */}
//           <Form.Item
//             name="referenceNumber"
//             label="Numéro de référence"
//             rules={[{ required: true, message: "Ce champ est obligatoire" }]}
//           >
//             <Input placeholder="Ex: DC-2024-001, CONTRAT-123, etc." />
//           </Form.Item>

//           {/* Document Name - Only for "Autre document" */}
//           <Form.Item
//             noStyle
//             shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
//           >
//             {({ getFieldValue }) => 
//               getFieldValue('type') === 'Autre document' ? (
//                 <Form.Item
//                   name="documentName"
//                   label="Nom du document"
//                   rules={[{ required: true, message: "Veuillez entrer le nom du document" }]}
//                 >
//                   <Input placeholder="Entrez le nom du document" />
//                 </Form.Item>
//               ) : null
//             }
//           </Form.Item>

//           {/* File Upload */}
//           <Form.Item
//             name="document"
//             label="Choisissez un document"
//             rules={[{ required: true, message: "Un document est obligatoire" }]}
//             extra="Formats supportés: PDF, JPG, PNG, DOC, DOCX (max 10MB)"
//           >
//             {uploadedDocument ? (
//               <div className="border border-gray-200 rounded p-3 bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <FileTextOutlined className="text-purple-600" />
//                     <div>
//                       <div className="font-medium text-sm">{uploadedDocument.name}</div>
//                       <div className="text-xs text-gray-500">
//                         {(uploadedDocument.file.size / 1024 / 1024).toFixed(2)} MB
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     type="link"
//                     danger
//                     size="small"
//                     onClick={() => setUploadedDocument(null)}
//                     icon={<CloseOutlined />}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div 
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
//                 onClick={() => document.getElementById('devoir-file-upload').click()}
//               >
//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                   id="devoir-file-upload"
//                   disabled={loading}
//                 />
//                 <UploadOutlined className="text-2xl text-gray-400 mb-2" />
//                 <div className="mb-2">
//                   <div className="text-sm font-medium">Cliquez pour sélectionner un fichier</div>
//                   <div className="text-xs text-gray-500 mt-1">ou glissez-déposez ici</div>
//                 </div>
//                 <Button
//                   type="default"
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     document.getElementById('devoir-file-upload').click();
//                   }}
//                 >
//                   Parcourir
//                 </Button>
//               </div>
//             )}
//           </Form.Item>

//           {/* Submit Button */}
//           <div className="flex justify-start mt-4 p-4 border-t">
//             <Button 
//               type="primary" 
//               onClick={() => form.submit()}
//               loading={loading}
//               disabled={!uploadedDocument}
//               className="w-full"
//             >
//               {loading ? 'Ajout en cours...' : 'Ajouter le document'}
//             </Button>
//           </div>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default DevoirConseil;
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Table,
  Modal,
  Space,
  message,
  Spin,
  Tag,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const DevoirConseil = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    documentType: "",
    referenceNumber: "",
    documentName: "", // Added for filtering by document name
  });

  // Fetch only Devoir de Conseil documents for this lead
  const fetchDocuments = async () => {
    try {
      if (!id) {
        message.warning("Aucun chat sélectionné");
        return;
      }

      setLoading(true);
      const response = await axios.get(`/documents/${id}`);
      
      // Filter ONLY for Devoir de Conseil documents
      const devoirDocs = response.data.filter(doc => 
        doc.family === 'Devoir de Conseil'
      );
      
      setDocuments(devoirDocs);
      setFilteredDocuments(devoirDocs);
    } catch (error) {
      console.error("Error fetching Devoir de Conseil documents:", error);
      message.error("Erreur lors du chargement des documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id]);

  // Apply search filters
  const handleSearch = (field, value) => {
    const newSearchParams = { ...searchParams, [field]: value };
    setSearchParams(newSearchParams);

    const filtered = documents.filter((doc) => {
      const matchesType = !newSearchParams.documentType ||
        (doc.type && doc.type.toLowerCase().includes(newSearchParams.documentType.toLowerCase()));
      
      const matchesReference = !newSearchParams.referenceNumber ||
        (doc.referenceNumber && 
         doc.referenceNumber.toLowerCase().includes(newSearchParams.referenceNumber.toLowerCase()));
      
      const matchesName = !newSearchParams.documentName ||
        (doc.documentName && 
         doc.documentName.toLowerCase().includes(newSearchParams.documentName.toLowerCase())) ||
        (doc.originalFileName && 
         doc.originalFileName.toLowerCase().includes(newSearchParams.documentName.toLowerCase()));
      
      return matchesType && matchesReference && matchesName;
    });
    
    setFilteredDocuments(filtered);
    setCurrentPage(1);
  };

  // Open modal to add new document
  const showModal = () => {
    if (!id) {
      message.warning("Veuillez sélectionner un chat d'abord");
      return;
    }
    setIsModalVisible(true);
  };

  // Close modal and reset form
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadedDocument(null);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error("Le fichier ne doit pas dépasser 10MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        message.error("Type de fichier non supporté. Utilisez PDF, JPG, PNG ou DOC/DOCX");
        return;
      }

      setUploadedDocument({
        file: file,
        name: file.name,
      });
    }
  };

  // Handle form submission - FIXED: Now correctly shows uploaded document
  const handleFormSubmit = async (values) => {
    try {
      console.log("=== Devoir de Conseil: Starting form submission ===");
      console.log("Form values:", values);
      
      if (!uploadedDocument?.file) {
        message.error("Veuillez sélectionner un fichier");
        return;
      }

      if (!id) {
        message.error("Chat ID manquant");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('file', uploadedDocument.file);
      formData.append('family', 'Devoir de Conseil');
      formData.append('type', values.type);
      
      // Always include referenceNumber
      if (values.referenceNumber) {
        formData.append('referenceNumber', values.referenceNumber);
      }
      
      // Always include documentName field, even if empty
      formData.append('documentName', values.documentName || '');

      console.log("Sending request to backend...");
      const response = await axios.post(`/documents/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 45000,
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        const newDocument = { 
          ...response.data.data, 
          key: response.data.data._id,
          family: 'Devoir de Conseil'
        };

        // Clear uploaded document state before adding to table
        setUploadedDocument(null);
        
        // Add to both states
        setDocuments(prev => [...prev, newDocument]);
        setFilteredDocuments(prev => [...prev, newDocument]);

        message.success("Document Devoir de Conseil ajouté avec succès");
        handleCancel();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }

    } catch (error) {
      console.error("Submission error:", error);
      
      if (error.code === 'ECONNABORTED') {
        message.error("Timeout - le serveur met trop de temps à répondre");
      } else if (error.response?.status === 400) {
        message.error(error.response.data?.message || "Erreur de validation");
      } else if (error.response?.status === 413) {
        message.error("Fichier trop volumineux (max 10MB)");
      } else if (error.response?.status === 500) {
        message.error("Erreur serveur - contactez l'administrateur");
      } else {
        message.error(error.response?.data?.message || "Erreur lors de l'upload");
      }
    } finally {
      setLoading(false);
      console.log("=== Devoir de Conseil: Form submission finished ===");
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce document?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`/documents/${documentId}`);
          
          setDocuments(prev => prev.filter(doc => doc._id !== documentId));
          setFilteredDocuments(prev => prev.filter(doc => doc._id !== documentId));
          
          message.success("Document supprimé avec succès");
        } catch (error) {
          console.error("Error deleting document:", error);
          message.error("Erreur lors de la suppression du document");
        }
      }
    });
  };

  // Handle document view
  const handleViewDocument = (document) => {
    if (document.firebaseStorageUrl) {
      window.open(document.firebaseStorageUrl, "_blank");
    } else {
      message.warning("Lien du document non disponible");
    }
  };

  // Handle download
  const handleDownloadDocument = (document) => {
    if (document.firebaseStorageUrl) {
      const link = document.createElement('a');
      link.href = document.firebaseStorageUrl;
      link.download = document.originalFileName || document.documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.warning("Lien du document non disponible");
    }
  };

  // Table columns
  const columns = [
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Type de document</div>
        </div>
      ),
      dataIndex: "type",
      key: "type",
      width: 200,
      render: (text) => (
        <Tag color="blue" style={{ margin: 0, fontSize: '12px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Numéro de référence</div>
        </div>
      ),
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      width: 150,
      render: (text) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Nom du document</div>
        </div>
      ),
      dataIndex: "documentName",
      key: "documentName",
      width: 180,
      render: (text, record) => {
        // FIXED: Show documentName if exists, otherwise show originalFileName
        if (text && text.trim() !== "") {
          return text;
        }
        return record.originalFileName || "-";
      },
    },
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Date de l'ajout</div>
        </div>
      ),
      dataIndex: "uploadDate",
      key: "uploadDate",
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : "-",
      sorter: (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate),
    },
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Famille</div>
        </div>
      ),
      dataIndex: "family",
      key: "family",
      width: 100,
      render: () => (
        <Tag color="purple" style={{ margin: 0, fontSize: '12px' }}>
          Devoir de Conseil
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex flex-col items-center">
          <div className="text-xs">Actions</div>
        </div>
      ),
      key: "actions",
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record)}
            title="Voir le document"
            size="small"
          />
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record)}
            title="Télécharger"
            size="small"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDocument(record._id)}
            title="Supprimer"
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <FileTextOutlined className="text-purple-600 text-lg" />
          <div>
            <h2 className="font-medium text-lg">Documents Devoir de Conseil</h2>
            <p className="text-xs text-gray-500">Documents réglementaires et fiches de conseil</p>
          </div>
        </div>
        
        <Button 
          type="primary" 
          onClick={showModal} 
          icon={<UploadOutlined />}
          disabled={!id}
        >
          AJOUTER UN DOCUMENT
        </Button>
      </div>

      {/* Search Filters - FIXED: All filters now work */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="text-xs font-medium mb-1">Type de document</div>
          <Input
            placeholder="Rechercher par Type de document"
            onChange={(e) => handleSearch("documentType", e.target.value)}
            value={searchParams.documentType}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs font-medium mb-1">Numéro de référence</div>
          <Input
            placeholder="Rechercher par référence..."
            onChange={(e) => handleSearch("referenceNumber", e.target.value)}
            value={searchParams.referenceNumber}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs font-medium mb-1">Nom du document</div>
          <Input
            placeholder="Rechercher par nom..."
            onChange={(e) => handleSearch("documentName", e.target.value)}
            value={searchParams.documentName}
          />
        </div>
      </div>

      {/* Documents Count */}
      <div className="mb-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredDocuments.length}</span> document(s) trouvé(s)
        </div>
      </div>

      {/* Documents Table */}
      <Table
        columns={columns}
        dataSource={filteredDocuments.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        )}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredDocuments.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} sur ${total} documents`,
        }}
        loading={loading}
        bordered
        rowKey="_id"
        size="middle"
        scroll={{ x: 900 }}
        locale={{ emptyText: "Aucun document Devoir de Conseil trouvé" }}
      />

      {/* Add Document Modal */}
      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">Ajouter un document Devoir de Conseil</span>
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
          overflowY: 'auto',
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
        closeIcon={null}
        afterClose={() => {
          // FIXED: Reset uploaded document when modal closes
          setUploadedDocument(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className="p-4"
          onFinish={handleFormSubmit}
          initialValues={{ 
            family: 'Devoir de Conseil',
            type: "Fiche d'information et de conseil" // Default value
          }}
        >
          {/* Hidden family field - always Devoir de Conseil */}
          <Form.Item name="family" hidden>
            <Input type="hidden" value="Devoir de Conseil" />
          </Form.Item>

          {/* FIXED: Input for Type de document */}
          <Form.Item
            name="type"
            label="Type de document"
            rules={[{  message: "Ce champ est obligatoire" }]}
          >
            <Input 
              placeholder="Ex: Fiche d'information et de conseil, Conditions générales, etc." 
              // Remove the hardcoded value attribute, let form manage it
            />
          </Form.Item>

          {/* Reference Number */}
          <Form.Item
            name="referenceNumber"
            label="Numéro de référence"
            rules={[{ message: "Ce champ est obligatoire" }]}
          >
            <Input placeholder="Ex: DC-2024-001, CONTRAT-123, etc." />
          </Form.Item>

          {/* Document Name - Available for ALL document types (not just "Autre document") */}
          <Form.Item
            name="documentName"
            label="Nom du document (optionnel)"
            extra="Laissez vide pour utiliser le nom du fichier"
          >
            <Input placeholder="Entrez un nom personnalisé pour le document" />
          </Form.Item>

          {/* File Upload - FIXED: Proper state management */}
          {/* <Form.Item
            label="Choisissez un document"
            required
            validateStatus={uploadedDocument ? 'success' : undefined}
            help={uploadedDocument ? '' : "Veuillez sélectionner un fichier"}
            extra="Formats supportés: PDF, JPG, PNG, DOC, DOCX (max 10MB)"
          >
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('devoir-file-upload').click()}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="devoir-file-upload"
                disabled={loading}
                // key={uploadedDocument ? 'has-file' : 'no-file'} // FIXED: Forces re-render
              />
              
              {uploadedDocument ? (
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-purple-600" />
                      <div>
                        <div className="font-medium text-sm">{uploadedDocument.name}</div>
                        <div className="text-xs text-gray-500">
                          {(uploadedDocument.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="link"
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedDocument(null);
                      }}
                      icon={<CloseOutlined />}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <UploadOutlined className="text-2xl text-gray-400 mb-2" />
                  <div className="mb-2">
                    <div className="text-sm font-medium">Cliquez pour sélectionner un fichier</div>
                    <div className="text-xs text-gray-500 mt-1">ou glissez-déposez ici</div>
                  </div>
                  <Button
                    type="default"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('devoir-file-upload').click();
                    }}
                  >
                    Parcourir
                  </Button>
                </>
              )}
            </div>
          </Form.Item> */}
          <Form.Item
            name="document"
            label="Choisissez un document"
            rules={[{ required: true, message: "Un document est obligatoire" }]}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploadedDocument({
                    file: file,
                    name: file.name,
                  });
                }
              }}
              disabled={loading}
            />
          </Form.Item>

          {/* Submit Button */}
          <div className="flex justify-start mt-4 p-4 border-t">
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              loading={loading}
              disabled={!uploadedDocument}
              className="w-full"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le document'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DevoirConseil;