import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoDbService from "../../../src/services/mongodb";
import webauthnStorageService from "../../../src/services/webauthnStorage";

const nextAuthDbName = process.env.NEXT_AUTH_DBNAME!;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      EmailProvider({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
      CredentialsProvider({
        name: "webauthn",
        credentials: {},
        async authorize(cred, req) {
          const result =
            await webauthnStorageService.verifyAndUpdateCredentials({
              credential: {
                id: req.body.id,
                rawId: req.body.rawId,
                type: req.body.type,
                response: {
                  clientDataJSON: req.body.clientDataJSON,
                  authenticatorData: req.body.authenticatorData,
                  signature: req.body.signature,
                  userHandle: req.body.userHandle,
                },
              },
              domain: process.env.WEBAUTHN_APP_DOMAIN!,
            });
          return result;
        },
      }),
    ],
    adapter: MongoDBAdapter({
      db: await mongoDbService.getDb(nextAuthDbName),
    }),
    session: {
      jwt: true,
    },
    pages: {
      signIn: "/auth/signin",
    },
  });
}
