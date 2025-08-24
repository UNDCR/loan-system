import { createClient } from "@/lib/supabase/server";
import { fetchStaff } from "@/actions/admin";

type Profile = { fullName: string; idNumber: string };

export default async function UserInfo() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return <p className="text-sm text-red-500">Failed to load user</p>;
  }

  const staff = await fetchStaff();
  const matched = staff.find((s) => s.email === (data.user.email ?? "") || s.id === data.user.id);

  const profile: Profile = {
    fullName: matched?.full_name ?? "",
    idNumber: matched?.id_number ?? "",
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
        <p className="text-base font-semibold">{profile.fullName || "—"}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">ID Number</p>
        <p className="text-base font-semibold tracking-wide">{profile.idNumber || "—"}</p>
      </div>
    </div>
  );
}
