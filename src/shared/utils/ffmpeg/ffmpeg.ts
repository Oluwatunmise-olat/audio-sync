import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { injectable } from "tsyringe";

import { logger } from "../logger";

@injectable()
export class FFmpeg {
  reEncodeMp3Code = (source: string) => {
    const ps = new PassThrough();

    ffmpeg()
      .input(source)
      .audioCodec("aac")
      .audioBitrate("192k")
      .format("mp3")
      .pipe(ps, { end: true })
      .on("end", () => logger.info("FFmpeg process ended"))
      .on("error", (err) =>
        logger.error("Error during FFmpeg execution: ===> %o", err),
      );

    return ps;
  };
}
