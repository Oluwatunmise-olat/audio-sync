import { injectable } from "tsyringe";
import ytdl from "ytdl-core";

import { VideoMetaDataType } from "@shared/@types/youtube-dl.type";
import { logger } from "../logger";

@injectable()
export class YoutubeDL {
  private readonly url = "https://www.youtube.com/watch";

  /**
   * @param videoId
   * @returns Promise<VideoMetaDataType | null>
   */
  public async getMetadata(videoId: string): Promise<VideoMetaDataType | null> {
    try {
      const url = this.constructMediaUrl(videoId);

      const media = await ytdl.getBasicInfo(url);
      const metadata: VideoMetaDataType = {
        duration: media.videoDetails.lengthSeconds,
        title: media.videoDetails.title,
        uploader: media.videoDetails.author.name,
        upload_date: media.videoDetails.uploadDate,
        original_url: media.videoDetails.video_url,
      };

      return metadata;
    } catch (error) {
      logger.error("[YoutubeDL]: Error fetching media metadata: %o", {
        error_message: error.message,
      });
      return null;
    }
  }

  public async getAudioStream(videoId: string) {
    try {
      const url = this.constructMediaUrl(videoId);

      const mediaStream = ytdl(url, {
        filter: "audioonly",
      });

      return mediaStream;
    } catch (error) {
      logger.error("[YoutubeDL]: Error downloading media audio: %o", {
        error_message: error.message,
      });
      return null;
    }
  }

  private constructMediaUrl(videoId: string) {
    return `${this.url}?v=${videoId}`;
  }
}
