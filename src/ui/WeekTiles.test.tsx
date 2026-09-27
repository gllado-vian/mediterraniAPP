import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DayRecord } from '../domain/types';
import { WeekTiles } from './WeekTiles';

// Setmana del 28/09 al 04/10/2026
const days: DayRecord[] = [
  { date: '2026-09-28', dinner: { status: 'confirmed', dishId: 'a', dishName: 'Sardines', category: 'peix' } },
  { date: '2026-10-01', dinner: { status: 'confirmed', dishId: 'b', dishName: 'Fora de casa', category: 'capritx' } },
];

function tiles(today = '2026-10-02') {
  render(<WeekTiles today={today} days={days} />);
  return within(screen.getByRole('list', { name: 'La teva setmana' })).getAllByRole('listitem');
}

describe('WeekTiles', () => {
  it('un sopar de quota omple la rajoleta del color de la categoria', () => {
    const monday = tiles()[0];
    expect(monday).toHaveAccessibleName('Dilluns: Peix');
    expect(monday.querySelector('[data-fill]')).toHaveStyle({ backgroundColor: '#6E93A8' });
    expect(monday.querySelector('[data-marc]')).toBeNull();
  });

  it('el capritx no omple la rajoleta: queda emmarcat en granat', () => {
    const thursday = tiles()[3];
    expect(thursday).toHaveAccessibleName('Dijous: Capritx per un dia');
    expect(thursday.querySelector('[data-fill]')).toBeNull();
    expect(thursday.querySelector('[data-marc]')).toHaveStyle({ borderColor: '#A8402E' });
  });

  it('si avui és capritx, es veuen el marc granat i la marca d’avui', () => {
    const thursday = tiles('2026-10-01')[3];
    expect(thursday).toHaveAttribute('aria-current', 'date');
    expect(thursday.querySelector('[data-marc]')).not.toBeNull();
  });
});
