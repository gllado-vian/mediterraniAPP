import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { CategoryFormScreen } from './CategoryFormScreen';

let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`category-form-${++n}`));
});

async function renderForm(categoryId?: string) {
  const onDone = vi.fn();
  const onBack = vi.fn();
  const store = createAppStore({ repo, now: () => new Date(2026, 8, 28, 20) });
  render(
    <AppStoreProvider store={store}>
      <CategoryFormScreen categoryId={categoryId} onDone={onDone} onBack={onBack} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: categoryId ? 'Editar categoria' : 'Nova categoria' });
  await screen.findByRole('button', { name: 'Desar' });
  return { onDone, onBack };
}

const own = async () => (await repo.getCategories()).filter((c) => c.id.startsWith('c-'));

describe('CategoryFormScreen', () => {
  it('crea una categoria amb nom, icona, color i vegades', async () => {
    await repo.updateCategory('peix', { quota: 1 });
    const { onDone } = await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Arròs i pasta');
    await userEvent.click(screen.getByRole('radio', { name: 'Bol' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Lavanda' }));
    expect(screen.getByText('1 vegada')).toBeInTheDocument(); // hi ha un sopar lliure: per defecte, 1
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(await own()).toEqual([
      expect.objectContaining({ name: 'Arròs i pasta', icon: 'bowl-spoon', color: '#A395C2', quota: 1 }),
    ]);
  });

  it('amb la setmana plena, una categoria nova comença amb 0 vegades i no es pot sumar', async () => {
    await renderForm();
    expect(screen.getByText('0 vegades')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Una vegada més' })).toBeDisabled();
  });

  it('els colors que ja fa servir una altra categoria no es poden triar', async () => {
    await renderForm();
    const blue = screen.getByRole('radio', { name: 'Blau de mar (el fa servir Peix)' });
    expect(blue).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Safrà' })).toBeEnabled();
  });

  it('diu l’error al costat del camp', async () => {
    const { onDone } = await renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    expect(await screen.findByText('Posa-li un nom a la categoria.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(screen.getByLabelText('Nom'), 'Peix');
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    expect(await screen.findByText('Ja tens una categoria amb aquest nom.')).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('edita una categoria', async () => {
    const { onDone } = await renderForm('carn');
    expect(screen.getByLabelText('Nom')).toHaveValue('Carn magra');
    expect(screen.getByRole('radio', { name: 'Carn' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Terracota rosada' })).toBeChecked();
    await userEvent.clear(screen.getByLabelText('Nom'));
    await userEvent.type(screen.getByLabelText('Nom'), 'Carn');
    await userEvent.click(screen.getByRole('radio', { name: 'Safrà' }));
    await userEvent.click(screen.getByRole('button', { name: 'Una vegada menys' }));
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getCategories()).find((c) => c.id === 'carn')).toMatchObject({
      name: 'Carn', color: '#D98F4E', quota: 0,
    });
  });

  it('esborra una categoria amb confirmació', async () => {
    const { onDone } = await renderForm('carn');
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar la categoria' }));
    expect(screen.getByText('Deixarem de proposar-la. Els sopars que ja has fet es queden a la setmana.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'No, deixa-la' }));
    expect((await repo.getCategories()).find((c) => c.id === 'carn')?.archived).toBeFalsy();
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar la categoria' }));
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getCategories()).find((c) => c.id === 'carn')?.archived).toBe(true);
  });

  it('no deixa esborrar una categoria amb plats propis i diu per què', async () => {
    await repo.addUserDish({ name: 'Llom', category: 'carn', ingredients: [], prepMinutes: null });
    await renderForm('carn');
    await userEvent.click(screen.getByRole('button', { name: 'Esborrar la categoria' }));
    expect(
      screen.getByText('No la pots esborrar: hi tens 1 plat propi. Canvia’l de categoria o esborra’l primer.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Esborrar' })).not.toBeInTheDocument();
  });

  it('una categoria nova no es pot esborrar', async () => {
    await renderForm();
    expect(screen.queryByRole('button', { name: 'Esborrar la categoria' })).not.toBeInTheDocument();
  });

  it('escriure el nom d’una categoria esborrada la recupera', async () => {
    await repo.archiveCategory('carn');
    const { onDone } = await renderForm();
    await userEvent.type(screen.getByLabelText('Nom'), 'Carn magra');
    await userEvent.click(screen.getByRole('radio', { name: 'Carn' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Terracota rosada' }));
    await userEvent.click(screen.getByRole('button', { name: 'Desar' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect((await repo.getCategories()).find((c) => c.id === 'carn')?.archived).toBeFalsy();
    expect(await own()).toEqual([]);
  });
});
