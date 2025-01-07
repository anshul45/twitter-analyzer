import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitterModule } from './twitter/twitter.module';
import { PrismaModule } from './prisma/prisma.module';
import { CornModule } from './cron/cron.module';

@Module({
  imports: [TwitterModule,PrismaModule,CornModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
