export type FoodCategory =
  | 'grains'
  | 'protein'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'nuts_seeds'
  | 'beverages'
  | 'snacks'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  // Per 100g (or per 100ml for liquids)
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  unit: 'g' | 'ml'
  // Common serving sizes
  servings: { label: string; amount: number }[]
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── Grains ──────────────────────────────────────────────────────────────
  {
    id: 'rice-cooked',
    name: 'Rice (Cooked)',
    category: 'grains',
    calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, unit: 'g',
    servings: [{ label: '1 cup (200g)', amount: 200 }, { label: '½ cup (100g)', amount: 100 }, { label: '1 small bowl (150g)', amount: 150 }],
  },
  {
    id: 'museli-water',
    name: 'Museli (with Water)',
    category: 'grains',
    calories: 350, protein: 5.7, carbs: 280, fat: 0.3, fiber: 0.4, unit: 'g',
    servings: [{ label: '1 scoop (30g)', amount: 30 }, { label: '½ scoop (15g)', amount: 15 }, { label: '1 small bowl (150g)', amount: 150 }],
  },
  {
    id: 'chapati',
    name: 'Chapati / Roti',
    category: 'grains',
    calories: 297, protein: 9, carbs: 55, fat: 4, fiber: 2, unit: 'g',
    servings: [{ label: '1 medium roti (40g)', amount: 40 }, { label: '2 rotis (80g)', amount: 80 }, { label: '3 rotis (120g)', amount: 120 }],
  },
  {
    id: 'paratha',
    name: 'Paratha (Plain)',
    category: 'grains',
    calories: 300, protein: 8, carbs: 48, fat: 9, fiber: 2, unit: 'g',
    servings: [{ label: '1 paratha (70g)', amount: 70 }, { label: '2 parathas (140g)', amount: 140 }],
  },
  {
    id: 'oats',
    name: 'Oats (Cooked)',
    category: 'grains',
    calories: 71, protein: 2.5, carbs: 12, fat: 1.4, fiber: 1.7, unit: 'g',
    servings: [{ label: '1 bowl (250g)', amount: 250 }, { label: '½ bowl (125g)', amount: 125 }],
  },
  {
    id: 'bread-white',
    name: 'White Bread',
    category: 'grains',
    calories: 265, protein: 9, carbs: 49, fat: 3, fiber: 2.7, unit: 'g',
    servings: [{ label: '1 slice (30g)', amount: 30 }, { label: '2 slices (60g)', amount: 60 }],
  },
  {
    id: 'poha',
    name: 'Poha (Cooked)',
    category: 'grains',
    calories: 110, protein: 2.5, carbs: 23, fat: 1, fiber: 0.5, unit: 'g',
    servings: [{ label: '1 serving (200g)', amount: 200 }, { label: '½ serving (100g)', amount: 100 }],
  },
  {
    id: 'dal-cooked',
    name: 'Dal (Cooked)',
    category: 'grains',
    calories: 116, protein: 7.6, carbs: 20, fat: 0.4, fiber: 3.2, unit: 'g',
    servings: [{ label: '1 bowl (200g)', amount: 200 }, { label: '½ bowl (100g)', amount: 100 }],
  },
  {
    id: 'idli',
    name: 'Idli',
    category: 'grains',
    calories: 58, protein: 2, carbs: 12, fat: 0.4, fiber: 0.5, unit: 'g',
    servings: [{ label: '1 idli (40g)', amount: 40 }, { label: '2 idlis (80g)', amount: 80 }, { label: '4 idlis (160g)', amount: 160 }],
  },

  // ── Protein ─────────────────────────────────────────────────────────────
  {
    id: 'paneer',
    name: 'Paneer',
    category: 'protein',
    calories: 265, protein: 18, carbs: 2, fat: 21, unit: 'g',
    servings: [{ label: '50g', amount: 50 }, { label: '100g', amount: 100 }, { label: '150g', amount: 150 }],
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast (Cooked)',
    category: 'protein',
    calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: 'g',
    servings: [{ label: '1 piece (100g)', amount: 100 }, { label: '150g', amount: 150 }, { label: '200g', amount: 200 }],
  },
  {
    id: 'egg-whole',
    name: 'Egg (Whole)',
    category: 'protein',
    calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: 'g',
    servings: [{ label: '1 egg (50g)', amount: 50 }, { label: '2 eggs (100g)', amount: 100 }, { label: '3 eggs (150g)', amount: 150 }],
  },
  {
    id: 'egg-white',
    name: 'Egg White',
    category: 'protein',
    calories: 52, protein: 11, carbs: 0.7, fat: 0.2, unit: 'g',
    servings: [{ label: '1 egg white (30g)', amount: 30 }, { label: '3 egg whites (90g)', amount: 90 }],
  },
  {
    id: 'rajma',
    name: 'Rajma (Cooked)',
    category: 'protein',
    calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6.4, unit: 'g',
    servings: [{ label: '1 bowl (200g)', amount: 200 }, { label: '½ bowl (100g)', amount: 100 }],
  },
  {
    id: 'chana',
    name: 'Chana / Chickpeas (Cooked)',
    category: 'protein',
    calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, unit: 'g',
    servings: [{ label: '1 bowl (200g)', amount: 200 }, { label: '½ cup (100g)', amount: 100 }],
  },
  {
    id: 'tofu',
    name: 'Tofu',
    category: 'protein',
    calories: 76, protein: 8, carbs: 1.9, fat: 4.8, unit: 'g',
    servings: [{ label: '100g', amount: 100 }, { label: '150g', amount: 150 }],
  },
  {
    id: 'protein-powder',
    name: 'Whey Protein (1 scoop)',
    category: 'protein',
    calories: 120, protein: 25, carbs: 3, fat: 1.5, unit: 'g',
    servings: [{ label: '1 scoop (30g)', amount: 30 }, { label: '2 scoops (60g)', amount: 60 }],
  },

  // ── Vegetables ──────────────────────────────────────────────────────────
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'vegetables',
    calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, unit: 'g',
    servings: [{ label: '1 cup (30g)', amount: 30 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'potato',
    name: 'Potato (Boiled)',
    category: 'vegetables',
    calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8, unit: 'g',
    servings: [{ label: '1 medium (150g)', amount: 150 }, { label: '1 small (100g)', amount: 100 }],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'vegetables',
    calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: 'g',
    servings: [{ label: '1 medium (120g)', amount: 120 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'onion',
    name: 'Onion',
    category: 'vegetables',
    calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, unit: 'g',
    servings: [{ label: '1 medium (110g)', amount: 110 }, { label: '50g', amount: 50 }],
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'vegetables',
    calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, unit: 'g',
    servings: [{ label: '1 cup (90g)', amount: 90 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'carrot',
    name: 'Carrot',
    category: 'vegetables',
    calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: 'g',
    servings: [{ label: '1 medium (80g)', amount: 80 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    category: 'vegetables',
    calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, unit: 'g',
    servings: [{ label: '½ cucumber (100g)', amount: 100 }, { label: '1 cup sliced (120g)', amount: 120 }],
  },

  // ── Fruits ──────────────────────────────────────────────────────────────
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: 'g',
    servings: [{ label: '1 medium (120g)', amount: 120 }, { label: '1 large (150g)', amount: 150 }],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruits',
    calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: 'g',
    servings: [{ label: '1 medium (180g)', amount: 180 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'mango',
    name: 'Mango',
    category: 'fruits',
    calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, unit: 'g',
    servings: [{ label: '1 cup (165g)', amount: 165 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'orange',
    name: 'Orange',
    category: 'fruits',
    calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, unit: 'g',
    servings: [{ label: '1 medium (130g)', amount: 130 }, { label: '100g', amount: 100 }],
  },

  // ── Dairy ───────────────────────────────────────────────────────────────
  {
    id: 'milk-full-fat',
    name: 'Milk (Full Fat)',
    category: 'dairy',
    calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, unit: 'ml',
    servings: [{ label: '1 glass (250ml)', amount: 250 }, { label: '½ glass (125ml)', amount: 125 }],
  },
  {
    id: 'curd',
    name: 'Curd / Dahi',
    category: 'dairy',
    calories: 98, protein: 11, carbs: 3.4, fat: 4.3, unit: 'g',
    servings: [{ label: '1 bowl (200g)', amount: 200 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    category: 'dairy',
    calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: 'g',
    servings: [{ label: '1 cup (200g)', amount: 200 }, { label: '100g', amount: 100 }],
  },
  {
    id: 'ghee',
    name: 'Ghee',
    category: 'dairy',
    calories: 900, protein: 0, carbs: 0, fat: 99, unit: 'g',
    servings: [{ label: '1 tsp (5g)', amount: 5 }, { label: '1 tbsp (15g)', amount: 15 }],
  },
  {
    id: 'butter',
    name: 'Butter',
    category: 'dairy',
    calories: 717, protein: 0.9, carbs: 0.1, fat: 81, unit: 'g',
    servings: [{ label: '1 tsp (5g)', amount: 5 }, { label: '1 tbsp (14g)', amount: 14 }],
  },

  // ── Nuts & Seeds ────────────────────────────────────────────────────────
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'nuts_seeds',
    calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, unit: 'g',
    servings: [{ label: '10 almonds (12g)', amount: 12 }, { label: '25g', amount: 25 }, { label: '50g', amount: 50 }],
  },
  {
    id: 'peanuts',
    name: 'Peanuts',
    category: 'nuts_seeds',
    calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, unit: 'g',
    servings: [{ label: '1 tbsp (15g)', amount: 15 }, { label: '25g', amount: 25 }],
  },
  {
    id: 'cashews',
    name: 'Cashews',
    category: 'nuts_seeds',
    calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, unit: 'g',
    servings: [{ label: '10 cashews (14g)', amount: 14 }, { label: '25g', amount: 25 }],
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter',
    category: 'nuts_seeds',
    calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, unit: 'g',
    servings: [{ label: '1 tbsp (16g)', amount: 16 }, { label: '2 tbsp (32g)', amount: 32 }],
  },

  // ── Beverages ───────────────────────────────────────────────────────────
  {
    id: 'coconut-water',
    name: 'Coconut Water',
    category: 'beverages',
    calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, unit: 'ml',
    servings: [{ label: '1 glass (250ml)', amount: 250 }, { label: '1 tender coconut (400ml)', amount: 400 }],
  },
  {
    id: 'orange-juice',
    name: 'Orange Juice',
    category: 'beverages',
    calories: 45, protein: 0.7, carbs: 10, fat: 0.2, unit: 'ml',
    servings: [{ label: '1 glass (250ml)', amount: 250 }, { label: '½ glass (125ml)', amount: 125 }],
  },
  {
    id: 'chai-milk',
    name: 'Chai (with milk & sugar)',
    category: 'beverages',
    calories: 50, protein: 1.5, carbs: 7, fat: 1.5, unit: 'ml',
    servings: [{ label: '1 cup (150ml)', amount: 150 }, { label: '2 cups (300ml)', amount: 300 }],
  },

  // ── Snacks ──────────────────────────────────────────────────────────────
  {
    id: 'banana-chips',
    name: 'Banana Chips',
    category: 'snacks',
    calories: 519, protein: 2.3, carbs: 58, fat: 34, unit: 'g',
    servings: [{ label: '1 small pack (30g)', amount: 30 }, { label: '50g', amount: 50 }],
  },
  {
    id: 'biscuit-marie',
    name: 'Marie Biscuit',
    category: 'snacks',
    calories: 446, protein: 8, carbs: 75, fat: 12, unit: 'g',
    servings: [{ label: '2 biscuits (14g)', amount: 14 }, { label: '5 biscuits (35g)', amount: 35 }],
  },
]

export const FOOD_CATEGORIES: { id: FoodCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'grains', label: 'Grains', emoji: '🌾' },
  { id: 'protein', label: 'Protein', emoji: '🥩' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'nuts_seeds', label: 'Nuts', emoji: '🥜' },
  { id: 'beverages', label: 'Drinks', emoji: '🥤' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪' },
]

/** Calculate macros for a given food at a specified quantity */
export function calcMacros(food: FoodItem, quantity: number) {
  const factor = quantity / 100
  return {
    calories: Math.round(food.calories * factor),
    protein: parseFloat((food.protein * factor).toFixed(1)),
    carbs: parseFloat((food.carbs * factor).toFixed(1)),
    fat: parseFloat((food.fat * factor).toFixed(1)),
  }
}
