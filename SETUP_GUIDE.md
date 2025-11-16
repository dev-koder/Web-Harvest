# 🚀 Quick Start Guide - Harvest Harmony

## ✅ What's Been Added

Your project now has a complete Node.js + Express + MongoDB backend!

### New Files Created:
- ✅ `package.json` - Dependencies configuration
- ✅ `server.js` - Express server
- ✅ `.env` - MongoDB connection string
- ✅ `.gitignore` - Protects sensitive files
- ✅ `models/Machine.js` - Machine database schema
- ✅ `models/Booking.js` - Booking database schema  
- ✅ `routes/machines.js` - Machine API endpoints
- ✅ `routes/bookings.js` - Booking API endpoints
- ✅ `seedDatabase.js` - Database seeding script
- ✅ `script-api.js` - API-integrated frontend
- ✅ `README.md` - Full documentation
- ✅ `MONGODB_TROUBLESHOOTING.md` - Connection help

### Dependencies Installed:
- ✅ express (web framework)
- ✅ mongoose (MongoDB ODM)
- ✅ cors (cross-origin requests)
- ✅ dotenv (environment variables)
- ✅ body-parser (request parsing)
- ✅ nodemon (auto-reload for development)

## 🎯 Next Steps

### Step 1: Fix MongoDB Connection (If Needed)

There's currently an SSL connection issue with your MongoDB Atlas cluster. You have three options:

#### Option A: Update Connection String (Recommended)
Edit `.env` file and replace the MONGODB_URI line with:
```
MONGODB_URI=mongodb+srv://newearntry406_db_user:jR06mnRUqsbtn3Ud@cluster0.5setvcp.mongodb.net/harvest_harmony?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
```

#### Option B: Whitelist Your IP in MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Navigate to Network Access
3. Click "Add IP Address"
4. Add your current IP or use `0.0.0.0/0` (testing only)

#### Option C: Use Local MongoDB
Install MongoDB locally and update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/harvest_harmony
```

### Step 2: Seed the Database

Once MongoDB connection works, populate it with data:
```bash
npm run seed
```

### Step 3: Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will be available at: http://localhost:3000

### Step 4: Test the Application

1. Open browser to `http://localhost:3000`
2. You should see your Harvest Harmony interface
3. Test booking a machine (data will save to MongoDB)
4. Check operator dashboard to see requests

## 🔧 Available Commands

```bash
npm start          # Start server (production mode)
npm run dev        # Start with auto-reload (development)
npm run seed       # Populate database with sample data
```

## 📊 API Endpoints

All endpoints are prefixed with `/api`

### Machines
- `GET /api/machines` - List all machines
- `GET /api/machines/:id` - Get one machine
- `GET /api/machines/status/available` - Available machines only
- `POST /api/machines` - Create new machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get one booking
- `GET /api/bookings/status/:status` - Filter by status
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update status
- `GET /api/bookings/stats/earnings` - Get earnings

### Health Check
- `GET /api/health` - Server and DB status

## 🧪 Testing API Endpoints

### Using Browser
Visit: `http://localhost:3000/api/machines`

### Using PowerShell
```powershell
# Get all machines
Invoke-RestMethod -Uri http://localhost:3000/api/machines -Method Get

# Health check
Invoke-RestMethod -Uri http://localhost:3000/api/health -Method Get
```

### Using VS Code Extension
Install "Thunder Client" or "REST Client" extension for VS Code

## 🎨 Frontend Modes

Your project has two frontend versions:

1. **Local Mode** (`script.js`) - Works with JSON files, no backend needed
2. **API Mode** (`script-api.js`) - Connects to MongoDB backend (currently active)

To switch modes, edit `index.html` line ~766:
```html
<!-- API Mode (current) -->
<script src="script-api.js"></script>

<!-- Local Mode (fallback) -->
<script src="script.js"></script>
```

## ⚠️ Current Status

✅ Node.js backend installed  
✅ Express server configured  
✅ MongoDB models created  
✅ API routes implemented  
✅ Frontend updated for API  
⚠️ MongoDB connection has SSL issue (needs fixing)  

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Try: `npm install` again

### MongoDB connection fails  
- See `MONGODB_TROUBLESHOOTING.md`
- Check your internet connection
- Verify MongoDB Atlas credentials

### Frontend not updating
- Clear browser cache (Ctrl + F5)
- Check browser console for errors
- Verify server is running

### API returns errors
- Check server terminal for logs
- Verify MongoDB connection is active
- Test health endpoint: `/api/health`

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [REST API Best Practices](https://restfulapi.net/)

## 🎓 What You Learned

You now have:
- ✅ Full-stack JavaScript application
- ✅ RESTful API architecture
- ✅ MongoDB database integration
- ✅ Environment variable management
- ✅ MVC pattern (Models, Views, Controllers)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Async/await with Promises
- ✅ Error handling
- ✅ API endpoints design

## 🚀 Next Enhancements

Consider adding:
- User authentication (JWT)
- File uploads for machine photos
- Payment integration
- Email notifications
- Real-time updates (Socket.io)
- Admin dashboard
- Rate limiting
- Data validation with Joi
- Unit tests with Jest
- Deployment to cloud (Heroku, Vercel, AWS)

---

**Need help?** Check the README.md for detailed documentation!
