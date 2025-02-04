import { Controller, Patch, ParseIntPipe, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dtos/create-queue.dto';
import { UpdateQueueDto } from './dtos/update-queue.dto';

@Controller('queues')
export class QueueController {
  constructor(private queueService: QueueService) {}

  // **Endpoints específicos devem vir antes de endpoints com parâmetros dinâmicos**
  @Get('statistics')
  async getQueueStatistics() {
    return this.queueService.getQueueStatistics();
  }

  @Get('statistics-today')
  async getQueueStatisticsToday() {
    return this.queueService.getTodayQueueStatistics();
  }

  @Get('getQueueHistoryGraph')
  async getQueueHistoryGraph() {
    return this.queueService.getQueueHistoryGraph();
  }

  @Get('service-performance')
  async getServicePerformance() {
    return this.queueService.getServicePerformance();
  }

  @Get('status-distribution')
  async getStatusDistribution() {
    return this.queueService.getStatusDistribution();
  }

  @Get('fastest-service-today')
  async getFastestServiceToday() {
    return this.queueService.getFastestServiceToday();
  }

  @Get('today')
  async getQueuesTodayOrderedByService() {
    return this.queueService.getQueuesTodayOrderedByService();
  }

  @Get('service/:serviceId')
  async getQueuesByService(@Param('serviceId') serviceId: number) {
    return this.queueService.getQueuesByService(Number(serviceId));
  }

  @Get('user/:userId/waiting')
  async getQueuesByUserWaiting(@Param('userId') userId: number) {
    return this.queueService.getQueuesByUserWaiting(Number(userId));
  }

  // **Endpoints relacionados ao CRUD de filas**
  @Post()
  async createQueue(@Body() body: CreateQueueDto) {
    return this.queueService.createQueue(body);
  }

  @Get()
  async getAllQueues() {
    return this.queueService.getAllQueues();
  }

  @Get(':id')
  async getQueueById(@Param('id') id: number) {
    return this.queueService.getQueueById(id);
  }

  @Put(':id')
  async updateQueue(@Param('id') id: number, @Body() body: UpdateQueueDto) {
    return this.queueService.updateQueue(Number(id), body);
  }

  @Delete(':id')
  async deleteQueue(@Param('id') id: number) {
    return this.queueService.deleteQueue(Number(id));
  }

  @Patch(':id/complete')
  async completeQueue(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.completeQueue(id);
  }

  @Patch(':id/abandon')
  async abandonQueue(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.abandonQueue(id);
  }
}