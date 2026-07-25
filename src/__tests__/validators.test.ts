import { describe, it, expect } from 'vitest';
import { validateProfile, validateChatInput, validateMoodScore, validateMoodType, validateChatMode, validateScenario } from '../lib/validators';

describe('validateProfile', () => {
  it('validates a complete profile', () => {
    const profile = { name: 'Alex', triggers: ['stress'], recoveryStage: 'early', myWhy: 'For my family', supportContacts: [], copingPreferences: [] };
    expect(validateProfile(profile)).toEqual({ valid: true });
  });
  it('rejects profile with missing name', () => {
    const profile = { name: '', triggers: [], recoveryStage: 'early', myWhy: 'test' };
    expect(validateProfile(profile).valid).toBe(false);
  });
  it('rejects null input', () => {
    expect(validateProfile(null).valid).toBe(false);
  });
  it('rejects too many triggers', () => {
    const profile = { name: 'Alex', triggers: Array(11).fill('t'), recoveryStage: 'early', myWhy: 'test', supportContacts: [] };
    expect(validateProfile(profile).valid).toBe(false);
  });
});

describe('validateChatInput', () => {
  it('accepts valid message', () => {
    expect(validateChatInput('Hello')).toEqual({ valid: true });
  });
  it('rejects empty message', () => {
    expect(validateChatInput('').valid).toBe(false);
  });
  it('rejects message over 500 chars', () => {
    expect(validateChatInput('a'.repeat(501)).valid).toBe(false);
  });
});

describe('validateMoodScore', () => {
  it('accepts score 1-10', () => {
    expect(validateMoodScore(5)).toEqual({ valid: true });
  });
  it('rejects score 0', () => {
    expect(validateMoodScore(0).valid).toBe(false);
  });
  it('rejects score 11', () => {
    expect(validateMoodScore(11).valid).toBe(false);
  });
  it('rejects non-integer', () => {
    expect(validateMoodScore(3.5).valid).toBe(false);
  });
});

describe('validateMoodType', () => {
  it('accepts valid mood', () => {
    expect(validateMoodType('anxious')).toEqual({ valid: true });
  });
  it('rejects invalid mood', () => {
    expect(validateMoodType('excited').valid).toBe(false);
  });
});

describe('validateChatMode', () => {
  it('accepts valid mode', () => {
    expect(validateChatMode('crisis')).toEqual({ valid: true });
  });
  it('rejects invalid mode', () => {
    expect(validateChatMode('party').valid).toBe(false);
  });
});

describe('validateScenario', () => {
  it('accepts valid scenario', () => {
    expect(validateScenario('party')).toEqual({ valid: true });
  });
  it('rejects invalid scenario', () => {
    expect(validateScenario('invalid').valid).toBe(false);
  });
});
