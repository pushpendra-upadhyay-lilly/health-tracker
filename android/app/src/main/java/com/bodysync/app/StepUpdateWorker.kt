package com.bodysync.app

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

class StepUpdateWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val steps = readTodaySteps() ?: return Result.success()

        withContext(Dispatchers.IO) {
            val dao = HealthDatabase.getInstance(applicationContext).dailyStatsDao()
            val today = HealthDatabase.todayString()
            val existing = dao.getByDate(today) ?: DailyStats(date = today)
            dao.upsert(existing.copy(stepsToday = steps))
        }

        HealthWidget().updateAll(applicationContext)
        return Result.success()
    }

    private suspend fun readTodaySteps(): Int? = withContext(Dispatchers.Default) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val granted = applicationContext.checkSelfPermission("android.permission.ACTIVITY_RECOGNITION")
            if (granted != PackageManager.PERMISSION_GRANTED) return@withContext null
        }

        val sensorManager = applicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
            ?: return@withContext null

        val totalSteps = withTimeoutOrNull(5_000L) {
            suspendCancellableCoroutine<Int> { cont ->
                val listener = object : SensorEventListener {
                    override fun onSensorChanged(event: SensorEvent) {
                        sensorManager.unregisterListener(this)
                        cont.resume(event.values[0].toInt())
                    }
                    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
                }
                sensorManager.registerListener(listener, stepSensor, SensorManager.SENSOR_DELAY_NORMAL)
                cont.invokeOnCancellation { sensorManager.unregisterListener(listener) }
            }
        } ?: return@withContext null

        // Sensor baseline stays in SharedPreferences (internal to this worker)
        val prefs = applicationContext.getSharedPreferences("com.bodysync.app.health", Context.MODE_PRIVATE)
        val today = HealthDatabase.todayString()
        val storedDate = prefs.getString("bodysync_sensor_date", "")

        val baseline = if (storedDate == today) {
            prefs.getInt("bodysync_sensor_baseline", totalSteps)
        } else {
            prefs.edit()
                .putString("bodysync_sensor_date", today)
                .putInt("bodysync_sensor_baseline", totalSteps)
                .apply()
            totalSteps
        }

        if (totalSteps >= baseline) totalSteps - baseline else totalSteps
    }
}
