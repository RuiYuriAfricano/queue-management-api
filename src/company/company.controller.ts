import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  async createCompany(@Body() body: CreateCompanyDto) {
    return this.companyService.createCompany(body);
  }

  @Get()
  async getAllCompanies() {
    return this.companyService.getAllCompanies();
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: number) {
    return this.companyService.getCompanyById(Number(id));
  }

  @Put(':id')
  async updateCompany(@Param('id') id: number, @Body() body: UpdateCompanyDto) {
    return this.companyService.updateCompany(Number(id), body);
  }

  @Delete(':id')
  async softDeleteCompany(@Param('id') id: number) {
    return this.companyService.softDeleteCompany(Number(id));
  }
}
