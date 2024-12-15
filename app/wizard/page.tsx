// /app/wizard/page.tsx

import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import { redirect } from "next/navigation";

// Make sure it's a default export
const Page = async () => {
  const user = await currentUser();  // Fetch user info

  // Redirect if the user is not logged in
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl">
          Welcome,{" "}
          <span className="ml-2 font-bold">
            {user ? `${user.firstName}` : "Not logged in"}
          </span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Let's get started by setting up your currency
        </h2>

        <h3 className="mt-2 text-center text-sm text-muted-foreground">
          You can change these settings at any time
        </h3>
      </div>
      <Separator />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Set your default currency for transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>
      <Separator />
      <Button className="w-full" asChild>
        <Link href={"/"}>Go back to Home</Link>
      </Button>
    </div>
  );
};

export default Page; 
