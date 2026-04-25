package com.bodysync.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import androidx.glance.appwidget.updateAll
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@CapacitorPlugin(
  name = "HealthSync",
  permissions = [
    Permission(
      strings = ["android.permission.ACTIVITY_RECOGNITION"],
      alias = "activityRecognition"
    )
  ]
)
class HealthSyncPlugin : Plugin() {

  private fun dao() = HealthDatabase.getInstance(context).dailyStatsDao()
  private fun today() = HealthDatabase.todayString()

  private fun refreshWidget() {
    CoroutineScope(Dispatchers.Main).launch {
      HealthWidget().updateAll(context)
    }
  }

  private suspend fun getOrCreateToday(): DailyStats =
    dao().getByDate(today()) ?: DailyStats(date = today())

  @PluginMethod
  override fun checkPermissions(call: PluginCall) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      val result = JSObject()
      result.put("activityRecognition", "granted")
      call.resolve(result)
      return
    }
    super.checkPermissions(call)
  }

  @PluginMethod
  override fun requestPermissions(call: PluginCall) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      val result = JSObject()
      result.put("activityRecognition", "granted")
      call.resolve(result)
      return
    }
    super.requestPermissions(call)
  }

  @PluginMethod
  fun syncWaterData(call: PluginCall) {
    val waterMl = call.data.optInt("waterMl", 0)
    val goal = call.data.optInt("goal", 3000)
    CoroutineScope(Dispatchers.IO).launch {
      try {
        dao().upsert(getOrCreateToday().copy(waterMl = waterMl, waterGoalMl = goal))
        refreshWidget()
        call.resolve()
      } catch (e: Exception) {
        call.reject("Failed to sync water data: ${e.message}", e)
      }
    }
  }

  @PluginMethod
  fun syncMealData(call: PluginCall) {
    val mealCount = call.data.optInt("mealCount", 0)
    val calories = call.data.optInt("calories", 0)
    val goal = call.data.optInt("goal", 2000)
    CoroutineScope(Dispatchers.IO).launch {
      try {
        dao().upsert(getOrCreateToday().copy(
          mealCount = mealCount,
          caloriesKcal = calories,
          calorieGoal = goal,
        ))
        refreshWidget()
        call.resolve()
      } catch (e: Exception) {
        call.reject("Failed to sync meal data: ${e.message}", e)
      }
    }
  }

  @PluginMethod
  fun syncWorkoutData(call: PluginCall) {
    val exists = call.data.optBoolean("exists", false)
    val completed = call.data.optBoolean("completed", false)
    CoroutineScope(Dispatchers.IO).launch {
      try {
        dao().upsert(getOrCreateToday().copy(
          workoutExists = exists,
          workoutCompleted = completed,
        ))
        refreshWidget()
        call.resolve()
      } catch (e: Exception) {
        call.reject("Failed to sync workout data: ${e.message}", e)
      }
    }
  }

  @PluginMethod
  fun syncStepData(call: PluginCall) {
    val steps = call.data.optInt("steps", 0)
    val goal = call.data.optInt("goal", 10000)
    CoroutineScope(Dispatchers.IO).launch {
      try {
        dao().upsert(getOrCreateToday().copy(stepsToday = steps, stepGoal = goal))
        refreshWidget()
        call.resolve()
      } catch (e: Exception) {
        call.reject("Failed to sync step data: ${e.message}", e)
      }
    }
  }

  @PluginMethod
  fun getPendingWidgetWater(call: PluginCall) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        val existing = getOrCreateToday()
        val pending = existing.pendingWaterMl
        if (pending > 0) {
          dao().upsert(existing.copy(pendingWaterMl = 0))
        }
        val result = JSObject()
        result.put("amount", pending as Int)
        call.resolve(result)
      } catch (e: Exception) {
        call.reject("Failed to get pending widget water: ${e.message}", e)
      }
    }
  }

  @PluginMethod
  fun getWidgetAction(call: PluginCall) {
    try {
      val prefs = context.getSharedPreferences("com.bodysync.app.health", Context.MODE_PRIVATE)
      val action = prefs.getString("bodysync_widget_action", "") ?: ""
      prefs.edit().remove("bodysync_widget_action").apply()
      val result = JSObject()
      result.put("action", action)
      call.resolve(result)
    } catch (e: Exception) {
      call.reject("Failed to get widget action: ${e.message}", e)
    }
  }

  @PluginMethod
  fun getStepsFromSensor(call: PluginCall) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      if (getPermissionState("activityRecognition") != PermissionState.GRANTED) {
        call.reject("PERMISSION_DENIED", "Activity recognition permission is required")
        return
      }
    }

    val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

    if (stepSensor == null) {
      call.reject("Step counter sensor not available on this device")
      return
    }

    val latch = CountDownLatch(1)
    var totalSteps = 0

    val listener = object : SensorEventListener {
      override fun onSensorChanged(event: SensorEvent) {
        totalSteps = event.values[0].toInt()
        latch.countDown()
        sensorManager.unregisterListener(this)
      }
      override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
    }

    sensorManager.registerListener(listener, stepSensor, SensorManager.SENSOR_DELAY_NORMAL)

    val received = latch.await(3, TimeUnit.SECONDS)
    if (!received) {
      sensorManager.unregisterListener(listener)
      call.reject("Timed out waiting for step sensor reading")
      return
    }

    val prefs = context.getSharedPreferences("com.bodysync.app.health", Context.MODE_PRIVATE)
    val storedDate = prefs.getString("bodysync_sensor_date", "")
    val todayStr = today()
    val baseline = if (storedDate == todayStr) {
      prefs.getInt("bodysync_sensor_baseline", totalSteps)
    } else {
      prefs.edit()
        .putString("bodysync_sensor_date", todayStr)
        .putInt("bodysync_sensor_baseline", totalSteps)
        .apply()
      totalSteps
    }

    val todaySteps = if (totalSteps >= baseline) totalSteps - baseline else totalSteps
    val result = JSObject()
    result.put("steps", todaySteps)
    call.resolve(result)
  }

  @PluginMethod
  fun pinWidget(call: PluginCall) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      call.reject("Widget pinning requires Android 8.0 or above")
      return
    }
    val appWidgetManager = AppWidgetManager.getInstance(context)
    if (!appWidgetManager.isRequestPinAppWidgetSupported) {
      call.reject("Your launcher does not support pinning widgets directly. Long-press your home screen and look for Widgets.")
      return
    }
    val provider = ComponentName(context, HealthWidgetReceiver::class.java)
    appWidgetManager.requestPinAppWidget(provider, null, null)
    call.resolve()
  }
}
