import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dtos/create-queue.dto';
import { UpdateQueueDto } from './dtos/update-queue.dto';

@Controller('queues')
export class QueueController {
  constructor(private queueService: QueueService) {}

  // Endpoint para criar uma nova fila
  @Post()
  async createQueue(@Body() body: CreateQueueDto) {
    return this.queueService.createQueue(body);
  }

  // Endpoint para obter todas as filas
  @Get()
  async getAllQueues() {
    return this.queueService.getAllQueues();
  }

  // Endpoint para obter uma fila por ID
  @Get(':id')
  async getQueueById(@Param('id') id: number) {
    return this.queueService.getQueueById(Number(id));
  }

  // Endpoint para atualizar uma fila
  @Put(':id')
  async updateQueue(@Param('id') id: number, @Body() body: UpdateQueueDto) {
    return this.queueService.updateQueue(Number(id), body);
  }

  // Endpoint para excluir uma fila
  @Delete(':id')
  async deleteQueue(@Param('id') id: number) {
    return this.queueService.deleteQueue(Number(id));
  }

  // Endpoint para obter as estatísticas das filas
  @Get('statistics')
  async getQueueStatistics() {
    return this.queueService.getQueueStatistics();
  }

  // **Novo endpoint** para obter todas as filas associadas a um serviço
  @Get('service/:serviceId')
  async getQueuesByService(@Param('serviceId') serviceId: number) {
    return this.queueService.getQueuesByService(Number(serviceId));
  }

  // **Novo endpoint** para obter todas as filas de um cliente com status "waiting"
  @Get('user/:userId/waiting')
  async getQueuesByUserWaiting(@Param('userId') userId: number) {
    return this.queueService.getQueuesByUserWaiting(Number(userId));
  }
}
