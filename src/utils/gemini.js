import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApikey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApikey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const elevenLabsAPIKey = import.meta.env.VITE_ELEVENLABS_API_KEY; // ElevenLabs API Key

const ProcessWithGeminiAI = async (transcription) => {
  console.log("Inside the Gemini AI");
  try {
    const prompt = generatePrompt(transcription);

    // Generate content using Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("Gemini AI Response:", response);

    const parsedResponse = JSON.parse(response);

    // Handle "explain" intent with text-to-speech
    if (parsedResponse.intent === "explain") {
      const audioUrl = await generateAudio(parsedResponse.response);
      console.log("Audio generated:", audioUrl);
      playAudioStream(audioUrl); // Play the generated audio
    }

    // Return structured data for "add" and "explain" intents
    return {
      intent: parsedResponse.intent || null,
      action: parsedResponse.action || null,
      location: parsedResponse.location || null,
      position:
        typeof parsedResponse.position === "number"
          ? parsedResponse.position
          : null,
      response: parsedResponse.response || null,
    };
  } catch (error) {
    console.error("Error processing transcription with Gemini AI:", error);
    return {
      intent: null,
      action: null,
      location: null,
      position: null,
      response: null,
    };
  }
};

export default ProcessWithGeminiAI;

function generatePrompt(transcription) {
  return `
You are an intelligent assistant designed to process user speech transcriptions. Your job is to detect intent and provide structured information based on the user's request.

### Tasks
1. Detect **intent**:
   - If the user asks to "add" something, intent is "add".
   - If the user asks to "explain" or "tell me more about," intent is "explain".
2. For "add" intent, extract:
   - **Action**: The user's requested action (e.g., "add").
   - **Location**: The place mentioned by the user.
   - **Position**: The ordinal position where the location should be added (e.g., "1st", "2nd", etc.).
3. For "explain" intent:
   - Generate a **response**: Provide a short and sweet explanation about the mentioned location or topic (no more than three sentences).

### Rules
- Return a JSON object with fields: "intent", "action", "location", "position", and "response".
- If any field is not relevant or present in the transcription, return it with a value of null.
- For "explain" intent, the "response" field must contain the explanation.
- Do not include any commentary or extra information in the response.

### Example Inputs and Outputs

#### Example 1
Input:
"Add the Eiffel Tower as the 1st destination."

Output:
{
  "intent": "add",
  "action": "add",
  "location": "Eiffel Tower",
  "position": 0,
  "response": null
}

#### Example 2
Input:
"Tell me more about the Great Wall of China."

Output:
{
  "intent": "explain",
  "action": null,
  "location": "Great Wall of China",
  "position": null,
  "response": "The Great Wall of China is an ancient series of walls and fortifications built to protect against invasions. It is over 13,000 miles long and a UNESCO World Heritage site."
}

#### Example 3
Input:
"Find a hotel nearby."

Output:
{
  "intent": null,
  "action": null,
  "location": null,
  "position": null,
  "response": null
}

### Transcription
"${transcription}"

### JSON Output
`;
}

async function generateAudio(text) {
  const url = "https://api.elevenlabs.io/v1/text-to-speech";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${elevenLabsAPIKey}`,
    },
    body: JSON.stringify({
      text,
      voice: "en-US",
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate audio");
  }
  const data = await response.json();
  return data.audio_url;
}

function playAudioStream(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
}
