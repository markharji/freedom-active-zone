"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.loggedIn ? data.user : null);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    localStorage.clear();
    router.push("/admin/login");
    router.refresh();
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    refreshAuth: fetchAuth, // 👈 expose this
    logout,
  };
}
