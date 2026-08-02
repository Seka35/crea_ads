const KIE_API_KEY = process.env.KIE_API_KEY;

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImage(prompt, input_urls) {
  if (!KIE_API_KEY) throw new Error("KIE_API_KEY not configured");

  // Step 1: Submit the job
  const submitResponse = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-image-to-image",
      input: {
        prompt: prompt,
        input_urls: input_urls ? input_urls.slice(0, 2) : [],
        aspect_ratio: "1:1",
        resolution: "2K"
      }
    })
  });

  const submitData = await submitResponse.json();
  if (submitData.code !== 200 || !submitData.data || !submitData.data.taskId) {
    console.error("KIE API Error Response:", JSON.stringify(submitData, null, 2));
    throw new Error(`Failed to submit image job: ${submitData.msg || JSON.stringify(submitData)}`);
  }

  const taskId = submitData.data.taskId;
  console.log(`Submitted image task: ${taskId}. Polling for result...`);

  // Step 2: Poll for results
  let attempts = 0;
  const maxAttempts = 60; // 60 * 5s = 5 minutes timeout

  while (attempts < maxAttempts) {
    await sleep(5000); // Wait 5 seconds between polls
    attempts++;

    const pollResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${KIE_API_KEY}`
      }
    });

    const pollData = await pollResponse.json();

    if (pollData.code === 505) {
       // Based on your documentation, code 505 can mean "Feature Disabled", but your docs also showed a successful response using 505...
       // Standard success should be 200. Assuming success state inside data:
       if (pollData.data && pollData.data.state === "success") {
           const resultJsonStr = pollData.data.resultJson;
           try {
             const result = JSON.parse(resultJsonStr);
             const kieUrl = result.resultUrls[0];
             
             // Download the image locally to avoid KIE expiration
             const imgResponse = await fetch(kieUrl);
             if (!imgResponse.ok) throw new Error("Failed to download image from KIE");
             const buffer = await imgResponse.arrayBuffer();
             const fileName = `kie-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
             const fs = require('fs');
             const path = require('path');
             const uploadDir = path.join(__dirname, '../uploads');
             if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
             fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(buffer));
             
             return `/api/uploads/${fileName}`;
           } catch (e) {
             throw new Error("Failed to parse resultUrls or download image: " + e.message);
           }
       } else if (pollData.data && pollData.data.state === "failed") {
           throw new Error(`Task failed: ${pollData.data.failMsg}`);
       }
    } else if (pollData.code === 200 && pollData.data) {
       if (pollData.data.state === "success") {
           const resultJsonStr = pollData.data.resultJson;
           try {
             const result = JSON.parse(resultJsonStr);
             const kieUrl = result.resultUrls[0];
             
             // Download the image locally to avoid KIE expiration
             const imgResponse = await fetch(kieUrl);
             if (!imgResponse.ok) throw new Error("Failed to download image from KIE");
             const buffer = await imgResponse.arrayBuffer();
             const fileName = `kie-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
             const fs = require('fs');
             const path = require('path');
             const uploadDir = path.join(__dirname, '../uploads');
             if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
             fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(buffer));
             
             return `/api/uploads/${fileName}`;
           } catch (e) {
             throw new Error("Failed to parse resultUrls or download image: " + e.message);
           }
       } else if (pollData.data.state === "failed") {
           throw new Error(`Task failed: ${pollData.data.failMsg}`);
       }
    }
    
    // If not success or failed, it's still running. Continue polling.
  }

  throw new Error("Timeout waiting for image generation.");
}

module.exports = { generateImage };
