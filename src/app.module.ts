import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { ServiceModule } from './service/service.module';
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UserModule, CompanyModule, ServiceModule, QueueModule, PrismaModule],
  providers: [PrismaService],
})
export class AppModule {}
