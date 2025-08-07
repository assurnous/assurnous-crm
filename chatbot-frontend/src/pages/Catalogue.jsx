import { useState } from "react";
import { Button, Card, Empty, Tag, Pagination } from "antd";
import { ASSUREURS, RISQUES } from "../constants";


const PAGE_SIZE = 20;

const Catalogue = () => {
  const [activeTab, setActiveTab] = useState("assureurs");
  const [currentPage, setCurrentPage] = useState(1);

  // Safe defaults if constants aren't imported properly
  const assureursList = ASSUREURS || [];
  const risquesList = RISQUES || [];

  const currentData = activeTab === "assureurs" ? assureursList : risquesList;
  const totalItems = currentData.length;

  // Calculate current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return currentData.slice(startIndex, endIndex);
  };

  return (
    <div className="catalogue-container">
      {/* Header Section */}
      <div className="catalogue-header">
        <h1 className="catalogue-title">Notre Catalogue</h1>
       
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "assureurs" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("assureurs");
            setCurrentPage(1);
          }}
        >
          Assureurs
        </button>
        <button
          className={`tab-button ${activeTab === "produits" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("produits");
            setCurrentPage(1);
          }}
        >
          Produits (Risques)
        </button>
      </div>

      {/* Content Section */}
      <div className="catalogue-content">
        {currentData.length > 0 ? (
          <>
            <div className="items-grid">
              {getCurrentPageItems().map((item) => (
                <Card
                  key={item.value}
                  className="item-card"
                  hoverable
                >
                  <div className="item-content">
                    <h3 className="item-label">{item.label}</h3>
                    <Tag color={activeTab === "assureurs" ? "blue" : "geekblue"} className="item-value">
                      {item.value}
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={totalItems}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty description={`Aucun ${activeTab === "assureurs" ? "assureur" : "produit"} disponible`} />
        )}
      </div>
    </div>
  );
};

export default Catalogue;