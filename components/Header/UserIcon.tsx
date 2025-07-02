import User from "@/assets/user2.svg";
import React from "react";
import Link from "../Link/Link";

const UserIcon = () => {
  return (
    <Link href={"/signin"}>
    
          <User className=" hover:text-gray-700 hoverEffect" />

    </Link>
  );
};

export default UserIcon;
