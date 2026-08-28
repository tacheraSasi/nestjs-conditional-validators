# nestjs-conditional-validators

Conditional class-validator decorators for NestJS DTOs.

Adds field-level validation rules that depend on the value of sibling properties — required/optional/empty fields, plus field matching — using the standard `class-validator` `registerDecorator` API. Works with any `class-validator`-based project, not just NestJS.

---

## Installation

```bash
npm install nestjs-conditional-validators
```

`class-validator` (>= 0.14.0) is a peer dependency — the consuming app already has it installed.

---

## Decorators

### IsOptionalWhen

Marks a field optional when a related property has one of the given values; otherwise the field is required.

```ts
import { IsEmail } from 'class-validator';
import { IsOptionalWhen } from 'nestjs-conditional-validators';

class CreateUserDto {
  provider: 'local' | 'sso';

  // Email is optional for SSO sign-ins, required for local accounts
  @IsOptionalWhen('provider', ['sso'], { message: 'Email is required for local accounts' })
  @IsEmail()
  email?: string;
}
```

### IsRequiredWhen

Marks a field required when a related property has one of the given values; otherwise the field is optional.

```ts
import { IsString } from 'class-validator';
import { IsRequiredWhen } from 'nestjs-conditional-validators';

class LoginDto {
  provider: 'local' | 'sso';

  // Password required for local login, optional for SSO
  @IsRequiredWhen('provider', ['local'], { message: 'Password is required for local login' })
  @IsString()
  password?: string;
}
```

### IsEmptyWhen

Ensures a field is empty (undefined, null, or `''`) when a related property has one of the given values.

```ts
import { IsEmptyWhen } from 'nestjs-conditional-validators';

class ApprovalDto {
  status: 'auto' | 'manual';

  // Prevent contradictory input: no manual reason for auto statuses
  @IsEmptyWhen('status', ['auto'], { message: 'manualReason must not be provided for auto status' })
  manualReason?: string;
}
```

### MatchesField

Asserts that a field's value strictly equals (===) another field's value.

```ts
import { IsString } from 'class-validator';
import { MatchesField } from 'nestjs-conditional-validators';

class RegisterDto {
  @IsString()
  password: string;

  @MatchesField('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
```

---

## Notes

- Property references are simple sibling names; deep paths (e.g. `'profile.type'`) are not resolved.
- Values are matched with strict equality (`===`); `0` and `false` are considered valid non-empty values.
- Combine with other decorators (e.g. `@IsEmail()`, `@IsString()`) to enforce format when present.

---

## Development

```bash
npm install
npm run build      # tsup → dist/ (CJS + ESM + types)
npm run test       # run tests
npm run typecheck  # run TypeScript type check
```

## License

MIT