import { PrismaClient } from "@prisma/client/extension";


declare global {
    var prisma : PrismaClient | undefined;
}

export const prisma = global.print ?? new PrismaClient();

if (process.env.NODE_ENV !== "production"){
    global.prisma = prisma;
}