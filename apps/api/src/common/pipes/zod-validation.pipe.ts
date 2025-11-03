// apps/api/src/common/pipes/zod-validation.pipe.ts

import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      }
      throw error;
    }
  }
}
