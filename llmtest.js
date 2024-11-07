import OpenAI from "openai"; // Ensure you're using the latest OpenAI SDK
import dotenv from "dotenv"; // To load environment variables

dotenv.config(); // Load variables from a .env file if needed

// Initialize OpenAI client
const openai = new OpenAI(); // Automatically uses the OPENAI_API_KEY

const testLLMCall = async () => {
  try {
    console.log("Testing LLM call...");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Write a haiku about autumn." },
      ],
    });

    console.log("LLM Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error during LLM call:", error);
  }
};

testLLMCall();
