package com.bodysync.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HealthWidgetReceiver : GlanceAppWidgetReceiver() {
  override val glanceAppWidget = HealthWidget()

  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == "com.bodysync.app.LOG_WATER") {
      val amount = intent.getIntExtra("amount", 250)
      val result = goAsync()
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val dao = HealthDatabase.getInstance(context).dailyStatsDao()
          val today = HealthDatabase.todayString()
          val existing = dao.getByDate(today) ?: DailyStats(date = today)
          dao.upsert(existing.copy(
            waterMl = existing.waterMl + amount,
            pendingWaterMl = existing.pendingWaterMl + amount,
          ))
          HealthWidget().updateAll(context)
        } finally {
          result.finish()
        }
      }
    } else {
      super.onReceive(context, intent)
    }
  }

  companion object {
    fun requestUpdate(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val ids = manager.getAppWidgetIds(
        ComponentName(context, HealthWidgetReceiver::class.java)
      )
      if (ids.isNotEmpty()) {
        CoroutineScope(Dispatchers.Main).launch {
          HealthWidget().updateAll(context)
        }
      }
    }
  }
}
