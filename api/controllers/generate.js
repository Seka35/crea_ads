const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function callLLM(promptContent, retries = 1) {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://crea.futurvps.pro', 
          'X-Title': 'Ad Creative Generator'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-5',
          messages: [{ role: 'user', content: promptContent + "\n\nCRITICAL: You must output ONLY valid JSON. Escape all inner quotes using \\\"" }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`OpenRouter API Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("No valid content returned from OpenRouter");
      }

      let rawText = data.choices[0].message.content.trim();
      if (rawText.includes("```json")) {
        rawText = rawText.split("```json")[1].split("```")[0].trim();
      } else if (rawText.includes("```")) {
        rawText = rawText.split("```")[1].split("```")[0].trim();
      }

      return JSON.parse(rawText);
    } catch (e) {
      console.error(`LLM attempt ${i + 1} failed: ${e.message}`);
      if (i === retries) throw e;
    }
  }
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
  return await callLLM(skeletonPrompt);
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
      "id": "${category}_ad_1",
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
    return await callLLM(bucketPrompt);
  } catch (e) {
    console.error(`Failed to generate bucket for ${category}:`, e);
    return { angle: category, static_ads: [] };
  }
}

module.exports = { generateSkeleton, generateBucket };
