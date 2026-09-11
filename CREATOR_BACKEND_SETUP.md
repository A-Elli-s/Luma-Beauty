# Luma Beauty Creator Backend

The creator program frontend is built and the backend code is included in this repository. GitHub Pages is a static host, so the creator database/API must be deployed to a backend service.

## Recommended backend: Supabase

Files already included:

- `supabase/schema.sql` — database tables for applications, creators, referral clicks, attributed sales, and payouts.
- `supabase/functions/creator-api/index.ts` — Edge Function handling creator applications and referral click logging.
- `luma-config.js` — one-line configuration point for the deployed API URL.
- `creator-backend.js` — frontend integration for creator applications and referral tracking.

## What the system supports

1. Creator applications can be securely submitted to the backend.
2. Approved creators can receive a unique code such as `andrea01`.
3. Creator links can use `?ref=andrea01` on any Luma Beauty page.
4. Luma remembers creator attribution for up to 30 days while the shopper browses.
5. Referral clicks can be stored without fingerprinting visitors.
6. Confirmed affiliate sales can be associated with a creator in `attributed_sales`.
7. Creator earnings are calculated from Luma Beauty's net affiliate commission multiplied by the creator's agreed commission-share percentage.
8. Payout records can be tracked separately in `creator_payouts`.

## Production activation

1. Create/connect a Supabase project.
2. Run `supabase/schema.sql` against the project database.
3. Deploy `supabase/functions/creator-api` as an Edge Function.
4. Put the deployed function URL into `luma-config.js` as `creatorApiUrl`.
5. Test the health endpoint and submit one test creator application.
6. Add approved creators to the `creators` table with a unique `creator_code` and commission-share rate.
7. When affiliate programs are connected, map their approved order/reporting data into `attributed_sales` using the stored creator attribution or the affiliate network's supported sub-ID/tracking parameter.

## Important production rules

- Never place a Supabase service-role key, affiliate-network secret, payment credential, or other private key in GitHub Pages JavaScript.
- Creator payout percentages should be percentages of Luma Beauty's eligible net affiliate commission unless a written agreement says otherwise.
- Returns, cancellations, reversals, and network adjustments should be reflected before payout.
- Affiliate networks differ in whether and how they support sub-IDs, webhooks, reports, or conversion APIs. The final order-import integration should be customized after Luma Beauty is approved for each network.
- Creator advertising should use clear disclosures and comply with retailer, affiliate-network, platform, and applicable advertising rules.
