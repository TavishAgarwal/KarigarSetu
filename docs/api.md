# KarigarSetu API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require authentication via httpOnly cookie (`karigarsetu_token`) or `Authorization: Bearer <token>` header.

---

## Auth Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Rajan Sharma",
  "email": "rajan@example.com",
  "password": "securePassword123",
  "role": "artisan"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cuid...",
    "name": "Rajan Sharma",
    "email": "rajan@example.com",
    "role": "artisan"
  }
}
```

### POST `/api/auth/login`
Authenticate and receive a session token.

**Rate Limit:** 10 requests/minute/IP

**Request Body:**
```json
{
  "email": "rajan@example.com",
  "password": "securePassword123"
}
```

### POST `/api/auth/logout`
Clear the authentication cookie.

### GET `/api/auth/me`
Get the currently authenticated user.

### POST `/api/auth/firebase`
Verify Firebase Auth token and create/link a local session.

---

## Product Endpoints

### GET `/api/products`
List products with filtering, search, and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by craft category |
| `region` | string | Filter by artisan region |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `search` | string | Full-text search in title/description |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12, max: 100) |
| `sortBy` | string | Sort field: `createdAt`, `price`, `title` |
| `sortOrder` | string | `asc` or `desc` |

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

### GET `/api/products/[id]`
Get a single product with full details.

### POST `/api/products` 🔒
Create a new product listing (artisan only).

### PATCH `/api/products/[id]` 🔒
Update an existing product.

### DELETE `/api/products/[id]` 🔒
Delete a product.

---

## Order Endpoints

### GET `/api/orders` 🔒
Get order history for the authenticated buyer.

### POST `/api/orders` 🔒
Create a new order.

**Request Body:**
```json
{
  "items": [
    { "productId": "cuid...", "quantity": 2 }
  ],
  "shippingForm": {
    "fullName": "Buyer Name",
    "address": "123 Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "9876543210"
  }
}
```

### PATCH `/api/orders/[id]` 🔒
Update order status (artisan only). Valid transitions:
- `PENDING` → `CONFIRMED` | `CANCELLED`
- `CONFIRMED` → `PROCESSING` | `CANCELLED`
- `PROCESSING` → `SHIPPED`
- `SHIPPED` → `DELIVERED`

---

## AI Endpoints

All AI endpoints have a **rate limit of 20 requests/minute/IP**.

### POST `/api/ai/analyze-image` 🔒
Analyze a craft image to detect craft type, materials, and category.

### POST `/api/ai/generate-listing` 🔒
Generate a complete product listing from an image and description.

### POST `/api/ai/generate-craft-story` 🔒
Generate a cultural heritage narrative for a craft.

### POST `/api/ai/heritage-story` 🔒
Generate detailed heritage story with origin, history, and techniques.

### POST `/api/ai/authenticate-craft` 🔒
Verify craft authenticity and provenance.

### POST `/api/ai/authenticate-handmade` 🔒
Detect handmade vs machine-made signals.

### POST `/api/ai/price-estimate` 🔒
Estimate fair pricing with global benchmarks.

### POST `/api/ai/craft-trends` 🔒
Predict trending styles, colors, and target markets.

### POST `/api/ai/global-craft-demand` 🔒
Analyze demand across 8 global regions.

### POST `/api/ai/production-plan` 🔒
Generate production recommendations based on demand.

### POST `/api/ai/marketing` 🔒
Generate Instagram, WhatsApp, and promotional content.

### POST `/api/ai/translate`
Translate text to target language. No auth required.

### POST `/api/ai/personal-shopper`
Conversational AI shopping assistant. No auth required.

### POST `/api/ai/speech-to-text` 🔒
Transcribe audio to text in 13 Indian languages.

### POST `/api/ai/craft-guide`
Get AI-powered craft buying guidance. No auth required.

### GET `/api/ai/trends` 🔒
Get market trend insights and export demand analysis.

---

## Insights Endpoints

### GET `/api/insights/demand` 🔒
Regional demand analytics (BigQuery or Prisma fallback).

### GET `/api/insights/trends` 🔒
Seasonal trend analytics.

### GET `/api/insights/pricing` 🔒
Pricing benchmark data by craft type.

---

## Health Check

### GET `/api/health`
Server health check endpoint.

---

## Error Responses

All errors follow a consistent format:
```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 404 | Not Found |
| 409 | Conflict — duplicate resource |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

🔒 = Requires authentication
