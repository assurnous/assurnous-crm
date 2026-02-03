
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
  const [clientDigitalStats, setClientDigitalStats] = useState({
    totalClients: 0,
    newThisMonth: 0,
    conversionRate: 0,
    averageValue: 0
  });

  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);

  useEffect(() => {
    // Check if token exists and decode it
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setDecodedToken(decoded);
        setCurrentUserId(decoded?.userId);
        setUserRole(decoded?.role);
        setCurrentUserName(decoded?.name);
        console.log("Token found and decoded:", decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        setLoading(false);
      }
    } else {
      console.log("No token found in localStorage");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Don't fetch if no token or decoded token
      if (!token || !decodedToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // For Manager: First fetch the manager's team data
        let teamMembers = [];
        if (userRole === "Manager") {
          try {
            const managerResponse = await axios.get(`/manager/${currentUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Manager profile response:", managerResponse.data);
            
            // Try to get team members from a different endpoint
            try {
              const teamResponse = await axios.get(`/manager/${currentUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              teamMembers = teamResponse.data || [];
              console.log("Team members from /users:", teamMembers.length);
            } catch (teamError) {
              console.log("Could not fetch team members, manager will see all agency data");
            }
          } catch (managerError) {
            console.log("Could not fetch manager data:", managerError);
          }
        }

        // Fetch all data
        const [reclamationsRes, sinistresRes, clientsRes, contratsRes, digitalRes] =
          await Promise.all([
            axios.get("/reclamations", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("/sinistres", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("/data", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("/contrat", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("/datas", { headers: { Authorization: `Bearer ${token}` } })
          ]);

        // Extract data
        let reclamations = reclamationsRes.data?.data || [];
        let sinistres = sinistresRes.data?.data || [];
        let clients = clientsRes.data?.chatData || [];
        let contrats = contratsRes.data || [];
        const digitalResponse = digitalRes.data;
        
        console.log("=== DIGITAL CLIENTS DEBUG ===");
        console.log("User Role:", userRole);
        console.log("User ID:", currentUserId);
        
        // Extract digital clients
        let digitalClients = [];
        if (digitalResponse && digitalResponse.chatData && Array.isArray(digitalResponse.chatData)) {
          digitalClients = digitalResponse.chatData;
          console.log(`✓ Extracted ${digitalClients.length} digital clients`);
        } else {
          digitalClients = [];
        }

        // FILTERING LOGIC
        if (userRole !== "Admin" && userRole !== "admin") {
          // Filter regular clients
          // clients = clients.filter(client => {
          //   const isGestionnaire = 
          //     (client.gestionnaire?._id && client.gestionnaire._id.toString() === currentUserId) ||
          //     (typeof client.gestionnaire === 'string' && client.gestionnaire.includes(currentUserName));
            
          //   const commercialId = 
          //     typeof client.commercial === 'string' 
          //       ? client.commercial 
          //       : client.commercial?._id?.toString();
          //   const isCommercial = commercialId === currentUserId;

          //   const managerId = 
          //     typeof client.manager === 'string' 
          //       ? client.manager 
          //       : client.manager?._id?.toString();
          //   const isManager = managerId === currentUserId;

          //   return isGestionnaire || isCommercial || isManager;
          // });
       
          // if (userRole === "Commercial") {
          //   console.log("=== COMMERCIAL DIGITAL CLIENTS FILTERING ===");
            
          //   try {
          //     // Get commercial data to find manager ID
          //     const commercialResponse = await axios.get('/commercials', {
          //       headers: { Authorization: `Bearer ${token}` }
          //     });
              
          //     const currentCommercial = commercialResponse.data.find(c => 
          //       c._id === currentUserId || c.id === currentUserId
          //     );
              
          //     if (currentCommercial?.createdBy) {
          //       const managerId = currentCommercial.createdBy;
          //       console.log("Commercial's manager ID for digital clients:", managerId);
                
          //       // Get manager data to find villes
          //       const managerResponse = await axios.get('/manager', {
          //         headers: { Authorization: `Bearer ${token}` }
          //       });
                
          //       const manager = managerResponse.data.find(m => 
          //         m._id === managerId || m.id === managerId
          //       );
                
          //       const managerVilles = manager?.villes || ["LILLE"];
          //       console.log("Manager's villes for digital clients:", managerVilles);
                
          //       // Commercial sees digital clients from manager's villes OR assigned to them
          //       const initialCount = digitalClients.length;
          //       digitalClients = digitalClients.filter(client => {
          //         const clientAgence = client.agence?.toUpperCase() || '';
          //         const clientCommercialId = client.commercial?._id || client.commercial;
          //         const clientManagerId = client.manager?._id || client.manager;
                  
          //         const isInManagerVilles = managerVilles.some(ville => 
          //           clientAgence === ville?.toUpperCase()
          //         );
          //         const assignedToMe = clientCommercialId === currentUserId;
          //         const assignedToManager = clientManagerId === managerId;
                  
          //         return isInManagerVilles || assignedToMe || assignedToManager;
          //       });
                
          //       console.log(`Commercial digital: ${digitalClients.length} clients (from ${initialCount} total)`);
                
          //     } else {
          //       console.log("Commercial has no manager for digital clients");
          //       // Only show digital clients assigned to this commercial
          //       digitalClients = digitalClients.filter(client => {
          //         const clientCommercialId = client.commercial?._id || client.commercial;
          //         return clientCommercialId === currentUserId;
          //       });
          //       console.log(`Commercial digital (no manager): ${digitalClients.length} clients`);
          //     }
              
          //   } catch (err) {
          //     console.log("Error fetching commercial data for digital clients:", err);
          //     // Fallback: only show digital clients assigned to this commercial
          //     digitalClients = digitalClients.filter(client => {
          //       const clientCommercialId = client.commercial?._id || client.commercial;
          //       return clientCommercialId === currentUserId;
          //     });
          //   }
          // }
          // clients = clients.filter(client => {
          //   const isGestionnaire = 
          //     (client.gestionnaire?._id && client.gestionnaire._id.toString() === currentUserId) ||
          //     (typeof client.gestionnaire === 'string' && client.gestionnaire.includes(currentUserName));
            
          //   const commercialId = 
          //     typeof client.commercial === 'string' 
          //       ? client.commercial 
          //       : client.commercial?._id?.toString();
          //   const isCommercial = commercialId === currentUserId;
        
          //   const managerId = 
          //     typeof client.manager === 'string' 
          //       ? client.manager 
          //       : client.manager?._id?.toString();
          //   const isManager = managerId === currentUserId;
        
          //   return isGestionnaire || isCommercial || isManager;
          // });
          
          // // DIGITAL CLIENT FILTERING FOR COMMERCIAL
          // if (userRole === "Commercial") {
          //   console.log("=== COMMERCIAL DIGITAL CLIENTS FILTERING ===");
            
          //   try {
          //     // Get commercial data to find manager ID
          //     const commercialResponse = await axios.get('/commercials', {
          //       headers: { Authorization: `Bearer ${token}` }
          //     });
              
          //     const currentCommercial = commercialResponse.data.find(c => 
          //       c._id === currentUserId || c.id === currentUserId
          //     );
              
          //     if (currentCommercial?.createdBy) {
          //       const managerId = currentCommercial.createdBy;
          //       console.log("Commercial's manager ID:", managerId);
                
          //       // Get manager data to find villes
          //       const managerResponse = await axios.get('/manager', {
          //         headers: { Authorization: `Bearer ${token}` }
          //       });
                
          //       const manager = managerResponse.data.find(m => 
          //         m._id === managerId || m.id === managerId
          //       );
                
          //       const managerVilles = manager?.villes || ["LILLE"];
          //       console.log("Manager's villes:", managerVilles);
                
          //       // Commercial sees digital clients from manager's villes
          //       const initialCount = digitalClients.length;
          //       digitalClients = digitalClients.filter(client => {
          //         const clientAgence = client.agence?.toUpperCase() || '';
          //         return managerVilles.some(ville => 
          //           clientAgence === ville?.toUpperCase()
          //         );
          //       });
                
          //       console.log(`Commercial digital: ${digitalClients.length} clients (from ${initialCount} total)`);
                
          //     } else {
          //       console.log("Commercial has no manager - showing LILLE only");
          //       digitalClients = digitalClients.filter(client => 
          //         client.agence?.toUpperCase() === 'LILLE'
          //       );
          //     }
              
          //   } catch (err) {
          //     console.log("Error:", err);
          //     digitalClients = digitalClients.filter(client => 
          //       client.agence?.toUpperCase() === 'LILLE'
          //     );
          //   }
          // }
          
          // // DIGITAL CLIENT FILTERING FOR MANAGER
          // else if (userRole === "Manager") {
          //   console.log("=== MANAGER DIGITAL CLIENTS FILTERING ===");
            
          //   try {
          //     // Get manager's villes
          //     const managerResponse = await axios.get('/manager', {
          //       headers: { Authorization: `Bearer ${token}` }
          //     });
              
          //     const manager = managerResponse.data.find(m => 
          //       m._id === currentUserId || m.id === currentUserId
          //     );
              
          //     const managerVilles = manager?.villes || ["LILLE"];
          //     console.log("Manager's villes:", managerVilles);
              
          //     // Manager sees digital clients from their villes
          //     const initialCount = digitalClients.length;
          //     digitalClients = digitalClients.filter(client => {
          //       const clientAgence = client.agence?.toUpperCase() || '';
          //       return managerVilles.some(ville => 
          //         clientAgence === ville?.toUpperCase()
          //       );
          //     });
              
          //     console.log(`Manager digital: ${digitalClients.length} clients (from ${initialCount} total)`);
              
          //   } catch (err) {
          //     console.log("Error:", err);
          //     digitalClients = digitalClients.filter(client => 
          //       client.agence?.toUpperCase() === 'LILLE'
          //     );
          //   }
          // }
          const initialClientCount = clients.length;
  
          if (userRole === "Commercial") {
            console.log("=== COMMERCIAL REGULAR CLIENTS FILTERING ===");
            
            // Get commercial's manager ID
            let commercialManagerId = currentUserId;
            try {
              const commercialResponse = await axios.get('/commercials', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const currentCommercial = commercialResponse.data.find(c => 
                c._id === currentUserId || c.id === currentUserId
              );
              
              commercialManagerId = currentCommercial?.createdBy || currentUserId;
              console.log(`Commercial ${currentUserId} -> Manager ${commercialManagerId}`);
            } catch (err) {
              console.log("Error fetching commercial manager:", err);
            }
            
            // Commercial sees regular clients assigned to their manager
            clients = clients.filter(client => {
              const managerId = 
                typeof client.manager === 'string' 
                  ? client.manager 
                  : client.manager?._id?.toString();
              
              return managerId === commercialManagerId;
            });
            
            console.log(`Commercial regular clients: ${clients.length} of ${initialClientCount}`);
            
          } else if (userRole === "Manager") {
            console.log("=== MANAGER REGULAR CLIENTS FILTERING ===");
            
            // Manager sees clients assigned to them or their team
            clients = clients.filter(client => {
              const isGestionnaire = 
                (client.gestionnaire?._id && client.gestionnaire._id.toString() === currentUserId) ||
                (typeof client.gestionnaire === 'string' && client.gestionnaire.includes(currentUserName));
              
              const commercialId = 
                typeof client.commercial === 'string' 
                  ? client.commercial 
                  : client.commercial?._id?.toString();
              const isCommercial = commercialId === currentUserId;
              
              const managerId = 
                typeof client.manager === 'string' 
                  ? client.manager 
                  : client.manager?._id?.toString();
              const isManager = managerId === currentUserId;
              
              return isGestionnaire || isCommercial || isManager;
            });
            
            console.log(`Manager regular clients: ${clients.length} of ${initialClientCount}`);
          }
          
          // DIGITAL CLIENT FILTERING (already working correctly)
          if (userRole === "Commercial") {
            console.log("=== COMMERCIAL DIGITAL CLIENTS FILTERING ===");
            
            try {
              // Get commercial data to find manager ID
              const commercialResponse = await axios.get('/commercials', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const currentCommercial = commercialResponse.data.find(c => 
                c._id === currentUserId || c.id === currentUserId
              );
              
              if (currentCommercial?.createdBy) {
                const managerId = currentCommercial.createdBy;
                console.log("Commercial's manager ID:", managerId);
                
                // Get manager data to find villes
                const managerResponse = await axios.get('/manager', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                const manager = managerResponse.data.find(m => 
                  m._id === managerId || m.id === managerId
                );
                
                const managerVilles = manager?.villes || ["LILLE"];
                console.log("Manager's villes:", managerVilles);
                
                // Commercial sees digital clients from manager's villes
                const initialCount = digitalClients.length;
                digitalClients = digitalClients.filter(client => {
                  const clientAgence = client.agence?.toUpperCase() || '';
                  return managerVilles.some(ville => 
                    clientAgence === ville?.toUpperCase()
                  );
                });
                
                console.log(`Commercial digital: ${digitalClients.length} clients (from ${initialCount} total)`);
                
              } else {
                console.log("Commercial has no manager - showing LILLE only");
                digitalClients = digitalClients.filter(client => 
                  client.agence?.toUpperCase() === 'LILLE'
                );
              }
              
            } catch (err) {
              console.log("Error:", err);
              digitalClients = digitalClients.filter(client => 
                client.agence?.toUpperCase() === 'LILLE'
              );
            }
          }
          
          else if (userRole === "Manager") {
            console.log("=== MANAGER DIGITAL CLIENTS FILTERING ===");
            
            try {
              // Get manager's villes
              const managerResponse = await axios.get('/manager', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const manager = managerResponse.data.find(m => 
                m._id === currentUserId || m.id === currentUserId
              );
              
              const managerVilles = manager?.villes || ["LILLE"];
              console.log("Manager's villes:", managerVilles);
              
              // Manager sees digital clients from their villes
              const initialCount = digitalClients.length;
              digitalClients = digitalClients.filter(client => {
                const clientAgence = client.agence?.toUpperCase() || '';
                return managerVilles.some(ville => 
                  clientAgence === ville?.toUpperCase()
                );
              });
              
              console.log(`Manager digital: ${digitalClients.length} clients (from ${initialCount} total)`);
              
            } catch (err) {
              console.log("Error:", err);
              digitalClients = digitalClients.filter(client => 
                client.agence?.toUpperCase() === 'LILLE'
              );
            }
          }
          
          

          // Filter other data types...
          reclamations = reclamations.filter(item => {
            const createdById = item.createdBy?._id?.toString() || item.createdBy;
            const userId = item.userId?._id?.toString() || item.userId;
            return createdById === currentUserId || userId === currentUserId;
          });

          sinistres = sinistres.filter(item => {
            const createdById = item.createdBy?._id?.toString() || item.createdBy;
            const userId = item.userId?._id?.toString() || item.userId;
            return createdById === currentUserId || userId === currentUserId;
          });

          contrats = contrats.filter(contract => {
            const gestionnaireId = contract.gestionnaire?._id?.toString() || contract.gestionnaire;
            const createdById = contract.createdBy?._id?.toString() || contract.createdBy;
            return gestionnaireId === currentUserId || createdById === currentUserId;
          });
        }

        // Process digital client statistics
        const processDigitalStats = (digitalClients) => {
          const clientsArray = Array.isArray(digitalClients) ? digitalClients : [];
          const totalClients = clientsArray.length;
          
          if (totalClients === 0) {
            return {
              totalClients: 0,
              newThisMonth: 0,
              conversionRate: 0,
              averageValue: 0
            };
          }
          
          // Calculate new clients this month
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const newThisMonth = clientsArray.filter(client => {
            if (!client) return false;
            const clientDate = client.createdAt || client.dateCreated || client.created_date || client.date_created || client.date;
            if (!clientDate) return false;
            try {
              const date = new Date(clientDate);
              return date.getMonth() === currentMonth && 
                     date.getFullYear() === currentYear;
            } catch (error) {
              return false;
            }
          }).length;
          
          // Calculate conversion rate
          const convertedClients = clientsArray.filter(client => 
            client && (client.statut === 'client' || client.status === 'client' || client.statut === 'Client')
          ).length;
          
          const conversionRate = totalClients > 0 ? 
            Math.round((convertedClients / totalClients) * 100) : 0;
          
          // Calculate average value
          const totalValue = clientsArray.reduce((sum, client) => {
            if (!client) return sum;
            const value = client.prime || client.montant || client.value || 
                          client.revenue || client.chiffre_affaire || 
                          client.averagePrime || client.primeTTC || 
                          client.montant_prime || 0;
            return sum + (Number(value) || 0);
          }, 0);
          
          const averageValue = totalClients > 0 ? 
            Math.round(totalValue / totalClients) : 0;
          
          return {
            totalClients,
            newThisMonth,
            conversionRate,
            averageValue
          };
        };

        const digitalStats = processDigitalStats(digitalClients);
        setClientDigitalStats(digitalStats);

        console.log(`=== FINAL DATA SUMMARY for ${userRole} ${currentUserName} ===`);
        console.log({
          regularClients: clients.length,
          digitalClients: digitalClients.length,
          digitalStats: digitalStats,
          reclamations: reclamations.length,
          sinistres: sinistres.length,
          contrats: contrats.length
        });

        const processedStats = processStats(
          reclamations,
          sinistres,
          clients,
          contrats,
          digitalClients 
        );
        
        setStats(processedStats);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && decodedToken && currentUserId && userRole) {
      fetchStats();
    }
  }, [token, decodedToken, currentUserId, userRole, currentUserName]);

  const processStats = (reclamations, sinistres, clients, contrats, digitalClients = []) => {
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
    if (Array.isArray(digitalClients)) {
      digitalClients.forEach((client) => {
        const type = client.categorie?.toLowerCase();
        if (type === "particulier") clientCategories.particuliers++;
        else if (type === "professionnel") clientCategories.professionnels++;
        else if (type === "entreprise") clientCategories.entreprises++;
      });
    }
  
    const totalRegularClients = clients.length;
    const totalDigitalClients = digitalClients?.length || 0;
    const totalClients = totalRegularClients + totalDigitalClients;
  
    // ========== ADD DEBUG LOG HERE ==========
    console.log("=== CLIENT STATISTICS DEBUG ===");
    console.log({
      regularClientsCount: totalRegularClients,
      digitalClientsCount: totalDigitalClients,
      totalClients: totalClients,
      categories: clientCategories,
      digitalClientsArray: digitalClients ? digitalClients.map(c => ({
        name: `${c.nom || ''} ${c.prenom || ''}`.trim(),
        categorie: c.categorie,
      })) : 'No digital clients'
    });

    // const totalClients = clients.length;

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
    const hasToken = localStorage.getItem("token");
    if (!hasToken) {
      return <div className="p-4">Redirection vers la connexion...</div>;
    }
    return <div className="p-4">Chargement des statistiques...</div>;
  }

  if (!token) {
    return <div className="p-4">Veuillez vous connecter pour voir les statistiques.</div>;
  }
  return (
    <div className="space-y-6 p-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold">
          Tableau de Bord {userRole === "Commercial" ? "Commercial" : userRole === "Manager" ? "Manager" : "Administrateur"}
        </h2>
        {userRole === "Commercial" && (
          <p className="text-sm text-gray-600">
            Affichage de vos statistiques personnelles
          </p>
        )}
        {userRole === "Manager" && (
          <p className="text-sm text-gray-600">
            Vue d'ensemble
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Répartition contrat */}
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
                        {primeTTC}
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

      {/* Digital Clients Card - Only for admin and manager */}
      {(userRole === "Admin" || userRole === "admin" || userRole === "Manager" || userRole === "Commercial") && (
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Clients Digitaux</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {clientDigitalStats.totalClients} clients
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <UserOutlined className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Clients</div>
                  <div className="text-lg font-bold text-gray-800">
                    {clientDigitalStats.totalClients}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-3">
                  <TeamOutlined className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Nouveaux ce mois</div>
                  <div className="text-lg font-bold text-gray-800">
                    {clientDigitalStats.newThisMonth}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100 mr-3">
                  <PieChartOutlined className="text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Taux de conversion</div>
                  <div className="text-lg font-bold text-gray-800">
                    {clientDigitalStats.conversionRate}%
                  </div>
                </div>
              </div>
            </div>
            
       
          </div>
      
        </div>
      )}

      {/* Card: Statistiques clients (Regular clients) */}
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-4">Statistiques clients</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ClientStatBox
            title="Particuliers"
            count={stats?.clientStats?.particuliers?.count}
            percentage={stats?.clientStats?.particuliers?.percentage}
            icon={<UserOutlined />}
            color="blue"
          />
          <ClientStatBox
            title="Professionnels"
            count={stats?.clientStats?.professionnels?.count}
            percentage={stats?.clientStats?.professionnels?.percentage}
            icon={<TeamOutlined />}
            color="green"
          />
          <ClientStatBox
            title="Entreprises"
            count={stats?.clientStats?.entreprises?.count}
            percentage={stats?.clientStats?.entreprises?.percentage}
            icon={<ShopOutlined />}
            color="purple"
          />
          <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 mr-3">
                  <TeamOutlined className="text-red-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total clients</div>
                  <div className="text-lg font-bold text-gray-800">
                    {(stats?.clientStats?.total)}
                  </div>
                  {(userRole === "Admin" || userRole === "admin" || userRole === "Manager") && clientDigitalStats?.totalClients > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      dont {clientDigitalStats?.totalClients} digitaux
                    </div>
                  )}
                </div>
              </div>
              <MiniPieChart
                percentage={100}
                color="rgba(239, 68, 68, 0.7)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;