// src/services/stabilityApiService.ts
import axios from "axios";

/**
 * Generates an image texture by calling the Stability AI Stable Diffusion API.
 * @returns {Promise<string>} A promise that resolves to a Blob Object URL of the generated image.
 */
export const generateTextureFromAPI = async (
  prompt: string,
  negative_prompt: string
): Promise<string> => {
  // IMPORTANT: For security, API keys should ideally be handled by a backend proxy.
  // This is a temporary solution for client-side development.
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  if (!apiKey)
    throw new Error(
      "Stability AI API key is missing. Create a .env file with VITE_STABILITY_API_KEY=your-key."
    );

  const apiUrl = `https://api.stability.ai/v2beta/stable-image/generate/sd3`;

  const payload = {
    prompt: prompt,
    negative_prompt: negative_prompt,
    aspect_ratio: "16:9",
    output_format: "jpeg",
  };

  try {
    console.log("🚀 Sending prompt to Stability AI API:", payload.prompt);

    const response = await axios.postForm(apiUrl, payload, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
      },
    });

    if (response.status !== 200) {
      const errorText = new TextDecoder("utf-8").decode(
        new Uint8Array(response.data)
      );
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const imageBlob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const imageUrl = URL.createObjectURL(imageBlob);
    console.log("🖼️ Successfully generated texture.");
    return imageUrl;
  } catch (error: any) {
    if (error.response) {
      const errorText = new TextDecoder("utf-8").decode(
        new Uint8Array(error.response.data)
      );
      console.error(
        `❌ Stability AI API Error (Status ${error.response.status}):`,
        errorText
      );
      throw new Error(`API Error: ${errorText}`);
    }
    console.error("❌ An error occurred during the API call:", error.message);
    throw error;
  }
};
