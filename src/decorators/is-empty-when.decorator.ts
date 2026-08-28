import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmpty,
} from 'class-validator';

/**
 * Ensures a property is empty when another property has certain values.
 *
 * Empty is determined by class-validator's isEmpty: undefined, null, or an empty string ('').
 * Arrays and objects are NOT considered empty by this check.
 *
 * Use cases
 * - Prevent contradictory input (e.g., manual reason provided while status is auto-approved).
 * - Enforce mutual exclusivity with fields controlled by system logic.
 *
 * Parameters
 * - property: name of the sibling property to inspect (simple property name; nested paths are not resolved)
 * - values: array of values that require the decorated field to be empty when matched via strict equality (===)
 * - validationOptions: standard class-validator options
 *
 * Example
 *   class ApprovalDto {
 *     status: 'auto' | 'manual';
 *
 *     @IsEmptyWhen('status', ['auto'], { message: 'manualReason must not be provided for auto status' })
 *     manualReason?: string;
 *   }
 *
 * Tip
 * - Often paired with IsOptionalWhen on the same field when you want it both optional and forced empty for certain statuses.
 */
export function IsEmptyWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmptyWhen',
      target: object.constructor,
      propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (relatedValues.includes(relatedValue)) {
            return isEmpty(value);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} must be empty when ${relatedPropertyName} is one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}