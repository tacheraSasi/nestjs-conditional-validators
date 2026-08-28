import { validate } from 'class-validator';
import { MatchesField } from '../src';

class TestDto {
  password: string;
  @MatchesField('password')
  confirmPassword: string;
}

describe('MatchesField', () => {
  it('passes when fields match', async () => {
    const dto = new TestDto();
    dto.password = 'secret';
    dto.confirmPassword = 'secret';
    expect((await validate(dto)).length).toBe(0);
  });

  it('rejects when fields do not match', async () => {
    const dto = new TestDto();
    dto.password = 'secret';
    dto.confirmPassword = 'different';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('confirmPassword');
  });
});