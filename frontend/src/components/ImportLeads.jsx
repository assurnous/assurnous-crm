import React, { useState } from "react";
import { Upload, Button, message, List, Table, Alert, Modal } from "antd";
import { UploadOutlined, FileExcelOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const ImportLeads = ({ onImportSuccess = () => {} }) => {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [duplicates, setDuplicates] = useState({
    inFile: [],
    inDatabase: []
  });
  const [validationError, setValidationError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const leads = XLSX.utils.sheet_to_json(worksheet);
  
        if (leads.length) {
          const processedLeads = leads.map(lead => {
            // Convert all keys to lowercase
            const formattedLead = {};
            Object.keys(lead).forEach(key => {
              formattedLead[key.toLowerCase()] = lead[key];
            });
  
            // Add required fields based on category
            if (formattedLead.categorie === 'entreprise') {
              formattedLead.activite_entreprise = formattedLead.activite_entreprise || "Non spécifié";
              formattedLead.telephone_entreprise = formattedLead.telephone_entreprise || formattedLead.portable;
              formattedLead.email_entreprise = formattedLead.email_entreprise || formattedLead.email;
            }
  
            // Convert numeric fields
            if (formattedLead.enfants_charge) {
              formattedLead.enfants_charge = Number(formattedLead.enfants_charge);
            }
  
            // Fix enum values
            if (formattedLead.civilite === 'madame') {
              formattedLead.civilite = 'madame';
            } else if (formattedLead.civilite === 'monsieur') {
              formattedLead.civilite = 'monsieur';
            } else if (formattedLead.civilite === 'societe') {
              formattedLead.civilite = 'societe';
            }
  
            return formattedLead;
          });
  
          setFileData(processedLeads);
          setFileName(file.name);
          message.success(`${processedLeads.length} clients chargés`);
        } else {
          message.error("Fichier vide - aucune donnée trouvée");
        }
      } catch (error) {
        message.error("Échec de l'analyse du fichier");
        console.error("Parsing error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const handleTransfer = async () => {
    if (!fileData || fileData.length === 0) {
      message.error("Aucune donnée à transférer");
      return;
    }
  
    setIsImporting(true);
    setValidationError(null);
  
    try {
      const response = await axios.post('/import', fileData, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true // Handle all status codes
      });
  
      if (response.status === 200) {
        message.success(`${response.data.count} clients importés avec succès`);
        onImportSuccess();
        setFileData(null);
        setFileName(null);
      } else {
        // Enhanced error handling
        if (response.data.errors) {
          const errorMessages = response.data.errors.map(err => 
            `${err.path}: ${err.message}`
          ).join('\n');
          setValidationError(errorMessages);
        }
        message.error(response.data.message || "Erreur lors de l'importation");
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      if (error.response) {
        message.error(
          error.response.data?.message || 
          "Erreur lors de l'importation"
        );
        if (error.response.data?.errors) {
          setValidationError(
            error.response.data.errors.map(err => `${err.path}: ${err.message}`).join('\n')
          );
        }
      } else {
        message.error("Erreur de connexion au serveur");
      }
    } finally {
      setIsImporting(false);
    }
  };

//   const handleTransfer = async () => {
//     if (!fileData || fileData.length === 0) {
//       message.error("Aucune donnée à transférer");
//       return;
//     }

//     setIsImporting(true);
//     setValidationError(null);

//     try {
//       const response = await axios.post('/import', fileData, {
//         headers: { 'Content-Type': 'application/json' },
//         validateStatus: (status) => status < 500,
//       });

//       if (response.status === 200) {
//         message.success(`${response.data.count} leads importés avec succès`);
//         onImportSuccess();
//         setFileData(null);
//         setFileName(null);
//       }
//     } catch (error) {
//       console.error("Erreur lors de l'importation:", error);
//       message.error(
//         error.response?.data?.message || 
//         "Erreur inconnue lors de l'importation"
//       );
//     } finally {
//       setIsImporting(false);
//     }
//   };

  const handleRemove = () => {
    setFileData(null);
    setFileName(null);
    setDuplicates({ inFile: [], inDatabase: [] });
    setValidationError(null);
  };

//   const handleUpload = ({ file }) => {
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const binaryStr = event.target.result;
//         const workbook = XLSX.read(binaryStr, { type: "binary" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const leads = XLSX.utils.sheet_to_json(worksheet);

//         if (leads.length) {
//           const processedLeads = leads.map(lead => {
//             if (lead.date && typeof lead.date === "number") {
//               const date = new Date(Math.round((lead.date - 25569) * 86400 * 1000));
//               lead.date = date.toISOString().split("T")[0];
//             }
//             return lead;
//           });

//           setFileData(processedLeads);
//           setFileName(file.name);
//           message.success(`${processedLeads.length} leads chargés`);
//         } else {
//           message.error("Fichier vide - aucune donnée trouvée");
//         }
//       } catch (error) {
//         message.error("Échec de l'analyse du fichier");
//         console.error("Parsing error:", error);
//       }
//     };
//     reader.readAsBinaryString(file);
//   };

  const columns = fileData?.length > 0 
    ? Object.keys(fileData[0]).map(key => ({
        title: (
          <div className="flex flex-col items-center">
            <div className="text-xs">{key.toUpperCase()}</div>
          </div>
        ),
        dataIndex: key,
        key: key,
      }))
    : [];

  const uploadProps = {
    beforeUpload: (file) => {
      const isExcel = file.type.includes("spreadsheetml") || file.type.includes("excel");
      if (!isExcel) {
        message.error(`${file.name} n'est pas un fichier Excel`);
      }
      return isExcel || Upload.LIST_IGNORE;
    },
    customRequest: handleUpload,
    accept: ".xlsx, .xls",
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      {validationError && (
        <Alert
          message="Erreur de validation"
          description={validationError}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {duplicates.inFile.length > 0 && (
        <Alert
          message={`Doublons dans le fichier: ${duplicates.inFile.join(', ')}`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {duplicates.inDatabase.length > 0 && (
        <Alert
          message={`Doublons existants en base: ${duplicates.inDatabase.join(', ')}`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Upload {...uploadProps} showUploadList={false}>
        <Button icon={<UploadOutlined />} block>
          Télécharger le fichier Excel
        </Button>
      </Upload>
      
      {fileName && (
        <div className="mt-4">
          <List
            itemLayout="horizontal"
            dataSource={[fileName]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                  />,
                  <Button type="text" onClick={() => setIsPreviewVisible(true)}>
                    Aperçu
                  </Button>,
                ]}
              >
                <List.Item.Meta 
                  avatar={<FileExcelOutlined />} 
                  title={item} 
                  description={`${fileData?.length || 0} clients trouvés`}
                />
              </List.Item>
            )}
          />
          
          <Button 
            type="primary" 
            onClick={handleTransfer} 
            className="mt-4"
            block
            loading={isImporting}
            disabled={!fileData || fileData.length === 0 || isImporting}
          >
            {isImporting ? 'Importation...' : 'Transférer dans la base de données'}
          </Button>
        </div>
      )}
      
      <Modal
        title={`Aperçu du fichier (${fileData?.length || 0} clients)`}
        visible={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width="100%"
      >
        <Table
          columns={columns}
          dataSource={fileData}
          rowKey={(record) => `${record.phone}-${Math.random()}`}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />
      </Modal>
    </div>
  );
};

export default ImportLeads;