import { Module } from "@nestjs/common";
import {ScheduleModule} from "@nestjs/schedule"
import { CronController } from "./cron.controller";
import { CronService } from "./cron.service";
import { TwitterService } from "src/twitter/twitter.service";
import { OpenAIWrapper } from "src/modules/openai/openai.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    imports:[
        ScheduleModule.forRoot()
    ],
    controllers:[CronController],
    providers:[CronService,TwitterService,OpenAIWrapper,PrismaService]
})
 export class CornModule {}