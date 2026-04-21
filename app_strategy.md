# Mediterranean Meal Planning App
## Complete Development Strategy

**Project Name:** Mediterranean Meal Planner  
**Timeline:** 1-3 months (Quick MVP)  
**Budget:** Under $5,000  
**Team Size:** 2-5 people (minimal sharing)  
**Development Approach:** Self-learning with development partner support  

---

## EXECUTIVE SUMMARY

You're building a **quick and easy meal planning app** designed for moments when you're hungry and don't know what to cook. The app helps your small team (families, couples) manage Mediterranean-style menus with intelligent meal suggestions based on ingredient availability and recent meal history. Fast decision-making is key.

**Core Philosophy:** 
⚡ **Speed First** - Users get meal suggestions in 2 taps, not 10 steps
📱 **Simple Interface** - Minimal screens, maximum functionality
👨‍👩‍👧‍👦 **Family/Couple Focused** - Shared meal history and team accountability
🥗 **Ingredient-Based** - Meals defined by main ingredient categories (vegetables, fish, meat, dairy, eggs, etc.)

**Key Features:**
- ✓ Fast meal suggestion engine (2-3 seconds)
- ✓ Suggests meals NOT eaten in last 7 days
- ✓ Designate occasional meals (skip if eaten within 10 days)
- ✓ Create/edit meals directly in the app (no external uploads initially)
- ✓ Shared team menus (family/couple tracking)
- ✓ Shopping list generation by main ingredients
- ✓ Support for iOS, Android, and Web
- ✓ Meal history for team accountability

---

## PHASE 0: UX PRINCIPLES (CRITICAL FOR SUCCESS)

### "When You're Hungry, Don't Know What to Cook" Flow

**The Problem:** Users open the app when hungry and tired. They need a meal suggestion in <30 seconds.

**Solution: 3-Step Flow (Guided but Flexible + Create Option)**

```
STEP 1: Open App
        ↓
STEP 2: App suggests meal
        - Based on 7-day no-repeat rule
        - Respects occasional meals (10-day rule)
        - Respects allergies
        ↓
STEP 3: User Choice
        ├─ "Accept this meal" → Locked in
        ├─ "Show another" → Different suggestion
        └─ "I want to customize" → Open meal selector
                                  BUT: Can't add meals eaten <7 days ago
                                       App shows red warning if attempting
                                       ├─ IF meal exists in collection → Select it
                                       └─ IF meal NOT exists → "Create new meal" button
                                           └─ Inline form to add meal to collection
```

**Key Behavior:**
- Default suggestion is SMART (algorithm-based)
- User CAN override and choose different meal
- User CANNOT break the 7-day no-repeat rule
- User CAN create brand new meals on-the-fly while customizing
- New meals are saved to team collection for future use
- System prevents "I'm tired of this" fatigue by forcing variety

### UX Design Rules (MUST FOLLOW)

✅ **Step 1: Home Screen = Pure Suggestion (Auto-Load)**
- App opens and IMMEDIATELY shows meal suggestion
- Display: Meal name + main ingredients + meal type indicator
- No "tap to suggest" - suggestion is ready immediately

✅ **Step 2: Three Action Buttons**
- Primary: "✓ Accept This Meal" (big, green)
- Secondary: "↻ Show Me Another Idea"
- Tertiary: "✏️ Customize My Choice"

✅ **Step 3A: "Show Another" Behavior**
- Generates new suggestion instantly
- Different from current (never same meal twice in a row)
- Keeps 7-day + 10-day rules

✅ **Step 3B: "Customize" with Guard Rails + Create Option**
- Opens meal selector/list view
- ONLY shows eligible meals:
  - ✓ Regular meals NOT in last 7 days
  - ✓ Occasional meals NOT in last 10 days
  - ✓ Respects allergies
- Ineligible meals shown GREYED OUT with reason:
  - "⚠️ Last cooked 3 days ago (by Maria)"
  - "⚠️ Occasional meal - 5 days since last time"
  - "🚫 Contains shellfish (your allergy)"
- Buttons on greyed meals are DISABLED
- System tooltip: "Choose from available options above"

✅ **CREATE NEW MEAL Option**
- "➕ Create New Meal" button visible at bottom of selector
- Opens inline meal creation form (expandable section)
- Simple form: Name | First Course | Second Course | Dessert
- Save button adds meal to team collection immediately
- After creating, meal can be selected for today
- New meal automatically logged as "cooked today"

✅ **Ingredient Translation** (User-Friendly)
- Instead of "salmon fillet 150g"
- Show: "🐟 FISH: Salmon"
- Instead of "spinach, lettuce, tomato"
- Show: "🥬 VEGETABLES: Spinach, Lettuce, Tomato"

✅ **Meal Type Visual Cues**
- Regular meals: Green indicator ✓
- Occasional meals: Orange indicator ⚠️
- Users understand intent at a glance

✅ **Meal History = Accountability**
- Show "Last cooked 3 days ago by Maria"
- Show who cooked it (family/couple context)
- Show rating/notes ("Everyone loved it!")

✅ **Shopping List = Print & Go**
- Grouped by ingredient category
- Print button visible
- No complex quantities (just list items)

✅ **Team Meal Register**
- Simple table: Date | Meal | Who Cooked | Rating
- Filter by user or meal type
- Sortable by date or frequency

### Speed Targets

| Action | Target Time | Priority |
|--------|-------------|----------|
| App launch → Home screen | <2 seconds | Critical |
| Meal suggestion | <1 second | Critical |
| Shopping list generation | <2 seconds | High |
| Meal history load | <3 seconds | Medium |
| Create meal | <1 minute | Medium |

---

### 1.1 Technology Stack Decision

**Frontend:**
- **React Native** (cross-platform iOS/Android) + **React Web**
- Reasoning: One codebase for mobile + web, learn once, deploy everywhere
- Alternative: Flutter (steeper learning curve but very fast)

**Backend:**
- **Firebase** (recommended for MVP speed & cost)
  - Firestore for database (flexible, easy to learn)
  - Firebase Authentication (built-in user management)
  - Firebase Storage (for image uploads)
  - Cost: Free tier covers MVP needs
- Alternative: Supabase (PostgreSQL-based, more control)

**Nutritional Data:**
- **NOT needed for MVP** - Keep it simple
- Start with basic meal structure (name + main ingredients only)
- Can add nutritional data later if needed
- Focus: Ingredient categories matter more than exact nutrition

**Development Environment:**
- **Visual Studio Code** (free, beginner-friendly)
- **Node.js** (JavaScript runtime)
- **Expo** (easiest React Native setup for beginners)

### 1.2 Data Architecture Decision

**RECOMMENDED: Simple Cloud-Based (Firebase/Firestore)**

```
Firestore (Cloud)
├── Meals (team shared)
│   ├── id, name, category, cuisine
│   ├── main_ingredients (by category)
│   ├── meal_type (regular/occasional)
│   └── stats (times_cooked, last_cooked)
├── Meal History (team shared)
│   ├── cooked_date, cooked_by, rating
│   └── notes
├── Users (team shared)
│   ├── user_id, name, email
│   ├── allergies, team_id, role
│   └── basic stats
└── Teams (shared)
    ├── team_id, name, members
    └── created_by

Device (Local Cache)
├── Offline meal suggestions
├── Last 7 days of meal history
└── User preferences
```

**Why Cloud-First?**
- Team sharing is essential (families, couples)
- Real-time sync when everyone is online
- Simple architecture = faster development
- Firebase handles sync automatically
- No complex offline logic needed for MVP

### 1.3 Mediterranean Diet Criteria

Create a JSON configuration file:

```json
{
  "mediterranean_guidelines": {
    "daily_calories_target": 2000,
    "macronutrients": {
      "carbs_percent": "55-60%",
      "protein_percent": "15-20%",
      "fat_percent": "25-35%"
    },
    "preferred_foods": [
      "Olive oil",
      "Fish (salmon, sardines)",
      "Whole grains",
      "Legumes",
      "Vegetables",
      "Fruits",
      "Nuts",
      "Herbs (oregano, basil)"
    ],
    "limit_foods": [
      "Red meat",
      "Processed foods",
      "Refined grains",
      "Added sugars"
    ]
  }
}
```

---

## PHASE 2: PROJECT SETUP (Week 1-2)

### 2.1 Create Project Repository

```bash
# Create folder structure
mkdir mediterranean-meal-planner
cd mediterranean-meal-planner

# Initialize git
git init
echo "# Mediterranean Meal Planner" > README.md

# Create folders
mkdir -p mobile web backend docs
```

### 2.2 Setup Mobile Development

```bash
# Install Expo CLI (easiest for beginners)
npm install -g expo-cli

# Create React Native project
expo init mediterranean-meal-mobile
cd mediterranean-meal-mobile
npm install
```

### 2.3 Setup Web Development

```bash
# Create React web app
npx create-react-app mediterranean-meal-web

# Add navigation & UI libraries
npm install react-router-dom axios firebase
```

### 2.4 Setup Backend

```bash
# If using Supabase instead of Firebase
npm install @supabase/supabase-js

# For Firebase
npm install firebase
```

---

## PHASE 3: CORE FEATURES (Week 3-8)

### 3.1 Feature Priority (MVP Release)

**MUST HAVE (Week 3-5):**
1. ✓ User authentication (simple email/password)
2. ✓ **Home Screen with Auto-Suggested Meal** (core feature)
   - App loads → Instant meal suggestion
   - "Accept" | "Show Another" | "Customize" buttons
3. ✓ Create meals with main ingredients only (no nutritional data initially)
4. ✓ **Create New Meal Inline** (while customizing)
   - "➕ Create New Meal" button in selector
   - Quick form: Name + First Course + Second Course
   - Saves to team collection immediately
5. ✓ Mark meals as "regular" or "occasional" (>10 days)
6. ✓ **Meal Selection Guard Rail**
   - Prevent users from selecting meals eaten <7 days ago
   - Show warning with reason and last cook date
   - Disable button for ineligible meals
7. ✓ Shared team meal history & calendar
8. ✓ Shopping list generation by ingredient category
9. ✓ Meal history register with team accountability

**NICE TO HAVE (Week 6-7):**
10. ◐ Meal favoriting system
11. ◐ Custom ingredient list upload (for filtering)
12. ◐ Team member notifications
13. ◐ Meal image/photos

**FUTURE (Post-MVP):**
14. ○ Nutritional data integration
15. ○ Barcode scanning
16. ○ AI optimization based on dietary preferences
17. ○ Variant pricing/budget tracking

### 3.3A Meal Creation Guidelines (Two-Course Structure)

When creating a meal in the app, follow this proven structure from SJD Barcelona:

**STEP 1: Choose First Course (Primer Plato)**
Usually vegetables, salad, or light preparation
- Examples: Green salad, vegetable soup, sautéed vegetables
- Provides fiber, vitamins, minerals
- Can be raw (salad) or cooked

**STEP 2: Choose Second Course (Segundo Plato)**
Protein + Carbohydrate base
- **Protein options:** Fish, chicken, meat, eggs, legumes
- **Carbs/Base:** Rice, pasta, potatoes, bread, legumes
- **Examples:**
  - "Grilled salmon + rice"
  - "Chicken + potatoes"
  - "Eggs + pasta"
  - "Legumes as both protein & carbs"

**STEP 3: Choose Dessert (Optional)**
- Fresh fruit (preferred, especially seasonal)
- Yogurt (for dairy intake)
- Rarely: homemade dessert

**APP FLOW FOR MEAL CREATION:**

```javascript
// UI Flow for creating a meal
1. Enter meal name (auto-suggested based on combination)
2. Select meal type:
   - Regular (can be eaten frequently)
   - Occasional (max once per 10 days)

3. Select FIRST COURSE:
   - Choose vegetables/salad
   - Add specific ingredients
   
4. Select SECOND COURSE:
   - Choose protein type
   - Choose carb/base
   - Add preparation method
   
5. Optional DESSERT:
   - Fruit or yogurt
   
6. Calculate food groups covered:
   ✓ Vegetables: YES/NO
   ✓ Protein: Type
   ✓ Grains: YES/NO
   ✓ Oils: Olive oil used?
   
7. Review balance:
   - Check if covers different food groups
   - Warn if missing vegetable component
   - Suggest to ensure variety
```

#### 3.2.1 Meal Database Structure (PROFESSIONAL NUTRITIONAL MODEL - SJD Barcelona)

Based on the recommendations from Escola Salut SJD Hospital Barcelona, meals are structured with balanced food groups:

```javascript
// Firestore Collection: "meals"
{
  id: "meal_001",
  name: "Salmon with Rice and Green Salad",
  
  // MEAL COMPOSITION (structured for balanced nutrition)
  meal_composition: {
    // First course - Usually vegetables or lighter preparation
    first_course: {
      name: "Green salad with cherry tomatoes",
      category: "vegetables",
      main_ingredients: [
        { category: "vegetables", items: ["lettuce", "cherry tomatoes", "cucumber"] }
      ]
    },
    
    // Second course - Protein + carbohydrate base
    second_course: {
      name: "Grilled salmon fillet",
      category: "protein",
      main_ingredients: [
        { category: "fish", items: ["salmon"] },
        { category: "grains", items: ["rice"] },
        { category: "oils", items: ["olive oil"] }
      ]
    }
  },
  
  // MEAL TYPE - defines frequency in menu
  meal_type: "regular",      // "regular" | "occasional"
  meal_frequency: "weekly",   // How often recommended
  
  // CATEGORY - for organizing menus
  category: "main_course",    // "main_course", "light_course", "first_course"
  cuisine: "mediterranean",
  
  // NUTRITIONAL BALANCE (simplified - based on main ingredients)
  nutritional_balance: {
    protein_source: "fish",      // main protein
    carb_source: "rice",         // carbs/grains
    vegetable_content: "high",   // amount of vegetables
    healthy_fats: true           // uses olive oil
  },
  
  // FOOD GROUPS COVERED (for menu variety)
  food_groups_included: [
    "vegetables",
    "fish",
    "grains",
    "oils"
  ],
  
  // BALANCE CRITERIA (matching SJD recommendations)
  mediterranean_criteria: {
    uses_olive_oil: true,
    pescatarian_friendly: true,
    has_vegetables: true,
    whole_grains: true,
    red_meat: false
  },
  
  // SOURCE & STATS
  source: "custom_db",
  created_by: "user_id",
  created_at: "2026-01-15T10:30:00Z",
  times_cooked: 5,
  last_cooked: "2026-04-15T19:00:00Z",
  team_id: "team_001"
}
```

**Key Meal Structure Elements:**

1. **First Course (Primer Plato)**
   - Usually vegetables, salad, or light preparation
   - Provides fiber and micronutrients

2. **Second Course (Segundo Plato)**
   - Protein source + carbohydrate base
   - E.g., "Grilled chicken with potatoes" or "Fish with pasta"

3. **Dessert (Optional)**
   - Fresh fruit of season (preferred)
   - Or yogurt for calcium intake

4. **Beverage**
   - Water (always)

**Food Groups (Based on SJD Recommendations):**
- 🥬 Vegetables (daily, 2 servings: lunch + dinner)
- 🍎 Fruits (minimum 3 daily, prefer whole)
- 🐟 Fish (3-4 servings/week, mix white & blue fish)
- 🍗 Poultry/Lean meat (frequent, red meat 1x/week)
- 🥚 Eggs (around 4/week)
- 🫘 Legumes (2-4 servings/week)
- 🥛 Dairy (3-4 daily servings)
- 🌾 Whole grains (pasta, rice, bread, cereals)
- 🥜 Nuts/seeds (daily)
- 🫒 Olive oil (preferred cooking fat)

#### 3.2.2 User Profile Structure (SIMPLE)

```javascript
// Firestore Collection: "user_profiles"
{
  user_id: "auth_uid",
  name: "John",
  email: "john@example.com",
  
  // Allergies & Restrictions
  allergies: ["shellfish", "peanuts"],
  
  // Team Association
  team_id: "team_001",
  role: "member", // "admin" | "member"
  
  // Simple Stats
  joined_at: "2025-01-01T00:00:00Z",
  last_active: "2026-04-20T15:30:00Z",
  meals_created: 12,
  total_meals_cooked: 45
}
```

#### 3.2.3B Weekly Menu Planning Structure (SJD Model)

Following the Spanish health recommendations, a balanced weekly menu ensures variety and proper food group distribution:

```javascript
// Firestore Collection: "weekly_menus"
{
  id: "menu_week_2026_17",
  team_id: "team_001",
  week_of: "2026-04-21",
  
  // Weekly balance tracking
  weekly_goals: {
    legumes_servings: { target: 2, actual: 0 },
    fish_servings: { target: 3, actual: 0 },
    red_meat_servings: { target: 1, actual: 0 },
    egg_servings: { target: 2, actual: 0 },
    vegetable_variety: { target: 8, actual: 0 }
  },
  
  // Daily meals organized by meal type
  daily_menus: {
    "monday": {
      lunch: {
        first_course: { meal_id: "meal_002", name: "Potato and lettuce salad" },
        second_course: { meal_id: "meal_003", name: "Chicken tenders with roasted peppers" },
        dessert: "orange"
      },
      dinner: {
        first_course: { meal_id: "meal_004", name: "Sautéed rice with zucchini" },
        second_course: { meal_id: "meal_005", name: "Gilt-head bream with tomato" },
        dessert: "yogurt"
      }
    },
    // ... rest of week
  },
  
  // Meal history for each day (updated after cooking)
  meal_log: {
    "2026-04-21": {
      lunch: {
        cooked_by: "Maria",
        rating: 5,
        notes: "Everyone loved it!",
        completed_at: "2026-04-21T14:30:00Z"
      },
      dinner: {
        cooked_by: "Juan",
        rating: 4,
        notes: "Good but fish was a bit dry",
        completed_at: "2026-04-21T20:30:00Z"
      }
    }
  },
  
  created_by: "user_id",
  created_at: "2026-04-20T10:00:00Z"
}
```

**Weekly Balance Checklist (Based on SJD Recommendations):**
- ✓ Legumes: 2-4 servings per week
- ✓ Fish: 3-4 servings (mix white & blue fish)
- ✓ Red meat: 1 serving per week
- ✓ Eggs: Around 4 per week
- ✓ Vegetables: 2 servings daily (14 total)
- ✓ Fruits: 3+ daily (21+ servings)
- ✓ Dairy: 3-4 daily (21-28 servings)
- ✓ Whole grains: Present in most meals
- ✓ Olive oil: Primary cooking fat
- ✓ Nuts/seeds: Daily presence

#### 3.2.4A Create New Meal Inline (During Customize Flow)

When user overrides and wants a meal that doesn't exist, they can create it immediately:

```javascript
// Modal/Expandable Form: CREATE NEW MEAL
// Triggered by "➕ Create New Meal" button in selector

{
  // Step 1: Meal Name
  meal_name: "My custom salmon pasta",
  
  // Step 2: First Course (Vegetables/Salad)
  first_course: {
    name: "Caesar salad",
    ingredients: [
      { category: "vegetables", items: ["lettuce", "parmesan"] },
      { category: "oils", items: ["olive oil"] }
    ]
  },
  
  // Step 3: Second Course (Protein + Carbs)
  second_course: {
    name: "Salmon with pasta",
    protein: "salmon",
    carbs: "pasta",
    ingredients: [
      { category: "fish", items: ["salmon"] },
      { category: "grains", items: ["pasta"] },
      { category: "oils", items: ["olive oil"] }
    ]
  },
  
  // Step 4: Dessert (Optional)
  dessert: "strawberries",
  
  // Meal Type
  meal_type: "regular", // or "occasional"
  
  // Auto-populated
  created_by: "user_id",
  team_id: "team_001",
  created_at: "2026-04-21T17:30:00Z",
  source: "user_created",
  
  // Instant stats (first cook)
  times_cooked: 1,
  last_cooked: "2026-04-21T19:00:00Z"
}
```

**FORM FLOW (Inline Expandable):**

```
┌─────────────────────────────────────────┐
│  ➕ CREATE NEW MEAL                      │
├─────────────────────────────────────────┤
│                                         │
│  Meal Name: [_____________________]     │
│  Type:  ○ Regular  ○ Occasional        │
│                                         │
│  FIRST COURSE                           │
│  [Search/select vegetables]             │
│  ☑ Lettuce  ☑ Tomato  ☑ Olive oil     │
│                                         │
│  SECOND COURSE                          │
│  Protein: [Dropdown: Fish/Chicken/...] │
│  Carbs: [Dropdown: Rice/Pasta/...]     │
│  Ingredients: [Add more]                │
│                                         │
│  DESSERT (Optional)                     │
│  [Dropdown: Apple/Yogurt/Berries/...]  │
│                                         │
│  [CANCEL]              [SAVE & USE]    │
│                                         │
└─────────────────────────────────────────┘
```

**IMPORTANT BEHAVIORS:**

1. **Validation While Creating:**
   - Meal name is required
   - First course (vegetables) is required
   - Second course (protein) is required
   - At least one ingredient per course

2. **Automatic Checks:**
   - ✓ Suggests meal name based on ingredients
   - ✓ Tracks food groups covered
   - ⚠️ Warns if missing vegetables (first course)
   - ⚠️ Warns if missing protein (second course)

3. **After Creation:**
   - Meal is saved to team collection
   - **User can immediately select it** for today's menu
   - **Meal is marked as "cooked today"** (logs meal history)
   - Meal is available for future suggestions
   - All team members can see it in their selector

4. **Safety Guard Rails Still Apply:**
   - Even newly created meals respect 7-day rule
   - User cannot cook same meal again for 7 days
   - System tracks "just created" meals to suggest less frequently initially

**Example User Flow:**

```
1. User sees suggestion: "Grilled fish with rice"
2. User says "I want to customize"
3. User sees available meals list (eligible ones)
4. User doesn't see their favorite meal → "Not available" or "Doesn't exist"
5. User taps "➕ Create New Meal"
6. Form expands inline
7. User fills:
   - Name: "Pasta con verduras y atún"
   - First: Salad with lettuce, tomato
   - Second: Tuna + pasta
   - Dessert: Orange
8. User taps "SAVE & USE"
9. Meal saved to collection
10. Meal selected for today
11. App navigates to "Confirm Meal" screen
```

```javascript
// Smart suggestion engine - fast and simple

function suggestMeal(teamId, userPreferences) {
  // 1. Get last 7 days of team meals
  const last7DaysMeals = getMealHistory(teamId, days: 7);
  const mealsEatenRecently = new Set(last7DaysMeals.map(m => m.meal_id));
  
  // 2. Get all available meals
  let availableMeals = getAllMeals(teamId);
  
  // 3. Filter based on meal type
  availableMeals = availableMeals.filter(meal => {
    if (meal.meal_type === "occasional") {
      // For occasional meals: skip if eaten within 10 days
      const lastCooked = meal.last_cooked;
      const daysSinceCooked = (now - lastCooked) / (1000 * 60 * 60 * 24);
      return daysSinceCooked > 10;
    }
    // For regular meals: skip if eaten in last 7 days
    return !mealsEatenRecently.has(meal.id);
  });
  
  // 4. Filter by allergies (user restrictions)
  availableMeals = availableMeals.filter(meal => 
    !hasAllergyConflict(meal, userPreferences.allergies)
  );
  
  // 5. Random selection (varies suggestions)
  if (availableMeals.length === 0) {
    // Fallback: return any meal (reset suggestion pool)
    return selectRandom(getAllMeals(teamId));
  }
  
  return selectRandom(availableMeals);
}

// ============================================================
// GUARD RAIL LOGIC - Prevent users from bypassing 7-day rule
// ============================================================

async function getEligibleMeals(teamId, userId) {
  // Returns only meals user CAN select
  const user = await getUser(userId);
  const last7Days = getMealHistory(teamId, 7);
  const last10Days = getMealHistory(teamId, 10);
  
  const recentMealIds = new Set(last7Days.map(m => m.meal_id));
  const recent10MealIds = new Set(last10Days.map(m => m.meal_id));
  
  return getAllMeals(teamId).filter(meal => {
    // Regular meals: must NOT be in last 7 days
    if (meal.meal_type === "regular") {
      return !recentMealIds.has(meal.id);
    }
    // Occasional meals: must NOT be in last 10 days
    if (meal.meal_type === "occasional") {
      return !recent10MealIds.has(meal.id);
    }
  });
}

async function getIneligibleMeals(teamId, userId) {
  // Returns meals user CANNOT select (with reason)
  const user = await getUser(userId);
  const last7Days = getMealHistory(teamId, 7);
  const last10Days = getMealHistory(teamId, 10);
  
  const ineligible = [];
  
  getAllMeals(teamId).forEach(meal => {
    let reason = null;
    let lastCookedDate = null;
    let cookedBy = null;
    
    // Check if in last 7 days
    const recentRecord = last7Days.find(m => m.meal_id === meal.id);
    if (recentRecord) {
      const daysSince = daysBetween(recentRecord.cooked_date, now);
      reason = `⚠️ Last cooked ${daysSince} days ago`;
      lastCookedDate = formatDate(recentRecord.cooked_date);
      cookedBy = recentRecord.cooked_by_name;
    }
    
    // Check if occasional and in last 10 days
    if (meal.meal_type === "occasional") {
      const recentRecord10 = last10Days.find(m => m.meal_id === meal.id);
      if (recentRecord10) {
        const daysSince = daysBetween(recentRecord10.cooked_date, now);
        reason = `⚠️ Occasional meal - cooked ${daysSince} days ago`;
        lastCookedDate = formatDate(recentRecord10.cooked_date);
        cookedBy = recentRecord10.cooked_by_name;
      }
    }
    
    // Check allergies
    const allIngredients = meal.main_ingredients.flatMap(i => i.items);
    const hasAllergy = allIngredients.some(ing => user.allergies.includes(ing));
    if (hasAllergy) {
      reason = `🚫 Contains ${allIngredients.find(ing => user.allergies.includes(ing))} (your allergy)`;
    }
    
    if (reason) {
      ineligible.push({
        ...meal,
        reason,
        lastCookedDate,
        cookedBy
      });
    }
  });
  
  return ineligible;
}

// FAST: Returns eligibility in <500ms
// Query indexes: team_id, meal_type, last_cooked
// SECURITY: Guard rails are enforced on BOTH client + server
```

#### 3.2.5 Shopping List Generation (By Ingredient Category)

```javascript
// Generate shopping list from selected meals

function generateShoppingList(selectedMeals) {
  const ingredientsByCategory = {};
  
  // 1. Collect all ingredients and group by category
  selectedMeals.forEach(meal => {
    meal.main_ingredients.forEach(ingredient => {
      if (!ingredientsByCategory[ingredient.category]) {
        ingredientsByCategory[ingredient.category] = [];
      }
      ingredientsByCategory[ingredient.category].push(...ingredient.items);
    });
  });
  
  // 2. Consolidate duplicates
  Object.keys(ingredientsByCategory).forEach(category => {
    const unique = [...new Set(ingredientsByCategory[category])];
    ingredientsByCategory[category] = unique;
  });
  
  return {
    shopping_list: ingredientsByCategory,
    meal_count: selectedMeals.length,
    printable: true,
    timestamp: new Date()
  };
}

// Output Format (Simple for printing)
{
  shopping_list: {
    "vegetables": ["tomato", "spinach", "zucchini", "lemon"],
    "fish": ["salmon", "sardines"],
    "dairy": ["feta cheese", "yogurt"],
    "oils": ["extra virgin olive oil"],
    "grains": ["whole wheat pasta"]
  },
  meal_count: 4,
  printable: true
}
```

### 3.3B Example Meals (Two-Course Structure)

Here are meals structured according to SJD Barcelona recommendations:

**Example 1: Monday Lunch**
```json
{
  "name": "Potato salad with grilled chicken",
  "first_course": {
    "name": "Potato and lettuce salad with cherry tomatoes",
    "food_groups": ["vegetables"]
  },
  "second_course": {
    "name": "Grilled chicken tenders with roasted peppers",
    "protein": "chicken",
    "carbs": "potatoes", 
    "food_groups": ["poultry", "vegetables"]
  },
  "dessert": "Orange",
  "food_groups_covered": ["vegetables", "poultry", "grains", "fruits"],
  "meal_type": "regular"
}
```

**Example 2: Monday Dinner (Lighter)**
```json
{
  "name": "Salmon with sautéed rice",
  "first_course": {
    "name": "Sautéed rice with zucchini and carrots",
    "food_groups": ["vegetables", "grains"]
  },
  "second_course": {
    "name": "Gilt-head bream with tomato sauce",
    "protein": "fish_white",
    "carbs": "rice",
    "food_groups": ["fish", "grains", "vegetables"]
  },
  "dessert": "Yogurt",
  "food_groups_covered": ["fish", "grains", "vegetables", "dairy"],
  "meal_type": "regular"
}
```

**Example 3: Legume-Based (Legume Week)**
```json
{
  "name": "Lentil salad with eggs",
  "first_course": {
    "name": "Complete lentil salad with spinach, onion, carrots, nuts, pumpkin seeds and hard-boiled egg",
    "food_groups": ["legumes", "vegetables", "nuts", "eggs"]
  },
  "second_course": null,
  "dessert": "Apple",
  "food_groups_covered": ["legumes", "vegetables", "nuts", "eggs", "fruits"],
  "meal_type": "regular",
  "note": "Complete meal as one plate (legume provides both protein and carbs)"
}
```

**Food Groups Checklist in Meal Examples:**
- ✓ Always includes vegetables
- ✓ Always includes protein
- ✓ Usually includes grains (unless legumes are protein+carb)
- ✓ Varies protein sources (fish, chicken, eggs, legumes)
- ✓ Uses olive oil for cooking
- ✓ Includes dessert (fruit preferred)

### 3.4 Development Tasks Breakdown

#### **WEEK 3: Authentication & Home Screen (3-STEP FLOW)**
- [x] Set up Firebase project
- [x] Create login/signup screen (mobile & web)
- [ ] Build Home Screen with instant meal suggestion
- [ ] Create three action buttons: Accept | Show Another | Customize
- [ ] Implement instant suggestion loading (<1 second)
- [ ] Test quick load time on mobile

#### **WEEK 4: Meal Database & Two-Course Structure**
- [ ] Design Firestore meal database schema with two-course structure
- [ ] Create meal creation form with:
  - [ ] First course selector (vegetables/salad)
  - [ ] Second course selector (protein + carbs)
  - [ ] Optional dessert (fruit/yogurt)
- [ ] Add ingredient category selector
- [ ] Set meal type (regular vs occasional)
- [ ] Add food groups coverage tracking
- [ ] Implement local meal search
- [ ] Create seed data (15-20 Mediterranean meals properly structured)
- [ ] Build meal display with two-course layout

#### **WEEK 5: Guard Rails, Customization & Create Meal**
- [ ] Implement 7-day + occasional rule logic
- [ ] Build "Customize" meal selector view
- [ ] Create guard rail system:
  - [ ] Grey out ineligible meals
  - [ ] Disable buttons on ineligible meals
  - [ ] Show warning reasons (last cook date, who cooked)
  - [ ] Filter and sort eligible meals
- [ ] **Build inline "Create New Meal" form:**
  - [ ] Expandable meal creation form
  - [ ] First course selector (vegetables/salad)
  - [ ] Second course selector (protein + carbs)
  - [ ] Optional dessert selector
  - [ ] Validation (name + courses required)
  - [ ] Save meal to collection
  - [ ] Immediately select for today
- [ ] Implement allergy filtering
- [ ] Test that users CANNOT break 7-day rule
- [ ] Create meal history tracking system
- [ ] Test create meal flow end-to-end

#### **WEEK 6: Shopping List & Team Features**
- [ ] Build shopping list generator
- [ ] Create printable shopping list view
- [ ] Add team member invitations
- [ ] Implement shared meal history
- [ ] Create team settings page
- [ ] Add meal history view with ratings
- [ ] Show "Last cooked X days ago by [name]"

#### **WEEK 7: Weekly Menu & Polish**
- [ ] Build week view calendar (lunch/dinner only)
- [ ] Add drag-drop or quick selection for meals
- [ ] Create team accountability dashboard
- [ ] Add notifications for meal suggestions
- [ ] Polish UI for speed and simplicity
- [ ] Test all 3-step flows

#### **WEEK 8: Testing & Mobile Optimization**
- [ ] Unit tests for suggestion engine
- [ ] Test guard rail prevention (can't bypass 7-day rule)
- [ ] Mobile responsiveness testing
- [ ] Offline functionality testing
- [ ] App Store submission preparation
- [ ] Performance optimization
- [ ] Bug fixes and final polish

---

## PHASE 4: IMPLEMENTATION GUIDELINES

### 4.1 Frontend Architecture (React Native + React) - QUICK & SIMPLE

```
src/
├── screens/
│   ├── HomeScreen.js              # "What's for dinner?" button + last suggestion
│   ├── MealListScreen.js          # All meals with search
│   ├── CreateMealScreen.js        # Simple form: name + ingredients
│   ├── WeeklyMenuScreen.js        # Week view (lunch/dinner only)
│   ├── ShoppingListScreen.js      # Shopping list by category
│   ├── MealHistoryScreen.js       # Team meal history
│   ├── TeamScreen.js              # Invite members, settings
│   ├── LoginScreen.js
│   └── ProfileScreen.js
├── components/
│   ├── MealCard.js                # Simple meal display
│   ├── QuickSuggestButton.js      # 2-tap "What's for dinner?" button
│   ├── IngredientSelector.js      # Category picker
│   ├── MealHistoryItem.js         # Recent meal with rating
│   └── ShoppingListItem.js        # Category + items list
├── services/
│   ├── firebaseService.js         # Database operations
│   ├── mealSuggestionEngine.js    # 7-day + occasional logic
│   ├── shoppingListService.js     # Shopping list generation
│   └── teamService.js             # Team operations
├── utils/
│   ├── dateHelpers.js
│   ├── allergencyChecker.js
│   └── ingredientHelpers.js
├── styles/
│   ├── colors.js                  # Simple color palette
│   ├── typography.js
│   └── spacing.js
└── App.js
```

**Design Principles:**
- **Mobile-first**: Design for phones first, scale to web
- **2-tap maximum**: Any common task should be 2 taps
- **No scrolling hell**: Keep screens simple, show most important info first
- **Fast feedback**: Instant meal suggestion (no loading spinners if possible)

### 4.2 Backend Logic (Firebase Functions - Optional)

```javascript
// For automated tasks (schedule meal suggestions)
// Firebase Cloud Functions trigger daily meal suggestion email

exports.dailyMealSuggestion = functions.pubsub
  .schedule('every day 08:00')
  .onRun(async (context) => {
    const users = await db.collection('user_profiles').get();
    
    users.forEach(async (userDoc) => {
      const suggestions = await generateDailySuggestion(userDoc.id);
      await sendMealSuggestionEmail(userDoc.data().email, suggestions);
    });
  });
```

### 4.3 State Management

**For Mobile (React Native):**
```javascript
// Use React Context API or Redux for state
// Simple approach: Context API (easier for small teams)

import React, { createContext, useReducer } from 'react';

export const MealContext = createContext();

const mealReducer = (state, action) => {
  switch(action.type) {
    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] };
    case 'REMOVE_MEAL':
      return { ...state, meals: state.meals.filter(m => m.id !== action.payload) };
    default:
      return state;
  }
};

export function MealProvider({ children }) {
  const [state, dispatch] = useReducer(mealReducer, initialState);
  return <MealContext.Provider value={{ state, dispatch }}>{children}</MealContext.Provider>;
}
```

### 4.4 API Integration Examples

#### Spoonacular Integration
```javascript
// services/spoonacularService.js

const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_KEY;

export async function getNutritionInfo(foodName) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/nutrition/estimate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SPOONACULAR_API_KEY
        },
        body: JSON.stringify({
          ingredients: [foodName],
          servingSize: 100
        })
      }
    );
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
```

#### Firebase Integration
```javascript
// services/firebaseService.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... rest of config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export async function saveMeal(mealData) {
  try {
    const docRef = await addDoc(collection(db, 'meals'), mealData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}
```

---

## PHASE 5: DEPLOYMENT & LAUNCH

### 5.1 Mobile App Deployment (Week 8-9)

#### **iOS (App Store)**
1. Sign up for Apple Developer Program ($99/year)
2. Create App ID and provisioning profiles
3. Build using Expo: `expo build:ios`
4. Submit to App Store Connect
5. Wait for review (2-7 days)

#### **Android (Google Play)**
1. Create Google Play Console account ($25 one-time)
2. Generate signing key
3. Build using Expo: `expo build:android`
4. Upload to Google Play Console
5. Review & publish (24-48 hours)

### 5.2 Web Deployment

**Options (all under $50/month):**
- **Vercel** (recommended, free tier available)
  - Deploy from GitHub: `git push` → auto-deploy
  - Built-in analytics and preview links
- **Netlify** (also free tier)
- **Firebase Hosting** (with Firestore backend)

```bash
# Deploy to Vercel
npm install -g vercel
vercel login
vercel deploy
```

### 5.3 Environment Configuration

Create `.env` files for each environment:

```bash
# .env.local (development)
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_SPOONACULAR_KEY=xxx
REACT_APP_ENV=development

# .env.production (for deployment)
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_SPOONACULAR_KEY=xxx
REACT_APP_ENV=production
```

---

## PHASE 6: TESTING & QUALITY ASSURANCE

### 6.1 Testing Strategy

#### **Unit Tests** (test individual functions)
```bash
npm install --save-dev jest @testing-library/react

# Example test
describe('Mediterranean Scorer', () => {
  test('should calculate correct score for salmon meal', () => {
    const meal = { name: 'Salmon', ingredients: ['olive oil', 'lemon'] };
    const score = calculateMediterraneanScore(meal);
    expect(score).toBeGreaterThan(8);
  });
});
```

#### **Integration Tests** (test components together)
- Test user authentication flow
- Test meal creation → suggestion → shopping list
- Test data synchronization between devices

#### **UI/UX Testing**
- Test on multiple devices (iPhone, Android, tablets)
- Test offline functionality
- Test with real nutritional data

### 6.2 Performance Optimization

```javascript
// Lazy load heavy components
const ShoppingListGenerator = React.lazy(() => 
  import('./components/ShoppingList/ShoppingListGenerator')
);

// Optimize re-renders with useMemo
const memoizedMeals = useMemo(() => 
  filterAndSortMeals(meals, filters),
  [meals, filters]
);

// Implement virtual scrolling for long meal lists
<VirtualizedList
  data={meals}
  renderItem={({ item }) => <MealItem meal={item} />}
/>
```

---

## PHASE 7: BUDGET BREAKDOWN

### Development Costs (Under $5,000)

| Item | Cost | Notes |
|------|------|-------|
| **Development Tools** | |  |
| VS Code | Free | Open source |
| Node.js & NPM | Free | Open source |
| Git/GitHub | Free | Free tier sufficient |
| **Cloud Services** | |  |
| Firebase | Free* | Free tier for MVP |
| Web Hosting | $0-50 | Vercel/Netlify free tier |
| **Distribution** | |  |
| Apple Developer | $99 | Annual membership |
| Google Play | $25 | One-time fee |
| **Design & Resources** | |  |
| UI Kits | Free | Figma free tier, open source |
| Icons/Images | Free | Unsplash, Pexels, Figma |
| **Learning Resources** | |  |
| React Native Course | Free-50 | Udemy, Pluralsight, YouTube |
| Firebase Docs | Free | Official documentation |
| **Contingency (10%)** | $500 | Unexpected costs |
| **TOTAL** | **$2,700-3,000** | Well under budget |

*Firebase free tier: 1 GB storage, 50,000 read/write/delete per day - More than enough for MVP

---

## PHASE 8: TEAM LEARNING PATH

### 8.1 Recommended Learning Sequence

**Month 1 - Foundations (before coding)**
- [ ] JavaScript basics (async/await, promises)
- [ ] React fundamentals (components, hooks, state)
- [ ] Firebase basics (authentication, Firestore)
- [ ] API concepts (REST, JSON)

**Month 2 - Mobile Development**
- [ ] React Native fundamentals
- [ ] Navigation (React Navigation)
- [ ] State management (Context API)
- [ ] Mobile-specific challenges (offline, sync)

**Month 3 - Implementation**
- [ ] Build meal system while learning
- [ ] Deploy first version
- [ ] Gather user feedback
- [ ] Iterate on features

### 8.2 Resources

**Free Learning:**
- React Native Docs: https://reactnative.dev/
- Firebase Docs: https://firebase.google.com/docs
- MDN Web Docs: https://developer.mozilla.org/
- YouTube tutorials: "React Native 2026"

**Paid Courses (Optional):**
- React Native by Stephen Grider (Udemy) - $15-50
- React for Beginners (Scrimba) - $10-30/month
- The Complete React Course (ZTM Academy) - $99

---

## PHASE 9: POST-LAUNCH ROADMAP (Months 4-6)

### **Month 4: Gather Feedback & Fix Bugs**
- Release app to App Stores
- Monitor crash reports
- Collect user feedback
- Fix critical bugs
- Target: 4.5+ star rating
- Optimize meal suggestion algorithm based on usage

### **Month 5: Advanced Ingredient & History Features**
- [ ] Bulk meal upload (CSV import from custom database)
- [ ] Advanced ingredient filtering (show meals by specific ingredient)
- [ ] Meal history analytics (most/least cooked meals)
- [ ] Custom ingredient preferences per team member
- [ ] Meal timing suggestions (seasonal or theme-based)

### **Month 6: Team & Personalization**
- [ ] Team statistics dashboard (who cooks most, favorites)
- [ ] Family meal voting system (choose between 3 suggestions)
- [ ] Seasonal meal rotations
- [ ] Duplicate meal prevention improvements
- [ ] Multi-language support (Spanish, Italian, etc.)

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **API Rate Limiting** | Medium | Medium | Cache nutrition data locally, upgrade API tier if needed |
| **Development Delays** | Medium | High | Start with MVP features only, hire freelancer if stuck |
| **Data Synchronization Issues** | Medium | High | Use Firebase real-time sync, implement offline queue |
| **User Adoption Slow** | Low | Medium | Gather feedback early, iterate based on usage patterns |
| **Team Growing Unexpectedly** | Low | Medium | Architecture supports scaling (Firebase auto-scales) |
| **Technology Stack Change** | Low | High | Document all decisions, use modular architecture |

---

## SUCCESS METRICS

### Launch Metrics (Month 1-3)
- ✓ App available on iOS & Android App Stores
- ✓ 50+ active users
- ✓ 4+ star rating
- ✓ <2% crash rate

### Growth Metrics (Month 4-6)
- ✓ 200+ active users
- ✓ 70%+ weekly engagement
- ✓ 10+ meals in custom database
- ✓ Positive user feedback

### Revenue Metrics (Future)
- ✓ Freemium model (free MVP + premium features)
- ✓ Target: $500/month from 50 premium users

---

## FINAL CHECKLIST BEFORE STARTING

- [ ] All team members understand the technology stack
- [ ] Firebase account created
- [ ] Spoonacular API key obtained
- [ ] GitHub repository initialized
- [ ] Development environment installed
- [ ] First week's tasks assigned
- [ ] Weekly meeting schedule set (e.g., Monday 10 AM)
- [ ] Backup & version control strategy documented
- [ ] Communication tool chosen (Slack, Discord)
- [ ] Design mockups reviewed

---

## APPENDIX: Code Templates

### A1: Quick Meal Suggestion (2-3 seconds)

```javascript
// services/mealSuggestionEngine.js

async function quickSuggestMeal(teamId, userId) {
  // Get user allergies
  const user = await db.collection('user_profiles').doc(userId).get();
  const allergies = user.data().allergies || [];
  
  // Get last 7 days of meals
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentMeals = await db.collection('meal_history')
    .where('team_id', '==', teamId)
    .where('cooked_date', '>=', sevenDaysAgo)
    .get();
  
  const recentMealIds = new Set(recentMeals.docs.map(d => d.data().meal_id));
  
  // Get all meals
  let availableMeals = await db.collection('meals')
    .where('team_id', '==', teamId)
    .get();
  
  // Filter: not eaten in 7 days + respect occasional meals
  availableMeals = availableMeals.docs.filter(doc => {
    const meal = doc.data();
    
    if (recentMealIds.has(meal.id)) return false;
    
    if (meal.meal_type === 'occasional') {
      const daysSinceCooked = (new Date() - meal.last_cooked.toDate()) / (1000 * 60 * 60 * 24);
      return daysSinceCooked > 10;
    }
    
    return true;
  });
  
  // Filter allergies
  availableMeals = availableMeals.filter(doc => {
    const meal = doc.data();
    const allIngredients = meal.main_ingredients.flatMap(i => i.items);
    return !allIngredients.some(ing => allergies.includes(ing));
  });
  
  // Random selection
  if (availableMeals.length === 0) {
    return null; // All meals exhausted
  }
  
  const randomMeal = availableMeals[Math.floor(Math.random() * availableMeals.length)];
  return randomMeal.data();
}
```

### A2: Simple Meal Card Component (React Native)

```javascript
// components/MealCard.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function MealCard({ meal, onPress, showAddButton }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 12 }}>
      <View style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        borderLeftWidth: 4,
        borderLeftColor: meal.meal_type === 'occasional' ? '#ff9800' : '#4CAF50'
      }}>
        {/* Meal Name */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          {meal.name}
        </Text>
        
        {/* Ingredients Preview */}
        <View style={{ marginBottom: 8 }}>
          {meal.main_ingredients.map((ing, idx) => (
            <Text key={idx} style={{ fontSize: 12, color: '#666' }}>
              {ing.category}: {ing.items.join(', ')}
            </Text>
          ))}
        </View>
        
        {/* Type Badge */}
        <Text style={{ fontSize: 11, color: '#999' }}>
          {meal.meal_type === 'occasional' ? '⚠️ Occasional' : '✓ Regular'} • 
          Cooked {meal.times_cooked} times
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

### A3: Shopping List Generator (Simple)

```javascript
// services/shoppingListService.js

export function generateShoppingList(selectedMeals) {
  const ingredients = {};
  
  // Group ingredients by category
  selectedMeals.forEach(meal => {
    meal.main_ingredients.forEach(ing => {
      if (!ingredients[ing.category]) {
        ingredients[ing.category] = new Set();
      }
      ing.items.forEach(item => ingredients[ing.category].add(item));
    });
  });
  
  // Convert Sets to arrays for display
  const result = {};
  Object.keys(ingredients).forEach(category => {
    result[category] = Array.from(ingredients[category]).sort();
  });
  
  return result;
}

// Usage
const meals = [mealA, mealB, mealC];
const list = generateShoppingList(meals);
console.log(list);
// {
//   "vegetables": ["lemon", "spinach", "tomato"],
//   "fish": ["salmon"],
//   "oils": ["olive oil"]
// }
```

### A4: Home Screen with 3-Step Flow (React Native)

```javascript
// screens/HomeScreen.js
// STEP 1: Open app
// STEP 2: App suggests meal (auto-loaded)
// STEP 3: User chooses: Accept | Show Another | Customize

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { quickSuggestMeal } from '../services/mealSuggestionEngine';

export function HomeScreen({ teamId, userId, navigation }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // STEP 1 + 2: Load suggestion immediately on mount
  useEffect(() => {
    loadSuggestion();
  }, []);

  const loadSuggestion = async () => {
    setLoading(true);
    try {
      const meal = await quickSuggestMeal(teamId, userId);
      setSuggestion(meal);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleAccept = () => {
    // Log meal as cooked today
    navigation.navigate('ConfirmMeal', { mealId: suggestion.id });
  };

  const handleShowAnother = async () => {
    // Get different suggestion
    await loadSuggestion();
  };

  const handleCustomize = () => {
    // Go to meal selector with guard rails
    navigation.navigate('SelectMeal', { teamId });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
        What's for dinner?
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : suggestion ? (
        <>
          {/* STEP 2: Suggested Meal Display */}
          <View style={{
            padding: 20,
            backgroundColor: '#f0f8f0',
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: suggestion.meal_type === 'occasional' ? '#ff9800' : '#4CAF50',
            marginBottom: 30
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
              {suggestion.name}
            </Text>

            {/* Show Ingredients by Category */}
            {suggestion.main_ingredients.map((ing, idx) => (
              <Text key={idx} style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                🥘 {ing.category.toUpperCase()}: {ing.items.join(', ')}
              </Text>
            ))}

            {/* Show Type & Last Cook Info */}
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#ddd' }}>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {suggestion.meal_type === 'occasional' ? '⚠️ Occasional' : '✓ Regular'} • 
                Last cooked: {suggestion.last_cooked ? `${daysAgo(suggestion.last_cooked)}` : 'Never'}
              </Text>
            </View>
          </View>

          {/* STEP 3: Three Action Buttons */}
          <View style={{ gap: 12 }}>
            {/* Primary: Accept */}
            <TouchableOpacity
              onPress={handleAccept}
              style={{
                backgroundColor: '#4CAF50',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                ✓ Accept This Meal
              </Text>
            </TouchableOpacity>

            {/* Secondary: Show Another */}
            <TouchableOpacity
              onPress={handleShowAnother}
              style={{
                backgroundColor: '#2196F3',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                ↻ Show Me Another Idea
              </Text>
            </TouchableOpacity>

            {/* Tertiary: Customize */}
            <TouchableOpacity
              onPress={handleCustomize}
              style={{
                backgroundColor: '#f0f0f0',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ddd'
              }}
            >
              <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>
                ✏️ Customize My Choice
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>No suggestion available</Text>
      )}
    </ScrollView>
  );
}

function daysAgo(date) {
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  return `${days} days ago`;
}
```

### A4B: Meal Selector with Guard Rails (React Native)

```javascript
// screens/SelectMealScreen.js
// Users can customize, but CANNOT bypass 7-day rule

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { getEligibleMeals } from '../services/mealSuggestionEngine';

export function SelectMealScreen({ teamId, userId, navigation }) {
  const [elegibleMeals, setEligibleMeals] = useState([]);
  const [ineligibleMeals, setIneligibleMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const eligible = await getEligibleMeals(teamId, userId);
      setEligibleMeals(eligible);
      
      const ineligible = await getIneligibleMeals(teamId, userId);
      setIneligibleMeals(ineligible);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleSelectMeal = (meal) => {
    navigation.navigate('ConfirmMeal', { mealId: meal.id });
  };

  const renderEligibleMeal = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectMeal(item)}
      style={{
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        ✓ {item.name}
      </Text>
      <Text style={{ fontSize: 12, color: '#666' }}>
        {item.main_ingredients.map(i => i.category).join(', ')}
      </Text>
    </TouchableOpacity>
  );

  const renderIneligibleMeal = ({ item }) => (
    <View
      style={{
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ccc',
        opacity: 0.6
      }}
    >
      <Text style={{ fontSize: 16, color: '#999', marginBottom: 8 }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 12, color: '#d32f2f', fontWeight: 'bold' }}>
        {item.reason}
      </Text>
      <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
        Last cooked: {item.lastCookedDate} by {item.cookedBy}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Choose from available meals
      </Text>

      <ScrollView>
        {/* Eligible Meals */}
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#4CAF50' }}>
          ✓ AVAILABLE ({eligibleMeals.length})
        </Text>
        <FlatList
          scrollEnabled={false}
          data={eligibleMeals}
          renderItem={renderEligibleMeal}
          keyExtractor={item => item.id}
        />

        {/* Ineligible Meals (Greyed Out) */}
        {ineligibleMeals.length > 0 && (
          <>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginTop: 20, color: '#999' }}>
              ⚠️ NOT AVAILABLE ({ineligibleMeals.length})
            </Text>
            <FlatList
              scrollEnabled={false}
              data={ineligibleMeals}
              renderItem={renderIneligibleMeal}
              keyExtractor={item => item.id}
            />
            <Text style={{ fontSize: 12, color: '#999', marginTop: 12, fontStyle: 'italic' }}>
              Choose from available options above to maintain meal variety.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
```

### A4C: Create New Meal Inline Component (React Native)

```javascript
// components/CreateMealForm.js
// Inline form for creating meals while customizing

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { createMeal } from '../services/firebaseService';

export function CreateMealForm({ teamId, userId, onMealCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('regular');
  const [firstCourse, setFirstCourse] = useState('');
  const [secondCourse, setSecondCourse] = useState('');
  const [dessert, setDessert] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    return mealName.trim() && firstCourse.trim() && secondCourse.trim();
  };

  const handleCreateMeal = async () => {
    if (!validateForm()) {
      alert('Please fill in meal name, first course, and second course');
      return;
    }

    setLoading(true);
    try {
      const mealData = {
        name: mealName,
        meal_type: mealType,
        meal_composition: {
          first_course: {
            name: firstCourse,
            category: 'vegetables'
          },
          second_course: {
            name: secondCourse,
            category: 'protein'
          }
        },
        dessert: dessert || null,
        times_cooked: 1,
        last_cooked: new Date()
      };

      const newMealId = await createMeal(teamId, userId, mealData);
      
      // Immediately use this meal
      onMealCreated(newMealId);
      
      // Reset form
      setExpanded(false);
      setMealName('');
      setFirstCourse('');
      setSecondCourse('');
      setDessert('');
      setMealType('regular');
      
    } catch (error) {
      console.error('Error creating meal:', error);
      alert('Error creating meal. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{
          backgroundColor: '#f0f0f0',
          padding: 16,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#4CAF50',
          borderStyle: 'dashed'
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4CAF50' }}>
          ➕ Create New Meal
        </Text>
        <Text style={{ fontSize: 20 }}>
          {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Expanded Form */}
      {expanded && (
        <View style={{
          backgroundColor: '#f9f9f9',
          padding: 16,
          borderRadius: 8,
          marginTop: 12,
          borderWidth: 1,
          borderColor: '#e0e0e0'
        }}>
          {/* Meal Name */}
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
            Meal Name *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 6,
              padding: 10,
              marginBottom: 16,
              fontSize: 14
            }}
            placeholder="e.g., Pasta with tuna and salad"
            value={mealName}
            onChangeText={setMealName}
          />

          {/* Meal Type */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              Meal Type
            </Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity
                onPress={() => setMealType('regular')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: mealType === 'regular' ? '#4CAF50' : '#ccc',
                  backgroundColor: mealType === 'regular' ? '#4CAF50' : 'transparent'
                }} />
                <Text>Regular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMealType('occasional')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: mealType === 'occasional' ? '#ff9800' : '#ccc',
                  backgroundColor: mealType === 'occasional' ? '#ff9800' : 'transparent'
                }} />
                <Text>Occasional</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* First Course */}
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
            First Course (Vegetables/Salad) *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 6,
              padding: 10,
              marginBottom: 16,
              fontSize: 14
            }}
            placeholder="e.g., Mixed green salad with tomato"
            value={firstCourse}
            onChangeText={setFirstCourse}
          />

          {/* Second Course */}
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
            Second Course (Protein + Carbs) *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 6,
              padding: 10,
              marginBottom: 16,
              fontSize: 14
            }}
            placeholder="e.g., Grilled tuna with pasta"
            value={secondCourse}
            onChangeText={setSecondCourse}
          />

          {/* Dessert */}
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
            Dessert (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 6,
              padding: 10,
              marginBottom: 16,
              fontSize: 14
            }}
            placeholder="e.g., Apple or yogurt"
            value={dessert}
            onChangeText={setDessert}
          />

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => setExpanded(false)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 6,
                backgroundColor: '#f0f0f0',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontWeight: 'bold', color: '#666' }}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateMeal}
              disabled={loading || !validateForm()}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 6,
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                alignItems: 'center'
              }}
            >
              <Text style={{ 
                fontWeight: 'bold', 
                color: '#fff',
                opacity: loading || !validateForm() ? 0.6 : 1
              }}>
                {loading ? 'CREATING...' : 'SAVE & USE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
```

### A5: Firestore Query Examples

```javascript
// services/firebaseService.js

// Get all meals for team
export async function getTeamMeals(teamId) {
  const snapshot = await db.collection('meals')
    .where('team_id', '==', teamId)
    .orderBy('name')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get recent meal history
export async function getMealHistory(teamId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const snapshot = await db.collection('meal_history')
    .where('team_id', '==', teamId)
    .where('cooked_date', '>=', date)
    .orderBy('cooked_date', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Create meal
export async function createMeal(teamId, userId, mealData) {
  return await db.collection('meals').add({
    ...mealData,
    team_id: teamId,
    created_by: userId,
    created_at: new Date(),
    times_cooked: 0,
    last_cooked: null
  });
}

// Log meal cooked
export async function logMealCooked(teamId, mealId, userId, rating = null) {
  await db.collection('meal_history').add({
    team_id: teamId,
    meal_id: mealId,
    cooked_by: userId,
    cooked_date: new Date(),
    rating: rating,
    notes: ''
  });
  
  // Update meal stats
  const mealRef = db.collection('meals').doc(mealId);
  await mealRef.update({
    times_cooked: FieldValue.increment(1),
    last_cooked: new Date()
  });
}
```

---

## DOCUMENT VERSION

**Version:** 1.0  
**Created:** April 21, 2026  
**Last Updated:** April 21, 2026  
**Status:** Ready for Development

---

## QUESTIONS? NEXT STEPS

1. **Review this document** with your team
2. **Decide on tech stack** (recommended: React Native + Firebase)
3. **Set up development environment**
4. **Schedule kick-off meeting** with the team
5. **Start Week 1 tasks** (authentication & setup)

**Good luck with your Mediterranean Meal Planner! 🌿**
