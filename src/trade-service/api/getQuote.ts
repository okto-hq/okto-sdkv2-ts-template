/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import tradeServiceClient from '../utils/axiosClient.js';

export async function getQuote(request: any) {
  try {
    const response = await tradeServiceClient.post('/vpc/v1/get-quote', request);
    return response.data.data;
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}
