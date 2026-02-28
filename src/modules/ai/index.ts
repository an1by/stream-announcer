import { OpenRouter } from "@openrouter/sdk";

const apiKey = Bun.env.OPENROUTER_API_KEY!;
const model = Bun.env.OPENROUTER_MODEL!;

const openrouter = new OpenRouter({
  apiKey,
});

const prompt = `
You are writing a one-line Twitch stream announcement for socials (Twitter, Discord, etc.). The vibe is: a real person who doesn't care about sounding professional — casual, irreverent, sometimes lazy or self-deprecating. NOT a polite bot or marketing copy.

Inputs:
- Stream title: the stream's title
- Category: game or category (e.g. "Just Chatting", "Counter-Strike 2", "Software and Game Development")
- Local time: stream start time in streamer's timezone (e.g. "14:30", "22:00", "3:00 AM")

Rules:
- Language: Russian, or mixed Russian + English (game names, memes). No corporate or formal phrasing.
- Length: max 100 characters.
- Tone: carefree, a bit cynical or tired if it fits; self-deprecating ("я конченый", "проспал", "модеры простите") is good. Mild vulgarity or slang is allowed when it fits the mood. Sound like someone who just woke up or can't be bothered to write a "proper" announcement — short, punchy, human. You may use ALL CAPS for hype or irony, lowercase for "meh" energy. One emoji only if it feels natural.
- Use title/category to hint at what's happening; you can reference the time (e.g. "стрим не в 4 утра", "доброй ночи") when it fits.
- Output ONLY the announcement line. No URL, no hashtags, no extra lines.

Examples of the desired tone (announcement line only):
- "Снова работать, снова дофига планов"
- "АЛКОСТРИМ В КС, ЧТООООООО"
- "модеры, простите"
- "Я конченый и че"
- "снова стрим? да еп твою мать"
- "стрим не в 4 утра"
- "проспалъ"
- "бегите на стрим, я конченый"
- "грустно, но нужно работать"

Generate exactly one line. Prioritize sounding like a real, slightly unbothered person over being clean or "correct".
`;

export const generateAnnounceTitle = async (
  name: string,
  category: string,
): Promise<string> => {
  const now = new Date();
  const time = now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const content =
    prompt +
    `
  Name of stream: ${name}
  Category of stream: ${category}
  Current local time: ${time}
  `;

  const response = await openrouter.chat.send({
    chatGenerationParams: {
      model,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    },
  });

  return response.choices[0]?.message.content;
};
