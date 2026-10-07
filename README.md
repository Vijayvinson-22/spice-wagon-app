# Spice Wagon

A React storefront and Express REST API for a neighborhood Indian spice marketplace. The interface includes an origin-led catalog, interactive custom-blend maker, Tamil Nadu recipe book, OpenStreetMap shop locator, order journey, shopping cart, and subscription dashboard.

## Run locally

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long, random `JWT_SECRET`. Use fresh credentials and rotate any credentials that may have been exposed previously.
3. Start MongoDB locally or provide a MongoDB Atlas connection string. On connection the API creates the initial spice catalog. Legacy sample Bengaluru shops are paused and removed from the admin shop list; they are not real Chennai/Tamil Nadu partners.
4. Run `npm run dev` and open `http://localhost:5173`. The Vite development server proxies `/api` and `/uploads` to Express on port 4000.
5. Create an account in **Your profile** and enter a complete delivery address. Checkout accepts addresses outside current shop PIN coverage; orders require a signed-in account and a connected MongoDB database.
6. An administrator can add and approve real Tamil Nadu shops in **Admin dashboard** using their full street address, service PIN codes, and map pin. After an order is placed, the administrator assigns it to an approved shop. Orders then move through preparation, packing, readiness, **Delivery assigned**, **Out for delivery**, and **Delivered**. Once the order is **Ready**, the administrator records a real courier name and phone or uses the clearly marked local-only demo courier for testing. Demo shops and the demo courier are not real businesses or delivery providers.
7. **Use this device's GPS** requests browser permission, saves an optional map pin with the profile/order, and displays a map preview. GPS requires a secure browser context (localhost is allowed). Map pins are shown as a map link, not as a substitute for the written delivery address. OpenStreetMap provides the map tiles. The optional **Look up address from GPS** action sends coordinates to the public OpenStreetMap/Nominatim reverse-geocoding service only after the customer clicks it; review and edit the returned street address before saving or ordering.
8. The shop locator can use browser location permission to calculate distances. Enter a Chennai area or six-digit PIN code in **Local shops** to filter the approved listings. The language control in the top bar switches the main shopping, checkout, order, and tracking screens between English and Tamil.
9. The notification bell and **My orders** show persisted shop/admin status updates with their recorded timestamps. Updates refresh in the app about every 30 seconds while signed in; these are not push, email, or SMS notifications. Live rider GPS and delivery-time estimates are not provided.
10. **Recipe book** includes eight Tamil Nadu-inspired home recipes, pantry staples, preparation steps, and catalog spice suggestions. **Add spice packs to wagon** adds one full catalog pack of each listed spice; recipe measures are cooking guidance and are not used as pack quantities.
11. **Custom masala maker** lets customers add or remove spices while keeping the remaining blend percentages at 100%. Its preview and cart item show the leading flavor, heat description, exact ingredient ratios, and suggested dishes; the selected recipe settings are carried into the order.
12. In local development, the database seeds clearly labeled **DEMO · TEST ONLY** listings for Chennai, Madurai, Tirunelveli, Tiruchirappalli, Coimbatore, Salem, and Kovilpatti. Their addresses and service PIN codes are fictional examples. Customers may submit a complete delivery address anywhere; admins assign an approved shop after ordering, then assign a courier name and phone once the order is Ready. Demo shops are hidden from customer listings and cannot receive orders when `NODE_ENV=production`; never treat these samples as real businesses or delivery coverage.

Run `npm test` for marketplace rule tests. `npm run build` creates the production frontend bundle. `npm start` runs the Express API; serve the generated `dist` directory from a static web host or reverse proxy the frontend and `/api` to the API.

### Create the first admin account

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the current PowerShell session, then run `npm run admin:create`. Use a password of at least 12 characters. The command creates an admin account if that email is new; if it already exists, it promotes the account only when the supplied password matches. Clear the temporary environment values afterward:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "use-a-new-long-random-password"
npm run admin:create
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
```

Open **Admin sign in** from the app sidebar and sign in with that account to access the role-gated **Admin dashboard**. Admins and shop owners can record delivery status changes; the customer tracking page shows those saved updates and timestamps. Live rider GPS is not provided.

In the admin dashboard, add or update each shop's complete Chennai/Tamil Nadu street address and comma-separated six-digit service PIN codes. Use the address lookup button to set the map pin without typing coordinates. The checklist shows whether the address, service PIN code(s), and map pin are present; it does not independently verify a shop, so confirm its real details with the operator before approval. Approval requires all three fields. An approved shop is automatically paused if an edit removes one of those required details. Existing orders are assigned to an approved shop that serves the entered PIN code. Shop owners can update these details from their mill dashboard but still require admin approval.

The catalog reads live stock from MongoDB, disables add-to-cart for known sold-out products, and rechecks requested quantities atomically when an order is placed. A stock count of five or fewer is flagged as low in the admin inventory list. If stock lookup is unavailable in the browser, checkout still performs the authoritative server-side quantity check.

Online checkout requires Razorpay credentials. Use Razorpay **test-mode** keys for local verification and ensure test transactions are enabled for UPI, cards, and net banking in the Razorpay dashboard. The app confirms online orders only after Razorpay's signed checkout response is verified by the API. Verify success, user cancellation, invalid signatures, and unavailable/missing credentials in test mode before using production keys. Never use production keys for local testing.

## Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | Express listening port (default `4000`) |
| `CLIENT_ORIGIN` | Optional allowed browser origin |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify account tokens |
| `RAZORPAY_KEY_ID` | Razorpay public checkout key, supplied by the API |
| `RAZORPAY_KEY_SECRET` | Private Razorpay key; never sent to the browser |

Online checkout is enabled only when both Razorpay keys are configured. The backend creates payment orders and confirms an order only after checking Razorpay's HMAC signature. Checkout requests UPI, card, and netbanking methods; UPI must also be enabled for the Razorpay account in its dashboard. Cash on delivery is tracked separately as `pay_on_delivery`. Map tiles are provided by OpenStreetMap; tile use remains subject to its service policy.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `POST /api/products`, `PATCH /api/products/:id`
- `GET /api/shops`, `POST /api/shops`, `PATCH /api/shops/:id`, `POST /api/shops/:id/certifications`
- `POST /api/orders`, `GET /api/orders`, `PATCH /api/orders/:id/status`, `PATCH /api/admin/orders/:id/assignment`
- `POST /api/payments/verify`
- `POST /api/subscriptions`, `GET /api/subscriptions`, `PATCH /api/subscriptions/:id`
- `GET /api/admin/overview`, `GET /api/admin/customers`, shop approval and certification-verification endpoints

Shop management routes require a `shop_owner` or `admin` account. Customer registration never accepts a role field. Newly registered shops remain unapproved until an administrator approves them. Certification uploads accept PDF, JPEG, and PNG files up to 5 MB and are stored under `server/uploads` (excluded from version control).
