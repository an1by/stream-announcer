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

const generateAndSendMessage = async (stream: HelixStream) => {
  let aiGeneratedTitle: string | null | undefined;
  try {
    aiGeneratedTitle = await generateAnnounceTitle(stream.title, stream.gameName);
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

listener.onStreamOnline(twitchUserId, async (event) => {
  const stream = await event.getStream();
  if (!stream) {
    console.log("Stream not found on online event");
    return;
  }

  const text = await generateAndSendMessage(stream);

  console.log("Stream online!\n\n" + text);
});

listener.onStreamOffline(twitchUserId, async (_event) => {
  await deleteAnnounceMessage();
  console.log("Stream offline!");
});

listener.start();

const currentStream = await apiClient.streams.getStreamByUserId(userId);
if (currentStream) {
  const text = await generateAndSendMessage(currentStream);
  console.log("Stream online!\n\n" + text);
}
