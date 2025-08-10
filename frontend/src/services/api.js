import axios from 'axios';

const API_URL = 'https://your-api-endpoint.com'; // Replace with your actual API URL

export const fetchUserData = async () => {
    try {
        const response = await axios.get(`${API_URL}/user-data`);
        return response.data; // Assuming your API returns data in the format you need
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error; // Rethrow the error for further handling if needed
    }
};