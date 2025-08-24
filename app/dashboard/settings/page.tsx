import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResetPasswordButton from "@/components/settings/resetPasswordButton";
import PhoneNumberForm from "@/components/settings/phoneNumberForm";
import UserInfo from "@/components/settings/userInfo";
import CompanyLogoUploader from "@/components/settings/companyLogoUploader";
import CompanySettingsForm from "@/components/settings/companySettingsForm";
import { getSettings } from "@/actions/settings";

export default async function SettingsPage() {
  const { data: settings } = await getSettings();
  return (
    <div className="space-y-6 mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal details associated with this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <UserInfo />
            <div>
              <CompanyLogoUploader initialUrl={settings?.company_logo ?? null} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
          <CardDescription>Manage company information.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySettingsForm initial={settings ?? null} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phone Number</CardTitle>
            <CardDescription>Update the phone number associated with your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneNumberForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Send a password reset link to your signed-in email.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordButton />
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}
