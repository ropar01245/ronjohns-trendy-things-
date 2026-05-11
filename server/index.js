const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const MANUAL_PRODUCTS_PATH = path.join(__dirname, 'manual_products.json');

let productCache = {
  lastUpdated: null,
  data: []
};

/**
 * eBay OAuth: Gets an access token using Client ID and Secret
 */
async function getEbayToken() {
  const auth = Buffer.from(`${process.env.EBAY_API_KEY}:${process.env.EBAY_API_SECRET}`).toString('base64');
  try {
    const response = await axios.post('https://api.ebay.com/identity/v1/oauth2/token', 
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope', 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching eBay token:', error.response?.data || error.message);
    return null;
  }
}

/**
 * eBay Browse API: Fetches real products from eBay
 */
async function fetchEbayProducts(category) {
  const token = await getEbayToken();
  if (!token) return [];

  // Map our categories to eBay search queries
  const queryMap = {
    'All': 'trending',
    'Health': 'health and beauty',
    'Electronics': 'gadgets electronics',
    'Household': 'home decor kitchen',
    'E-books': 'ebooks'
  };

  const query = queryMap[category] || 'trending';
  
  try {
    const response = await axios.get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${query}&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-ENDUSERCTX': `affiliateCampaignId=${process.env.EBAY_CAMPAIGN_ID}`
      }
    });

    return (response.data.itemSummaries || []).map(item => ({
      id: item.itemId,
      title: item.title,
      price: `${item.price.currency} ${item.price.value}`,
      image: item.image?.imageUrl || 'https://via.placeholder.com/400',
      category: category === 'All' ? 'Electronics' : category, // Default mapping
      affiliateUrl: item.itemAffiliateWebUrl || item.itemWebUrl,
      source: 'ebay'
    }));
  } catch (error) {
    console.error('Error fetching eBay products:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Manual System: Reads the JSON file for Amazon/ClickBank products
 */
function getManualProducts() {
  try {
    if (fs.existsSync(MANUAL_PRODUCTS_PATH)) {
      const raw = fs.readFileSync(MANUAL_PRODUCTS_PATH);
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading manual products:', error);
  }
  return [];
}

async function fetchTrendingProducts(category = 'All') {
  console.log(`Updating product feed for: ${category}`);
  
  const manual = getManualProducts();
  let live = [];

  // Only attempt eBay if keys are present
  if (process.env.EBAY_API_KEY && process.env.EBAY_API_SECRET && process.env.EBAY_CAMPAIGN_ID) {
    live = await fetchEbayProducts(category);
  } else {
    console.log('eBay credentials missing. Skipping live fetch.');
  }

  // Combine and shuffle slightly
  return [...manual, ...live].sort(() => Math.random() - 0.5);
}

app.get('/api/products', async (req, res) => {
  const { category = 'All' } = req.query;
  
  // For this hybrid setup, we'll fetch fresh if it's been more than 15 mins
  // or if we don't have data for this specific category yet
  if (!productCache.lastUpdated || (Date.now() - productCache.lastUpdated > 900000)) {
    productCache.data = await fetchTrendingProducts(category);
    productCache.lastUpdated = Date.now();
  }

  let filtered = productCache.data;
  if (category && category !== 'All') {
    filtered = productCache.data.filter(p => p.category === category);
  }

  res.json(filtered);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Hybrid Mode: Manual JSON + eBay API active.`);
});
