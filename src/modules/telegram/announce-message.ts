
import { bot } from "./bot";

const chatId = Bun.env.TELEGRAM_CHANNEL_ID!;

let currentAnnounceMessageId: number | null = null;

export const sendAnnounceMessage = async (text: string) => {
  if (currentAnnounceMessageId) {
    console.log("There is existing announce message");
    return;
  }

  const message = await bot.api.sendMessage(chatId, text);
  currentAnnounceMessageId = message.message_id;
  return currentAnnounceMessageId;
};

export const deleteAnnounceMessage = async () => {
  if (!currentAnnounceMessageId) {
    console.log("There is no existing announce message");
    return;
  }

  await bot.api.deleteMessage(chatId, currentAnnounceMessageId);

  currentAnnounceMessageId = null;
};
