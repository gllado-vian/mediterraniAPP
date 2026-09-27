import { beforeEach, describe, expect, it } from 'vitest';
import { openAppDb } from './db';
import { createRepository, DishValidationError, type Repository } from './repository';
import type { Dish } from '../domain/types';

let repo: Repository;
let dbCounter = 0;

beforeEach(async () => {
  const db = await openAppDb(`test-${++dbCounter}`);
  repo = createRepository(db);
});

const baseDish: Dish = {
  id: 'base-sardines',
  name: 'Sardines al forn',
  category: 'peix',
  ingredients: ['Sardines fresques', 'All'],
  prepMinutes: 25,
  source: 'base',
};

describe('casa única', () => {
  it('crea la casa el primer cop i la reutilitza després', async () => {
    const first = await repo.ensureHouse();
    const second = await repo.ensureHouse();
    expect(first.id).toBeTruthy();
    expect(second).toEqual(first);
  });
});

describe('ajustos', () => {
  it('el marge de capritx per defecte és de 7 dies', async () => {
    expect(await repo.getSettings()).toEqual({ capritxMarginDays: 7 });
  });

  it('desa el marge de capritx', async () => {
    await repo.updateSettings({ capritxMarginDays: 10 });
    expect((await repo.getSettings()).capritxMarginDays).toBe(10);
  });

  it('rebutja marges no enters o negatius', async () => {
    await expect(repo.updateSettings({ capritxMarginDays: -1 })).rejects.toThrow();
    await expect(repo.updateSettings({ capritxMarginDays: 2.5 })).rejects.toThrow();
  });
});

describe('plats', () => {
  it('desa i llista plats base', async () => {
    await repo.putBaseDishes([baseDish]);
    expect(await repo.listDishes()).toEqual([baseDish]);
  });

  it('afegeix un plat propi amb id i origen user', async () => {
    const dish = await repo.addUserDish({
      name: '  Truita de carbassó ',
      category: 'ou',
      ingredients: ['Ous', ' Carbassó ', ''],
      prepMinutes: 20,
    });
    expect(dish).toMatchObject({
      name: 'Truita de carbassó',
      category: 'ou',
      ingredients: ['Ous', 'Carbassó'],
      prepMinutes: 20,
      source: 'user',
    });
    expect(dish.id).toBeTruthy();
    expect(await repo.getDish(dish.id)).toEqual(dish);
  });

  it('rebutja un plat propi sense nom', async () => {
    await expect(
      repo.addUserDish({ name: '   ', category: 'ou', ingredients: [], prepMinutes: 10 }),
    ).rejects.toBeInstanceOf(DishValidationError);
  });

  it('rebutja una categoria inexistent', async () => {
    await expect(
      repo.addUserDish({
        name: 'Pastís',
        // @ts-expect-error categoria invàlida a propòsit
        category: 'postres',
        ingredients: [],
        prepMinutes: 10,
      }),
    ).rejects.toBeInstanceOf(DishValidationError);
  });

  it('rebutja un temps no positiu', async () => {
    await expect(
      repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: 0 }),
    ).rejects.toBeInstanceOf(DishValidationError);
  });

  it('edita un plat propi', async () => {
    const dish = await repo.addUserDish({
      name: 'Amanida',
      category: 'vegetaria',
      ingredients: [],
      prepMinutes: 10,
    });
    const updated = await repo.updateUserDish(dish.id, { name: 'Amanida verda', prepMinutes: 12 });
    expect(updated).toMatchObject({ id: dish.id, name: 'Amanida verda', prepMinutes: 12 });
  });

  it('esborra un plat propi', async () => {
    const dish = await repo.addUserDish({
      name: 'Amanida',
      category: 'vegetaria',
      ingredients: [],
      prepMinutes: 10,
    });
    await repo.deleteUserDish(dish.id);
    expect(await repo.getDish(dish.id)).toBeUndefined();
  });

  it('el recetari base no es pot editar ni esborrar', async () => {
    await repo.putBaseDishes([baseDish]);
    await expect(repo.updateUserDish(baseDish.id, { name: 'Altre' })).rejects.toThrow();
    await expect(repo.deleteUserDish(baseDish.id)).rejects.toThrow();
    expect(await repo.getDish(baseDish.id)).toEqual(baseDish);
  });
});

describe('historial de dies', () => {
  it('un dia sense dades no existeix', async () => {
    expect(await repo.getDay('2026-09-28')).toBeUndefined();
  });

  it('registra la categoria del dinar', async () => {
    await repo.setLunch('2026-09-28', 'peix');
    expect(await repo.getDay('2026-09-28')).toEqual({ date: '2026-09-28', lunch: 'peix' });
  });

  it('confirma el sopar guardant una còpia del nom i la categoria', async () => {
    await repo.setLunch('2026-09-28', 'ou');
    await repo.confirmDinner('2026-09-28', baseDish);
    expect(await repo.getDay('2026-09-28')).toEqual({
      date: '2026-09-28',
      lunch: 'ou',
      dinner: {
        status: 'confirmed',
        dishId: 'base-sardines',
        dishName: 'Sardines al forn',
        category: 'peix',
      },
    });
  });

  it('marca un sopar com a no recordat', async () => {
    await repo.markDinnerUnknown('2026-09-27');
    expect((await repo.getDay('2026-09-27'))?.dinner).toEqual({ status: 'unknown' });
  });

  it('esborra el dinar sense perdre el sopar', async () => {
    await repo.confirmDinner('2026-09-28', baseDish);
    await repo.setLunch('2026-09-28', 'peix');
    await repo.setLunch('2026-09-28', null);
    const day = await repo.getDay('2026-09-28');
    expect(day?.lunch).toBeUndefined();
    expect(day?.dinner?.status).toBe('confirmed');
  });

  it('llista els dies d’un rang ordenats per data', async () => {
    await repo.setLunch('2026-09-30', 'peix');
    await repo.setLunch('2026-09-28', 'ou');
    await repo.setLunch('2026-10-06', 'carn');
    const days = await repo.listDays('2026-09-28', '2026-10-04');
    expect(days.map((d) => d.date)).toEqual(['2026-09-28', '2026-09-30']);
  });

  it('les dates han de tenir format AAAA-MM-DD', async () => {
    await expect(repo.setLunch('28/09/2026', 'peix')).rejects.toThrow();
  });
});

describe('aïllament entre cases', () => {
  it('dues bases de dades diferents no comparteixen dades', async () => {
    const otherRepo = createRepository(await openAppDb(`test-${++dbCounter}`));
    await repo.setLunch('2026-09-28', 'peix');
    expect(await otherRepo.getDay('2026-09-28')).toBeUndefined();
  });
});
