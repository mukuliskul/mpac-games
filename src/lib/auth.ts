import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"

const supabaseUrl: string = process.env.SUPABASE_URL!
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseServiceKey
  }),
})
