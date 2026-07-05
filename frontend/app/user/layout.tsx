
import type { Metadata } from "next";
import UserNavbar from "@/src/components/user/UserNavbar";
import AuthGuard from "@/src/components/AuthGuard";

export const metadata: Metadata = {
  title: "Attandance Admin",
  description: "Teacher attendance management system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
    <div className="min-w-full min-h-screen bg-gray-100">
      <main className="w-full">
        {children}
      </main>
      <UserNavbar />
    </div>
    </AuthGuard>
  );
}