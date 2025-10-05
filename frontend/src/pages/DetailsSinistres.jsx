import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tabs,
  Button,
  Input,
  List,
  Upload,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Popconfirm,
  Form,
  Select,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  FileTextOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

const { TextArea } = Input;
const { TabPane } = Tabs;

const DetailsSinistres = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sinistre, setSinistre] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

  // États pour l'édition
  const [editingComment, setEditingComment] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editNoteText, setEditNoteText] = useState("");
  const [isEditCommentModalVisible, setIsEditCommentModalVisible] =
    useState(false);
  const [isEditNoteModalVisible, setIsEditNoteModalVisible] = useState(false);

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  useEffect(() => {
    fetchSinistreDetails();
    fetchCommentaires();
    fetchNotes();
    fetchDocuments();
  }, [id]);

  const fetchSinistreDetails = async () => {
    try {
      const response = await axios.get(`/sinistres-detail/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSinistre(response.data.data);
    } catch (error) {
      console.error("Error fetching sinistre details:", error);
      message.error("Erreur lors du chargement des détails du sinistre");
    } finally {
      setLoading(false);
    }
  };


  const fetchCommentaires = async () => {
    try {
      const response = await axios.get(`/sinistres/${id}/commentaires`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });
      setCommentaires(response.data);
    } catch (error) {
      console.error("Error fetching commentaires:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`/sinistres/${id}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // COMMENT OPERATIONS
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `/sinistres/${id}/commentaires`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
          },
        }
      );

      setCommentaires((prev) => [response.data, ...prev]);
      setNewComment("");
      message.success("Commentaire ajouté avec succès");
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.content);
    setIsEditCommentModalVisible(true);
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) {
      message.error("Le commentaire ne peut pas être vide");
      return;
    }

    try {
      const response = await axios.put(
        `/commentaires/${editingComment._id}`,
        { content: editCommentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
          },
        }
      );

      setCommentaires((prev) =>
        prev.map((comment) =>
          comment._id === editingComment._id ? response.data : comment
        )
      );
      setIsEditCommentModalVisible(false);
      setEditingComment(null);
      setEditCommentText("");
      message.success("Commentaire modifié avec succès");
    } catch (error) {
      console.error("Error updating comment:", error);
      message.error(
        error.response?.data?.error ||
          "Erreur lors de la modification du commentaire"
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/commentaires/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });

      setCommentaires((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      message.success("Commentaire supprimé avec succès");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error(
        error.response?.data?.error ||
          "Erreur lors de la suppression du commentaire"
      );
    }
  };

  // NOTE OPERATIONS
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await axios.post(
        `/sinistres/${id}/notes`,
        { content: newNote, type: "interne" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
          },
        }
      );

      setNotes((prev) => [response.data, ...prev]);
      setNewNote("");
      setIsNoteModalVisible(false);
      message.success("Note interne ajoutée avec succès");
    } catch (error) {
      console.error("Error adding note:", error);
      message.error("Erreur lors de l'ajout de la note");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setEditNoteText(note.content);
    setIsEditNoteModalVisible(true);
  };

  const handleUpdateNote = async () => {
    if (!editNoteText.trim()) {
      message.error("La note ne peut pas être vide");
      return;
    }

    try {
      const response = await axios.put(
        `/notes/${editingNote._id}`,
        { content: editNoteText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
          },
        }
      );

      setNotes((prev) =>
        prev.map((note) =>
          note._id === editingNote._id ? response.data : note
        )
      );
      setIsEditNoteModalVisible(false);
      setEditingNote(null);
      setEditNoteText("");
      message.success("Note modifiée avec succès");
    } catch (error) {
      console.error("Error updating note:", error);
      message.error(
        error.response?.data?.error ||
          "Erreur lors de la modification de la note"
      );
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });

      setNotes((prev) => prev.filter((note) => note._id !== noteId));
      message.success("Note supprimée avec succès");
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error(
        error.response?.data?.error ||
          "Erreur lors de la suppression de la note"
      );
    }
  };

  // Vérifier si l'utilisateur est l'auteur
  const isAuthor = (item) => {
    return item.createdBy?._id === decodedToken?.userId;
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/sinistres/${id}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Upload document
  const handleFileUpload = async (values) => {
    const formData = new FormData();
    formData.append("document", values.document.file);
    formData.append("description", values.description || "");

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/sinistres/${id}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": decodedToken?.userId,
            "x-user-role": decodedToken?.role,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDocuments((prev) => [response.data.data, ...prev]);
      setIsUploadModalVisible(false);
      uploadForm.resetFields();
      message.success("Document uploadé avec succès");
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error(
        error.response?.data?.message || "Erreur lors de l'upload du document"
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId) => {
    console.log("Document deleted:", documentId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/documentes/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": decodedToken?.userId,
          "x-user-role": decodedToken?.role,
        },
      });

      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      message.success("Document supprimé avec succès");
    } catch (error) {
      console.error("Error deleting document:", error);
      message.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression du document"
      );
    }
  };

  // Download document
  const handleDownloadDocument = async (document) => {
    try {
      window.open(document.firebaseUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      message.error("Erreur lors du téléchargement du document");
    }
  };

  // Colonnes de la table des documents
  const documentColumns = [
    {
      title: "Nom du fichier",
      dataIndex: "filename",
      key: "filename",
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
          {/* {record.category && (
            <Tag color="blue" className="ml-2">
              {record.category}
            </Tag>
          )} */}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "fileType",
      key: "fileType",
      render: (type) => {
        const typeMap = {
          "application/pdf": "PDF",
          "image/jpeg": "JPEG",
          "image/png": "PNG",
          "image/jpg": "JPG",
          "application/msword": "DOC",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "DOCX",
        };
        return typeMap[type] || type;
      },
    },
    {
      title: "Taille",
      dataIndex: "fileSize",
      key: "fileSize",
      render: (size) => {
        if (!size) return "N/A";
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
      },
    },
    {
      title: "Uploadé par",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      render: (user) =>
        user ? `${user.nom || ""} ${user.prenom || ""}`.trim() : "N/A",
    },
    {
      title: "Date d'upload",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record)}
          >
            Télécharger
          </Button>
          {record.uploadedBy?._id === decodedToken?.userId && (
            <Popconfirm
              title="Supprimer le document"
              description="Êtes-vous sûr de vouloir supprimer ce document ?"
              onConfirm={() => handleDeleteDocument(record._id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Supprimer
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const formatDate = (date) => {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  const getStatusColor = (status) => {
    const colors = {
      en_cours: "blue",
      clo: "green",
      reouvert: "orange",
    };
    return colors[status] || "default";
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!sinistre) {
    return <div>Sinistre non trouvé</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header et Informations Générales (identique) */}
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sinistres")}
          className="mb-4"
        >
          Retour à la liste
        </Button>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Détails du Sinistre: {sinistre.numeroSinistre}
          </h1>
          <Tag color={getStatusColor(sinistre.statutSinistre)}>
            {sinistre.statutSinistre}
          </Tag>
        </div>
      </div>

      {/* Informations Générales */}
      <Card title="Informations Générales" className="mb-6">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="N° Sinistre" span={1}>
            {sinistre.numeroSinistre}
          </Descriptions.Item>
          <Descriptions.Item label="Statut" span={1}>
            <Tag color={getStatusColor(sinistre.statutSinistre)}>
              {sinistre.statutSinistre === "en_cours"
                ? "En cours"
                : sinistre.statutSinistre === "clo"
                ? "Clôturé"
                : "Réouvert"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Sinistré" span={1}>
            {sinistre.sinistreExist === "oui" && sinistre.sinistreDetails
              ? `${sinistre.sinistreDetails.nom} ${sinistre.sinistreDetails.prenom}`
              : `${sinistre.sinistreNom} ${sinistre.sinistrePrenom}`}
          </Descriptions.Item>
          <Descriptions.Item label="N° Contrat" span={1}>
            {sinistre.contratExist === "oui" && sinistre.contratDetails
              ? sinistre.contratDetails.contractNumber
              : sinistre.contratNumber || sinistre.sinistreInput}
          </Descriptions.Item>

          <Descriptions.Item label="Risque" span={1}>
            {sinistre.risque}
          </Descriptions.Item>
          <Descriptions.Item label="Assureur" span={1}>
            {sinistre.assureur}
          </Descriptions.Item>

          <Descriptions.Item label="Date Sinistre" span={1}>
            {formatDate(sinistre.dateSinistre)}
          </Descriptions.Item>
          <Descriptions.Item label="Date Déclaration" span={1}>
            {formatDate(sinistre.dateDeclaration)}
          </Descriptions.Item>

          <Descriptions.Item label="Type Sinistre" span={1}>
            {sinistre.typeSinistre === "dommage_corporel"
              ? "Dommage corporel"
              : sinistre.typeSinistre === "dommage_materiel"
              ? "Dommage matériel"
              : "Dommage corporel et matériel"}
          </Descriptions.Item>
          <Descriptions.Item label="Responsabilité" span={1}>
            {sinistre.responsabilite}
          </Descriptions.Item>

          <Descriptions.Item label="Montant Sinistre" span={1}>
            {sinistre.montantSinistre
              ? `${sinistre.montantSinistre.toLocaleString()} €`
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Délégation" span={1}>
            {sinistre.delegation === "oui" ? "Oui" : "Non"}
          </Descriptions.Item>

          <Descriptions.Item label="Coordonnées Expert" span={2}>
            {sinistre.coordonnees_expert || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Créé le" span={1}>
            {formatDate(sinistre.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Modifié le" span={1}>
            {formatDate(sinistre.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      {/* Commentaires Section avec édition/suppression */}
      <Card title="Commentaires" className="mb-6">
        <div className="mb-4">
          <TextArea
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
          />
          <Button type="primary" onClick={handleAddComment} className="mt-2">
            Ajouter Commentaire
          </Button>
        </div>

        <List
          dataSource={commentaires}
          renderItem={(comment) => (
            <List.Item
              actions={
                isAuthor(comment)
                  ? [
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditComment(comment)}
                      >
                        Modifier
                      </Button>,
                      <Popconfirm
                        title="Supprimer le commentaire"
                        description="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
                        onConfirm={() => handleDeleteComment(comment._id)}
                        okText="Oui"
                        cancelText="Non"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          Supprimer
                        </Button>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                title={
                  <div className="flex justify-between">
                    <span>
                      {comment.createdBy?.name ||
                        `${comment.createdBy?.nom || ""} ${
                          comment.createdBy?.prenom || ""
                        }`}
                    </span>
                    <small className="text-gray-500">
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="ml-2 text-xs text-blue-500">
                          (modifié)
                        </span>
                      )}
                    </small>
                  </div>
                }
                description={comment.content}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Tabs for Notes and Documents */}
      <Tabs defaultActiveKey="documents">
        <TabPane tab="Documents" key="documents">
          <Card>
            {/* <div className="mb-4">
               <Upload
                beforeUpload={(file) => {
                  handleFileUpload(file);
                  return false; // Prevent automatic upload
                }}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Uploader Document
                </Button>
              </Upload>
            </div> */}
            <div className="mb-4">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
              >
                Uploader Document
              </Button>
            </div>

            <Table
              columns={[
                ...documentColumns.map((col) => ({
                  ...col,
                  title: (
                    <div className="flex flex-col items-center">
                      <div className="text-xs">{col.title}</div>
                    </div>
                  ),
                })),
              ]}
              dataSource={documents}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Notes Internes" key="notes">
          <Card>
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNoteModalVisible(true)}
              >
                Ajouter Note Interne
              </Button>
            </div>

            <List
              dataSource={notes}
              renderItem={(note) => (
                <List.Item
                  actions={
                    isAuthor(note)
                      ? [
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditNote(note)}
                          >
                            Modifier
                          </Button>,
                          <Popconfirm
                            title="Supprimer la note"
                            description="Êtes-vous sûr de vouloir supprimer cette note ?"
                            onConfirm={() => handleDeleteNote(note._id)}
                            okText="Oui"
                            cancelText="Non"
                          >
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              Supprimer
                            </Button>
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    title={
                      <div className="flex justify-between">
                        <span>
                          Note Interne -{" "}
                          {note.createdBy?.name ||
                            `${note.createdBy?.nom || ""} ${
                              note.createdBy?.prenom || ""
                            }`}
                        </span>
                        <small className="text-gray-500">
                          {formatDate(note.createdAt)}
                          {note.updatedAt !== note.createdAt && (
                            <span className="ml-2 text-xs text-blue-500">
                              (modifiée)
                            </span>
                          )}
                        </small>
                      </div>
                    }
                    description={note.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
      <Modal
        title="Uploader un document"
        open={isUploadModalVisible}
        onCancel={() => {
          setIsUploadModalVisible(false);
          uploadForm.resetFields();
        }}
        footer={null}
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleFileUpload}>
          <Form.Item
            name="document"
            label="Document"
            rules={[
              { required: true, message: "Veuillez sélectionner un fichier" },
            ]}
          >
            <Upload
              beforeUpload={(file) => {
                // Empêcher l'upload automatique
                return false;
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Sélectionner le fichier</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="description" label="Description (optionnel)">
            <Input.TextArea rows={3} placeholder="Description du document" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Uploader
              </Button>
              <Button
                onClick={() => {
                  setIsUploadModalVisible(false);
                  uploadForm.resetFields();
                }}
              >
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modals */}
      {/* Modal pour ajouter une note */}
      <Modal
        title="Ajouter une Note Interne"
        open={isNoteModalVisible}
        onCancel={() => setIsNoteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsNoteModalVisible(false)}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddNote}>
            Ajouter
          </Button>,
        ]}
      >
        <TextArea
          rows={6}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Saisissez votre note interne..."
        />
      </Modal>

      {/* Modal pour éditer un commentaire */}
      <Modal
        title="Modifier le commentaire"
        open={isEditCommentModalVisible}
        onCancel={() => {
          setIsEditCommentModalVisible(false);
          setEditingComment(null);
          setEditCommentText("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsEditCommentModalVisible(false);
              setEditingComment(null);
              setEditCommentText("");
            }}
          >
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateComment}>
            Modifier
          </Button>,
        ]}
      >
        <TextArea
          rows={4}
          value={editCommentText}
          onChange={(e) => setEditCommentText(e.target.value)}
          placeholder="Modifier le commentaire..."
        />
      </Modal>

      {/* Modal pour éditer une note */}
      <Modal
        title="Modifier la note"
        open={isEditNoteModalVisible}
        onCancel={() => {
          setIsEditNoteModalVisible(false);
          setEditingNote(null);
          setEditNoteText("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsEditNoteModalVisible(false);
              setEditingNote(null);
              setEditNoteText("");
            }}
          >
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateNote}>
            Modifier
          </Button>,
        ]}
      >
        <TextArea
          rows={6}
          value={editNoteText}
          onChange={(e) => setEditNoteText(e.target.value)}
          placeholder="Modifier la note..."
        />
      </Modal>
    </div>
  );
};

export default DetailsSinistres;
