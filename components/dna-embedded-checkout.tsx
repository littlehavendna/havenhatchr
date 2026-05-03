"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type DnaEmbeddedCheckoutProps = {
  clientSecret: string;
  publishableKey: string;
};

const stripePromiseByKey = new Map<string, ReturnType<typeof loadStripe>>();

export function DnaEmbeddedCheckout({
  clientSecret,
  publishableKey,
}: DnaEmbeddedCheckoutProps) {
  if (
    typeof window !== "undefined"
    && publishableKey.startsWith("pk_live_")
    && window.location.protocol !== "https:"
  ) {
    return (
      <div className="rounded-[24px] border border-[#f0c7d8] bg-[#fff8fb] p-6 text-sm leading-6 text-[#9b4768]">
        Live DNA checkout needs HTTPS before Stripe can load payment fields. Open the
        local HTTPS app URL or use test DNA keys for local checkout testing.
      </div>
    );
  }

  const stripePromise =
    stripePromiseByKey.get(publishableKey) ?? loadStripe(publishableKey);

  stripePromiseByKey.set(publishableKey, stripePromise);

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret,
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
