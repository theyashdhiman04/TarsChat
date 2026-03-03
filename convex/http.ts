import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headers = request.headers;

    try {
      const result = await ctx.runMutation(
        internal.users.syncFromWebhook,
        {
          payloadString,
          svixId: headers.get("svix-id") ?? "",
          svixTimestamp: headers.get("svix-timestamp") ?? "",
          svixSignature: headers.get("svix-signature") ?? "",
        }
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Webhook error:", err);
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

export default http;