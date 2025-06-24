/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import tradeServiceClient from '../utils/axiosClient.js';

export async function getBestRoute(request: any) {
  try {
    const response = await tradeServiceClient.post('/vpc/v1/get-best-route', request);
    return response.data.data;
  } catch (error) {
    console.error('Error getting best route:', error);
    throw error;
  }
}
