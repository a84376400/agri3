import { Column, TableName, SqlFlag, SqlType, SqlDefaultValue, GGModel } from "sakura-node-3";

@TableName(`${process.env.DB_SCHEMA}.farmrecords`)
export class Farmrecord extends GGModel {

  @Column("id", SqlType.BIGINT, SqlFlag.PRIMARY_KEY, "主键 ID", SqlDefaultValue.SERIAL())
  id: number;

  @Column("geometry", SqlType.GEOMETRY, SqlFlag.NULLABLE, "geometry")
  geometry: any;

  @Column("record_text", SqlType.TEXT, SqlFlag.NULLABLE, "记录的文本内容")
  recordText: string;

  @Column("record_audio_url", SqlType.TEXT, SqlFlag.NULLABLE, "记录的语音mp3url")
  recordAudioUrl: string;

  @Column("record_audio_len", SqlType.INT, SqlFlag.NULLABLE, "记录的语音mp3长度s")
  recordAudioLen: number;

  @Column("record_picture_urls", SqlType.TEXT, SqlFlag.NULLABLE, "记录的图片urls")
  recordPictureUrls: string;

  @Column("record_video_url", SqlType.TEXT, SqlFlag.NULLABLE, "记录的视频url")
  recordVideoUrl: string;

  @Column("record_video_cover_url", SqlType.TEXT, SqlFlag.NULLABLE, "记录的视频封面")
  recordVideoCoverUrl: string;

  @Column("user_name", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "完成人")
  userName: string;

  @Column("user_id", SqlType.NUMERIC, SqlFlag.NOT_NULL, "完成人id")
  userId: number;

  @Column("department_id", SqlType.NUMERIC, SqlFlag.NULLABLE, "部门")
  departmentId: number;

  @Column("enterprise_id", SqlType.NUMERIC, SqlFlag.NULLABLE, "企业")
  enterpriseId: number;

  @Column("record_latitude", SqlType.NUMERIC, SqlFlag.NULLABLE, "latitude")
  recordLatitude: number;

  @Column("record_longitude", SqlType.NUMERIC, SqlFlag.NULLABLE, "longitude")
  recordLongitude: number;

  /* tslint:disable: max-params */
  initAsNewFarmrecord(
    recordLatitude: number,
    recordLongitude: number,
    recordText: string,
    recordAudioUrl: string,
    recordAudioLen: number,
    recordPictureUrls: string,
    userId: number,
    userName: string,
    departmentId: number,
    enterpriseId: number,
    videoUrl: string,
    videoCoverUrl: string
  ) {
    this.recordLatitude = recordLatitude;
    this.recordLongitude = recordLongitude;
    this.recordText = recordText;
    this.recordAudioUrl = recordAudioUrl;
    this.recordAudioLen = recordAudioLen;
    this.recordPictureUrls = recordPictureUrls;
    this.userId = userId;
    this.departmentId = departmentId;
    this.enterpriseId = enterpriseId;
    this.userName = userName;
    this.recordVideoUrl = videoUrl;
    this.recordVideoCoverUrl = videoCoverUrl;
  }

  toJSON(): any {
    const urls: string[] = this.recordPictureUrls.split(",");
    return {
      id: this.id,
      recordLatitude: Number(this.recordLatitude),
      recordLongitude: Number(this.recordLongitude),
      recordText: this.recordText,
      recordAudioUrl: this.recordAudioUrl,
      recordAudioLen: this.recordAudioLen,
      recordPictureUrls: urls[0].length === 0 ? [] : urls,
      recordVideoUrl: this.recordVideoUrl,
      recordVideoCoverUrl: this.recordVideoCoverUrl,
      userName: this.userName,
      userId: this.userId,
      updatedAt: new Date(this.updatedAt * 1000).toISOString()
    };
  }
}
