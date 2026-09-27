import { useEffect, useState } from 'react';
import { openAppDb } from './db/db';
import { createRepository } from './db/repository';
import { SwipeScreen } from './screens/SwipeScreen';
import { TodayScreen } from './screens/TodayScreen';
import { AppStoreProvider, createAppStore, type AppStore } from './store/appStore';

type Screen = 'today' | 'swipe';

export function App() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [screen, setScreen] = useState<Screen>('today');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    openAppDb()
      .then((db) => setStore(createAppStore({ repo: createRepository(db) })))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center gap-2 px-4">
        <h1 className="text-xl font-semibold">No puc obrir les dades</h1>
        <p className="text-tinta-suau">
          El navegador no em deixa guardar res en aquest mòbil. Si estàs en mode privat, obre
          l'app en una finestra normal i torna-ho a provar.
        </p>
      </main>
    );
  }

  if (!store) return <main aria-busy="true" className="min-h-dvh bg-ciment" />;

  return (
    <AppStoreProvider store={store}>
      {screen === 'today' && <TodayScreen onOpenSwipe={() => setScreen('swipe')} />}
      {screen === 'swipe' && (
        <SwipeScreen
          onDone={() => setScreen('today')}
          onBack={() => setScreen('today')}
          // El "+info" arriba al pas 8.
          onOpenInfo={() => {}}
        />
      )}
    </AppStoreProvider>
  );
}
