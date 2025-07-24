'use client';
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const { memberId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (memberId) {
      router.replace("/feed");
    } else {
      router.replace("/login");
    }
  }, [memberId, router]);

  return null;
}