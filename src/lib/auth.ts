import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./supabase";

// Optional authentication configuration
export const authOptions: NextAuthOptions = {
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET 
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile"
              }
            }
          })
        ] 
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        console.error('No email provided by Google');
        return false;
      }

      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          console.error("Error checking user:", fetchError);
          return false;
        }
        
        if (!existingUser) {
          // Create new user in Supabase
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              email: user.email,
              name: user.name,
              image: user.image,
              points: 0
            });
          
          if (insertError) {
            console.error("Error creating user:", insertError);
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        
        try {
          // Fetch user data from Supabase
          const { data: userData, error } = await supabase
            .from('users')
            .select('points')
            .eq('email', session.user.email)
            .single();
          
          if (error) {
            console.error("Error fetching user data:", error);
          } else if (userData) {
            session.user.points = userData.points;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-production',
  debug: false, // Disable debug mode to remove warnings
};
