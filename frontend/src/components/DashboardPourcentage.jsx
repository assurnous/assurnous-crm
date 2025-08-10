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
import { Bar } from "react-chartjs-2";

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


const DashboardPourcentage = ({ courseDetails }) => {
    const barChartData = {
      labels: [ 
        "Auto_Entre",
        "PME",
        "Artisan",
        "Autre"],
      datasets: [
        {
          // label: "Pourcentage",
          data: courseDetails,
          backgroundColor: "#6366F1",
        },
      ],
    };
    return (
        <div className="">
          <div className="flex">
            <div style={{ height: "250px", width: "100%" }}>
              {" "}
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  indexAxis: "y",
                  maintainAspectRatio: false,
                  // scales: {
                  //   x: {
                  //     beginAtZero: true,
                  //     max: 100,
                  //   },
                  // },
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100,
                    },
                    y: {
                      categoryPercentage: 0.5, // Decrease this for more space between bars
                      barPercentage: 0.8, // Smaller bar width relative to the available space
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  elements: {
                    bar: {
                      barThickness: 5,
                      maxBarThickness: 5,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      );
}
export default DashboardPourcentage;