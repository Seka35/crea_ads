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

async function generateSkeleton(formData) {
  const skeletonPrompt = `
You are producing the SKELETON of a creative brief for Meta Ads.
Output ONLY valid JSON.
Product: ${formData.productName}
Category: ${formData.category}
Niche: ${formData.niche}
${formData.isPostMode ? '' : `Price: ${formData.currency}${formData.price}`}
AI_Strategy: ${formData.aiStrategy}
Awareness_Level: ${formData.awarenessLevel}

Return EXACTLY this JSON structure:
{
  "strategy": "Your strategy paragraph...",
  "campaign_dna": {
    "visual_signature": {
      "dominant_color": "Hex or color name",
      "accent_color": "Hex or color name",
      "lighting_mood": "e.g., moody, bright",
      "texture_vibe": "e.g., matte, glossy"
    },
    "opening_pattern": "Pattern description"
  },
  "audiences": [],
  "hook_map": [],
  "angle_copy": []
}
`;
  return await callMiniMax(skeletonPrompt);
}

async function generateBucket(formData, category) {
  const bucketPrompt = `
You are producing EXACTLY ${formData.adsPerCategory} static ads for ONE specific angle/style: ${category}.
Output ONLY valid JSON (a 'static_ads' array).
Product: ${formData.productName}
Niche: ${formData.niche}
${formData.isPostMode ? 'THIS IS FOR ORGANIC SOCIAL POSTS. DO NOT include any price. DO NOT use salesy CTAs.' : `Price: ${formData.currency}${formData.price}`}

Return EXACTLY this JSON structure:
{
  "angle": "${category}",
  "static_ads": [
    {
      "id": "ad_1",
      "angle": "${category}",
      "format": "Static",
      "visual_style": "...",
      "hook_visual": "...",
      "hero_element": "...",
      "text_overlay": {
        "hook_line": "...",
        "support_line": "..."
      },
      "prompt": "Highly detailed image generation prompt for KIE...",
      "primary_text": "Meta ad copy...",
      "headline": "Meta headline..."
    }
  ]
}
`;
  try {
    return await callMiniMax(bucketPrompt);
  } catch (e) {
    console.error(`Failed to generate bucket for ${category}:`, e);
    return { angle: category, static_ads: [] };
  }
}

module.exports = { generateSkeleton, generateBucket };
