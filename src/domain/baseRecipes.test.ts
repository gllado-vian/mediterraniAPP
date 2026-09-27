import { beforeEach, describe, expect, it } from 'vitest';
import { BASE_RECIPES, seedBaseRecipes } from './baseRecipes';
import { DEFAULT_CATEGORIES } from './categories';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';

function countBy(category: string) {
  return BASE_RECIPES.filter((d) => d.category === category).length;
}

describe('recetari base', () => {
  it('té els 20 plats de la proposta més el capritx "Fora de casa"', () => {
    expect(BASE_RECIPES).toHaveLength(21);
  });

  it('reparteix els plats per categoria segons la proposta', () => {
    expect(countBy('vegetaria')).toBe(4);
    expect(countBy('peix')).toBe(4);
    expect(countBy('llegum')).toBe(4);
    expect(countBy('ou')).toBe(2);
    expect(countBy('carn')).toBe(4);
    expect(countBy('capritx')).toBe(3);
  });

  it('pizza, croquetes i fora de casa són capritxos', () => {
    const capritxos = BASE_RECIPES.filter((d) => d.category === 'capritx').map((d) => d.name);
    expect(capritxos).toEqual(['Pizza casolana', 'Croquetes casolanes', 'Fora de casa']);
  });

  it('tots els plats tenen id únic i estable amb prefix base-', () => {
    const ids = BASE_RECIPES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^base-[a-z0-9-]+$/));
  });

  it('tots els plats de rotació tenen ingredients i temps', () => {
    BASE_RECIPES.filter((d) => DEFAULT_CATEGORIES.some((c) => c.id === d.category)).forEach((d) => {
      expect(d.ingredients.length, d.name).toBeGreaterThan(0);
      expect(d.prepMinutes, d.name).toBeGreaterThan(0);
    });
  });

  it('conserva les dades de la proposta (exemple: llenties)', () => {
    expect(BASE_RECIPES.find((d) => d.name === 'Llenties amb verdures')).toMatchObject({
      category: 'llegum',
      prepMinutes: 40,
      ingredients: ['Llenties', 'Pastanaga', 'Tomàquet', 'Ceba', 'Pebrot', 'All', 'Oli d’oliva', 'Llorer'],
    });
  });

  it('"Fora de casa" no té ingredients ni temps', () => {
    expect(BASE_RECIPES.find((d) => d.name === 'Fora de casa')).toMatchObject({
      ingredients: [],
      prepMinutes: null,
    });
  });

  it('tots els plats són de tipus base', () => {
    BASE_RECIPES.forEach((d) => expect(d.source).toBe('base'));
  });
});

describe('seedBaseRecipes', () => {
  let repo: Repository;
  let n = 0;

  beforeEach(async () => {
    repo = createRepository(await openAppDb(`seed-${++n}`));
  });

  it('carrega el recetari base a la base de dades', async () => {
    await seedBaseRecipes(repo);
    expect(await repo.listDishes()).toHaveLength(21);
  });

  it('és idempotent', async () => {
    await seedBaseRecipes(repo);
    await seedBaseRecipes(repo);
    expect(await repo.listDishes()).toHaveLength(21);
  });

  it('no toca els plats propis de la casa', async () => {
    const mine = await repo.addUserDish({
      name: 'Truita de carbassó',
      category: 'ou',
      ingredients: ['Ous'],
      prepMinutes: 20,
    });
    await seedBaseRecipes(repo);
    expect(await repo.getDish(mine.id)).toEqual(mine);
    expect(await repo.listDishes()).toHaveLength(22);
  });

  it('els noms i ingredients fan servir l’apòstrof tipogràfic (’)', () => {
    BASE_RECIPES.forEach((d) => {
      expect(d.name, d.id).not.toContain("'");
      d.ingredients.forEach((i) => expect(i, d.id).not.toContain("'"));
    });
  });

  it('el remenat es diu en català', () => {
    expect(BASE_RECIPES.find((d) => d.id === 'base-revuelto-verdures')?.name).toBe('Truita remenada de verdures');
  });
});
