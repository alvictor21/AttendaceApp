"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BarChart2,
  Settings,
  UsersRound
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Rekap Absen",
    href: "/admin/teachers",
    icon: GraduationCap,
  },
  {
    label: "Data Guru",
    href: "/admin/teachersdata",
    icon: UsersRound,
  },
  {
    label: "Laporan",
    href: "/admin/reports",
    icon: BarChart2,
  },
  
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-150 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 group"
            >
              <div
                className={`
                  flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200
                  ${isActive ? "bg-red-100" : "bg-transparent group-hover:bg-gray-100"}
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`
                    transition-colors duration-200
                    ${isActive ? "text-red-600" : "text-gray-500 group-hover:text-gray-700"}
                  `}
                />
              </div>
              <span
                className={`
                  text-[11px] font-medium leading-none transition-colors duration-200
                  ${isActive ? "text-red-600" : "text-gray-500 group-hover:text-gray-700"}
                `}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}