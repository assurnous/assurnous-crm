// import { Upload, message, Button, Spin } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { useState } from 'react';
// import axios from 'axios';

// const { Dragger } = Upload;

// const FileUpload = ({ onUploadSuccess }) => {
//   const [uploading, setUploading] = useState(false);

//   const beforeUpload = (file) => {
//     // Validate file type
//     const isPDF = file.type === 'application/pdf';
//     if (!isPDF) {
//       message.error("Vous ne pouvez télécharger que des fichiers PDF !");
//       return false;
//     }
    
//     // Validate file size
//     const isLt10M = file.size / 1024 / 1024 < 10;
//     if (!isLt10M) {
//       message.error("Le fichier doit être inférieur à 10 Mo !");
//       return false;
//     }
    
//     return true;
//   };

//   const handleUpload = async ({ file, onSuccess, onError }) => {
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('document', file);
   

//     try {
//       const response = await axios.post('/files/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         timeout: 60000 // 30 seconds timeout
//       });
//       console.log('Upload response:', response.data);

//       onSuccess(response.data, file);
//       onUploadSuccess(response.data.document);
//       message.success(`${file.name} téléchargé avec succès`);
//     } catch (error) {
//         console.error('Upload error:', error);
//         onError(error);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Dragger
//       name="document"
//       accept=".pdf"
//       multiple={false}
//       showUploadList={false}
//       beforeUpload={beforeUpload}
//       customRequest={handleUpload}
//       disabled={uploading}
//     >
//       <p className="ant-upload-drag-icon">
//         {uploading ? <Spin /> : <UploadOutlined />}
//       </p>
//       <p className="ant-upload-text">
//         Click or drag PDF file to upload
//       </p>
//       <p className="ant-upload-hint">
//         Maximum file size: 10MB
//       </p>
//     </Dragger>
//   );
// };

// export default FileUpload;
import { Upload, message, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axios from 'axios';

const { Dragger } = Upload;

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file) => {
    // Allow both PDF and images
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      message.error("Vous ne pouvez télécharger que des fichiers PDF, JPG, PNG, GIF ou WebP !");
      return false;
    }
    
    // Validate file size
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Le fichier doit être inférieur à 10 Mo !");
      return false;
    }
    
    return true;
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout
      });
      console.log('Upload response:', response.data);

      onSuccess(response.data, file);
      onUploadSuccess(response.data.document);
      message.success(`${file.name} téléchargé avec succès`);
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || "Erreur lors de l'upload");
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dragger
      name="document"
      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
      multiple={false}
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={handleUpload}
      disabled={uploading}
    >
      <p className="ant-upload-drag-icon">
        {uploading ? <Spin /> : <UploadOutlined />}
      </p>
      <p className="ant-upload-text">
        {uploading ? 'Upload en cours...' : 'Cliquez ou glissez un fichier ici'}
      </p>
      <p className="ant-upload-hint">
        Formats acceptés: PDF, JPG, PNG, GIF, WebP - Taille maximum: 10MB
      </p>
    </Dragger>
  );
};

export default FileUpload;