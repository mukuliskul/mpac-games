"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const registerSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function RegisterPage() {
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(registerSchema),
	});

	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (data: { email: string; password: string }) => {
		try {
			// TODO: Handle registration logic (API call)
			console.log("User registered:", data);
			router.push("/login");
		} catch (err) {
			setError("Registration failed");
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen">
			<Card className="w-96">
				<CardHeader>
					<CardTitle>Register</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div>
							<Label>Email</Label>
							<Input
								{...register("email")}
								type="email"
								placeholder="example@example.com"
							/>
							{errors.email && (
								<p className="text-red-500 text-sm">{errors.email.message}</p>
							)}
						</div>
						<div>
							<Label>Password</Label>
							<Input
								{...register("password")}
								type="password"
								placeholder="••••••••"
							/>
							{errors.password && (
								<p className="text-red-500 text-sm">
									{errors.password.message}
								</p>
							)}
						</div>
						<div>
							<Label>Confirm Password</Label>
							<Input
								{...register("confirmPassword")}
								type="password"
								placeholder="••••••••"
							/>
							{errors.confirmPassword && (
								<p className="text-red-500 text-sm">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<Button type="submit" className="w-full">
							Register
						</Button>
					</form>
					<p className="mt-2 text-sm text-center">
						Already have an account?{" "}
						<Link href="/login" className="text-blue-500">
							Log in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
