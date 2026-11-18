import { Suspense } from "react";
import SignUpForm from "./form";
import { Loader } from "@/components/ui/states";

export const metadata = { title: "Sign Up" };
export default function Page() {
  return <Suspense fallback={<Loader />}><SignUpForm /></Suspense>;
}
