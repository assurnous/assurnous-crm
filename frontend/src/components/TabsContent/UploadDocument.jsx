// import { Upload, message, Button, Spin } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { useState } from 'react';
// import axios from 'axios';

// const { Dragger } = Upload;


// const UploadDocument = ({ onUploadSuccess }) => {
//  const [uploading, setUploading] = useState(false);

//   const beforeUpload = (file) => {
//     // Validate file type
//     const isPDF = file.type === 'application/pdf';
//     if (!isPDF) {
//       message.error('You can only upload PDF files!');
//       return false;
//     }
    
//     // Validate file size
//     const isLt10M = file.size / 1024 / 1024 < 10;
//     if (!isLt10M) {
//       message.error('File must be smaller than 10MB!');
//       return false;
//     }
    
//     return true;
//   };
// const handleUpload = async ({ file, onSuccess, onError }) => {
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('document', file);
    
//     try {
//       const response = await axios.post('/files/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
      
//       // Ensure response contains all required fields
//       const uploadResponse = {
//         file: file, // original file object
//         name: file.name,
//         url: response.data.url || response.data.firebaseStorageUrl,
//         ...response.data
//       };
      
//       onSuccess(uploadResponse, file);
//       onUploadSuccess(uploadResponse);
//       message.success(`${file.name} uploaded successfully`);
//     } catch (error) {
//       console.error('Upload error:', error);
//       message.error(error.response?.data?.message || 'Upload failed');
//       onError(error);
//     } finally {
//       setUploading(false);
//     }
//   };
//   return (
//       <Dragger
//         name="document"
//         accept=".pdf"
//         multiple={false}
//         showUploadList={false}
//         beforeUpload={beforeUpload}
//         customRequest={handleUpload}
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

// export default UploadDocument;
import { Upload, message, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axios from 'axios';

const { Dragger } = Upload;

const UploadDocument = ({ onUploadSuccess, disabled }) => {
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file) => {
    // Validate file size
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
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
        }
      });
      
      const uploadResponse = {
        file: file,
        name: file.name,
        url: response.data.url || response.data.firebaseStorageUrl,
        ...response.data
      };
      
      onSuccess(uploadResponse, file);
      onUploadSuccess(uploadResponse);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Upload failed');
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
      disabled={uploading || disabled} // Add disabled prop
    >
      <p className="ant-upload-drag-icon">
        {uploading ? <Spin /> : <UploadOutlined />}
      </p>
      <p className="ant-upload-text">
        {uploading ? 'Uploading...' : 'Click or drag file to upload'}
      </p>
      <p className="ant-upload-hint">
        Supports PDF, JPG, PNG, GIF, WebP - Maximum file size: 10MB
      </p>
    </Dragger>
  );
};

export default UploadDocument;