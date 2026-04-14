import { useMemo, useState } from 'react'
import { ChevronRight, Plus, Search } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { FOOD_CATEGORIES, FOOD_DATABASE, calcMacros, type FoodCategory, type FoodItem } from '../../data/foodDatabase'
import { db } from '../../db'
import type { CustomFood, MealLog, MealType } from '../../db/types'
import { getTodayString } from '../../utils/dateHelpers'

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '🌅 Breakfast' },
  { value: 'lunch', label: '☀️ Lunch' },
  { value: 'dinner', label: '🌙 Dinner' },
  { value: 'snack', label: '🍎 Snack' },
  { value: 'pre_workout', label: '💪 Pre-Workout' },
  { value: 'post_workout', label: '🔥 Post-Workout' },
]

export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎', pre_workout: '💪', post_workout: '🔥',
}

type LogMode = 'food' | 'manual'

interface MealFormState {
  name: string
  calories: string
  protein: string
  carbs: string
  fat: string
  mealType: MealType
}

const EMPTY_FORM: MealFormState = {
  name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'snack',
}

export default function LogMealModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const customFoods = useLiveQuery(() => db.customFoods.orderBy('createdAt').reverse().toArray(), []) ?? []

  const [logMode, setLogMode] = useState<LogMode>('food')
  const [mealType, setMealType] = useState<MealType>('snack')
  const [foodSearch, setFoodSearch] = useState('')
  const [foodCategory, setFoodCategory] = useState<FoodCategory | 'all'>('all')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('')
  const [customServing, setCustomServing] = useState(false)
  const [manualForm, setManualForm] = useState<MealFormState>(EMPTY_FORM)

  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter((f) => {
      const matchCat = foodCategory === 'all' || f.category === foodCategory
      const matchSearch = !foodSearch || f.name.toLowerCase().includes(foodSearch.toLowerCase())
      return matchCat && matchSearch
    })
  }, [foodSearch, foodCategory])

  const filteredCustomFoods = useMemo(() => {
    if (!foodSearch) return customFoods
    return customFoods.filter((f) => f.name.toLowerCase().includes(foodSearch.toLowerCase()))
  }, [customFoods, foodSearch])

  const preview = useMemo(() => {
    if (!selectedFood || !quantity) return null
    const q = parseFloat(quantity)
    if (!q || q <= 0) return null
    return calcMacros(selectedFood, q)
  }, [selectedFood, quantity])

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food)
    setQuantity(String(food.servings[0].amount))
    setCustomServing(false)
  }

  const handleAddFoodMeal = async () => {
    if (!selectedFood || !preview) return
    const meal: MealLog = {
      id: uuid(),
      date: getTodayString(),
      mealType,
      name: `${selectedFood.name} (${quantity}${selectedFood.unit})`,
      calories: preview.calories,
      protein: preview.protein,
      carbs: preview.carbs,
      fat: preview.fat,
      createdAt: new Date().toISOString(),
    }
    await db.mealLogs.put(meal)
    resetModal()
  }

  const handleAddCustomFoodMeal = async (food: CustomFood) => {
    const meal: MealLog = {
      id: uuid(),
      date: getTodayString(),
      mealType,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      createdAt: new Date().toISOString(),
    }
    await db.mealLogs.put(meal)
    resetModal()
  }

  const handleAddManualMeal = async () => {
    const name = manualForm.name.trim() || 'Meal'
    const calories = parseInt(manualForm.calories) || 0
    const protein = parseFloat(manualForm.protein) || 0
    const carbs = parseFloat(manualForm.carbs) || 0
    const fat = parseFloat(manualForm.fat) || 0
    const now = new Date().toISOString()

    await db.mealLogs.put({
      id: uuid(),
      date: getTodayString(),
      mealType: manualForm.mealType,
      name, calories, protein, carbs, fat,
      createdAt: now,
    })

    const existing = await db.customFoods.where('name').equals(name).first()
    if (!existing) {
      await db.customFoods.put({ id: uuid(), name, calories, protein, carbs, fat, createdAt: now })
    }

    resetModal()
  }

  const resetModal = () => {
    setSelectedFood(null)
    setQuantity('')
    setFoodSearch('')
    setFoodCategory('all')
    setManualForm(EMPTY_FORM)
    setLogMode('food')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={resetModal} title="Log Food" fullHeight>
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex bg-[#0D0D0D] rounded-xl p-1">
          {(['food', 'manual'] as LogMode[]).map((mode) => (
            <button
              key={mode}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                logMode === mode ? 'bg-[#1A1A1A] text-white shadow' : 'text-[#555555]'
              }`}
              onClick={() => setLogMode(mode)}
            >
              {mode === 'food' ? '🍽️ Food Database' : '✏️ Manual Entry'}
            </button>
          ))}
        </div>

        {/* Meal type (shared) */}
        <Select
          label="Meal Type"
          options={MEAL_TYPES}
          value={logMode === 'food' ? mealType : manualForm.mealType}
          onChange={(e) => {
            const v = e.target.value as MealType
            if (logMode === 'food') setMealType(v)
            else setManualForm((f) => ({ ...f, mealType: v }))
          }}
        />

        {/* ── Food database mode ── */}
        {logMode === 'food' && (
          <>
            {!selectedFood ? (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
                  <input
                    type="text"
                    placeholder="Search rice, paneer, chicken…"
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#444444] outline-none focus:border-[#00FF87]"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {FOOD_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-all font-medium ${
                        foodCategory === cat.id
                          ? 'bg-[#00FF87] text-[#0D0D0D]'
                          : 'bg-[#2A2A2A] text-[#A0A0A0]'
                      }`}
                      onClick={() => setFoodCategory(cat.id)}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {filteredCustomFoods.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-[#00FF87] uppercase tracking-wider pt-1 pb-0.5">My Foods</p>
                      {filteredCustomFoods.map((food) => (
                        <button
                          key={food.id}
                          className="w-full flex items-center justify-between p-3 bg-[#0D0D0D] hover:bg-[#111111] rounded-xl transition-all text-left"
                          onClick={() => handleAddCustomFoodMeal(food)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{food.name}</p>
                            <p className="text-xs text-[#555555]">
                              {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
                            </p>
                          </div>
                          <Plus size={14} className="text-[#00FF87] flex-shrink-0 ml-2" />
                        </button>
                      ))}
                      {filteredFoods.length > 0 && (
                        <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider pt-2 pb-0.5">Food Database</p>
                      )}
                    </>
                  )}
                  {filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      className="w-full flex items-center justify-between p-3 bg-[#0D0D0D] hover:bg-[#111111] rounded-xl transition-all text-left"
                      onClick={() => handleSelectFood(food)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{food.name}</p>
                        <p className="text-xs text-[#555555]">
                          per 100{food.unit} · {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-[#555555] flex-shrink-0 ml-2" />
                    </button>
                  ))}
                  {filteredFoods.length === 0 && filteredCustomFoods.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[#555555] text-sm">No food found</p>
                      <button className="text-xs text-[#00FF87] mt-2" onClick={() => setLogMode('manual')}>
                        Enter manually instead →
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    className="text-xs text-[#666666] hover:text-white transition-colors"
                    onClick={() => setSelectedFood(null)}
                  >
                    ← Back
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{selectedFood.name}</p>
                    <p className="text-xs text-[#555555]">{selectedFood.calories} kcal per 100{selectedFood.unit}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#555555] uppercase tracking-wider mb-2">Quick Serving</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.servings.map((s) => (
                      <button
                        key={s.label}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                          !customServing && quantity === String(s.amount)
                            ? 'bg-[#00FF87] text-[#0D0D0D]'
                            : 'bg-[#2A2A2A] text-[#A0A0A0]'
                        }`}
                        onClick={() => { setQuantity(String(s.amount)); setCustomServing(false) }}
                      >
                        {s.label}
                      </button>
                    ))}
                    <button
                      className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                        customServing ? 'bg-[#00FF87] text-[#0D0D0D]' : 'bg-[#2A2A2A] text-[#A0A0A0]'
                      }`}
                      onClick={() => { setCustomServing(true); setQuantity('') }}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {customServing && (
                  <Input
                    label={`Quantity (${selectedFood.unit})`}
                    type="number"
                    placeholder="Enter amount"
                    suffix={selectedFood.unit}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    autoFocus
                  />
                )}

                {preview && (
                  <div className="bg-[#0D0D0D] rounded-xl p-4">
                    <p className="text-xs text-[#555555] uppercase tracking-wider mb-3">Nutritional Info</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-black text-white">{preview.calories}</p>
                        <p className="text-[10px] text-[#555555]">kcal</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#00FF87]">{preview.protein}g</p>
                        <p className="text-[10px] text-[#555555]">protein</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#FF6B35]">{preview.carbs}g</p>
                        <p className="text-[10px] text-[#555555]">carbs</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#FF4757]">{preview.fat}g</p>
                        <p className="text-[10px] text-[#555555]">fat</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button fullWidth size="lg" onClick={handleAddFoodMeal} disabled={!preview}>
                  Add to Log
                </Button>
              </div>
            )}
          </>
        )}

        {/* ── Manual entry mode ── */}
        {logMode === 'manual' && (
          <div className="space-y-4">
            <Input
              label="Food / Meal Name"
              placeholder="e.g. Home-cooked dal, Protein shake"
              value={manualForm.name}
              onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
            <Input
              label="Calories"
              type="number"
              suffix="kcal"
              placeholder="0"
              value={manualForm.calories}
              onChange={(e) => setManualForm((f) => ({ ...f, calories: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Protein"
                type="number"
                suffix="g"
                placeholder="0"
                value={manualForm.protein}
                onChange={(e) => setManualForm((f) => ({ ...f, protein: e.target.value }))}
              />
              <Input
                label="Carbs"
                type="number"
                suffix="g"
                placeholder="0"
                value={manualForm.carbs}
                onChange={(e) => setManualForm((f) => ({ ...f, carbs: e.target.value }))}
              />
              <Input
                label="Fat"
                type="number"
                suffix="g"
                placeholder="0"
                value={manualForm.fat}
                onChange={(e) => setManualForm((f) => ({ ...f, fat: e.target.value }))}
              />
            </div>
            <Button fullWidth size="lg" onClick={handleAddManualMeal} disabled={!manualForm.calories}>
              Add Meal
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
