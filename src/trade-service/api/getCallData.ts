import tradeServiceClient from '../utils/axiosClient.js';

export async function getCallData(request: any) {
  try {
    const response = await tradeServiceClient.post('/vpc/v1/get-call-data', request);
    return response.data.data;
  } catch (error) {
    console.error('Error getting call data:', error);
    throw error;
  }
} 