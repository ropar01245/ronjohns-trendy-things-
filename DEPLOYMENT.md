# Deployment Guide: RonJohns Trendy Things

Follow these steps to get your affiliate store live on **youwantitwegotit.online**.

## 1. Backend Deployment (Server)
The backend is a Node.js Express server. You can host this on services like **Render**, **Railway**, or a **VPS (DigitalOcean/Linode)**.

1.  **Upload the `server` folder** to your hosting provider.
2.  **Install dependencies**: Run `npm install` in the server folder.
3.  **Set Environment Variables**: In your hosting dashboard, add the following variables (referencing your `.env`):
    *   `PORT=5001`
    *   `EBAY_API_KEY=your-client-id`
    *   `EBAY_API_SECRET=your-client-secret`
    *   `EBAY_CAMPAIGN_ID=your-10-digit-campid`
4.  **Start the server**: Run `npm start`.

## 2. Frontend Deployment (Client)
The frontend is a React app built with Vite. You can host this for free on **Netlify**, **Vercel**, or **GitHub Pages**.

1.  **Build the project**: In the `client` folder, run:
    ```bash
    npm install
    npm run build
    ```
2.  **Configure API URL**: Update the `VITE_API_URL` in your production environment variables to point to your live server URL (e.g., `https://api.youwantitwegotit.online`).
3.  **Deploy the `dist` folder**: Upload the contents of the `client/dist` folder to your static hosting provider.

## 3. Custom Domain (youwantitwegotit.online)
1.  **CNAME Record**: Point your domain's CNAME record to your frontend hosting provider (e.g., Netlify/Vercel).
2.  **A Record/Subdomain**: If you are hosting the API on a subdomain (like `api.youwantitwegotit.online`), point that to your backend server.

## 4. Maintenance
*   **Adding Products**: To add more Amazon or ClickBank products, simply update the `manual_products.json` file in your server and restart the server.
*   **Live Updates**: eBay products will update automatically every 15 minutes as long as your API keys are valid.

---
**Good luck with your launch!**
