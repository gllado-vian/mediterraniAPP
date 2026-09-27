import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { SettingsScreen } from './SettingsScreen';

let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`settings-${++n}`));
});

async function renderSettings() {
  const onBack = vi.fn();
  const onNavigate = vi.fn();
  const onOpenMyDishes = vi.fn();
  const store = createAppStore({ repo, now: () => new Date(2026, 8, 28, 20) });
  render(
    <AppStoreProvider store={store}>
      <SettingsScreen onBack={onBack} onNavigate={onNavigate} onOpenMyDishes={onOpenMyDishes} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'Ajustos' });
  const group = await screen.findByRole('group', { name: 'Marge entre capritxos' });
  return { onBack, onNavigate, onOpenMyDishes, group };
}

describe('SettingsScreen', () => {
  it('mostra el marge de capritx actual', async () => {
    const { group } = await renderSettings();
    expect(within(group).getByText('7 dies')).toBeInTheDocument();
  });

  it('"+" augmenta el marge i el desa', async () => {
    const { group } = await renderSettings();
    await userEvent.click(within(group).getByRole('button', { name: 'Un dia més' }));
    expect(await within(group).findByText('8 dies')).toBeInTheDocument();
    expect((await repo.getSettings()).capritxMarginDays).toBe(8);
  });

  it('diu "1 dia" en singular i no baixa de 0', async () => {
    await repo.updateSettings({ capritxMarginDays: 1 });
    const { group } = await renderSettings();
    expect(within(group).getByText('1 dia')).toBeInTheDocument();
    const less = within(group).getByRole('button', { name: 'Un dia menys' });
    await userEvent.click(less);
    expect(await within(group).findByText('0 dies')).toBeInTheDocument();
    expect(less).toBeDisabled();
  });

  it('no passa de 30 dies', async () => {
    await repo.updateSettings({ capritxMarginDays: 30 });
    const { group } = await renderSettings();
    expect(within(group).getByRole('button', { name: 'Un dia més' })).toBeDisabled();
  });

  it('té el menú i la fletxa de tornar', async () => {
    const { onBack, onNavigate } = await renderSettings();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Menú' }));
    await userEvent.click(screen.getByRole('button', { name: 'La teva setmana' }));
    expect(onNavigate).toHaveBeenCalledWith('week');
  });

  it('porta a "Els meus plats" i diu quants n’hi ha', async () => {
    const { onOpenMyDishes } = await renderSettings();
    const link = screen.getByRole('button', { name: /Els meus plats/ });
    expect(link).toHaveTextContent('Encara no n’has afegit cap');
    await userEvent.click(link);
    expect(onOpenMyDishes).toHaveBeenCalledOnce();
  });

  it('compta els plats propis', async () => {
    await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
    await repo.addUserDish({ name: 'Truita', category: 'ou', ingredients: [], prepMinutes: null });
    await renderSettings();
    expect(screen.getByRole('button', { name: /Els meus plats/ })).toHaveTextContent('2 plats propis');
  });
});
