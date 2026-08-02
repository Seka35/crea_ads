require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { generateSkeleton, generateBucket } = require('./controllers/generate');
const { generateImage } = require('./controllers/images');
const { getHistory, getHistoryById, saveHistory, deleteHistory } = require('./controllers/history');
const { 
  getClients, 
  getClientById, 
  getClientByCredentials, 
  saveClient, 
  deleteClient, 
  getClientHistory, 
  saveClientCreative 
} = require('./controllers/clients');

const app = express();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { files: 16, fileSize: 10 * 1024 * 1024 } });

// Serve uploads publicly
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public Auth Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check Admin Master Password
  if (password === process.env.PASSWORD || (!username && password === process.env.PASSWORD)) {
    return res.json({ role: 'admin', token: process.env.PASSWORD });
  }

  // Check Client credentials
  if (username && password) {
    const client = getClientByCredentials(username, password);
    if (client) {
      return res.json({ role: 'client', token: `client_${client.id}`, client });
    }
  }

  return res.status(401).json({ error: 'Identifiants invalides' });
});

// Auth Middleware (protects /api endpoints except uploads & login)
const checkAuth = (req, res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/uploads') && !req.path.startsWith('/api/login')) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing password' });
    }
    if (authHeader === process.env.PASSWORD || authHeader.startsWith('client_')) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid password' });
  }
  next();
};
app.use(checkAuth);

// Admin History Routes
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

// General File Upload Route
app.post('/api/upload', upload.array('images', 16), (req, res) => {
  try {
    const files = req.files;
    const urls = files.map(file => `${BASE_URL}/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client Management Routes (Admin)
app.get('/api/clients', (req, res) => {
  res.json(getClients());
});

app.get('/api/clients/:id', (req, res) => {
  const client = getClientById(req.params.id);
  if (client) {
    res.json(client);
  } else {
    res.status(404).json({ error: 'Client non trouvé' });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const saved = saveClient(req.body);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client Portal Routes
app.get('/api/client-history/:clientId', (req, res) => {
  try {
    const history = getClientHistory(req.params.clientId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/client-generate', async (req, res) => {
  try {
    const { clientId, promptInput, isPostMode, price, currency, aspectRatio } = req.body;
    
    if (!clientId) {
      return res.status(400).json({ error: 'clientId required' });
    }
    
    const client = getClientById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Combine Client preset settings + User prompt input
    const formData = {
      productName: client.name || 'Product',
      category: client.category || 'General',
      niche: client.niche || 'Target audience',
      price: price || client.price || '47',
      currency: currency || client.currency || '$',
      aiStrategy: client.aiStrategy || 'neutral',
      awarenessLevel: client.awarenessLevel || 'solution_aware',
      uniqueMechanism: client.uniqueMechanism || '',
      bigIdea: promptInput ? `${client.defaultPrompt ? client.defaultPrompt + '\n' : ''}${promptInput}` : (client.bigIdea || client.defaultPrompt || ''),
      adsPerCategory: 1,
      isPostMode: !!isPostMode
    };

    // Generate Creative copy (Headline, Primary Text, Text Overlay) using LLM
    const category = client.categorySelection && client.categorySelection !== 'all' 
      ? client.categorySelection 
      : (isPostMode ? 'organic_native' : 'solution_aware');
    const bucket = await generateBucket(formData, category);

    const staticAd = (bucket.static_ads && bucket.static_ads.length > 0) ? bucket.static_ads[0] : {
      id: `client_ad_${Date.now()}`,
      angle: category,
      format: 'Static',
      visual_style: 'Professional modern creative',
      hero_element: client.name,
      text_overlay: {
        hook_line: promptInput ? promptInput.substring(0, 40) : client.name,
        support_line: isPostMode ? '' : `${formData.currency}${formData.price}`
      },
      prompt: `High converting professional social media post visual for ${client.name}. ${promptInput || ''}. Clean modern graphic design.`,
      primary_text: promptInput ? `${promptInput}\n\nDiscover our exclusive offer.` : `Discover the latest from ${client.name}!`,
      headline: promptInput ? promptInput.split('.')[0].substring(0, 50) : client.name
    };

    // Overlay text preparation
    let overlayText = typeof staticAd.text_overlay === 'string' ? staticAd.text_overlay : (staticAd.text_overlay?.hook_line || '');
    if (!isPostMode && formData.price) {
      overlayText += ` - ${formData.currency}${formData.price}`;
    }

    const fullImagePrompt = `${staticAd.prompt} IMPORTANT: You must write this exact text typography prominently in the image: "${overlayText}". Place the text in the upper or center area of the image ONLY — never in the bottom third.`;

    // Input reference images
    const inputUrls = client.referenceImages && client.referenceImages.length > 0 ? client.referenceImages : [];

    // Generate the Image using KIE API with selected aspect ratio
    const imageUrl = await generateImage(fullImagePrompt, inputUrls, aspectRatio || "1:1");

    // Save to Client History
    const historyItem = saveClientCreative({
      clientId,
      creative: staticAd,
      imageUrl,
      aspectRatio: aspectRatio || "1:1",
      isPostMode: !!isPostMode,
      price: formData.price,
      currency: formData.currency,
      promptInput,
      clientLogoUrl: client.logoUrl,
      clientInstaHandle: client.instaHandle
    });

    res.json({
      success: true,
      item: historyItem
    });

  } catch (error) {
    console.error("Client Generate Error:", error);
    res.status(500).json({ error: error.message || 'Client generation failed' });
  }
});

// General Pipeline endpoints
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
    const { prompt, input_urls, aspect_ratio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Image generation failed', details: 'Missing prompt.' });
    }
    const resultUrl = await generateImage(prompt, input_urls, aspect_ratio || "1:1");
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
