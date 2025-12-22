# ss-casa-natura-v1 Backend

Backend for a multi-page website with product management, orders, users, and an admin panel.  
Supports Stripe integration for payments, Mailchimp for contact form submissions, JWT authentication, MongoDB for data storage, and emoji-based logging (`❌`, `✅`, `🚀`, `🔋`, `💡`) for convenient server monitoring.

## Key Features

- Products with promo and seasonal discounts, categories and subcategories  
- Product sorting and filtering by popularity, price, and category  
- Product details, related products (`relatedProducts`), and upsell products (`upsellProducts`)  
- Orders with stock verification, promo code application, shipping calculation by weight, and Stripe PaymentIntent creation  
- Admin panel to manage products, orders, promo codes, and users  
- User accounts with registration, login, profile editing, password changes, and order history  
- Contact form submissions via Mailchimp  
- Server logs with emojis for different message types (`❌` – error, `✅` – success, `🚀` – sent, `🔋` – server running, `💡` – info)  

## API

### Products

- `GET /api/products` – get a list of products with optional category filter and sorting (`popularity` or `price`)  
- `GET /api/products/[slug]` – get a single product’s details, including promo/discounts, related products, and upsell products  
- `GET /api/products/[slug]/related` – get related products for a specific product  
- `GET /api/products/[slug]/upsell` – get products often bought together with the selected product  

### Orders

- `POST /api/orders` – create an order and generate a Stripe PaymentIntent. Checks stock, applies promo codes, calculates shipping by weight, and sends notifications to the user and site owner via Mailchimp  
- `GET /api/users/me/orders` – get the user’s order history (MVP)

### Contact

- `POST /api/contact` – send contact form submissions via Mailchimp  

### Admin Panel (all routes protected with JWT and `admin` role)

- `GET /api/admin/products` – get all products  
- `POST /api/admin/products` – create a new product  
- `PUT /api/admin/products/[id]` – update a product  
- `DELETE /api/admin/products/[id]` – delete a product  

- `GET /api/admin/orders` – get all orders  
- `PUT /api/admin/orders/[id]` – update order status (`pending`, `paid`, `shipped`, `canceled`)  

- `GET /api/admin/promocodes` – get all promo codes  
- `POST /api/admin/promocodes` – create a promo code  
- `PUT /api/admin/promocodes/[id]` – update a promo code  
- `DELETE /api/admin/promocodes/[id]` – delete a promo code  

- `GET /api/admin/users` – get all users  
- `PUT /api/admin/users/[id]` – update a user  
- `DELETE /api/admin/users/[id]` – delete a user  

### User Account

- `POST /api/auth/register` – register a new user  
- `POST /api/auth/login` – login (JWT and cookie-based)  
- `GET /api/users/me` – get user profile  
- `PUT /api/users/me` – update profile  
- `POST /api/users/me/password` – change password  

## Product Features

- SEO: title, description, og:image  
- Price: original, promo, seasonal, fixed  
- Category + subcategory  
- Properties: weight, volume, color, composition  
- Availability / SKU  
- Popularity → sorting by sales  
- Recommendations: relatedProducts + upsellProducts  

## Technologies

- Node.js + Next.js (App Router, Route Handlers)  
- MongoDB + Mongoose  
- Stripe (payments)  
- Mailchimp (contact form)  
- JWT & cookies for authentication  
- TypeScript  
- TailwindCSS for frontend  

## Setup

1. Install dependencies:
```bash
npm install

2. Create .env.local based on .env.example:
MONGO_URI=""
JWT_SECRET=""
STRIPE_SECRET_KEY=""
MAILCHIMP_API_KEY=""
MAILCHIMP_LIST_ID=""

3. Run the local development server:
npm run dev

4. Swagger API documentation (after integration):
http://localhost:3000/docs