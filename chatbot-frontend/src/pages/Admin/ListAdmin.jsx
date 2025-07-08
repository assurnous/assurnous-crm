import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";


const ListAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      const response = await axios.get(
        "/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Admins:", response.data);
      setAdmins(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des admins:", error);
      message.error("Échec de la récupération des admins");
    }
  };

  const showEditModal = (admin) => {
    setCurrentAdmin(admin);
    form.setFieldsValue({ ...admin, password: "" }); // Réinitialiser le champ mot de passe
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentAdmin(null);
    form.resetFields();
  };

  const handleDelete = async (adminId) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      await axios.delete(`/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedAdmins = admins.filter((admin) => admin._id !== adminId);
      setAdmins(updatedAdmins);
      message.success("Admin supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'admin:", error);
      message.error("Échec de la suppression de l'admin");
    }
  };

 

  const handleFinish = async (values) => {
    try {
      const token = localStorage.getItem("token"); // Récupérer le token du local storage
      if (currentAdmin) {
        await axios.put(
          `/admin/${currentAdmin._id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmins(
          admins.map((admin) =>
            admin._id === currentAdmin._id ? { ...admin, ...values } : admin
          )
        );
        message.success("Admin mis à jour avec succès");
      } else {
        const response = await axios.post(
          "/admin",
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdmins([...admins, response.data]);
        message.success("Admin créé avec succès");
      }
      handleCancel();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'admin:", error);
      message.error("Échec de l'enregistrement de l'admin");
    }
  };

  const getInitials = (name) => {
    return `${name.charAt(0)}`.toUpperCase();
  };

  const columns = [
    {
      title: "Admin",
      key: "admin",
      render: (text, record) => (
        <div className="flex items-center">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Avatar
              style={{ backgroundColor: "" }}
              size={40}
              className="mr-2 bg-purple-800 text-white"
            >
              {getInitials(record.name)}
            </Avatar>
          )}
          <span className="ml-2">{`${record.name}`}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Mot de passe",
      key: "password",
      render: (text, record) => (
        <div className="flex items-center">
          <span>••••••••</span> {/* Le mot de passe n'est pas affiché */}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Empêcher le déclenchement du clic sur la ligne
              showEditModal(record);
            }}
             className="mr-2"
             style={{ backgroundColor: "green", borderColor: "green" }}
            icon={<EditOutlined style={{ color: "white" }} />}
            shape="circle"
            type="primary"
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet admin ?"
            onConfirm={(e) => {
              e.stopPropagation(); // Empêcher le déclenchement du clic sur la ligne
              handleDelete(record._id);
            }}
            okText="Oui"
            cancelText="Non"
            onCancel={(e) => e.stopPropagation()} // Empêcher le déclenchement du clic sur la ligne
          >
            <Button
              type="danger"
              style={{ backgroundColor: "red", borderColor: "red" }}
              icon={<DeleteOutlined style={{ color: "white" }}/>}
              shape="circle"
              onClick={(e) => e.stopPropagation()} // Empêcher le déclenchement du clic sur la ligne
            />
          </Popconfirm>
        </div>
      ),
    },
  ];


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Admins</h1>
      <Button
        type=""
        onClick={() => setIsModalVisible(true)}
        className="mb-4 bg-purple-800 text-white"
        icon={<PlusOutlined />}
      >
        Ajouter un Admin
      </Button>
      <Table
        columns={columns}
        dataSource={admins}
        rowKey="_id"
        scroll={{ x: "max-content" }}
        onRow={(record) => ({
          onClick: () => {
            showEditModal(record);
          },
        })}
      />
      <Modal
        title={currentAdmin ? "Modifier Admin" : "Ajouter Admin"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
      
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: currentAdmin ? false : true }]}
          >
            <Input.Password
              placeholder={
                currentAdmin
                  ? "Laissez vide pour garder le mot de passe actuel"
                  : "Entrez le mot de passe"
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="" className="bg-purple-800 text-white" htmlType="submit">
              {currentAdmin ? "Mettre à jour" : "Créer"}
            </Button>
            <Button onClick={handleCancel} className="ml-2">
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListAdmin;
