import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamifier = require('streamifier');

import { IImageStorageService } from './image-storage';
import {
  CloudinaryResponse,
  UploadImageParams,
} from './interfaces/storage.interface';
import {
  UploadGroupMessageAttachmentParams,
  UploadMessageAttachmentParams,
} from '../message-attachments/interfaces/attachment.interface';
import { UploadException } from './exceptions/UploadError';

// import { compressImage } from '@/utils/image';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor() {}

  upload(file: UploadImageParams): Promise<CloudinaryResponse> {
    try {
      return new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'petisland.icu',
            // upload_preset: 'ml_default',
          },
          (error, result) => {
            if (error) return reject(error);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (err) {
      console.log('Upload image error: ', err);
      throw new UploadException(err);
    }
  }

  async delete(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }

  async deletes(publicId: string[]) {
    return await cloudinary.api.delete_resources(publicId);
  }

  async uploadMessageAttachment(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: UploadMessageAttachmentParams,
  ): Promise<any> {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
