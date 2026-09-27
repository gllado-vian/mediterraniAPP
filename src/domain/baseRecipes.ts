import type { Repository } from '../db/repository';
import type { Category } from './categories';
import type { Dish } from './types';

function dish(
  id: string,
  name: string,
  category: Category,
  ingredients: string[],
  prepMinutes: number | null,
): Dish {
  return { id: `base-${id}`, name, category, ingredients, prepMinutes, source: 'base' };
}

/** Recetari base de l'MVP (annex de la proposta). Immutable per a l'usuari. */
export const BASE_RECIPES: readonly Dish[] = [
  dish('ensalada-caprese', 'Ensalada caprese', 'vegetaria', ['Tomàquet', 'Mozzarella fresca', 'Alfàbrega', "Oli d'oliva", 'Sal'], 10),
  dish('gazpacho', 'Gazpacho andaluz', 'vegetaria', ['Tomàquet', 'Pebrot verd', 'Cogombre', 'Ceba', 'All', "Oli d'oliva", 'Vinagre', 'Pa sec'], 15),
  dish('revuelto-verdures', 'Revuelto de verdures', 'ou', ['Ous', 'Carbassó', 'Pebrot', 'Ceba', "Oli d'oliva", 'Sal'], 20),
  dish('hummus-pita', 'Hummus amb pita', 'llegum', ['Cigrons cuits', 'Tahini', 'Suc de llimona', 'All', "Oli d'oliva", 'Comí', 'Pa de pita'], 15),
  dish('sardines-forn', 'Sardines al forn', 'peix', ['Sardines fresques', 'All', 'Julivert', 'Llimona', "Oli d'oliva", 'Sal'], 25),
  dish('menestra-tonyina', 'Menestra amb tonyina/anxoves', 'peix', ['Mongeta tendra', 'Pastanaga', 'Patata', 'Tonyina o anxoves en conserva', "Oli d'oliva", 'All'], 30),
  dish('crema-carbasso', 'Crema de carbassó', 'vegetaria', ['Carbassó', 'Ceba', 'Patata', 'Brou de verdures', "Oli d'oliva"], 25),
  dish('llenties-verdures', 'Llenties amb verdures', 'llegum', ['Llenties', 'Pastanaga', 'Tomàquet', 'Ceba', 'Pebrot', 'All', "Oli d'oliva", 'Llorer'], 40),
  dish('lluc-espinacs', 'Lluç/llagostí a la planxa amb espinacs', 'peix', ['Lluç o llagostins', 'Espinacs frescos', 'All', "Oli d'oliva", 'Llimona'], 20),
  dish('amanida-grega', 'Amanida grega', 'vegetaria', ['Cogombre', 'Tomàquet', 'Formatge feta', 'Olives kalamata', 'Ceba morada', "Oli d'oliva", 'Orenga'], 10),
  dish('cigrons-espinacs', 'Cigrons amb espinacs', 'llegum', ['Cigrons cuits', 'Espinacs', 'All', 'Pebre vermell', 'Tomàquet triturat', 'Comí'], 25),
  dish('pollastre-arrebossat', 'Pit de pollastre arrebossat al forn', 'carn', ['Pit de pollastre', 'Ou', 'Pa ratllat', "Oli d'oliva", 'Sal'], 30),
  dish('truita-patata', 'Truita de patata', 'ou', ['Ous', 'Patata', 'Ceba', "Oli d'oliva", 'Sal'], 30),
  dish('pollastre-planxa', 'Pollastre a la planxa', 'carn', ['Pit de pollastre', 'All', 'Llimona', 'Herbes provençals', "Oli d'oliva"], 20),
  dish('mandonguilles-gall-dindi', 'Mandonguilles de gall dindi', 'carn', ['Carn picada de gall dindi', 'Ou', 'Pa ratllat', 'All', 'Julivert', 'Tomàquet triturat'], 35),
  dish('llom-amanida', 'Llom a la planxa amb amanida', 'carn', ['Llom de porc', 'Enciam', 'Tomàquet', 'Ceba', "Oli d'oliva", 'All'], 15),
  dish('faves-pernil', 'Faves amb pernil', 'llegum', ['Faves (fresques o congelades)', 'Pernil a trossets', 'Ceba', 'All', "Oli d'oliva"], 25),
  dish('salmo-forn', 'Salmó al forn (o bacallà a la llauna)', 'peix', ['Salmó o bacallà', 'Patata', 'Llimona', 'All', "Oli d'oliva"], 25),
  dish('pizza-casolana', 'Pizza casolana', 'capritx', ['Massa de pizza', 'Tomàquet fregit', 'Mozzarella', 'Ingredients al gust'], 25),
  dish('croquetes-casolanes', 'Croquetes casolanes', 'capritx', ['Beixamel', 'Pernil o pollastre', 'Ou', 'Pa ratllat', 'Oli per fregir'], 45),
  dish('fora-de-casa', 'Fora de casa', 'capritx', [], null),
];

/** Carrega (o actualitza) el recetari base sense tocar els plats propis. */
export function seedBaseRecipes(repo: Repository): Promise<void> {
  return repo.putBaseDishes([...BASE_RECIPES]);
}
