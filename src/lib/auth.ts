import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { supabase } from "@/lib/supabase"

const supabaseUrl: string = process.env.SUPABASE_URL!
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { username, password } = credentials!;

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (error || !data || data.password !== password) {
          console.log(error)
          return null;
        }

        return { id: data.id, username: data.username };
      }
    })
  ],
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey
  }),
})
