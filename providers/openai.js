import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("WARNING: Missing OpenAI API key");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createMessages = async (text, type) => {
  try {
    // Sanitize and validate input text
    if (!text || typeof text !== 'string') {
      throw new Error("Invalid input: Text must be a non-empty string");
    }

    const safeText = text.slice(0, 5000); // Limit input length
    const systemContent = type === "stock"
      ? "Use the about that data to analyze the stock trend using tech indicators such as moving averages, MACD."
      : "You are a chatbot, Please reply politely to the following questions.";

    const messages = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-0125-preview", // Use env variable for model name
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: safeText,
        },
      ],
      max_tokens: 1000, // Add reasonable limits
    });

    return messages.choices[0].message.content;
  } catch (e) {
    // Don't log the full error which might contain sensitive info
    console.error("OpenAI API error:", e.name, e.message);
    throw new Error("Failed to generate AI response");
  }
};
