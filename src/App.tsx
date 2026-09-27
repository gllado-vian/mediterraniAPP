import { useEffect, useState } from 'react';
import { openAppDb } from './db/db';
import { createRepository } from './db/repository';
import { DishFormScreen } from './screens/DishFormScreen';
import { MyDishesScreen } from './screens/MyDishesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { SwipeScreen } from './screens/SwipeScreen';
import { TodayScreen } from './screens/TodayScreen';
import type { IsoDate } from './domain/types';
import { AppStoreProvider, createAppStore, type AppStore } from './store/appStore';
import type { MainScreen } from './ui/AppMenu';

/** Les pantalles del menú, més el swipe (que porta la data per a la qual es tria). */
type Screen =
  | { name: MainScreen }
  | { name: 'swipe'; date?: IsoDate }
  | { name: 'myDishes' }
  | { name: 'dishForm'; dishId?: string };

const TODAY: Screen = { name: 'today' };

export function App() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [screen, setScreen] = useState<Screen>(TODAY);
  const [failed, setFailed] = useState(false);
  const navigate = (name: MainScreen) => setScreen({ name });

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
          l’app en una finestra normal i torna-ho a provar.
        </p>
      </main>
    );
  }

  if (!store) return <main aria-busy="true" className="min-h-dvh bg-ciment" />;

  return (
    <AppStoreProvider store={store}>
      {screen.name === 'today' && (
        <TodayScreen
          onOpenSwipe={() => setScreen({ name: 'swipe' })}
          onPickYesterday={(date) => setScreen({ name: 'swipe', date })}
          onNavigate={navigate}
        />
      )}
      {screen.name === 'week' && <SummaryScreen onBack={() => setScreen(TODAY)} onNavigate={navigate} />}
      {screen.name === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen(TODAY)}
          onNavigate={navigate}
          onOpenMyDishes={() => setScreen({ name: 'myDishes' })}
        />
      )}
      {screen.name === 'myDishes' && (
        <MyDishesScreen
          onBack={() => navigate('settings')}
          onNavigate={navigate}
          onAdd={() => setScreen({ name: 'dishForm' })}
          onEdit={(dishId) => setScreen({ name: 'dishForm', dishId })}
        />
      )}
      {screen.name === 'dishForm' && (
        <DishFormScreen
          dishId={screen.dishId}
          onDone={() => setScreen({ name: 'myDishes' })}
          onBack={() => setScreen({ name: 'myDishes' })}
        />
      )}
      {screen.name === 'swipe' && (
        <SwipeScreen
          date={screen.date}
          onDone={() => setScreen(TODAY)}
          onBack={() => setScreen(TODAY)}
        />
      )}
    </AppStoreProvider>
  );
}
