import React from "react";
import Link from "../Link/Link";
import Image from "next/image";

const UserIcon = () => {
  return (
    <Link href={"/signin"}>
      <Image
        src={"/assets/user2.svg"}
        alt="User-icon"
        width={20}
        height={10}
        className=" hover:text-gray-700 hoverEffect"
      />
    </Link>
  );
};

export default UserIcon;
