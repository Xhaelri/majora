import Link from "@/components/Link/Link";
import { heroImages } from "@/constants/constants";
import Image from "next/image";
import React from "react";
import Form from "./Form";
import GoogleSign from "../Google-Sign";

function SignupPage() {
  return (
    <main className="container pt-0 md:pt-20">
      <section className="flex flex-col md:flex-row gap-15">
        <div className="w-full md:w-1/2">
          <Image
            src={heroImages[2].src}
            alt={heroImages[2].alt}
            className="object-cover max-h-[700px]"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <h1 className="text-primary font-bold text-5xl tracking-widest p-10">Register</h1>
          <Form />
          <GoogleSign />
          <p className="mt-2 flex items-center justify-center text-primary text-sm gap-3">
            <span>Already have an account?</span>
            <Link href={"/signin"} className="underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
