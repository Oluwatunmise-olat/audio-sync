import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { injectable } from "tsyringe";

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
      .on("end", () => console.log("FFmpeg process ended"))
      .on("error", (err) =>
        console.error("Error during FFmpeg execution:", err),
      );

    return ps;
  };
}
