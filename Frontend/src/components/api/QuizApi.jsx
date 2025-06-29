import axios from 'axios';

const Quizfetch = async(course, level, topic, subtopic, points, time, token) => {
    try{
        const response = await axios.post('http://localhost:5001/api/quiz',{
            course: course,
            level: level,
            weekTopic: topic,
            subtopicTitle: subtopic,
            points: points,
            time: time
        },{
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch(err){
        if (err.response) {
            // Server responded with error status
            throw new Error(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
            // Request was made but no response received
            throw new Error('No response from server. Check if backend is running.');
        } else {
            // Something else happened
            throw new Error(`Request Error: ${err.message}`);
        }
    }
}

export default Quizfetch;