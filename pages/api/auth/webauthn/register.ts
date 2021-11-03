import { NextApiRequest, NextApiResponse } from "next";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getSession } from "next-auth/react";
import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";
import webauthnStorageService from "../../../../src/services/webauthnStorage";

const domain = process.env.WEBAUTHN_APP_DOMAIN!;
const origin = process.env.WEBAUTHN_APP_ORIGIN!;
const appName = process.env.WEBAUTHN_APP_NAME!;

/**
 * GET /api/auth/webauthn/register
 * ===============================
 */
async function handlePreRegister(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const email = session?.user?.email;

  if (!email) {
    return res.status(401).json({ message: "Authentication is required" });
  }

  const credentials = await webauthnStorageService.getCredentials(email);

  const options = generateRegistrationOptions({
    rpID: domain,
    rpName: appName,
    userID: email,
    userName: email,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "preferred",
    },
  });

  options.excludeCredentials = credentials.map((c) => ({
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

/**
 * POST /api/auth/webauthn/register
 * ================================
 */
async function handleRegister(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const email = session?.user?.email;

  if (!email) {
    return res
      .status(401)
      .json({ success: false, message: "You are not connected." });
  }

  const challenge = await webauthnStorageService.getChallenge(email);

  if (!challenge) {
    return res
      .status(401)
      .json({ success: false, message: "Pre-registration is required." });
  }

  const credential = req.body as RegistrationCredentialJSON;

  const { verified, registrationInfo: info } = await verifyRegistrationResponse(
    {
      credential,
      expectedRPID: domain,
      expectedOrigin: origin,
      expectedChallenge: challenge.value,
    }
  );

  if (!verified || !info) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }

  try {
    await webauthnStorageService.saveCredentials({
      credentialID: credential.id,
      transports: credential.transports ?? ["internal"],
      userID: email,
      key: info.credentialPublicKey,
      counter: info.counter,
    });
    return res.status(201).json({ success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Could not register the credential." });
  }
}

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") return handlePreRegister(req, res);
  if (req.method === "POST") return handleRegister(req, res);
  return res.status(404).json({ message: "The method is forbidden." });
}
