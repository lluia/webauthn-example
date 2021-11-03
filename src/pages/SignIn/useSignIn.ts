import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import webauthnClientService from "../../services/webauthnClient";

export function useSignIn() {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  function handleKeySubmit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      return handleSignIn();
    }
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setIsValid(e.target.validity.valid);
    setEmail(e.target.value);
  }

  async function handleSignIn() {
    try {
      webauthnClientService.signIn(email);
    } catch (error) {
      console.log(error);
      await signIn("email", { email });
    }
  }

  return {
    email,
    isValid,
    handleKeySubmit,
    handleEmailChange,
    handleSignIn,
  };
}
