import { signOut } from "next-auth/react";
import { Button, Box, Heading, Link, Text, Flex } from "@chakra-ui/react";
import Image from "next/image";
import Layout from "../../components/Layout/Layout";
import typingCatImg from "../../../public/cat.gif";
import React from "react";
import useHomePage from "./useHomePage";

export default function HomePage() {
  const { sessionStatus, userEmail, handleRegister } = useHomePage();

  if (sessionStatus === "authenticated")
    return (
      <Layout>
        <Box maxW="200px" mb="6">
          <Image alt="Apto logo" src={typingCatImg} />
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
