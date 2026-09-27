import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { MyDishesScreen } from './MyDishesScreen';

let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`my-dishes-${++n}`));
});

async function renderList() {
  const props = { onBack: vi.fn(), onNavigate: vi.fn(), onAdd: vi.fn(), onEdit: vi.fn() };
  const store = createAppStore({ repo, now: () => new Date(2026, 8, 28, 20) });
  render(
    <AppStoreProvider store={store}>
      <MyDishesScreen {...props} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'Els meus plats' });
  await screen.findByRole('button', { name: 'Afegir un plat' });
  return props;
}

describe('MyDishesScreen', () => {
  it('sense plats propis explica per a què serveixen', async () => {
    await renderList();
    expect(screen.getByText('Els plats que afegeixis sortiran primer a les propostes.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Els meus plats' })).not.toBeInTheDocument();
  });

  it('llista només els plats propis', async () => {
    await repo.addUserDish({ name: 'Truita de carbassó', category: 'ou', ingredients: [], prepMinutes: 20 });
    await renderList();
    const list = await screen.findByRole('list', { name: 'Els meus plats' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('Truita de carbassó')).toBeInTheDocument();
    expect(within(items[0]).getByText('Ou · 20 min')).toBeInTheDocument();
  });

  it('"Afegir un plat" obre el formulari', async () => {
    const { onAdd } = await renderList();
    await userEvent.click(screen.getByRole('button', { name: 'Afegir un plat' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('tocar un plat l’obre per editar-lo', async () => {
    const dish = await repo.addUserDish({ name: 'Amanida verda', category: 'vegetaria', ingredients: [], prepMinutes: null });
    const { onEdit } = await renderList();
    await userEvent.click(await screen.findByRole('button', { name: /Amanida verda/ }));
    expect(onEdit).toHaveBeenCalledWith(dish.id);
  });

  it('té la fletxa de tornar i el menú', async () => {
    const { onBack, onNavigate } = await renderList();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Menú' }));
    await userEvent.click(screen.getByRole('button', { name: 'Avui' }));
    expect(onNavigate).toHaveBeenCalledWith('today');
  });
});
