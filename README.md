# Nowstheplace

Your online gallery and shop. Buyers browse your work, add originals to a cart and pay by card through Stripe. You run everything from a private dashboard at **/admin**: add pieces, set prices, mark things sold, see orders with shipping addresses, read messages, and change the site name, bio and shipping price.

**What's inside**

| Part | What it does |
|---|---|
| Gallery | Home page, “Work” page with Available/Sold filters, a page for each piece with a museum-style label |
| Cart and checkout | One-of-a-kind cart (each original can only be bought once). Stripe Checkout takes the card and the shipping address |
| Holds | While someone is checking out, their pieces are “On hold” for about 30 minutes so nobody else can buy them. If they back out, the hold ends immediately |
| Sold | When payment goes through, the piece flips to **Sold** with a red dot, automatically |
| Dashboard | `/admin`, protected by your password |
| Messages | “Ask about this piece” and the Contact page save messages to your dashboard |

Your 20 pieces are already loaded with working titles, numbered No. 001 to No. 020. **None has a price yet**, so they show “Price on request” until you set prices in the dashboard.

---

## What it costs

- **Vercel** hosts the site. It's free while you set up and test, but Vercel's free Hobby plan is for non-commercial use only. Once you're selling, switch to the paid **Pro** plan.
- **Neon** (the database) and **Vercel Blob** (photo storage) are free at this size.
- **Stripe** has no monthly fee. It takes a small cut of each sale.
- **Your domain** (nowstheplace.com or similar) costs about $10–20 a year.

---

## Put it online (about an hour, on a computer)

### 1. Put the code on GitHub
1. Make a free account at github.com.
2. Click **+ → New repository**, name it `nowstheplace`, set it to **Private**, and click **Create repository**.
3. On the new repo page, click **uploading an existing file**. Unzip this project, then drag **everything inside the `nowstheplace` folder** (including the `src`, `public` and `prisma` folders) into the page. Click **Commit changes**.

### 2. Create the site on Vercel
1. Sign up at vercel.com with **Continue with GitHub**.
2. Click **Add New → Project** and import `nowstheplace`.
3. Open **Environment Variables** and add these two:
   - `ADMIN_PASSWORD`: the password you'll use for the dashboard (make it long)
   - `SESSION_SECRET`: any long random jumble of 30+ letters and numbers
4. Click **Deploy**. **This first deploy will fail.** That's expected, because there's no database yet.

### 3. Add the database
1. In your Vercel project, open **Storage → Create Database → Neon (Postgres)** and accept the defaults.
2. Connect it to the project. This adds `DATABASE_URL` for you.

### 4. Add photo storage (for uploading new pieces later)
1. Still in **Storage**, click **Create → Blob** and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.

### 5. Deploy again
1. Go to **Deployments**, open the ⋯ menu on the failed deploy, and click **Redeploy**.
2. When it finishes, click **Visit**. Your site is live at an address like `nowstheplace.vercel.app`, with all 20 pieces on it.
3. Go to `your-address/admin` and log in with your password.

### 6. Turn on payments with Stripe (test mode first)
1. Make an account at stripe.com. Leave it in **Test mode** for now (toggle at the top).
2. Go to **Developers → API keys** and copy the **Secret key** (starts with `sk_test_`).
3. Go to **Developers → Webhooks → Add endpoint**:
   - Endpoint URL: `https://YOUR-ADDRESS/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   - Save, then copy the **Signing secret** (starts with `whsec_`).
4. In Vercel → **Settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY` = the `sk_test_…` key
   - `STRIPE_WEBHOOK_SECRET` = the `whsec_…` secret
   - `NEXT_PUBLIC_SITE_URL` = your site address, e.g. `https://nowstheplace.vercel.app` (no slash at the end)
5. Redeploy (same as step 5).

### 7. Test a purchase
1. In the dashboard, give one piece a price (for example 1).
2. On the site, add it to the cart and check out with the test card **4242 4242 4242 4242**, any future date, any CVC and any ZIP.
3. The piece should now show **Sold**, and the order should appear under **Orders** in the dashboard. Click its status to set it back to Available.

### 8. Go live
1. In Stripe, click **Activate account** and fill in your details and bank account.
2. Switch Stripe to **Live mode**, then repeat step 6 with the **live** secret key and a **new live webhook**.
3. Update those two variables in Vercel and redeploy.
4. Upgrade Vercel to Pro (see “What it costs”).

### 9. Your own domain (optional)
In Vercel, go to **Settings → Domains** and buy or connect `nowstheplace.com`. Then update `NEXT_PUBLIC_SITE_URL` and the Stripe webhook URL to the new address, and redeploy.

---

## Using the dashboard

- **Artworks**: click a title to edit its price, size, year, description or photo. Click a status, “Shown” or ★ to flip it in one tap.
- **+ Add piece**: upload a photo straight from your phone. It's shrunk automatically.
- **Orders**: every paid order, with the buyer's email and shipping address. Click **To ship** to mark it shipped.
- **Messages**: questions from buyers. Click the email address to reply.
- **Site settings**: site name, your name, tagline, bio, Instagram, public email and the flat shipping price.

**Refunds** are done in the Stripe dashboard. If you refund a piece, set it back to Available in your dashboard.

Shipping is US-only by default. To ship abroad, change `allowed_countries` in `src/app/api/checkout/route.ts`.

## For developers
```
cp .env.example .env    # fill in values
npm install
npx prisma db push && npm run db:seed
npm run dev
```
Stack: Next.js 14 (App Router), Prisma + Postgres, Stripe Checkout and webhooks, Vercel Blob.
