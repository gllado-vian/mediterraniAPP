import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { BASE_RECIPES } from '../domain/baseRecipes';
import type { Category } from '../domain/categories';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { SummaryScreen } from './SummaryScreen';

// Dijous 01/10/2026 (setmana del 28/09 al 04/10)
const THURSDAY = new Date(2026, 9, 1, 20, 0);
let repo: Repository;
let n = 0;

const firstOf = (cat: Category) => BASE_RECIPES.find((d) => d.category === cat)!;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`summary-${++n}`));
});

async function renderSummary(onBack = vi.fn()) {
  const store = createAppStore({ repo, now: () => THURSDAY });
  render(
    <AppStoreProvider store={store}>
      <SummaryScreen onBack={onBack} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'La teva setmana' });
  await screen.findByRole('list', { name: 'Resum per categoria' });
  return { onBack };
}

function rowOf(label: string) {
  const list = screen.getByRole('list', { name: 'Resum per categoria' });
  return within(list)
    .getAllByRole('listitem')
    .find((li) => within(li).queryByText(label))!;
}

describe('SummaryScreen', () => {
  it('mostra una fila per categoria en l’ordre de l’especificació', async () => {
    await renderSummary();
    const list = screen.getByRole('list', { name: 'Resum per categoria' });
    const labels = within(list)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('[data-label]')?.textContent);
    expect(labels).toEqual(['Peix', 'Ou', 'Llegum', 'Carn magra', 'Vegetarià pur']);
  });

  it('marca "complerta" o "x/y · pendent" segons la setmana', async () => {
    await repo.confirmDinner('2026-09-28', firstOf('peix'));
    await repo.confirmDinner('2026-09-29', firstOf('llegum'));
    await renderSummary();
    expect(within(rowOf('Peix')).getByText('1/2 · pendent')).toBeInTheDocument();
    expect(within(rowOf('Llegum')).getByText('complerta')).toBeInTheDocument();
    expect(within(rowOf('Ou')).getByText('0/2 · pendent')).toBeInTheDocument();
  });

  it('compta els capritxos a part', async () => {
    await repo.confirmDinner('2026-09-30', firstOf('capritx'));
    await renderSummary();
    expect(screen.getByText('Capritxos aquesta setmana: 1')).toBeInTheDocument();
  });

  it('sense capritxos ho diu clar', async () => {
    await renderSummary();
    expect(screen.getByText('Cap capritx aquesta setmana')).toBeInTheDocument();
  });

  it('mostra també la fila de la setmana', async () => {
    await renderSummary();
    const week = screen.getByRole('list', { name: 'La teva setmana' });
    expect(within(week).getAllByRole('listitem')).toHaveLength(7);
  });

  it('"Tornar" torna a Avui', async () => {
    const { onBack } = await renderSummary();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
