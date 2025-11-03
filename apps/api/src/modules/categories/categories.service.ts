import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active categories
   */
  async findAll() {
    return this.prisma.category.findMany({
      // Note: isActive field removed from schema
      orderBy: { name: 'asc' }, // orderIndex field removed from schema
    });
  }

  /**
   * Get a category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      // Note: _count removed - no relations in Category schema
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Create a new category
   */
  async create(dto: CreateCategoryDto) {
    // Check if slug already exists
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    return this.prisma.category.create({
      data: {
        id: randomUUID(),
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Seed default categories
   */
  async seedCategories() {
    const defaultCategories = [
      { name: 'Fashion', slug: 'fashion', icon: '👗', orderIndex: 1 },
      { name: 'Fitness', slug: 'fitness', icon: '💪', orderIndex: 2 },
      { name: 'Gaming', slug: 'gaming', icon: '🎮', orderIndex: 3 },
      { name: 'Art', slug: 'art', icon: '🎨', orderIndex: 4 },
      { name: 'Music', slug: 'music', icon: '🎵', orderIndex: 5 },
      { name: 'Cooking', slug: 'cooking', icon: '👨‍🍳', orderIndex: 6 },
      { name: 'Photography', slug: 'photography', icon: '📸', orderIndex: 7 },
      { name: 'Travel', slug: 'travel', icon: '✈️', orderIndex: 8 },
      { name: 'Lifestyle', slug: 'lifestyle', icon: '🌟', orderIndex: 9 },
      { name: 'Other', slug: 'other', icon: '📦', orderIndex: 10 },
    ];

    const created = [];
    for (const category of defaultCategories) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (!existing) {
        const newCategory = await this.prisma.category.create({
          data: {
            id: randomUUID(),
            ...category,
            updatedAt: new Date(),
          },
        });
        created.push(newCategory);
      }
    }

    return {
      message: `Seeded ${created.length} categories`,
      categories: created,
    };
  }
}
