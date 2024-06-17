// TODO: remove controller
import { Body, Controller, Get } from '@nestjs/common';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}

  @Get('test')
  public testMail(@Body() test: any) {
    return this.mailingService.testMail(test.email);
  }
}
