import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppMenu, type MainScreen } from './AppMenu';

function renderMenu(current: MainScreen = 'today', nested = false) {
  const onNavigate = vi.fn();
  render(
    <div>
      <p>Fora del menú</p>
      <AppMenu current={current} nested={nested} onNavigate={onNavigate} />
    </div>,
  );
  return { onNavigate };
}

function menuButton() {
  return screen.getByRole('button', { name: 'Menú' });
}

describe('AppMenu', () => {
  it('comença tancat', () => {
    renderMenu();
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('en obrir-lo ensenya totes les pantalles amb l’actual marcada', async () => {
    renderMenu('week');
    await userEvent.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    const nav = screen.getByRole('navigation', { name: 'Menú' });
    const items = within(nav).getAllByRole('button');
    expect(items.map((b) => b.textContent)).toEqual(['Avui', 'La teva setmana', 'Ajustos', 'Com funciona']);
    expect(within(nav).getByRole('button', { name: 'La teva setmana' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Avui' })).not.toHaveAttribute('aria-current');
  });

  it('triar una opció hi navega i tanca el menú', async () => {
    const { onNavigate } = renderMenu();
    await userEvent.click(menuButton());
    await userEvent.click(screen.getByRole('button', { name: 'Ajustos' }));
    expect(onNavigate).toHaveBeenCalledWith('settings');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('triar la pantalla on ja ets només tanca el menú', async () => {
    const { onNavigate } = renderMenu('today');
    await userEvent.click(menuButton());
    await userEvent.click(screen.getByRole('button', { name: 'Avui' }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('Escape el tanca i torna el focus al botó', async () => {
    renderMenu();
    await userEvent.click(menuButton());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(menuButton()).toHaveFocus();
  });

  it('tocar fora el tanca', async () => {
    renderMenu();
    await userEvent.click(menuButton());
    await userEvent.click(screen.getByText('Fora del menú'));
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('tornar a tocar la icona el tanca', async () => {
    renderMenu();
    await userEvent.click(menuButton());
    await userEvent.click(menuButton());
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('en una pantalla de dins d’una secció, triar la secció hi torna', async () => {
    const { onNavigate } = renderMenu('settings', true);
    await userEvent.click(menuButton());
    const settings = screen.getByRole('button', { name: 'Ajustos' });
    expect(settings).toHaveAttribute('aria-current', 'true');
    await userEvent.click(settings);
    expect(onNavigate).toHaveBeenCalledWith('settings');
  });
});
