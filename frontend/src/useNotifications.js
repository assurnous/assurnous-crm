// import { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import {jwtDecode} from 'jwt-decode';

// export const useNotifications = () => {
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [notifications, setNotifications] = useState([]);
  

//   // Get auth headers
//   const getAuthHeaders = useCallback(() => {
//     const token = localStorage.getItem('token');
//     return {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     };
//   }, []);

// const fetchUnreadCount = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       console.log('🔔 fetchUnreadCount - Token exists:', !!token);
      
//       if (!token) {
//         setUnreadCount(0);
//         return;
//       }
  
//       // Decode to see who we are
//       const decoded = jwtDecode(token);
//       console.log('🔔 Current user:', {
//         userId: decoded.userId,
//         role: decoded.role,
//         name: decoded.name
//       });
  
//       console.log('🔔 Making API call to /api/notifications/unread-count...');
      
//       const response = await axios.get('/unread-count', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       console.log('🔔 API Response:', response.data);
//       console.log('🔔 Response headers:', response.headers);
      
//       setUnreadCount(response.data.count);
//     } catch (error) {
//       console.error('🔔 Error fetching unread count:', error);
//       if (error.response) {
//         console.error('🔔 Response error:', error.response.status, error.response.data);
//       }
//       setUnreadCount(0);
//     }
//   }, []);
//   const fetchNotifications = useCallback(async () => {
//     try {
//       const response = await axios.get('/notifications', getAuthHeaders());
//       setNotifications(response.data);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       if (error.response?.status === 401) {
//         setNotifications([]);
//       }
//     }
//   }, [getAuthHeaders]);

//   const markAsRead = useCallback(async (reclamationId = null) => {
//     try {
//       console.log('Marking notifications as read...', { reclamationId });
//       await axios.post('/mark-as-read', { reclamationId }, getAuthHeaders());
//       // Refresh counts after marking as read
//       await fetchUnreadCount();
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error marking notifications as read:', error);
//     }
//   }, [getAuthHeaders, fetchUnreadCount, fetchNotifications]);

//   useEffect(() => {
//     console.log('useNotifications hook mounted');
//     const token = localStorage.getItem('token');
//     if (token) {
//       fetchUnreadCount();
//       fetchNotifications();

//       // Poll for new notifications every 30 seconds
//       const interval = setInterval(fetchUnreadCount, 30000);
//       return () => {
//         console.log('Clearing notification interval');
//         clearInterval(interval);
//       };
//     }
//   }, [fetchUnreadCount, fetchNotifications]);

//   return {
//     unreadCount,
//     notifications,
//     fetchUnreadCount,
//     fetchNotifications,
//     markAsRead
//   };
// };
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Get the full API base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔔 PRODUCTION DEBUG - API_BASE:', API_BASE);
      console.log('🔔 PRODUCTION DEBUG - Token exists:', !!token);
      
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const decoded = jwtDecode(token);
      console.log('🔔 PRODUCTION DEBUG - Current user:', decoded.userId);

      // Use full URL to your backend
      const response = await axios.get(`${API_BASE}/unread-count`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔔 PRODUCTION DEBUG - API Success:', response.data);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('🔔 PRODUCTION DEBUG - API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // Check for CORS issues
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        console.error('🔔 CORS Error - Check backend CORS configuration for:', window.location.origin);
      }
      
      setUnreadCount(0);
    }
  }, [API_BASE]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        setNotifications([]);
      }
    }
  }, [API_BASE]);

  const markAsRead = useCallback(async (reclamationId = null) => {
    try {
      console.log('Marking notifications as read...', { reclamationId });
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/mark-as-read`, { reclamationId }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Refresh counts after marking as read
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [API_BASE, fetchUnreadCount]);

  useEffect(() => {
    console.log('🔔 useNotifications mounted - API_BASE:', API_BASE);
    
    const token = localStorage.getItem('token');
    if (token) {
      fetchUnreadCount();
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => {
        console.log('Clearing notification interval');
        clearInterval(interval);
      };
    }
  }, [fetchUnreadCount, fetchNotifications, API_BASE]);

  return {
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead
  };
};