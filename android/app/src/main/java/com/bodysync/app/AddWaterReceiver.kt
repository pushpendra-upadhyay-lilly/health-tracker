package com.bodysync.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.metadata.Metadata as HCMetadata
import androidx.health.connect.client.units.Volume
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AddWaterReceiver : BroadcastReceiver() {

    companion object {
        private const val PREFS = "com.bodysync.app.health"
        private const val ADD_AMOUNT_ML = 250
    }

    override fun onReceive(context: Context, intent: Intent) {
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 1. Write to Health Connect
                val now = Instant.now()
                val record = HydrationRecord(
                    volume = Volume.milliliters(ADD_AMOUNT_ML.toDouble()),
                    startTime = now,
                    endTime = now.plus(1, ChronoUnit.MINUTES),
                    startZoneOffset = null,
                    endZoneOffset = null,
                    metadata = HCMetadata.manualEntry(),
                )
                HealthConnectClient.getOrCreate(context).insertRecords(listOf(record))

                // 2. Store pending amount for Dexie reconciliation on next app open
                val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                val pending = prefs.getInt("pending_water_ml", 0)
                val newWater = prefs.getInt("last_water_ml", 0) + ADD_AMOUNT_ML
                prefs.edit()
                    .putInt("pending_water_ml", pending + ADD_AMOUNT_ML)
                    .putInt("last_water_ml", newWater)
                    .apply()

                // 3. Update notification with incremented water value
                val serviceIntent = Intent(context, HealthNotificationService::class.java).apply {
                    putExtra(HealthNotificationService.EXTRA_CALORIES, prefs.getInt("last_calories", 0))
                    putExtra(HealthNotificationService.EXTRA_CALORIE_GOAL, prefs.getInt("last_calorie_goal", 2000))
                    putExtra(HealthNotificationService.EXTRA_WATER_ML, newWater)
                    putExtra(HealthNotificationService.EXTRA_WATER_GOAL, prefs.getInt("last_water_goal", 3000))
                    putExtra(HealthNotificationService.EXTRA_STEPS, prefs.getInt("last_steps", 0))
                    putExtra(HealthNotificationService.EXTRA_STEP_GOAL, prefs.getInt("last_step_goal", 10000))
                }
                context.startForegroundService(serviceIntent)
            } catch (e: Exception) {
                Log.e("AddWaterReceiver", "Failed: ${e.message}", e)
            } finally {
                pendingResult.finish()
            }
        }
    }
}
