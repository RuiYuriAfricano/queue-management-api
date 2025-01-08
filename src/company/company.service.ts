import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async createCompany(data: CreateCompanyDto) {
    return this.prisma.company.create({ data });
  }

  async getAllCompanies() {
    return this.prisma.company.findMany({ where: { deleted: false } });
  }

  async getCompanyById(id: number) {
    const company = await this.prisma.company.findFirst({ where: { id, deleted: false } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateCompany(id: number, data: UpdateCompanyDto) {
    await this.getCompanyById(id);
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async softDeleteCompany(id: number) {
    await this.getCompanyById(id);
    return this.prisma.company.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
