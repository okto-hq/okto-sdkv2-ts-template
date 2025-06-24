/*
 * This script explains how to perform authentication on Okto using Twitter Sign-In and generate an okto auth token
 */
/*******************************************
 *                                         *
 *  WARNING: THIS IS DEMO CODE.            *
 *  DO NOT USE IN PRODUCTION WITHOUT       *
 *  CUSTOMIZING TO YOUR SPECIFIC NEEDS.    *
 *                                         *
 *******************************************/

import dotenv from "dotenv";
import { loginUsingOAuth } from "../utils/generateOktoAuthToken.js";

dotenv.config();
const twitterIdToken = process.env.TWITTER_ID_TOKEN as string;

export const TwitterAuthenticate = async () => {
    const payload = {
        idToken: twitterIdToken,
        provider: "twitter",
    };

    await loginUsingOAuth(
        payload.idToken,
        payload.provider
    );
    // Sample Response
    // session:  SessionKey {
    // priv: Uint8Array(32) [
    //     247, 114, 173, 228, 124,  57,  24, 238,
    //     91, 204, 130, 112,  86, 178, 195, 210,
    //     221,  62, 213,  27, 191, 140, 251, 103,
    //     84,  24, 110,  25, 158,  14, 130,  78
    // ]
    // }
    // signed payload:  {
    // authData: {
    //     idToken: 'azdQekVvSmhlbklwUlY0RGY1V2xfbGxaMktTeno1ekhSbDJXRmFqWDU3LW1TOjE3NTAwNTY3OTk5NjM6MToxOmF0OjE',
    //     provider: 'twitter'
    // },
    // sessionData: {
    //     nonce: 'c0c8916f-3fac-4a48-ac89-2d178abf5313',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     sessionPk: '0x0440417e717ea11e98ccd4cc10a8e3b6743c7f50880c0226109611d219d43809aeef018bf572d21df187ecd31f8f866bbfa16fda9dc00f1bc49b184927bdb94889',
    //     maxPriorityFeePerGas: '0xBA43B7400',
    //     maxFeePerGas: '0xBA43B7400',
    //     paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
    //     paymasterData: '0x000000000000000000000000db70faf78b19576d3c969487cb75f5152cee2e8f0000000000000000000000000000000000000000000000000000000068502774000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041a636855da104946fdf940c9faf5393e9ff9b7c1b4f15d3bcf32b47770ff38bda3e11bbfb22d4458311cedacde4b3c8de69c3c48d950f22160e5ba1940b996b991b00000000000000000000000000000000000000000000000000000000000000'
    // },
    // sessionPkClientSignature: '0xa5783230180426792308bc1fedffcf89f57a61d6efedfd251a21500b0334fe5e45fce0bd86a4e9900306a40a255fe967061283bdf2913ea8873053b44c5a1b2c1b',
    // sessionDataUserSignature: '0xf2d2fec94e4d072577c2b6460427e0ed348363162e3aacf37b47892223c71ec60e53ff4a7a162be82b5621d291f19eb850259ec193533263eacbe4027ed77b951c'
    // }
    // calling authenticate...
    // Request Body: {
    // authData: {
    //     idToken: 'azdQekVvSmhlbklwUlY0RGY1V2xfbGxaMktTeno1ekhSbDJXRmFqWDU3LW1TOjE3NTAwNTY3OTk5NjM6MToxOmF0OjE',
    //     provider: 'twitter'
    // },
    // sessionData: {
    //     nonce: 'c0c8916f-3fac-4a48-ac89-2d178abf5313',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     sessionPk: '0x0440417e717ea11e98ccd4cc10a8e3b6743c7f50880c0226109611d219d43809aeef018bf572d21df187ecd31f8f866bbfa16fda9dc00f1bc49b184927bdb94889',
    //     maxPriorityFeePerGas: '0xBA43B7400',
    //     maxFeePerGas: '0xBA43B7400',
    //     paymaster: '0x74324fA6Fa67b833dfdea4C1b3A9898574d076e3',
    //     paymasterData: '0x000000000000000000000000db70faf78b19576d3c969487cb75f5152cee2e8f0000000000000000000000000000000000000000000000000000000068502774000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041a636855da104946fdf940c9faf5393e9ff9b7c1b4f15d3bcf32b47770ff38bda3e11bbfb22d4458311cedacde4b3c8de69c3c48d950f22160e5ba1940b996b991b00000000000000000000000000000000000000000000000000000000000000'
    // },
    // sessionPkClientSignature: '0xa5783230180426792308bc1fedffcf89f57a61d6efedfd251a21500b0334fe5e45fce0bd86a4e9900306a40a255fe967061283bdf2913ea8873053b44c5a1b2c1b',
    // sessionDataUserSignature: '0xf2d2fec94e4d072577c2b6460427e0ed348363162e3aacf37b47892223c71ec60e53ff4a7a162be82b5621d291f19eb850259ec193533263eacbe4027ed77b951c'
    // }
    // provider:  twitter
    // response :  {
    // status: 'success',
    // data: {
    //     userSWA: '0xE8d11f00Aa2FB0CE06f7BABeE7122D058259E3AF',
    //     clientSWA: '0xdb70Faf78B19576d3C969487cb75f5152cee2E8F',
    //     nonce: '0x00000000000000000000000000000000c0c8916f3fac4a48ac892d178abf5313',
    //     sessionExpiry: 1750925845
    // }
    // }
    // Session Config:  {
    // sessionPrivKey: '0xf772ade47c3918ee5bcc827056b2c3d2dd3ed51bbf8cfb6754186e199e0e824e',
    // sessionPubKey: '0x0440417e717ea11e98ccd4cc10a8e3b6743c7f50880c0226109611d219d43809aeef018bf572d21df187ecd31f8f866bbfa16fda9dc00f1bc49b184927bdb94889',
    // userSWA: '0xE8d11f00Aa2FB0CE06f7BABeE7122D058259E3AF'
    // }
    // Okto session authToken:  eyJ0eXBlIjoiZWNkc2FfdW5jb21wcmVzc2VkIiwiZGF0YSI6eyJleHBpcmVfYXQiOjE3NTAwNjcyNDcsInNlc3Npb25fcHViX2tleSI6IjB4MDQ0MDQxN2U3MTdlYTExZTk4Y2NkNGNjMTBhOGUzYjY3NDNjN2Y1MDg4MGMwMjI2MTA5NjExZDIxOWQ0MzgwOWFlZWYwMThiZjU3MmQyMWRmMTg3ZWNkMzFmOGY4NjZiYmZhMTZmZGE5ZGMwMGYxYmM0OWIxODQ5MjdiZGI5NDg4OSJ9LCJkYXRhX3NpZ25hdHVyZSI6IjB4MjY5OTQ5MmNiNDg1NDYwMGQ5NWUwNWQwZjhjYTE5MjAyYzYxZmJlMTgyMzc3OWU0MTY0MmY0NTI4YWQ0OWU1YzRiZjc4Yzg0MjJjNmU1MzNhYTliN2Y0Nzg0NTU4YmYyODA5Nzg0NDM2ZDdjMzhiMDBmNDAxMTNjNjY2NDIzMGQxYiJ9

    // You can now invoke any other Okto endpoint using the authToken generated above
    // refer to our docs at docs.okto.tech/docs/openapi for API references
};

TwitterAuthenticate();
