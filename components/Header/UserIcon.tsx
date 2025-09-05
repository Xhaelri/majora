"use client";
import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { isAdmin } from "@/utils/auth-utils";

const UserIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { clearClientCart } = useCart();
  const t = useTranslations("account");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // If user is not authenticated (guest), show sign-in link without dropdown
  if (!session?.user) {
    return (
      <Link href={"/signin"}>
        <Image
          src={"/assets/user2.svg"}
          alt="User-icon"
          width={20}
          height={10}
          className="hover:text-gray-700 hoverEffect"
        />
      </Link>
    );
  }

  const userRole = session.user.role ?? "";
  const isUserAdmin = isAdmin(userRole);

  const handleLogout = async () => {
    clearClientCart();
    toast.custom(() => (
      <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
        <Check />
        <p className="font-semibold uppercase">{t("loggedOutSuccessfully")}</p>
      </div>
    ));
    await signOut({ redirectTo: "/signin" });
    setIsOpen(false);
  };

  const menuItems = [
    {
      label: t("myAccount") || "Account",
      href: "/account",
      action: null,
    },
    ...(isUserAdmin
      ? [
          {
            label: t("dashboard"),
            href: "/admin/dashboard",
            action: null,
          },
        ]
      : []),
    {
      label: t("logout") || "Logout",
      href: null,
      action: handleLogout,
    },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center px-1 py-2  
         
          cursor-pointer
        `}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <Image
          src={"/assets/user2.svg"}
          alt="User-icon"
          width={20}
          height={10}
          className="hover:text-gray-700 hoverEffect"
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div
            className={`absolute top-full ${
              isRTL ? "-right-25" : "-left-25"
            } mt-1 w-42 bg-white border border-gray-200 shadow-lg z-20`}
          >
            <div className="py-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-300
                        transition-colors duration-150 flex items-center
                        text-gray-700
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action || (() => {})}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-300
                        transition-colors duration-150 flex items-center
                        text-gray-700 cursor-pointer
                        ${
                          item.label === (t("logout") || "Logout")
                            ? "text-red-600 hover:bg-red-50"
                            : ""
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserIcon;
