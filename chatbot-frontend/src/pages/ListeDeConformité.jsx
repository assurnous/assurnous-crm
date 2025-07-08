import React, {useState} from "react";
import {
  Tabs,
  Table,
  Select,
  Button,
  Space,
  Progress,
  Modal,
  Form,
  DatePicker,
  Upload,
  message,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faDownload,
  faTrash,
  faFileUpload
 
} from "@fortawesome/free-solid-svg-icons";
import { CloseOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

const documentData = [
  {
    key: "1",
    name: "Document 1",
    startDate: "2023-01-15",
    endDate: "2023-12-31",
    downloaded: "Oui",
    progress: 75,
  },
  {
    key: "2",
    name: "Document 2",
    startDate: "2023-02-20",
    endDate: "2023-11-30",
    downloaded: "Non",
    progress: 30,
  },
];

const ListeDeConformité = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleFormSubmit = async (values) => {
    if (!file) {
      message.error('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file); // Matches backend's `upload.single('pdf')`
    formData.append('date_debut', values.date_debut);
    formData.append('date_fin', values.date_fin);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Document enregistré avec succès!');
      form.resetFields();
      setFile(null);
      handleCancel();
    } catch (error) {
      message.error('Erreur lors de l\'envoi du document');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record) => {
    setSelectedDocument(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // const uploadProps = {
  //   name: "file",
  //   multiple: false,
  //   action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  //   onChange(info) {
  //     const { status } = info.file;
  //     if (status !== "uploading") {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (status === "done") {
  //       message.success(`${info.file.name} file uploaded successfully.`);
  //     } else if (status === "error") {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  // };

  const handleDelete = (key) => {}

  const columns = [
    {
      title: "Liste de documents",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            onClick={() => showModal(record)}
            icon={
              <FontAwesomeIcon icon={faFileUpload} className="text-blue-500" />
            }
          />
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faTrash} className="text-red-500" />}
            onClick={() => handleDelete(record.key)}
          />
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faDownload} className="text-green-500" />}
            onClick={() => message.success("Téléchargement en cours...")}
          />
        </Space>
      ),
    },
    {
      title: "Date de début",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Date de fin",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Document Téléchargé",
      dataIndex: "downloaded",
      key: "downloaded",
      render: (text) => (
        <span className={text === "Oui" ? "text-green-500" : "text-red-500"}>
          {text}
        </span>
      ),
    },
    {
      title: "Progression",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={
            progress > 70 ? "#52c41a" : progress > 30 ? "#faad14" : "#f5222d"
          }
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Title */}
      <h1 className="text-xl font-bold text-purple-900 mb-2">
        LISTE DE CONFORMITÉ
      </h1>
      <p className="mb-6 text-gray-600 font-semibold">
        Retrouvez la liste (non exhaustive) de tous les documents juridiques
        nécessaires à la gestion de votre cabinet.
      </p>

      {/* Progress filter */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <span className="mr-2 font-medium text-gray-700">Progressions</span>
          <Select
            placeholder="--Choisissez--"
            style={{ width: 200 }}
            className="mr-2"
          >
            <Option value="option1">Tous les documents</Option>
            <Option value="option2">Complétés</Option>
            <Option value="option3">En cours</Option>
            <Option value="option4">Non commencés</Option>
          </Select>
          <Button
            type="text"
            icon={
              <FontAwesomeIcon icon={faSyncAlt} className="text-gray-500" />
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="1"
        tabBarStyle={{
          borderBottom: "none",
          paddingLeft: "16px",
          backgroundColor: "#f9fafb",
        }}
      >
        {[
          "Documents cabinet",
          "Documents Interlocuteurs",
          "Procédures internes",
          "Archives",
        ].map((tab, index) => (
          <TabPane
            tab={<span className="text-purple-900 font-medium">{tab}</span>}
            key={String(index + 1)}
          >
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
                dataSource={documentData}
                pagination={false}
                bordered
                size="middle"
              />
            </div>
          </TabPane>
        ))}
      </Tabs>
      {/* <Modal
  title={
    <div className="bg-gray-100 p-4 -mx-4 md:-mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
      <span className="font-medium text-sm md:text-base">
        NOUVEAU DOCUMENT
      </span>
      <button
        onClick={handleCancel}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <CloseOutlined />
      </button>
    </div>
  }
  open={isModalOpen}
  onCancel={handleCancel}
  footer={null}
  width="85vw sm:w-96" // Adjusted width - 85% on mobile, fixed 384px on larger screens
  className="max-w-full"
  style={{
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    height: "100vh",
    margin: 0,
    padding: 0,
    maxWidth: '100vw',
  }}
  bodyStyle={{
    height: "calc(100vh - 56px)",
    padding: 0,
    margin: 0,
    overflowY: 'auto',
  }}
  maskStyle={{
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  }}
  closeIcon={null}
>
  <div className="h-full overflow-y-auto p-4">
    <Form
      form={form}
      onFinish={handleFormSubmit}
      layout="vertical"
      className="space-y-4 w-full"
    >
      <Form.Item 
        label="Date de début" 
        name="date_debut"
        className="mb-4"
      >
        <DatePicker
          className="w-full"
          placeholder="Sélectionnez la date"
          size="large"
        />
      </Form.Item>

      <Form.Item 
        label="Date de fin" 
        name="date_fin"
        className="mb-4"
      >
        <DatePicker
          className="w-full"
          placeholder="Sélectionnez la date"
          size="large"
        />
      </Form.Item>

      <Form.Item 
        label="Choisissez un document"
        className="mb-6"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-gray-400 mb-2">
              <InboxOutlined className="text-3xl" />
            </div>
            <p className="text-gray-600 font-medium text-sm">
              Cliquez ou glissez-déposez votre fichier ici
            </p>
            <p className="text-gray-400 text-xs">
              Formats supportés: PDF, DOC, XLS, JPG, PNG
            </p>
          </div>
        
        </div>
      </Form.Item>
      
      <div className="flex justify-start mt-6">
        <Button
          type="primary"
          htmlType="submit"
          className="w-full h-12"
          size="large"
        >
          Enregistrer
        </Button>
      </div>
    </Form>
  </div>
</Modal> */}
<Modal
      title={
        <div className="bg-gray-100 p-4 -mx-4 md:-mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
          <span className="font-medium text-sm md:text-base">NOUVEAU DOCUMENT</span>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <CloseOutlined />
          </button>
        </div>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width="85vw sm:w-96"
      className="max-w-full"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        height: "100vh",
        margin: 0,
        padding: 0,
        maxWidth: '100vw',
      }}
      bodyStyle={{
        height: "calc(100vh - 56px)",
        padding: 0,
        margin: 0,
        overflowY: 'auto',
      }}
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      }}
      closeIcon={null}
    >
      <div className="h-full overflow-y-auto p-4">
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          className="space-y-4 w-full"
        >
          <Form.Item 
            label="Date de début" 
            name="date_debut"
            className="mb-4"
            rules={[{ required: true, message: 'Ce champ est obligatoire' }]}
          >
            <DatePicker
              className="w-full"
              placeholder="Sélectionnez la date"
              size="large"
            />
          </Form.Item>

          <Form.Item 
            label="Date de fin" 
            name="date_fin"
            className="mb-4"
            rules={[{ required: true, message: 'Ce champ est obligatoire' }]}
          >
            <DatePicker
              className="w-full"
              placeholder="Sélectionnez la date"
              size="large"
            />
          </Form.Item>

          <Form.Item 
            label="Choisissez un document"
            className="mb-6"
            rules={[{ required: true, message: 'Veuillez sélectionner un fichier' }]}
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-gray-400 mb-2">
                    <InboxOutlined className="text-3xl" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">
                    {file ? file.name : 'Cliquez ou glissez-déposez votre fichier ici'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Formats supportés: PDF, DOC, XLS, JPG, PNG
                  </p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </div>
          </Form.Item>
          
          <div className="flex justify-start mt-6">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12"
              size="large"
              loading={loading}
            >
              Enregistrer
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
    </div>
  );
};

export default ListeDeConformité;
