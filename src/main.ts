import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@/app.module';
import { configSwagger } from '@/configs';
import { HttpResponseInterceptor } from '@/common/interceptors';
import { ExceptionInterceptor } from '@/common/interceptors/exception.interceptor';
import { HttpExceptionFilter } from '@/common/exception-filter/http-exception.filter';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') || 8080;
  const prefix = configService.get<string>('API_PREFIX') || '/api/v1';

  app.setGlobalPrefix(prefix);
  app.enableCors({
    // origin: 'http://localhost:3000', // Your frontend URL
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true, // Allow cookies to be sent
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalInterceptors(new ExceptionInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  // app.useWebSocketAdapter(new IoAdapter(app));

  configSwagger(app);
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  return port;
}

bootstrap().then((port: number) => {
  Logger.log(`Application running on port: ${port}`, 'Main');
});
