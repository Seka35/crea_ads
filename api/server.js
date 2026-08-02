require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { generateTextPipeline } = require('./controllers/generate');
const { generateImage } = require('./controllers/images');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware (protects /api endpoints)
const checkAuth = (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const authHeader = req.headers.authorization;
    if (authHeader !== process.env.PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }
  }
  next();
};
app.use(checkAuth);

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { files: 16, fileSize: 5 * 1024 * 1024 } });

// Serve uploads publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.post('/api/upload', upload.array('images', 16), (req, res) => {
  try {
    const files = req.files;
    const urls = files.map(file => `${BASE_URL}/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-text', async (req, res) => {
  try {
    const result = await generateTextPipeline(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Text generation failed', details: error.message });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, input_urls } = req.body;
    const resultUrl = await generateImage(prompt, input_urls);
    res.json({ url: resultUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image generation failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public uploads accessible via ${BASE_URL}/uploads`);
});
