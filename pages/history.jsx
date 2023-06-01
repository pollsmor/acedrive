import { useSession } from "next-auth/react";
import Welcome from "../components/Welcome";
import FileHistory from "../components/FileHistory";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return;
  return session ? <FileHistory session={session} /> : <Welcome />;
}
