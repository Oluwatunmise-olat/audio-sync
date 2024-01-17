import { injectable } from "tsyringe";
import YouTubeDL from "youtube-dl-exec";

import { VideoMetaDataType } from "@shared/@types/youtube-dl.type";

@injectable()
export class YoutubeDL {
  private readonly url = "https://www.youtube.com/watch";

  /**
   * @param videoId
   * @returns Promise<VideoMetaDataType | null>
   */
  public async getMetadata(
    videoId: string
  ): Promise<VideoMetaDataType | null | string> {
    try {
      const url = this.constructMediaUrl(videoId);

      const media = await YouTubeDL(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noPlaylist: true,
      });

      const metadata: VideoMetaDataType = {
        duration: media.duration,
        title: media.title,
        uploader: media.uploader,
        upload_date: media.upload_date,
        original_url: media.original_url,
        format: media.format,
      };

      return metadata;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private constructMediaUrl(videoId: string) {
    return `${this.url}?v=${videoId}`;
  }
}
