import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openAppDb } from '../db/db';
import { createRepository, type Repository } from '../db/repository';
import { AppStoreProvider, createAppStore } from '../store/appStore';
import { CategoriesScreen } from './CategoriesScreen';

let repo: Repository;
let n = 0;

beforeEach(async () => {
  repo = createRepository(await openAppDb(`categories-${++n}`));
});

async function renderCategories() {
  const props = { onBack: vi.fn(), onNavigate: vi.fn(), onAdd: vi.fn(), onEdit: vi.fn() };
  const store = createAppStore({ repo, now: () => new Date(2026, 8, 28, 20) });
  render(
    <AppStoreProvider store={store}>
      <CategoriesScreen {...props} />
    </AppStoreProvider>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Categories' });
  await screen.findByRole('list', { name: 'Categories de la setmana' });
  return props;
}

const row = (name: string) =>
  within(screen.getByRole('list', { name: 'Categories de la setmana' }))
    .getAllByRole('listitem')
    .find((li) => within(li).queryByText(name, { selector: '[data-name]' }))!;

describe('CategoriesScreen', () => {
  it('mostra les categories en ordre amb les seves vegades i el total de la setmana', async () => {
    await renderCategories();
    const names = within(screen.getByRole('list', { name: 'Categories de la setmana' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('[data-name]')?.textContent);
    expect(names).toEqual(['Peix', 'Ou', 'Llegum', 'Carn magra', 'Vegetarià pur']);
    expect(within(row('Peix')).getByText('2')).toBeInTheDocument();
    expect(screen.getByText('7 de 7 sopars de la setmana')).toBeInTheDocument();
  });

  it('amb la setmana plena no es pot sumar enlloc', async () => {
    await renderCategories();
    screen.getAllByRole('button', { name: /^Una vegada més/ }).forEach((b) => expect(b).toBeDisabled());
  });

  it('treure una vegada la desa i allibera un sopar', async () => {
    await renderCategories();
    await userEvent.click(within(row('Peix')).getByRole('button', { name: 'Una vegada menys de Peix' }));
    expect(await screen.findByText('6 de 7 sopars de la setmana')).toBeInTheDocument();
    expect((await repo.getCategories())[0].quota).toBe(1);
    expect(within(row('Ou')).getByRole('button', { name: 'Una vegada més de Ou' })).toBeEnabled();
  });

  it('amb 0 vegades avisa que no es proposa i deixa esborrar-la, amb confirmació', async () => {
    await repo.updateCategory('carn', { quota: 0 });
    await renderCategories();
    const carn = row('Carn magra');
    expect(within(carn).getByText('No es proposa mai')).toBeInTheDocument();
    await userEvent.click(within(carn).getByRole('button', { name: 'Esborrar-la' }));
    expect(within(carn).getByText('Esborrar Carn magra? Els sopars que ja n’has fet es queden a la setmana.')).toBeInTheDocument();
    await userEvent.click(within(carn).getByRole('button', { name: 'No, deixa-la' }));
    expect(within(carn).queryByRole('button', { name: 'Esborrar' })).not.toBeInTheDocument();

    await userEvent.click(within(carn).getByRole('button', { name: 'Esborrar-la' }));
    await userEvent.click(within(carn).getByRole('button', { name: 'Esborrar' }));
    await vi.waitFor(() =>
      expect(screen.queryByText('Carn magra', { selector: '[data-name]' })).not.toBeInTheDocument(),
    );
    expect((await repo.getCategories()).find((c) => c.id === 'carn')?.archived).toBe(true);
  });

  it('amb 0 vegades i plats propis, explica què cal fer abans d’esborrar-la', async () => {
    await repo.updateCategory('carn', { quota: 0 });
    await repo.addUserDish({ name: 'Llom', category: 'carn', ingredients: [], prepMinutes: null });
    await repo.addUserDish({ name: 'Pollastre', category: 'carn', ingredients: [], prepMinutes: null });
    await renderCategories();
    const carn = row('Carn magra');
    await userEvent.click(within(carn).getByRole('button', { name: 'Esborrar-la' }));
    expect(
      within(carn).getByText('No la pots esborrar: hi tens 2 plats propis. Canvia’ls de categoria o esborra’ls primer.'),
    ).toBeInTheDocument();
    expect(within(carn).queryByRole('button', { name: 'Esborrar' })).not.toBeInTheDocument();
  });

  it('diu quan una categoria encara no té plats', async () => {
    await repo.updateCategory('peix', { quota: 1 });
    await repo.addCategory({ name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 1 });
    await renderCategories();
    expect(within(row('Pasta')).getByText('Encara no té plats')).toBeInTheDocument();
    expect(within(row('Peix')).queryByText('Encara no té plats')).not.toBeInTheDocument();
  });

  it('és dins d’Ajustos al menú i té la fletxa de tornar', async () => {
    const { onBack, onNavigate } = await renderCategories();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Menú' }));
    expect(screen.getByRole('button', { name: 'Ajustos' })).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Ajustos' }));
    expect(onNavigate).toHaveBeenCalledWith('settings');
  });

  it('tocar el nom obre la categoria per editar-la', async () => {
    const { onEdit } = await renderCategories();
    await userEvent.click(screen.getByRole('button', { name: 'Editar Carn magra' }));
    expect(onEdit).toHaveBeenCalledWith('carn');
  });

  it('"Afegir una categoria" obre el formulari', async () => {
    const { onAdd } = await renderCategories();
    await userEvent.click(screen.getByRole('button', { name: 'Afegir una categoria' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('amb una categoria per cada color, explica que no n’hi caben més', async () => {
    const extra = [
      ['A', 'leaf', '#A395C2'],
      ['B', 'salad', '#6FA89A'],
      ['C', 'bread', '#D98F4E'],
      ['D', 'cheese', '#6B4A6E'],
    ];
    for (const [name, icon, color] of extra) await repo.addCategory({ name, icon, color, quota: 0 });
    await renderCategories();
    expect(screen.queryByRole('button', { name: 'Afegir una categoria' })).not.toBeInTheDocument();
    expect(screen.getByText('Ja fas servir els 9 colors: per afegir-ne una, esborra’n una altra.')).toBeInTheDocument();
  });

  it('torna a les categories recomanades, amb confirmació', async () => {
    await repo.updateCategory('peix', { quota: 1 });
    await repo.addCategory({ name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 1 });
    await renderCategories();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar a les recomanades' }));
    expect(
      screen.getByText(
        'Tornaran Peix, Ou, Llegum, Carn magra i Vegetarià pur amb les vegades de sempre. Les que has creat deixaran de proposar-se.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sí, torna-hi' }));
    expect(await screen.findByText('7 de 7 sopars de la setmana')).toBeInTheDocument();
    expect(screen.queryByText('Pasta', { selector: '[data-name]' })).not.toBeInTheDocument();
  });

  it('si una categoria pròpia té plats, no torna a les recomanades i diu per què', async () => {
    const pasta = await repo.addCategory({ name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 0 });
    await repo.addUserDish({ name: 'Macarrons', category: pasta.id, ingredients: [], prepMinutes: 20 });
    await renderCategories();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar a les recomanades' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sí, torna-hi' }));
    expect(
      await screen.findByText('No hi podem tornar: les categories que has creat tenen 1 plat propi. Canvia’l de categoria o esborra’l primer.'),
    ).toBeInTheDocument();
  });
});
