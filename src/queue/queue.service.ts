import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateQueueDto } from './dtos/create-queue.dto';
import { UpdateQueueDto } from './dtos/update-queue.dto';

@Injectable()
export class QueueService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createQueue(data: CreateQueueDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queue = await this.prisma.queue.create({
      data,
    });

    await this.notificationService.sendSms(user.phone, 'You have been added to the queue.');
    await this.notificationService.sendWhatsApp(user.phone, 'You have been added to the queue.');
    await this.notificationService.sendEmail(user.email, 'Queue Notification', 'You have been added to the queue.');

    return queue;
  }

  async getAllQueues() {
    return this.prisma.queue.findMany();
  }

  async getQueueById(id: number) {
    const queue = await this.prisma.queue.findUnique({ where: { id } });
    if (!queue) throw new NotFoundException('Queue not found');
    return queue;
  }

  async updateQueue(id: number, data: UpdateQueueDto) {
    await this.getQueueById(id);
    return this.prisma.queue.update({
      where: { id },
      data,
    });
  }

  async deleteQueue(id: number) {
    await this.getQueueById(id);
    return this.prisma.queue.delete({ where: { id } });
  }

  async getQueueStatistics() {
    const result = await this.prisma.$queryRaw<
      { avgWaitTime: number }[]
    >`SELECT AVG(UNIX_TIMESTAMP(createdAt)) as avgWaitTime FROM Queue`;
  
    const averageWaitTime = result[0]?.avgWaitTime
      ? new Date(result[0].avgWaitTime * 1000) // Converte de timestamp para Date
      : null;
  
    const totalClientsServed = await this.prisma.queue.count({
      where: { status: 'completed' },
    });
  
    return { averageWaitTime, totalClientsServed };
  }

  // **Novo método** para obter as filas por serviço
  async getQueuesByService(serviceId: number) {
    const queues = await this.prisma.queue.findMany({
      where: { serviceId: serviceId },
    });

    return queues;
  }

  // **Novo método** para obter as filas de um cliente com status "waiting"
  async getQueuesByUserWaiting(userId: number) {
    const queues = await this.prisma.queue.findMany({
      where: {
        userId,
        status: 'waiting',
      },
    });

    return queues;
  }
}
