import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_SECRET_KEY,
  pinataGateway: process.env.PINATA_GATEWAY,
});
