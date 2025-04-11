import tradeServiceClient from '../utils/axiosClient.js';

export async function registerIntent(request: any) {
  try {
    const response = await tradeServiceClient.post('/vpc/v1/intent/register', request);
    return response.data.data;
  } catch (error) {
    console.error('Error registering intent:', error);
    throw error;
  }
}