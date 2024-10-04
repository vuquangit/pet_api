import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type UploadImageParams = Express.Multer.File;

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;
