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
  import { faDesktop, faMobileAlt } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  

const DeviceCard = ({ mobileVisits, desktopVisits }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6 mt-4">
        {/* Desktop Card */}
        <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
          <div className="flex flex-col items-center justify-center">
            <FontAwesomeIcon
              icon={faDesktop}
              className="text-4xl text-blue-200 mb-4"
            />
            <p className="text-md font-semibold text-gray-600 mt-6">
              {desktopVisits}%
            </p>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Desktop Traffic
          </h4>
        </div>
  
        {/* Mobile Card */}
        <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
          <div className="flex flex-col items-center justify-center">
            <FontAwesomeIcon
              icon={faMobileAlt}
              className="text-4xl text-purple-200 mb-4"
            />
            <p className="text-md font-semibold text-gray-600 mt-6">
              {mobileVisits}%
            </p>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Mobiles Traffic
          </h4>
        </div>
      </div>
    );
  };
export default DeviceCard;