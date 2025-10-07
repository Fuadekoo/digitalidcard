"use client";

import { authenticate } from "@/actions/common/authentication";
import Logo from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegistration } from "@/hooks/useRegistration";
import { loginSchema } from "@/lib/zodSchema";
import { Eye, EyeOff, KeyRound, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const { lang, credentials } = useParams<{
    lang: string;
    credentials?: string[];
  }>();
  const router = useRouter();
  const { onSubmit, validationErrors, register, setValue, isLoading } =
    useRegistration(authenticate, loginSchema, (state) => {
      if (state.status) {
        router.refresh();
      }
    });
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const [username, password] = credentials ?? ["", ""];
    if (username && password) {
      setValue("username", username);
      setValue("password", password);
      onSubmit();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-background/40 backdrop-blur-3xl border border-background/30 overflow-hidden grid md:grid-cols-2">
        <div className="p-5 md:p-10 flex gap-5 flex-col bg-background/50">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="flex-1 flex flex-col gap-5 justify-center">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {lang == "am" ? "መለያ ስም" : "Username"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={lang == "am" ? "መለያ ስም" : "Username"}
                    className="pl-10 w-full"
                    {...register("username")}
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-xs text-red-500">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {lang == "am" ? "ሚስጥር ቁልፍ" : "Password"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={lang == "am" ? "ሚስጥር ቁልፍ" : "Password"}
                    className="pl-10 pr-10 w-full"
                    type={hidden ? "password" : "text"}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setHidden((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {hidden ? (
                      <Eye className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : lang == "am" ? "ይግቡ" : "Login"}
              </Button>
            </form>
          </div>
        </div>
        <div className="max-md:hidden size-full grid place-content-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <Link href={"/"}>
            <Image
              alt="logo image"
              src={"/logo.png"}
              width={2000}
              height={2000}
              className="size-80"
            />
          </Link>
        </div>
      </Card>
    </div>
  );
}
