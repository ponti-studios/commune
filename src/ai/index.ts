import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function chatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
) {
  const result = await client.chat.send({
    chatRequest: {
      model: "google/gemini-2.5-flash-lite",
      messages,
    },
  });
  return result.choices[0].message.content;
}
