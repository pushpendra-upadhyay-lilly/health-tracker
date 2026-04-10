import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { db } from './db'
import { seedExerciseLibrary } from './db/seed'

// Seed exercise library on first run
db.exercises.count().then((count) => {
  if (count === 0) seedExerciseLibrary()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
