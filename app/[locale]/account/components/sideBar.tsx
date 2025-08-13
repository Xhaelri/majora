import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import SignOut from "../SignOut";
import { getTranslations } from "next-intl/server";

interface SidebarProps {
  activeTab: "orders" | "account";
}

export default async function Sidebar({ activeTab }: SidebarProps) {
  const t = await getTranslations("account");
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <aside className="  bg-white border-r border-gray-200 h-full">
      <div className="pt-6 px-6">
        <div className="flex flex-col lg:flex-row">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {t("myAccount")}
            </h2>
            <nav>
              <ul className="space-y-2 lg:flex-col flex justify-between">
                <li className="w-1/2 lg:w-auto">
                  <Link
                    href="/account?tab=orders"
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTab === "orders"
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    {t("orders")}
                  </Link>
                </li>
                <li className="w-1/2 lg:w-auto">
                  <Link
                    href="/account?tab=account"
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTab === "account"
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className="mr-3 h-5 w-5"
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
                    {t("accountDetails")}
                  </Link>
                </li>
                <li className="hidden lg:block mt-5">
                  <SignOut />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
