import { signIn as nextAuthSignIn } from "next-auth/react";
import { startRegistration } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";
import { startAuthentication } from "@simplewebauthn/browser";

async function register() {
  const optionsResponse = await fetch("/api/auth/webauthn/register");

  if (optionsResponse.status !== 200) {
    alert("Could not get registration options from server");
    return;
  }

  const opt = await optionsResponse.json();

  try {
    const credential = await startRegistration(opt);

    const response = await fetch("/api/auth/webauthn/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credential),
      credentials: "include",
    });

    if (response.status != 201) {
      alert("Could not register Webauthn credentials.");
    } else {
      alert("Your Webauthn credentials have been registered.");
    }
  } catch (err) {
    alert(`Registration failed. ${(err as Error).message}`);
  }
}

async function signIn(email: string) {
  const optionsResponse = await fetch(
    `/api/auth/webauthn/authenticate?email=${email}`
  );

  if (optionsResponse.status !== 200)
    throw new Error("Could not get authentication options from server");

  const opt: PublicKeyCredentialRequestOptionsJSON =
    await optionsResponse.json();

  if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
    throw new Error("There is no registered credential.");
  }

  const credential = await startAuthentication(opt);

  await nextAuthSignIn("credentials", {
    id: credential.id,
    rawId: credential.rawId,
    type: credential.type,
    clientDataJSON: credential.response.clientDataJSON,
    authenticatorData: credential.response.authenticatorData,
    signature: credential.response.signature,
    userHandle: credential.response.userHandle,
  });
}

const webauthnClientService = {
  register,
  signIn,
};

export default webauthnClientService;
