// app/admin/layout.tsx
"use client"
import React from "react";
import BottomNavbar from "@/src/components/admin/AdminNavbar";
import AuthGuard from "@/src/components/AuthGuard";

// 1. Wajib menggunakan kata kunci 'export default'
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="w-full min-h-screen bg-gray-100 flex">
        {/* Kamu bisa pasang Sidebar atau Navbar admin di sini */}      
        <main>
          {/* 'children' ini wajib ada agar page.tsx di dalam dashboard bisa muncul */}
          {children} 
        </main>
        <BottomNavbar/>
      </div>
    </AuthGuard>
  );
}