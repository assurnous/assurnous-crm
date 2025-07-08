import React, { useState } from "react";
import { BankOutlined, WarningOutlined, EuroOutlined, PieChartOutlined, UserOutlined, TeamOutlined, ShopOutlined } from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const repartitionData = {
  assureurs: [
    { name: "Assureur 1", count: 125, percentage: 25, primeTTC: "300,000 €" },
    { name: "Assureur 2", count: 175, percentage: 35, primeTTC: "420,000 €" },
    { name: "Assureur 3", count: 200, percentage: 40, primeTTC: "480,000 €" },
  ],
  risques: [
    { name: "Risque A", count: 250, percentage: 50, primeTTC: "600,000 €" },
    { name: "Risque B", count: 150, percentage: 30, primeTTC: "360,000 €" },
    { name: "Risque C", count: 100, percentage: 20, primeTTC: "240,000 €" },
  ],
};

const commissionData = {
  assureurs: {
    totalCommission: "37,000 €",
    totalPrevisionnel: "45,500 €",
    totalCount: 285
  },
  risques: {
    totalCommission: "70,000 €",
    totalPrevisionnel: "80,000 €",
    totalCount: 400
  }
};

const primeTotals = {
  primeTTC: "1,200,000 €",
  totalPercentage: "100%"
};

const clientStats = {
  particuliers: { count: 320, percentage: 40 },
  professionnels: { count: 240, percentage: 30 },
  entreprises: { count: 240, percentage: 30 },
  total: 800
};

const MiniPieChart = ({ percentage, color }) => {
  const data = {
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: [color, 'rgba(243, 244, 246, 0.7)'],
      borderWidth: 0,
    }],
  };

  const options = {
    cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    events: []
  };

  return (
    <div className="relative w-10 h-10">
      <Pie data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium" style={{ color: color.replace('0.7', '1') }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const CategoryButton = ({ 
  active, 
  onClick, 
  icon, 
  title, 
  activeColor 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-3 rounded-lg border transition-colors ${
        active
          ? `border-${activeColor}-300 bg-${activeColor}-50`
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className={`text-lg mb-1 ${
          active ? `text-${activeColor}-600` : "text-gray-500"
        }`}>
          {icon}
        </div>
        <div className={`font-medium text-sm ${
          active ? `text-${activeColor}-800` : "text-gray-700"
        }`}>
          {title}
        </div>
      </div>
    </button>
  );
};

const StatBox = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-${color}-50 rounded-lg p-3 border border-${color}-100 flex-1`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-600">{title}</div>
          <div className={`text-lg font-bold text-${color}-900`}>{value}</div>
        </div>
        <div className={`text-${color}-600`}>{icon}</div>
      </div>
    </div>
  );
};

const ClientStatBox = ({ title, count, percentage, icon, color }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full bg-${color}-100 mr-3`}>
            {React.cloneElement(icon, { className: `text-${color}-600` })}
          </div>
          <div>
            <div className="text-xs text-gray-600">{title}</div>
            <div className="text-lg font-bold text-gray-800">{count}</div>
          </div>
        </div>
        <MiniPieChart percentage={percentage} color={`rgba(${color === 'blue' ? '59, 130, 246' : color === 'green' ? '16, 185, 129' : color === 'purple' ? '168, 85, 247' : '239, 68, 68'}, 0.7)`} />
      </div>
    </div>
  );
};

const Home = () => {
  const [activeRepartition, setActiveRepartition] = useState("assureurs");
  const [activeCommission, setActiveCommission] = useState("assureurs");
  const [showPrevisionnel, setShowPrevisionnel] = useState(false);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Répartition contrat */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">Répartition contrat</h3>
          
          {/* First row with buttons and Prime TTC total */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 w-1/2">
              <CategoryButton
                active={activeRepartition === "assureurs"}
                onClick={() => setActiveRepartition("assureurs")}
                icon={<BankOutlined />}
                title="Assureurs"
                activeColor="purple"
              />
              <CategoryButton
                active={activeRepartition === "risques"}
                onClick={() => setActiveRepartition("risques")}
                icon={<WarningOutlined />}
                title="Risques"
                activeColor="purple"
              />
            </div>
            
            <div className=" px-4 py-3  ml-6">
              <div className="flex items-center">
                <div>
                  <div className="text-xs text-gray-600">Prime TTC total</div>
                  <div className="text-sm font-bold ">{primeTotals.primeTTC}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract list */}
          <ul className="space-y-2">
            {repartitionData[activeRepartition].map(({ name, count, percentage, primeTTC }, i) => (
              <li key={i} className="flex items-center p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-16 text-right">
                      <span className="font-medium">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        {activeRepartition === "assureurs" ? "contrats" : "risques"}
                      </span>
                    </span>
                    
                    <div className="ml-2">
                      <MiniPieChart percentage={percentage} color="rgba(107, 33, 168, 0.7)" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Commissions / Chiffre d'affaire */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">Commissions / Chiffre d'affaire</h3>
          
          {/* First row with buttons and Total de frais de courtage */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 w-2/3">
              <CategoryButton
                active={activeCommission === "assureurs"}
                onClick={() => setActiveCommission("assureurs")}
                icon={<BankOutlined />}
                title="Assureurs"
                activeColor="green"
              />
              <CategoryButton
                active={activeCommission === "risques"}
                onClick={() => setActiveCommission("risques")}
                icon={<WarningOutlined />}
                title="Risques"
                activeColor="green"
              />
            </div>
            
            <div className=" px-4 py-3 ml-6  w-1/2">
              <div className="flex items-center">
                <div>
                  <div className="text-xs text-gray-600">Total des frais de courtage</div>
                  <div className="text-center text-sm font-bold ">52,000 €</div>
                </div>
              </div>
            </div>
          </div>

          {/* Second row with results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-6 mt-6 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Commissions</span>
                <EuroOutlined className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-900">
                {commissionData[activeCommission].totalCommission}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Prévisionnel</span>
                <PieChartOutlined className="text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-900">
                {commissionData[activeCommission].totalPrevisionnel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Card: Statistiques clients */}
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-4">Statistiques clients</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ClientStatBox 
            title="Particuliers" 
            count={clientStats.particuliers.count} 
            percentage={clientStats.particuliers.percentage} 
            icon={<UserOutlined />} 
            color="blue"
          />
          <ClientStatBox 
            title="Professionnels" 
            count={clientStats.professionnels.count} 
            percentage={clientStats.professionnels.percentage} 
            icon={<TeamOutlined />} 
            color="green"
          />
          <ClientStatBox 
            title="Entreprises" 
            count={clientStats.entreprises.count} 
            percentage={clientStats.entreprises.percentage} 
            icon={<ShopOutlined />} 
            color="purple"
          />
          <ClientStatBox 
            title="Total clients" 
            count={clientStats.total} 
            percentage={100} 
            icon={<TeamOutlined />} 
            color="red"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;