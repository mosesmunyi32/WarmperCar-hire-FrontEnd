"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/authServices";
import { profileService } from "@/services/profileService";
import { getRoleFromToken } from "@/lib/jwt";
import { useRouter } from "next/navigation";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setError(null);
      const response = await authService.login(values);
      console.log(response);
      setToken(response.token);

      // Decode role from JWT — handles role/roles/authorities claim shapes
      const springRole = getRoleFromToken(response.token) ?? response.role;

      const role = springRole.startsWith("ROLE_")
        ? springRole.replace("ROLE_", "")
        : springRole;

      console.log(role);

      console.log("ROLE:", JSON.stringify(role));
      console.log("EQUALS:", role === "SUPER_ADMIN");

      // Set minimal user immediately (role from token)
      setUser({
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role,
        isVerified: response.isVerified,
        isActive: response.isActive,
        phoneNumber: null,
        alternativePhoneNumber: null,
        dateOfBirth: null,
        gender: null,
        county: null,
        city: null,
        idNumber: null,
        profilePhoto: null,
        idFrontPhoto: null,
        idBackPhoto: null,
        driversLicenceNumber: null,
        createdAt: null,
        updatedAt: null,
      });

      // Route immediately based on token role
      if (role === "SUPER_ADMIN") {
        router.push("/super-admin/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

      // Enrich store with full profile details in the background.
      // Preserve role from token — UserResponse.role is optional and may be absent.
      profileService
        .getMyProfile(response.id)
        .then((profile) => setUser({ ...profile, role: profile.role ?? role }))
        .catch(() => {});
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(message ?? "Login failed. Please try again.");
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="m@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-destructive text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-azure hover:underline font-medium"
            >
              Register →
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
