import NextAuth from "next-auth";
import dynamoDb from "../../../utils/awsConfig";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: "openid profile user.Read email", prompt: "login" },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const emailProvider = user.email.split("@")[1];
      const params = {
        TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
        Key: {
          email: { S: user.email },
        },
      };
      const command = new GetItemCommand(params);
      const response = await dynamoDb.send(command);
      if (response.Item) {
        return true;
      } else {
        const input = {
          TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
          Item: {
            email: { S: user.email },
            name: { S: user.name },
            role: { S: "admin" },
            plots: { L: [] },
            "date-joined": {
              S: new Date().toLocaleString("en-US", {
                timeZone: "America/Chicago",
              }),
            },
          },
        };
        const command = new PutItemCommand(input);
        const response = await dynamoDb.send(command);
      }
      return true;
    },
    async session({ session, token }) {
      try {
        const params = {
          TableName: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
          Key: {
            email: { S: session.user.email },
          },
        };
        const command = new GetItemCommand(params);
        const response = await dynamoDb.send(command);
        session.user.role = response.Item.role.S;
        session.user.name = response.Item.name.S;
        if (!session.user.plots) {
          session.user.plots = [];
        }
        for (let i = 0; i < response.Item.plots.L.length; i++) {
          session.user.plots.push(parseInt(response.Item.plots.L[i].N));
        }
        session.user.email = response.Item.email.S;
      } catch (error) {
        console.error(error);
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
