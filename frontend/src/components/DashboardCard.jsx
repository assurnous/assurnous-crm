// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUserPlus,
//   faCalendarAlt,
//   faArrowUp,
// } from "@fortawesome/free-solid-svg-icons";
// import { Pie, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   Title,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   Title
// );

// const TauxCapture = () => {
//   const [chatData, setChatData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [clientCount, setClientCount] = useState(0);
//   const [prospectCount, setProspectCount] = useState(0);

//   useEffect(() => {
//     const getUserData = async () => {
//       try {
//         const response = await axios.get("/data");
//         console.log("Fetched data leads:", response.data);

//         setChatData(response.data.chatData);

//         // Calculate counts
//         const clients = response.data.chatData.filter(
//           (lead) => lead.type === "client"
//         ).length;
//         const prospects = response.data.chatData.filter(
//           (lead) => lead.type === "prospect"
//         ).length;

//         setClientCount(clients);
//         setProspectCount(prospects);

//         console.log("Client Count:", clients);
//         console.log("Prospect Count:", prospects);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     getUserData();
//   }, []);


//   const data = {
//     labels: ["Qualified", "Disqualified"],
//     datasets: [
//       {
//         data: [clientCount, prospectCount],
//         backgroundColor: ["#4CAF50", "#F44336"], // Qualified = green, Disqualified = red
//         hoverBackgroundColor: ["#45A049", "#E53935"],
//       },
//     ],
//   };
//   return (
//     <div className="bg-white rounded-lg p-6 shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] flex flex-col items-center">
//       <h1 className="text-lg font-semibold text-gray-700 mb-6">
//         Taux de captation
//       </h1>
//       <div className="relative w-40 h-40 mb-8">
//         <Pie data={data} />
//       </div>
//       <div className="flex justify-between w-full mt-8">
//         <div className="flex flex-col items-center">
//           <h1 className="text-sm font-semibold text-gray-500">
//             Contact disqualifié
//           </h1>
//           <p className="text-md font-semibold text-gray-600">{prospectCount}</p>
//         </div>
//         <div className="flex flex-col items-center">
//           <h1 className="text-sm font-semibold text-gray-500">
//             Contact qualifié
//           </h1>
//           <p className="text-md font-semibold text-gray-600">{clientCount}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const DashboardCards = () => {
//   const [totalLeads, setTotalLeads] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [categoryCounts, setCategoryCounts] = useState([0, 0, 0, 0, 0]);

//   const [leads, setLeads] = useState([]);

//   const [averageDailyLeads, setAverageDailyLeads] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get("/data");
//         const leadsData = response.data.chatData;
//         setLeads(leadsData);
//         setTotalLeads(leadsData.length);

//         // Calculate average daily leads
//         const uniqueDates = [
//           ...new Set(
//             leadsData.map((lead) =>
//               new Date(lead.createdAt).toLocaleDateString()
//             )
//           ),
//         ];
//         const average = leadsData.length / uniqueDates.length;
//         setAverageDailyLeads(average);

//         const mobileVisitCount = leadsData.filter(
//           (lead) => lead.device === "mobile"
//         ).length;
//         const desktopVisitCount = leadsData.filter(
//           (lead) => lead.device === "desktop"
//         ).length;

//         const categories = ["Auto_Entrepreneur", "PME", "Artisan", "Autre"];
//         const counts = categories.map(
//           (category) =>
//             leadsData.filter(
//               (lead) => lead.request_who && lead.request_who.includes(category)
//             ).length
//         );

//         setCategoryCounts(counts);
//       } catch (err) {
//         setError("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const prepareChartData = () => {
//     const groupedLeads = leads.reduce((acc, lead) => {
//       const date = new Date(lead.createdAt).toLocaleDateString();
//       if (!acc[date]) acc[date] = 0;
//       acc[date]++;
//       return acc;
//     }, {});

//     const dates = Object.keys(groupedLeads);
//     const counts = Object.values(groupedLeads);

//     return {
//       labels: dates,
//       datasets: [
//         {
//           label: "Leads",
//           data: counts,
//           fill: false,
//           borderColor: "#3498db",
//           tension: 0.6,
//         },
//       ],
//     };
//   };
//   const chartData = prepareChartData();
//   const getOneDecimalPlace = (number) => {
//     return number.toFixed(1);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <div className="grid grid-cols-3 md:grid-cols-3 w-full gap-6 rounded-md mt-2">
//         <div className="md:col-span-1">
//           <div className="mt-4">
//             <TauxCapture
//               qualifiePercent={56}
//               desqualifiePercent={44}
//               qualifieCount={560}
//               desqualifieCount={440}
//             />
//           </div>
//         </div>

//         <div className="md:col-span-2">
//           <div className="bg-white  rounded-lg  shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] mt-4 w-full">
//             <h2 className="text-lg font-semibold px-6 py-4 text-gray-700 ">
//               Contacts
//             </h2>
//             <div className="flex items-center  w-full">
//               {/* Titles Section */}
//               <div className="flex flex-col space-y-12 justify-between w-1/6">
//                 {/* Prévisions annuelles */}
//                 <div className="text-center">
//                   <div className="mt-4">
//                     <FontAwesomeIcon
//                       icon={faCalendarAlt}
//                       className="text-blue-200 text-xl mx-auto"
//                     />
//                   </div>
//                   <h3 className="text-xs text-gray-400 font-semibold">
//                     Prévisions annuelles
//                   </h3>
//                   <p className="text-xl font-bold">{totalLeads}</p>
//                 </div>

//                 {/* Moyenne quotidienne */}
//                 <div className="text-center">
//                   <div className="mb-2">
//                     <FontAwesomeIcon
//                       icon={faArrowUp}
//                       className="text-green-400 text-xl mx-auto"
//                     />
//                   </div>
//                   <h3 className="text-xs text-gray-400 font-semibold">
//                     Moyenne quotidienne
//                   </h3>
//                   <p className="text-xl font-bold">
//                     {getOneDecimalPlace(averageDailyLeads)}
//                   </p>
//                 </div>
//               </div>

//               <div className="w-5/6 h-[300px]">
//                 <Line
//                   data={chartData}
//                   options={{
//                     responsive: true,
//                     scales: {
//                       x: {
//                         title: {
//                           display: false,
//                         },
//                         ticks: {
//                           display: false,
//                           beginAtZero: true,
//                           stepSize: 1,
//                         },
//                       },
//                       y: {
//                         title: {
//                           display: false,
//                         },
//                         min: 0,
//                         max: 5000,
//                         ticks: {
//                           stepSize: 500,
//                         },
//                       },
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardCards;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faCalendarAlt,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

const TauxCapture = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientCount, setClientCount] = useState(0);
  const [prospectCount, setProspectCount] = useState(0);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get("/data");
        console.log("Fetched data leads:", response.data);

        setChatData(response.data.chatData);

        // Calculate counts
        const clients = response.data.chatData.filter(
          (lead) => lead.type === "client"
        ).length;
        const prospects = response.data.chatData.filter(
          (lead) => lead.type === "prospect"
        ).length;

        setClientCount(clients);
        setProspectCount(prospects);

        console.log("Client Count:", clients);
        console.log("Prospect Count:", prospects);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  const totalCount = clientCount + prospectCount;

  const data = {
    labels: ["Qualified", "Disqualified"],
    datasets: [
      {
        data: [clientCount, prospectCount],
        backgroundColor: ["#4CAF50", "#F44336"], // Qualified = green, Disqualified = red
        hoverBackgroundColor: ["#45A049", "#E53935"],
      },
    ],
  };
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] flex flex-col items-center w-full">
      <h1 className="text-lg font-semibold text-gray-700 mb-4 md:mb-6">
        Taux de captation
      </h1>
      <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 md:mb-8">
        <Pie data={data} />
      </div>
      <div className="flex justify-between w-full mt-4 md:mt-8">
        <div className="flex flex-col items-center">
          <h1 className="text-xs md:text-sm font-semibold text-gray-500">
            Contact disqualifié
          </h1>
          <p className="text-sm md:text-md font-semibold text-gray-600">
            {prospectCount}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-xs md:text-sm font-semibold text-gray-500">
            Contact qualifié
          </h1>
          <p className="text-sm md:text-md font-semibold text-gray-600">
            {clientCount}
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardCards = () => {
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState([0, 0, 0, 0, 0]);

  const [leads, setLeads] = useState([]);

  const [averageDailyLeads, setAverageDailyLeads] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/data");
        const leadsData = response.data.chatData;
        setLeads(leadsData);
        setTotalLeads(leadsData.length);

        // Calculate average daily leads
        const uniqueDates = [
          ...new Set(
            leadsData.map((lead) =>
              new Date(lead.createdAt).toLocaleDateString()
            )
          ),
        ];
        const average = leadsData.length / uniqueDates.length;
        setAverageDailyLeads(average);

        const mobileVisitCount = leadsData.filter(
          (lead) => lead.device === "mobile"
        ).length;
        const desktopVisitCount = leadsData.filter(
          (lead) => lead.device === "desktop"
        ).length;

        const categories = ["Auto_Entrepreneur", "PME", "Artisan", "Autre"];
        const counts = categories.map(
          (category) =>
            leadsData.filter(
              (lead) => lead.request_who && lead.request_who.includes(category)
            ).length
        );

        setCategoryCounts(counts);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const prepareChartData = () => {
    const groupedLeads = leads.reduce((acc, lead) => {
      const date = new Date(lead.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    const dates = Object.keys(groupedLeads);
    const counts = Object.values(groupedLeads);

    return {
      labels: dates,
      datasets: [
        {
          label: "Leads",
          data: counts,
          fill: false,
          borderColor: "#3498db",
          tension: 0.6,
        },
      ],
    };
  };
  const chartData = prepareChartData();
  const getOneDecimalPlace = (number) => {
    return number.toFixed(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-2 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4 md:gap-6 rounded-md mt-2">
        <div className="md:col-span-1">
          <div className="mt-2 md:mt-4">
            <TauxCapture
              qualifiePercent={56}
              desqualifiePercent={44}
              qualifieCount={560}
              desqualifieCount={440}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] mt-2 md:mt-4 w-full">
            <h2 className="text-lg font-semibold px-4 md:px-6 py-3 md:py-4 text-gray-700">
              Contacts
            </h2>
            <div className="flex flex-col md:flex-row items-center w-full p-2 md:p-0">
              {/* Titles Section */}
              <div className="flex md:flex-col md:space-y-12 justify-between w-full md:w-1/6 mb-4 md:mb-0">
                {/* Prévisions annuelles */}
                <div className="text-center w-1/2 md:w-full">
                  <div className="mt-2 md:mt-4">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-blue-200 text-lg md:text-xl mx-auto"
                    />
                  </div>
                  <h3 className="text-xs text-gray-400 font-semibold">
                    Prévisions annuelles
                  </h3>
                  <p className="text-lg md:text-xl font-bold">{totalLeads}</p>
                </div>

                {/* Moyenne quotidienne */}
                <div className="text-center w-1/2 md:w-full">
                  <div className="mb-1 md:mb-2">
                    <FontAwesomeIcon
                      icon={faArrowUp}
                      className="text-green-400 text-lg md:text-xl mx-auto"
                    />
                  </div>
                  <h3 className="text-xs text-gray-400 font-semibold">
                    Moyenne quotidienne
                  </h3>
                  <p className="text-lg md:text-xl font-bold">
                    {getOneDecimalPlace(averageDailyLeads)}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-5/6 h-[250px] md:h-[300px]">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: false,
                        },
                        ticks: {
                          display: false,
                          beginAtZero: true,
                          stepSize: 1,
                        },
                      },
                      y: {
                        title: {
                          display: false,
                        },
                        min: 0,
                        max: 5000,
                        ticks: {
                          stepSize: 500,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;