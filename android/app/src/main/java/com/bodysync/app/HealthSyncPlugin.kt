package com.bodysync.app

import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod

@CapacitorPlugin(name = "HealthSync")
class HealthSyncPlugin : Plugin() {

  private fun getSharedPrefs() =
    context.getSharedPreferences("com.bodysync.app.health", Context.MODE_PRIVATE)

  @PluginMethod
  fun syncWaterData(call: PluginCall) {
    try {
      val waterToday = call.getObject("waterToday")
      val goal = call.getInt("goal", 3000)

      val prefs = getSharedPrefs()
      val editor = prefs.edit()

      // Extract water amount from waterToday object
      val waterAmount = if (waterToday != null) {
        val entries = waterToday.getJSArray("entries")
        var totalAmount = 0
        if (entries != null) {
          for (i in 0 until entries.length()) {
            val entry = entries.getJSObject(i)
            totalAmount += entry?.getInt("amount", 0) ?: 0
          }
        }
        totalAmount
      } else {
        0
      }

      editor.putInt("bodysync_water_today", waterAmount)
      editor.putInt("bodysync_water_goal", goal)
      editor.putLong("bodysync_updated_at", System.currentTimeMillis())
      editor.apply()

      call.resolve()
    } catch (error: Exception) {
      call.reject("Failed to sync water data: ${error.message}", error)
    }
  }

  @PluginMethod
  fun syncMealData(call: PluginCall) {
    try {
      val mealCount = call.getInt("mealCount", 0)
      val calories = call.getInt("calories", 0)
      val goal = call.getInt("goal", 2000)

      val prefs = getSharedPrefs()
      val editor = prefs.edit()

      editor.putInt("bodysync_meals_today", mealCount)
      editor.putInt("bodysync_calories_today", calories)
      editor.putInt("bodysync_calorie_goal", goal)
      editor.putLong("bodysync_updated_at", System.currentTimeMillis())
      editor.apply()

      call.resolve()
    } catch (error: Exception) {
      call.reject("Failed to sync meal data: ${error.message}", error)
    }
  }

  @PluginMethod
  fun syncWorkoutData(call: PluginCall) {
    try {
      val exists = call.getBoolean("exists", false)
      val completed = call.getBoolean("completed", false)

      val prefs = getSharedPrefs()
      val editor = prefs.edit()

      editor.putBoolean("bodysync_workout_today", exists)
      editor.putBoolean("bodysync_workout_completed", completed)
      editor.putLong("bodysync_updated_at", System.currentTimeMillis())
      editor.apply()

      call.resolve()
    } catch (error: Exception) {
      call.reject("Failed to sync workout data: ${error.message}", error)
    }
  }

  @PluginMethod
  fun syncStepData(call: PluginCall) {
    try {
      val steps = call.getInt("steps", 0)
      val goal = call.getInt("goal", 10000)

      val prefs = getSharedPrefs()
      val editor = prefs.edit()

      editor.putInt("bodysync_steps_today", steps)
      editor.putInt("bodysync_step_goal", goal)
      editor.putLong("bodysync_updated_at", System.currentTimeMillis())
      editor.apply()

      call.resolve()
    } catch (error: Exception) {
      call.reject("Failed to sync step data: ${error.message}", error)
    }
  }

  @PluginMethod
  fun logWaterFromWidget(call: PluginCall) {
    try {
      val amount = call.getInt("amount", 250)

      // This will be handled by MainActivity intent receiver
      // For now, just sync the action to prefs so widget can detect it
      val prefs = getSharedPrefs()
      val editor = prefs.edit()
      editor.putInt("bodysync_widget_log_water", amount)
      editor.apply()

      call.resolve()
    } catch (error: Exception) {
      call.reject("Failed to log water from widget: ${error.message}", error)
    }
  }
}
