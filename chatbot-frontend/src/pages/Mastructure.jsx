
import React from 'react';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Tabs, Table, Button, Select, Space } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;

const Mastructure = () => {
  // Sample data for tables
  const codesAssureursColumns = [
    { title: 'Assureur', dataIndex: 'assureur', key: 'assureur' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Produit(s)', dataIndex: 'produits', key: 'produits' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    { title: 'Site web', dataIndex: 'site', key: 'site' },
    { title: 'Intern/Extern', dataIndex: 'type', key: 'type' },
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

  const bordereauxColumns = [
    { title: 'Nom du bordereaux', dataIndex: 'name', key: 'name' },
    { title: 'Date du bordereaux', dataIndex: 'date', key: 'date' },
    { title: 'Date de début de période', dataIndex: 'start', key: 'start' },
    { title: 'Date de fin de période', dataIndex: 'end', key: 'end' },
    { 
      title: 'Actions', 
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link">View</Button>
          <Button type="link">Download</Button>
        </Space>
      )
    }
  ];

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

  return (
    <div className="font-sans p-5 max-w-6xl mx-auto">
      {/* Title */}
      <h1 className="text-[#6a0dad] mb-4 text-xl font-semibold">GESTION CABINET</h1>
      
      {/* Company Info Section */}
      <div className="flex gap-10 bg-white p-8 rounded-lg shadow-sm mb-6">
        {/* Left Section - Information */}
        <div className="flex-1">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="m-0 text-xl text-gray-800">Assurnous EAB assurance</h2>
            <EditOutlined className="ml-3 text-[#6a0dad] cursor-pointer text-base" />
          </div>
          
          {/* Information Items */}
          <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-5 items-start">
            {/* Raison Sociale */}
            <div className="font-semibold text-gray-600 py-2">Raison Sociale:</div>
            <div className="py-2 text-sm">GROUPE E.A.B Assurances</div>
            
            {/* Dirigeant */}
            <div className="font-semibold text-gray-600 py-2">Dirigeant:</div>
            <div className="py-2 text-sm">
              <div>MR EBANNAHMARAN Fikri</div>
              <div>06 33 68 78 58</div>
              <div>direction@assurnous.com</div>
            </div>
            
            {/* Coordonnées */}
            <div className="font-semibold text-gray-600 py-2">Coordonnées:</div>
            <div className="py-2 text-sm">
              <div>70 rue de la gare</div>
              <div>62300 - Lens</div>
              <div>06 33 68 78 58</div>
              <div>direction@assurnous.com</div>
            </div>
          </div>
        </div>
        
        {/* Right Section - Logo */}
        <div className="flex-1 flex justify-center items-start">
          <div className="w-48 h-48 bg-gray-50 rounded-lg flex justify-center items-center border border-dashed border-gray-300 shadow-inner">
            <span className="text-gray-400 text-sm">Company Logo</span>
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

          {/* Codes Assureurs Tab */}
          <TabPane tab="Codes assureurs" key="2">
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />}>
                AJOUTER UN CODE ASSUREUR EXTERNE
              </Button>
            </div>
            <Table 
              columns={[
                ...codesAssureursColumns.map((col) => ({
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
              locale={{ emptyText: 'Aucun code assureur enregistré' }}
              className="custom-table text-xs sm:text-sm"
            />
          </TabPane>

          {/* Bordereaux Tab */}
          <TabPane tab="Bordereaux" key="3">
            <div className="mb-4">
              <span className="mr-2">Mois du bordereaux:</span>
              <Select placeholder="--Choisissez--" style={{ width: 200 }}>
                <Option value="janvier">Janvier</Option>
                <Option value="fevrier">Février</Option>
                {/* Add more months as needed */}
              </Select>
            </div>
            <Table 
              columns={[
                ...bordereauxColumns.map((col) => ({
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
              locale={{ emptyText: 'Aucun bordereau enregistré' }}
              className="custom-table text-xs sm:text-sm"
            />
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