import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import type { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { join } from 'path';
// import { formatCurrency } from '@/utils/format';

function formatDateTime() {
  const dateTime = new Date();
  const day = dateTime.getDate();
  const month = dateTime.getMonth() + 1; // Month indexes start from 0
  const year = dateTime.getFullYear();
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const seconds = dateTime.getSeconds();

  // Padding single digits with leading zeros if necessary
  const formattedDay = day < 10 ? '0' + day : day;
  const formattedMonth = month < 10 ? '0' + month : month;
  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

  return (
    formattedDay +
    '/' +
    formattedMonth +
    '/' +
    year +
    ' - ' +
    formattedHours +
    ':' +
    formattedMinutes +
    ':' +
    formattedSeconds
  );
}

export const mailerConfig: MailerAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: () => ({
    transport: {
      host: process.env.MAIL_HOST,
      port: +(process.env.MAIL_PORT || 465),
      secure: +(process.env.MAIL_PORT || 465) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER, // generated ethereal user
        pass: process.env.MAIL_PASS, // generated ethereal password
      },
      debug: true, // show debug output
      logger: true, // log information in console
    },
    defaults: {
      from: `"nest-modules" <${process.env.MAIL_FROM}>`, // outgoing email ID
    },
    template: {
      dir: join(__dirname, 'mail', 'templates'),
      adapter: new HandlebarsAdapter({
        // format_currency: formatCurrency,
        format_date_time: formatDateTime,
      }), // or new PugAdapter()
      options: {
        strict: true,
      },
    },
  }),
};
