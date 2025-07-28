import { auth } from "@/auth";
import React from "react";

import { getAccountDetails } from "@/server/db/prisma";
import Sidebar from "./components/sideBar";
import Orders from "./components/orders";
import AccountDetails from "./components/accountDetails";
import Link from "next/link";
import SignOut from "./SignOut";

export default async function Page({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to view your account.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const userData = await getAccountDetails(session.user.id);
  const activeTab = searchParams.tab === "account" ? "account" : "orders";

  return (
    <div className="container min-h-screen overflow-hidden">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar activeTab={activeTab} />
        <main className="flex-1">
          <div className="px-4 pb-4 ">
            {activeTab === "orders" ? (
              <Orders />
            ) : (
              <AccountDetails user={userData} userId={session.user.id} />
            )}
          </div>
        </main>
        <div className="text-center lg:hidden">
          <SignOut />
        </div>
      </div>
    </div>
  );
}
