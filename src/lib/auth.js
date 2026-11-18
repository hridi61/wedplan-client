import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { getDb } from "./mongo";

const appUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(getDb()),
  trustedOrigins: [appUrl],
  emailAndPassword: { enabled: true, minPasswordLength: 6, autoSignIn: true },
  socialProviders: {
    google: { clientId: process.env.GOOGLE_CLIENT_ID || "", clientSecret: process.env.GOOGLE_CLIENT_SECRET || "" },
  },
  user: {
    modelName: "users",
    additionalFields: {
      // `role` is accepted at sign-up only. The hooks below strip it from every later update
      // and never allow "admin" through public registration.
      role: { type: "string", required: false, defaultValue: "customer", input: true },
      isBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
      businessName: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
      subscriptionPlan: { type: "string", required: false, defaultValue: "free", input: false },
      subscriptionExpiresAt: { type: "date", required: false, input: false },
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: appUrl,
        audience: "wedplan-api",
        expirationTime: "15m",
        definePayload: ({ user }) => ({ email: user.email }),
      },
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const p = ctx.body?.password || "";
        if (!/[A-Z]/.test(p) || !/[a-z]/.test(p))
          throw new APIError("BAD_REQUEST", { message: "Password needs an uppercase and a lowercase letter" });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          let role = user.role;
          if (!role) {
            // Google sign-up: the sign-up page stores the chosen role in a short-lived cookie
            const cookie = ctx?.headers?.get?.("cookie") || ctx?.request?.headers?.get?.("cookie") || "";
            role = cookie.match(/wp_role=(vendor|customer)/)?.[1];
          }
          if (!["vendor", "customer"].includes(role)) role = "customer";
          return { data: { ...user, role, isBlocked: false, subscriptionPlan: "free", subscriptionExpiresAt: null } };
        },
      },
      update: {
        before: async (data) => {
          // eslint-disable-next-line no-unused-vars
          const { role, isBlocked, subscriptionPlan, subscriptionExpiresAt, ...safe } = data;
          return { data: safe };
        },
      },
    },
  },
});
