// import { Upload, message, Button, Spin } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { useState } from 'react';

// const { Dragger } = Upload;

// const DocUpload = ({ onUploadSuccess }) => {
//     const [uploading, setUploading] = useState(false);
  
//     const beforeUpload = (file) => {
//       const isPDF = file.type === 'application/pdf';
//       if (!isPDF) {
//         message.error("Vous ne pouvez télécharger que des fichiers PDF !");
//         return false;
//       }
      
//       const isLt10M = file.size / 1024 / 1024 < 10;
//       if (!isLt10M) {
//         message.error("Le fichier doit être inférieur à 10 Mo !");
//         return false;
//       }
      
//       // Pass the file object directly to parent
//       onUploadSuccess(file);
//       return false; // Prevent default upload behavior
//     };
  
//     return (
//       <Dragger
//         name="document"
//         accept=".pdf"
//         multiple={false}
//         showUploadList={false}
//         beforeUpload={beforeUpload}
//         disabled={uploading}
//       >
//         <p className="ant-upload-drag-icon">
//           {uploading ? <Spin /> : <UploadOutlined />}
//         </p>
//         <p className="ant-upload-text">
//           Click or drag PDF file to upload
//         </p>
//         <p className="ant-upload-hint">
//           Maximum file size: 10MB
//         </p>
//       </Dragger>
//     );
//   };

// export default DocUpload;
// DocUpload.js - Use this simple version
import { Upload, message, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Dragger } = Upload;

const DocUpload = ({ onUploadSuccess }) => {
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
        message.error("Formats supportés: PDF, JPG, PNG, GIF, WebP");
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Le fichier doit être inférieur à 10 Mo !");
        return false;
      }
      
      // Pass the file object directly to parent
      onUploadSuccess(file);
      return false; // Prevent default upload behavior
    };
  
    return (
      <Dragger
        name="document"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        multiple={false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          {uploading ? <Spin /> : <UploadOutlined />}
        </p>
        <p className="ant-upload-text">
          Cliquez ou glissez un fichier ici
        </p>
        <p className="ant-upload-hint">
          PDF, JPG, PNG, GIF, WebP - Maximum 10MB
        </p>
      </Dragger>
    );
};

export default DocUpload;