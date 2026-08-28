import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Conditionally requires a property depending on another property's value.
 *
 * Contract
 * - When the related property has any of the provided values, this field becomes required and must
 *   not be undefined, null, or an empty string (''). Note: 0 and false are considered valid values.
 * - Otherwise, the field is optional for this validator (other validators can still apply).
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that make the decorated field required when matched via strict equality (===)
 * - validationOptions: standard class-validator options (message, groups, each, etc.)
 *
 * Examples
 * - Password required for local provider, optional for SSO
 *   class LoginDto {
 *     provider: 'local' | 'sso';
 *
 *     @IsRequiredWhen('provider', ['local'], { message: 'Password is required for local login' })
 *     @IsString()
 *     password?: string;
 *   }
 *
 * - Reason required when status is 'rejected'
 *   class ReviewDto {
 *     status: 'pending' | 'approved' | 'rejected';
 *     @IsRequiredWhen('status', ['rejected'])
 *     @IsString()
 *     reason?: string;
 *   }
 */
export function IsRequiredWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRequiredWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is required
          if (relatedValues.includes(relatedValue)) {
            return value !== undefined && value !== null && value !== '';
          }

          // Otherwise, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}