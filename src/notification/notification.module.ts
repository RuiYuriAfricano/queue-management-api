import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService], // Exporta o NotificationService para outros módulos
})
export class NotificationModule {}
