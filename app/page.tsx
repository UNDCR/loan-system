import { HomeHeader } from "@/components/home/homeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Mail,
  MessageSquare,
  Wallet,
  Boxes,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <HomeHeader />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-7">
            <div className="flex items-center gap-2">
              <Badge>Firearm Manager for Businesses</Badge>
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Loan, Storage and Firearm Operations – streamlined
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-prose">
              A unified system to track loans and storage, manage firearm book-ins
              and book-outs, send automated reminders via Email and WhatsApp, and
              empower your team with robust staff management.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="/auth/login">Already have an account?</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+27681501196">Contact</a>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              To enroll please email us at support@firearmstudio.com
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Loan Payment Reminders</CardTitle>
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Storage Payment Reminders</CardTitle>
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="h-5 w-5" /> Loan Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Track balances, payments, and due dates with automated alerts.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Boxes className="h-5 w-5" /> Storage Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Manage storage items, renewals, and reminders effortlessly.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-5 w-5" /> Firearm Book In/Out
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Controlled book-ins and book-outs with clear audit trails.
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" /> Staff Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Assign roles and permissions to keep operations organized.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium">Enrollment</h2>
              <p className="text-muted-foreground">
                To enroll send us an email at support@firearmstudio.com
              </p>
            </div>
            <Button asChild size="lg">
              <a href="mailto:support@firearmstudio.com">Email Support</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
