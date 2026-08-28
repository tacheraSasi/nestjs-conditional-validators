import { validate } from 'class-validator';
import { IsEmptyWhen } from '../src';

class TestDto {
  status: 'auto' | 'manual';
  @IsEmptyWhen('status', ['auto'])
  manualReason?: string;
}

describe('IsEmptyWhen', () => {
  it('rejects a value when related value matches', async () => {
    const dto = new TestDto();
    dto.status = 'auto';
    dto.manualReason = 'needs review';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('manualReason');
  });

  it('passes when field is empty and related value matches', async () => {
    const dto = new TestDto();
    dto.status = 'auto';
    expect((await validate(dto)).length).toBe(0);
  });

  it('allows any value when related value does not match', async () => {
    const dto = new TestDto();
    dto.status = 'manual';
    dto.manualReason = 'needs review';
    expect((await validate(dto)).length).toBe(0);
  });
});