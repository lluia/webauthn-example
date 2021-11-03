import { NextApiRequest, NextApiResponse } from "next";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import webauthnStorageService from "../../../../src/services/webauthnStorage";

async function handleAuthentication(req: NextApiRequest, res: NextApiResponse) {
  const email = req.query["email"];

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required." });
  }

  const credentials = await webauthnStorageService.getCredentials(email);

  const options = generateAuthenticationOptions({
    userVerification: "preferred",
  });

  options.allowCredentials = credentials.map((c) => ({
    id: c.credentialID,
    type: "public-key",
    transports: c.transports,
  }));

  try {
    await webauthnStorageService.saveChallenge({
      userID: email,
      challenge: options.challenge,
    });
  } catch (err) {
    return res.status(500).json({ message: "Could not set up challenge." });
  }
  return res.status(200).json(options);
}

export default async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return handleAuthentication(req, res);

  return res.status(404).json({ message: "The method is forbidden." });
}
