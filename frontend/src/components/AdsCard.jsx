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
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import {
    faFacebook,
    faInstagram,
    faYoutube,
    faMicrosoft,
  } from "@fortawesome/free-brands-svg-icons";
  import { useState } from "react";
  
  const AdsCard = () => {
    const [clickedPlatform, setClickedPlatform] = useState(null);
  
    const pieData = [
      {
        platform: "Facebook",
        icon: faFacebook,
        color: "text-blue-600",
        chartData: {
          labels: ["Engagement", "Reach", "Clicks"],
          datasets: [
            {
              data: [30, 40, 30], // Dummy data
              backgroundColor: ["#3b5998", "#8b9dc3", "#dfe3ee"],
              hoverOffset: 4,
            },
          ],
        },
        dummyPercentages: ["30%", "40%", "30%"],
      },
      {
        platform: "Instagram",
        icon: faInstagram,
        color: "text-pink-500",
        chartData: {
          labels: ["Engagement", "Reach", "Clicks"],
          datasets: [
            {
              data: [25, 50, 25], // Dummy data
              backgroundColor: ["#e1306c", "#f56040", "#fd1d1d"],
              hoverOffset: 4,
            },
          ],
        },
        dummyPercentages: ["25%", "50%", "25%"],
      },
      {
        platform: "YouTube",
        icon: faYoutube,
        color: "text-red-600",
        chartData: {
          labels: ["Views", "Likes", "Subscribers"],
          datasets: [
            {
              data: [40, 30, 30], // Dummy data
              backgroundColor: ["#ff0000", "#ff6347", "#ffa07a"],
              hoverOffset: 4,
            },
          ],
        },
        dummyPercentages: ["40%", "30%", "30%"],
      },
      {
        platform: "Bing",
        icon: faMicrosoft,
        color: "text-blue-500",
        chartData: {
          labels: ["Impressions", "Clicks", "Conversions"],
          datasets: [
            {
              data: [20, 50, 30], // Dummy data
              backgroundColor: ["#0078d4", "#00a4ef", "#6ec1e4"],
              hoverOffset: 4,
            },
          ],
        },
        dummyPercentages: ["20%", "50%", "30%"],
      },
    ];
  
    const handleClick = (platform) => {
      setClickedPlatform(clickedPlatform === platform ? null : platform); // Toggle on click
    };
  
    return (
      <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-6 mt-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-6 text-start">
          ADS
        </h4>
        <div className="space-y-6">
          {pieData.map(({ platform, icon, color, chartData, dummyPercentages }) => (
            <div
              key={platform}
              className="flex items-center gap-12 justify-between cursor-pointer"
              onClick={() => handleClick(platform)}
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={icon}
                  className={`text-3xl ${color} mr-4`}
                />
                <h5 className="text-md font-semibold text-gray-600">
                  {platform}
                </h5>
              </div>
              {/* Display dummy percentage values when clicked */}
              {clickedPlatform === platform && (
                <div className="text-gray-600">
                  {dummyPercentages.map((percentage, index) => (
                    <p key={index}>{`${chartData.labels[index]}: ${percentage}`}</p>
                  ))}
                </div>
              )}
              <div style={{ width: "50px", height: "50px" }}>
                <Pie
                  data={chartData}
                  options={{
                    cutout: "70%",
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default AdsCard;
  