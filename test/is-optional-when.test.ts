import { validate } from 'class-validator';
import { IsOptionalWhen } from '../src';

class TestDto {
  provider: string;
  @IsOptionalWhen('provider', ['sso'])
  email?: string;
}

describe('IsOptionalWhen', () => {
  it('makes field optional when related value matches', async () => {
    const dto = new TestDto();
    dto.provider = 'sso';
    expect((await validate(dto)).length).toBe(0);
  });

  it('requires the field when related value does not match', async () => {
    const dto = new TestDto();
    dto.provider = 'local';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('allows falsy but defined values like 0 and false when required', async () => {
    class NumericDto {
      type: 'guest' | 'member';
      @IsOptionalWhen('type', ['guest'])
      age?: number;
    }
    const dto = new NumericDto();
    dto.type = 'member';
    dto.age = 0;
    expect((await validate(dto)).length).toBe(0);
  });
});