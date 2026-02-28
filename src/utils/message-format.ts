import type { HelixStream } from "@twurple/api";

const FORMAT = Bun.env.MESSAGE_FORMAT!;

type Data = {
  stream: HelixStream;
  ai?: {
    title?: string | null;
  };
};

export const formatMessage = ({ stream, ai }: Data) => {
  return FORMAT.replaceAll("{stream_title}", stream.title)
    .replaceAll("{stream_game}", stream.gameName)
    .replaceAll("{username}", stream.userName)
    .replaceAll("{user_id}", stream.userId)
    .replaceAll("{ai_generated_title}", ai?.title || "");
};
