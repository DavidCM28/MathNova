import { Student, SyncLog } from '../models';

export interface SyncItem {
  id: string;
  type: 'LESSON_COMPLETED' | 'QUIZ_SCORE' | 'STREAK_UPDATE';
  data: any;
  timestamp: string;
}

export const syncService = {
  /**
   * Process a list of offline changes and synchronize them to the current database
   */
  async processSyncQueue(queue: SyncItem[], studentName: string): Promise<number> {
    let syncedCount = 0;

    // Find or create the student record
    let student = await Student.findOne({ where: { name: studentName } });
    if (!student) {
      student = await Student.create({
        name: studentName,
        grade: '8º',
        score: 0,
        streak: 0
      });
    }

    for (const item of queue) {
      try {
        console.log(`⏳ Processing offline transaction [${item.type}] id: ${item.id}`);

        // Perform logic based on action type
        if (item.type === 'LESSON_COMPLETED') {
          // Increment score
          const xp = item.data.xpGained || 50;
          student.score += xp;
          student.streak += 1;
        } else if (item.type === 'QUIZ_SCORE') {
          const xp = item.data.xpGained || 10;
          student.score += xp;
        }

        // Log the sync event
        await SyncLog.create({
          id: item.id || undefined, // use client id if UUID format, else UUIDV4 auto-generates
          type: item.type,
          payload: JSON.stringify(item.data),
          synced: true,
          timestamp: new Date(item.timestamp)
        });

        syncedCount++;
      } catch (error) {
        console.error(`❌ Error syncing item ${item.id}:`, error);
        
        // Log sync failure
        await SyncLog.create({
          type: item.type,
          payload: JSON.stringify({ error: String(error), data: item.data }),
          synced: false,
          timestamp: new Date(item.timestamp)
        });
      }
    }

    // Save final student stats
    await student.save();
    console.log(`✅ Sincronizados ${syncedCount} elementos para el estudiante ${studentName}. Total XP: ${student.score}`);
    
    return syncedCount;
  }
};

export default syncService;
