import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as db from './db/db';
import { createRepository } from './db/repository';
import { addDays, toIsoDate } from './domain/dates';
import { App } from './App';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('explica el problema si no es poden obrir les dades del dispositiu', async () => {
    vi.spyOn(db, 'openAppDb').mockRejectedValueOnce(new Error('IndexedDB no disponible'));
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'No puc obrir les dades' }),
    ).toBeInTheDocument();
  });

  it('canviar plat amb el swipe i tornar a Avui amb el plat confirmat', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
    const real = db.openAppDb;
    vi.spyOn(db, 'openAppDb').mockImplementation(() => real(`app-${Date.now()}`));
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Canviar plat' }));
    const card = await screen.findByRole('article', { name: /^Plat proposat/ });
    const chosen = within(card).getByRole('heading', { level: 2 }).textContent!;
    await userEvent.click(screen.getByRole('button', { name: 'Aquest!' }));
    expect(await screen.findByText('Bon profit!')).toBeInTheDocument();
    const today = screen.getByRole('article', { name: 'Plat del dia' });
    expect(within(today).getByText(chosen)).toBeInTheDocument();
  });

  it('tornar del swipe no canvia res', async () => {
    const real = db.openAppDb;
    vi.spyOn(db, 'openAppDb').mockImplementation(() => real(`app-back-${Date.now()}`));
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Canviar plat' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Tornar' }));
    expect(await screen.findByRole('button', { name: 'Sopem això' })).toBeInTheDocument();
  });

  it('"Una altra cosa" a l’avís d’ahir tria el sopar d’ahir amb el swipe', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
    const real = db.openAppDb;
    const name = `app-ahir-${Date.now()}`;
    const repo = createRepository(await real(name));
    await repo.ensureHouse(new Date(2026, 0, 1));
    vi.spyOn(db, 'openAppDb').mockImplementation(() => real(name));
    render(<App />);

    const region = await screen.findByRole('region', { name: 'Sopar d’ahir' });
    await userEvent.click(within(region).getByRole('button', { name: 'Una altra cosa' }));
    await screen.findByRole('heading', { name: 'Què vas sopar ahir?' });
    const card = await screen.findByRole('article', { name: /^Plat proposat/ });
    const chosen = within(card).getByRole('heading', { level: 2 }).textContent;
    await userEvent.click(screen.getByRole('button', { name: 'Aquest!' }));

    expect(await screen.findByRole('button', { name: 'Sopem això' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Sopar d’ahir' })).not.toBeInTheDocument();
    const yesterday = addDays(toIsoDate(new Date()), -1);
    expect((await repo.getDay(yesterday))?.dinner).toMatchObject({ dishName: chosen });
  });
});
