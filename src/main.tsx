import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { db } from './db'
import { seedExerciseLibrary, seedSamplePlans } from './db/seed'
import { isNative } from './utils/platform'
import { registerNativeNotificationActions, initNativeNotificationListeners } from './plugins/notificationActions'

// Seed exercise library on first run, then seed sample plans
db.exercises.count().then(async (count) => {
  if (count === 0) {
    await seedExerciseLibrary()
    await seedSamplePlans()
  } else {
    // Seed plans if they haven't been added yet
    const planCount = await db.plans.count()
    if (planCount === 0) await seedSamplePlans()
  }
})

// Init native notification infrastructure
if (isNative) {
  registerNativeNotificationActions()
  initNativeNotificationListeners()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
