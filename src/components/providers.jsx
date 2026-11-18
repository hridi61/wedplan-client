"use client";
import { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster richColors position="top-right" closeButton />
    </MotionConfig>
  );
}
