// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno&deno-std=0.190.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, customerEmail, returnUrl } = await req.json();

    if (!priceId || !returnUrl) {
      console.error('Error: priceId and returnUrl are required in the request body.');
      return new Response(JSON.stringify({ error: 'priceId and returnUrl are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // @ts-ignore
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Error: STRIPE_SECRET_KEY environment variable not found for Edge Function.');
      throw new Error('Stripe secret key not found in environment variables.');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: priceId, // Use the Price ID for recurring product
          quantity: 1,
        },
      ],
      mode: 'subscription', // This is key for recurring payments
      customer_email: customerEmail, // Pre-fill customer email if available
      return_url: returnUrl + '?session_id={CHECKOUT_SESSION_ID}',
      // You might want to add metadata here to link the subscription to a user in your DB
      // metadata: {
      //   user_id: 'supabase_user_id',
      // },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating subscription checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});