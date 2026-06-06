import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/campaign", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log(`Generating campaign for prompt: ${prompt}`);

      const contentResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate an email marketing campaign based on the following prompt:\n${prompt}\n\nPlease provide 3 subject line options, 2 body copy options (e.g., different tones/lengths), and 2 visual description prompts to generate accompanying images.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subjectLines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 subject line options",
              },
              bodyOptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tone: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ["tone", "content"],
                },
                description: "2 body copy options",
              },
              visualPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2 detailed, descriptive image generation prompts. Make them specific, include style (e.g. photorealistic, flat design), and composition.",
              },
            },
            required: ["subjectLines", "bodyOptions", "visualPrompts"],
          },
        },
      });

      const campaignData = JSON.parse(contentResponse.text.trim());

      const generatedImages = [];
      for (const vp of campaignData.visualPrompts) {
        try {
          console.log(`Generating image for prompt: ${vp}`);
          const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [{ text: vp }],
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9",
              },
            },
          });
          
          let imageUrl = null;
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          if (imageUrl) {
            generatedImages.push({ prompt: vp, url: imageUrl });
          }
        } catch (imgError) {
          console.error("Image generation error:", imgError);
        }
      }

      return res.json({
        ...campaignData,
        images: generatedImages,
      });

    } catch (error) {
      console.error("Campaign calculation error:", error);
      return res.status(500).json({ error: error.message || "An error occurred during generation" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
