import { Module } from '@nestjs/common';
import { Services } from '@/constants/constants';
import { ImageStorageService } from './image-storage.service';

@Module({
  providers: [
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],
  exports: [
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],
})
export class ImageStorageModule {}
