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
        nameEn: "Tai Po Civic Centre", 
        latitude: 22.45175, longitude: 114.16815, 
        addressEn: "12 On Pong Road", 
        district: "Tai Po", 
        events: [
            {titleEn:"Non-verbal full mask theatre Plastic Island",dateTime:"30-31 Jan 2026",presenterEn:"Free-To-Play"},
            {titleEn:"Tai Po Civic Centre Fun Day: Toolbox Percussion Demonstration Performance and Workshop",dateTime:"10 Jan 2026",presenterEn:"PVO(NTE) - MDA"},
            {titleEn:"Tai Po Civic Centre Celebration Programme: The Salvation Army Tai Po Integrated Service for Young People — Busking Performance",dateTime:"17 Jan 2026",presenterEn:"PVO(NTE) - MDA"}
        ] 
    },
    { 
        venueId: "87810041", 
        nameEn: "Sheung Wan Civic Centre", 
        latitude: 22.28602 , longitude: 114.14967, 
        addressEn: "345 Queen' s Road Central,", 
        district: "Hong Kong", 
        events: [
            {titleEn:"Christmas Concert 2025",dateTime:"20 Dec 2025",presenterEn:"Cozy Chamber Choir"},
            {titleEn:"NHKP Youth String Orchestra Christmas Concert",dateTime:"21 Dec 2025",presenterEn:"New Hong Kong Philharmonia"},
            {titleEn:"Pop Music for the Christmas",dateTime:"18 Dec 2025",presenterEn:"The Dream of Music"}
        ] 
    },
    { 
        venueId: "87510305", 
        nameEn: "Hong Kong City Hall Concert Hall", 
        latitude: 22.282279, longitude: 114.161545, 
        addressEn: "5 Edinburgh Place, Central", 
        district: "Central", 
        events: [
            {titleEn:"Chinese Painting and Calligraphy Exhibition",dateTime:"26-29 Dec 2025",presenterEn:"Association of Hong Kong Women Artists in Chinese Painting and Calligraphy"},
            {titleEn:"Chinese Painting and Calligraphy Exhibition",dateTime:"26-29 Jan 2026",presenterEn:"Bai Yun Tang Art Associatio"},
            {titleEn:"Exhibition by Hong Kong Fenghua Production",dateTime:"5-8 Jan 2026",presenterEn:"Hong Kong Fenghua Production"}
        ] 
    },
    { 
        venueId: "50110015", 
        nameEn: "HK Cultural Centre Grand Theatre", 
        latitude: 22.29386, longitude: 114.17053, 
        addressEn: "10 Salisbury Road, Tsim Sha Tsui", 
        district: "Yau Tsim Mong", 
        events: [
            {titleEn:"National Ballet of China Giselle",dateTime:"20-21 Jan 2026",presenterEn:"China Performing Arts Agency"},
            {titleEn:"Gala Dance Performance 2026",dateTime:"9-11 Jan 2026",presenterEn:"Tangya Dancing"},
            {titleEn:"National Ballet of China Chinese New Year",dateTime:"20-21 Jan 2026",presenterEn:"China Performing Arts Agency"}
        ] 
    },
    { 
        venueId: "76810048", 
        nameEn: "Tuen Mun Town Hall Auditorium", 
        latitude: 22.391810, longitude: 113.976771, 
        addressEn: "3 Tuen Hi Road, Tuen Mun", 
        district: "Tuen Mun", 
        events: [
            {titleEn:"Tuen Mun District Dance Competition",dateTime:"9 Jan 2026",presenterEn:"Tuen Mun Arts Promotion Association"},
            {titleEn:"Tuen Mun North East Area Committee Variety Show",dateTime:"15 Jan 2026",presenterEn:"Tuen Mun District Office, Home Affairs Department"},
            {titleEn:"Tuen Mun Town Hall Venue Partnership Scheme : Umbrella Story", dateTime:"19-20 Dec 2026",presenterEn:"Arts"}
        ] 
    },
    { 
        venueId: "8268", 
        nameEn: "East Kowloon Cultural Centre", 
        latitude: 22.32427, 
        longitude: 114.21494, 
        addressEn: "60 Ngau Tau Kok Road",
        district: "Hong Kong", 
        events: [
            {titleEn:"Bon Cinéppétit!: Enrichment programme for Food for Thought – A Cinematic Feast",dateTime:"16 Dec 2025 - 18 Jan 2026",presenterEn:"Leisure and Cultural Services Department"},
            {titleEn:"EKCC Opening Season: Incremental Changes by Gerald Peter X Aaron Thier (Austria)",dateTime:"18-19 Dec 2025",presenterEn:"Leisure and Cultural Services Department"},
            {titleEn:"EKCC Opening Season: Just Kid-ing",dateTime:"26 Nov - 19 Dec 2025",presenterEn:"Leisure and Cultural Services Department"},
            {titleEn:"EKCC Opening Season: Passage of Abundance",dateTime:"06 Oct 2025 - 05 Jan 2026",presenterEn:"Leisure and Cultural Services Department"}
          ] 
    },
    { 
        venueId: "3110267", 
        nameEn: "North District Town Hall Auditorium", 
        latitude: 22.501639, 
        longitude: 114.128911, 
        addressEn: "2 Lung Wan Street, Sheung Shui", 
        district: "North", 
        events: [
            {titleEn:"Cantonese Opera Excerpts mixed with Cantonese Operatic Songs Concert",dateTime:"4 Jan 2025",presenterEn:"Kwan Sing Cantonese Operatic Society"},
            {titleEn:"Cantonese Operatic Songs Concert",dateTime:"13 Dec 2025",presenterEn:"Nice Songs Association"},
            {titleEn:"Oldies Concer",dateTime:"14 Jan 2026",presenterEn:"Hey Man Bobby Singing & Dancing Group"}
        ] 
    },
    { 
        venueId: "36310037", 
        nameEn: "Sha Tin Town Hall Exhibition Gallery", 
        latitude: 22.38136, 
        longitude: 114.18990, 
        addressEn: "1 Yuen Wo Road, Sha Tin", 
        district: "Sha Tin", 
        events: [
            {titleEn:"Porcelain Art Exhibitio",dateTime:"20-24 Jan 2026",presenterEn:"Association"},
            {titleEn:"The Eighth of Endless Enthusiasm Painting Exhibition",dateTime:"1,3 Jan 2026",presenterEn:"Art Field"},
            {titleEn:"Shatin Drama Contest 2025/26",dateTime:"29-31 Jan 2026",presenterEn:"Sha Tin Arts Association"}
        ] 
    },
    { 
        venueId: "87610118", 
        nameEn: "Ko Shan Theatre", 
        latitude: 22.31368, longitude: 114.18556, 
        addressEn: "77 Ko Shan Road, Hung Hom", 
        district: "Kowloon", 
        events: [
            {titleEn:"37th Kowloon City District Joint School Concert",dateTime:"20 Dec 2025",presenterEn:"Kowloon City District Children's Chorus"},
            {titleEn:"A Showcase of Guangdong, Hong Kong and Macao Cantonese Opera New Stars 2025",dateTime:"09 Dec 2025",presenterEn:"Guangdong Provincial Department of Culture and Tourism, Culture, Sports and Tourism Bureau of the Hong Kong Special Administrative Region Government, Cultural Affairs Bureau of the Macao Special Administrative Region Government"},
            {titleEn:"Cantonese Opera",dateTime:"24 Dec 2025",presenterEn:"Wai Yuet Cantpnese Opera Society"}
        ] 
    },
    { 
        venueId: "87410030", 
        nameEn: "Ngau Chi Wan Civic Centre Cultural Activities Hall", 
        latitude: 22.334583, 
        longitude: 114.208766, 
        addressEn: "11 Clear Water Bay Road", 
        district: "Kowloon", 
        events: [
            {titleEn:"Drama Performance",dateTime:"12-14 Jan 2026",presenterEn:"Singingholic"},
            {titleEn:"Liyuan Children's Cantonese Opera Presents Filial Piey",dateTime:"31 Jan 2026",presenterEn:"Y&SY Charitable Foundation Limited"},
            {titleEn:"Pop Legend Choral Concert",dateTime:"29 Jan 2026",presenterEn:"Bagatelle"}
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

