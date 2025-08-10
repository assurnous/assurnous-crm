import { useForm } from "antd/es/form/Form";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Radio,
  Button,
  message,
  DatePicker,
  Row,
  Col,
  Table,
} from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CreateCommand = () => {
  const [form] = useForm();
  const { id, commandId } = useParams();
  const location = useLocation();
  // const commandId = location.state?.commandId;
  const { TextArea } = Input;

  const [leads, setLeads] = useState({});
  const TVA = 10;
  const [panierItems, setPanierItems] = useState([]);
  const navigate = useNavigate();

  const generateRandomNumber = (prefix) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // generates 6 random digits
    return `${prefix}${randomNum}`;
  };

  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Always get fresh data from backend first
        const response = await axios.get(`/panier/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allPanier = response.data;
        // console.log("allPanier", allPanier);

        const decodedToken = token ? jwtDecode(token) : null;
        const currentUserId = decodedToken?.userId;

        const filteredpanier = allPanier.filter(
          (panier) => panier.session === currentUserId
        );
        setPanierItems(filteredpanier);
        if (filteredpanier.length > 0) {
          const totals = filteredpanier.reduce(
            (acc, item) => ({
              quantite: acc.quantite + (item.quantite || 0),
              totalHT: acc.totalHT + (item.montantHT || 0),
              totalTVA: acc.totalTVA + (item.montantTVA || 0),
              totalTTC: acc.totalTTC + (item.montantTTC || 0),
              marge: acc.totalTTC + (item.marge || 0),
            }),
            { quantite: 0, totalHT: 0, totalTVA: 0, totalTTC: 0, marge: 0 }
          );

          form.setFieldsValue({
            quantite: totals.quantite,
            // Add other fields you want to populate:
            totalHT: totals.totalHT,
            totalTVA: totals.totalTVA,
            totalTTC: totals.totalTTC,
            marge: totals.marge
          });
        }
      } catch (error) {
        console.error("Error trouver items", error);
        message.error("Error trouver items");
      }
    };
    fetchCartData();
  }, []);

  const handleCommandTypeChange = (value) => {
    const prefix = value === "devis" ? "D" : "C";
    const randomNumber = generateRandomNumber(prefix);
    form.setFieldsValue({
      numCommand: randomNumber,
    });
  };

  useEffect(() => {
    const fetchCommand = async () => {
      if (commandId) {
        try {
          const response = await axios.get(`/commands/${commandId}`);
          const commandData = response.data;
          console.log("commandData", commandData);

          form.setFieldsValue({
            command_type: commandData.command_type,
            date: dayjs(commandData.date),
            nom: commandData.nom,
            email: commandData.email,
            phone: commandData.phone,
            siret: commandData.siret,
            codepostal: commandData.codepostal,
            raissociale: commandData.raissociale,
            ville: commandData.ville,
            adresse: commandData.adresse,
            quantite: commandData.quantite,
            montantHT: commandData.totalHT,
            montantTTC: commandData.totalTTC,
            montantTVA: commandData.totalTVA,
            numCommand: commandData.numCommand,
            marge: commandData.marge,
          });

          if (commandData.panierItems) {
            setPanierItems(commandData.panierItems);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de la commande:",
            error
          );
          message.error("Échec du chargement des données de commande.");
        }
      }
    };

    fetchCommand();
  }, [commandId]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.get(`/lead/${id}`);
        const foundLead = response.data.chat;
        setLeads(foundLead);
        if (foundLead) {
          form.setFieldsValue({
            nom: foundLead.nom,
            email: foundLead.email,
            phone: foundLead.phone,
            ville: foundLead.ville,
            codepostal: foundLead.codepostal,
            address: foundLead.address,
            raissociale: foundLead.raissociale,
            siret: foundLead.siret,
          });
        }
      } catch (error) {
        message.error("Failed to fetch lead.");
        console.error(error);
      }
    };
    fetchLead();
  }, [id, form]);

  const handleFormSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = token ? jwtDecode(token) : null;
      const commercialName = decodedToken?.name || decodedToken?.commercialName;
      if (!decodedToken) {
        alert("User not authenticated");
        return;
      }

      const userId = decodedToken?.userId || decodedToken?.commercialId;
      // const commercialId = decodedToken.commercialId || null;
      const formData = {
        ...values,
        session: userId,
        leadId: id,
        // description: panierItems.map((item) => item.description).join(", "),
        // code: panierItems.map((item) => item.code).join(", "),
        description: panierItems.map((item) => item.description).filter(desc => desc), // Array of descriptions
        code: panierItems.map((item) => item.code).filter(code => code), // Array of codes
        marque: panierItems.map((item) => item.marque).join(", "),
        totalHT: panierItems.reduce((acc, item) => acc + item.montantHT, 0),
        totalTVA: panierItems.reduce((acc, item) => acc + item.montantTVA, 0),
        totalTTC: panierItems.reduce((acc, item) => acc + item.montantTTC, 0),
        quantite: panierItems.reduce((acc, item) => acc + item.quantite, 0),
        marge: panierItems.reduce((acc, item) => acc + (item.marge || 0), 0),
        commercialName,
      };
      console.log("formData", formData);
      if (commandId) {
        await axios.put(`/command/${commandId}`, formData);
        message.success("Commande mise à jour avec succès !");
      } else {
        await axios.post("/command", formData);
        message.success("Commande ajoutée avec succès !");
      }

      navigate(`/lead/${id}`);
    } catch (error) {
      message.error("Impossible d'ajouter la commande.");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantité",
      key: "quantite",
      render: (_, record) => <div>{record.quantite}</div>,
    },
    {
      title: "Montant HT",
      dataIndex: "montantHT",
      key: "montantHT",
    },
    {
      title: "TVA",
      dataIndex: "montantTVA",
      key: "montantTVA",
    },
    // {
    //   title: "Marge",
    //   dataIndex: "marge",
    //   key: "marge",
    // },
    {
      title: "Montant TTC",
      dataIndex: "montantTTC",
      key: "montantTTC",
    },
  ];

  return (
    <div className="p-12">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        className="space-y-4 border p-12 rounded-md shadow-md bg-white"
      >
        <div className="flex items-center justify-center mr-6">
          <Form.Item
            name="command_type"
            className="font-bold"
            rules={[{ required: true, message: "Type de commande est requis" }]}
          >
            <Radio.Group
              onChange={(e) => handleCommandTypeChange(e.target.value)}
            >
              <Radio value="devis">Devis</Radio>
              <Radio value="commande">Contrat</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Numéro de Commande"
              name="numCommand"
              rules={[
                { required: true, message: "Numéro de commande est requis" },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "La date est requise" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Sélectionnez une date"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Prénom et Nom"
              name="nom"
              rules={[{ required: false, message: "Le prénom est requis" }]}
            >
              <Input placeholder="Prénom du client" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Adresse"
              name="address"
              rules={[{ required: false, message: "L'adresse est requis" }]}
            >
              <TextArea placeholder="Adresse" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: false, message: "L'email est requis" }]}
            >
              <Input placeholder="Email du client" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Téléphone"
              name="phone"
              rules={[{ required: false, message: "Le téléphone est requis" }]}
            >
              <Input placeholder="Téléphone du client" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="TVA">
              <Input value={`${TVA}%`} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Siret"
              name="siret"
              rules={[{ required: false, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Siret" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Code Postal"
              name="codepostal"
              rules={[{ required: false, message: "Code postal est requis" }]}
            >
              <Input placeholder="Code Postal" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Raissociale"
              name="raissociale"
              rules={[{ required: false, message: "Raissociale est requis" }]}
            >
              <Input placeholder="Raissociale" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ville"
              name="ville"
              rules={[{ required: false, message: "La ville est requis" }]}
            >
              <Input placeholder="Ville" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Quantité"
              name="quantite"
              rules={[{ required: false, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Quantité" readOnly />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Montant HT"
              name="totalHT"
              rules={[{ required: false, message: "Montant HT est requis" }]}
            >
              <Input placeholder="Montant HT" readOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Montant TTC"
              name="totalTTC"
              rules={[{ required: false, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Montant TTC" readOnly />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="total TVA"
              name="totalTVA"
              rules={[{ required: false, message: "Ce champ est requis" }]}
            >
              <Input placeholder="total TVA" readOnly />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item
              label="Marge"
              name="marge"
              rules={[{ required: false, message: "Ce champ est requis" }]}
            >
              <Input placeholder="Marge" readOnly />
            </Form.Item>
          </Col> */}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Button
              type="primary"
              htmlType="submit"
              className="mt-8 bg-blue-600 text-white rounded-lg"
            >
              Enregistrer la commande
            </Button>
          </Col>
        </Row>
      </Form>

      <div className="mt-6">
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
          dataSource={panierItems}
          pagination={false}
          rowKey={(record) =>
            record._id || record.produit?._id || Math.random()
          }
        />
      </div>
    </div>
  );
};

export default CreateCommand;
