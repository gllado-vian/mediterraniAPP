import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { buildBackup } from '../domain/backup';
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

  describe('còpia de seguretat', () => {
    let downloads: { name: string; json: unknown }[];

    beforeEach(() => {
      downloads = [];
      const blobs = new Map<string, Blob>();
      vi.stubGlobal('URL', {
        ...URL,
        createObjectURL: (blob: Blob) => {
          const url = `blob:test/${blobs.size}`;
          blobs.set(url, blob);
          return url;
        },
        revokeObjectURL: () => {},
      });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        const blob = blobs.get(this.href)!;
        downloads.push({ name: this.download, json: null });
        const entry = downloads[downloads.length - 1];
        void blob.text().then((text) => (entry.json = JSON.parse(text)));
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    const otherHouse = () =>
      buildBackup(
        {
          house: { id: 'casa-vella', createdAt: '2026-09-01T10:00:00.000Z' },
          settings: { capritxMarginDays: 3 },
          dishes: [
            { id: 'u-vell', name: 'Escudella de la iaia', category: 'llegum', ingredients: ['Cigrons'], prepMinutes: 90, source: 'user' },
          ],
          days: [
            { date: '2026-09-20', lunch: 'peix' },
            { date: '2026-09-21', dinner: { status: 'unknown' } },
          ],
        },
        new Date('2026-09-27T20:00:00.000Z'),
      );

    const fileOf = (text: string) => new File([text], 'copia.json', { type: 'application/json' });

    it('exportar baixa un fitxer amb totes les dades', async () => {
      await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
      await renderSettings();
      await userEvent.click(screen.getByRole('button', { name: 'Exportar les dades' }));
      expect(await screen.findByText('Fet! Ja tens el fitxer a les baixades.')).toBeInTheDocument();
      await vi.waitFor(() => expect(downloads[0]?.json).not.toBeNull());
      expect(downloads[0].name).toBe('que-sopem-2026-09-28.json');
      expect(downloads[0].json).toMatchObject({ app: 'que-sopem', dishes: [{ name: 'Amanida' }] });
    });

    it('un fitxer que no és una còpia ho diu i no toca res', async () => {
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf('hola'));
      expect(await screen.findByText('Aquest fitxer no és una còpia de Què sopem.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Substituir' })).not.toBeInTheDocument();
    });

    it('abans de substituir, ensenya què hi ha al fitxer i "Cancel·lar" no toca res', async () => {
      const mine = await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(otherHouse())));
      expect(
        await screen.findByText('Aquest fitxer té 1 plat propi i 2 dies apuntats. Substituirà tot el que hi ha en aquest mòbil.'),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel·lar' }));
      expect(screen.queryByRole('button', { name: 'Substituir' })).not.toBeInTheDocument();
      expect(await repo.getDish(mine.id)).toBeDefined();
      expect(downloads).toEqual([]);
    });

    it('"Substituir" baixa abans una còpia del mòbil i després ho substitueix tot', async () => {
      const mine = await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(otherHouse())));
      const keep = await screen.findByRole('checkbox', { name: 'Abans, baixa una còpia del que hi ha ara' });
      expect(keep).toBeChecked();
      await userEvent.click(screen.getByRole('button', { name: 'Substituir' }));
      expect(await screen.findByText('Fet! Ja tens les dades del fitxer.')).toBeInTheDocument();

      await vi.waitFor(() => expect(downloads[0]?.json).not.toBeNull());
      expect(downloads).toHaveLength(1);
      expect(downloads[0].name).toBe('que-sopem-2026-09-28-abans-d-importar.json');
      expect(downloads[0].json).toMatchObject({ dishes: [{ name: 'Amanida' }] });

      expect(await repo.getDish(mine.id)).toBeUndefined();
      expect((await repo.getDish('u-vell'))?.name).toBe('Escudella de la iaia');
      expect(await repo.getSettings()).toEqual({ capritxMarginDays: 3 });
      expect(within(screen.getByRole('group', { name: 'Marge entre capritxos' })).getByText('3 dies')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Els meus plats/ })).toHaveTextContent('1 plat propi');
    });

    it('si es desmarca la còpia prèvia, substitueix sense baixar res', async () => {
      await repo.addUserDish({ name: 'Amanida', category: 'vegetaria', ingredients: [], prepMinutes: null });
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(otherHouse())));
      await userEvent.click(await screen.findByRole('checkbox', { name: 'Abans, baixa una còpia del que hi ha ara' }));
      await userEvent.click(screen.getByRole('button', { name: 'Substituir' }));
      expect(await screen.findByText('Fet! Ja tens les dades del fitxer.')).toBeInTheDocument();
      expect(downloads).toEqual([]);
    });

    it('el resum es llegeix bé encara que el fitxer no tingui plats propis', async () => {
      await renderSettings();
      const backup = { ...otherHouse(), dishes: [] };
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(backup)));
      expect(
        await screen.findByText('Aquest fitxer té 2 dies apuntats (sense plats propis). Substituirà tot el que hi ha en aquest mòbil.'),
      ).toBeInTheDocument();
    });

    it('mentre es confirma, els botons d’exportar i importar s’amaguen', async () => {
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(otherHouse())));
      await screen.findByRole('button', { name: 'Substituir' });
      expect(screen.queryByRole('button', { name: 'Exportar les dades' })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel·lar' }));
      expect(screen.getByRole('button', { name: 'Exportar les dades' })).toBeInTheDocument();
    });

    it('en un mòbil sense res apuntat no ofereix la còpia prèvia', async () => {
      await renderSettings();
      await userEvent.upload(screen.getByLabelText('Importar un fitxer'), fileOf(JSON.stringify(otherHouse())));
      await screen.findByRole('button', { name: 'Substituir' });
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });
});
