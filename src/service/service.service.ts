import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createService(data: CreateServiceDto) {
    console.log(data)
    return this.prisma.service.create({ data });
  }

  async getAllServices() {
    return this.prisma.service.findMany({
      where: { deleted: false },
      include:{
        company:{
          select:{
            name: true
          }
        }
      }
    });
  }

  async getServiceById(id: number) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: id,  // Garantir que o id seja passado diretamente
        deleted: false,
      },
    });
  
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
  

  async updateService(id: number, data: UpdateServiceDto) {
    await this.getServiceById(id);
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async softDeleteService(id: number) {
    await this.getServiceById(id);
    return this.prisma.service.update({
      where: { id },
      data: { deleted: true },
    });
  }

  // Novo método para obter todos os serviços que estão abertos
  async getOpenServices() {
    return this.prisma.service.findMany({
      where: { status: 'open', deleted: false },
    });
  }

  // Método para abrir o serviço
  async openService(id: number) {
    const service = await this.getServiceById(id);
    return this.prisma.service.update({
      where: { id },
      data: { status: 'open' },
    });
  }

  // Método para fechar o serviço
  async closeService(id: number) {
    const service = await this.getServiceById(id);
    return this.prisma.service.update({
      where: { id },
      data: { status: 'closed' },
    });
  }
}
