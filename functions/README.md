# KarigarSetu Cloud Functions

Two serverless Google Cloud Functions powering the AI product pipeline and order notification system.

## Functions

### 1. `productPipeline`
When an artisan uploads a craft photo, this function:
1. Fetches the image from the provided URL
2. Runs **3 Vertex AI analyses in parallel**:
   - **Listing generation** — title, description, story, tags, price
   - **Heritage story** — craft history, artisan journey, cultural symbolism
   - **Provenance verification** — authenticity score, traditional technique detection
3. Sends all results back to the Next.js webhook (`/api/webhooks/cloud-functions`)

### 2. `orderNotification`
When a new order is placed, this function:
1. Sends a **Firebase Cloud Messaging** push notification to the artisan
2. Creates an **in-app notification** in Firestore
3. Syncs the **order status** to Firestore for real-time updates

## Setup

```bash
cd functions
npm install
```

## Environment Variables

Set these in the Google Cloud Console (or in a `.env.yaml` file):

```yaml
GCP_PROJECT_ID: "karigarsetu1"
GCP_LOCATION: "asia-south1"
WEBHOOK_URL: "https://your-app.vercel.app/api/webhooks/cloud-functions"
WEBHOOK_SECRET: "your_secure_secret"
```

## Deploy

```bash
# Deploy both functions
npm run deploy:all

# Or deploy individually
npm run deploy:pipeline
npm run deploy:notification
```

## Testing Locally

```bash
npm run build
npx @google-cloud/functions-framework --target=productPipeline --port=8080
```

Then send a test request:
```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your_secret" \
  -d '{"productId":"test123","imageUrl":"https://example.com/image.jpg","craftType":"Block Printing"}'
```
