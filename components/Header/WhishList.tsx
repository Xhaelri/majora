import Image from "next/image";

import React from "react";

export default function WhishList() {
  return (
    <Image
      src={"/assets/heart.svg"}
      alt="Whishlist-icon"
      width={25}
      height={10}
      className="hover:text-gray-700 hoverEffect"
    />
  );
}
