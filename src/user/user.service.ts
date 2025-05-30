import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(data: CreateUserDto) {
    const user = await this.prisma.user.create({ data });

    if (user.role === "producer") {
      const newData = {
        name: user.name,
        id: user.id,
        description: ""
      };

      await this.prisma.company.create({ data: newData });
    }

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({ where: { deleted: false } });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findFirst({ where: { id, deleted: false } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, data: UpdateUserDto) {
    await this.getUserById(id);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDeleteUser(id: number) {
    await this.getUserById(id);
    return this.prisma.user.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email, deleted: false } });
    if (!user) throw new NotFoundException('User not found');

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getPendingProducers() {
  return this.prisma.user.findMany({
    where: {
      role: 'producer',
      isValidated: false,
      deleted: false,
    },
  });
}

async validateProducer(id: number) {
  const user = await this.getUserById(id);

  if (user.role !== 'producer') {
    throw new UnauthorizedException('User is not a producer');
  }

  return this.prisma.user.update({
    where: { id },
    data: { isValidated: true },
  });
}

}
