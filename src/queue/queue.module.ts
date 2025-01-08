import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { NotificationModule } from '../notification/notification.module'; // Certifique-se de importar o NotificationModule

@Module({
  imports: [NotificationModule],
  providers: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}
