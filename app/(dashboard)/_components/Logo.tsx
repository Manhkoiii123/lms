import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={140}
      height={140}
      className="cursor-pointer"
    />
  );
};

export default Logo;
