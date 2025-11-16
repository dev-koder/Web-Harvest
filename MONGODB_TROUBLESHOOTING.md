# MongoDB Connection Troubleshooting

## Issue: SSL/TLS Connection Error

You're experiencing an SSL connection error with MongoDB Atlas. This is a common issue with certain Node.js versions and MongoDB Atlas.

## Solutions

### Solution 1: Add SSL Parameters to Connection String

Update your `.env` file with these additional parameters:

```
MONGODB_URI=mongodb+srv://newearntry406_db_user:jR06mnRUqsbtn3Ud@cluster0.5setvcp.mongodb.net/harvest_harmony?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
```

### Solution 2: Use Connection Options

The server has been updated with better connection options. Try restarting:

```bash
npm start
```

### Solution 3: Update Node.js

Check your Node.js version:
```bash
node --version
```

If you're using Node.js < v16, consider upgrading to Node.js 18 LTS or 20 LTS.

### Solution 4: MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Add your current IP or use `0.0.0.0/0` (for testing only)

### Solution 5: Use Local MongoDB

For development, you can install MongoDB locally:

```bash
# Install MongoDB Community Server from mongodb.com
# Then update .env:
MONGODB_URI=mongodb://localhost:27017/harvest_harmony
```

## Testing the Connection

Once you've applied a solution, test the connection:

```bash
npm run seed
```

Or check the health endpoint after starting the server:
```bash
npm start
# Then visit: http://localhost:3000/api/health
```

## Current Workaround

The application can still work without MongoDB if you:
1. Keep using the original `script.js` instead of `script-api.js`
2. The frontend will work with local JSON files

To switch back to local mode, edit `index.html` line 766:
```html
<!-- Change from: -->
<script src="script-api.js"></script>
<!-- To: -->
<script src="script.js"></script>
```
