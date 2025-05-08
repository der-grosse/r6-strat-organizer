"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Join or Create a Team
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/auth"
              className="font-medium text-primary hover:text-primary/90 hover:underline"
            >
              sign in to your existing team
            </Link>
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Team</CardTitle>
              <CardDescription>
                Create a new team and become its administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/signup/create">Create Team</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Existing Team</CardTitle>
              <CardDescription>
                Join an existing team using an invite key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup/join">Join Team</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="ghost">
            <Link href="/auth">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
