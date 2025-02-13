import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
				// Mock user data (Replace this with DB fetch)
				const user = {
					id: "1",
					email: "test@example.com",
					password: "$2a$10$hashedPassword",
				};

				if (
					!user ||
					!(await bcrypt.compare(credentials.password, user.password))
				) {
					throw new Error("Invalid credentials");
				}

				return user;
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
