export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1]}.clerk.accounts.dev`,
      applicationID: "convex",
    },
  ],
};
