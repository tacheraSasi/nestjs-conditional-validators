import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Conditionally marks a property as optional depending on another property's value.
 *
 * Contract
 * - When the related property has any of the provided values, this field is considered optional
 *   and always passes this validator (other validators can still apply).
 * - Otherwise, the field is required and must not be undefined, null, or an empty string ('').
 *   Note: 0 and false are considered valid values.
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that make the decorated field optional when matched via strict equality (===)
 * - validationOptions: standard class-validator options (message, groups, each, etc.)
 *
 * Examples
 * - Email required unless user signs in with SSO
 *   class CreateUserDto {
 *     @IsEnum(UserProvider)
 *     provider: UserProvider;
 *
 *     @IsOptionalWhen('provider', [UserProvider.SSO], { message: 'Email is required for local accounts' })
 *     @IsEmail()
 *     email?: string;
 *   }
 *
 * - Numeric example: age required unless type is 'guest'
 *   class PersonDto {
 *     type: 'guest' | 'member';
 *     @IsOptionalWhen('type', ['guest'])
 *     @IsInt()
 *     age?: number; // age may be 0, and that's allowed when required
 *   }
 *
 * Notes
 * - This decorator does not support deep property paths (e.g., 'profile.type'). Use a custom validator if needed.
 * - Combine with other validators (e.g., IsEmail, IsInt) to enforce format when the field is present or required.
 */
export function IsOptionalWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOptionalWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is optional
          if (relatedValues.includes(relatedValue)) {
            return true; // Allow any value including undefined/null
          }

          // Otherwise, this field is required
          return value !== undefined && value !== null && value !== '';
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is not one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}