import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env de la raíz del monorepo
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// "nest start --watch" mata el proceso viejo y levanta uno nuevo en cada
// cambio. En dev, el proceso viejo a veces tarda unos ms en soltar el puerto
// (ej. mientras Prisma cierra su conexión en onModuleDestroy), y el nuevo
// truena con EADDRINUSE y se cae dejando corriendo el código viejo. Este
// retry absorbe esa demora reintentando el bind en vez de morir al primer
// intento — solo importa en desarrollo, en producción el puerto siempre
// está libre porque no hay un proceso previo.
async function listenWithRetry(app: import('@nestjs/common').INestApplication, port: number | string, retriesLeft = 15): Promise<void> {
  const httpServer = app.getHttpServer();

  return new Promise((resolve, reject) => {
    const onError = (err: NodeJS.ErrnoException) => {
      httpServer.removeListener('listening', onListening);
      if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
        setTimeout(() => resolve(listenWithRetry(app, port, retriesLeft - 1)), 300);
      } else {
        reject(err);
      }
    };
    const onListening = () => {
      httpServer.removeListener('error', onError);
      resolve();
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    httpServer.listen(port, '0.0.0.0');
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Aqui Canta Bolivia API')
    .setDescription('Documentación interactiva de la API para Aqui Canta Bolivia')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.init();
  await listenWithRetry(app, port);

  logger.log(`🚀 API corriendo en: http://localhost:${port}`);
  logger.log(`📚 Swagger Docs disponibles en: http://localhost:${port}/docs`);
}

bootstrap();
