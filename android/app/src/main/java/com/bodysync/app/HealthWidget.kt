package com.bodysync.app

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

class HealthWidget : GlanceAppWidget() {
  override suspend fun provideGlance(context: Context, id: GlanceId) {
    provideContent {
      WidgetContent()
    }
  }

  @Composable
  private fun WidgetContent() {
    Column(
      modifier = GlanceModifier
        .fillMaxSize()
        .background(Color.White)
        .padding(16.dp)
    ) {
      Text(
        "Body Sync",
        style = TextStyle(fontSize = 14.sp, color = ColorProvider(Color.Black))
      )
    }
  }
}
