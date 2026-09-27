import { describe, expect, it } from 'vitest';
import { HELP_GROUPS } from './helpContent';

const steps = HELP_GROUPS.flatMap((g) => g.steps);

describe('contingut de "Com funciona"', () => {
  it('té grups amb títol i almenys un apartat cadascun', () => {
    expect(HELP_GROUPS.length).toBeGreaterThan(1);
    HELP_GROUPS.forEach((g) => {
      expect(g.title.trim()).not.toBe('');
      expect(g.steps.length).toBeGreaterThan(0);
    });
  });

  it('cada apartat té un id únic, un títol i d’una a tres frases curtes', () => {
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    steps.forEach((s) => {
      expect(s.title.trim(), s.id).not.toBe('');
      expect(s.body.length, s.id).toBeGreaterThanOrEqual(1);
      expect(s.body.length, s.id).toBeLessThanOrEqual(3);
    });
  });

  it('fa servir l’apòstrof tipogràfic (’)', () => {
    [...HELP_GROUPS.map((g) => g.title), ...steps.flatMap((s) => [s.title, ...s.body])].forEach((text) =>
      expect(text).not.toContain("'"),
    );
  });

  it('explica el vespre en ordre: ahir, dinar, plat, canviar, girar', () => {
    expect(HELP_GROUPS[0].steps.map((s) => s.id)).toEqual(['ahir', 'dinar', 'plat', 'canviar', 'girar']);
  });

  it('explica les categories a la part d’Ajustos', () => {
    const settings = HELP_GROUPS.find((g) => g.title === 'A Ajustos')!;
    expect(settings.steps.map((s) => s.id)).toContain('categories');
  });
});
