import { sleep } from "bun";
import "./index"
import { generateAnnounceTitle } from "./modules/ai";
import { deleteAnnounceMessage, sendAnnounceMessage } from "./modules/telegram";
import { apiClient, twitchUserId, twitchUserName } from "./modules/twitch"

const stream = await apiClient.streams.getStreamByUserId(twitchUserId);

if (!stream) {
  console.log("Stream not found on online event");
  process.exit(0)
}

const title = await generateAnnounceTitle(stream.title, stream.gameName);
const text =
  title + (twitchUserName ? "\nhttps://twitch.tv/" + twitchUserName : "");

await sendAnnounceMessage(text);

console.log("Message sent, sleeping 3s")
await sleep(3000);

await deleteAnnounceMessage();
console.log ("message deleted")