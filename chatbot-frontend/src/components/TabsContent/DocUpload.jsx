import { Upload, message, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Dragger } = Upload;

const DocUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
  
    const beforeUpload = (file) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error("Vous ne pouvez télécharger que des fichiers PDF !");
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
        accept=".pdf"
        multiple={false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          {uploading ? <Spin /> : <UploadOutlined />}
        </p>
        <p className="ant-upload-text">
          Click or drag PDF file to upload
        </p>
        <p className="ant-upload-hint">
          Maximum file size: 10MB
        </p>
      </Dragger>
    );
  };

export default DocUpload;