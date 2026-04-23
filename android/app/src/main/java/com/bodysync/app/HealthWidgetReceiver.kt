package com.bodysync.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class HealthWidgetReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context?, intent: Intent?) {
    if (intent?.action == "com.bodysync.app.LOG_WATER") {
      // Open MainActivity with flag to log water
      val mainIntent = Intent(context, MainActivity::class.java)
      mainIntent.action = "com.bodysync.app.LOG_WATER"
      mainIntent.putExtra("amount", 250)
      mainIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
      context?.startActivity(mainIntent)
    }
  }
}
