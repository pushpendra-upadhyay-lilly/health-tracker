package com.bodysync.app

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert

@Dao
interface DailyStatsDao {
    @Query("SELECT * FROM daily_stats WHERE date = :date")
    suspend fun getByDate(date: String): DailyStats?

    @Upsert
    suspend fun upsert(stats: DailyStats)
}
