import { Binary, Document } from "mongodb";
import base64url from "base64url";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import mongoDbService from "./mongodb";

const dbName = process.env.WEBAUTHN_DBNAME!;

interface SaveChallengeArgs {
  challenge: string;
  userID: string;
}

async function saveChallenge({ userID, challenge }: SaveChallengeArgs) {
  const db = await mongoDbService.getDb(dbName);

  await db.collection("challenge").updateOne(
    {
      userID,
    },
    {
      $set: {
        value: challenge,
      },
    },
    {
      upsert: true,
    }
  );
}

interface ChallengeCollection {
  userID: string;
  value: string;
}

async function getChallenge(userID: string) {
  const db = await mongoDbService.getDb(dbName);
  const challengeObj = await db
    .collection<ChallengeCollection>("challenge")
    .findOneAndDelete({
      userID,
    });
  return challengeObj.value;
}

interface DbCredential {
  credentialID: string;
  userID: string;
  transports: AuthenticatorTransport[];
  credentialPublicKey: Binary | Buffer;
  counter: number;
}

interface SaveCredentialArgs {
  transports: AuthenticatorTransport[];
  credentialID: string;
  counter: number;
  userID: string;
  key: Buffer;
}

async function getCredentials(email: string) {
  const db = await mongoDbService.getDb(dbName);

  return db
    .collection<DbCredential>("credentials")
    .find({ userID: email })
    .toArray();
}

async function saveCredentials(cred: SaveCredentialArgs) {
  const db = await mongoDbService.getDb(dbName);
  await db.collection<DbCredential>("credentials").insertOne({
    credentialID: cred.credentialID,
    transports: cred.transports,
    userID: cred.userID,
    credentialPublicKey: cred.key,
    counter: cred.counter,
  });
}

interface VerifyAndUpdateCredentialsArgs {
  credential: any;
  domain: string;
}

async function verifyAndUpdateCredentials({
  credential,
  domain,
}: VerifyAndUpdateCredentialsArgs) {
  const db = await mongoDbService.getDb(dbName);

  const authenticator = await db
    .collection<DbCredential & Document>("credentials")
    .findOne({
      credentialID: credential.id,
    });
  if (!authenticator) return null;

  const challenge = await getChallenge(authenticator.userID);
  if (!challenge) return null;

  try {
    const { verified, authenticationInfo: info } = verifyAuthenticationResponse(
      {
        credential: credential,
        expectedChallenge: challenge.value,
        expectedOrigin: process.env.WEBAUTHN_APP_ORIGIN!,
        expectedRPID: process.env.WEBAUTHN_APP_DOMAIN!,
        authenticator: {
          credentialPublicKey: authenticator.credentialPublicKey
            .buffer as Buffer,
          credentialID: base64url.toBuffer(authenticator.credentialID),
          counter: authenticator.counter,
        },
      }
    );
    if (!verified || !info) return null;

    await db.collection<DbCredential>("credentials").updateOne(
      {
        _id: authenticator._id,
      },
      {
        $set: {
          counter: info.newCounter,
        },
      }
    );
  } catch (err) {
    console.log(err);
    return null;
  }

  return { email: authenticator.userID };
}

const webauthnStorageService = {
  saveChallenge,
  getChallenge,
  getCredentials,
  saveCredentials,
  verifyAndUpdateCredentials,
};

export default webauthnStorageService;
