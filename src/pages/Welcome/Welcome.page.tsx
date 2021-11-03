import { signOut } from "next-auth/react";
import { Button, Box, Heading, Link, Text, Flex } from "@chakra-ui/react";
import Image from "next/image";
import Layout from "../../components/Layout/Layout";
import aptoLogo from "../../../public/apto-logo.png";
import React from "react";
import useWelcome from "./useWelcome";

export default function WelcomePage() {
  const { sessionStatus, userEmail, handleRegister } = useWelcome();

  if (sessionStatus === "authenticated")
    return (
      <Layout>
        <Box maxW="300px">
          <Image alt="Apto logo" src={aptoLogo as any} />
        </Box>
        <Heading as="h1" size="2xl">
          <Link href="https://webauthn.guide/" color="#1c59f6" isExternal>
            Webauthn
          </Link>{" "}
          Demo
        </Heading>

        <Text my="8">Signed in as {userEmail} 🍬</Text>
        <Flex>
          <Button onClick={handleRegister} colorScheme="blue">
            Register Webauthn
          </Button>
          <Button onClick={() => signOut()} ml="4">
            Log out
          </Button>
        </Flex>
      </Layout>
    );

  return <Layout>Loading...</Layout>;
}
