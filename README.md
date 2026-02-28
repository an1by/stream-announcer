# stream-announcer

Automatically posts Twitch stream go-live announcements to a Telegram channel. When you go live, the app generates a short announcement (optionally with AI), sends it to Telegram, and removes the message when the stream ends.

## Features

- **Twitch EventSub** — Listens for stream online/offline via WebSocket (no polling).
- **AI-generated titles** — Uses OpenRouter to create casual, one-line announcements from your stream title and category (prompt and language configurable via env).
- **Telegram** — Sends the announcement to a channel; the message is deleted when the stream goes offline.
- **Twitch Device Flow** — First run opens a browser to authorize; tokens are saved to `twitch-auth.json`.

## Requirements

- [Bun](https://bun.sh)
- Twitch app (Client ID + Client Secret) from [Twitch Developer Console](https://dev.twitch.tv/console)
- OpenRouter API key (for AI titles)
- Telegram Bot Token and channel ID (bot must be added to the channel as admin)

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in:
   - `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` — from Twitch Developer Console
   - `OPENROUTER_API_KEY` — from [OpenRouter](https://openrouter.ai)
   - `OPENROUTER_MODEL` — model for announcements (default in example: `qwen/qwen3-235b-a22b-thinking-2507`)
   - `TELEGRAM_BOT_TOKEN` — from [@BotFather](https://t.me/BotFather)
   - `TELEGRAM_CHANNEL_ID` — your channel ID (e.g. `-1002067254966`)

   Optional: customize `MESSAGE_FORMAT`, and `AI_TITLE_PROMPT` (see `.env.example`).

3. **First run (Twitch auth)**

   ```bash
   bun run dev
   ```

   On first run you’ll get a Device Flow URL; open it in a browser, authorize the app, and the tokens will be stored in `twitch-auth.json`. After that, the app will reuse them.

## Run

```bash
bun run dev
```

Or:

```bash
bun src/index.ts
```

## Message format

- **Placeholders:** `{stream_title}`, `{stream_game}`, `{username}`, `{user_id}`, `{ai_generated_title}`
- **MESSAGE_FORMAT** — used when AI title is available.

## License

[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — [An1by](https://github.com/an1by)
