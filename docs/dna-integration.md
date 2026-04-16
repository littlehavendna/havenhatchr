# HavenHatchr DNA Integration

## HavenHatchr env vars

Set these in HavenHatchr on Railway:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_DNA_STRIPE_PUBLISHABLE_KEY` (optional override for DNA checkout)
- `DNA_STRIPE_SECRET_KEY` (optional override for DNA checkout)
- `DNA_STRIPE_WEBHOOK_SECRET` (optional override for the DNA webhook)
- `LITTLEHAVEN_DNA_API_URL`
- `LITTLEHAVEN_DNA_API_SECRET`
- `DNA_RESULTS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

If the optional `DNA_STRIPE_*` values are set, HavenHatchr subscriptions continue using the normal `STRIPE_*` keys while DNA orders use the DNA-specific Stripe account or mode.

## Admin settings

Use `Admin -> System` and save these keys if you want to change defaults:

- `dna_testing_enabled`
  Value: `true` or `false`
- `dna_testing_instructions`
  Value: customer-facing instructions shown after payment

## LittleHavenDNA intake endpoint

Set this in LittleHavenDNA on Railway:

- `HAVENHATCHR_INTEGRATION_SECRET`

HavenHatchr will `POST` to:

`{LITTLEHAVEN_DNA_API_URL}/api/integrations/havenhatchr/orders/`

Headers:

- `Content-Type: application/json`
- `x-littlehaven-api-secret: {LITTLEHAVEN_DNA_API_SECRET}`

Expected body shape:

```json
{
  "source": "havenhatchr",
  "havenOrderId": "cuid",
  "havenUserId": "cuid",
  "contactName": "Customer Name",
  "contactEmail": "customer@example.com",
  "notes": "",
  "totalAmountCents": 4600,
  "selectedTests": ["chicken_sex", "chicken_blue_egg"],
  "callbackUrl": "https://havenhatchr.example.com/api/dna-tests/results",
  "callbackSecret": "shared-secret",
  "chicks": [
    {
      "havenRequestId": "cuid",
      "chickId": "cuid",
      "bandNumber": "CH-1001",
      "sampleNumber": 1,
      "selectedTests": ["chicken_sex", "chicken_blue_egg"],
      "hatchDate": "2026-04-01",
      "flockName": "Blue Copper",
      "color": "Blue",
      "sex": "Unknown",
      "observedTraits": [],
      "notes": ""
    }
  ]
}
```

Expected success response:

```json
{
  "externalCustomerId": "django-user-id",
  "externalOrderId": "123",
  "externalOrderCode": "LH7Q2F"
}
```

## LittleHavenDNA result callback

LittleHavenDNA should `POST` results back to:

`{callbackUrl}`

Headers:

- `Content-Type: application/json`
- `x-dna-results-secret: {callbackSecret}`

Body:

```json
{
  "externalOrderId": "123",
  "externalOrderCode": "LH7Q2F",
  "completedAt": "2026-04-16T19:00:00.000Z",
  "results": [
    {
      "sampleNumber": 1,
      "status": "Completed",
      "externalSampleId": "456",
      "resultSummary": "Sex: Female | Blue Egg: O/o",
      "resultPayload": {
        "sex": "Female",
        "blueEgg": "O/o",
        "recessiveWhite": ""
      }
    }
  ]
}
```

## DNA Stripe webhook

When using split Stripe mode, point the DNA Stripe webhook to:

`{NEXT_PUBLIC_APP_URL}/api/dna-tests/webhook`

Keep the subscription Stripe webhook pointed to:

`{NEXT_PUBLIC_APP_URL}/api/stripe/webhook`
