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

describe('data de creació de la casa', () => {
  it('es pot fixar la data de creació (per saber des de quan existeix l’app)', async () => {
    const house = await repo.ensureHouse(new Date(2026, 8, 20, 10));
    expect(house.createdAt.slice(0, 10)).toBe('2026-09-20');
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
        category: 'postres', // categoria que no existeix
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

  it('l’error de validació diu a quin camp pertany', async () => {
    const fieldOf = (input: Parameters<typeof repo.addUserDish>[0]) =>
      repo.addUserDish(input).catch((e: DishValidationError) => e.field);
    expect(await fieldOf({ name: '', category: 'ou', ingredients: [], prepMinutes: null })).toBe('name');
    // @ts-expect-error sense categoria a propòsit
    expect(await fieldOf({ name: 'Pastís', category: null, ingredients: [], prepMinutes: null })).toBe('category');
    expect(await fieldOf({ name: 'Pastís', category: 'ou', ingredients: [], prepMinutes: Number.NaN })).toBe('prepMinutes');
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

  it('desfà un sopar confirmat sense perdre el dinar', async () => {
    await repo.setLunch('2026-09-28', 'ou');
    await repo.confirmDinner('2026-09-28', baseDish);
    await repo.clearDinner('2026-09-28');
    expect(await repo.getDay('2026-09-28')).toEqual({ date: '2026-09-28', lunch: 'ou' });
  });

  it('llista tot l’historial', async () => {
    await repo.setLunch('2027-01-02', 'peix');
    await repo.setLunch('2026-09-28', 'ou');
    expect((await repo.listAllDays()).map((d) => d.date)).toEqual(['2026-09-28', '2027-01-02']);
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

describe('còpia de seguretat', () => {
  async function fillHouse(target: Repository, name: string) {
    await target.ensureHouse(new Date(2026, 8, 1, 12));
    await target.putBaseDishes([baseDish]);
    await target.updateSettings({ capritxMarginDays: 4 });
    const mine = await target.addUserDish({ name, category: 'ou', ingredients: ['Ous'], prepMinutes: 15 });
    await target.setLunch('2026-09-27', 'peix');
    await target.confirmDinner('2026-09-27', mine);
    await target.markDinnerUnknown('2026-09-26');
    return mine;
  }

  it('exporta la casa, els ajustos, tots els plats i tots els dies', async () => {
    const mine = await fillHouse(repo, 'Truita');
    const all = await repo.exportAll();
    expect(all.house.createdAt.slice(0, 10)).toBe('2026-09-01');
    expect(all.settings).toEqual({ capritxMarginDays: 4 });
    expect(all.dishes).toEqual(expect.arrayContaining([baseDish, mine]));
    expect(all.days.map((d) => d.date)).toEqual(['2026-09-26', '2026-09-27']);
  });

  it('en importar, substitueix tot el que hi havia (i conserva el recetari base)', async () => {
    const source = createRepository(await openAppDb(`test-origen-${dbCounter}`));
    const mine = await fillHouse(source, 'Truita del mòbil vell');
    const backup = await source.exportAll();

    const old = await repo.addUserDish({ name: 'Plat que desapareix', category: 'peix', ingredients: [], prepMinutes: null });
    await repo.setLunch('2026-09-20', 'carn');
    await repo.putBaseDishes([baseDish]);

    await repo.replaceAll({ ...backup, dishes: backup.dishes.filter((d) => d.source === 'user') });

    expect(await repo.getDish(old.id)).toBeUndefined();
    expect(await repo.getDish(mine.id)).toEqual(mine);
    expect(await repo.getDish(baseDish.id)).toEqual(baseDish);
    expect(await repo.getDay('2026-09-20')).toBeUndefined();
    expect(await repo.listAllDays()).toEqual(backup.days);
    expect(await repo.getSettings()).toEqual({ capritxMarginDays: 4 });
    expect(await repo.ensureHouse()).toEqual(backup.house);
  });

  it('si la substitució falla a mig camí, no es canvia res', async () => {
    const old = await repo.addUserDish({ name: 'Plat que es queda', category: 'peix', ingredients: [], prepMinutes: null });
    await repo.setLunch('2026-09-20', 'carn');
    const broken = {
      house: { id: 'casa', createdAt: '2026-09-01T00:00:00.000Z' },
      settings: { capritxMarginDays: 7 },
      dishes: [],
      // Un dia sense data no es pot desar: la transacció ha de desfer-se sencera.
      days: [{ date: '2026-09-27' }, {} as never],
    };
    await expect(repo.replaceAll(broken)).rejects.toThrow();
    expect(await repo.getDish(old.id)).toBeDefined();
    expect((await repo.getDay('2026-09-20'))?.lunch).toBe('carn');
    expect(await repo.getDay('2026-09-27')).toBeUndefined();
  });
});
