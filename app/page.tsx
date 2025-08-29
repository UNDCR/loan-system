import { HomeHeader } from "@/components/home/homeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  MessageSquare,
  Wallet,
  Boxes,
  ShieldCheck,
  Users,
  Calendar,
  AlertTriangle,
  CreditCard,
  ArrowLeftRight,
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
              Track loans and storage, manage firearm book-ins
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
              <Button asChild variant="secondary" size="lg">
                <a href="#information">How it works</a>
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

      <section id="information" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6 space-y-2">
          <Badge>How it works</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Loan and Storage Information</h2>
          <p className="text-muted-foreground">Clear, user-friendly explanations of the business rules and processes.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="loans" className="w-full">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                  <TabsTrigger value="loans">Loans</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="loans" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5" /> Payment Schedule & Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>Installments are due monthly until the loan balance is settled.</li>
                        <li>Monthly reminders are automatically sent to users about pending payment amounts via Email and WhatsApp.</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-5 w-5" /> Penalties on Cancellation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>When a loan is cancelled, a penalty fee is applied.</li>
                        <li>The penalty is deducted from the loan&apos;s deposit amount.</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="sm:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="h-5 w-5" /> Default Process
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>Loans are automatically marked as defaulted after 3 consecutive months of missed payments.</li>
                        <li>Default status is visible in the system to streamline follow-ups and actions.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="storage" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-5 w-5" /> Billing Cycle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>Adding firearms to the system is free.</li>
                        <li>Charges begin when a firearm is assigned to a user on the storage page.</li>
                        <li>Daily deduction rates are applied to the client&apos;s credit balance while stored.</li>
                        <li>Monthly invoices are generated showing total deduction amounts.</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-5 w-5" /> Reminder System
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>Low balance reminders are sent when credit falls below the configured threshold.</li>
                        <li>Negative balance reminders are sent if the account goes into deficit.</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="sm:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowLeftRight className="h-5 w-5" /> Booking In and Out
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>When a firearm is booked out, daily deductions stop and the item is marked as booked out.</li>
                        <li>Firearms can be booked back in, and the system tracks both book-in and book-out dates.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6 space-y-2">
          <Badge>Simple usage-based pricing</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Pricing</h2>
          <p className="text-muted-foreground">Pay only for what you use. No hidden fees.</p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5" /> Clear, usage-based pricing
            </CardTitle>
            <Badge>Rand (ZAR)</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-6">
                <div className="text-4xl font-semibold">R30</div>
                <div className="text-sm text-muted-foreground">per Client Weapon</div>
              </div>
              <div className="rounded-md border p-6">
                <div className="text-4xl font-semibold">R50</div>
                <div className="text-sm text-muted-foreground">per Active Loan</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
