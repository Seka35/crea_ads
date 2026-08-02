require('dotenv').config();
const { generateImage } = require('./controllers/images');
const { generateTextPipeline } = require('./controllers/generate');

async function testAPIs() {
  console.log("=== API INTERNAL TESTER ===\n");
  
  if (!process.env.MINIMAX_API_KEY || !process.env.KIE_API_KEY) {
    console.log("❌ ERREUR: Les clés API manquent dans le fichier .env !");
    console.log("Créez un fichier .env avec MINIMAX_API_KEY et KIE_API_KEY avant de tester.");
    return;
  }

  try {
    console.log("1️⃣ Test MiniMax-M2.7 (Texte)...");
    const mockData = {
      productName: "Test Product",
      category: "Software",
      niche: "Developers",
      currency: "$",
      price: "10",
      aiStrategy: "neutral",
      awarenessLevel: "unaware",
      adsPerCategory: 1
    };
    
    // We'll just call the pipeline directly. Note: it might take 15-30 seconds.
    const textResult = await generateTextPipeline(mockData);
    console.log("✅ MiniMax a répondu avec succès ! Skeleton récupéré.");
    
  } catch (e) {
    console.log("❌ Test MiniMax échoué:", e.message);
  }

  try {
    console.log("\n2️⃣ Test KIE (Image)...");
    const testPrompt = "A beautiful sunset over a retro synthwave city, 2K resolution";
    // Using empty input_urls for test
    const imgResult = await generateImage(testPrompt, []);
    console.log("✅ KIE a répondu avec succès ! URL de l'image:", imgResult);
  } catch (e) {
    console.log("❌ Test KIE échoué:", e.message);
  }

  console.log("\n=== TEST TERMINÉ ===");
}

testAPIs();
