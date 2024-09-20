/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Inject, Injectable } from '@nestjs/common';
import { Services } from '@/constants/constants';
import { IImageStorageService } from './image-storage';
// import { S3 } from '@aws-sdk/client-s3';
import {
  UploadGroupMessageAttachmentParams,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '@/utils/types';
// import { compressImage } from '@/utils/helpers';
import { GroupMessageAttachment } from '@/utils/typeorm';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  // constructor(
  //   @Inject(Services.SPACES_CLIENT)
  //   private readonly spacesClient: S3,
  // ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  upload(params: UploadImageParams): any {
    return 'uploaded';

    // return this.spacesClient.putObject({
    //   Bucket: 'chuachat',
    //   Key: params.key,
    //   Body: params.file.buffer,
    //   ACL: 'public-read',
    //   ContentType: params.file.mimetype,
    // });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadMessageAttachment(params: UploadMessageAttachmentParams): Promise<any> {
    return 'uploadMessageAttachment';

    // this.spacesClient.putObject({
    //   Bucket: 'chuachat',
    //   Key: `original/${params.messageAttachment.key}`,
    //   Body: params.file.buffer,
    //   ACL: 'public-read',
    //   ContentType: params.file.mimetype,
    // });
    // await this.spacesClient.putObject({
    //   Bucket: 'chuachat',
    //   Key: `preview/${params.messageAttachment.key}`,
    //   Body: await compressImage(params.file),
    //   ACL: 'public-read',
    //   ContentType: params.file.mimetype,
    // });
    // return params.messageAttachment;
  }

  async uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  // ): Promise<GroupMessageAttachment> {
  ): Promise<any> {
    // this.spacesClient.putObject({
    //   Bucket: 'chuachat',
    //   Key: `original/${params.messageAttachment.key}`,
    //   Body: params.file.buffer,
    //   ACL: 'public-read',
    //   ContentType: params.file.mimetype,
    // });
    // await this.spacesClient.putObject({
    //   Bucket: 'chuachat',
    //   Key: `preview/${params.messageAttachment.key}`,
    //   Body: await compressImage(params.file),
    //   ACL: 'public-read',
    //   ContentType: params.file.mimetype,
    // });
    // return params.messageAttachment;
  }
}
