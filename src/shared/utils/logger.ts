import pino from "pino";

// Can pipe to elastic search 🤫
export const logger = pino({
  level: "info",
  redact: {
    paths: ["email"],
    censor: "[REDACTED FIELD]",
  },
  transport: { options: { colorize: true }, target: "pino-pretty" },
  name: "audio-sync",
});
