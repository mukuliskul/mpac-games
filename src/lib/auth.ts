import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "text",
					placeholder: "example@example.com",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Missing email or password");
				}

				// Fetch player from the `players` table
				const { data: player, error } = await supabase
					.from("players")
					.select("id, email, username, password")
					.eq("email", credentials.email)
					.single();

				if (error || !player) {
					throw new Error("Player not found");
				}

				// Compare passwords
				const isValidPassword = await bcrypt.compare(
					credentials.password,
					player.password
				);
				if (!isValidPassword) {
					throw new Error("Invalid credentials");
				}

				return {
					id: player.id,
					email: player.email,
					username: player.username,
				};
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.username = token.username;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
