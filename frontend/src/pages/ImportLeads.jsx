import React, { useState } from "react";
import { Upload, Button, message, List, Modal, Table, Alert } from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const ImportLeads = ({ onImportSuccess = () => {} }) => {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [importedFiles, setImportedFiles] = useState([]);
  const [duplicates, setDuplicates] = useState({
    inFile: [],
    inDatabase: []
  });
  const [validationError, setValidationError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
    // Compute agence validation as soon as fileData changes
    const agenceValidation = React.useMemo(() => {
      if (!fileData || fileData.length === 0) return { valid: true, errors: [] };
  
      const validValues = ["LENS", "VALENCIENNES", "LILLE"];
      const errors = [];
  
      fileData.forEach((lead, index) => {
        const value = (lead.agence || "").trim().toUpperCase();
        if (!value) {
          errors.push({ row: index + 2, reason: "agence manquante", value: "" }); // +2 because Excel row 1 = header
        } else if (!validValues.includes(value)) {
          errors.push({ row: index + 2, reason: "agence invalide", value: lead.agence });
        }
      });
  
      return { valid: errors.length === 0, errors };
    }, [fileData]);

  // const handleUpload = ({ file }) => {
  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     const binaryStr = event.target.result;
  //     const workbook = XLSX.read(binaryStr, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];
  //     const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //     if (jsonData.length) {
  //       const headers = jsonData[0];
  //       const rows = jsonData.slice(1);

  //       // const leads = rows.map((row) => {
  //       //   const lead = {};
  //       //   headers.forEach((header, index) => {
  //       //     lead[header.toLowerCase()] = row[index];
  //       //   });
  //       //   return lead;
  //       // });
  //       const excelDateToJSDate = (excelDate) => {
  //         const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  //         const isoString = date.toISOString().split("T")[0]; // format: YYYY-MM-DD
  //         return isoString;
  //       };
        
  //       const leads = rows.map((row) => {
  //         const lead = {};
  //         headers.forEach((header, index) => {
  //           let key = header.toLowerCase();
  //           let value = row[index];
        
  //           if (key === "date" && typeof value === "number") {
  //             lead[key] = excelDateToJSDate(value); // Convert numeric date to string
  //           } else {
  //             lead[key] = value;
  //           }
  //         });
  //         return lead;
  //       });
        

  //       // Check for duplicates in the file itself
  //       const phoneMap = new Map();
  //       const duplicatesInFile = [];
        
  //       leads.forEach(lead => {
  //         if (lead.phone) {
  //           if (phoneMap.has(lead.phone)) {
  //             duplicatesInFile.push(lead.phone);
  //           } else {
  //             phoneMap.set(lead.phone, true);
  //           }
  //         }
  //       });

  //       setDuplicates({
  //         inFile: [...new Set(duplicatesInFile)],
  //         inDatabase: []
  //       });

  //       setFileData(leads);
  //       setFileName(file.name);
  //       message.success(`${leads.length} leads trouvés dans le fichier`);
  //     } else {
  //       message.error("Aucune donnée trouvée dans le fichier");
  //     }
  //   };
  //   reader.readAsBinaryString(file);
  // };

  const handleTransfer = async () => {
    console.log("═══════════════════════════════════════════════");
    console.log("🔍 [handleTransfer] DÉBUT");
    console.log("   fileData.length :", fileData?.length);
    console.log("   fileData[0]     :", fileData?.[0]);
    console.log("   agenceValidation:", agenceValidation);
    console.log("   valid           :", agenceValidation?.valid);
    console.log("   errors          :", agenceValidation?.errors);
    console.log("═══════════════════════════════════════════════");
    if (!fileData || fileData.length === 0) {
        message.error("Aucune donnée à transférer");
        return;
    }
    if (!agenceValidation.valid) {
      message.error(
        `Import bloqué : ${agenceValidation.errors.length} ligne(s) sans agence valide. ` +
        `Corrigez le fichier Excel (LENS / VALENCIENNES / LILLE) et réessayez.`
      );
      return;
  }
  console.log("═══════════════════════════════════════════════");
console.log("🔍 DEBUG — Données avant envoi au backend");
console.log("   Nombre de leads:", fileData?.length);
console.log("   Premier lead:", fileData?.[0]);
console.log("   Champs du 1er lead:", Object.keys(fileData?.[0] || {}));
console.log("   Valeur agence 1er:", fileData?.[0]?.agence);
console.log("   Valeur agence 2e :", fileData?.[1]?.agence);
console.log("   Valeur agence 3e :", fileData?.[2]?.agence);
console.log("═══════════════════════════════════════════════");
    setIsImporting(true);
    setValidationError(null);
    try {
      const token = localStorage.getItem("token");
    
      const response = await axios.post('/import', fileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,   // ⬅️ AJOUTER
        },
        validateStatus: (status) => status < 500,
      });
    
      console.log("📥 Réponse /import:", response.status, response.data);
    
      // ═══════════════════════════════════════════════════════════════
      if (response.status === 200) {
        const data = response.data;
      
        // ═══════════════════════════════════════════════════════════════
        // CAS 1 : Succès complet
        // ═══════════════════════════════════════════════════════════════
        if (data.count > 0 && data.skipped === 0) {
          message.success(`✅ ${data.count} lead(s) importé(s) avec succès`);
          setValidationError(null);
          onImportSuccess();
          setImportedFiles([...importedFiles, fileName]);
          setFileData(null);
          setFileName(null);
          return;
        }
      
        // ═══════════════════════════════════════════════════════════════
        // CAS 2 : Succès PARTIEL — certains importés, d'autres rejetés
        // ═══════════════════════════════════════════════════════════════
        if (data.count > 0 && data.skipped > 0) {
          message.warning(
            `⚠️ ${data.count} importé(s), ${data.skipped} rejeté(s)`
          );
      
          if (data.rejectedLeads && data.rejectedLeads.length > 0) {
            const details = data.rejectedLeads
              .map((r) =>
                `• ${r.nom || "?"} ${r.prenom || "?"} (agence: ${r.agence || "?"}) → ${(r.errors || [])
                  .map((e) => `${e.path}: ${e.message}`)
                  .join("; ")}`
              )
              .join("\n");
      
            setValidationError(details);
            console.warn("⚠️ Leads rejetés:", data.rejectedLeads);
          }
      
          onImportSuccess();
          setImportedFiles([...importedFiles, fileName]);
          setFileData(null);
          setFileName(null);
          return;
        }
      
        // ═══════════════════════════════════════════════════════════════
        // CAS 3 : AUCUN lead importé (mais status 200 par erreur)
        // ═══════════════════════════════════════════════════════════════
        message.error(
          `❌ Aucun lead importé — ${data.skipped || 0} rejeté(s)`
        );
        // Ne PAS reset le fileData → l'utilisateur doit voir le problème
        if (data.rejectedLeads && data.rejectedLeads.length > 0) {
          const details = data.rejectedLeads
            .map((r) =>
              `• ${r.nom || "?"} ${r.prenom || "?"} (agence: ${r.agence || "?"}) → ${(r.errors || [])
                .map((e) => `${e.path}: ${e.message}`)
                .join("; ")}`
            )
            .join("\n");
          setValidationError(details);
        }
        return;
      }
      
      // ═══════════════════════════════════════════════════════════════
      // CAS 4 : Échec total (400)
      // ═══════════════════════════════════════════════════════════════
      if (response.status === 400) {
        const data = response.data;
        console.error("❌ Import échoué:", data);
      
        // Message principal
        message.error(data.message || "Import échoué");
      
        // ═══════════════════════════════════════════════════════════════
        // Afficher les détails de chaque lead rejeté
        // ═══════════════════════════════════════════════════════════════
        if (data.rejectedLeads && data.rejectedLeads.length > 0) {
          const details = data.rejectedLeads
            .map((r) => {
              const nom = `${r.nom || "?"} ${r.prenom || "?"}`.trim();
              const agence = r.agence || "—";
              const erreurs = (r.errors || [])
                .map((e) => `${e.path}: ${e.message}`)
                .join(" | ");
              return `• Ligne ${r.index + 1} — ${nom} (agence: ${agence}) → ${erreurs}`;
            })
            .join("\n");
      
          setValidationError(details);
        }
        // Erreurs simples (sans rejectedLeads)
        else if (data.errors && Array.isArray(data.errors)) {
          const details = data.errors
            .map((e) => `• ${e.path}: ${e.message}`)
            .join("\n");
          setValidationError(details);
        }
        // Fallback
        else {
          setValidationError(data.message || JSON.stringify(data));
        }
      
        return;
      }
    } catch (error) {
      console.error("❌ Erreur réseau ou exception:", error);
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Erreur inconnue lors de l'importation"
      );
    } finally {
      setIsImporting(false);
    }
    // try {
    //     const response = await axios.post('/import', fileData, {
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       validateStatus: (status) => status < 500,
    //     });

    //     if (response.status === 200) {
    //         message.success(`${response.data.count} leads importés avec succès`);
    //         onImportSuccess();
    //         setImportedFiles([...importedFiles, fileName]);
    //         setFileData(null);
    //         setFileName(null);
    //     } 
    //     // else if (response.status === 400) {
    //     //     // Handle different types of validation errors
    //     //     if (response.data.duplicatePhones) {
    //     //         setDuplicates({
    //     //             inFile: response.data.duplicatePhones,
    //     //             inDatabase: []
    //     //         });
                
    //     //         const errorMsg = response.data.message === 'Duplicate phone numbers found in import file' 
    //     //             ? `Doublons dans le fichier: ${response.data.duplicatePhones.join(', ')}`
    //     //             : `Doublons existants en base: ${response.data.duplicatePhones.join(', ')}`;
                
    //     //         setValidationError(errorMsg);
    //     //     } 
    //     //     // else if (response.data.invalidLeads) {
    //     //     //     setValidationError(
    //     //     //         `${response.data.invalidLeads.length} leads sans numéro de téléphone`
    //     //     //     );
    //     //     // }
    //     // }
    // } catch (error) {
    //     console.error("Erreur lors de l'importation:", error);
    //     message.error(
    //         error.response?.data?.message || 
    //         "Erreur inconnue lors de l'importation"
    //     );
    // } finally {
    //     setIsImporting(false);
    // }
};

  const handleRemove = () => {
    setFileData(null);
    setFileName(null);
    setDuplicates({ inFile: [], inDatabase: [] });
    setValidationError(null);
  };

  const handleUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
  
        // CORRECT APPROACH: Let xlsx auto-detect headers
        const leads = XLSX.utils.sheet_to_json(worksheet);
  
        // if (leads.length) {
        //   // Transform dates if needed
        //   const processedLeads = leads.map(lead => {
        //     if (lead.date && typeof lead.date === "number") {
        //       const date = new Date(Math.round((lead.date - 25569) * 86400 * 1000));
        //       lead.date = date.toISOString().split("T")[0];
        //     }
        //     return lead;
        //   });
  
        //   setFileData(processedLeads);
        //   setFileName(file.name);
        //   message.success(`${processedLeads.length} leads loaded`);
        // } else {
        //   message.error("Empty file - no data found");
        // }
        if (leads.length) {
          // Normalize each row:
          //  - lowercase all keys, trim, strip accents
          //  - map common header aliases to schema field names
          //  - normalize agence value to uppercase (LENS/VALENCIENNES/LILLE)
          const normalizeKey = (key) =>
            String(key).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          const aliasMap = {
            "agence": "agence",
            "agence de rattachement": "agence",
            "agence rattachement": "agence",
            "nom": "nom", "lastname": "nom", "last name": "nom",
            "prenom": "prenom", "firstname": "prenom", "first name": "prenom",
            "tel": "portable", "telephone": "portable", "phone": "portable",
            "portable": "portable", "mobile": "portable",
            "email": "email", "mail": "email", "courriel": "email",
            "cp": "code_postal", "code postal": "code_postal",
            "codepostal": "code_postal", "code_postal": "code_postal",
            "ville": "ville", "city": "ville",
            "categorie": "categorie", "statut": "statut", "status": "statut",
            "date de naissance": "date_naissance", "date_naissance": "date_naissance",
          };

          const processedLeads = leads.map((lead) => {
            const normalized = {};
            Object.entries(lead).forEach(([key, value]) => {
              const lower = normalizeKey(key);
              normalized[aliasMap[lower] || lower] = value;
            });

            // Convert Excel numeric dates
            ["date", "date_naissance"].forEach((f) => {
              if (normalized[f] && typeof normalized[f] === "number") {
                const d = new Date(Math.round((normalized[f] - 25569) * 86400 * 1000));
                normalized[f] = d.toISOString().split("T")[0];
              }
            });

            // Trim strings
            Object.keys(normalized).forEach((k) => {
              if (typeof normalized[k] === "string") normalized[k] = normalized[k].trim();
            });

            // Normalize agence value (do NOT delete invalid ones — we want to show them)
            if (normalized.agence) {
              normalized.agence = String(normalized.agence).trim().toUpperCase();
            }

            return normalized;
          });

          console.log("Sample normalized lead:", processedLeads[0]);
          setFileData(processedLeads);
          setFileName(file.name);
          message.success(`${processedLeads.length} leads loaded`);
        } else {
          message.error("Empty file - no data found");
        }
      } catch (error) {
        message.error("Failed to parse file");
        console.error("Parsing error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };
  
  // SIMPLIFIED COLUMNS DEFINITION
  const columns = fileData?.length > 0 
    ? Object.keys(fileData[0]).map(key => ({
        title: key.toUpperCase(),
        dataIndex: key,
        key: key,
      }))
    : [];

  const uploadProps = {
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        message.error(`${file.name} n'est pas un fichier Excel`);
      }
      return isExcel || Upload.LIST_IGNORE;
    },
    customRequest: handleUpload,
    accept: ".xlsx, .xls",
  };

  // const columns =
  //   fileData && fileData.length > 0
  //     ? Object.keys(fileData[0]).map((key) => ({
  //         title: key.toUpperCase(),
  //         dataIndex: key,
  //         key,
  //         render: (text, record) => {
  //           const isFileDuplicate = duplicates.inFile.includes(record.phone);
  //           const isDbDuplicate = duplicates.inDatabase.includes(record.phone);
  //           return (
  //             <span style={{ 
  //               color: isFileDuplicate ? 'red' : 
  //                     isDbDuplicate ? 'orange' : 'inherit',
  //               fontWeight: isFileDuplicate || isDbDuplicate ? 'bold' : 'normal'
  //             }}>
  //               {text}
  //             </span>
  //           );
  //         },
  //       }))
  //     : [];
  

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Importer des Leads</h2>
      {!agenceValidation.valid && (
        <Alert
          message="Import bloqué : agence manquante ou invalide"
          description={
            <div>
              <div className="mb-2">
                {agenceValidation.errors.length} ligne(s) sur {fileData?.length || 0} ont un problème d'agence.
                L'agence doit être <strong>LENS</strong>, <strong>VALENCIENNES</strong> ou <strong>LILLE</strong>.
              </div>
              <div className="max-h-32 overflow-y-auto text-xs">
                {agenceValidation.errors.slice(0, 10).map((e, i) => (
                  <div key={i}>
                    Ligne {e.row} : {e.reason} {e.value ? `("${e.value}")` : ""}
                  </div>
                ))}
                {agenceValidation.errors.length > 10 && (
                  <div>… et {agenceValidation.errors.length - 10} autres</div>
                )}
              </div>
            </div>
          }
          type="error"
          showIcon
          className="mb-4"
        />
      )}
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
        <Button icon={<UploadOutlined />}>Télécharger le fichier Excel</Button>
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
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                  />,
                  <Button type="link" onClick={() => setIsModalVisible(true)}>
                    Aperçu
                  </Button>,
                ]}
              >
                <List.Item.Meta 
                  avatar={<FileExcelOutlined />} 
                  title={item} 
                  description={`${fileData?.length || 0} leads trouvés`}
                />
              </List.Item>
            )}
          />
          
          {/* <Button 
            type="primary" 
            onClick={handleTransfer} 
            className="mt-4"
            loading={isImporting}
            disabled={!fileData || fileData.length === 0 || isImporting}
          >
            {isImporting ? 'Importation...' : 'Transférer dans la base de données'}
          </Button> */}
                    <Button 
            type="primary" 
            onClick={handleTransfer} 
            className="mt-4"
            loading={isImporting}
            disabled={
              !fileData ||
              fileData.length === 0 ||
              isImporting ||
              !agenceValidation.valid
            }
          >
            {isImporting ? 'Importation...' : 'Transférer dans la base de données'}
          </Button>
        </div>
      )}
      
      <Modal
        title={`Aperçu du fichier (${fileData?.length || 0} leads)`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          // columns={columns}
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
          dataSource={fileData}
          rowKey={(record) => `${record.phone}-${Math.random()}`}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />
      </Modal>
      
      {importedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Historique des imports</h3>
          <List
            size="small"
            bordered
            dataSource={importedFiles}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta 
                  avatar={<FileExcelOutlined />} 
                  title={item} 
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ImportLeads;