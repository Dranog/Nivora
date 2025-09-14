import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // pour Prisma.PrismaClientKnownRequestError
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const { email, username, name } = data;
    try {
      return await this.prisma.user.create({
        data: { email, username, name: name ?? null },
        select: { id: true, email: true, username: true, name: true, createdAt: true },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('email ou username déjà utilisé');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, email: true, username: true, name: true, createdAt: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, name: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, username: true, name: true, createdAt: true },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Utilisateur introuvable');
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('email ou username déjà utilisé');
      }
      throw e;
    }
  }

  async remove(id: number) {
  try {
    return await this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, username: true, name: true, createdAt: true },
    });
  } catch (e: any) {
    // P2025 = "record not found" -> renvoyer 404 proprement
    if (e.code === 'P2025') {
      throw new NotFoundException('Utilisateur introuvable');
    }
    throw e;
  }
}

}
