
// import React from 'react';
// import { EditOutlined, PlusOutlined } from '@ant-design/icons';
// import { Tabs, Table, Button, Select, Space } from 'antd';

// const { TabPane } = Tabs;
// const { Option } = Select;

// const Mastructure = () => {
//   // Sample data for tables
//   const codesAssureursColumns = [
//     { title: 'Assureur', dataIndex: 'assureur', key: 'assureur' },
//     { title: 'Code', dataIndex: 'code', key: 'code' },
//     { title: 'Produit(s)', dataIndex: 'produits', key: 'produits' },
//     { title: 'Status', dataIndex: 'status', key: 'status' },
//     { title: 'Contact', dataIndex: 'contact', key: 'contact' },
//     { title: 'Site web', dataIndex: 'site', key: 'site' },
//     { title: 'Intern/Extern', dataIndex: 'type', key: 'type' },
//     { 
//       title: 'Actions', 
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="link">Edit</Button>
//           <Button type="link" danger>Delete</Button>
//         </Space>
//       )
//     }
//   ];

//   const bordereauxColumns = [
//     { title: 'Nom du bordereaux', dataIndex: 'name', key: 'name' },
//     { title: 'Date du bordereaux', dataIndex: 'date', key: 'date' },
//     { title: 'Date de début de période', dataIndex: 'start', key: 'start' },
//     { title: 'Date de fin de période', dataIndex: 'end', key: 'end' },
//     { 
//       title: 'Actions', 
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="link">View</Button>
//           <Button type="link">Download</Button>
//         </Space>
//       )
//     }
//   ];

//   const documentsColumns = [
//     { title: 'Famille', dataIndex: 'family', key: 'family' },
//     { title: 'Type', dataIndex: 'type', key: 'type' },
//     { title: 'Collaborateur concerné', dataIndex: 'collab', key: 'collab' },
//     { title: 'Date de l\'ajout', dataIndex: 'date', key: 'date' },
//     { 
//       title: 'Actions', 
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="link">View</Button>
//           <Button type="link" danger>Delete</Button>
//         </Space>
//       )
//     }
//   ];

//   const notesColumns = [
//     { title: 'Note', dataIndex: 'note', key: 'note' },
//     { title: 'Date', dataIndex: 'date', key: 'date' },
//     { title: 'Auteur', dataIndex: 'author', key: 'author' },
//     { 
//       title: 'Actions', 
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="link">Edit</Button>
//           <Button type="link" danger>Delete</Button>
//         </Space>
//       )
//     }
//   ];

//   return (
//     <div className="font-sans p-5 max-w-6xl mx-auto">
//       {/* Title */}
//       <h1 className="text-[#6a0dad] mb-4 text-xl font-semibold">GESTION CABINET</h1>
      
//       {/* Company Info Section */}
//       <div className="flex gap-10 bg-white p-8 rounded-lg shadow-sm mb-6">
//         {/* Left Section - Information */}
//         <div className="flex-1">
//           <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
//             <h2 className="m-0 text-xl text-gray-800">Assurnous EAB assurance</h2>
//             <EditOutlined className="ml-3 text-[#6a0dad] cursor-pointer text-base" />
//           </div>
          
//           {/* Information Items */}
//           <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-5 items-start">
//             {/* Raison Sociale */}
//             <div className="font-semibold text-gray-600 py-2">Raison Sociale:</div>
//             <div className="py-2 text-sm">GROUPE E.A.B Assurances</div>
            
//             {/* Dirigeant */}
//             <div className="font-semibold text-gray-600 py-2">Dirigeant:</div>
//             <div className="py-2 text-sm">
//               <div>MR EBANNAHMARAN Fikri</div>
//               <div>06 33 68 78 58</div>
//               <div>direction@assurnous.com</div>
//             </div>
            
//             {/* Coordonnées */}
//             <div className="font-semibold text-gray-600 py-2">Coordonnées:</div>
//             <div className="py-2 text-sm">
//               <div>70 rue de la gare</div>
//               <div>62300 - Lens</div>
//               <div>06 33 68 78 58</div>
//               <div>direction@assurnous.com</div>
//             </div>
//           </div>
//         </div>
        
//         {/* Right Section - Logo */}
//         <div className="flex-1 flex justify-center items-start">
//           <div className="w-48 h-48 bg-gray-50 rounded-lg flex justify-center items-center border border-dashed border-gray-300 shadow-inner">
//             <span className="text-gray-400 text-sm">Company Logo</span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs Section */}
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <Tabs defaultActiveKey="1">
//           {/* Details Tab */}
//           <TabPane tab="Détails" key="1">
//             <div className="text-gray-500 text-center py-8">
//               Aucune information supplémentaire disponible
//             </div>
//           </TabPane>

//           {/* Documents Tab */}
//           <TabPane tab="Autres documents" key="4">
//             <div className="mb-4 flex justify-end">
//               <Button type="primary" icon={<PlusOutlined />}>
//                 AJOUTER UN DOCUMENT
//               </Button>
//             </div>
//             <Table 
//               columns={[
//                 ...documentsColumns.map((col) => ({
//                   ...col,
//                   title: (
//                     <div className="flex flex-col items-center">
//                       <div className="text-xs">{col.title}</div>
//                     </div>
//                   ),
//                 })),
//               ]}
//               dataSource={[]} 
//               rowKey="id"
//               locale={{ emptyText: 'Aucun document enregistré' }}
//               className="custom-table text-xs sm:text-sm"
//             />
//           </TabPane>

//           {/* Notes Tab */}
//           <TabPane tab="Notes" key="5">
//             <div className="mb-4 flex justify-start">
//               <Button type="primary" icon={<PlusOutlined />}>
//                 AJOUTER UNE NOTE
//               </Button>
//             </div>
//             <Table 
//               columns={[
//                 ...notesColumns.map((col) => ({
//                   ...col,
//                   title: (
//                     <div className="flex flex-col items-center">
//                       <div className="text-xs">{col.title}</div>
//                     </div>
//                   ),
//                 })),
//               ]}
//               dataSource={[]} 
//               rowKey="id"
//               locale={{ emptyText: 'Aucune note enregistrée' }}
//               className="custom-table text-xs sm:text-sm"
//             />
//           </TabPane>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default Mastructure;
import React, { useState, useEffect } from 'react';
import { EditOutlined, PlusOutlined, SaveOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tabs, Table, Button, Select, Space, Form, Input, Modal, message, Spin, Alert, Card, Row, Col, Tag, Divider } from 'antd';
import logo from '../assets/assur.png'
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Mastructure = () => {
  const [cabinet, setCabinet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [form] = Form.useForm();

  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      console.log(('decoded', decoded))
      return {
        name: decoded.name || `${decoded.nom || ''} ${decoded.prenom || ''}`.trim(),
        email: decoded.email,
        phone: decoded.phone || ''
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };


  // const fetchCabinetData = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem('token');
      
  //     // Get user info from token
  //     const currentUser = getUserFromToken();
  //     setUserInfo(currentUser);
      
  //     const [cabinetRes, historyRes] = await Promise.all([
  //       axios.get('/cabinet', {
  //         headers: { Authorization: `Bearer ${token}` }
  //       }),
  //       axios.get('/cabinet/history', {
  //         headers: { Authorization: `Bearer ${token}` }
  //       })
  //     ]);
      
  //     setCabinet(cabinetRes.data);
  //     setLastUpdate(historyRes.data);
      
  //     // Set form values if data exists
  //     if (cabinetRes.data) {
  //       form.setFieldsValue({
  //         raisonSociale: cabinetRes.data.raisonSociale || '',
  //         adresse: cabinetRes.data.coordonnees?.adresse || '',
  //         codePostal: cabinetRes.data.coordonnees?.codePostal || '',
  //         ville: cabinetRes.data.coordonnees?.ville || '',
  //         phoneCoordonnés: cabinetRes.data.coordonnees?.phoneCoordonnés || '',
  //         coordonneesEmail: cabinetRes.data.coordonnees?.email || ''
  //       });
  //     }
      
  //   } catch (error) {
  //     console.error('Error fetching cabinet data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
// In Mastructure.js
const fetchCabinetData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const [cabinetRes, historyRes] = await Promise.all([
      axios.get('/cabinet', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/cabinet/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    console.log('Cabinet data for current user:', cabinetRes.data);
    console.log('Current user ID from token:', getUserFromToken());
    
    setCabinet(cabinetRes.data);
    setLastUpdate(historyRes.data);
    
    // Set form values
    if (cabinetRes.data) {
      form.setFieldsValue({
        raisonSociale: cabinetRes.data.raisonSociale || '',
        phone: cabinetRes.data.dirigeant?.phone || getUserFromToken()?.phone || '',
        adresse: cabinetRes.data.coordonnees?.adresse || '',
        codePostal: cabinetRes.data.coordonnees?.codePostal || '',
        ville: cabinetRes.data.coordonnees?.ville || '',
        phoneCoordonnés: cabinetRes.data.coordonnees?.phoneCoordonnés || '',
        coordonneesEmail: cabinetRes.data.coordonnees?.email || ''
      });
    }
    
  } catch (error) {
    console.error('Error fetching cabinet data:', error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchCabinetData();
  }, []);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const cabinetData = {
        raisonSociale: values.raisonSociale,
        dirigeant: {
          phone: values.phone
        },
        coordonnees: {
          adresse: values.adresse,
          codePostal: values.codePostal,
          ville: values.ville,
          phoneCoordonnés: values.phoneCoordonnés,
          email: values.coordonneesEmail
        }
      };
      
      console.log('Saving cabinet data for current user');
      
      const response = await axios.post('/cabinet', cabinetData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      message.success('Informations mises à jour avec succès');
      setEditing(false);
      fetchCabinetData(); // This will now fetch user-specific data
      
    } catch (error) {
      console.error('Save error:', error);
      message.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };
// const handleSave = async (values) => {
//   try {
//     setSaving(true);
//     const token = localStorage.getItem('token');
    
//     // Get current user info from token
//     const currentUser = getUserFromToken();
    
//     const cabinetData = {
//       raisonSociale: values.raisonSociale,
//       dirigeant: {
//         phone: values.phone // Send phone only
//       },
//       coordonnees: {
//         adresse: values.adresse,
//         codePostal: values.codePostal,
//         ville: values.ville,
//         phoneCoordonnés: values.phoneCoordonnés,
//         email: values.coordonneesEmail
//       }
//     };
    
//     console.log('Sending cabinet data:', cabinetData); // Debug log
    
//     const response = await axios.post('/cabinet', cabinetData, {
//       headers: { 
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     message.success('Informations mises à jour avec succès');
//     setEditing(false);
//     fetchCabinetData();
    
//   } catch (error) {
//     console.error('Save error:', error.response?.data || error.message);
//     message.error('Erreur lors de la mise à jour: ' + (error.response?.data?.error || error.message));
//   } finally {
//     setSaving(false);
//   }
// };

// Update the toggleEdit function to include phone field:
const toggleEdit = () => {
  if (!editing && cabinet) {
    form.setFieldsValue({
      raisonSociale: cabinet.raisonSociale || '',
      phone: cabinet.dirigeant?.phone || '', // Add this line
      adresse: cabinet.coordonnees?.adresse || '',
      codePostal: cabinet.coordonnees?.codePostal || '',
      ville: cabinet.coordonnees?.ville || '',
      phoneCoordonnés: cabinet.coordonnees?.phoneCoordonnés || '',
      coordonneesEmail: cabinet.coordonnees?.email || ''
    });
  }
  setEditing(!editing);
};

  // Toggle edit mode
  // const toggleEdit = () => {
  //   if (!editing && cabinet) {
  //     form.setFieldsValue({
  //       raisonSociale: cabinet.raisonSociale || '',
  //       adresse: cabinet.coordonnees?.adresse || '',
  //       codePostal: cabinet.coordonnees?.codePostal || '',
  //       ville: cabinet.coordonnees?.ville || '',
  //       phoneCoordonnés: cabinet.coordonnees?.phoneCoordonnés || '',
  //       coordonneesEmail: cabinet.coordonnees?.email || ''
  //     });
  //   }
  //   setEditing(!editing);
  // };

  // Sample data for tables (keep your original tables)
  const documentsColumns = [
    { title: 'Famille', dataIndex: 'family', key: 'family' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Collaborateur concerné', dataIndex: 'collab', key: 'collab' },
    { title: 'Date de l\'ajout', dataIndex: 'date', key: 'date' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link">View</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      )
    }
  ];

  const notesColumns = [
    { title: 'Note', dataIndex: 'note', key: 'note' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Auteur', dataIndex: 'author', key: 'author' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="font-sans p-5 max-w-6xl mx-auto">
      {/* Title */}
      <h1 className="text-[#6a0dad] mb-4 text-xl font-semibold">GESTION CABINET</h1>
      
      {/* Update Alert */}
      {lastUpdate?.updatedByName && (
        <Alert
          message={`Dernière mise à jour par ${lastUpdate.updatedByName} 
          (${lastUpdate.updatedByModel === 'Admin' ? 'Admin' : 'Manager'}) 
          le ${new Date(lastUpdate.lastUpdated).toLocaleDateString('fr-FR')}`}
          type="info"
          showIcon
          className="mb-4"
        />
      )}
      
      {/* Company Info Section */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg shadow-sm mb-6">
        {/* Left Section - Information */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="m-0 text-xl text-gray-800">{cabinet?.name || "Assurnous EAB assurance"}</h2>
            {editing ? (
              <Space>
                <Button onClick={() => setEditing(false)}>
                  Annuler
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={() => form.submit()}
                  loading={saving}
                >
                  Enregistrer
                </Button>
              </Space>
            ) : (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={toggleEdit}
              >
                Modifier
              </Button>
            )}
          </div>
          
          {/* Form for editing or display */}
          <Form form={form} layout="vertical" onFinish={handleSave}>
            {/* Information Items */}
            <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-5 items-start">
              {/* Raison Sociale */}
              <div className="font-semibold text-gray-600 py-2">Raison Sociale:</div>
              <div className="py-2">
                {editing ? (
                  <Form.Item
                    name="raisonSociale"
                    rules={[{ required: true, message: 'La raison sociale est requise' }]}
                    className="mb-0"
                  >
                    <Input placeholder="GROUPE E.A.B Assurances" />
                  </Form.Item>
                ) : (
                  <div className="text-sm">
                    {cabinet?.raisonSociale || (
                      <span className="text-gray-400 italic">Non définie</span>
                    )}
                  </div>
                )}
              </div>
              
            {/* Dirigeant */}
{/* Dirigeant */}
<div className="font-semibold text-gray-600 py-2">Dirigeant:</div>
<div className="py-2 text-sm">
  {editing ? (
    <div className="space-y-2">
      {/* Name and Email - Read only (auto-filled from token) */}
      <div className="p-2 bg-gray-50 rounded border">
        <div className="font-medium">
          {getUserFromToken()?.name || cabinet?.dirigeant?.nom || "Non disponible"}
        </div>
        <div className="mt-1">
          {getUserFromToken()?.email || cabinet?.dirigeant?.email || "Non disponible"}
        </div>
      </div>
      
      {/* Phone - Editable */}
      <Form.Item
        name="phone"
        rules={[{ required: true, message: 'Le téléphone du dirigeant est requis' }]}
        className="mb-0"
      >
        <Input 
          placeholder="06 33 68 78 58" 
          addonBefore={<span style={{ width: '80px' }}>Téléphone:</span>}
        />
      </Form.Item>
    </div>
  ) : (
    <div>
      <div className="font-medium">
        {cabinet?.dirigeant?.nom || getUserFromToken()?.name || "Non disponible"}
      </div>
      <div>
        {/* Show phone from cabinet data */}
        {cabinet?.dirigeant?.phone || (
          <span className="text-gray-400 italic">Téléphone non défini</span>
        )}
      </div>
      <div>
        {cabinet?.dirigeant?.email || getUserFromToken()?.email || (
          <span className="text-gray-400 italic">Email non défini</span>
        )}
      </div>
    </div>
  )}
</div>
              
              {/* Coordonnées */}
              <div className="font-semibold text-gray-600 py-2">Coordonnées:</div>
              <div className="py-2 text-sm">
                {editing ? (
                  <div className="space-y-2">
                    <Form.Item
                      name="adresse"
                      rules={[{ required: true, message: 'L\'adresse est requise' }]}
                      className="mb-2"
                    >
                      <Input placeholder="70 rue de la gare" />
                    </Form.Item>
                    <div className="flex gap-2">
                      <Form.Item
                        name="codePostal"
                        rules={[{ required: true, message: 'Le code postal est requis' }]}
                        className="flex-1 mb-0"
                      >
                        <Input placeholder="62300" />
                      </Form.Item>
                      <Form.Item
                        name="ville"
                        rules={[{ required: true, message: 'La ville est requise' }]}
                        className="flex-1 mb-0"
                      >
                        <Input placeholder="Lens" />
                      </Form.Item>
                    </div>
                    <Form.Item
                      name="phoneCoordonnés"
                      rules={[{ required: true, message: 'Le téléphone est requis' }]}
                      className="mb-2"
                    >
                      <Input placeholder="06 33 68 78 58" />
                    </Form.Item>
                    <Form.Item
                      name="coordonneesEmail"
                      rules={[
                        { required: true, message: 'L\'email est requis' },
                        { type: 'email', message: 'Email invalide' }
                      ]}
                      className="mb-0"
                    >
                      <Input placeholder="direction@assurnous.com" />
                    </Form.Item>
                  </div>
                ) : (
                  <>
                    <div>{cabinet?.coordonnees?.adresse || (
                      <span className="text-gray-400 italic">Adresse non définie</span>
                    )}</div>
                    <div>
                      {cabinet?.coordonnees?.codePostal ? (
                        `${cabinet.coordonnees.codePostal} - ${cabinet.coordonnees.ville}`
                      ) : (
                        <span className="text-gray-400 italic">Code postal et ville non définis</span>
                      )}
                    </div>
                    <div>{cabinet?.coordonnees?.phoneCoordonnés || (
                      <span className="text-gray-400 italic">Téléphone non défini</span>
                    )}</div>
                    <div>{cabinet?.coordonnees?.email || (
                      <span className="text-gray-400 italic">Email non défini</span>
                    )}</div>
                  </>
                )}
              </div>
            </div>
          </Form>
        </div>
        
        {/* Right Section - Logo */}
        <div className="flex-1 flex justify-center items-start">
          <div className="w-48 h-48 rounded-lg overflow-hidden shadow-inner border border-gray-200">
            <img 
              src={logo}
              alt="Company Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Tabs defaultActiveKey="1">
          {/* Details Tab */}
          <TabPane tab="Détails" key="1">
            <div className="text-gray-500 text-center py-8">
              Aucune information supplémentaire disponible
            </div>
          </TabPane>

          {/* Documents Tab */}
          <TabPane tab="Autres documents" key="4">
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />}>
                AJOUTER UN DOCUMENT
              </Button>
            </div>
            <Table 
              columns={[
                ...documentsColumns.map((col) => ({
                  ...col,
                  title: (
                    <div className="flex flex-col items-center">
                      <div className="text-xs">{col.title}</div>
                    </div>
                  ),
                })),
              ]}
              dataSource={[]} 
              rowKey="id"
              locale={{ emptyText: 'Aucun document enregistré' }}
              className="custom-table text-xs sm:text-sm"
            />
          </TabPane>

          {/* Notes Tab */}
          <TabPane tab="Notes" key="5">
            <div className="mb-4 flex justify-start">
              <Button type="primary" icon={<PlusOutlined />}>
                AJOUTER UNE NOTE
              </Button>
            </div>
            <Table 
              columns={[
                ...notesColumns.map((col) => ({
                  ...col,
                  title: (
                    <div className="flex flex-col items-center">
                      <div className="text-xs">{col.title}</div>
                    </div>
                  ),
                })),
              ]}
              dataSource={[]} 
              rowKey="id"
              locale={{ emptyText: 'Aucune note enregistrée' }}
              className="custom-table text-xs sm:text-sm"
            />
          </TabPane>
        </Tabs>
      </div>

  
    </div>
  );
};

export default Mastructure;