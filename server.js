const express = require('express');
const mongoose = require('mongoose');

const fetchVenueData = require('./modules/fetchVenueData');

const app = express();

// Allow all frontend (no cors package needed)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/project')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favourites: [{ type: String }]  // venueId strings
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Venue
const venueSchema = new mongoose.Schema({
  venueId: { type: String, required: true, unique: true },
  nameEn: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  addressEn: String,
  district: String
});
const Venue = mongoose.models.Venue || mongoose.model('Venue', venueSchema);

// Event
const eventSchema = new mongoose.Schema({
  titleEn: { type: String, required: true },
  venueId: { type: String, required: true },
  venueName: { type: String, required: true },
  dateTime: { type: String, required: true },
  description: String,
  presenterEn: { type: String, required: false }
});
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// Comment
const commentSchema = new mongoose.Schema({
  venueId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

// SEED DATA (10 venues)

const seedData = {
  venues: [
    { 
        venueId: "35510044", 
        nameEn: "Kwai Tsing Theatre Auditorium", 
        latitude: 22.3678, longitude: 114.1342, 
        addressEn: "12 Hing Ning Road, Kwai Chung", 
        district: "Kwai Tsing", 
        events: [
            {titleEn:"Plastic Island",dateTime:"30-31 Jan 2026",presenterEn:"Free-To-Play"},
            {titleEn:"Mask Theatre",dateTime:"1 Feb 2026",presenterEn:"LCSD"},
            {titleEn:"Family Comedy",dateTime:"Feb 2026",presenterEn:"Local Group"}
        ] 
    },
    { 
        venueId: "87810041", 
        nameEn: "Yuen Long Theatre Auditorium", 
        latitude: 22.4450, longitude: 114.0270, 
        addressEn: "9 Yuen Long Tai Yuk Road", 
        district: "Yuen Long", 
        events: [
            {titleEn:"Christmas Concert 2025",dateTime:"20 Dec 2025",presenterEn:"Cozy Chamber Choir"},
            {titleEn:"NHKP Youth String Orchestra Christmas Concert",dateTime:"21 Dec 2025",presenterEn:"New Hong Kong Philharmonia"},
            {titleEn:"Pop Music for the Christmas",dateTime:"18 Dec 2025",presenterEn:"The Dream of Music"}
        ] 
    },
    { 
        venueId: "50110014", 
        nameEn: "Hong Kong City Hall Concert Hall", 
        latitude: 22.2828, longitude: 114.1614, 
        addressEn: "5 Edinburgh Place, Central", 
        district: "Central", 
        events: [
            {titleEn:"Handel’s Messiah",dateTime:"14 Dec 2025",presenterEn:"Oratorio Society"},
            {titleEn:"Christmas Concert",dateTime:"Dec 2025",presenterEn:"Philharmonic"},
            {titleEn:"New Year Gala",dateTime:"1 Jan 2026",presenterEn:"LCSD"}
        ] 
    },
    { 
        venueId: "826817417", 
        nameEn: "HK Cultural Centre Grand Theatre", 
        latitude: 22.2934, longitude: 114.1700, 
        addressEn: "10 Salisbury Road, TST", 
        district: "Yau Tsim Mong", 
        events: [
            {titleEn:"Storyville Mosquito",dateTime:"6-7 Feb 2026",presenterEn:"Kid Koala"},
            {titleEn:"Puppet Festival",dateTime:"Feb 2026",presenterEn:"LCSD"},
            {titleEn:"Multi-media Show",dateTime:"Jan 2026",presenterEn:"International"}
        ] 
    },
    { 
        venueId: "76810048", 
        nameEn: "Sha Tin Town Hall Activities Hall", 
        latitude: 22.3780, longitude: 114.1890, 
        addressEn: "1 Yuen Wo Road, Sha Tin", 
        district: "Sha Tin", 
        events: [
            {titleEn:"YOAH by Cirquework",dateTime:"23-25 Jan 2026",presenterEn:"Japan"},
            {titleEn:"Backstage Tour",dateTime:"Jan 2026",presenterEn:"LCSD"},
            {titleEn:"Circus Night",dateTime:"Jan 2026",presenterEn:"Arts"}
        ] 
    },
    { 
        venueId: "87310051", 
        nameEn: "Tuen Mun Town Hall Auditorium", 
        latitude: 22.3908, 
        longitude: 113.9764, 
        addressEn: "3 Tuen Hi Road, Tuen Mun",
        district: "Tuen Mun", 
        events: [
            {titleEn:"Dance Competition",dateTime:"15-16 Dec 2025",presenterEn:"District"},
            {titleEn:"Youth Dance",dateTime:"Dec 2025",presenterEn:"LCSD"},
            {titleEn:"School Final",dateTime:"Dec 2025",presenterEn:"Education"}
        ] 
    },
    { 
        venueId: "87410028", 
        nameEn: "North District Town Hall Auditorium", 
        latitude: 22.4960, 
        longitude: 114.1410, 
        addressEn: "2 Lung Wan Street, Sheung Shui", 
        district: "North", 
        events: [
            {titleEn:"Youth Theatre Show",dateTime:"26-28 Dec 2025",presenterEn:"Youth Group"},
            {titleEn:"Teen Drama",dateTime:"Dec 2025",presenterEn:"Local"},
            {titleEn:"Anniversary",dateTime:"2025",presenterEn:"CFSC"}
        ] 
    },
    { 
        venueId: "76810050", 
        nameEn: "Sha Tin Town Hall Exhibition Gallery", 
        latitude: 22.3780, 
        longitude: 114.1890, 
        addressEn: "1 Yuen Wo Road, Sha Tin", 
        district: "Sha Tin", 
        events: [
            {titleEn:"Chinese Painting",dateTime:"4-10 Jan 2026",presenterEn:"Association"},
            {titleEn:"Ink Art",dateTime:"Jan 2026",presenterEn:"Artists"},
            {titleEn:"Calligraphy",dateTime:"Jan 2026",presenterEn:"Sha Tin"}
        ] 
    },
    { 
        venueId: "87030035", 
        nameEn: "Tsuen Wan Town Hall Auditorium", 
        latitude: 22.3718, longitude: 114.1160, 
        addressEn: "72 Tai Ho Road, Tsuen Wan", 
        district: "Tsuen Wan", 
        events: [
            {titleEn:"Arts Festival",dateTime:"Jan 2026",presenterEn:"LCSD"},
            {titleEn:"Cantonese Opera",dateTime:"Jan 2026",presenterEn:"Troupe"},
            {titleEn:"Community Dance",dateTime:"Jan 2026",presenterEn:"Local"}
        ] 
    },
    { 
        venueId: "87810042", 
        nameEn: "Yuen Long Theatre Lecture Room", 
        latitude: 22.4450, 
        longitude: 114.0270, 
        addressEn: "9 Yuen Long Tai Yuk Road", 
        district: "Yuen Long", 
        events: [
            {titleEn:"Ethnic Dance",dateTime:"10 Jan 2026",presenterEn:"Dance Group"},
            {titleEn:"Cantonese Music",dateTime:"31 Jan 2026",presenterEn:"Opera"},
            {titleEn:"Cultural Show",dateTime:"Jan 2026",presenterEn:"Community"}
        ] 
    }
  ]
};
async function seedDatabase() {
  await Venue.deleteMany({});
  await Event.deleteMany({});
  await User.deleteMany({});
  
  await User.create([
    { username: 'user', password: '123456', role: 'user', favourites: [] },
    { username: 'admin', password: 'admin123', role: 'admin', favourites: [] }
  ]);

  const venueData = await fetchVenueData() || seedData;

  for (const v of venueData.venues) {
    await new Venue(v).save();
    for (const e of v.events) {
      await new Event({ ...e, venueId: v.venueId, venueName: v.nameEn }).save();
    }
  }

  console.log('Database seeded');
}

// ONE-TIME SEED ROUTE: reset all database into original
app.get('/seed', async (req, res) => {
  try {
    // await mongoose.connection.db.dropDatabase();
    await seedDatabase();
    res.send('<h1>SEED SUCCESSFUL!</h1><p>10 venues + events + accounts ready<br>Last updated: 2025-12-09</p>');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ALL API ROUTES 

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  user ? res.json({ success: true, user: { username: user.username, role: user.role } })
       : res.status(401).json({ success: false });
});

app.get('/api/venues', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const venues = await Venue.find().skip(offset).limit(limit);
  const counts = await Event.aggregate([{ $group: { _id: '$venueId', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));
  const result = venues.map(v => ({ ...v.toObject(), eventCount: countMap[v.venueId] || 0 }));
  res.json(result);
});

// Find particular venueId
app.get('/api/events/:venueId', async (req, res) => {
  res.json(await Event.find({ venueId: req.params.venueId }));
});

// Find particular comments
app.get('/api/comments/:venueId', async (req, res) => {
  res.json(await Comment.find({ venueId: req.params.venueId }).sort({ createdAt: -1 }));
});

// Add a new comments
app.post('/api/comments', async (req, res) => {
  const c = new Comment(req.body);
  await c.save();
  res.json(c);                     
});

// Update on favourite
app.post('/api/favourite', async (req, res) => {
  await User.updateOne({ username: req.body.username }, { $addToSet: { favourites: req.body.venueId } });
  res.json({ success: true });
});

app.delete('/api/favourite', async (req, res) => {
  try {
    const { username, venueId } = req.body;

    if (!username || !venueId) {
      return res.status(400).json({ error: 'username and venueId are required' });
    }

    const result = await User.updateOne(
      { username },
      { $pull: { favourites: venueId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Favourite not found or already removed' });
    }

    res.json({ success: true, message: 'Removed from favourites' });
  } catch (err) {
    console.error('Delete favourite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/favourites/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.json([]);
  res.json(await Venue.find({ venueId: { $in: user.favourites } }));
});

// Find, add, delete particular events
app.get('/api/admin/events', async (req, res) => res.json(await Event.find()));
app.post('/api/admin/events', async (req, res) => res.json(await new Event(req.body).save()));
app.put('/api/admin/events/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/admin/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Find and update on user account
app.get('/api/admin/users', async (req, res) => res.json(await User.find().select('-password')));
app.post('/api/admin/users', async (req, res) => res.json(await new User(req.body).save()));
app.delete('/api/admin/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
app.put('/api/admin/users/:id', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username is taken by someone else
    if (username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Update fields
    user.username = username;
    user.role = role || user.role;

    // Only update password if provided
    if (password) {
      user.password = password; // this will be hashed by your pre-save hook
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

let currentTime = new Date(Date.now());
app.get('/api/last-updated', (req, res) => res.json({ lastUpdated: currentTime }));

// Start server
app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});
