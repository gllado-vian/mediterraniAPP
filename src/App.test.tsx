import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as db from './db/db';
import { App } from './App';

describe('App', () => {
  it('explica el problema si no es poden obrir les dades del dispositiu', async () => {
    vi.spyOn(db, 'openAppDb').mockRejectedValueOnce(new Error('IndexedDB no disponible'));
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'No puc obrir les dades' }),
    ).toBeInTheDocument();
  });
});
