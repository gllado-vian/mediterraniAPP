import { db } from '../../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

export type Meal = {
  id?: string;
  name: string;
  ingredients: string[];
  category: string;
  isOccasional: boolean;
  team_id: string;
  created_by: string;
  times_cooked?: number;
  last_cooked?: Date | null;
};

export const mealService = {
  createMeal: async (teamId: string, userId: string, mealData: Omit<Meal, 'id' | 'team_id' | 'created_by'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'meals'), {
      ...mealData,
      team_id: teamId,
      created_by: userId,
      created_at: serverTimestamp(),
      times_cooked: 0,
      last_cooked: null,
    });
    return docRef.id;
  },

  getTeamMeals: async (teamId: string): Promise<Meal[]> => {
    const q = query(
      collection(db, 'meals'),
      where('team_id', '==', teamId),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meal));
  },

  logMealCooked: async (mealId: string, userId: string, teamId: string, rating: number | null = null): Promise<void> => {
    await addDoc(collection(db, 'meal_history'), {
      meal_id: mealId,
      cooked_by: userId,
      team_id: teamId,
      cooked_date: serverTimestamp(),
      rating,
      notes: '',
    });

    await updateDoc(doc(db, 'meals', mealId), {
      times_cooked: increment(1),
      last_cooked: serverTimestamp(),
    });
  },
};

export default mealService;
