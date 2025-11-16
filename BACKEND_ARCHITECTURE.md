# 🏗️ Backend Architecture - Harvest Harmony

## 📊 MongoDB Database

### What is MongoDB?
MongoDB is a **NoSQL document database** that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional SQL databases with tables and rows, MongoDB uses collections and documents.

### What MongoDB is Storing in This Project:

#### 1. **Machines Collection** (`machines`)
Stores all agricultural machinery information:
```javascript
{
  _id: ObjectId("..."),           // Auto-generated unique ID
  id: 1,                           // Custom numeric ID
  name: "Rajesh's Cool Tractor",
  operator: "Rajesh Kumar",
  type: "Tractor",
  price: "₹1200/hour",
  pricePerHour: 1200,
  crop: "Wheat",
  rating: 4.8,                     // Calculated average rating
  available: true,
  location: "Punjab, India",
  experience: "5+ years",
  totalBookings: 0,
  reviews: [                       // Embedded subdocuments
    {
      _id: ObjectId("..."),
      farmerName: "Naman Sir",
      rating: 5,
      comment: "Excellent service!",
      date: ISODate("2024-09-15")
    }
  ]
}
```

**Why MongoDB for Machines:**
- Reviews are embedded inside machine documents (denormalized)
- Fast retrieval of machine + all its reviews in one query
- Easy to calculate and update average ratings
- Flexible schema allows adding new fields without migrations

#### 2. **Bookings Collection** (`bookings`)
Stores all booking requests and their status:
```javascript
{
  _id: ObjectId("..."),
  bookingId: "BK1731734400000-1",  // Auto-generated unique booking ID
  farmerName: "Naman Sir",
  phone: "+91 98765 43210",
  email: "naman@example.com",
  machineId: 1,                     // References machine by id
  machineName: "Rajesh's Cool Tractor",
  date: "2024-09-16",
  startTime: "08:00 AM",
  endTime: "10:00 AM",
  duration: "2 hours",
  location: "Happy Farm Village, Gujarat",
  crop: "Wheat",
  fieldSize: 10,
  fieldSizeUnit: "acres",
  amount: 2400,
  status: "pending",                // pending | accepted | rejected | completed
  paymentStatus: "unpaid",
  notes: "Please arrive early",
  createdAt: ISODate("2024-09-15"),
  updatedAt: ISODate("2024-09-15")
}
```

**Why MongoDB for Bookings:**
- Easy to filter by status (pending, accepted, completed)
- Timestamps automatically managed
- Can add new booking fields without schema changes
- Fast queries for operator earnings calculations

#### 3. **Favorites Collection** (`favorites`)
Stores which farmers have favorited which machines:
```javascript
{
  _id: ObjectId("..."),
  farmerName: "Naman Sir",
  farmerPhone: "+91 98765 43210",
  machineId: 1,
  machineName: "Rajesh's Cool Tractor",
  createdAt: ISODate("2024-09-15")
}
```

**Unique Index:**
```javascript
{ farmerPhone: 1, machineId: 1 }  // Prevents duplicate favorites
```

**Why MongoDB for Favorites:**
- Simple many-to-many relationship
- Compound unique index prevents duplicates
- Fast lookups by farmer phone number

---

## 🟢 Node.js

### What is Node.js?
Node.js is a **JavaScript runtime** built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server (outside the browser).

### What Node.js Does in This Project:

#### 1. **Runs the Server**
- Executes JavaScript code on the server-side
- Handles multiple requests simultaneously (asynchronous, non-blocking I/O)
- Listens on port 3000 for incoming HTTP requests

#### 2. **Package Management (npm)**
Node.js comes with npm (Node Package Manager) which manages all dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",         // Web framework
    "mongoose": "^8.0.0",         // MongoDB ODM
    "cors": "^2.8.5",            // Cross-origin requests
    "dotenv": "^16.3.1"          // Environment variables
  }
}
```

#### 3. **Environment Variables**
Reads `.env` file to keep sensitive data secure:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/harvest_harmony
PORT=3000
```

#### 4. **Module System**
Imports and exports code across files:
```javascript
const express = require('express');
const Machine = require('./models/Machine');
module.exports = router;
```

---

## 🚀 Express.js

### What is Express.js?
Express is a **minimal and flexible Node.js web application framework** that provides a robust set of features for web and mobile applications. It's built on top of Node.js.

### What Express.js Does in This Project:

#### 1. **Server Setup & Middleware**
```javascript
const express = require('express');
const app = express();

// Middleware stack
app.use(cors());                          // Enable cross-origin requests
app.use(express.json());                  // Parse JSON request bodies
app.use(express.static('public'));        // Serve static files
```

#### 2. **Routing System**
Express handles all HTTP requests and routes them to appropriate handlers:

**Machine Routes** (`/api/machines`)
```javascript
GET    /api/machines              // Get all machines
GET    /api/machines/:id          // Get specific machine
POST   /api/machines              // Create new machine
PUT    /api/machines/:id          // Update machine
DELETE /api/machines/:id          // Delete machine
POST   /api/machines/:id/reviews  // Add review to machine
DELETE /api/machines/:id/reviews/:reviewId  // Delete review
```

**Booking Routes** (`/api/bookings`)
```javascript
GET    /api/bookings                     // Get all bookings
GET    /api/bookings/:id                 // Get specific booking
POST   /api/bookings                     // Create new booking
PATCH  /api/bookings/:id/status          // Update booking status
GET    /api/bookings/stats/earnings      // Get earnings statistics
```

**Favorites Routes** (`/api/favorites`)
```javascript
GET    /api/favorites/farmer/:phone      // Get farmer's favorites
POST   /api/favorites                    // Add to favorites
DELETE /api/favorites                    // Remove from favorites
```

#### 3. **Request/Response Handling**
Express makes it easy to handle HTTP requests:
```javascript
// Example: Create a booking
router.post('/', async (req, res) => {
    try {
        const booking = new Booking(req.body);  // Get data from request
        await booking.save();                    // Save to MongoDB
        res.status(201).json(booking);          // Send response
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
```

#### 4. **Error Handling**
Catches errors and sends appropriate HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

#### 5. **Serves the Frontend**
```javascript
app.use(express.static(__dirname));  // Serves index.html, style.css, script.js
```

---

## 🔄 How They Work Together

### Request Flow Example: "Write a Review"

1. **Frontend (Browser)**
   ```javascript
   // User clicks "Submit Review"
   fetch('http://localhost:3000/api/machines/1/reviews', {
       method: 'POST',
       body: JSON.stringify({
           farmerName: "Naman Sir",
           rating: 5,
           comment: "Great machine!"
       })
   })
   ```

2. **Express.js (Node.js Server)**
   ```javascript
   // Routes the request to the correct handler
   router.post('/:id/reviews', async (req, res) => {
       // Express provides req.params.id = "1"
       // Express parsed req.body = { farmerName, rating, comment }
   ```

3. **Mongoose (MongoDB Driver)**
   ```javascript
   // Finds the machine in MongoDB
   const machine = await Machine.findOne({ id: 1 });
   
   // Adds review to machine's reviews array
   machine.reviews.push(req.body);
   
   // Recalculates average rating
   machine.updateRating();
   
   // Saves back to MongoDB
   await machine.save();
   ```

4. **MongoDB**
   - Updates the document in the `machines` collection
   - Adds the review to the `reviews` array
   - Updates the `rating` field

5. **Response Back to Frontend**
   ```javascript
   res.status(201).json(machine);  // Express sends success response
   ```

6. **Frontend Updates UI**
   ```javascript
   await fetchMachines();  // Re-fetch all machines
   showFarmerView('bookings');  // Refresh the view
   ```

---

## 🔐 MongoDB Connection

### Connection String
```javascript
mongodb+srv://newearntry406_db_user:jR06mnRUqsbtn3Ud@cluster0.5setvcp.mongodb.net/harvest_harmony?tls=true&tlsAllowInvalidCertificates=true
```

**Parts:**
- `mongodb+srv://` - Protocol (SRV record for cluster discovery)
- `newearntry406_db_user` - Database username
- `jR06mnRUqsbtn3Ud` - Database password
- `cluster0.5setvcp.mongodb.net` - MongoDB Atlas cluster hostname
- `harvest_harmony` - Database name
- `?tls=true&tlsAllowInvalidCertificates=true` - SSL/TLS options

### Mongoose Connection
```javascript
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
});
```

---

## 📦 Data Seeding

### `seed.js` Script
Populates MongoDB with initial data:
```javascript
// Clears existing data
await Machine.deleteMany({});
await Booking.deleteMany({});

// Inserts sample data
await Machine.insertMany(machinesData);
await Booking.insertMany(bookingsData);
```

Run with: `npm run seed`

---

## 🎯 Key Benefits of This Stack

### Why MongoDB?
- ✅ Flexible schema (no migrations needed)
- ✅ Fast for read-heavy applications
- ✅ Easy to embed related data (reviews in machines)
- ✅ JSON-like documents match JavaScript objects
- ✅ Horizontal scaling capability

### Why Node.js?
- ✅ Same language (JavaScript) for frontend and backend
- ✅ Non-blocking I/O (handles many requests efficiently)
- ✅ Huge ecosystem of packages (npm)
- ✅ Fast execution with V8 engine
- ✅ Real-time capabilities (WebSockets, etc.)

### Why Express.js?
- ✅ Minimal and unopinionated
- ✅ Simple routing system
- ✅ Middleware support for extensibility
- ✅ Large community and documentation
- ✅ Easy to learn and use

---

## 📊 Database Statistics

Current collections:
- **Machines**: 6 documents
- **Bookings**: 3 documents  
- **Favorites**: Variable (depends on user actions)

Total storage: ~50KB (with embedded reviews)

---

## 🔧 Environment Setup

### Required Files:
1. **`.env`** - Environment variables
2. **`package.json`** - Dependencies and scripts
3. **`server.js`** - Main server file
4. **`models/`** - MongoDB schemas
5. **`routes/`** - Express API endpoints

### Running the Project:
```bash
npm install          # Install dependencies
npm run seed         # Seed database (optional)
npm start           # Start server on port 3000
```

Access: `http://localhost:3000`

---

## 🎓 Summary

**MongoDB** = Database (stores all data)
**Node.js** = Runtime (runs JavaScript on server)
**Express.js** = Framework (handles HTTP requests/routing)

Together they create a powerful, modern backend that:
- Stores data persistently
- Provides RESTful API endpoints
- Handles business logic
- Serves the frontend application
- Manages user interactions

This is a **MERN stack** (minus React - using Vanilla JS instead):
**M**ongoDB + **E**xpress + ~~**R**eact~~ + **N**ode.js ✨
