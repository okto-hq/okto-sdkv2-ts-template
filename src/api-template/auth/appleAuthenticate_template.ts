/*
 * This script explains how to perform authentication on Okto using Apple Sign-In and generate an okto auth token
 */

import dotenv from "dotenv";
import { loginUsingOAuth } from "../utils/generateOktoAuthToken.js";

dotenv.config();
const appleIdToken = process.env.APPLE_ID_TOKEN as string;

export const AppleAuthenticate = async () => {
    const payload = {
        idToken: appleIdToken,
        provider: "apple",
    };

    await loginUsingOAuth(
        payload.idToken,
        payload.provider
    );
    // Sample Response
    //   session:  SessionKey {
    //   priv: Uint8Array(32) [
    //     119, 224, 165, 162,  66, 139, 176,  92,
    //     121, 165, 170, 109,  61, 225, 113,  67,
    //     214, 115, 235,  38, 107, 151, 249, 149,
    //     232,  13,  56, 100, 196,  69,  41,   6
    //   ]
    // }
    // signed payload:  {
    //   authData: {
    //     idToken: 'eyJraWQiOiJyczBNM2tPVjlwIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoidGVjaC5va3RvLnNpIiwiZXhwIjoxNzQ5OTkxNzQxLCJpYXQiOjE3NDk5MDUzNDEsInN1YiI6IjAwMTg4Ni5iMjhjMWI1YjUyMzY0ODM3ODc4ZTBlY2I2M2ZmNWZlNC4xMjQ4IiwiYXRfaGFzaCI6Ii1Vdjh6MGlIUDREdlNWaVJITnpxSHciLCJlbWFpbCI6InNhYWtzaGlyYXV0MjhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGhfdGltZSI6MTc0OTkwNTMzOSwibm9uY2Vfc3VwcG9ydGVkIjp0cnVlfQ.FKt7_zQ_8WeZGz38vKB63UiIGPXciv4BhFwBSG71fWNw5mfFaRo13bg3Yif4X-2a2EFsINpzdKthPSl31HT2kf87gXHZGLetRKZumya4X5XsPMKE5166cUwCw-g--Z4z6Or-7YGlCPchwG6ENYYh7wVQvg8pKrH3DWIga8Ze9K8tKf0301cYiBqGK7HAj2FaVTfwmIVorlB5CXh7yL0WY8MAQJYcxO3w9i4c2RyrgMr5RxEh1NiBXl2VxFwwXqdUAcQTlWJy2Jo_TqWLzh8ZLSat6b2CuHCXKzufcj1l3id_zcq8DjHgAjm_vHxUptwX3YlaPDMzUN3EbboiwGXRbg',
    //     provider: 'apple'
    //   },
    //   sessionData: {
    //     nonce: 'f9e806da-2474-474b-8807-7e023741f4b7',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     sessionPk: '0x0479ac376b8ed6344a9b639a2d926187e0dc1be703bb39cc37e33364fc825179ea25849d51cbfca3c0c515d6c09314028d904b2faf402ddf7ed6ebf9ada5a47c43',
    //     maxPriorityFeePerGas: '0xBA43B7400',
    //     maxFeePerGas: '0xBA43B7400',
    //     paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
    //     paymasterData: '0x000000000000000000000000db70faf78b19576d3c969487cb75f5152cee2e8f00000000000000000000000000000000000000000000000000000000684dc459000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041433487e01b4721100acacf9974353e27234d4677e24179487010581e1706111438a01687677119367b055855e772d8abaac091964cec1fac252f7f13436b584f1c00000000000000000000000000000000000000000000000000000000000000'
    //   },
    //   sessionPkClientSignature: '0xd8f40c1c4bd5feda66b61473fa3390ad6095d6e2c3b2631eb2bee0177b4abc1819df60079c5cae2d0bf7d4dae693dee5ee75c6be9c40cf4801aad51dfb19fe811b',
    //   sessionDataUserSignature: '0x3d995180af0e04105e41995e0392ed250479265835115e177bc1314842cef059503e897dd39444ac4658b0d35fdba728936abf5d1d524ba381d1ce0f91437bac1c'
    // }
    // calling authenticate...
    // Request Body: {
    //   authData: {
    //     idToken: 'eyJraWQiOiJyczBNM2tPVjlwIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoidGVjaC5va3RvLnNpIiwiZXhwIjoxNzQ5OTkxNzQxLCJpYXQiOjE3NDk5MDUzNDEsInN1YiI6IjAwMTg4Ni5iMjhjMWI1YjUyMzY0ODM3ODc4ZTBlY2I2M2ZmNWZlNC4xMjQ4IiwiYXRfaGFzaCI6Ii1Vdjh6MGlIUDREdlNWaVJITnpxSHciLCJlbWFpbCI6InNhYWtzaGlyYXV0MjhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGhfdGltZSI6MTc0OTkwNTMzOSwibm9uY2Vfc3VwcG9ydGVkIjp0cnVlfQ.FKt7_zQ_8WeZGz38vKB63UiIGPXciv4BhFwBSG71fWNw5mfFaRo13bg3Yif4X-2a2EFsINpzdKthPSl31HT2kf87gXHZGLetRKZumya4X5XsPMKE5166cUwCw-g--Z4z6Or-7YGlCPchwG6ENYYh7wVQvg8pKrH3DWIga8Ze9K8tKf0301cYiBqGK7HAj2FaVTfwmIVorlB5CXh7yL0WY8MAQJYcxO3w9i4c2RyrgMr5RxEh1NiBXl2VxFwwXqdUAcQTlWJy2Jo_TqWLzh8ZLSat6b2CuHCXKzufcj1l3id_zcq8DjHgAjm_vHxUptwX3YlaPDMzUN3EbboiwGXRbg',
    //     provider: 'apple'
    //   },
    //   sessionData: {
    //     nonce: 'f9e806da-2474-474b-8807-7e023741f4b7',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     sessionPk: '0x0479ac376b8ed6344a9b639a2d926187e0dc1be703bb39cc37e33364fc825179ea25849d51cbfca3c0c515d6c09314028d904b2faf402ddf7ed6ebf9ada5a47c43',
    //     maxPriorityFeePerGas: '0xBA43B7400',
    //     maxFeePerGas: '0xBA43B7400',
    //     paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
    //     paymasterData: '0x000000000000000000000000db70faf78b19576d3c969487cb75f5152cee2e8f00000000000000000000000000000000000000000000000000000000684dc459000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041433487e01b4721100acacf9974353e27234d4677e24179487010581e1706111438a01687677119367b055855e772d8abaac091964cec1fac252f7f13436b584f1c00000000000000000000000000000000000000000000000000000000000000'
    //   },
    //   sessionPkClientSignature: '0xd8f40c1c4bd5feda66b61473fa3390ad6095d6e2c3b2631eb2bee0177b4abc1819df60079c5cae2d0bf7d4dae693dee5ee75c6be9c40cf4801aad51dfb19fe811b',
    //   sessionDataUserSignature: '0x3d995180af0e04105e41995e0392ed250479265835115e177bc1314842cef059503e897dd39444ac4658b0d35fdba728936abf5d1d524ba381d1ce0f91437bac1c'
    // }
    // provider:  apple
    // response :  {
    //   status: 'success',
    //   data: {
    //     userSWA: '0xb7ab3D9004286d1eDeFFA0E7Ec6cc6cDf0F38abF',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     nonce: '0x00000000000000000000000000000000f9e806da2474474b88077e023741f4b7',
    //     sessionExpiry: 1750769404
    //   }
    // }
    // Session Config:  {
    //   sessionPrivKey: '0x77e0a5a2428bb05c79a5aa6d3de17143d673eb266b97f995e80d3864c4452906',
    //   sessionPubKey: '0x0479ac376b8ed6344a9b639a2d926187e0dc1be703bb39cc37e33364fc825179ea25849d51cbfca3c0c515d6c09314028d904b2faf402ddf7ed6ebf9ada5a47c43',
    //   userSWA: '0xb7ab3D9004286d1eDeFFA0E7Ec6cc6cDf0F38abF'
    // }
    // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NDk5MTA4MDUsInNlc3Npb25fcHViX2tleSI6IjB4MDQ3OWFjMzc2YjhlZDYzNDRhOWI2MzlhMmQ5MjYxODdlMGRjMWJlNzAzYmIzOWNjMzdlMzMzNjRmYzgyNTE3OWVhMjU4NDlkNTFjYmZjYTNjMGM1MTVkNmMwOTMxNDAyOGQ5MDRiMmZhZjQwMmRkZjdlZDZlYmY5YWRhNWE0N2M0MyJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4MzZkOTBmOTQ4NGMwYmM3ZmJhMGRiNTQwZGMyYmM0MTQ5YzY3NmY0ODkwY2VlYTNmYmQzZDRhNDVlOGVhNTgxYTI3ZDJlYWM4NWE0MjAwODUxZTZlNGJlNjNjMDU2ZjM3OGM0N2EzNjU4YWRlN2JjNmMwYjFlNDA5YzA2MDk1Y2QxYiJ9

    // You can now invoke any other Okto endpoint using the authToken generated above
    // refer to our docs at docs.okto.tech/docs/openapi for API references
};

AppleAuthenticate();
