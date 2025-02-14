"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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

		// Save token in localStorage or Context (for authentication)
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
							<Input {...register("email")} type="email" />
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
