import { describe, expect, it } from 'vitest';
import { formatLongDate, formatMinutes, WEEKDAY_SHORT } from './format';

describe('format', () => {
  it('escriu la data llarga en català', () => {
    expect(formatLongDate('2026-09-28')).toBe('Dilluns, 28 de setembre');
    expect(formatLongDate('2026-10-01')).toBe("Dijous, 1 d'octubre");
    expect(formatLongDate('2026-08-02')).toBe("Diumenge, 2 d'agost");
    expect(formatLongDate('2027-04-10')).toBe("Dissabte, 10 d'abril");
  });

  it('abreviatures dels dies de dilluns a diumenge', () => {
    expect(WEEKDAY_SHORT).toEqual(['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']);
  });

  it('formata els minuts', () => {
    expect(formatMinutes(25)).toBe('25 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(90)).toBe('1 h 30 min');
    expect(formatMinutes(null)).toBe('');
  });
});
