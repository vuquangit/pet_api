import * as sharp from 'sharp';

export const compressImage = (file: Express.Multer.File) =>
  sharp(file.buffer).resize(300).jpeg().toBuffer();
