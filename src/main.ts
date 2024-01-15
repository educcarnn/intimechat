import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '../prisma/schema.prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService: PrismaService = app.get(PrismaService);

  app.useWebSocketAdapter(new RedisIoAdapter(app, prismaService));

  await app.listen(3000);
}
bootstrap();
