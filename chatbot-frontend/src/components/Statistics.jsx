// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     ArcElement,
//     Tooltip,
//     Legend,
//     PointElement,
//     LineElement,
//     Title,
//   } from "chart.js";

//   ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     ArcElement,
//     Tooltip,
//     Legend,
//     PointElement,
//     LineElement,
//     Title
//   );
//   import { faDesktop, faMobileAlt } from "@fortawesome/free-solid-svg-icons";
//   import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const Statistics = ({ mobileVisits, desktopVisits }) => {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6 mt-4">
//         {/* Desktop Card */}
//         <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
//           <div className="flex flex-col items-center justify-center">
//             <FontAwesomeIcon
//               icon={faDesktop}
//               className="text-4xl text-blue-600 mb-4"
//             />
//             <p className="text-md font-semibold text-gray-600 mt-6">
//               {desktopVisits}%
//             </p>
//           </div>
//           <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
//             Desktop Traffic
//           </h4>
//         </div>

//         {/* Mobile Card */}
//         <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
//           <div className="flex flex-col items-center justify-center">
//             <FontAwesomeIcon
//               icon={faMobileAlt}
//               className="text-4xl text-pink-600 mb-4"
//             />
//             <p className="text-md font-semibold text-gray-600 mt-6">
//               {mobileVisits}%
//             </p>
//           </div>
//           <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
//             Mobiles Traffic
//           </h4>
//         </div>
//       </div>
//     );
//   };
// export default Statistics;
import {
  faDesktop,
  faMobileAlt,
  faChartLine,
  faClock,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Statistics = ({
  mobileVisits,
  avgPagesVisited,
  medianSessionTime,
  creditScore,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-6 mt-4">
      {/* Mobile Traffic Card */}
      <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faMobileAlt}
            className="text-4xl text-pink-200 mb-4"
          />
          <p className="text-md font-semibold text-gray-600 mt-6">
            {mobileVisits}%
          </p>
        </div>
        <h4 className="text-xs font-semibold text-gray-400  mt-4 text-center">
        Moy Pages Visited Téléphone
        </h4>
      </div>

      {/* Average Pages Visited Card */}
      <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faChartLine}
            className="text-4xl text-purple-200 mb-4"
          />
          <p className="text-md font-semibold text-gray-600 mt-6">
            {avgPagesVisited}
          </p>
        </div>
        <h4 className="text-xs font-semibold mt-4 text-gray-400 text-center">
          Moy Pages Visited
        </h4>
      </div>

      {/* Median Session Time Card */}
      {/* <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faClock}
            className="text-4xl text-green-200 mb-4"
          />
          <p className="text-md font-semibold text-gray-600 mt-6">
            {medianSessionTime} mins
          </p>
        </div>
        <h4 className="text-xs font-semibold mt-4 text-gray-400 mb-2 text-center">
         Temps médian
        </h4>
      </div> */}

      {/* Credit Score Card */}
      {/* <div className="bg-white rounded-lg shadow-[0px_2px_6px_rgba(0,0,0,0.1),0px_8px_24px_rgba(0,0,0,0.15)] p-8">
        <div className="flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faCreditCard}
            className="text-4xl text-green-200 mb-4"
          />
          <p className="text-md font-semibold text-gray-600 mt-6">
            {creditScore}
          </p>
        </div>
        <h4 className="text-xs font-semibold text-gray-400 mt-4 mb-2 text-center">
          Credit Score
        </h4>
      </div> */}
    </div>
  );
};

export default Statistics;
