import { useSession } from "next-auth/react";
import { useState } from "react";
import Welcome from "../components/Welcome";
import AccessControl from "../components/AccessControl";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return;
  return session ? <AccessControl session={session} /> : <Welcome />;
}
