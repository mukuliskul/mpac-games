"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	// Check if the user is already logged in (JWT stored in HTTP-only cookies)
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch("/api/auth/me", {
					credentials: "include", // Include cookies in request
				});

				if (res.ok) {
					router.push("/games"); // Redirect to dashboard if logged in
				}
			} catch (error) {
				console.error("Error verifying authentication:", error);
			}
		};

		checkAuth();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ email: string; password: string }>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: { email: string; password: string }) => {
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
			credentials: "include", // Ensure cookies are stored
		});

		if (!res.ok) {
			const result = await res.json();
			setError(result.error || "Login failed");
			return;
		}

		router.push("/games"); // Redirect to dashboard
	};

	return (
		<div className="flex justify-center items-center min-h-screen">
			<Card className="w-96">
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div>
							<Label>Email</Label>
							<Input {...register("email")} type="email" autoComplete="off" />
							{errors.email && (
								<p className="text-red-500 text-sm">{errors.email.message}</p>
							)}
						</div>
						<div>
							<Label>Password</Label>
							<Input {...register("password")} type="password" />
							{errors.password && (
								<p className="text-red-500 text-sm">
									{errors.password.message}
								</p>
							)}
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<Button type="submit" className="w-full">
							Login
						</Button>
					</form>
					<p className="mt-2 text-sm text-center">
						Don't have an account?{" "}
						<Link href="/register" className="text-blue-500">
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
