import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Asserts that a property's value strictly equals (===) another property's value.
 *
 * Typical usage is confirming inputs like password/confirmPassword or email/emailConfirm.
 * Matching is strict (===) and not deep; for objects/arrays it checks reference equality.
 *
 * Parameters
 * - property: name of the sibling property to compare against (simple property name; nested paths are not resolved)
 * - validationOptions: standard class-validator options
 *
 * Example
 *   class RegisterDto {
 *     @IsString()
 *     password: string;
 *
 *     @MatchesField('password', { message: 'Passwords do not match' })
 *     confirmPassword: string;
 *   }
 *
 * Notes
 * - If you need case-insensitive or trimmed comparison, pre-normalize values (e.g., via Transform) before validation.
 */
export function MatchesField(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'matchesField',
      target: object.constructor,
      propertyName,
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
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}