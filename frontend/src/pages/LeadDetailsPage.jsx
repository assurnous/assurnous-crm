import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tabs, Button, Card, Select, DatePicker, Form, Descriptions, InputNumber, Radio, Tag, Space, Typography, Input, Modal } from "antd";
import { 
  EditOutlined, 
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  ShopOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  DeleteOutlined,
  CloseOutlined,
  CalendarOutlined,
  BankOutlined,
  MessageOutlined

} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import DevisTabContent from "../components/TabsContent/DevisTabContent";
import ContratTabContent from "../components/TabsContent/ContratTabContent";
import DocumentTabContent from "../components/TabsContent/DocumentTabContent";
import SinistreTabContent from "../components/TabsContent/SinistreTabContent";
import ReclamtionTabContent from "../components/TabsContent/ReclamtionTabContent";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gestionnaire, setGestionnaire] = useState(null);
    const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   if (isModalOpen && client) {
  //     // Format dates and other special fields before setting form values
  //     const formattedData = {
  //       ...client,
  //       date_naissance: client.date_naissance ? moment(client.date_naissance) : null,
  //       date_creation: client.date_creation ? moment(client.date_creation) : null,
  //     };
      
  //     form.setFieldsValue(formattedData);
  //   }
  // }, [isModalOpen, client, form]);
  useEffect(() => {
    if (isModalOpen && client) {
      const formattedData = {
        ...client,
        date_naissance: client.date_naissance ? dayjs(client.date_naissance) : null,
        date_creation: client.date_creation ? dayjs(client.date_creation) : null,
        rappel_at: client.rappel_at ? dayjs(client.rappel_at) : null,
      };
      
      form.setFieldsValue(formattedData);
    }
  }, [isModalOpen, client, form]);

    const handleAddNote = async () => {
    if (!newComment.trim()) return alert("Comment cannot be empty!");

    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    if (!decodedToken) {
      alert("User not authenticated");
      return;
    }

    try {
      const response = await axios.put(
        `/add-comment/${id}`,
        {
          text: newComment,
          name: decodedToken.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Commentaire ajouté avec succès !");
        setComments(response.data.commentaires);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/lead/${id}`);
        const clientData = response.data.chat;
        setClient(clientData);
        setLoading(false);
        
        if (isModalOpen) {
          form.setFieldsValue({
            ...clientData,
            date_naissance: clientData.date_naissance 
              ? dayjs(clientData.date_naissance) 
              : null,
            date_creation: clientData.date_creation 
              ? dayjs(clientData.date_creation) 
              : null,
            gestionnaire: clientData.gestionnaire, // Just store the ID directly
            gestionnaireModel: clientData.gestionnaireModel,
            gestionnaireName: clientData.gestionnaireName
          });
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
        setLoading(false);
      }
    };
  
    fetchClient();
  }, [id]);

  // useEffect(() => {
  //   const fetchClient = async () => {
  //     try {
  //       const response = await axios.get(`/lead/${id}`);
  //       setClient(response.data.chat);
  //       console.log("Client data:", response.data.chat);
  //       setLoading(false);
  //       if (isModalOpen) {
  //         form.setFieldsValue({
  //           ...response.data.chat,
  //           date_naissance: response.data.chat.date_naissance 
  //             ? dayjs(response.data.chat.date_naissance) 
  //             : null,
  //           date_creation: response.data.chat.date_creation 
  //             ? dayjs(response.data.chat.date_creation) 
  //             : null,
  //         });
  //       }
  //       if (client?.gestionnaireName) {
  //         setGestionnaire(client.gestionnaireName);
  //         form.setFieldsValue({
  //           gestionnaire:  client.gestionnaireName,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching client details:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchClient();
  // }, [id]);

    const handleEdit = async (formData) => {
    try {
      const response = await axios.put(`/lead/${id}`, formData);
      if (response.status === 200) {
        alert("Modifications enregistrées avec succès !");
        setClient(response.data.chat);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated");
      return;
    }
    try {
      const response = await axios.delete(`/lead/${id}/delete-comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        alert("Commentaire supprimé avec succès !");
        setComments(response.data.commentaires);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  const renderStatusTag = (statut) => {
    const statusMap = {
      client: { color: 'green', text: 'Client' },
      prospect: { color: 'blue', text: 'Prospect' },
      ancien_client: { color: 'orange', text: 'Ancien Client' }
    };
    const status = statusMap[statut] || { color: 'gray', text: statut };
    return <Tag color={status.color}>{status.text}</Tag>;
  };

  const renderCategoryTag = (categorie) => {
    const categoryMap = {
      particulier: { color: 'purple', text: 'Particulier' },
      professionnel: { color: 'cyan', text: 'Professionnel' },
      entreprise: { color: 'geekblue', text: 'Entreprise' }
    };
    const category = categoryMap[categorie] || { color: 'gray', text: categorie };
    return <Tag color={category.color}>{category.text}</Tag>;
  };

  // const hasDigitalData = client && (
  //   client.agence && 
  //   client.assurances_interessees && 
  //   client.rappel_at && 
  //   client.comment
  // );
  const hasDigitalData = client && (
    // Check if it has meaningful digital data, not just empty values
    (client.agence && ["LENS", "VALENCIENNES", "LILLE"].includes(client.agence)) ||
    (client.assurances_interessees && client.assurances_interessees.length > 0 && 
     client.assurances_interessees.some(assurance => assurance && assurance.trim() !== "")) ||
    (client.rappel_at && new Date(client.rappel_at) > new Date()) ||
    (client.comment && client.comment.trim() !== "")
  );

  if (loading) {
    return <div className="text-center my-10">Chargement en cours...</div>;
  }

  if (!client) {
    return <div className="text-center my-10">Client non trouvé</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
     
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
  {/* Client Name Section */}
  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 w-full sm:w-auto">
    <Title 
      level={3} 
      className="mb-0 flex items-center flex-wrap gap-2"
      style={{ marginBottom: 0 }}
    >
      <span className="flex items-center">
        <UserOutlined className="mr-2" />
        {client.civilite === 'societe' ? client.denomination_commerciale : `${client.prenom} ${client.nom}`}
      </span>
      <span className="flex gap-2">
        {renderStatusTag(client.statut)}
        {renderCategoryTag(client.categorie)}
        {hasDigitalData && <Tag color="blue">Client Digital</Tag>}
      </span>
    </Title>
  </div>

  {/* Buttons Section */}
  <Space 
    size="small" 
    className="w-full sm:w-auto justify-end"
    wrap
  >
    <Button 
      type="primary" 
      icon={<EditOutlined />}
      className="text-xs sm:text-sm"
      onClick={showModal}
    >
      <span className="hidden xs:inline">Modifier</span>
      <span className="xs:hidden">Modif.</span>
    </Button>
  </Space>
</div>

      <Modal
        title={
          <div className="bg-gray-100 p-3 -mx-6 -mt-6 flex justify-between items-center sticky top-0 z-10 border-b">
            <span className="font-medium text-sm">
              MODIFIER LE CLIENT
            </span>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>
        }
        open={isModalOpen}
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
        }}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
        closeIcon={null}
      >
        <div
          className="h-full overflow-y-auto ml-4 w-full"
          style={{ scrollbarWidth: "thin" }}
        >
          <Form
            form={form}
            onFinish={handleEdit}
            layout="vertical"
            className="space-y-2 w-full"
          >
            {/* === INFORMATIONS GÉNÉRALES === */}
            <h2 className="text-sm font-semibold mt-3 mb-2">
              INFORMATIONS GÉNÉRALES
            </h2>

            {/* Catégorie */}
            <Form.Item
              label={<span className="text-xs font-medium">CATÉGORIE</span>}
              name="categorie"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
                onChange={() =>
                  form.setFieldsValue({
                    denomination_commerciale: undefined,
                    raison_sociale: undefined,
                    siret: undefined,
                  })
                }
              >
                <Option value="particulier">Particulier</Option>
                <Option value="professionnel">Professionnel</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </Form.Item>

            {/* Statut */}
            <Form.Item
              label={<span className="text-xs font-medium">STATUS</span>}
              name="statut"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="client">Client</Option>
                <Option value="prospect">Prospect</Option>
                <Option value="ancien_client">Ancien client</Option>
              </Select>
            </Form.Item>

            {/* Civilité */}
            <Form.Item
              label={<span className="text-xs font-medium">CIVILITÉ</span>}
              name="civilite"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="monsieur">M.</Option>
                <Option value="madame">Mme</Option>
                <Option value="mademoiselle">Mlle</Option>
                <Option value="societe">Société</Option>
              </Select>
            </Form.Item>
            {hasDigitalData && (
              <>
                <h2 className="text-sm font-semibold mt-6 mb-2">
                  INFORMATIONS DIGITALES
                </h2>

                {/* Agence */}
                <Form.Item
                  label={<span className="text-xs font-medium">AGENCE</span>}
                  name="agence"
                  className="mb-0"
                >
                  <Select
                    className="w-full text-xs h-7"
                    placeholder="-- Choisissez l'agence --"
                  >
                    <Option value="LENS">LENS</Option>
                    <Option value="VALENCIENNES">VALENCIENNES</Option>
                    <Option value="LILLE">LILLE</Option>
                  </Select>
                </Form.Item>

                {/* Assurances intéressées */}
                <Form.Item
                  label={<span className="text-xs font-medium">ASSURANCES INTÉRESSÉES</span>}
                  name="assurances_interessees"
                  className="mb-0"
                >
                  <Select
                    mode="multiple"
                    className="w-full text-xs"
                    placeholder="-- Sélectionnez les assurances --"
                  >
                    <Option value="Assurance auto">Assurance auto</Option>
                    <Option value="Assurance habitation">Assurance habitation</Option>
                    <Option value="Assurance santé">Assurance santé</Option>
                    <Option value="Assurance vie">Assurance vie</Option>
                    <Option value="Autre">Autre</Option>
                  </Select>
                </Form.Item>

                {/* Date de rappel */}
                <Form.Item
                  label={<span className="text-xs font-medium">DATE DE RAPPEL</span>}
                  name="rappel_at"
                  className="mb-0"
                >
                  <DatePicker
                    className="w-full text-xs h-7"
                    format="DD/MM/YYYY"
                    // showTime
                    placeholder="Sélectionnez la date de rappel"
                  />
                </Form.Item>

                {/* Commentaire digital */}
                <Form.Item
                  label={<span className="text-xs font-medium">COMMENTAIRE DIGITAL</span>}
                  name="comment"
                  className="mb-0"
                >
                  <Input.TextArea
                    rows={3}
                    className="w-full text-xs"
                    placeholder="Commentaire digital..."
                  />
                </Form.Item>
              </>
            )}

            {/* === INFORMATIONS PERSONNELLES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              INFORMATIONS PERSONNELLES
            </h2>

            {/* Nom */}
            <Form.Item
              label={<span className="text-xs font-medium">NOM</span>}
              name="nom"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Nom" />
            </Form.Item>

            {/* Nom de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">NOM DE NAISSANCE</span>
              }
              name="nom_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Nom de naissance"
              />
            </Form.Item>

            {/* Prénom */}
            <Form.Item
              label={<span className="text-xs font-medium">PRÉNOM</span>}
              name="prenom"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Prénom" />
            </Form.Item>

            {/* Date de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">DATE DE NAISSANCE</span>
              }
              name="date_naissance"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <DatePicker className="w-full text-xs h-7" format="DD/MM/YYYY" />
            </Form.Item>

            {/* Pays de naissance */}
           <Form.Item
            label={
              <span className="text-xs font-medium">PAYS DE NAISSANCE</span>
            }
            name="pays_naissance"
            className="mb-0"
            rules={[{ required: false, message: "Ce champ est obligatoire" }]}
          >
            <Input 
              className="w-full text-xs h-7" 
              placeholder="Ex: France, Belgique, Suisse..." 
            />
          </Form.Item>

            {/* Code postal de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  CODE POSTAL DE NAISSANCE
                </span>
              }
              name="code_postal_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Code postal de naissance"
              />
            </Form.Item>

            {/* Commune de naissance */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMMUNE DE NAISSANCE
                </span>
              }
              name="commune_naissance"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Commune de naissance"
              />
            </Form.Item>

            {/* Situation familiale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  SITUATION FAMILIALE
                </span>
              }
              name="situation_famille"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="celibataire">Célibataire</Option>
                <Option value="marie">Marié(e)</Option>
                <Option value="pacsé">Pacsé(e)</Option>
                <Option value="divorce">Divorcé(e)</Option>
                <Option value="veuf">Veuf(ve)</Option>
                <Option value="concubinage">Concubinage</Option>
              </Select>
            </Form.Item>

            {/* Enfants à charge */}
            <Form.Item
              label={
                <span className="text-xs font-medium">ENFANTS À CHARGE</span>
              }
              name="enfants_charge"
              className="mb-0"
            >
              <InputNumber
                className="w-full text-xs h-7"
                min={0}
                placeholder="Nombre d'enfants à charge"
              />
            </Form.Item>

            {/* === ADRESSE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">ADRESSE</h2>

            {/* N° et libellé de la voie */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  N° ET LIBELLÉ DE LA VOIE
                </span>
              }
              name="numero_voie"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: 12 rue des Fleurs"
              />
            </Form.Item>

            {/* Complément d'adresse */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  COMPLÉMENT D'ADRESSE
                </span>
              }
              name="complement_adresse"
              className="mb-0"
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Ex: Bâtiment B, Appartement 12"
              />
            </Form.Item>

            {/* Lieu-dit */}
            <Form.Item
              label={<span className="text-xs font-medium">LIEU-DIT</span>}
              name="lieu_dit"
              className="mb-0"
            >
              <Input className="w-full text-xs h-7" placeholder="Lieu-dit" />
            </Form.Item>

            {/* Code postal */}
            <Form.Item
              label={<span className="text-xs font-medium">CODE POSTAL</span>}
              name="code_postal"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Code postal" />
            </Form.Item>

            {/* Ville */}
            <Form.Item
              label={<span className="text-xs font-medium">VILLE</span>}
              name="ville"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Input className="w-full text-xs h-7" placeholder="Ville" />
            </Form.Item>

            {/* Inscrit sur Bloctel */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  INSCRIT SUR BLOCTEL
                </span>
              }
              name="bloctel"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Radio.Group>
                <Radio value="oui">Oui</Radio>
                <Radio value="non">Non</Radio>
              </Radio.Group>
            </Form.Item>

            {/* === COORDONNÉES === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">COORDONNÉES</h2>

            {/* Téléphone portable */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE PORTABLE</span>
              }
              name="portable"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
                inputProps={{
                  required: false,
                }}
              />
            </Form.Item>

            {/* Téléphone fixe */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TÉLÉPHONE FIXE</span>
              }
              name="fixe"
              className="mb-0"
            >
              <PhoneInput
                country={"fr"}
                inputClass="w-full text-xs h-7"
                containerClass="w-full"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="text-xs font-medium">EMAIL</span>}
              name="email"
              className="mb-0"
              rules={[
                { required: false, message: "Ce champ est obligatoire" },
                { type: "email", message: "Email non valide" },
              ]}
            >
              <Input
                type="email"
                className="w-full text-xs h-7"
                placeholder="Email"
              />
            </Form.Item>

            <>
              <h2 className="text-sm font-semibold mt-6 mb-2">
                INFORMATIONS PROFESSIONNELLES
              </h2>

              {/* Activité de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    ACTIVITÉ DE L'ENTREPRISE
                  </span>
                }
                name="activite_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Activité principale"
                />
              </Form.Item>

              {/* Catégorie socioprofessionnelle */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CATÉGORIE SOCIOPROFESSIONNELLE
                  </span>
                }
                name="categorie_professionnelle"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="agriculteur">Agriculteur</Option>
                  <Option value="artisan">Artisan, commerçant</Option>
                  <Option value="cadre">Cadre</Option>
                  <Option value="prof_interm">Profession intermédiaire</Option>
                  <Option value="employe">Employé</Option>
                  <Option value="ouvrier">Ouvrier</Option>
                  <Option value="retraite">Retraité</Option>
                  <Option value="sans_activite">
                    Sans activité professionnelle
                  </Option>
                </Select>
              </Form.Item>

              {/* Domaine d'activité */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DOMAINE D'ACTIVITÉ
                  </span>
                }
                name="domaine_activite"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                  showSearch
                >
                  <Option value="agriculture">Agriculture</Option>
                  <Option value="industrie">Industrie</Option>
                  <Option value="construction">Construction</Option>
                  <Option value="commerce">Commerce</Option>
                  <Option value="transport">Transport</Option>
                  <Option value="information">Information/Communication</Option>
                  <Option value="finance">Finance/Assurance</Option>
                  <Option value="immobilier">Immobilier</Option>
                  <Option value="scientifique">
                    Activités scientifiques/techniques
                  </Option>
                  <Option value="administratif">
                    Activités administratives
                  </Option>
                  <Option value="public">Administration publique</Option>
                  <Option value="enseignement">Enseignement</Option>
                  <Option value="sante">Santé/Social</Option>
                  <Option value="art">Arts/Spectacles</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">STATUT JURIDIQUE</span>
                }
                name="statut_juridique"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sasu">SASU</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="micro">Micro-entreprise</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    DÉNOMINATION COMMERCIALE
                  </span>
                }
                name="denomination_commerciale"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Nom commercial"
                />
              </Form.Item>

              {/* Raison sociale */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">RAISON SOCIALE</span>
                }
                name="raison_sociale"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Raison sociale"
                />
              </Form.Item>

              {/* Date de création */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">DATE DE CRÉATION</span>
                }
                name="date_creation"
                className="mb-0"
              >
                <DatePicker
                  className="w-full text-xs h-7"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              {/* SIRET */}
              <Form.Item
                label={<span className="text-xs font-medium">SIRET</span>}
                name="siret"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                  // {
                  //   pattern: /^\d{14}$/,
                  //   message: "Le SIRET doit contenir 14 chiffres",
                  // },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Numéro SIRET (14 chiffres)"
                />
              </Form.Item>

              {/* Forme juridique */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">FORME JURIDIQUE</span>
                }
                name="forme_juridique"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="sarl">SARL</Option>
                  <Option value="eurl">EURL</Option>
                  <Option value="sas">SAS</Option>
                  <Option value="sa">SA</Option>
                  <Option value="sci">SCI</Option>
                  <Option value="ei">Entreprise individuelle</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>

              {/* Téléphone de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    TÉLÉPHONE DE L'ENTREPRISE
                  </span>
                }
                name="telephone_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <PhoneInput
                  country={"fr"}
                  inputClass="w-full text-xs h-7"
                  containerClass="w-full"
                />
              </Form.Item>

              {/* Email de l'entreprise */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    EMAIL DE L'ENTREPRISE
                  </span>
                }
                name="email_entreprise"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                  { type: "email", message: "Email non valide" },
                ]}
              >
                <Input
                  type="email"
                  className="w-full text-xs h-7"
                  placeholder="Email professionnel"
                />
              </Form.Item>

              {/* Site internet */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">SITE INTERNET</span>
                }
                name="site_internet"
                className="mb-0"
                rules={[{ type: "url", message: "URL non valide" }]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="https://www.example.com"
                />
              </Form.Item>

              {/* Code NAF */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">CODE NAF/APE</span>
                }
                name="code_naf"
                className="mb-0"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Ex: 62.02A"
                />
              </Form.Item>

              {/* IDCC */}
              <Form.Item
                label={<span className="text-xs font-medium">IDCC</span>}
                name="idcc"
                className="mb-0"
              >
                <Input
                  className="w-full text-xs h-7"
                  placeholder="Identifiant de convention collective"
                />
              </Form.Item>

              {/* Bénéficiaires effectifs */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    BÉNÉFICIAIRES EFFECTIFS
                  </span>
                }
                name="beneficiaires_effectifs"
                className="mb-0"
              >
                <Input.TextArea
                  rows={3}
                  className="w-full text-xs"
                  placeholder="Liste des bénéficiaires effectifs"
                />
              </Form.Item>

              {/* Chiffre d'affaires */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    CHIFFRE D'AFFAIRES (€)
                  </span>
                }
                name="chiffre_affaires"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                  }
                  parser={(value) => value.replace(/\s/g, "")}
                  min={0}
                  placeholder="Montant en euros"
                />
              </Form.Item>

              {/* Effectif */}
              <Form.Item
                label={<span className="text-xs font-medium">EFFECTIF</span>}
                name="effectif"
                className="mb-0"
              >
                <InputNumber
                  className="w-full text-xs h-7"
                  min={0}
                  placeholder="Nombre d'employés"
                />
              </Form.Item>

              {/* Période de clôture d'exercice */}
              <Form.Item
                label={
                  <span className="text-xs font-medium">
                    PÉRIODE DE CLÔTURE D'EXERCICE
                  </span>
                }
                name="periode_cloture"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs h-7"
                  placeholder="-- Choisissez --"
                >
                  <Option value="31/12">31 décembre</Option>
                  <Option value="30/06">30 juin</Option>
                  <Option value="31/03">31 mars</Option>
                  <Option value="30/09">30 septembre</Option>
                  <Option value="autre">Autre</Option>
                </Select>
              </Form.Item>
            </>

            {/* === SÉCURITÉ SOCIALE === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">
              SÉCURITÉ SOCIALE
            </h2>

            {/* Régime de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  RÉGIME DE SÉCURITÉ SOCIALE
                </span>
              }
              name="regime_securite_sociale"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
                <Option value="general">Régime général</Option>
                <Option value="agricole">Régime agricole</Option>
                <Option value="independant">Régime indépendant</Option>
                <Option value="fonctionnaire">Fonction publique</Option>
                <Option value="autre">Autre régime</Option>
              </Select>
            </Form.Item>

            {/* Numéro de sécurité sociale */}
            <Form.Item
              label={
                <span className="text-xs font-medium">
                  NUMÉRO DE SÉCURITÉ SOCIALE
                </span>
              }
              name="num_secu"
              className="mb-0"
              rules={[
                { required: false, message: "Ce champ est obligatoire" },
                // {
                //   pattern:
                //     /^[12][0-9]{2}[0-1][0-9](2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$/,
                //   message: "Format invalide (15 chiffres + clé)",
                // },
              ]}
            >
              <Input
                className="w-full text-xs h-7"
                placeholder="Numéro de sécurité sociale"
              />
            </Form.Item>

            {/* === GESTION === */}
            <h2 className="text-sm font-semibold mt-6 mb-2">GESTION</h2>

            {/* Type d'origine */}
            <Form.Item
              label={
                <span className="text-xs font-medium">TYPE D'ORIGINE</span>
              }
              name="type_origine"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez --"
              >
               <Option value="co_courtage">Co-courtage</Option>
                <Option value="indicateur_affaires">
                  Indicateur d'affaires
                </Option>
                <Option value="weedo_market">Weedo market</Option>
                <Option value="recommandation">Recommandation</Option>
                <Option value="reseaux_sociaux">Réseaux sociaux</Option>
                <Option value="autre">Autre</Option>
              </Select>
            </Form.Item>
         <Form.Item
  label={<span className="text-xs font-medium">GESTIONNAIRE</span>}
  className="mb-0"
>
  <Input
    className="w-full text-xs h-7"
    value={client?.gestionnaireName || "Non spécifié"}
    disabled
  />
</Form.Item>

{/* Hidden fields for form submission */}
<Form.Item name="gestionnaire" noStyle>
  <Input type="hidden" />
</Form.Item>
<Form.Item name="gestionnaireModel" noStyle>
  <Input type="hidden" />
</Form.Item>
<Form.Item name="gestionnaireName" noStyle>
  <Input type="hidden" />
</Form.Item>

            <Form.Item
              label={<span className="text-xs font-medium">CRÉÉ PAR</span>}
              name="cree_par"
              className="mb-0"
              rules={[{ required: false, message: "Ce champ est obligatoire" }]}
            >
              <Select
                className="w-full text-xs h-7"
                placeholder="-- Choisissez un créateur --"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {users.map((user) => {
                  const displayName =
                    user.userType === "admin"
                      ? user.name
                      : `${user.nom} ${user.prenom}`;

                  return (
                    <Option
                      key={`${user.userType}-${user._id}`}
                      value={displayName}
                    >
                      {displayName} (
                      {user.userType === "admin" ? "Admin" : "Commercial"})
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Intermédiaire(s) */}
             <Form.Item
                          label={<span className="text-xs font-medium">INTERMÉDIAIRE</span>}
                          name="intermediaire"
                          className="mb-0"
                          rules={[{ required: false, message: "Ce champ est obligatoire" }]}
                        >
                          <Select
                            className="w-full text-xs h-7"
                            placeholder="-- Choisissez un intermediaire--"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {users.map((user) => {
                              const displayName =
                                user.userType === "admin"
                                  ? user.name
                                  : `${user.nom} ${user.prenom}`;
            
                              return (
                                <Option
                                  key={`${user.userType}-${user._id}`}
                                  value={displayName}
                                >
                                  {displayName} (
                                  {user.userType === "admin" ? "Admin" : "Commercial"})
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
      
          </Form>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full text-xs h-7 mt-2 mb-4"
            onClick={() => form.submit()}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </Modal>

      {/* Main content with tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="client-details-tabs">
        {/* General Information Tab */}
        <TabPane tab="Informations Générales" key="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hasDigitalData && (
              <Card title={<><BankOutlined /> Informations Digitales</>}>
                <Descriptions column={1} bordered size="small">
                  {client.agence && (
                    <Descriptions.Item label="Agence">
                      <Tag color="blue">{client.agence}</Tag>
                    </Descriptions.Item>
                  )}
                  {client.assurances_interessees && client.assurances_interessees.length > 0 && (
                    <Descriptions.Item label="Assurances intéressées">
                      <Space direction="vertical" size="small">
                        {client.assurances_interessees.map((assurance, index) => (
                          <Tag key={index} color="green">{assurance}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                  {client.rappel_at && (
                    <Descriptions.Item label="Rappel programmé">
                      <div className="flex items-center gap-2">
                        <CalendarOutlined />
                        {formatDate(client.rappel_at)}
                      </div>
                    </Descriptions.Item>
                  )}
                  {client.comment && (
                    <Descriptions.Item label="Commentaire">
                      <div className="bg-gray-50 p-3 rounded border">
                        <MessageOutlined className="mr-2" />
                        {client.comment}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
            {/* Personal Information Card */}
            <Card title={<><IdcardOutlined /> Informations Personnelles</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Civilité">{client.civilite}</Descriptions.Item>
                {client.nom_naissance && <Descriptions.Item label="Nom de naissance">{client.nom_naissance}</Descriptions.Item>}
                <Descriptions.Item label="Date de naissance">{formatDate(client.date_naissance)}</Descriptions.Item>
                <Descriptions.Item label="Pays de naissance">{client.pays_naissance}</Descriptions.Item>
                {client.code_postal_naissance && <Descriptions.Item label="Code postal de naissance">{client.code_postal_naissance}</Descriptions.Item>}
                {client.commune_naissance && <Descriptions.Item label="Commune de naissance">{client.commune_naissance}</Descriptions.Item>}
                <Descriptions.Item label="Situation familiale">{client.situation_famille}</Descriptions.Item>
                <Descriptions.Item label="Enfants à charge">{client.enfants_charge || '0'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Contact Information Card */}
            <Card title={<><MailOutlined /> Coordonnées</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Email">
                  <a href={`mailto:${client.email}`}>{client.email}</a>
                </Descriptions.Item>
                <Descriptions.Item label="Portable">
                  <a href={`tel:${client.portable}`}>{client.portable}</a>
                </Descriptions.Item>
                {client.fixe && <Descriptions.Item label="Téléphone fixe">
                  <a href={`tel:${client.fixe}`}>{client.fixe}</a>
                </Descriptions.Item>}
                <Descriptions.Item label="Bloctel">{client.bloctel === 'oui' ? 'Oui' : 'Non'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Address Information Card */}
            <Card title={<><HomeOutlined /> Adresse</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Adresse">
                  {client.numero_voie} {client.complement_adresse}<br />
                  {client.lieu_dit && <>{client.lieu_dit}<br /></>}
                  {client.code_postal} {client.ville}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Professional Information Card - shown for professionals/companies */}
            {(client.categorie !== 'particulier') && (
              <Card title={<><ShopOutlined /> Informations Professionnelles</>}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Activité">{client.activite_entreprise}</Descriptions.Item>
                  <Descriptions.Item label="Catégorie professionnelle">{client.categorie_professionnelle}</Descriptions.Item>
                  <Descriptions.Item label="Domaine d'activité">{client.domaine_activite}</Descriptions.Item>
                  {client.categorie === 'entreprise' && (
                    <>
                      <Descriptions.Item label="Statut juridique">{client.statut_juridique}</Descriptions.Item>
                      <Descriptions.Item label="Dénomination commerciale">{client.denomination_commerciale}</Descriptions.Item>
                      {client.raison_sociale && <Descriptions.Item label="Raison sociale">{client.raison_sociale}</Descriptions.Item>}
                      <Descriptions.Item label="SIRET">{client.siret}</Descriptions.Item>
                      <Descriptions.Item label="Date de création">{formatDate(client.date_creation)}</Descriptions.Item>
                      <Descriptions.Item label="Téléphone entreprise">
                        <a href={`tel:${client.telephone_entreprise}`}>{client.telephone_entreprise}</a>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email entreprise">
                        <a href={`mailto:${client.email_entreprise}`}>{client.email_entreprise}</a>
                      </Descriptions.Item>
                      {client.site_internet && <Descriptions.Item label="Site internet">
                        <a href={client.site_internet} target="_blank" rel="noopener noreferrer">{client.site_internet}</a>
                      </Descriptions.Item>}
                      <Descriptions.Item label="Code NAF">{client.code_naf}</Descriptions.Item>
                      {client.idcc && <Descriptions.Item label="IDCC">{client.idcc}</Descriptions.Item>}
                      {client.chiffre_affaires && <Descriptions.Item label="Chiffre d'affaires">{client.chiffre_affaires} €</Descriptions.Item>}
                      {client.effectif && <Descriptions.Item label="Effectif">{client.effectif}</Descriptions.Item>}
                      {client.periode_cloture && <Descriptions.Item label="Période de clôture">{client.periode_cloture}</Descriptions.Item>}
                    </>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Social Security Information Card */}
            <Card title={<><SafetyOutlined /> Sécurité Sociale</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Régime">{client.regime_securite_sociale}</Descriptions.Item>
                <Descriptions.Item label="Numéro de sécurité sociale">{client.num_secu}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Management Information Card */}
            <Card title={<><TeamOutlined /> Gestion</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Origine">{client.type_origine}</Descriptions.Item>
                <Descriptions.Item label="Gestionnaire">{client.gestionnaireName}</Descriptions.Item>
                
                <Descriptions.Item label="Créé par">{client.cree_par}</Descriptions.Item>
                {client.intermediaire && client.intermediaire.length > 0 && (
                  <Descriptions.Item label="Intermédiaires">
                    {client.intermediaire}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Date de création">{formatDate(client.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Dernière mise à jour">{formatDate(client.updatedAt)}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </TabPane>

        {/* Other Tabs */}
        <TabPane tab="Devis" key="devis">
          <DevisTabContent />
        </TabPane>
        <TabPane tab="Contrats" key="contrats">
          <ContratTabContent />
        </TabPane>
        <TabPane tab="Documents" key="documents">
          <DocumentTabContent />
        </TabPane>
        <TabPane tab="Sinistres" key="sinistres">
          <SinistreTabContent />
        </TabPane>
        <TabPane tab="Réclamations" key="reclamations">
          <ReclamtionTabContent />
        </TabPane>
        <TabPane tab="Notes" key="notes">
                     <div className="p-4">
               <div className="flex items-center gap-4 mb-4">
                 <Input
                   placeholder="Ajouter une note..."
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   className="flex-1 p-4"
                 />
                 <Button
                   type="primary"
                   onClick={handleAddNote}
                 >
                   Enregistrer
                 </Button>
               </div>
                <div className="space-y-3">
                  {comments?.length ? (
                    comments.map((comment) => (
                      <Card key={comment._id} className="shadow-sm">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-gray-800">{comment.text}</p>
                            <p className="text-gray-500 text-sm mt-1">
                              Ajouté le: {new Date(comment.addedAt || Date.now()).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteComment(comment._id)}
                          />
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Aucune note pour le moment.
                    </p>
                  )}
                </div>
              </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ClientDetailPage;