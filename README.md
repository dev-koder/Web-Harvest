# Harvest Harmony 🚜🌾

An agricultural machinery rental platform built with Node.js, Express.js, and MongoDB.

## Features

- 🌾 Browse and search agricultural machinery
- 📅 Book machines with specific time slots
- 👨‍🌾 Farmer dashboard to manage bookings
- 🔧 Operator dashboard to handle requests
- 💰 Earnings tracking and analytics
- 📊 Real-time availability status

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud-hosted on MongoDB Atlas)
- **API**: RESTful API with CRUD operations

## Project Structure

```
Web_harvest/
├── models/              # Mongoose schemas
│   ├── Machine.js       # Machine model
│   └── Booking.js       # Booking model
├── routes/              # API routes
│   ├── machines.js      # Machine endpoints
│   └── bookings.js      # Booking endpoints
├── index.html           # Main HTML file
├── style.css            # Styles
├── script.js            # Original frontend script
├── script-api.js        # API-integrated frontend script
├── server.js            # Express server
├── seedDatabase.js      # Database seeding script
├── package.json         # Dependencies
├── .env                 # Environment variables (not in git)
├── .gitignore          # Git ignore file
├── machines.json        # Sample machine data
└── bookings.json        # Sample booking data
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- express
- mongoose
- cors
- dotenv
- body-parser
- nodemon (dev dependency)

### 2. Environment Configuration

The `.env` file is already configured with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://newearntry406_db_user:jR06mnRUqsbtn3Ud@cluster0.5setvcp.mongodb.net/harvest_harmony?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=development
```

### 3. Seed the Database

Populate MongoDB with initial data from JSON files:

```bash
npm run seed
```

This will:
- Clear existing data
- Insert machines from `machines.json`
- Insert bookings from `bookings.json`

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

### 5. Update Frontend to Use API

To use the API-integrated version, update `index.html` to use `script-api.js` instead of `script.js`:

Change:
```html
<script src="script.js"></script>
```

To:
```html
<script src="script-api.js"></script>
```

## API Endpoints

### Machines

- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get specific machine
- `GET /api/machines/status/available` - Get available machines
- `POST /api/machines` - Create new machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `PATCH /api/machines/:id/availability` - Update availability

### Bookings

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get specific booking
- `GET /api/bookings/status/:status` - Get bookings by status
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/stats/earnings` - Get earnings statistics

### Health Check

- `GET /api/health` - Check API and database status

## Usage

1. **Access the application** at `http://localhost:3000`

2. **As a Farmer:**
   - Browse available machines
   - Search by name, operator, or crop type
   - Book machines with specific time slots
   - Track booking status

3. **As an Operator:**
   - View pending booking requests
   - Accept or reject bookings
   - Track earnings (daily, monthly, total)

## Database Schema

### Machine Model
```javascript
{
  name: String (required),
  operator: String (required),
  type: String (enum: Tractor, Harvester, Thresher, Seeder),
  price: String,
  pricePerHour: Number,
  crop: String,
  rating: Number (0-5),
  available: Boolean,
  description: String,
  image: String,
  location: String,
  experience: String
}
```

### Booking Model
```javascript
{
  farmerName: String (required),
  phone: String (required),
  location: String (required),
  date: String (required),
  startTime: String (required),
  endTime: String (required),
  duration: String,
  machineId: Number (required),
  machineName: String (required),
  crop: String,
  amount: Number,
  status: String (enum: pending, accepted, rejected, completed)
}
```

## Development Tips

- Use `nodemon` for auto-reload during development
- Check MongoDB connection in logs when starting server
- Use the health check endpoint to verify API status
- Test API endpoints with tools like Postman or Thunder Client

## Notes

- The original `script.js` works with local JSON files (offline mode)
- The new `script-api.js` integrates with the MongoDB backend
- Ensure MongoDB Atlas connection is active for the API to work
- The `.gitignore` file prevents committing `node_modules` and `.env`

## Future Enhancements

- User authentication and authorization
- Payment gateway integration
- Real-time notifications
- Machine availability calendar
- Review and rating system
- Admin dashboard
- Mobile app version

---

Built with ❤️ for farmers and agricultural machinery operators
