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
