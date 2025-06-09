import React from "react";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import Container from "../Container";

export default function Header() {
  return (
    <header className="bg-background border-b border-b-gray-400 py-5">
      <Container className="flex items-center justify-between gap-7 text-main-text-color">
        <HeaderMenu />
        <Logo />
        <h1>right</h1>
      </Container>
    </header>
  );
}
