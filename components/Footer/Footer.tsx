import React from "react";

export default function Footer() {
  const date = new Date();
  return (
    <footer className="bg-primary flex flex-col items-center">
      <section className="container flex flex-col justify-center items-start md:items-center text-primary-foreground">
        <section className="flex space-x-10 items-center mt-5 md:items-center md:justify-center w-full mb-5">
          <h1>INSTAGRAM</h1>
          <h1>FACEBOOK</h1>
          <h1>TIKTOK</h1>
        </section>
        <section className="flex flex-col space-y-2 md:items-center">
          <h1>TERMS AND CONDITIONS</h1>
          <h1>PRIVACY AND POLICY</h1>
        </section>
      </section>
      <section className="flex items-center justify-center mb-2 text-primary-foreground font-extralight text-[12px] mt-5">
        <span>&copy;</span> {date.getFullYear()} SEKRA All rights reserved
      </section>
    </footer>
  );
}
