import ProfileForm from "@/components/profile-form";
import { PageHeader } from "@/components/dashboard-bits";

export const metadata = { title: "Profile Settings" };
export default function Page() {
  return (
    <>
      <PageHeader title="Profile settings" description="Update how you appear on WedPlan. Your role and plan cannot be changed here." />
      <ProfileForm />
    </>
  );
}
