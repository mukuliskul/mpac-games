import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase"; // Import your supabase client

export default async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, username, password } = req.body;

    try {
      // Check if the username or email already exists in the database
      const { data: existingUserByEmail } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      const { data: existingUserByUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create the user in the Supabase database
      const { data, error } = await supabase.auth.api.createUser({
        email,
        password,
        user_metadata: { username },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // Respond with a success message
      return res.status(200).json({ message: "User created successfully!" });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Registration failed" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
