import React from "react";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import Container from "../Container";
import MobileMenu from "../MobileMenu";
import SearchBar from "../SearchBar";
import CartIcon from "../CartIcon";
import WhishList from "../WhishList";

export default function Header() {
  return (
    <header className="bg-background border-b border-b-gray-400 py-5">
      <Container className="grid grid-cols-[auto_1fr_auto] items-center justify-between text-main-text-color">

        <div className="text-left flex gap-2 lg:hidden">
          <MobileMenu />
          <SearchBar />
        </div>

        <div className="text-center lg:text-left">
          <Logo>Sekra</Logo>
        </div>

        <HeaderMenu />

        <div className="text-right flex justify-end ">
          <div className="flex gap-5">
            <WhishList />
            <div className="hidden lg:inline-flex">
              <SearchBar />
            </div>
            <CartIcon />
          </div>
        </div>

      </Container>
    </header>
  );
}
