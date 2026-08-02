const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

async function callMiniMax(promptContent) {
  if (!MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY not configured");

  const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      messages: [{ role: 'user', content: promptContent }],
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`MiniMax API Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  // Anthropic API format returns content array
  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error("No text content returned from MiniMax");
  }

  // Parse the JSON string out of the response (sometimes it includes markdown fences)
  let rawText = textContent.text;
  if (rawText.includes("```json")) {
    rawText = rawText.split("```json")[1].split("```")[0].trim();
  } else if (rawText.includes("```")) {
    rawText = rawText.split("```")[1].split("```")[0].trim();
  }

  return JSON.parse(rawText);
}

async function generateTextPipeline(formData) {
  // Step 1: Generate Skeleton
  const skeletonPrompt = `
You are producing the SKELETON of a creative brief for Meta Ads.
Output ONLY valid JSON.
Product: ${formData.productName}
Category: ${formData.category}
Niche: ${formData.niche}
${formData.isPostMode ? '' : `Price: ${formData.currency}${formData.price}`}
AI_Strategy: ${formData.aiStrategy}
Awareness_Level: ${formData.awarenessLevel}

Return the exact JSON structure defined in the doc for the Skeleton (strategy, campaign_dna, audiences, hook_map, angle_copy).
`;
  
  const skeleton = await callMiniMax(skeletonPrompt);

  // Step 2: Generate Buckets in parallel
  // Normally 5 angles + 2 styles. For this example we map what is requested.
  const allCategories = ['problem_aware', 'solution_aware', 'identity', 'social_proof', 'pattern_interrupt', 'pro_creative', 'organic_native'];
  let categoriesToGenerate = allCategories;

  if (formData.categorySelection && formData.categorySelection !== 'all') {
    categoriesToGenerate = [formData.categorySelection];
  }

  const bucketPromises = categoriesToGenerate.map(async (category) => {
    const bucketPrompt = `
You are producing EXACTLY ${formData.adsPerCategory} static ads for ONE specific angle/style: ${category}.
Output ONLY valid JSON (a 'static_ads' array).
Product: ${formData.productName}
Niche: ${formData.niche}
${formData.isPostMode ? 'THIS IS FOR ORGANIC SOCIAL POSTS. DO NOT include any price. DO NOT use salesy CTAs.' : `Price: ${formData.currency}${formData.price}`}

Return JSON like: { "angle": "${category}", "static_ads": [ { ... } ] }
`;
    try {
      const bucket = await callMiniMax(bucketPrompt);
      return bucket;
    } catch (e) {
      console.error(`Failed to generate bucket for ${category}:`, e);
      return { angle: category, static_ads: [] };
    }
  });

  const buckets = await Promise.all(bucketPromises);

  return { skeleton, buckets };
}

module.exports = { generateTextPipeline };
