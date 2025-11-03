import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator that ensures password meets strength requirements:
 * - At least 8 characters
 * - At most 128 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Length check
          if (value.length < 8 || value.length > 128) return false;

          // Character requirements
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-=+[\]\\\/`~;']/.test(value);

          return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be 8-128 characters and contain uppercase, lowercase, number, and special character (!@#$%^&*(),.?":{}|<>_-=+[]\\\/`~;\')';
        },
      },
    });
  };
}
