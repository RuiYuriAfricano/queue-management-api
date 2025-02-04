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
  
    const service = await this.prisma.service.findUnique({
      where: { id: Number(data.serviceId) },
    });
  
    if (!service) {
      throw new NotFoundException('Service not found');
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const existingQueues = await this.prisma.queue.findMany({
      where: {
        serviceId: data.serviceId,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'asc' },
    });
  
    let waitTime = service.averageServiceTime || 10; // Tempo médio padrão de espera
  
    if (existingQueues.length > 0) {
      waitTime *= existingQueues.length; // Multiplica pelo número de pessoas já na fila
    }
  
    const position = existingQueues.length + 1; // Calcula a posição do usuário na fila
  
    const queue = await this.prisma.queue.create({
      data: { ...data, waitTime, position }, // Inclui a posição na criação da fila
    });
  
    await this.notificationService.sendSms(user.phone, 'Você entrou na fila.');
    //await this.notificationService.sendWhatsApp(user.phone, 'Você entrou na fila.');
    //await this.notificationService.sendEmail(user.email, 'Notificação de Fila', 'Você entrou na fila.');
  
    return queue;
  } 

  async getAllQueues() {
    return this.prisma.queue.findMany({include: {
      service: {
        select: {
          name: true, // Seleciona apenas o nome do serviço
        },
      },
      user:{
        select:{
          name:true
        }
      }
    },
  });
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
      include: {
        service: {
          select: {
            name: true, // Seleciona apenas o nome do serviço
          },
        },
      },
    });
  
    return queues;
  }

  // Retorna as estatísticas do dia corrente
  async getTodayQueueStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Contar clientes em espera
    const clientsWaiting = await this.prisma.queue.count({
      where: {
        status: 'waiting',
        createdAt: { gte: today },
      },
    });

    // Calcular tempo médio de atendimento (somente para atendidos)
    const servedQueues = await this.prisma.queue.findMany({
      where: {
        status: 'completed',
        leftAt: { not: null, gte: today },
      },
      select: {
        createdAt: true,
        leftAt: true,
      },
    });

    const avgWaitTime =
      servedQueues.length > 0
        ? Math.round(
            servedQueues.reduce((acc, queue) => {
              return (
                acc + (queue.leftAt.getTime() - queue.createdAt.getTime()) / 60000
              );
            }, 0) / servedQueues.length
          )
        : 0;

    // Número de atendidos hoje
    const totalClientsServed = await this.prisma.queue.count({
      where: {
        status: 'completed',
        leftAt: { gte: today },
      },
    });

    // Número de desistentes hoje
    const totalClientsGaveUp = await this.prisma.queue.count({
      where: {
        gaveUp: true,
        updatedAt: { gte: today },
      },
    });

    return {
      clientsWaiting,
      avgWaitTime,
      totalClientsServed,
      totalClientsGaveUp,
    };
  }

  // Retorna os dados históricos para o gráfico de fila
  async getQueueHistoryGraph() {
    const history = await this.prisma.queue.findMany({
      select: {
        createdAt: true,
      },
    });
  
    // Estrutura para armazenar o número de filas por hora
    const queueData: { hour: string; waiting: number }[] = [];
  
    // Inicializa o array com todas as horas do dia
    for (let i = 9; i <= 14; i++) {
      queueData.push({ hour: `${i}h`, waiting: 0 });
    }
  
    // Processa os registros e conta quantas filas foram criadas por hora
    history.forEach((queue) => {
      const hour = queue.createdAt.getHours();
  
      // Filtra apenas o intervalo de horas desejado (9h - 14h)
      if (hour >= 9 && hour <= 14) {
        const index = hour - 9; // Mapeia para a posição correta no array
        queueData[index].waiting++;
      }
    });
  
    return queueData;
  }
  
  async getFastestServiceToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const services = await this.prisma.service.findMany({
      select: {
        id: true,
        name: true,
        queues: {
          where: { createdAt: { gte: today } },
          select: {
            id: true,
            status: true,
            gaveUp: true,
            createdAt: true,
            leftAt: true,
          },
        },
      },
    });
  
    let fastestService = null;
    let bestAvgTime = Infinity;
  
    const serviceStats = services.map((service) => {
      const completedQueues = service.queues.filter(q => q.status === 'completed' && q.leftAt);
      const avgTime =
        completedQueues.length > 0
          ? Math.round(
              completedQueues.reduce((acc, q) => {
                return acc + (q.leftAt.getTime() - q.createdAt.getTime()) / 60000;
              }, 0) / completedQueues.length
            )
          : Infinity;
  
      if (avgTime < bestAvgTime) {
        bestAvgTime = avgTime;
        fastestService = service.name;
      }
  
      return {
        serviceName: service.name,
        attended: completedQueues.length,
        gaveUp: service.queues.filter(q => q.gaveUp).length,
        avgTime: avgTime === Infinity ? 0 : avgTime,
      };
    });
  
    return {
      fastestService,
      stats: serviceStats.find(s => s.serviceName === fastestService),
    };
  }
  
  // **Novo método** para listar todas as filas do dia atual, ordenadas por serviço
  async getQueuesTodayOrderedByService() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.queue.findMany({
      where: {
        createdAt: {
          gte: today, // Busca filas criadas a partir do início do dia
        },
      },
      orderBy: {
        serviceId: 'asc', // Ordena pelo serviço
      },
    });
  }

  async getServicePerformance() {
    const services = await this.prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  
    const servicePerformance = await Promise.all(
      services.map(async (service) => {
        const completed = await this.prisma.queue.count({
          where: { serviceId: service.id, status: 'completed' },
        });
  
        const abandoned = await this.prisma.queue.count({
          where: { serviceId: service.id, status: 'abandoned' },
        });
  
        const avgWaitTime = await this.prisma.queue.aggregate({
          where: { serviceId: service.id, status: 'completed' },
          _avg: { waitTime: true },
        });
  
        return {
          name: service.name,
          completed,
          abandoned,
          avgWaitTime: avgWaitTime._avg.waitTime || 0,
        };
      })
    );
  
    return servicePerformance;
  }
  async getStatusDistribution() {
    const totalWaiting = await this.prisma.queue.count({
      where: { status: 'waiting' },
    });
  
    const completedToday = await this.prisma.queue.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Filtra apenas o dia de hoje
        },
      },
    });
  
    const abandonedToday = await this.prisma.queue.count({
      where: {
        status: 'abandoned',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
  
    return [
      { name: 'Em Espera', value: totalWaiting },
      { name: 'Atendidos', value: completedToday },
      { name: 'Desistências', value: abandonedToday },
    ];
  }
  async completeQueue(queueId: number) {
    const queue = await this.getQueueById(queueId);
  
    if (queue.status !== 'waiting') {
      throw new Error('Fila já foi encerrada ou abandonada.');
    }
  
    const updatedQueue = await this.prisma.queue.update({
      where: { id: queueId },
      data: {
        status: 'completed',
        leftAt: new Date(),
        served: true,
      },
    });
  
    await this.recalculateWaitTimes(queue.serviceId);
  
    return updatedQueue;
  }
  
  async abandonQueue(queueId: number) {
    const queue = await this.getQueueById(queueId);
  
    if (queue.status !== 'waiting') {
      throw new Error('Fila já foi encerrada ou abandonada.');
    }
  
    const updatedQueue = await this.prisma.queue.update({
      where: { id: queueId },
      data: {
        status: 'abandoned',
        leftAt: new Date(),
        gaveUp: true,
      },
    });
  
    await this.recalculateWaitTimes(queue.serviceId);
  
    return updatedQueue;
  }
  
  private async recalculateWaitTimes(serviceId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
  
    if (!service) {
      return;
    }
  
    const remainingQueues = await this.prisma.queue.findMany({
      where: {
        serviceId,
        status: 'waiting',
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'asc' },
    });
  
    let accumulatedWaitTime = 0;
    for (let i = 0; i < remainingQueues.length; i++) {
      if (i === 0) {
        accumulatedWaitTime = service.averageServiceTime || 10; // Primeiro usuário tem o tempo do serviço
      } else {
        accumulatedWaitTime += service.averageServiceTime || 10; // Usuários subsequentes acumulam o tempo
      }
  
      await this.prisma.queue.update({
        where: { id: remainingQueues[i].id },
        data: { waitTime: accumulatedWaitTime, position: i + 1 }, // Atualiza o tempo de espera e a posição
      });
    }
  }
  
    
}
