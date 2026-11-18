import { Suspense } from "react";
import BrowseClient from "./browse-client";
import { Loader } from "@/components/ui/states";

export const metadata = { title: "Browse Services" };

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <BrowseClient />
    </Suspense>
  );
}
