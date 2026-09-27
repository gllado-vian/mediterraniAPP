import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HELP_GROUPS } from '../ui/helpContent';
import { HelpScreen } from './HelpScreen';

function renderHelp() {
  const onBack = vi.fn();
  const onNavigate = vi.fn();
  render(<HelpScreen onBack={onBack} onNavigate={onNavigate} />);
  return { onBack, onNavigate };
}

describe('HelpScreen', () => {
  it('té el títol "Com funciona" i tots els apartats en ordre', () => {
    renderHelp();
    expect(screen.getByRole('heading', { level: 1, name: 'Com funciona' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(
      HELP_GROUPS.map((g) => g.title),
    );
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(
      HELP_GROUPS.flatMap((g) => g.steps.map((s) => s.title)),
    );
  });

  it('el menú marca "Com funciona" i porta a les altres pantalles', async () => {
    const { onNavigate } = renderHelp();
    await userEvent.click(screen.getByRole('button', { name: 'Menú' }));
    expect(screen.getByRole('button', { name: 'Com funciona' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Avui' }));
    expect(onNavigate).toHaveBeenCalledWith('today');
  });

  it('"Tornar" torna enrere', async () => {
    const { onBack } = renderHelp();
    await userEvent.click(screen.getByRole('button', { name: 'Tornar' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
