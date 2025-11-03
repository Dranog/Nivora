import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.creatorProfile) {
      throw new NotFoundException('Creator profile not found');
    }

    const updatedProfile = await prisma.creatorProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        avatar: dto.avatar,
      },
    });

    return updatedProfile;
  }
}
