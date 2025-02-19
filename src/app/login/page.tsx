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

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (token) {
			// Check token validity on the backend
			verifyTokenOnBackend(token).then((isValid) => {
				if (!isValid) {
					localStorage.removeItem("token");
					window.location.href = "/login"; // Redirect to login if invalid
				} else {
					router.push("/games");
				}
			});
		}
	}, []);

	const verifyTokenOnBackend = async (token: string) => {
		try {
			const res = await fetch("/api/verify-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			if (res.ok) {
				const data = await res.json();
				return data.isValid;
			}
			return false;
		} catch (error) {
			console.error("Token verification failed:", error);
			return false;
		}
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ email: string; password: string }>({
		resolver: zodResolver(loginSchema),
	});

	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (data: { email: string; password: string }) => {
		const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const result = await res.json();

		if (!res.ok) {
			setError(result.error || "Login failed");
			return;
		}

		// Save token in localStorage
		localStorage.setItem("token", result.token);

		router.push("/games");
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
