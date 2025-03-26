import axios from 'axios';

const API_URL = 'http://<SEU_IP_LOCAL>:5000/predict'; // Use seu IP real

export const checkAnomalies = async (sensorData) => {
  try {
    const response = await axios.post(API_URL, {
      battery: sensorData.batteryLevel,
      front_dist: sensorData.frontDistance,
      rear_dist: sensorData.rearDistance,
      speed: sensorData.speed
    });
    
    return response.data;
    
  } catch (error) {
    console.error('Erro na IA:', error);
    return { anomaly: true, confidence: 1.0 };
  }
};