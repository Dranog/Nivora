import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator that checks if property value matches another property value
 * Useful for password confirmation validation
 *
 * @param property - Name of the property to compare against
 * @param validationOptions - Standard class-validator options
 *
 * @example
 * ```typescript
 * export class RegisterDto {
 *   password: string;
 *
 *   @Match('password', { message: 'Passwords do not match' })
 *   passwordConfirm: string;
 * }
 * ```
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
