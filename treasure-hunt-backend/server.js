// Render-optimized backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Atlas connection (cloud database)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/treasure_hunt');

// File upload configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${req.body.teamCode}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Models (inline for simplicity)
const Team = mongoose.model('Team', {
  teamCode: String,
  teamName: String,
  assignedRoute: [Number],
  currentClueIndex: { type: Number, default: 0 }
});

const QRCode = mongoose.model('QRCode', {
  qrCodeId: Number,
  location: String,
  questions: [{
    questionId: String,
    text: String,
    answer: String
  }]
});

// API Routes
app.post('/api/teams/login', async (req, res) => {
  const team = await Team.findOne({ teamCode: req.body.teamCode });
  if (team) {
    res.json({ success: true, data: team });
  } else {
    res.status(404).json({ error: 'Invalid team code' });
  }
});

app.post('/api/upload/submit-answer', upload.single('photo'), async (req, res) => {
  // Submit answer logic
  res.json({ success: true, message: 'Answer submitted' });
});

// Auto-seed data on startup
app.get('/api/seed', async (req, res) => {
  await Team.create([
    { teamCode: 'TEAM001', teamName: 'Adventure Seekers', assignedRoute: [1, 2, 3] },
    { teamCode: 'TEAM002', teamName: 'Code Breakers', assignedRoute: [2, 3, 1] }
  ]);
  
  await QRCode.create([
    {
      qrCodeId: 1,
      location: 'Library',
      questions: [{ questionId: 'q1', text: 'What year was this built?', answer: '1925' }]
    }
  ]);
  
  res.json({ message: 'Data seeded successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

