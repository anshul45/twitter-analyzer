import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
		origin: "https://twitter-analyzer-1.onrender.com",
		methods: "GET,POST,PATCH",
	});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
