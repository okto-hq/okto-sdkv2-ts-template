/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import axios from 'axios';


const baseURL = process.env.TRADE_SERVICE_BASE_URL
if (!baseURL) {
  throw new Error("TRADE_SERVICE_BASE_URL is not defined in the environment variables.");
}
console.log("Trade Service Base URL: ", baseURL);

const tradeServiceClient = axios.create({
  baseURL: baseURL,
  timeout: 30000
});

// Add interceptor to inject custom header
tradeServiceClient.interceptors.request.use((config) => {
  const secret = process.env.TRADE_SERVICE_SECRET
  if (secret) {
    config.headers["x-authorization-secret"] = secret;
  }
  return config;
});

export default tradeServiceClient;
