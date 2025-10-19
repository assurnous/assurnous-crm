// import { useEffect } from "react";
// import { jwtDecode } from 'jwt-decode';
// import axios from "axios";
// import { useNotifications } from "../NotificationContext";

// const NotificationUpdater = () => {
//   const { getUnseenCount, updateNotificationCount } = useNotifications();

//   useEffect(() => {
//     const fetchAndUpdateNotifications = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;
        
//         const decodedToken = jwtDecode(token);
//         const currentUserId = decodedToken?.userId;
        
//         const response = await axios.get("/reclamations");
//         const allReclamations = response.data.data || [];
        
//         console.log('Total reclamations:', allReclamations.length);
        
//         // Calculate unseen count
//         const unseenCount = getUnseenCount(allReclamations, currentUserId);
//         console.log('Unseen count calculated:', unseenCount);
//         updateNotificationCount(unseenCount);
//       } catch (error) {
//         console.error("Error updating notifications:", error);
//       }
//     };
    
//     fetchAndUpdateNotifications();
    
//     // Set up interval to periodically check for new notifications
//     const intervalId = setInterval(fetchAndUpdateNotifications, 30000);
    
//     return () => clearInterval(intervalId);
//   }, [getUnseenCount, updateNotificationCount]);

//   return null;
// };

// export default NotificationUpdater;