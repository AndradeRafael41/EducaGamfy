import NextAuth, { NextAuthOptions } from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/services/prisma";

declare module "next-auth" {

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
        }
    }

    interface JWT{
        id? : string;
    }
}

export const authOptions : NextAuthOptions = {

    session: {strategy:"jwt"},
    
    providers:[

        CredentialsProvider({
                
            name: "Credentials",
                
            credentials:{
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            
            async authorize(credentials) {
                console.error("Authorize function called", credentials);
                if(!credentials?.email || !credentials.password) return null as any;

                const user  = await prisma.users.findUnique({
                    where:{email : credentials.email},
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) return  null;

                return  {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };

            },
        })
    ],

    callbacks:{
        
        
        jwt({token,user}){
            if(user) token.id = user.id;
            return token;
        },
        
        
        session({session,token}){
            if (token.id) session.user.id = token.id as string;
            return session;
        }
    }

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };