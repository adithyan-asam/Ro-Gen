import axios from 'axios';

const Roadmapfetch = async(course, time, token) => {
    try {
        console.log('Making API call with:', { course, time, token }); // Debug log
        
        const response = await axios.post('http://localhost:5001/api/roadmap', {
            course: course,
            time: time
        }, {
            headers: {
                'Authorization': `Bearer ${token}`, // Fixed: Added space after Bearer
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API Response:', response.data); // Debug log
        return response.data;
    } 
    catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Better error handling
        if (error.response) {
            // Server responded with error status
            throw new Error(`Server Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Check if backend is running.');
        } else {
            // Something else happened
            throw new Error(`Request Error: ${error.message}`);
        }
    }
};

export default Roadmapfetch;