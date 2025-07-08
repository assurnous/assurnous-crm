import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tabs, Button, Card, Divider, Descriptions, Tag, Space, Typography, Input } from "antd";
import { 
  EditOutlined, 
  PlusOutlined, 
  UserAddOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  ShopOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  DeleteOutlined,
  
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

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
      alert("Could not add comment, please try again.");
    }
  };


  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/lead/${id}`);
        setClient(response.data.chat);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client details:", error);
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

    const handleEdit = async (formData) => {
    try {
      const response = await axios.put(`/lead/${id}`, formData);
      if (response.status === 200) {
        alert("Modifications enregistrées avec succès !");
        setLead(response.data.chat);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error saving changes, please try again.");
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
      alert("Could not delete comment, please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
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
    >
      <span className="hidden xs:inline">Modifier</span>
      <span className="xs:hidden">Modif.</span>
    </Button>
    <Button 
      icon={<PlusOutlined />}
      className="text-xs sm:text-sm"
    >
      <span className="hidden sm:inline">Ajouter un événement</span>
      <span className="sm:hidden">Événement</span>
    </Button>
    <Button 
      icon={<UserAddOutlined />}
      className="text-xs sm:text-sm"
    >
      <span className="hidden sm:inline">Ajouter un connecté</span>
      <span className="sm:hidden">Connecté</span>
    </Button>
  </Space>
</div>

      {/* Main content with tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="client-details-tabs">
        {/* General Information Tab */}
        <TabPane tab="Informations Générales" key="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Descriptions.Item label="Gestionnaire">{client.gestionnaire}</Descriptions.Item>
                <Descriptions.Item label="Créé par">{client.cree_par}</Descriptions.Item>
                {client.intermediaire && client.intermediaire.length > 0 && (
                  <Descriptions.Item label="Intermédiaires">
                    {client.intermediaire.join(', ')}
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
          <div className="p-4">
            <Text type="secondary">Contenu des devis à venir...</Text>
          </div>
        </TabPane>
        <TabPane tab="Contrats" key="contrats">
          <div className="p-4">
            <Text type="secondary">Contenu des contrats à venir...</Text>
          </div>
        </TabPane>
        <TabPane tab="Documents" key="documents">
          <div className="p-4">
            <Text type="secondary">Contenu des documents à venir...</Text>
          </div>
        </TabPane>
        <TabPane tab="Sinistres" key="sinistres">
          <div className="p-4">
            <Text type="secondary">Contenu des sinistres à venir...</Text>
          </div>
        </TabPane>
        <TabPane tab="Réclamations" key="reclamations">
          <div className="p-4">
            <Text type="secondary">Contenu des réclamations à venir...</Text>
          </div>
        </TabPane>
        <TabPane tab="Notes" key="notes">
                     <div className="p-4">
               <div className="flex items-center gap-4 mb-4">
                 <Input
                   placeholder="Ajouter une note..."
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   className="flex-1"
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
        <TabPane tab="Activités" key="activites">
          <div className="p-4">
            <Text type="secondary">Contenu des activités à venir...</Text>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ClientDetailPage;