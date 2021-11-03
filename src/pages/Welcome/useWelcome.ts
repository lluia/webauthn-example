import { signIn, useSession } from "next-auth/react";
import webauthnClientService from "../../services/webauthnClient";

export default function useWelcome() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      return signIn();
    },
  });

  return {
    sessionStatus: status,
    userEmail: session?.user?.email,
    handleRegister: webauthnClientService.register,
  };
}
