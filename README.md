# Turtle Mountain Forest Nursery: website

The public site, a 2027 reservation system that emails you every order, a password-protected owner dashboard, a printable order form and an AI advisor. All of it runs on Cloudflare's free tier as one Worker.

```
public/              the website (everything here is served as-is)
  index.html         home page (generated from build/index.template.html)
  owner/             owner dashboard  -> /owner/
  order-form/        printable paper order form -> /order-form/
  assets/data.js     ALL species, prices, quantities, soil zones, FAQ (edit this one file)
  assets/trees/      tree photos + credits.json
  favicon.*, icon-*.png, og-image.png, site.webmanifest, robots.txt, sitemap.xml
src/worker.js        order API, email, owner API, AI advisor
wrangler.jsonc       Cloudflare settings
scripts/fetch-images.mjs   downloads public-domain tree photos
TOWNER-ORDER-2027.md       what to order for the 2027 crop, and a warning to read first
```

## Publishing: why drag-and-drop doesn't work

Cloudflare's drag-and-drop uploader only takes plain web pages. This site also runs server code: order emails, saving reservations, the owner dashboard and the AI advisor. That code has to be published with Wrangler, Cloudflare's free publishing tool. The scripts below handle it for you.

## Quick start (about 15 minutes)

1. Do **step 3** below (turn on order emails). It takes 5 minutes in the Cloudflare dashboard.
2. Install **Node.js LTS** from nodejs.org. Click through the installer with the defaults.
3. Unzip this folder. Optionally, copy your 8 existing tree photos into `public/assets/trees/` (see step 2).
4. Double-click **`deploy-windows.bat`** on Windows or **`deploy-mac.command`** on a Mac. On a Mac the first time, right-click it and choose Open.
   - It installs Wrangler, downloads the missing tree photos, signs you in to Cloudflare in your browser, and publishes the site.
   - The first time, it asks you to choose an owner dashboard password.
5. Do **steps 5 and 6** below: test on the workers.dev link, then move your domain.

After any change to the site, double-click the same file again to republish.

The steps below are the same process done by hand, if you'd rather run the commands yourself.

## One-time setup, step by step

You need Node.js LTS (nodejs.org) and your Cloudflare account. Open a terminal in this folder.

### 1. Install

```
npm install
```

### 2. Photos

1. Copy the 8 photos from your current site's `assets/trees/` folder into `public/assets/trees/`. Keep the same names: `black-hills-spruce.jpg`, `blue-spruce.jpg`, `bur-oak.jpg`, `quaking-aspen.jpg`, `ponderosa-pine.jpg`, `eastern-red-cedar.jpg`, `rocky-mountain-juniper.jpg`, `juneberry.jpg`. Their credits are already filled in.
2. Download public-domain photos for the other species from Wikimedia Commons:
   ```
   npm run images
   ```
   It only accepts files marked public domain or CC0 and records the photographer and license in `public/assets/trees/credits.json`. The site shows that credit on each photo.
3. Open the site (step 5) and look at every photo. To swap one, find a public-domain photo on commons.wikimedia.org and put its title in `scripts/image-picks.json`, for example `{ "lilac": "File:Syringa vulgaris flowers.jpg" }`. Then run `npm run images -- --only=lilac --force`.

Any species without a photo shows a drawn silhouette, so nothing looks broken.

### 3. Turn on order emails (Cloudflare dashboard)

Orders are sent from `orders@turtlemountainforestnursery.com` to `tannergilbertlord@gmail.com` through Cloudflare Email Routing. It's free when sending to your own verified address.

1. Go to Cloudflare dashboard → turtlemountainforestnursery.com → **Email** → **Email Routing** → **Get started / Enable**. Let it add its DNS records.
   - Check first: if you already receive email at an address on this domain through another provider, enabling Email Routing replaces those MX records. Your Gmail address isn't affected.
2. Go to **Destination addresses** → add `tannergilbertlord@gmail.com` → click the verification link Cloudflare sends to Gmail.

The `orders@` address doesn't need a mailbox. To use a different sender, change `FROM_EMAIL` in `wrangler.jsonc`. It must be on a domain with Email Routing on.

### 4. Deploy

```
npx wrangler login
npm run deploy
```

The first deploy creates the reservation storage (a KV namespace called ORDERS) and prints a test link like `https://turtle-mountain-forest-nursery.<you>.workers.dev`.

Then set the owner dashboard password. Use something long; only you need it.

```
npx wrangler secret put OWNER_KEY
```

### 5. Test on the workers.dev link

1. Reserve a couple of trees and submit. You should get the email within a minute. Hitting Reply goes to the customer when they gave an email.
2. Open `/owner/`, enter your owner key, and confirm the reservation is listed.
3. Click **Send test email** on the dashboard if the email didn't arrive. The status line tells you which piece isn't set up.
4. Delete the test reservation from the dashboard.

### 6. Put it on turtlemountainforestnursery.com

1. In the Cloudflare dashboard, open your old site's project under **Workers & Pages** → **Custom domains** → remove `turtlemountainforestnursery.com` (and `www` if listed).
2. In `wrangler.jsonc`, uncomment the `routes` block at the bottom.
3. Run `npm run deploy` again.
4. Open `https://turtlemountainforestnursery.com/api/health`. It should show `"email":true,"storage":true,"advisor":true,"ownerKey":true`. Send one more test reservation from your phone.
5. In `wrangler.jsonc`, uncomment `"workers_dev": false` and deploy again so the test link stops serving the site.
6. Delete any other test copies under **Workers & Pages** (for example a Worker with a random name like `steep-poetry-05d2`) so nobody reserves on a copy that doesn't email you.

### No-install option: publish from GitHub

Use this if you can't install Node.js. Cloudflare runs Wrangler for you whenever the code on GitHub changes.

1. Create a free GitHub account and a new **private** repository named `turtle-mountain-forest-nursery`.
2. On the empty repository's page, click **uploading an existing file**. Drag in everything *inside* the unzipped folder, not the folder itself, and commit.
3. In Cloudflare, go to **Workers & Pages** → **Create application** → **Import a repository**. Connect GitHub and pick the repository.
   - Project name: `turtle-mountain-forest-nursery`. It must match `name` in `wrangler.jsonc`.
   - Build command: `node scripts/fetch-images.mjs && node build/build.mjs`. This downloads the tree photos and rebuilds the home page (FAQ, Google data, copyright year) on each build.
   - Deploy command: `npx wrangler deploy`.
   - Click **Save and Deploy**.
4. Open the new Worker → **Settings** → **Variables and Secrets** → add a **Secret** named `OWNER_KEY` with your dashboard password.
5. Continue with steps 5 and 6. In step 6, edit `wrangler.jsonc` on GitHub instead; the commit republishes the site.

### 7. Google

- Add the site in Google Search Console and submit `https://turtlemountainforestnursery.com/sitemap.xml`.
- The logo shows in Google results (favicon) and in link previews on Facebook, texts and Slack (`og-image.png`). Google can take a few days to a few weeks to pick up a new favicon.

## Day to day

| Task | How |
| --- | --- |
| See and manage reservations | `turtlemountainforestnursery.com/owner/`: status (New, Contacted, Ready, Picked up, Canceled), private notes, search, CSV export, printable pick list, supply vs. demand per species |
| Change prices, species, quantities, FAQ | Edit `public/assets/data.js`, then double-click the deploy file again (or `npm run deploy`) |
| Change the owner password | `npx wrangler secret put OWNER_KEY` |
| Change how many of a species you grew | `grown:` in `data.js`. It also caps how many one customer can reserve. |
| Read live errors | `npm run logs` |
| Turn the AI advisor off | Delete the `"ai"` block in `wrangler.jsonc` and redeploy |

## Costs

- Workers free plan: 100,000 requests a day.
- KV free plan: 1,000 writes a day. Each reservation or status change is one write.
- Email to your own verified address: free.
- Workers AI includes a free daily allowance. On the free plan the advisor stops answering for the rest of the day if it's used up, and the page tells visitors to call you.

## Troubleshooting

- **Dashboard says "Not set up yet: order email"**: the `send_email` binding or the email addresses are missing from `wrangler.jsonc`. Redeploy.
- **Test email fails with `E_SENDER_NOT_VERIFIED` or `E_SENDER_DOMAIN_NOT_AVAILABLE`**: Email Routing isn't enabled on the sender's domain (step 3.1).
- **Test email fails with `E_RECIPIENT_NOT_ALLOWED`**: the Gmail destination isn't verified yet (step 3.2).
- **Advisor offline**: Workers AI retires models over time. Pick a current text model at developers.cloudflare.com/workers-ai/models/, put its id in `AI_MODEL`, and redeploy.
- **Wrangler complains about `compatibility_date`**: set it to today's date in `wrangler.jsonc`.
- **A customer says the form failed**: the site shows them a copyable summary and your phone number. The Worker only reports failure when both the email and the storage failed, and `npm run logs` shows why.
- **A customer says they got a TM27 number but you never got the email**: the spam filter may have caught them. In the Cloudflare dashboard, open the Worker → **Logs** and search for `dropped`. Each dropped reservation is logged with the name, phone, email and trees.
- **Owner dashboard says "Too many wrong owner keys"**: eight wrong tries from one connection locks it for 15 minutes. Wait, then sign in again.
