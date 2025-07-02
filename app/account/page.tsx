import { auth } from "@/auth";
import Image from "next/image";
import React from "react";
import { SignOut } from "./SignOut";
const page = async () => {
  const session = await auth();
  console.log("session:",session)

  if (!session?.user) return null;

  return <div>
          <Image src={session.user.image ?? "/default-avatar.png"} alt="User Avatar" width={50} height={50} />
          <SignOut/>
  </div>;
};

export default page;
