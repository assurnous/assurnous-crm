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
  import { Pie } from "react-chartjs-2";

const DashboardCharts = ({ totalLeads, categoryCounts }) => {
    const pieChartDataLeft = {
      labels: [
        "Auto_Entrepreneur",
        "PME",
        "Artisan",
        "Autre"
      ],
      datasets: [
        {
          data: categoryCounts,
          backgroundColor: [
            "#3B82F6",
            "#FBBF24",
            "#F87171",
            "#34D399",
            "#A78BFA",
          ],
          hoverOffset: 4,
        },
      ],
    };
  
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] w-full">
            <h4 className="text-lg text-center mt-2 font-semibold text-gray-700 mb-2">
              Répartition des leads
            </h4>
            <Pie data={pieChartDataLeft} options={{ cutout: "90%" }} />
            <p className="text-center mt-4 text-2xl font-semibold">
              Total {totalLeads}
            </p>{" "}
          </div>
        </div>
      </div>
    );
  };

export default DashboardCharts;