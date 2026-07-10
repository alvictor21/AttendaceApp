"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, History, Settings } from "lucide-react";

type NavItem = {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
  { key: "history",   label: "History",   icon: History,         href: "/user/history" },
];

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ key, label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <button
              key={key}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className={`flex items-center justify-center w-14 h-9 rounded-xl transition-colors duration-200 ${
                  isActive ? "bg-rose-100" : "bg-transparent"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-rose-700" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? "text-rose-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}