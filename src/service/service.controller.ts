import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  async createService(@Body() body: CreateServiceDto) {
    return this.serviceService.createService(body);
  }

  @Get()
  async getAllServices() {
    return this.serviceService.getAllServices();
  }
  // Novo endpoint para listar os serviços abertos
  @Get('open')
  async getOpenServices() {
    return this.serviceService.getOpenServices();
  }

  @Get(':id')
  async getServiceById(@Param('id') id: number) {
    return this.serviceService.getServiceById(Number(id));
  }

  @Put(':id')
  async updateService(@Param('id') id: number, @Body() body: UpdateServiceDto) {
    return this.serviceService.updateService(Number(id), body);
  }

  @Delete(':id')
  async softDeleteService(@Param('id') id: number) {
    return this.serviceService.softDeleteService(Number(id));
  }

  // Endpoint para abrir o serviço
  @Put(':id/open')
  async openService(@Param('id') id: number) {
    return this.serviceService.openService(Number(id));
  }

  // Endpoint para fechar o serviço
  @Put(':id/close')
  async closeService(@Param('id') id: number) {
    return this.serviceService.closeService(Number(id));
  }
}
