package com.bodysync.app

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_stats")
data class DailyStats(
    @PrimaryKey val date: String,
    val waterMl: Int = 0,
    val waterGoalMl: Int = 3000,
    val caloriesKcal: Int = 0,
    val calorieGoal: Int = 2000,
    val mealCount: Int = 0,
    val workoutExists: Boolean = false,
    val workoutCompleted: Boolean = false,
    val stepsToday: Int = 0,
    val stepGoal: Int = 10000,
    val pendingWaterMl: Int = 0,
)
