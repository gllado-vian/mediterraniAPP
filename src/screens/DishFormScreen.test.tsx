import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { DishFormScreen } from './DishFormScreen';

let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`dish-form-${++n}`));
});

async function renderForm(dishId?: string) {
  const onDone = vi.fn();
  const onBack = vi.fn();
  const store = createAppStore({ repo, now: () => new Date(2026, 8, 28, 20) });
  render(
    <AppStoreProvider store={store}>
      <DishFormScreen dishId={dishId} onDone={onDone} onBack={onBack} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: dishId ? 'Editar plat' : 'Nou plat' });
  await screen.findByRole('button', { name: 'Desar' });
  return { onDone, onBack };
}

const userDishes = async () => (await repo.listDishes()).filter((d) => d.source === 'user');

describe('DishFormScreen', () => {
  it('afegeix un plat propi amb ingredients un per línia', async () => {
    const { onDone } = await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Truita de carbassó');
    await userEvent.click(screen.getByRole('radio', { name: 'Ou' }));
    await userEvent.type(screen.getByLabelText('Temps (minuts)'), '20');
    await userEvent.type(screen.getByLabelText('Ingredients'), 'Ous{Enter}Carbassó{Enter}{Enter}Ceba');
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(await userDishes()).toEqual([
      expect.objectContaining({
        name: 'Truita de carbassó',
        category: 'ou',
        prepMinutes: 20,
        ingredients: ['Ous', 'Carbassó', 'Ceba'],
      }),
    ]);
  });

  it('el temps i els ingredients són opcionals', async () => {
    const { onDone } = await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Sopar a casa dels avis');
    await userEvent.click(screen.getByRole('radio', { name: 'Capritx per un dia' }));
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(await userDishes()).toEqual([
      expect.objectContaining({ category: 'capritx', prepMinutes: null, ingredients: [] }),
    ]);
  });

  it('sense nom avisa al camp del nom i no desa', async () => {
    const { onDone } = await renderForm();
    await userEvent.click(screen.getByRole('radio', { name: 'Peix' }));
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    expect(await screen.findByText('Posa-li un nom al plat.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toHaveAttribute('aria-invalid', 'true');
    expect(onDone).not.toHaveBeenCalled();
    expect(await userDishes()).toEqual([]);
  });

  it('sense categoria ho diu', async () => {
    await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Pastís');
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    expect(await screen.findByText('Tria una categoria.')).toBeInTheDocument();
  });

  it('un temps de 0 minuts no val', async () => {
    await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Amanida');
    await userEvent.click(screen.getByRole('radio', { name: 'Vegetarià pur' }));
    await userEvent.type(screen.getByLabelText('Temps (minuts)'), '0');
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    expect(await screen.findByText('El temps ha de ser un nombre de minuts més gran que 0.')).toBeInTheDocument();
    expect(screen.getByLabelText('Temps (minuts)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('edita un plat propi', async () => {
    const dish = await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: ['Enciam'], prepMinutes: 10 });
    const { onDone } = await renderForm(dish.id);
    expect(screen.getByLabelText('Nom')).toHaveValue('Amanida');
    expect(screen.getByRole('radio', { name: 'Vegetarià pur' })).toBeChecked();
    expect(screen.getByLabelText('Temps (minuts)')).toHaveValue(10);
    expect(screen.getByLabelText('Ingredients')).toHaveValue('Enciam');
    await userEvent.clear(screen.getByLabelText('Nom'));
    await userEvent.type(screen.getByLabelText('Nom'), 'Amanida verda');
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getDish(dish.id))?.name).toBe('Amanida verda');
  });

  it('esborrar demana confirmació i "No" no esborra', async () => {
    const dish = await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
    const { onDone } = await renderForm(dish.id);
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar el plat' }));
    expect(
      screen.getByText('Esborrar aquest plat? Els sopars que ja n’has fet es queden a l’historial.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'No, deixa’l' }));
    expect(screen.queryByText(/^Esborrar aquest plat\?/)).not.toBeInTheDocument();
    expect(await repo.getDish(dish.id)).toBeDefined();

    await userEvent.click(screen.getByRole('button', { name: 'Esborrar el plat' }));
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(await repo.getDish(dish.id)).toBeUndefined();
  });

  it('la categoria capritx es diu curt, però el lector de pantalla la diu sencera', async () => {
    await renderForm();
    const radio = screen.getByRole('radio', { name: 'Capritx per un dia' });
    expect(radio.closest('label')).toHaveTextContent(/^Capritx$/);
  });

  it('un plat nou no es pot esborrar', async () => {
    await renderForm();
    expect(screen.queryByRole('button', { name: 'Esborrar el plat' })).not.toBeInTheDocument();
  });

  it('"Tornar" no desa res', async () => {
    const { onBack } = await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'A mig fer');
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(await userDishes()).toEqual([]);
  });
});
