import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { BASE_RECIPES } from '../domain/baseRecipes';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { SwipeScreen } from './SwipeScreen';

const MONDAY = new Date(2026, 8, 28, 20, 0);
let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`swipe-${++n}`));
  // Per defecte, "reduir moviment": les decisions són immediates (sense animació de sortida).
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderSwipe(props: Partial<Parameters<typeof SwipeScreen>[0]> = {}) {
  const store = createAppStore({ repo, now: () => MONDAY });
  const onDone = vi.fn();
  const onBack = vi.fn();
  render(
    <AppStoreProvider store={store}>
      <SwipeScreen onDone={onDone} onBack={onBack} {...props} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'Tria un altre plat' });
  await screen.findByRole('article', { name: /^Plat proposat/ });
  return { onDone, onBack };
}

function currentCard() {
  return screen.getByRole('article', { name: /^Plat proposat/ });
}

function tap(card: HTMLElement) {
  fireEvent.pointerDown(card, { clientX: 200, clientY: 300, pointerId: 1 });
  fireEvent.pointerUp(card, { clientX: 202, clientY: 301, pointerId: 1 });
}

function topCardName() {
  const card = screen.getByRole('article', { name: /^Plat proposat/ });
  return within(card).getByRole('heading', { level: 2 }).textContent;
}

describe('SwipeScreen', () => {
  it('mostra primer el plat que millor equilibra la setmana', async () => {
    await renderSwipe();
    // Dilluns sense historial: Peix ja és a la pantalla Avui; comença per Ou
    expect(topCardName()).toBe('Truita remenada de verdures');
  });

  it('"Un altre" descarta i passa al següent', async () => {
    await renderSwipe();
    const first = topCardName();
    await userEvent.click(screen.getByRole('button', { name: 'Un altre' }));
    expect(topCardName()).not.toBe(first);
  });

  it('"Aquest!" confirma el plat i torna', async () => {
    const { onDone } = await renderSwipe();
    await userEvent.click(screen.getByRole('button', { name: 'Aquest!' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getDay('2026-09-28'))?.dinner).toMatchObject({
      status: 'confirmed',
      dishId: 'base-revuelto-verdures',
    });
  });

  it('les fletxes del teclat descarten i confirmen', async () => {
    const { onDone } = await renderSwipe();
    const first = topCardName();
    await userEvent.keyboard('{ArrowLeft}');
    const second = topCardName();
    expect(second).not.toBe(first);
    await userEvent.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    const saved = await repo.getDay('2026-09-28');
    expect(saved?.dinner && 'dishName' in saved.dinner ? saved.dinner.dishName : null).toBe(second);
  });

  it('lliscar cap a la dreta confirma (amb animació de sortida)', async () => {
    vi.unstubAllGlobals();
    const { onDone } = await renderSwipe();
    const card = screen.getByRole('article', { name: /^Plat proposat/ });
    fireEvent.pointerDown(card, { clientX: 100, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(card, { clientX: 320, clientY: 310, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 320, clientY: 310, pointerId: 1 });
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  });

  it('lliscar cap a l’esquerra descarta', async () => {
    await renderSwipe();
    const first = topCardName();
    const card = screen.getByRole('article', { name: /^Plat proposat/ });
    fireEvent.pointerDown(card, { clientX: 300, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(card, { clientX: 80, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 80, clientY: 300, pointerId: 1 });
    await vi.waitFor(() => expect(topCardName()).not.toBe(first));
  });

  it('tocar la targeta la gira i ensenya el +info sense descartar-la', async () => {
    await renderSwipe();
    const first = topCardName();
    tap(currentCard());
    const card = currentCard();
    expect(within(card).getByRole('list', { name: 'Ingredients' })).toBeInTheDocument();
    expect(within(card).getByText('No l’has fet mai')).toBeInTheDocument();
    expect(within(card).getByText('Cap cop aquest mes')).toBeInTheDocument();
    expect(topCardName()).toBe(first);
  });

  it('tornar a tocar la targeta la torna de cara', async () => {
    await renderSwipe();
    tap(currentCard());
    tap(currentCard());
    expect(within(currentCard()).queryByRole('list', { name: 'Ingredients' })).not.toBeInTheDocument();
  });

  it('amb el teclat, Retorn gira la targeta', async () => {
    await renderSwipe();
    currentCard().focus();
    await userEvent.keyboard('{Enter}');
    expect(within(currentCard()).getByRole('list', { name: 'Ingredients' })).toBeInTheDocument();
  });

  it('el plat següent surt de cara', async () => {
    await renderSwipe();
    tap(currentCard());
    await userEvent.click(screen.getByRole('button', { name: 'Un altre' }));
    expect(within(currentCard()).queryByRole('list', { name: 'Ingredients' })).not.toBeInTheDocument();
  });

  it('els capritxos surten al final marcats com a no recomanats', async () => {
    await renderSwipe();
    const recommended = BASE_RECIPES.filter((d) => d.category !== 'capritx').length - 1;
    for (let i = 0; i < recommended; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'Un altre' }));
    }
    expect(topCardName()).toBe('Pizza casolana');
    expect(screen.getByText('No recomanat')).toBeInTheDocument();
  });

  it('avisa del marge si fa poc de l’últim capritx', async () => {
    await repo.confirmDinner('2026-09-25', BASE_RECIPES.find((d) => d.id === 'base-pizza-casolana')!);
    await renderSwipe();
    let guard = 30;
    while (topCardName() !== 'Croquetes casolanes' && guard--) {
      await userEvent.click(screen.getByRole('button', { name: 'Un altre' }));
    }
    expect(screen.getByText('Fa 3 dies de l’últim capritx (el teu marge és de 7).')).toBeInTheDocument();
  });

  it('quan s’acaben els plats, permet tornar a començar', async () => {
    await renderSwipe();
    let guard = 40;
    while (screen.queryByRole('button', { name: 'Un altre' }) && guard--) {
      await userEvent.click(screen.getByRole('button', { name: 'Un altre' }));
    }
    expect(screen.getByText('No queden més plats')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar a començar' }));
    expect(topCardName()).toBe('Truita remenada de verdures');
  });

  it('el botó de tornar surt sense desar res', async () => {
    const { onBack } = await renderSwipe();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(await repo.getDay('2026-09-28')).toBeUndefined();
  });

  it('per a ahir pregunta què vas sopar i desa el plat a ahir', async () => {
    const store = createAppStore({ repo, now: () => MONDAY });
    const onDone = vi.fn();
    render(
      <AppStoreProvider store={store}>
        <SwipeScreen date="2026-09-27" onDone={onDone} onBack={vi.fn()} />
      </AppStoreProvider>,
    );
    expect(await screen.findByRole('heading', { name: 'Què vas sopar ahir?' })).toBeInTheDocument();
    await screen.findByRole('article', { name: /^Plat proposat/ });
    const chosen = topCardName();
    await userEvent.click(screen.getByRole('button', { name: 'Aquest!' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getDay('2026-09-27'))?.dinner).toMatchObject({ dishName: chosen });
    expect(await repo.getDay('2026-09-28')).toBeUndefined();
  });
});
