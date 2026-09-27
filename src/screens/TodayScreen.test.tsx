import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { BASE_RECIPES } from '../domain/baseRecipes';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { TodayScreen } from './TodayScreen';

const MONDAY = new Date(2026, 8, 28, 20, 0);
let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`today-${++n}`));
});

async function renderToday(onOpenSwipe = vi.fn()) {
  const store = createAppStore({ repo, now: () => MONDAY });
  render(
    <AppStoreProvider store={store}>
      <TodayScreen onOpenSwipe={onOpenSwipe} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'Dilluns, 28 de setembre' });
  return { store, onOpenSwipe };
}

describe('TodayScreen', () => {
  it('mostra el plat del dia amb la seva categoria i temps', async () => {
    await renderToday();
    const card = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(card).getByText('Sardines al forn')).toBeInTheDocument();
    expect(within(card).getByText('Peix')).toBeInTheDocument();
    expect(within(card).getByText('25 min')).toBeInTheDocument();
  });

  it('confirmar desa el sopar i mostra l’estat confirmat', async () => {
    await renderToday();
    await userEvent.click(screen.getByRole('button', { name: 'Sopem això' }));
    expect(await screen.findByText('Bon profit!')).toBeInTheDocument();
    expect((await repo.getDay('2026-09-28'))?.dinner).toMatchObject({
      status: 'confirmed',
      dishId: 'base-sardines-forn',
    });
    expect(screen.queryByRole('button', { name: 'Sopem això' })).not.toBeInTheDocument();
  });

  it('desfer torna a la proposta', async () => {
    await renderToday();
    await userEvent.click(screen.getByRole('button', { name: 'Sopem això' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Desfer' }));
    expect(await screen.findByRole('button', { name: 'Sopem això' })).toBeInTheDocument();
    expect((await repo.getDay('2026-09-28'))?.dinner).toBeUndefined();
  });

  it('avisa quan la proposta s’ha canviat pel dinar', async () => {
    await repo.setLunch('2026-09-28', 'peix');
    await renderToday();
    expect(screen.getByText('Canviat perquè has dinat peix')).toBeInTheDocument();
    const card = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(card).queryByText('Peix')).not.toBeInTheDocument();
  });

  it('el botó Canviar plat obre el swipe', async () => {
    const { onOpenSwipe } = await renderToday();
    await userEvent.click(screen.getByRole('button', { name: 'Canviar plat' }));
    expect(onOpenSwipe).toHaveBeenCalledOnce();
  });

  it('mostra la fila de la setmana amb avui marcat', async () => {
    await renderToday();
    const week = screen.getByRole('list', { name: 'La teva setmana' });
    const tiles = within(week).getAllByRole('listitem');
    expect(tiles.map((t) => t.textContent)).toEqual(['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']);
    expect(tiles[0]).toHaveAttribute('aria-current', 'date');
  });

  it('la rajola del dia confirmat porta el nom de la categoria', async () => {
    await renderToday();
    await userEvent.click(screen.getByRole('button', { name: 'Sopem això' }));
    const week = await screen.findByRole('list', { name: 'La teva setmana' });
    expect(within(week).getAllByRole('listitem')[0]).toHaveAccessibleName('Dilluns: Peix');
  });

  it('carrega el recetari base en obrir l’app', async () => {
    await renderToday();
    expect(await repo.listDishes()).toHaveLength(BASE_RECIPES.length);
  });
});
