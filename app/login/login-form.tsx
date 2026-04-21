// app/login/login-form.tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome, Facebook } from "lucide-react"; // npm install lucide-react
import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSocialLogin = (provider: "google" | "facebook") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // This calls the 'credentials' provider configured in your auth.ts
    const result = await signIn("credentials", {
      username: username,
      password: password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if ((result as any)?.error) {
      alert("Invalid credentials");
    } else {
      window.location.href = "/dashboard";
    }
  };


  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Choose your preferred login method
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Social Buttons Row */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2"
          >
            <Chrome className="h-4 w-4 text-red-500" />
            Google
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSocialLogin("facebook")}
            className="flex items-center justify-center gap-2"
          >
            <Facebook className="h-4 w-4 text-blue-600 fill-blue-600" />
            Facebook
          </Button>
        </div>

        {/* Separator with Text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with username
            </span>
          </div>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleCredentialLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              placeholder="admin_01" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Login to Dashboard
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
