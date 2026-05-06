"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type UserDashboardLogoutButtonProps = {
  className: string;
};

export default function UserDashboardLogoutButton({
  className,
}: UserDashboardLogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Logout..." : "Logout"}
    </button>
  );
}
