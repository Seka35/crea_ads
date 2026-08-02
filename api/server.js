require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { generateSkeleton, generateBucket } = require('./controllers/generate');
const { generateImage } = require('./controllers/images');

const app = express();

const { getHistory, getHistoryById, saveHistory, deleteHistory } = require('./controllers/history');



const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth Middleware (protects /api endpoints)
const checkAuth = (req, res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/uploads')) {
    const authHeader = req.headers.authorization;
    if (authHeader !== process.env.PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }
  }
  next();
};
app.use(checkAuth);

app.get('/api/history', (req, res) => {
  res.json(getHistory());
});

app.get('/api/history/:id', (req, res) => {
  const item = getHistoryById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/history', (req, res) => {
  const saved = saveHistory(req.body);
  res.json({ success: true, id: saved.id });
});

app.delete('/api/history/:id', (req, res) => {
  deleteHistory(req.params.id);
  res.json({ success: true });
});

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
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
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

app.post('/api/generate-skeleton', async (req, res) => {
  try {
    const skeleton = await generateSkeleton(req.body);
    res.json({ skeleton });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Skeleton generation failed', details: error.message });
  }
});

app.post('/api/generate-bucket', async (req, res) => {
  try {
    const { formData, category } = req.body;
    const bucket = await generateBucket(formData, category);
    res.json(bucket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bucket generation failed', details: error.message });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, input_urls } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Image generation failed', details: 'Prompt manquant. L\'IA n\'a pas généré de description pour cette image.' });
    }
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
