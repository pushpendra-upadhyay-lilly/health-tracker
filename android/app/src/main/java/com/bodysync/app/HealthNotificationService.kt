package com.bodysync.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class HealthNotificationService : Service() {

    companion object {
        const val CHANNEL_ID = "health_stats"
        const val NOTIFICATION_ID = 9001
        const val EXTRA_CALORIES = "calories"
        const val EXTRA_CALORIE_GOAL = "calorieGoal"
        const val EXTRA_WATER_ML = "waterMl"
        const val EXTRA_WATER_GOAL = "waterGoal"
        const val EXTRA_STEPS = "steps"
        const val EXTRA_STEP_GOAL = "stepGoal"
        private const val PREFS = "com.bodysync.app.health"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val calories    = intent?.getIntExtra(EXTRA_CALORIES, 0) ?: 0
        val calorieGoal = intent?.getIntExtra(EXTRA_CALORIE_GOAL, 2000) ?: 2000
        val waterMl     = intent?.getIntExtra(EXTRA_WATER_ML, 0) ?: 0
        val waterGoal   = intent?.getIntExtra(EXTRA_WATER_GOAL, 3000) ?: 3000
        val steps       = intent?.getIntExtra(EXTRA_STEPS, 0) ?: 0
        val stepGoal    = intent?.getIntExtra(EXTRA_STEP_GOAL, 10000) ?: 10000

        // Persist so AddWaterReceiver can read the latest values
        getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putInt("last_calories", calories)
            .putInt("last_calorie_goal", calorieGoal)
            .putInt("last_water_ml", waterMl)
            .putInt("last_water_goal", waterGoal)
            .putInt("last_steps", steps)
            .putInt("last_step_goal", stepGoal)
            .apply()

        val notification = buildNotification(calories, calorieGoal, waterMl, waterGoal, steps, stepGoal)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Health Stats",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Live health stats notification"
            setShowBadge(false)
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun buildNotification(
        calories: Int, calorieGoal: Int,
        waterMl: Int, waterGoal: Int,
        steps: Int, stepGoal: Int
    ): Notification {
        val views = RemoteViews(packageName, R.layout.notification_health_stats)
        views.setTextViewText(R.id.tv_calories, "$calories / $calorieGoal")
        views.setTextViewText(R.id.tv_water, formatWater(waterMl) + " / " + formatWater(waterGoal))
        views.setTextViewText(R.id.tv_steps, "$steps / $stepGoal")

        val openIntent = packageManager.getLaunchIntentForPackage(packageName)
        val contentPI = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val addWaterPI = PendingIntent.getBroadcast(
            this, 1, Intent(this, AddWaterReceiver::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val logMealIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            putExtra("action", "log_meal")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val logMealPI = PendingIntent.getActivity(
            this, 2, logMealIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notif_health)
            .setCustomContentView(views)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setContentIntent(contentPI)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .addAction(R.drawable.ic_water, "Add Water", addWaterPI)
            .addAction(R.drawable.ic_meals, "Log Meal", logMealPI)
            .build()
    }

    private fun formatWater(ml: Int): String =
        if (ml >= 1000) String.format("%.1fL", ml / 1000.0) else "${ml}ml"
}
