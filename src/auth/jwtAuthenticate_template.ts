import { OktoAuthTokenGenerator } from "../utils/generateOktoAuthToken.js";

export const JwtAuthenticate = async () => {
  const payload = {
    idToken: "test1",                                               // Replace with JWT token
    provider: "client_jwt",
  };

  const response = await OktoAuthTokenGenerator(
    payload.idToken,
    payload.provider
  );
  console.log("response from jwtAuthenticate", response);
};

JwtAuthenticate();
