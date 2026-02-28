import { Bot } from "grammy";

export const bot = new Bot(Bun.env.TELEGRAM_BOT_TOKEN!);

bot.start();
