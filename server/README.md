# RonJohns Trendy Things Server

A Node.js Express server that serves trending product data.

## Features
- **In-memory Caching:** Prevents excessive API calls by caching product data for 1 hour.
- **Mock & Live Modes:** Automatically switches to mock data if API keys are missing.
- **Category Filtering:** Supports filtering via query parameters.

## Environment Variables
Create a `.env` file with the following:
```env
PORT=5001
DOMAIN=youwantitwegotit.online

# Affiliate IDs
AMAZON_ASSOCIATE_TAG=...
EBAY_CAMPAIGN_ID=...
CLICKBANK_ID=...

# API Keys
AMAZON_API_KEY=...
AMAZON_API_SECRET=...
EBAY_API_KEY=...
EBAY_API_SECRET=...
CLICKBANK_API_KEY=...
```

## API Endpoints
- `GET /api/products?category={category}`: Returns a list of trending products.
