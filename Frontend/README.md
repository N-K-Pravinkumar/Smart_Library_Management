# Libraria — Smart Library Management Frontend (Angular 17)

A fully redesigned Angular 17 frontend for the Smart Library Management system with Stripe payment integration.

## Tech Stack
- **Angular 17** (standalone components, signals, `@for`/`@if` control flow)
- **SCSS** with CSS custom properties design system
- **Stripe.js** for payment processing
- **Spring Boot** backend at `http://localhost:8080/api`

## Project Structure
```
src/app/
├── app.component.ts          # Root component
├── app.config.ts             # Providers (HTTP, Router, Animations)
├── app.routes.ts             # Lazy-loaded routes
├── app-shell.component.ts    # Sidebar + main layout
├── core/
│   ├── guards/               # authGuard, adminGuard
│   ├── interceptors/         # JWT auth interceptor
│   └── services/
│       ├── api.service.ts    # All HTTP calls to Spring Boot
│       ├── auth.service.ts   # Auth state with Angular signals
│       ├── stripe.service.ts # Stripe payment flow
│       └── toast.service.ts  # Toast notifications
├── shared/
│   ├── components/
│   │   └── toast.component.ts
│   └── models/               # TypeScript interfaces
└── features/
    ├── auth/                 # Login page
    ├── dashboard/            # Stats overview
    ├── books/                # Book CRUD (grid + table view)
    ├── members/              # Member CRUD + card grid
    ├── borrow/               # Issue/return + overdue tracking
    ├── payments/             # Fines + Stripe + membership plans
    └── reports/              # Analytics (admin only)
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `src/environments/environment.ts`:
```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api',      // Your Spring Boot URL
  stripePublishableKey: 'pk_test_...',      // Your Stripe key
};
```

### 3. Start backend
```bash
# In your Spring Boot project:
./mvnw spring-boot:run
```

### 4. Start frontend
```bash
ng serve
# → http://localhost:4200
```

## Payment Integration (Stripe)

### Backend endpoints needed
```
POST /api/payments/create-intent  → { clientSecret, paymentIntentId, amount }
POST /api/payments/confirm        → { paymentIntentId, paymentMethodId }
POST /api/payments/membership/subscribe
GET  /api/payments/fines/{memberId}
```

### Frontend flow
1. User clicks "Pay Fine" or "Subscribe" → opens payment modal
2. `StripeService.mountCardElement()` renders real Stripe card input
3. `ApiService.createPaymentIntent()` calls backend → gets `clientSecret`
4. `stripe.confirmCardPayment(clientSecret, { card })` → Stripe processes
5. Backend webhook (`/stripe/webhook`) confirms and updates DB
6. UI shows success toast

### Backend dependency (pom.xml)
```xml
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>24.3.0</version>
</dependency>
```

### Backend Spring Boot snippet
```java
@PostMapping("/payments/create-intent")
public ResponseEntity<PaymentIntentResponse> createIntent(@RequestBody PaymentRequest req) {
    Stripe.apiKey = stripeSecretKey;
    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .setAmount((long)(req.getAmount() * 100))  // paise
        .setCurrency("inr")
        .build();
    PaymentIntent intent = PaymentIntent.create(params);
    return ResponseEntity.ok(new PaymentIntentResponse(intent.getClientSecret(), intent.getId(), req.getAmount()));
}
```

## Features
| Feature | Description |
|---|---|
| Dashboard | Stats cards, recent activity, popular books |
| Books | CRUD, grid/table toggle, category filter, copy tracker |
| Members | CRUD, avatar grid, membership types, fine display |
| Borrow/Return | Issue books, return, overdue alerts, fine calculation |
| Payments | Stripe card + UPI, membership plans (Student/Basic/Premium), fine collection |
| Reports | Monthly trends, category breakdown, revenue table (admin only) |

## Design System
CSS variables in `styles.scss`:
- `--ink`, `--paper` — dark/light base colors
- `--gold` — primary accent (buttons, highlights)
- `--teal` — secondary accent
- `--font-display: 'Playfair Display'` — headings
- `--font-body: 'DM Sans'` — body text
- `--font-mono: 'DM Mono'` — codes, numbers

## Connecting Mock Data to Real API
Every component has commented-out API calls. To switch from mock data to real:
```ts
// In each component's ngOnInit(), uncomment:
this.api.getBooks().subscribe(res => { this.books.set(res.content); });
// and remove the MOCK_* constant assignment
```
