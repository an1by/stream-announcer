import { ApiClient, HelixStream } from "@twurple/api";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { createTwitchAuth } from "./auth";
import { generateAnnounceTitle } from "../ai";
import { deleteAnnounceMessage, sendAnnounceMessage } from "../telegram";
import { formatMessage } from "@/utils/message-format";

const { authProvider, userId } = await createTwitchAuth();

export const twitchUserId = userId;
export const apiClient = new ApiClient({ authProvider });
export const twitchUserName = (await apiClient.users.getUserById(twitchUserId))
  ?.name;

const listener = new EventSubWsListener({ apiClient });

let lastAnnouncedStreamId: string | null = null;

const generateAndSendMessage = async (stream: HelixStream) => {
  let aiGeneratedTitle: string | null | undefined;
  try {
    aiGeneratedTitle = await generateAnnounceTitle(
      stream.title,
      stream.gameName,
    );
  } catch {
    aiGeneratedTitle = null;
  }

  const text = formatMessage({
    ai: {
      title: aiGeneratedTitle,
    },
    stream,
  });

  await sendAnnounceMessage(text);

  return text;
};

const announceStreamIfNew = async (stream: HelixStream) => {
  if (lastAnnouncedStreamId === stream.id) return;
  lastAnnouncedStreamId = stream.id;
  const text = await generateAndSendMessage(stream);
  console.log("Stream online!\n\n" + text);
};

listener.onStreamOnline(twitchUserId, async (event) => {
  const stream = await event.getStream();
  if (!stream) {
    console.log("Stream not found on online event");
    return;
  }
  await announceStreamIfNew(stream);
});

listener.onStreamOffline(twitchUserId, async (_event) => {
  lastAnnouncedStreamId = null;
  await deleteAnnounceMessage();
  console.log("Stream offline!");
});

listener.start();

// EventSub иногда приходит с большой задержкой — дополнительно опрашиваем API каждые 30 сек
const POLL_INTERVAL_MS = 30_000;
setInterval(async () => {
  const stream = await apiClient.streams.getStreamByUserId(userId);
  if (stream) await announceStreamIfNew(stream);
}, POLL_INTERVAL_MS);

const currentStream = await apiClient.streams.getStreamByUserId(userId);
if (currentStream) {
  await announceStreamIfNew(currentStream);
}
