package com.bodysync.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.bodysync.app.HealthSyncPlugin;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public class MainActivity extends BridgeActivity {
  private static final String STEP_WORK_TAG = "bodysync_step_update";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    registerPlugin(HealthSyncPlugin.class);
    super.onCreate(savedInstanceState);

    scheduleStepUpdates();

    // Handle widget intents
    Intent intent = getIntent();
    if (intent != null && "com.bodysync.app.LOG_WATER".equals(intent.getAction())) {
      int amount = intent.getIntExtra("amount", 250);
      intent.putExtra("logWaterAmount", amount);
    }
  }

  private void scheduleStepUpdates() {
    PeriodicWorkRequest stepWork = new PeriodicWorkRequest.Builder(
        StepUpdateWorker.class, 15, TimeUnit.MINUTES
    ).build();
    WorkManager.getInstance(getApplicationContext()).enqueueUniquePeriodicWork(
        STEP_WORK_TAG,
        ExistingPeriodicWorkPolicy.KEEP,
        stepWork
    );
  }
}
