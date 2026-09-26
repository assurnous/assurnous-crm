// import React, { useState, useEffect, useMemo } from "react";
// import {
//   BankOutlined,
//   WarningOutlined,
//   EuroOutlined,
//   PieChartOutlined,
//   UserOutlined,
//   TeamOutlined,
//   ShopOutlined,
// } from "@ant-design/icons";
// import { Pie } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { matchesAgence, filterByAgence } from "../utils/agenceFilter";

// const MONTH_NAMES = {
//   1: "janvier",
//   2: "février",
//   3: "mars",
//   4: "avril",
//   5: "mai",
//   6: "juin",
//   7: "juillet",
//   8: "août",
//   9: "septembre",
//   10: "octobre",
//   11: "novembre",
//   12: "décembre",
// };

// ChartJS.register(ArcElement, Tooltip, Legend);

// const MiniPieChart = ({ percentage, color }) => {
//   const data = {
//     datasets: [
//       {
//         data: [percentage, 100 - percentage],
//         backgroundColor: [color, "rgba(243, 244, 246, 0.7)"],
//         borderWidth: 0,
//       },
//     ],
//   };

//   const options = {
//     cutout: "65%",
//     plugins: { legend: { display: false }, tooltip: { enabled: false } },
//     events: [],
//   };

//   return (
//     <div className="relative w-10 h-10">
//       <Pie data={data} options={options} />
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span
//           className="text-xs font-medium"
//           style={{ color: color.replace("0.7", "1") }}
//         >
//           {percentage}%
//         </span>
//       </div>
//     </div>
//   );
// };

// const CategoryButton = ({ active, onClick, icon, title, activeColor }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`flex-1 p-3 rounded-lg border transition-colors ${
//         active
//           ? `border-${activeColor}-300 bg-${activeColor}-50`
//           : "border-gray-200 bg-gray-50 hover:bg-gray-100"
//       }`}
//     >
//       <div className="flex flex-col items-center">
//         <div
//           className={`text-lg mb-1 ${
//             active ? `text-${activeColor}-600` : "text-gray-500"
//           }`}
//         >
//           {icon}
//         </div>
//         <div
//           className={`font-medium text-sm ${
//             active ? `text-${activeColor}-800` : "text-gray-700"
//           }`}
//         >
//           {title}
//         </div>
//       </div>
//     </button>
//   );
// };

// const ClientStatBox = ({ title, count, percentage, icon, color }) => {
//   return (
//     <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className={`p-2 rounded-full bg-${color}-100 mr-3`}>
//             {React.cloneElement(icon, { className: `text-${color}-600` })}
//           </div>
//           <div>
//             <div className="text-xs text-gray-600">{title}</div>
//             <div className="text-lg font-bold text-gray-800">{count}</div>
//           </div>
//         </div>
//         <MiniPieChart
//           percentage={percentage}
//           color={`rgba(${
//             color === "blue"
//               ? "59, 130, 246"
//               : color === "green"
//               ? "16, 185, 129"
//               : color === "purple"
//               ? "168, 85, 247"
//               : "239, 68, 68"
//           }, 0.7)`}
//         />
//       </div>
//     </div>
//   );
// };

// // ---------------------------------------------------------------------
// // Helpers: safely extract an id string whether the field is a populated
// // object ({_id: "..."}) or already a plain string.
// // ---------------------------------------------------------------------
// const idOf = (val) => {
//   if (!val) return null;
//   if (typeof val === "string") return val;
//   return val._id?.toString() || val.id?.toString() || null;
// };

// const Home = () => {
//   const [activeRepartition, setActiveRepartition] = useState("assureurs");
//   const [activeCommission, setActiveCommission] = useState("assureurs");
//   const [drilldownRepartition, setDrilldownRepartition] = useState(null);
//   const [drilldownCommission, setDrilldownCommission] = useState(null);
//   // const [stats, setStats] = useState({
//   //   repartition: { assureurs: [], risques: [] },
//   //   primeTotals: {},
//   //   clientStats: {},
//   //   commission: {
//   //     assureurs: {
//   //       totalCommission: 0,
//   //       totalPrevisionnel: 0,
//   //       totalBrokerageFees: 0,
//   //       count: 0,
//   //     },
//   //     risques: {
//   //       totalCommission: 0,
//   //       totalPrevisionnel: 0,
//   //       totalBrokerageFees: 0,
//   //       count: 0,
//   //     },
//   //   },
//   //   commissionBreakdown: { assureurs: [], risques: [] },
//   // });
//   const [stats, setStats] = useState({
//     repartition: { assureurs: [], risques: [] },
//     primeTotals: {},
//     clientStats: {},
//     commission: {
//       assureurs: {
//         totalCommission: 0,
//         totalPrevisionnel: 0,
//         totalBrokerageFees: 0,
//         count: 0,
//       },
//       risques: {
//         totalCommission: 0,
//         totalPrevisionnel: 0,
//         totalBrokerageFees: 0,
//         count: 0,
//       },
//     },
//     commissionBreakdown: { assureurs: [], risques: [] },
//     crossBreakdown: { byInsurer: {}, byRisk: {} },
//   });
//   const [loading, setLoading] = useState(true);
//   const [clientDigitalStats, setClientDigitalStats] = useState({
//     totalClients: 0,
//     newThisMonth: 0,
//     conversionRate: 0,
//     averageValue: 0,
//   });
//   const [filterYear, setFilterYear] = useState("");
//   const [filterMonth, setFilterMonth] = useState("");
//   const [availableYears, setAvailableYears] = useState([]);
//   const [rawContrats, setRawContrats] = useState([]);
//   const [rawClients, setRawClients] = useState([]);
//   const [rawDigitalClients, setRawDigitalClients] = useState([]);

//   const [token, setToken] = useState(null);
//   const [decodedToken, setDecodedToken] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [currentUserName, setCurrentUserName] = useState(null);

//   // Reset drill-down when switching tabs
//   useEffect(() => {
//     setDrilldownRepartition(null);
//   }, [activeRepartition]);
//   useEffect(() => {
//     setDrilldownCommission(null);
//   }, [activeCommission]);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       setToken(storedToken);
//       try {
//         const decoded = jwtDecode(storedToken);
//         setDecodedToken(decoded);
//         setCurrentUserId(decoded?.userId);
//         setUserRole(decoded?.role);
//         setCurrentUserName(decoded?.name);
//         console.log("Token found and decoded:", decoded);
//       } catch (error) {
//         console.error("Error decoding token:", error);
//         setLoading(false);
//       }
//     } else {
//       console.log("No token found in localStorage");
//       setLoading(false);
//     }
//   }, []);

//   // ── Filter contracts by year / month (uses effectiveDate, Paris time) ──
//   const filteredContrats = useMemo(() => {
//     if (!filterYear && !filterMonth) return rawContrats;

//     return rawContrats.filter((c) => {
//       const d = c.effectiveDate || c.createdAt;
//       if (!d) return !filterYear && !filterMonth;

//       const date = new Date(d);
//       const y = date.getUTCFullYear();
//       const m = date.getUTCMonth() + 1; // 1-12

//       if (filterYear && y !== parseInt(filterYear)) return false;
//       if (filterMonth && m !== parseInt(filterMonth)) return false;
//       return true;
//     });
//   }, [rawContrats, filterYear, filterMonth]);

//   // ── Recompute stats when the filter changes ──
//   // (initial fetch also sets stats, but this ensures the filter's value is applied)
//   useEffect(() => {
//     if (!rawContrats.length && !rawClients.length) return; // nothing fetched yet

//     const recomputed = processStats(
//       [], // reclamations — not used for the two cards we filter
//       [], // sinistres — not used
//       rawClients,
//       filteredContrats, // ← the filtered subset drives both cards
//       rawDigitalClients
//     );

//     setStats(recomputed);
//   }, [filteredContrats, rawClients, rawDigitalClients]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       if (!token || !decodedToken) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         // -----------------------------------------------------------
//         // 1. Fetch all raw data in parallel
//         // -----------------------------------------------------------
//         const [
//           reclamationsRes,
//           sinistresRes,
//           clientsRes,
//           contratsRes,
//           digitalRes,
//         ] = await Promise.all([
//           axios.get("/reclamations", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("/sinistres", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("/data", { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get("/contrat", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("/datas", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         let reclamations = reclamationsRes.data?.data || [];
//         let sinistres = sinistresRes.data?.data || [];
//         let clients = clientsRes.data?.chatData || [];
//         let contrats = contratsRes.data || [];
//         // const digitalResponse = digitalRes.data;
//         const digitalResponse = digitalRes.data;
// const userVilles = (digitalResponse?.userVilles || []).map((v) =>
//   String(v).toUpperCase()
// );

//         let digitalClients =
//           digitalResponse && Array.isArray(digitalResponse.chatData)
//             ? digitalResponse.chatData
//             : [];

//         console.log("=== RAW DATA COUNTS ===", {
//           role: userRole,
//           reclamations: reclamations.length,
//           sinistres: sinistres.length,
//           clients: clients.length,
//           contrats: contrats.length,
//           digitalClients: digitalClients.length,
//         });

//         // -----------------------------------------------------------
//         // 2. Role-based filtering (Admin sees everything, Commercial
//         //    sees their own + manager's book, Manager sees their whole
//         //    team's book). Only ONE of these branches ever runs.
//         // -----------------------------------------------------------
//         const roleLower = (userRole || "").toLowerCase();

//         if (roleLower === "admin") {
//           // Admin: no filtering needed, keep everything as-is.
//           console.log("=== ADMIN: no filtering applied ===");
//         } else if (roleLower === "commercial" || roleLower === "manager") {
//           console.log(`=== ${roleLower.toUpperCase()} FILTERING (by team) ===`);
        
//           // ─── Build the user's team ───
//           // For a Manager: self + all commercials they created.
//           // For a Commercial: self only (their team is just themselves).
//           let teamUserIds = [String(currentUserId)];
        
//           if (roleLower === "manager") {
//             try {
//               const teamRes = await axios.get(
//                 `/commercials/manager/${currentUserId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//               );
//               const teamCommercials = teamRes.data || [];
//               teamUserIds = [
//                 String(currentUserId),
//                 ...teamCommercials
//                   .map((c) => String(c._id || c.id))
//                   .filter(Boolean),
//               ];
//               console.log(`Manager ${currentUserName} team:`, teamUserIds);
//             } catch (err) {
//               console.warn("Error fetching manager team:", err?.message || err);
//             }
//           } else {
//             console.log(`Commercial ${currentUserName} team:`, teamUserIds);
//           }
        
//           // ─── Helper: is this id on the team? ───
//           const isInTeam = (val) => {
//             if (!val) return false;
//             const id =
//               typeof val === "object"
//                 ? String(val._id || val.id || "")
//                 : String(val);
//             return id && teamUserIds.includes(id);
//           };
        
//           // ─── Filter CLIENTS by team ownership ───
//           clients = clients.filter(
//             (c) =>
//               isInTeam(c.gestionnaire) ||
//               isInTeam(c.commercial) ||
//               isInTeam(c.manager) ||
//               isInTeam(c.cree_par)
//           );
        
//           // ─── Filter DIGITAL CLIENTS by team ownership (same rule) ───
//           // Note: this does NOT change the digital-clients card count on the
//           // Clientdigital page — that page has its own filter. This only affects
//           // the count shown on Home.
//           digitalClients = digitalClients.filter(
//             (c) =>
//               isInTeam(c.gestionnaire) ||
//               isInTeam(c.commercial) ||
//               isInTeam(c.manager) ||
//               isInTeam(c.cree_par)
//           );
        
//           // ─── Filter CONTRATS by team ownership ───
//           // A contract belongs to a user if that user (or their team) created it
//           // (session), or if the contract's gestionnaire or its client's
//           // gestionnaire is on the team.
//           contrats = contrats.filter(
//             (c) =>
//               isInTeam(c.session) ||
//               isInTeam(c.session?._id) ||
//               isInTeam(c.cree_par) ||
//               isInTeam(c.gestionnaire) ||
//               isInTeam(c.lead?.gestionnaire) ||
//               isInTeam(c.lead?.commercial) ||
//               isInTeam(c.lead?.manager)
//           );
        
//           // ─── Filter RECLAMATIONS by team ownership ───
//           reclamations = reclamations.filter(
//             (r) =>
//               isInTeam(r.session) ||
//               isInTeam(r.session?._id) ||
//               isInTeam(r.cree_par) ||
//               isInTeam(r.createdBy) ||
//               isInTeam(r.userId) ||
//               isInTeam(r.gestionnaire) ||
//               isInTeam(r.lead?.gestionnaire) ||
//               isInTeam(r.client?.gestionnaire)
//           );
        
//           // ─── Filter SINISTRES by team ownership ───
//           sinistres = sinistres.filter(
//             (s) =>
//               isInTeam(s.session) ||
//               isInTeam(s.session?._id) ||
//               isInTeam(s.cree_par) ||
//               isInTeam(s.createdBy) ||
//               isInTeam(s.gestionnaire) ||
//               isInTeam(s.sinistreDetails?.gestionnaire) ||
//               isInTeam(s.contratDetails?.gestionnaire)
//           );
        
//           console.log(`${roleLower} filtered counts (by team):`, {
//             teamUserIds,
//             clients: clients.length,
//             digitalClients: digitalClients.length,
//             contrats: contrats.length,
//             reclamations: reclamations.length,
//             sinistres: sinistres.length,
//           });
//         } else {
//           console.log(`Unknown role "${userRole}" - no filtering applied`);
//         }
//         // } else if (roleLower === "commercial") {
//         //   console.log("=== COMMERCIAL FILTERING ===");

//         //   // Find this commercial's manager id (createdBy)
//         //   let managerId = null;
//         //   try {
//         //     const commercialResponse = await axios.get("/commercials", {
//         //       headers: { Authorization: `Bearer ${token}` },
//         //     });
//         //     const list = commercialResponse.data || [];
//         //     const me = list.find(
//         //       (c) => c._id === currentUserId || c.id === currentUserId
//         //     );
//         //     managerId = me?.createdBy || null;
//         //     console.log(`Commercial ${currentUserId} -> Manager ${managerId}`);
//         //   } catch (err) {
//         //     console.log("Error fetching commercial's manager:", err);
//         //   }

//         //   // A commercial's own contracts/clients/sinistres are usually
//         //   // tagged with the commercial's own id (gestionnaire/commercial),
//         //   // so we match against currentUserId OR the manager id (for
//         //   // records assigned at the manager level but visible to the team).
//         //   const matchIds = [currentUserId, managerId].filter(Boolean);

//         //   clients = clients.filter((client) => {
//         //     const gestionnaireId = idOf(client.gestionnaire);
//         //     const commercialId = idOf(client.commercial);
//         //     const clientManagerId = idOf(client.manager);
//         //     return (
//         //       matchIds.includes(gestionnaireId) ||
//         //       matchIds.includes(commercialId) ||
//         //       matchIds.includes(clientManagerId)
//         //     );
//         //   });

//         //   digitalClients = digitalClients.filter((client) => {
//         //     const commercialId = idOf(client.commercial);
//         //     const gestionnaireId = idOf(client.gestionnaire);
//         //     const clientManagerId = idOf(client.manager);
//         //     return (
//         //       matchIds.includes(commercialId) ||
//         //       matchIds.includes(gestionnaireId) ||
//         //       matchIds.includes(clientManagerId)
//         //     );
//         //   });

//         //   reclamations = reclamations.filter((item) => {
//         //     const createdById = idOf(item.createdBy);
//         //     const userId = idOf(item.userId);
//         //     const gestId = idOf(item.gestionnaire);
//         //     return (
//         //       matchIds.includes(createdById) ||
//         //       matchIds.includes(userId) ||
//         //       matchIds.includes(gestId)
//         //     );
//         //   });

//         //   sinistres = sinistres.filter((item) => {
//         //     const createdById = idOf(item.createdBy);
//         //     const userId = idOf(item.userId);
//         //     const gestId = idOf(item.gestionnaire);
//         //     return (
//         //       matchIds.includes(createdById) ||
//         //       matchIds.includes(userId) ||
//         //       matchIds.includes(gestId)
//         //     );
//         //   });

//         //   contrats = contrats.filter((contract) => {
//         //     const gestionnaireId = idOf(contract.gestionnaire);
//         //     const createdById = idOf(contract.createdBy);
//         //     return (
//         //       matchIds.includes(gestionnaireId) ||
//         //       matchIds.includes(createdById)
//         //     );
//         //   });

//         //   console.log("Commercial filtered counts:", {
//         //     clients: clients.length,
//         //     digitalClients: digitalClients.length,
//         //     reclamations: reclamations.length,
//         //     sinistres: sinistres.length,
//         //     contrats: contrats.length,
//         //   });
//         // } else if (roleLower === "manager") {
//         //   console.log("=== MANAGER: fetching team ===");

//         //   // Build the full set of ids that belong to this manager's team:
//         //   // the manager themself + every commercial they created.
//         //   let teamIds = [currentUserId];

//         //   try {
//         //     const teamRes = await axios.get(
//         //       `/commercials/manager/${currentUserId}`,
//         //       { headers: { Authorization: `Bearer ${token}` } }
//         //     );
//         //     const teamCommercials = teamRes.data || [];
//         //     teamIds = [
//         //       currentUserId,
//         //       ...teamCommercials.map((c) => c._id || c.id).filter(Boolean),
//         //     ];
//         //     console.log("Manager team ids:", teamIds);
//         //   } catch (err) {
//         //     console.log("Error fetching manager team:", err);
//         //   }

//         //   clients = clients.filter((client) => {
//         //     const gestionnaireId = idOf(client.gestionnaire);
//         //     const commercialId = idOf(client.commercial);
//         //     const clientManagerId = idOf(client.manager);
//         //     return (
//         //       teamIds.includes(gestionnaireId) ||
//         //       teamIds.includes(commercialId) ||
//         //       teamIds.includes(clientManagerId)
//         //     );
//         //   });

//         //   digitalClients = digitalClients.filter((client) => {
//         //     const commercialId = idOf(client.commercial);
//         //     const gestionnaireId = idOf(client.gestionnaire);
//         //     const clientManagerId = idOf(client.manager);
//         //     return (
//         //       teamIds.includes(commercialId) ||
//         //       teamIds.includes(gestionnaireId) ||
//         //       teamIds.includes(clientManagerId)
//         //     );
//         //   });

//         //   reclamations = reclamations.filter((item) => {
//         //     const createdById = idOf(item.createdBy);
//         //     const userId = idOf(item.userId);
//         //     const gestId = idOf(item.gestionnaire);
//         //     return (
//         //       teamIds.includes(createdById) ||
//         //       teamIds.includes(userId) ||
//         //       teamIds.includes(gestId)
//         //     );
//         //   });

//         //   sinistres = sinistres.filter((item) => {
//         //     const createdById = idOf(item.createdBy);
//         //     const userId = idOf(item.userId);
//         //     const gestId = idOf(item.gestionnaire);
//         //     return (
//         //       teamIds.includes(createdById) ||
//         //       teamIds.includes(userId) ||
//         //       teamIds.includes(gestId)
//         //     );
//         //   });

//         //   contrats = contrats.filter((contract) => {
//         //     const gestionnaireId = idOf(contract.gestionnaire);
//         //     const createdById = idOf(contract.createdBy);
//         //     return (
//         //       teamIds.includes(gestionnaireId) || teamIds.includes(createdById)
//         //     );
//         //   });

//         //   console.log("Manager filtered counts:", {
//         //     clients: clients.length,
//         //     digitalClients: digitalClients.length,
//         //     reclamations: reclamations.length,
//         //     sinistres: sinistres.length,
//         //     contrats: contrats.length,
//         //   });
//         // } else {
//         //   console.log(`Unknown role "${userRole}" - no filtering applied`);
//         // }
//         // ── Stash raw arrays so we can recompute stats on filter change ──
//         setRawContrats(contrats);
//         setRawClients(clients);
//         setRawDigitalClients(digitalClients);

//         // ── Compute available years from effectiveDate (fallback createdAt) ──
//         const currentYear = new Date().getFullYear();
//         const years = new Set();
//         contrats.forEach((c) => {
//           const d = c.effectiveDate || c.createdAt;
//           if (!d) return;
//           const y = new Date(d).getUTCFullYear();
//           if (y < 2000 || y > currentYear + 5) {
//             console.warn(
//               "Skipping contract with abnormal year:",
//               y,
//               c.contractNumber
//             );
//             return;
//           }
//           years.add(y);
//         });
//         const sortedYears = [...years].sort((a, b) => b - a);
//         setAvailableYears(sortedYears);
//         console.log("Available years:", sortedYears);
//         // -----------------------------------------------------------
//         // 3. Digital client mini-stats
//         // -----------------------------------------------------------
//         const processDigitalStats = (list) => {
//           const clientsArray = Array.isArray(list) ? list : [];
//           const totalClients = clientsArray.length;

//           if (totalClients === 0) {
//             return {
//               totalClients: 0,
//               newThisMonth: 0,
//               conversionRate: 0,
//               averageValue: 0,
//             };
//           }

//           const currentMonth = new Date().getMonth();
//           const currentYear = new Date().getFullYear();
//           const newThisMonth = clientsArray.filter((client) => {
//             if (!client) return false;
//             const clientDate =
//               client.createdAt ||
//               client.dateCreated ||
//               client.created_date ||
//               client.date_created ||
//               client.date;
//             if (!clientDate) return false;
//             try {
//               const date = new Date(clientDate);
//               return (
//                 date.getMonth() === currentMonth &&
//                 date.getFullYear() === currentYear
//               );
//             } catch (error) {
//               return false;
//             }
//           }).length;

//           const convertedClients = clientsArray.filter(
//             (client) =>
//               client &&
//               (client.statut === "client" ||
//                 client.status === "client" ||
//                 client.statut === "Client")
//           ).length;

//           const conversionRate =
//             totalClients > 0
//               ? Math.round((convertedClients / totalClients) * 100)
//               : 0;

//           const totalValue = clientsArray.reduce((sum, client) => {
//             if (!client) return sum;
//             const value =
//               client.prime ||
//               client.montant ||
//               client.value ||
//               client.revenue ||
//               client.chiffre_affaire ||
//               client.averagePrime ||
//               client.primeTTC ||
//               client.montant_prime ||
//               0;
//             return sum + (Number(value) || 0);
//           }, 0);

//           const averageValue =
//             totalClients > 0 ? Math.round(totalValue / totalClients) : 0;

//           return { totalClients, newThisMonth, conversionRate, averageValue };
//         };

//         const digitalStats = processDigitalStats(digitalClients);
//         setClientDigitalStats(digitalStats);

//         console.log(
//           `=== FINAL DATA SUMMARY for ${userRole} ${currentUserName} ===`,
//           {
//             regularClients: clients.length,
//             digitalClients: digitalClients.length,
//             digitalStats,
//             reclamations: reclamations.length,
//             sinistres: sinistres.length,
//             contrats: contrats.length,
//           }
//         );

//         const processedStats = processStats(
//           reclamations,
//           sinistres,
//           clients,
//           contrats,
//           digitalClients
//         );

//         setStats(processedStats);
//       } catch (error) {
//         console.error("Error fetching statistics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token && decodedToken && currentUserId && userRole) {
//       fetchStats();
//     }
//   }, [token, decodedToken, currentUserId, userRole, currentUserName]);

//   const processStats = (
//     reclamations,
//     sinistres,
//     clients,
//     contrats,
//     digitalClients = []
//   ) => {
//     if (
//       !Array.isArray(reclamations) ||
//       !Array.isArray(sinistres) ||
//       !Array.isArray(clients) ||
//       !Array.isArray(contrats)
//     ) {
//       // return {
//       //   repartition: { assureurs: [], risques: [] },
//       //   commission: { assureurs: {}, risques: {} },
//       //   primeTotals: {},
//       //   commissionBreakdown: {
//       //     assureurs: Object.entries(assureurCommissions)
//       //       .map(([name, stats]) => ({ name, ...stats }))
//       //       .sort((a, b) => b.totalCommission - a.totalCommission),
//       //     risques: Object.entries(risqueCommissions)
//       //       .map(([name, stats]) => ({ name, ...stats }))
//       //       .sort((a, b) => b.totalCommission - a.totalCommission),
//       //   },
//       //   clientStats: {
//       //     particuliers: { count: 0, percentage: 0 },
//       //     professionnels: { count: 0, percentage: 0 },
//       //     entreprises: { count: 0, percentage: 0 },
//       //     total: 0,
//       //   },
//       // };
//       return {
//         repartition: { assureurs: [], risques: [] },
//         // commission: { assureurs: {}, risques: {} },
//         commission: {
//           assureurs: {
//             totalCommission: 0,
//             totalPrevisionnel: 0,
//             totalBrokerageFees: 0,
//             count: 0,
//           },
//           risques: {
//             totalCommission: 0,
//             totalPrevisionnel: 0,
//             totalBrokerageFees: 0,
//             count: 0,
//           },
//         },
//         // primeTotals: {},
//         primeTotals: {
//           primeTTC: "0 €",
//           totalPercentage: "0%",
//           totalNumber: 0,
//         },
//         commissionBreakdown: { assureurs: [], risques: [] },
//         crossBreakdown: { byInsurer: {}, byRisk: {} },
//         clientStats: {
//           particuliers: { count: 0, percentage: 0 },
//           professionnels: { count: 0, percentage: 0 },
//           entreprises: { count: 0, percentage: 0 },
//           total: 0,
//         },
//       };
//     }

//     // Contracts: repartition by insurer / risk type
//     const assureurStats = {};
//     const risqueStats = {};
//     let totalPrimeTTC = 0;

//     contrats.forEach((contract) => {
//       if (contract.insurer) {
//         if (!assureurStats[contract.insurer]) {
//           assureurStats[contract.insurer] = { count: 0, totalPrime: 0 };
//         }
//         assureurStats[contract.insurer].count++;
//         assureurStats[contract.insurer].totalPrime += contract.prime || 0;
//       }

//       if (contract.riskType) {
//         if (!risqueStats[contract.riskType]) {
//           risqueStats[contract.riskType] = { count: 0, totalPrime: 0 };
//         }
//         risqueStats[contract.riskType].count++;
//         risqueStats[contract.riskType].totalPrime += contract.prime || 0;
//       }

//       totalPrimeTTC += contract.prime || 0;
//     });

//     // Client categories (regular + digital combined)
//     const clientCategories = {
//       particuliers: 0,
//       professionnels: 0,
//       entreprises: 0,
//     };

//     clients.forEach((client) => {
//       const type = client.categorie?.toLowerCase();
//       if (type === "particulier") clientCategories.particuliers++;
//       else if (type === "professionnel") clientCategories.professionnels++;
//       else if (type === "entreprise") clientCategories.entreprises++;
//     });

//     if (Array.isArray(digitalClients)) {
//       digitalClients.forEach((client) => {
//         const type = client.categorie?.toLowerCase();
//         if (type === "particulier") clientCategories.particuliers++;
//         else if (type === "professionnel") clientCategories.professionnels++;
//         else if (type === "entreprise") clientCategories.entreprises++;
//       });
//     }

//     const totalRegularClients = clients.length;
//     const totalDigitalClients = digitalClients?.length || 0;
//     const totalClients = totalRegularClients + totalDigitalClients;

//     console.log("=== CLIENT STATISTICS DEBUG ===", {
//       regularClientsCount: totalRegularClients,
//       digitalClientsCount: totalDigitalClients,
//       totalClients,
//       categories: clientCategories,
//     });

//     const getPercentage = (count) =>
//       totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;

//     // Commissions by insurer / risk type
//     const assureurCommissions = {};
//     const risqueCommissions = {};
//     let totalBrokerageFees = 0;

//     contrats.forEach((contract) => {
//       const commission = contract.prime * (contract.commissionRate / 100) || 0;
//       const previsionnel = contract.recurrentCommission || 0;
//       const brokerageFees = contract.brokerageFees || 0;

//       if (contract.insurer) {
//         if (!assureurCommissions[contract.insurer]) {
//           assureurCommissions[contract.insurer] = {
//             totalCommission: 0,
//             totalPrevisionnel: 0,
//             totalBrokerageFees: 0,
//             count: 0,
//           };
//         }
//         assureurCommissions[contract.insurer].totalCommission += commission;
//         assureurCommissions[contract.insurer].totalPrevisionnel += previsionnel;
//         assureurCommissions[contract.insurer].totalBrokerageFees +=
//           brokerageFees;
//         assureurCommissions[contract.insurer].count++;
//       }

//       if (contract.riskType) {
//         if (!risqueCommissions[contract.riskType]) {
//           risqueCommissions[contract.riskType] = {
//             totalCommission: 0,
//             totalPrevisionnel: 0,
//             totalBrokerageFees: 0,
//             count: 0,
//           };
//         }
//         risqueCommissions[contract.riskType].totalCommission += commission;
//         risqueCommissions[contract.riskType].totalPrevisionnel += previsionnel;
//         risqueCommissions[contract.riskType].totalBrokerageFees +=
//           brokerageFees;
//         risqueCommissions[contract.riskType].count++;
//       }

//       totalBrokerageFees += brokerageFees;
//     });
//     // ── Cross-dimension breakdown for drill-down ──
//     // byInsurer[april][auto] = { name:"auto", count, commission, prime, fees, prev }
//     // byRisk[auto][april]    = { name:"april", count, commission, prime, fees, prev }
//     const crossBreakdown = { byInsurer: {}, byRisk: {} };

//     contrats.forEach((c) => {
//       if (!c.insurer || !c.riskType) return;
//       const commission = (c.prime || 0) * ((c.commissionRate || 0) / 100);
//       const fees = c.brokerageFees || 0;
//       const prev = c.recurrentCommission || 0;
//       const prime = c.prime || 0;

//       // byInsurer
//       if (!crossBreakdown.byInsurer[c.insurer])
//         crossBreakdown.byInsurer[c.insurer] = {};
//       if (!crossBreakdown.byInsurer[c.insurer][c.riskType]) {
//         crossBreakdown.byInsurer[c.insurer][c.riskType] = {
//           name: c.riskType,
//           count: 0,
//           commission: 0,
//           prime: 0,
//           fees: 0,
//           prev: 0,
//         };
//       }
//       const i1 = crossBreakdown.byInsurer[c.insurer][c.riskType];
//       i1.count += 1;
//       i1.commission += commission;
//       i1.prime += prime;
//       i1.fees += fees;
//       i1.prev += prev;

//       // byRisk
//       if (!crossBreakdown.byRisk[c.riskType])
//         crossBreakdown.byRisk[c.riskType] = {};
//       if (!crossBreakdown.byRisk[c.riskType][c.insurer]) {
//         crossBreakdown.byRisk[c.riskType][c.insurer] = {
//           name: c.insurer,
//           count: 0,
//           commission: 0,
//           prime: 0,
//           fees: 0,
//           prev: 0,
//         };
//       }
//       const i2 = crossBreakdown.byRisk[c.riskType][c.insurer];
//       i2.count += 1;
//       i2.commission += commission;
//       i2.prime += prime;
//       i2.fees += fees;
//       i2.prev += prev;
//     });
//     const sumCommissions = (obj) =>
//       Object.values(obj).reduce(
//         (acc, curr) => ({
//           totalCommission: acc.totalCommission + curr.totalCommission,
//           totalPrevisionnel: acc.totalPrevisionnel + curr.totalPrevisionnel,
//           totalBrokerageFees: acc.totalBrokerageFees + curr.totalBrokerageFees,
//           count: acc.count + curr.count,
//         }),
//         {
//           totalCommission: 0,
//           totalPrevisionnel: 0,
//           totalBrokerageFees: 0,
//           count: 0,
//         }
//       );

//     const assureurTotals = sumCommissions(assureurCommissions);
//     const risqueTotals = sumCommissions(risqueCommissions);

//     // return {
//     //   repartition: {
//     //     assureurs: Object.entries(assureurStats).map(([name, { count, totalPrime }]) => ({
//     //       name,
//     //       count,
//     //       percentage: Math.round((count / (contrats.length || 1)) * 100),
//     //       primeTTC: `${totalPrime.toLocaleString()} €`,
//     //     })),
//     //     risques: Object.entries(risqueStats).map(([name, { count, totalPrime }]) => ({
//     //       name,
//     //       count,
//     //       percentage: Math.round((count / (contrats.length || 1)) * 100),
//     //       primeTTC: `${totalPrime.toLocaleString()} €`,
//     //     })),
//     //   },
//     //   primeTotals: {
//     //     primeTTC: `${totalPrimeTTC.toLocaleString()} €`,
//     //     totalPercentage: "100%",
//     //   },
//     //   commission: {
//     //     assureurs: assureurTotals,
//     //     risques: risqueTotals,
//     //   },
//     //   clientStats: {
//     //     particuliers: {
//     //       count: clientCategories.particuliers,
//     //       percentage: getPercentage(clientCategories.particuliers),
//     //     },
//     //     professionnels: {
//     //       count: clientCategories.professionnels,
//     //       percentage: getPercentage(clientCategories.professionnels),
//     //     },
//     //     entreprises: {
//     //       count: clientCategories.entreprises,
//     //       percentage: getPercentage(clientCategories.entreprises),
//     //     },
//     //     total: totalClients,
//     //   },
//     // };
//     return {
//       repartition: {
//         assureurs: Object.entries(assureurStats).map(
//           ([name, { count, totalPrime }]) => ({
//             name,
//             count,
//             percentage: Math.round((count / (contrats.length || 1)) * 100),
//             primeTTC: `${totalPrime.toLocaleString()} €`,
//           })
//         ),
//         risques: Object.entries(risqueStats).map(
//           ([name, { count, totalPrime }]) => ({
//             name,
//             count,
//             percentage: Math.round((count / (contrats.length || 1)) * 100),
//             primeTTC: `${totalPrime.toLocaleString()} €`,
//           })
//         ),
//       },
//       primeTotals: {
//         primeTTC: `${totalPrimeTTC.toLocaleString()} €`,
//         totalPercentage: "100%",
//         totalNumber: totalPrimeTTC,
//       },
//       commission: {
//         assureurs: assureurTotals,
//         risques: risqueTotals,
//       },
//       commissionBreakdown: {
//         assureurs: Object.entries(assureurCommissions)
//           .map(([name, stats]) => ({ name, ...stats }))
//           .sort((a, b) => b.totalCommission - a.totalCommission),
//         risques: Object.entries(risqueCommissions)
//           .map(([name, stats]) => ({ name, ...stats }))
//           .sort((a, b) => b.totalCommission - a.totalCommission),
//       },
//       crossBreakdown,
//       clientStats: {
//         particuliers: {
//           count: clientCategories.particuliers,
//           percentage: getPercentage(clientCategories.particuliers),
//         },
//         professionnels: {
//           count: clientCategories.professionnels,
//           percentage: getPercentage(clientCategories.professionnels),
//         },
//         entreprises: {
//           count: clientCategories.entreprises,
//           percentage: getPercentage(clientCategories.entreprises),
//         },
//         total: totalClients,
//       },
//     };
//   };

//   if (loading) {
//     const hasToken = localStorage.getItem("token");
//     if (!hasToken) {
//       return <div className="p-4">Redirection vers la connexion...</div>;
//     }
//     return <div className="p-4">Chargement des statistiques...</div>;
//   }

//   if (!token) {
//     return (
//       <div className="p-4">
//         Veuillez vous connecter pour voir les statistiques.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4">
//       <div className="bg-white p-4 rounded-lg shadow-sm border">
//         <h2 className="text-xl font-semibold">
//           Tableau de Bord{" "}
//           {userRole === "Commercial"
//             ? "Commercial"
//             : userRole === "Manager"
//             ? "Manager"
//             : "Administrateur"}
//         </h2>
//         {userRole === "Commercial" && (
//           <p className="text-sm text-gray-600">
//             Affichage de vos statistiques personnelles
//           </p>
//         )}
//         {userRole === "Manager" && (
//           <p className="text-sm text-gray-600">Vue d'ensemble</p>
//         )}
//       </div>
//       {/* ── Period filter ── */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap items-center gap-4">
//         <span className="text-sm font-medium text-gray-700">Période :</span>

//         <select
//           value={filterYear}
//           onChange={(e) => {
//             setFilterYear(e.target.value);
//             if (!e.target.value) setFilterMonth("");
//           }}
//           className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
//         >
//           <option value="">Toutes les années</option>
//           {availableYears.map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </select>

//         <select
//           value={filterMonth}
//           onChange={(e) => setFilterMonth(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//           disabled={!filterYear}
//         >
//           <option value="">Tous les mois</option>
//           <option value="1">Janvier</option>
//           <option value="2">Février</option>
//           <option value="3">Mars</option>
//           <option value="4">Avril</option>
//           <option value="5">Mai</option>
//           <option value="6">Juin</option>
//           <option value="7">Juillet</option>
//           <option value="8">Août</option>
//           <option value="9">Septembre</option>
//           <option value="10">Octobre</option>
//           <option value="11">Novembre</option>
//           <option value="12">Décembre</option>
//         </select>

//         {(filterYear || filterMonth) && (
//           <button
//             onClick={() => {
//               setFilterYear("");
//               setFilterMonth("");
//             }}
//             className="text-sm text-blue-600 hover:underline"
//           >
//             Réinitialiser
//           </button>
//         )}

//         <span className="text-sm text-gray-500 ml-auto">
//           {filteredContrats.length} contrat
//           {filteredContrats.length > 1 ? "s" : ""}
//           {filterYear
//             ? ` — ${
//                 filterMonth ? MONTH_NAMES[filterMonth] + " " : ""
//               }${filterYear}`
//             : ""}
//         </span>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Card 1: Répartition contrat */}
//         <div className="border rounded-lg p-4 shadow-sm bg-white">
//           <h3 className="text-lg font-semibold mb-4">Répartition contrat</h3>

//           <div className="flex items-center justify-between mb-4">
//             <div className="flex gap-3 w-1/2">
//               <CategoryButton
//                 active={activeRepartition === "assureurs"}
//                 onClick={() => setActiveRepartition("assureurs")}
//                 icon={<BankOutlined />}
//                 title="Assureurs"
//                 activeColor="purple"
//               />
//               <CategoryButton
//                 active={activeRepartition === "risques"}
//                 onClick={() => setActiveRepartition("risques")}
//                 icon={<WarningOutlined />}
//                 title="Risques"
//                 activeColor="purple"
//               />
//             </div>

//             <div className="px-4 py-3 ml-6">
//               <div className="flex items-center">
//                 <div>
//                   <div className="text-xs text-gray-600">Prime TTC total</div>
//                   <div className="text-sm font-bold">
//                     {stats.primeTotals.primeTTC}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* <ul className="space-y-2">
//             {stats.repartition[activeRepartition].map(({ name, count, percentage, primeTTC }, i) => (
//               <li key={i} className="flex items-center p-2 hover:bg-gray-50 rounded">
//                 <div className="flex items-center w-full justify-between">
//                   <div className="flex items-center">
//                     <span className="font-medium">{name}</span>
//                     <span className="ml-2 text-xs text-gray-500">{primeTTC}</span>
//                   </div>

//                   <div className="flex items-center">
//                     <span className="w-16 text-right">
//                       <span className="font-medium">{count}</span>
//                       <span className="text-xs text-gray-500 ml-1">
//                         {activeRepartition === "assureurs" ? "contrats" : "risques"}
//                       </span>
//                     </span>

//                     <div className="ml-2">
//                       <MiniPieChart percentage={percentage} color="rgba(107, 33, 168, 0.7)" />
//                     </div>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//            */}
//           {/* <ul className="space-y-2">
//   {stats.repartition[activeRepartition]
//     .slice() // don't mutate the state array
//     .sort((a, b) => {
//       // sort by prime TTC descending — most revenue first
//       const pa = parseFloat(String(a.primeTTC).replace(/[^\d.-]/g, "")) || 0;
//       const pb = parseFloat(String(b.primeTTC).replace(/[^\d.-]/g, "")) || 0;
//       return pb - pa;
//     })
//     .map(({ name, count, percentage, primeTTC }, i) => (
//       <li key={i} className="flex items-center p-2 hover:bg-gray-50 rounded">
//         <div className="flex items-center w-full justify-between">
        
//           <div className="flex flex-col">
//             <span className="font-medium">{name}</span>
//             <span className="text-xs text-gray-500">
//               {count} {activeRepartition === "assureurs" ? (count > 1 ? "contrats" : "contrat") : (count > 1 ? "risques" : "risque")}
//             </span>
//           </div>

 
//           <div className="flex items-center gap-3">
//             <span className="font-semibold text-gray-800">
//               {primeTTC}
//             </span>
         
//             <MiniPieChart percentage={percentage} color="rgba(107, 33, 168, 0.7)" />
//           </div>
//         </div>
//       </li>
//     ))}
// </ul> */}
//           {drilldownRepartition ? (
//             // ── LEVEL 2 ──
//             <div>
//               <button
//                 onClick={() => setDrilldownRepartition(null)}
//                 className="mb-3 text-sm text-purple-700 hover:underline flex items-center gap-1"
//               >
//                 ← Retour
//               </button>
//               <div className="text-xs text-gray-500 mb-2">
//                 {activeRepartition === "assureurs"
//                   ? `Détail par risque pour : ${drilldownRepartition}`
//                   : `Détail par assureur pour : ${drilldownRepartition}`}
//               </div>
//               <ul className="space-y-2">
//                 {Object.values(
//                   activeRepartition === "assureurs"
//                     ? stats.crossBreakdown?.byInsurer?.[drilldownRepartition] ||
//                         {}
//                     : stats.crossBreakdown?.byRisk?.[drilldownRepartition] || {}
//                 )
//                   .sort((a, b) => b.prime - a.prime)
//                   .map((row, i) => {
//                     const pct = stats.primeTotals?.totalNumber
//                       ? Math.round(
//                           (row.prime / stats.primeTotals.totalNumber) * 100
//                         )
//                       : 0;
//                     return (
//                       <li
//                         key={i}
//                         className="flex items-center p-2 rounded hover:bg-gray-50"
//                       >
//                         <div className="flex items-center w-full justify-between">
//                           <div className="flex flex-col">
//                             <span className="font-medium">{row.name}</span>
//                             <span className="text-xs text-gray-500">
//                               {row.count}{" "}
//                               {row.count > 1 ? "contrats" : "contrat"}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="font-semibold text-gray-800">
//                               {row.prime.toLocaleString("fr-FR", {
//                                 maximumFractionDigits: 0,
//                               })}{" "}
//                               €
//                             </span>
//                             <span className="text-xs text-gray-500 w-10 text-right">
//                               {pct}%
//                             </span>
//                             <MiniPieChart
//                               percentage={pct}
//                               color="rgba(107, 33, 168, 0.7)"
//                             />
//                           </div>
//                         </div>
//                       </li>
//                     );
//                   })}
//               </ul>
//             </div>
//           ) : (
//             // ── LEVEL 1 ──
//             <ul className="space-y-2">
//               {stats.repartition[activeRepartition]
//                 .slice()
//                 .sort((a, b) => {
//                   const pa =
//                     parseFloat(String(a.primeTTC).replace(/[^\d.-]/g, "")) || 0;
//                   const pb =
//                     parseFloat(String(b.primeTTC).replace(/[^\d.-]/g, "")) || 0;
//                   return pb - pa;
//                 })
//                 .map(({ name, count, percentage, primeTTC }, i) => (
//                   <li
//                     key={i}
//                     onClick={() => setDrilldownRepartition(name)}
//                     className="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer transition-colors"
//                     title={`Voir le détail pour ${name}`}
//                   >
//                     <div className="flex items-center w-full justify-between">
//                       <div className="flex flex-col">
//                         <span className="font-medium">{name}</span>
//                         <span className="text-xs text-gray-500">
//                           {count}{" "}
//                           {activeRepartition === "assureurs"
//                             ? count > 1
//                               ? "contrats"
//                               : "contrat"
//                             : count > 1
//                             ? "risques"
//                             : "risque"}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className="font-semibold text-gray-800">
//                           {primeTTC}
//                         </span>
//                         <span className="text-xs text-gray-500 w-10 text-right">
//                           {percentage}%
//                         </span>
//                         <MiniPieChart
//                           percentage={percentage}
//                           color="rgba(107, 33, 168, 0.7)"
//                         />
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//             </ul>
//           )}
//         </div>

//         {/* Card 2: Commissions / Chiffre d'affaire */}
//         <div className="border rounded-lg p-4 shadow-sm bg-white">
//           <h3 className="text-lg font-semibold mb-4">
//             Commissions / Chiffre d'affaire
//           </h3>

//           <div className="flex items-center justify-between mb-4">
//             <div className="flex gap-3 w-2/3">
//               <CategoryButton
//                 active={activeCommission === "assureurs"}
//                 onClick={() => setActiveCommission("assureurs")}
//                 icon={<BankOutlined />}
//                 title="Assureurs"
//                 activeColor="green"
//               />
//               <CategoryButton
//                 active={activeCommission === "risques"}
//                 onClick={() => setActiveCommission("risques")}
//                 icon={<WarningOutlined />}
//                 title="Risques"
//                 activeColor="green"
//               />
//             </div>

//             <div className="px-4 py-3 ml-6 w-1/2">
//               <div className="flex items-center">
//                 <div>
//                   <div className="text-xs text-gray-600">
//                     Total des frais de courtage
//                   </div>
//                   <div className="text-center text-sm font-bold">
//                     {(
//                       stats.commission[activeCommission]?.totalBrokerageFees ||
//                       0
//                     ).toLocaleString()}{" "}
//                     €
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-green-50 rounded-lg p-6 mt-6 border border-green-100">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-gray-600">
//                   Total Commissions
//                 </span>
//                 <EuroOutlined className="text-green-600" />
//               </div>
//               <div className="text-xl font-bold text-green-900">
//                 {(
//                   stats.commission[activeCommission]?.totalCommission || 0
//                 ).toLocaleString()}{" "}
//                 €
//               </div>
//             </div>

//             <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-100">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-gray-600">
//                   Prévisionnel
//                 </span>
//                 <PieChartOutlined className="text-blue-600" />
//               </div>
//               <div className="text-xl font-bold text-blue-900">
//                 {(
//                   stats.commission[activeCommission]?.totalPrevisionnel || 0
//                 ).toLocaleString()}{" "}
//                 €
//               </div>
//             </div>
//           </div>
//           {/* Breakdown list: insurers or risks, depending on activeCommission */}
//           {/* <ul className="mt-6 space-y-1 border-t pt-4">
//   {(activeCommission === "assureurs"
//     ? stats.commissionBreakdown?.assureurs
//     : stats.commissionBreakdown?.risques
//   )?.map(({ name, count, totalCommission, totalPrevisionnel, totalBrokerageFees }, i) => (
//     <li key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
//       <div className="flex flex-col">
//         <span className="font-medium">{name}</span>
//         <span className="text-xs text-gray-500">
//           {count} contrat{count > 1 ? "s" : ""}
//         </span>
//       </div>
//       <div className="flex items-center gap-4 text-xs">
//         <span className="text-green-700 font-semibold">
//           {totalCommission.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € commission
//         </span>
//         <span className="text-blue-700">
//           {totalPrevisionnel.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € prév.
//         </span>
//         <span className="text-gray-500">
//           {totalBrokerageFees.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € frais
//         </span>
//       </div>
//     </li>
//   ))}
// </ul> */}
//           {drilldownCommission ? (
//             // ── LEVEL 2 ──
//             <div className="mt-6 border-t pt-4">
//               <button
//                 onClick={() => setDrilldownCommission(null)}
//                 className="mb-3 text-sm text-green-700 hover:underline flex items-center gap-1"
//               >
//                 ← Retour
//               </button>
//               <div className="text-xs text-gray-500 mb-2">
//                 {activeCommission === "assureurs"
//                   ? `Détail par risque pour : ${drilldownCommission}`
//                   : `Détail par assureur pour : ${drilldownCommission}`}
//               </div>
//               <ul className="space-y-1">
//                 {Object.values(
//                   activeCommission === "assureurs"
//                     ? stats.crossBreakdown?.byInsurer?.[drilldownCommission] ||
//                         {}
//                     : stats.crossBreakdown?.byRisk?.[drilldownCommission] || {}
//                 )
//                   .sort((a, b) => b.commission - a.commission)
//                   .map((row, i) => (
//                     <li
//                       key={i}
//                       className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
//                     >
//                       <div className="flex flex-col">
//                         <span className="font-medium">{row.name}</span>
//                         <span className="text-xs text-gray-500">
//                           {row.count} contrat{row.count > 1 ? "s" : ""}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-4 text-xs">
//                         <span className="text-green-700 font-semibold">
//                           {row.commission.toLocaleString("fr-FR", {
//                             maximumFractionDigits: 2,
//                           })}{" "}
//                           € commission
//                         </span>
//                         <span className="text-blue-700">
//                           {row.prev.toLocaleString("fr-FR", {
//                             maximumFractionDigits: 2,
//                           })}{" "}
//                           € prév.
//                         </span>
//                         <span className="text-gray-500">
//                           {row.fees.toLocaleString("fr-FR", {
//                             maximumFractionDigits: 2,
//                           })}{" "}
//                           € frais
//                         </span>
//                       </div>
//                     </li>
//                   ))}
//               </ul>
//             </div>
//           ) : (
//             // ── LEVEL 1 ──
//             <ul className="mt-6 space-y-1 border-t pt-4">
//               {(activeCommission === "assureurs"
//                 ? stats.commissionBreakdown?.assureurs
//                 : stats.commissionBreakdown?.risques
//               )?.map(
//                 (
//                   {
//                     name,
//                     count,
//                     totalCommission,
//                     totalPrevisionnel,
//                     totalBrokerageFees,
//                   },
//                   i
//                 ) => (
//                   <li
//                     key={i}
//                     onClick={() => setDrilldownCommission(name)}
//                     className="flex items-center justify-between p-2 hover:bg-green-50 rounded text-sm cursor-pointer transition-colors"
//                     title={`Voir le détail pour ${name}`}
//                   >
//                     <div className="flex flex-col">
//                       <span className="font-medium">{name}</span>
//                       <span className="text-xs text-gray-500">
//                         {count} contrat{count > 1 ? "s" : ""}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-4 text-xs">
//                       <span className="text-green-700 font-semibold">
//                         {totalCommission.toLocaleString("fr-FR", {
//                           maximumFractionDigits: 2,
//                         })}{" "}
//                         € commission
//                       </span>
//                       <span className="text-blue-700">
//                         {totalPrevisionnel.toLocaleString("fr-FR", {
//                           maximumFractionDigits: 2,
//                         })}{" "}
//                         € prév.
//                       </span>
//                       <span className="text-gray-500">
//                         {totalBrokerageFees.toLocaleString("fr-FR", {
//                           maximumFractionDigits: 2,
//                         })}{" "}
//                         € frais
//                       </span>
//                     </div>
//                   </li>
//                 )
//               )}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* Digital Clients Card */}
//       {(userRole === "Admin" ||
//         userRole === "admin" ||
//         userRole === "Manager" ||
//         userRole === "Commercial") && (
//         <div className="border rounded-lg p-4 shadow-sm bg-white">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Clients Digitaux</h3>
//             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
//               {clientDigitalStats.totalClients} clients
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white rounded-lg p-4 border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-2 rounded-full bg-blue-100 mr-3">
//                   <UserOutlined className="text-blue-600" />
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-600">Total Clients</div>
//                   <div className="text-lg font-bold text-gray-800">
//                     {clientDigitalStats.totalClients}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg p-4 border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-2 rounded-full bg-green-100 mr-3">
//                   <TeamOutlined className="text-green-600" />
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-600">Nouveaux ce mois</div>
//                   <div className="text-lg font-bold text-gray-800">
//                     {clientDigitalStats.newThisMonth}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg p-4 border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-2 rounded-full bg-purple-100 mr-3">
//                   <PieChartOutlined className="text-purple-600" />
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-600">
//                     Taux de conversion
//                   </div>
//                   <div className="text-lg font-bold text-gray-800">
//                     {clientDigitalStats.conversionRate}%
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Card: Statistiques clients (Regular + Digital) */}
//       <div className="border rounded-lg p-4 shadow-sm bg-white">
//         <h3 className="text-lg font-semibold mb-4">Statistiques clients</h3>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <ClientStatBox
//             title="Particuliers"
//             count={stats?.clientStats?.particuliers?.count}
//             percentage={stats?.clientStats?.particuliers?.percentage}
//             icon={<UserOutlined />}
//             color="blue"
//           />
//           <ClientStatBox
//             title="Professionnels"
//             count={stats?.clientStats?.professionnels?.count}
//             percentage={stats?.clientStats?.professionnels?.percentage}
//             icon={<TeamOutlined />}
//             color="green"
//           />
//           <ClientStatBox
//             title="Entreprises"
//             count={stats?.clientStats?.entreprises?.count}
//             percentage={stats?.clientStats?.entreprises?.percentage}
//             icon={<ShopOutlined />}
//             color="purple"
//           />
//           <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="p-2 rounded-full bg-red-100 mr-3">
//                   <TeamOutlined className="text-red-600" />
//                 </div>
//                 <div>
//                   <div className="text-xs text-gray-600">Total clients</div>
//                   <div className="text-lg font-bold text-gray-800">
//                     {stats?.clientStats?.total}
//                   </div>
//                   {(userRole === "Admin" ||
//                     userRole === "admin" ||
//                     userRole === "Manager") &&
//                     clientDigitalStats?.totalClients > 0 && (
//                       <div className="text-xs text-gray-500 mt-1">
//                         dont {clientDigitalStats?.totalClients} digitaux
//                       </div>
//                     )}
//                 </div>
//               </div>
//               <MiniPieChart percentage={100} color="rgba(239, 68, 68, 0.7)" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
import React, { useState, useEffect, useMemo } from "react";
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
import { matchesAgence, filterByAgence } from "../utils/agenceFilter";

const MONTH_NAMES = {
  1: "janvier",
  2: "février",
  3: "mars",
  4: "avril",
  5: "mai",
  6: "juin",
  7: "juillet",
  8: "août",
  9: "septembre",
  10: "octobre",
  11: "novembre",
  12: "décembre",
};

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

const idOf = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  return val._id?.toString() || val.id?.toString() || null;
};

const Home = () => {
  const [activeRepartition, setActiveRepartition] = useState("assureurs");
  const [activeCommission, setActiveCommission] = useState("assureurs");
  const [drilldownRepartition, setDrilldownRepartition] = useState(null);
  const [drilldownCommission, setDrilldownCommission] = useState(null);

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
    commissionBreakdown: { assureurs: [], risques: [] },
    crossBreakdown: { byInsurer: {}, byRisk: {} },
  });
  const [loading, setLoading] = useState(true);
  const [clientDigitalStats, setClientDigitalStats] = useState({
    totalClients: 0,
    newThisMonth: 0,
    conversionRate: 0,
    averageValue: 0,
  });
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [rawContrats, setRawContrats] = useState([]);
  const [rawClients, setRawClients] = useState([]);
  const [rawDigitalClients, setRawDigitalClients] = useState([]);

  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);

  useEffect(() => {
    setDrilldownRepartition(null);
  }, [activeRepartition]);
  useEffect(() => {
    setDrilldownCommission(null);
  }, [activeCommission]);

  useEffect(() => {
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

  const filteredContrats = useMemo(() => {
    if (!filterYear && !filterMonth) return rawContrats;

    return rawContrats.filter((c) => {
      const d = c.effectiveDate || c.createdAt;
      if (!d) return !filterYear && !filterMonth;

      const date = new Date(d);
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth() + 1;

      if (filterYear && y !== parseInt(filterYear)) return false;
      if (filterMonth && m !== parseInt(filterMonth)) return false;
      return true;
    });
  }, [rawContrats, filterYear, filterMonth]);

  useEffect(() => {
    if (!rawContrats.length && !rawClients.length) return;

    const recomputed = processStats(
      [],
      [],
      rawClients,
      filteredContrats,
      rawDigitalClients
    );

    setStats(recomputed);
  }, [filteredContrats, rawClients, rawDigitalClients]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !decodedToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          reclamationsRes,
          sinistresRes,
          clientsRes,
          contratsRes,
          digitalRes,
        ] = await Promise.all([
          axios.get("/reclamations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/sinistres", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/data", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/contrat", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/datas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let reclamations = reclamationsRes.data?.data || [];
        let sinistres = sinistresRes.data?.data || [];
        let clients = clientsRes.data?.chatData || [];
        let contrats = contratsRes.data || [];
        const digitalResponse = digitalRes.data;

        let digitalClients =
          digitalResponse && Array.isArray(digitalResponse.chatData)
            ? digitalResponse.chatData
            : [];

        console.log("=== RAW DATA COUNTS ===", {
          role: userRole,
          reclamations: reclamations.length,
          sinistres: sinistres.length,
          clients: clients.length,
          contrats: contrats.length,
          digitalClients: digitalClients.length,
        });

        const roleLower = (userRole || "").toLowerCase();

        if (roleLower === "admin") {
          console.log("=== ADMIN: no filtering applied ===");
        } else if (roleLower === "commercial" || roleLower === "manager") {
          console.log(`=== ${roleLower.toUpperCase()} FILTERING (by agence) ===`);

          const allowedAgences = (digitalResponse?.userVilles || []).map((v) =>
            String(v).toUpperCase()
          );
          console.log(`Allowed agences for ${currentUserName}:`, allowedAgences);

          if (allowedAgences.length === 0) {
            console.warn(
              `${roleLower} has no agences configured. ` +
                `Please configure the cabinet at /Ma-structure. Showing 0.`
            );
            clients = [];
            digitalClients = [];
            contrats = [];
            reclamations = [];
            sinistres = [];
          } else {
            const hasAccessToAll =
              allowedAgences.includes("LILLE") &&
              allowedAgences.includes("LENS") &&
              allowedAgences.includes("VALENCIENNES");

            if (hasAccessToAll) {
              console.log(`${roleLower} has access to all agences — no filtering`);
            } else {
              clients = filterByAgence(clients, allowedAgences);
              digitalClients = filterByAgence(digitalClients, allowedAgences);
              contrats = filterByAgence(contrats, allowedAgences, "lead");

              reclamations = reclamations.filter((r) => {
                if (matchesAgence(r, allowedAgences)) return true;
                if (r.lead && matchesAgence(r.lead, allowedAgences)) return true;
                if (r.client && matchesAgence(r.client, allowedAgences))
                  return true;
                return false;
              });

              sinistres = sinistres.filter((s) => {
                if (matchesAgence(s, allowedAgences)) return true;
                if (
                  s.sinistreDetails &&
                  matchesAgence(s.sinistreDetails, allowedAgences)
                )
                  return true;
                if (
                  s.contratDetails &&
                  matchesAgence(s.contratDetails, allowedAgences)
                )
                  return true;
                return false;
              });
            }
          }

          console.log(`${roleLower} filtered counts (by agence):`, {
            allowedAgences,
            clients: clients.length,
            digitalClients: digitalClients.length,
            contrats: contrats.length,
            reclamations: reclamations.length,
            sinistres: sinistres.length,
          });
        } else {
          console.log(`Unknown role "${userRole}" - no filtering applied`);
        }

        setRawContrats(contrats);
        setRawClients(clients);
        setRawDigitalClients(digitalClients);

        const currentYear = new Date().getFullYear();
        const years = new Set();
        contrats.forEach((c) => {
          const d = c.effectiveDate || c.createdAt;
          if (!d) return;
          const y = new Date(d).getUTCFullYear();
          if (y < 2000 || y > currentYear + 5) {
            console.warn(
              "Skipping contract with abnormal year:",
              y,
              c.contractNumber
            );
            return;
          }
          years.add(y);
        });
        const sortedYears = [...years].sort((a, b) => b - a);
        setAvailableYears(sortedYears);
        console.log("Available years:", sortedYears);

        const processDigitalStats = (list) => {
          const clientsArray = Array.isArray(list) ? list : [];
          const totalClients = clientsArray.length;

          if (totalClients === 0) {
            return {
              totalClients: 0,
              newThisMonth: 0,
              conversionRate: 0,
              averageValue: 0,
            };
          }

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const newThisMonth = clientsArray.filter((client) => {
            if (!client) return false;
            const clientDate =
              client.createdAt ||
              client.dateCreated ||
              client.created_date ||
              client.date_created ||
              client.date;
            if (!clientDate) return false;
            try {
              const date = new Date(clientDate);
              return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
              );
            } catch (error) {
              return false;
            }
          }).length;

          const convertedClients = clientsArray.filter(
            (client) =>
              client &&
              (client.statut === "client" ||
                client.status === "client" ||
                client.statut === "Client")
          ).length;

          const conversionRate =
            totalClients > 0
              ? Math.round((convertedClients / totalClients) * 100)
              : 0;

          const totalValue = clientsArray.reduce((sum, client) => {
            if (!client) return sum;
            const value =
              client.prime ||
              client.montant ||
              client.value ||
              client.revenue ||
              client.chiffre_affaire ||
              client.averagePrime ||
              client.primeTTC ||
              client.montant_prime ||
              0;
            return sum + (Number(value) || 0);
          }, 0);

          const averageValue =
            totalClients > 0 ? Math.round(totalValue / totalClients) : 0;

          return { totalClients, newThisMonth, conversionRate, averageValue };
        };

        const digitalStats = processDigitalStats(digitalClients);
        setClientDigitalStats(digitalStats);

        console.log(
          `=== FINAL DATA SUMMARY for ${userRole} ${currentUserName} ===`,
          {
            regularClients: clients.length,
            digitalClients: digitalClients.length,
            digitalStats,
            reclamations: reclamations.length,
            sinistres: sinistres.length,
            contrats: contrats.length,
          }
        );

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

  const processStats = (
    reclamations,
    sinistres,
    clients,
    contrats,
    digitalClients = []
  ) => {
    if (
      !Array.isArray(reclamations) ||
      !Array.isArray(sinistres) ||
      !Array.isArray(clients) ||
      !Array.isArray(contrats)
    ) {
      return {
        repartition: { assureurs: [], risques: [] },
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
        primeTotals: {
          primeTTC: "0 €",
          totalPercentage: "0%",
          totalNumber: 0,
        },
        commissionBreakdown: { assureurs: [], risques: [] },
        crossBreakdown: { byInsurer: {}, byRisk: {} },
        clientStats: {
          particuliers: { count: 0, percentage: 0 },
          professionnels: { count: 0, percentage: 0 },
          entreprises: { count: 0, percentage: 0 },
          total: 0,
        },
      };
    }

    const assureurStats = {};
    const risqueStats = {};
    let totalPrimeTTC = 0;

    contrats.forEach((contract) => {
      if (contract.insurer) {
        if (!assureurStats[contract.insurer]) {
          assureurStats[contract.insurer] = { count: 0, totalPrime: 0 };
        }
        assureurStats[contract.insurer].count++;
        assureurStats[contract.insurer].totalPrime += contract.prime || 0;
      }

      if (contract.riskType) {
        if (!risqueStats[contract.riskType]) {
          risqueStats[contract.riskType] = { count: 0, totalPrime: 0 };
        }
        risqueStats[contract.riskType].count++;
        risqueStats[contract.riskType].totalPrime += contract.prime || 0;
      }

      totalPrimeTTC += contract.prime || 0;
    });

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

    console.log("=== CLIENT STATISTICS DEBUG ===", {
      regularClientsCount: totalRegularClients,
      digitalClientsCount: totalDigitalClients,
      totalClients,
      categories: clientCategories,
    });

    const getPercentage = (count) =>
      totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;

    const assureurCommissions = {};
    const risqueCommissions = {};
    let totalBrokerageFees = 0;

    contrats.forEach((contract) => {
      const commission = contract.prime * (contract.commissionRate / 100) || 0;
      const previsionnel = contract.recurrentCommission || 0;
      const brokerageFees = contract.brokerageFees || 0;

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

    const crossBreakdown = { byInsurer: {}, byRisk: {} };

    contrats.forEach((c) => {
      if (!c.insurer || !c.riskType) return;
      const commission = (c.prime || 0) * ((c.commissionRate || 0) / 100);
      const fees = c.brokerageFees || 0;
      const prev = c.recurrentCommission || 0;
      const prime = c.prime || 0;

      if (!crossBreakdown.byInsurer[c.insurer])
        crossBreakdown.byInsurer[c.insurer] = {};
      if (!crossBreakdown.byInsurer[c.insurer][c.riskType]) {
        crossBreakdown.byInsurer[c.insurer][c.riskType] = {
          name: c.riskType,
          count: 0,
          commission: 0,
          prime: 0,
          fees: 0,
          prev: 0,
        };
      }
      const i1 = crossBreakdown.byInsurer[c.insurer][c.riskType];
      i1.count += 1;
      i1.commission += commission;
      i1.prime += prime;
      i1.fees += fees;
      i1.prev += prev;

      if (!crossBreakdown.byRisk[c.riskType])
        crossBreakdown.byRisk[c.riskType] = {};
      if (!crossBreakdown.byRisk[c.riskType][c.insurer]) {
        crossBreakdown.byRisk[c.riskType][c.insurer] = {
          name: c.insurer,
          count: 0,
          commission: 0,
          prime: 0,
          fees: 0,
          prev: 0,
        };
      }
      const i2 = crossBreakdown.byRisk[c.riskType][c.insurer];
      i2.count += 1;
      i2.commission += commission;
      i2.prime += prime;
      i2.fees += fees;
      i2.prev += prev;
    });

    const sumCommissions = (obj) =>
      Object.values(obj).reduce(
        (acc, curr) => ({
          totalCommission: acc.totalCommission + curr.totalCommission,
          totalPrevisionnel: acc.totalPrevisionnel + curr.totalPrevisionnel,
          totalBrokerageFees: acc.totalBrokerageFees + curr.totalBrokerageFees,
          count: acc.count + curr.count,
        }),
        {
          totalCommission: 0,
          totalPrevisionnel: 0,
          totalBrokerageFees: 0,
          count: 0,
        }
      );

    const assureurTotals = sumCommissions(assureurCommissions);
    const risqueTotals = sumCommissions(risqueCommissions);

    return {
      repartition: {
        assureurs: Object.entries(assureurStats).map(
          ([name, { count, totalPrime }]) => ({
            name,
            count,
            percentage: Math.round((count / (contrats.length || 1)) * 100),
            primeTTC: `${totalPrime.toLocaleString()} €`,
          })
        ),
        risques: Object.entries(risqueStats).map(
          ([name, { count, totalPrime }]) => ({
            name,
            count,
            percentage: Math.round((count / (contrats.length || 1)) * 100),
            primeTTC: `${totalPrime.toLocaleString()} €`,
          })
        ),
      },
      primeTotals: {
        primeTTC: `${totalPrimeTTC.toLocaleString()} €`,
        totalPercentage: "100%",
        totalNumber: totalPrimeTTC,
      },
      commission: {
        assureurs: assureurTotals,
        risques: risqueTotals,
      },
      commissionBreakdown: {
        assureurs: Object.entries(assureurCommissions)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.totalCommission - a.totalCommission),
        risques: Object.entries(risqueCommissions)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.totalCommission - a.totalCommission),
      },
      crossBreakdown,
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
    return (
      <div className="p-4">
        Veuillez vous connecter pour voir les statistiques.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold">
          Tableau de Bord{" "}
          {userRole === "Commercial"
            ? "Commercial"
            : userRole === "Manager"
            ? "Manager"
            : "Administrateur"}
        </h2>
        {userRole === "Commercial" && (
          <p className="text-sm text-gray-600">
            Affichage de vos statistiques personnelles
          </p>
        )}
        {userRole === "Manager" && (
          <p className="text-sm text-gray-600">Vue d'ensemble</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Période :</span>

        <select
          value={filterYear}
          onChange={(e) => {
            setFilterYear(e.target.value);
            if (!e.target.value) setFilterMonth("");
          }}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">Toutes les années</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={!filterYear}
        >
          <option value="">Tous les mois</option>
          <option value="1">Janvier</option>
          <option value="2">Février</option>
          <option value="3">Mars</option>
          <option value="4">Avril</option>
          <option value="5">Mai</option>
          <option value="6">Juin</option>
          <option value="7">Juillet</option>
          <option value="8">Août</option>
          <option value="9">Septembre</option>
          <option value="10">Octobre</option>
          <option value="11">Novembre</option>
          <option value="12">Décembre</option>
        </select>

        {(filterYear || filterMonth) && (
          <button
            onClick={() => {
              setFilterYear("");
              setFilterMonth("");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Réinitialiser
          </button>
        )}

        <span className="text-sm text-gray-500 ml-auto">
          {filteredContrats.length} contrat
          {filteredContrats.length > 1 ? "s" : ""}
          {filterYear
            ? ` — ${filterMonth ? MONTH_NAMES[filterMonth] + " " : ""}${filterYear}`
            : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {drilldownRepartition ? (
            <div>
              <button
                onClick={() => setDrilldownRepartition(null)}
                className="mb-3 text-sm text-purple-700 hover:underline flex items-center gap-1"
              >
                ← Retour
              </button>
              <div className="text-xs text-gray-500 mb-2">
                {activeRepartition === "assureurs"
                  ? `Détail par risque pour : ${drilldownRepartition}`
                  : `Détail par assureur pour : ${drilldownRepartition}`}
              </div>
              <ul className="space-y-2">
                {Object.values(
                  activeRepartition === "assureurs"
                    ? stats.crossBreakdown?.byInsurer?.[drilldownRepartition] || {}
                    : stats.crossBreakdown?.byRisk?.[drilldownRepartition] || {}
                )
                  .sort((a, b) => b.prime - a.prime)
                  .map((row, i) => {
                    const pct = stats.primeTotals?.totalNumber
                      ? Math.round((row.prime / stats.primeTotals.totalNumber) * 100)
                      : 0;
                    return (
                      <li
                        key={i}
                        className="flex items-center p-2 rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center w-full justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">{row.name}</span>
                            <span className="text-xs text-gray-500">
                              {row.count} {row.count > 1 ? "contrats" : "contrat"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">
                              {row.prime.toLocaleString("fr-FR", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              €
                            </span>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {pct}%
                            </span>
                            <MiniPieChart
                              percentage={pct}
                              color="rgba(107, 33, 168, 0.7)"
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2">
              {stats.repartition[activeRepartition]
                .slice()
                .sort((a, b) => {
                  const pa =
                    parseFloat(String(a.primeTTC).replace(/[^\d.-]/g, "")) || 0;
                  const pb =
                    parseFloat(String(b.primeTTC).replace(/[^\d.-]/g, "")) || 0;
                  return pb - pa;
                })
                .map(({ name, count, percentage, primeTTC }, i) => (
                  <li
                    key={i}
                    onClick={() => setDrilldownRepartition(name)}
                    className="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer transition-colors"
                    title={`Voir le détail pour ${name}`}
                  >
                    <div className="flex items-center w-full justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{name}</span>
                        <span className="text-xs text-gray-500">
                          {count}{" "}
                          {activeRepartition === "assureurs"
                            ? count > 1
                              ? "contrats"
                              : "contrat"
                            : count > 1
                            ? "risques"
                            : "risque"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          {primeTTC}
                        </span>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {percentage}%
                        </span>
                        <MiniPieChart
                          percentage={percentage}
                          color="rgba(107, 33, 168, 0.7)"
                        />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

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
                      stats.commission[activeCommission]?.totalBrokerageFees || 0
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

          {drilldownCommission ? (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setDrilldownCommission(null)}
                className="mb-3 text-sm text-green-700 hover:underline flex items-center gap-1"
              >
                ← Retour
              </button>
              <div className="text-xs text-gray-500 mb-2">
                {activeCommission === "assureurs"
                  ? `Détail par risque pour : ${drilldownCommission}`
                  : `Détail par assureur pour : ${drilldownCommission}`}
              </div>
              <ul className="space-y-1">
                {Object.values(
                  activeCommission === "assureurs"
                    ? stats.crossBreakdown?.byInsurer?.[drilldownCommission] || {}
                    : stats.crossBreakdown?.byRisk?.[drilldownCommission] || {}
                )
                  .sort((a, b) => b.commission - a.commission)
                  .map((row, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-xs text-gray-500">
                          {row.count} contrat{row.count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-700 font-semibold">
                          {row.commission.toLocaleString("fr-FR", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          € commission
                        </span>
                        <span className="text-blue-700">
                          {row.prev.toLocaleString("fr-FR", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          € prév.
                        </span>
                        <span className="text-gray-500">
                          {row.fees.toLocaleString("fr-FR", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          € frais
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <ul className="mt-6 space-y-1 border-t pt-4">
              {(activeCommission === "assureurs"
                ? stats.commissionBreakdown?.assureurs
                : stats.commissionBreakdown?.risques
              )?.map(
                (
                  {
                    name,
                    count,
                    totalCommission,
                    totalPrevisionnel,
                    totalBrokerageFees,
                  },
                  i
                ) => (
                  <li
                    key={i}
                    onClick={() => setDrilldownCommission(name)}
                    className="flex items-center justify-between p-2 hover:bg-green-50 rounded text-sm cursor-pointer transition-colors"
                    title={`Voir le détail pour ${name}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-gray-500">
                        {count} contrat{count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-700 font-semibold">
                        {totalCommission.toLocaleString("fr-FR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        € commission
                      </span>
                      <span className="text-blue-700">
                        {totalPrevisionnel.toLocaleString("fr-FR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        € prév.
                      </span>
                      <span className="text-gray-500">
                        {totalBrokerageFees.toLocaleString("fr-FR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        € frais
                      </span>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>

      {(userRole === "Admin" ||
        userRole === "admin" ||
        userRole === "Manager" ||
        userRole === "Commercial") && (
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
                  <div className="text-xs text-gray-600">
                    Taux de conversion
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {clientDigitalStats.conversionRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {stats?.clientStats?.total}
                  </div>
                  {(userRole === "Admin" ||
                    userRole === "admin" ||
                    userRole === "Manager") &&
                    clientDigitalStats?.totalClients > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        dont {clientDigitalStats?.totalClients} digitaux
                      </div>
                    )}
                </div>
              </div>
              <MiniPieChart percentage={100} color="rgba(239, 68, 68, 0.7)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;