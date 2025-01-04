import { Module } from "@nestjs/common";
import { TwitterController } from "./twitter.controller";
import { TwitterService } from "./twitter.service";
import { OpenAIWrapper } from "src/modules/openai/openai.service"; 


@Module({
    controllers:[TwitterController],
    providers:[OpenAIWrapper,TwitterService]
})
export class TwitterModule {}