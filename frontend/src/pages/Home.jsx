import React, { useState, useEffect } from "react";
import {
  BankOutlined,
  WarningOutlined,
  EuroOutlined,
  PieChartOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

ChartJS.register(ArcElement, Tooltip, Legend);

const MiniPieChart = ({ percentage, color }) => {
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, "rgba(243, 244, 246, 0.7)"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "65%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    events: [],
  };

  return (
    <div className="relative w-10 h-10">
      <Pie data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-xs font-medium"
          style={{ color: color.replace("0.7", "1") }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const CategoryButton = ({ active, onClick, icon, title, activeColor }) => {
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
        <div
          className={`text-lg mb-1 ${
            active ? `text-${activeColor}-600` : "text-gray-500"
          }`}
        >
          {icon}
        </div>
        <div
          className={`font-medium text-sm ${
            active ? `text-${activeColor}-800` : "text-gray-700"
          }`}
        >
          {title}
        </div>
      </div>
    </button>
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
        <MiniPieChart
          percentage={percentage}
          color={`rgba(${
            color === "blue"
              ? "59, 130, 246"
              : color === "green"
              ? "16, 185, 129"
              : color === "purple"
              ? "168, 85, 247"
              : "239, 68, 68"
          }, 0.7)`}
        />
      </div>
    </div>
  );
};

const Home = () => {
  const [activeRepartition, setActiveRepartition] = useState("assureurs");
  const [activeCommission, setActiveCommission] = useState("assureurs");
  const [stats, setStats] = useState({
    repartition: { assureurs: [], risques: [] },
    primeTotals: {},
    clientStats: {},
    commission: {
      assureurs: {
        totalCommission: 0,
        totalPrevisionnel: 0,
        totalBrokerageFees: 0,
        count: 0,
      },
      risques: {
        totalCommission: 0,
        totalPrevisionnel: 0,
        totalBrokerageFees: 0,
        count: 0,
      },
    },
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId;
  const userRole = decodedToken?.role;
  console.log('userRole:', userRole);
  const currentUserName = decodedToken?.name;
  console.log('currentUserName:', currentUserName);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [reclamationsRes, sinistresRes, clientsRes, contratsRes] =
          await Promise.all([
            axios.get("/reclamations"),
            axios.get("/sinistres"),
            axios.get("/data"),
            axios.get("/contrat"),
          ]);

        // 🟢 Ici on extrait les bons tableaux depuis les objets axios
        let reclamations = reclamationsRes.data?.data || [];
        let sinistres = sinistresRes.data?.data || [];
        let clients = clientsRes.data?.chatData || [];
        let contrats = contratsRes.data || [];

        // Filter data based on user role
        if (userRole === "Commercial") {
          // Filter to only show data managed by this commercial
          reclamations = reclamations.filter(
            (item) => item.prise_en_charge_par === currentUserName
          );
          sinistres = sinistres.filter(
            (item) => item.session?.name === currentUserName
          );
          clients = clients.filter(
            (client) => {
              const fullName = client.gestionnaire ? `${client.gestionnaire.nom} ${client.gestionnaire.prenom}` : '';
              return fullName === currentUserName;
            }
          );
          
          contrats = contrats.filter(
            (contract) => contract.gestionnaire === currentUserName
          );
        }

        const processedStats = processStats(
          reclamations,
          sinistres,
          clients,
          contrats
        );
        setStats(processedStats);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUserId, userRole, currentUserName]);

  const processStats = (reclamations, sinistres, clients, contrats) => {
    if (
      !Array.isArray(reclamations) ||
      !Array.isArray(sinistres) ||
      !Array.isArray(clients) ||
      !Array.isArray(contrats)
    ) {
      console.warn("Data is not iterable!", {
        reclamations,
        sinistres,
        clients,
        contrats,
      });
      return {
        repartition: { assureurs: [], risques: [] },
        commission: { assureurs: {}, risques: {} },
        primeTotals: {},
        clientStats: {
          particuliers: { count: 0, percentage: 0 },
          professionnels: { count: 0, percentage: 0 },
          entreprises: { count: 0, percentage: 0 },
          total: 0,
        },
      };
    }
      // Process contract data for the first card
  const assureurStats = {};
  const risqueStats = {};
  let totalPrimeTTC = 0;

  contrats.forEach((contract) => {
    // Process by insurer
    if (contract.insurer) {
      if (!assureurStats[contract.insurer]) {
        assureurStats[contract.insurer] = {
          count: 0,
          totalPrime: 0,
        };
      }
      assureurStats[contract.insurer].count++;
      assureurStats[contract.insurer].totalPrime += contract.prime || 0;
    }

    // Process by risk type
    if (contract.riskType) {
      if (!risqueStats[contract.riskType]) {
        risqueStats[contract.riskType] = {
          count: 0,
          totalPrime: 0,
        };
      }
      risqueStats[contract.riskType].count++;
      risqueStats[contract.riskType].totalPrime += contract.prime || 0;
    }

    // Calculate total prime
    totalPrimeTTC += contract.prime || 0;
  });

    // const assureurCounts = {};
    // const risqueCounts = {};
    // let totalPrimeTTC = 0;

    // [...reclamations, ...sinistres].forEach((item) => {
    //   assureurCounts[item.assureur] = (assureurCounts[item.assureur] || 0) + 1;

    //   if (item.risque) {
    //     risqueCounts[item.risque] = (risqueCounts[item.risque] || 0) + 1;
    //   }

    //   if (item.montantSinistre) {
    //     totalPrimeTTC += item.montantSinistre;
    //   }
    // });

    // Process client categories
    const clientCategories = {
      particuliers: 0,
      professionnels: 0,
      entreprises: 0,
    };

    clients.forEach((client) => {
      const type = client.categorie?.toLowerCase();
      if (type === "particulier") clientCategories.particuliers++;
      else if (type === "professionnel") clientCategories.professionnels++;
      else if (type === "entreprise") clientCategories.entreprises++;
    });

    const totalClients = clients.length;

    // Avoid divide by 0
    const getPercentage = (count) =>
      totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;

    const assureurCommissions = {};
    const risqueCommissions = {};
    let totalBrokerageFees = 0;

    contrats.forEach((contract) => {
      // Calculate commission for this contract
      const commission = contract.prime * (contract.commissionRate / 100) || 0;
      const previsionnel = contract.recurrentCommission || 0;
      const brokerageFees = contract.brokerageFees || 0;

      // Group by insurer
      if (contract.insurer) {
        if (!assureurCommissions[contract.insurer]) {
          assureurCommissions[contract.insurer] = {
            totalCommission: 0,
            totalPrevisionnel: 0,
            totalBrokerageFees: 0,
            count: 0,
          };
        }
        assureurCommissions[contract.insurer].totalCommission += commission;
        assureurCommissions[contract.insurer].totalPrevisionnel += previsionnel;
        assureurCommissions[contract.insurer].totalBrokerageFees +=
          brokerageFees;
        assureurCommissions[contract.insurer].count++;
      }

      // Group by risk type
      if (contract.riskType) {
        if (!risqueCommissions[contract.riskType]) {
          risqueCommissions[contract.riskType] = {
            totalCommission: 0,
            totalPrevisionnel: 0,
            totalBrokerageFees: 0,
            count: 0,
          };
        }
        risqueCommissions[contract.riskType].totalCommission += commission;
        risqueCommissions[contract.riskType].totalPrevisionnel += previsionnel;
        risqueCommissions[contract.riskType].totalBrokerageFees +=
          brokerageFees;
        risqueCommissions[contract.riskType].count++;
      }

      totalBrokerageFees += brokerageFees;
    });

    // Calculate totals
    const assureurTotals = Object.values(assureurCommissions).reduce(
      (acc, curr) => {
        return {
          totalCommission: acc.totalCommission + curr.totalCommission,
          totalPrevisionnel: acc.totalPrevisionnel + curr.totalPrevisionnel,
          totalBrokerageFees: acc.totalBrokerageFees + curr.totalBrokerageFees,
          count: acc.count + curr.count,
        };
      },
      {
        totalCommission: 0,
        totalPrevisionnel: 0,
        totalBrokerageFees: 0,
        count: 0,
      }
    );

    const risqueTotals = Object.values(risqueCommissions).reduce(
      (acc, curr) => {
        return {
          totalCommission: acc.totalCommission + curr.totalCommission,
          totalPrevisionnel: acc.totalPrevisionnel + curr.totalPrevisionnel,
          totalBrokerageFees: acc.totalBrokerageFees + curr.totalBrokerageFees,
          count: acc.count + curr.count,
        };
      },
      {
        totalCommission: 0,
        totalPrevisionnel: 0,
        totalBrokerageFees: 0,
        count: 0,
      }
    );

    return {
      // repartition: {
      //   assureurs: Object.entries(assureurCounts).map(([name, count]) => ({
      //     name,
      //     count,
      //     percentage: Math.round(
      //       (count / (reclamations.length + sinistres.length)) * 100
      //     ),
      //     primeTTC: `${Math.round(count * 10000)} €`,
      //   })),
      //   risques: Object.entries(risqueCounts).map(([name, count]) => ({
      //     name,
      //     count,
      //     percentage: Math.round(
      //       (count / (reclamations.length + sinistres.length)) * 100
      //     ),
      //     primeTTC: `${Math.round(count * 10000)} €`,
      //   })),
      // },
      repartition: {
        assureurs: Object.entries(assureurStats).map(([name, { count, totalPrime }]) => ({
          name,
          count,
          percentage: Math.round((count / contrats.length) * 100),
          primeTTC: `${totalPrime.toLocaleString()} €`, // Actual prime sum
        })),
        risques: Object.entries(risqueStats).map(([name, { count, totalPrime }]) => ({
          name,
          count,
          percentage: Math.round((count / contrats.length) * 100),
          primeTTC: `${totalPrime.toLocaleString()} €`, // Actual prime sum
        })),
      },
      primeTotals: {
        primeTTC: `${totalPrimeTTC.toLocaleString()} €`, // Total of all contracts
        totalPercentage: "100%",
      },
      commission: {
        assureurs: assureurTotals,
        risques: risqueTotals,
      },
      // commission: {
      //   assureurs: {
      //     totalCommission: `${Math.round(reclamations.length * 500)} €`,
      //     totalPrevisionnel: `${Math.round(reclamations.length * 600)} €`,
      //     totalCount: reclamations.length,
      //   },
      //   risques: {
      //     totalCommission: `${Math.round(sinistres.length * 500)} €`,
      //     totalPrevisionnel: `${Math.round(sinistres.length * 600)} €`,
      //     totalCount: sinistres.length,
      //   },
      // },
      primeTotals: {
        primeTTC: `${totalPrimeTTC.toLocaleString()} €`,
        totalPercentage: "100%",
      },
      clientStats: {
        particuliers: {
          count: clientCategories.particuliers,
          percentage: getPercentage(clientCategories.particuliers),
        },
        professionnels: {
          count: clientCategories.professionnels,
          percentage: getPercentage(clientCategories.professionnels),
        },
        entreprises: {
          count: clientCategories.entreprises,
          percentage: getPercentage(clientCategories.entreprises),
        },
        total: totalClients,
      },
    };
  };

  if (loading) {
    return <div className="p-4">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6 p-4">
       <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold">
          Tableau de Bord {userRole === "Commercial" ? "Commercial" : "Admin"}
        </h2>
        {userRole === "Commercial" && (
          <p className="text-sm text-gray-600">
            Affichage de vos statistiques personnelles
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Répartition contrat */}
        {/* <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">Répartition contrat</h3>

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

            <div className="px-4 py-3 ml-6">
              <div className="flex items-center">
                <div>
                  <div className="text-xs text-gray-600">Prime TTC total</div>
                  <div className="text-sm font-bold">
                    {stats.primeTotals.primeTTC}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {stats.repartition[activeRepartition].map(
              ({ name, count, percentage, primeTTC }, i) => (
                <li
                  key={i}
                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{name}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-16 text-right">
                        <span className="font-medium">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {activeRepartition === "assureurs"
                            ? "contrats"
                            : "risques"}
                        </span>
                      </span>

                      <div className="ml-2">
                        <MiniPieChart
                          percentage={percentage}
                          color="rgba(107, 33, 168, 0.7)"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        </div> */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
  <h3 className="text-lg font-semibold mb-4">Répartition contrat</h3>

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

    <div className="px-4 py-3 ml-6">
      <div className="flex items-center">
        <div>
          <div className="text-xs text-gray-600">Prime TTC total</div>
          <div className="text-sm font-bold">
            {stats.primeTotals.primeTTC}
          </div>
        </div>
      </div>
    </div>
  </div>

  <ul className="space-y-2">
    {stats.repartition[activeRepartition].map(
      ({ name, count, percentage, primeTTC }, i) => (
        <li
          key={i}
          className="flex items-center p-2 hover:bg-gray-50 rounded"
        >
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <span className="font-medium">{name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {primeTTC} {/* Show the actual prime sum */}
              </span>
            </div>

            <div className="flex items-center">
              <span className="w-16 text-right">
                <span className="font-medium">{count}</span>
                <span className="text-xs text-gray-500 ml-1">
                  {activeRepartition === "assureurs"
                    ? "contrats"
                    : "risques"}
                </span>
              </span>

              <div className="ml-2">
                <MiniPieChart
                  percentage={percentage}
                  color="rgba(107, 33, 168, 0.7)"
                />
              </div>
            </div>
          </div>
        </li>
      )
    )}
  </ul>
</div>

        {/* Card 2: Commissions / Chiffre d'affaire */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">
            Commissions / Chiffre d'affaire
          </h3>

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

            <div className="px-4 py-3 ml-6 w-1/2">
              <div className="flex items-center">
                <div>
                  <div className="text-xs text-gray-600">
                    Total des frais de courtage
                  </div>
                  <div className="text-center text-sm font-bold">
                    {(
                      stats.commission[activeCommission]?.totalBrokerageFees ||
                      0
                    ).toLocaleString()}{" "}
                    €
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-6 mt-6 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Total Commissions
                </span>
                <EuroOutlined className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-900">
                {(
                  stats.commission[activeCommission]?.totalCommission || 0
                ).toLocaleString()}{" "}
                €
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Prévisionnel
                </span>
                <PieChartOutlined className="text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-900">
                {(
                  stats.commission[activeCommission]?.totalPrevisionnel || 0
                ).toLocaleString()}{" "}
                €
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
            count={stats.clientStats.particuliers.count}
            percentage={stats.clientStats.particuliers.percentage}
            icon={<UserOutlined />}
            color="blue"
          />
          <ClientStatBox
            title="Professionnels"
            count={stats.clientStats.professionnels.count}
            percentage={stats.clientStats.professionnels.percentage}
            icon={<TeamOutlined />}
            color="green"
          />
          <ClientStatBox
            title="Entreprises"
            count={stats.clientStats.entreprises.count}
            percentage={stats.clientStats.entreprises.percentage}
            icon={<ShopOutlined />}
            color="purple"
          />
          <ClientStatBox
            title="Total clients"
            count={stats.clientStats.total}
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
