import { Suspense } from "react";
import SignInForm from "./form";
import { Loader } from "@/components/ui/states";

export const metadata = { title: "Sign In" };
export default function Page() {
  return <Suspense fallback={<Loader />}><SignInForm /></Suspense>;
}
