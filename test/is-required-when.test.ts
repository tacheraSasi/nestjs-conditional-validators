import { validate } from 'class-validator';
import { IsRequiredWhen } from '../src';

class TestDto {
  provider: string;
  @IsRequiredWhen('provider', ['local'])
  password?: string;
}

describe('IsRequiredWhen', () => {
  it('requires the field when related value matches', async () => {
    const dto = new TestDto();
    dto.provider = 'local';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
  });

  it('passes when field is provided and related value matches', async () => {
    const dto = new TestDto();
    dto.provider = 'local';
    dto.password = 'secret';
    expect((await validate(dto)).length).toBe(0);
  });

  it('makes the field optional when related value does not match', async () => {
    const dto = new TestDto();
    dto.provider = 'sso';
    expect((await validate(dto)).length).toBe(0);
  });
});