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

async function renderToday(onOpenSwipe = vi.fn(), now = () => MONDAY) {
  const store = createAppStore({ repo, now });
  render(
    <AppStoreProvider store={store}>
      <TodayScreen onOpenSwipe={onOpenSwipe} onPickYesterday={vi.fn()} onNavigate={vi.fn()} />
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
    // La fila ja hi és abans de confirmar: cal esperar que es refresqui.
    const week = screen.getByRole('list', { name: 'La teva setmana' });
    await vi.waitFor(() =>
      expect(within(week).getAllByRole('listitem')[0]).toHaveAccessibleName('Dilluns: Peix'),
    );
  });

  it('tocar el plat del dia gira la rajola i ensenya el +info', async () => {
    await renderToday();
    await userEvent.click(screen.getByRole('article', { name: 'Plat del dia' }));
    const card = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(card).getByRole('list', { name: 'Ingredients' })).toBeInTheDocument();
    expect(within(card).getByText('No l’has fet mai')).toBeInTheDocument();
    await userEvent.click(card);
    expect(within(card).queryByRole('list', { name: 'Ingredients' })).not.toBeInTheDocument();
  });

  it('el +info d’un plat confirmat avui diu que és d’avui', async () => {
    await renderToday();
    await userEvent.click(screen.getByRole('button', { name: 'Sopem això' }));
    await screen.findByText('Bon profit!');
    await userEvent.click(screen.getByRole('article', { name: 'Plat del dia' }));
    const card = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(card).getByText('Avui')).toBeInTheDocument();
    expect(within(card).getByText('1 cop aquest mes')).toBeInTheDocument();
  });

  it('tocar la setmana obre el resum', async () => {
    const onNavigate = vi.fn();
    const store = createAppStore({ repo, now: () => MONDAY });
    render(
      <AppStoreProvider store={store}>
        <TodayScreen onOpenSwipe={vi.fn()} onPickYesterday={vi.fn()} onNavigate={onNavigate} />
      </AppStoreProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Veure el resum de la setmana' }));
    expect(onNavigate).toHaveBeenCalledWith('week');
  });

  it('des del menú es va a Ajustos', async () => {
    const onNavigate = vi.fn();
    const store = createAppStore({ repo, now: () => MONDAY });
    render(
      <AppStoreProvider store={store}>
        <TodayScreen onOpenSwipe={vi.fn()} onPickYesterday={vi.fn()} onNavigate={onNavigate} />
      </AppStoreProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Menú' }));
    expect(screen.getByRole('button', { name: 'Avui' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Ajustos' }));
    expect(onNavigate).toHaveBeenCalledWith('settings');
  });

  it('carrega el recetari base en obrir l’app', async () => {
    await renderToday();
    expect(await repo.listDishes()).toHaveLength(BASE_RECIPES.length);
  });

  it('mostra el sopar confirmat encara que el plat s’hagi esborrat', async () => {
    const mine = await repo.addUserDish({
      name: 'Truita de carbassó',
      category: 'ou',
      ingredients: ['Ous'],
      prepMinutes: 20,
    });
    await repo.confirmDinner('2026-09-28', mine);
    await repo.deleteUserDish(mine.id);
    await renderToday();
    const card = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(card).getByText('Truita de carbassó')).toBeInTheDocument();
    expect(screen.getByText('Bon profit!')).toBeInTheDocument();
  });

  it('canvia de dia quan l’app torna a primer pla després de mitjanit', async () => {
    let now = MONDAY;
    await renderToday(vi.fn(), () => now);
    now = new Date(2026, 8, 29, 19, 0);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(await screen.findByRole('heading', { name: 'Dimarts, 29 de setembre' })).toBeInTheDocument();
  });

  describe('dinar', () => {
    it('ofereix les categories amb el nom sencer, en l’ordre de la llista, i "Una altra cosa"', async () => {
      await renderToday();
      const group = screen.getByRole('group', { name: 'Què has dinat avui?' });
      expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual([
        'Peix',
        'Ou',
        'Llegum',
        'Carn magra',
        'Vegetarià pur',
        'Una altra cosa',
      ]);
    });

    it('una categoria esborrada ja no surt al dinar', async () => {
      await repo.archiveCategory('carn');
      await renderToday();
      const group = screen.getByRole('group', { name: 'Què has dinat avui?' });
      expect(within(group).queryByRole('button', { name: 'Carn magra' })).not.toBeInTheDocument();
    });

    it('registrar el dinar el desa i, si coincideix, substitueix la proposta', async () => {
      await renderToday();
      await userEvent.click(screen.getByRole('button', { name: 'Peix' }));
      expect(await screen.findByText('Canviat perquè has dinat peix')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Peix' })).toHaveAttribute('aria-pressed', 'true');
      expect((await repo.getDay('2026-09-28'))?.lunch).toBe('peix');
      const card = screen.getByRole('article', { name: 'Plat del dia' });
      expect(within(card).queryByText('Sardines al forn')).not.toBeInTheDocument();
    });

    it('tornar a tocar l’opció marcada l’esborra', async () => {
      await renderToday();
      await userEvent.click(screen.getByRole('button', { name: 'Peix' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Peix', pressed: true }));
      await vi.waitFor(() =>
        expect(screen.queryByText('Canviat perquè has dinat peix')).not.toBeInTheDocument(),
      );
      expect((await repo.getDay('2026-09-28'))?.lunch).toBeUndefined();
    });

    it('"Una altra cosa" no veta cap categoria', async () => {
      await renderToday();
      await userEvent.click(screen.getByRole('button', { name: 'Una altra cosa' }));
      const card = screen.getByRole('article', { name: 'Plat del dia' });
      expect(within(card).getByText('Sardines al forn')).toBeInTheDocument();
    });

    it('amb el sopar confirmat, el dinar ja no es pot canviar', async () => {
      await renderToday();
      await userEvent.click(screen.getByRole('button', { name: 'Sopem això' }));
      await screen.findByText('Bon profit!');
      expect(screen.queryByRole('group', { name: 'Què has dinat avui?' })).not.toBeInTheDocument();
    });
  });

  describe('avís d’ahir', () => {
    it('no pregunta per ahir el dia que s’instal·la l’app', async () => {
      await renderToday();
      expect(screen.queryByRole('region', { name: 'Sopar d’ahir' })).not.toBeInTheDocument();
    });

    it('pregunta si ahir es va sopar el plat proposat i "Sí" el confirma', async () => {
      await repo.ensureHouse(new Date(2026, 8, 20));
      await renderToday();
      const region = screen.getByRole('region', { name: 'Sopar d’ahir' });
      expect(within(region).getByText('Ahir: vas sopar Sardines al forn?')).toBeInTheDocument();
      await userEvent.click(within(region).getByRole('button', { name: 'Sí' }));
      await vi.waitFor(() =>
        expect(screen.queryByRole('region', { name: 'Sopar d’ahir' })).not.toBeInTheDocument(),
      );
      expect((await repo.getDay('2026-09-27'))?.dinner).toMatchObject({
        status: 'confirmed',
        dishId: 'base-sardines-forn',
      });
    });

    it('"No ho recordo" deixa ahir en blanc', async () => {
      await repo.ensureHouse(new Date(2026, 8, 20));
      await renderToday();
      await userEvent.click(screen.getByRole('button', { name: 'No ho recordo' }));
      await vi.waitFor(() =>
        expect(screen.queryByRole('region', { name: 'Sopar d’ahir' })).not.toBeInTheDocument(),
      );
      expect((await repo.getDay('2026-09-27'))?.dinner).toEqual({ status: 'unknown' });
    });

    it('"Un altre plat" obre el swipe per a ahir', async () => {
      await repo.ensureHouse(new Date(2026, 8, 20));
      const onPickYesterday = vi.fn();
      const store = createAppStore({ repo, now: () => MONDAY });
      render(
        <AppStoreProvider store={store}>
          <TodayScreen onOpenSwipe={vi.fn()} onPickYesterday={onPickYesterday} onNavigate={vi.fn()} />
        </AppStoreProvider>,
      );
      const region = await screen.findByRole('region', { name: 'Sopar d’ahir' });
      await userEvent.click(within(region).getByRole('button', { name: 'Un altre plat' }));
      expect(onPickYesterday).toHaveBeenCalledWith('2026-09-27');
    });

    it('no pregunta si ahir ja està resolt', async () => {
      await repo.ensureHouse(new Date(2026, 8, 20));
      await repo.markDinnerUnknown('2026-09-27');
      await renderToday();
      expect(screen.queryByRole('region', { name: 'Sopar d’ahir' })).not.toBeInTheDocument();
    });
  });

  it('si no hi ha res per proposar, ho diu i porta a revisar les categories', async () => {
    for (const id of ['peix', 'ou', 'llegum', 'carn', 'vegetaria']) await repo.updateCategory(id, { quota: 0 });
    const onNavigate = vi.fn();
    const store = createAppStore({ repo, now: () => MONDAY });
    render(
      <AppStoreProvider store={store}>
        <TodayScreen onOpenSwipe={vi.fn()} onPickYesterday={vi.fn()} onNavigate={onNavigate} />
      </AppStoreProvider>,
    );
    expect(await screen.findByText('No tenim cap sopar per proposar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sopem això' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Revisar les categories' }));
    expect(onNavigate).toHaveBeenCalledWith('settings');
  });
});
