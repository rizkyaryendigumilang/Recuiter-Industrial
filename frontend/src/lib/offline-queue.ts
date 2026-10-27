/**
 * Resilient Offline Assessment Submission Queue
 * Memastikan hasil asesmen kandidat di area blank-spot pabrik tersimpan di perangkat
 * dan otomatis disinkronisasi ke server PocketBase saat koneksi internet pulih.
 */

import { pb } from '@/lib/pocketbase';
import { useEffect, useState } from 'react';

export interface PendingTestSubmission {
  id: string;
  applicationId?: string;
  jobId: string;
  timestamp: string;
  testScore: number;
  psychometricDetails?: any;
  penalty?: boolean;
  answers?: Array<{ question_id: string; selected_option: string }>;
  candidateName?: string;
  candidateEmail?: string;
  attempts: number;
}

const STORAGE_KEY = 'pending_offline_assessments';

export function getPendingAssessments(): PendingTestSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineAssessment(submission: Omit<PendingTestSubmission, 'id' | 'timestamp' | 'attempts'>): PendingTestSubmission {
  const current = getPendingAssessments();
  const newEntry: PendingTestSubmission = {
    ...submission,
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    attempts: 0,
  };
  current.push(newEntry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return newEntry;
}

export function removePendingAssessment(id: string) {
  if (typeof window === 'undefined') return;
  const current = getPendingAssessments();
  const filtered = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Flush and sync all pending assessments to PocketBase
 */
export async function flushOfflineAssessments(): Promise<{ syncedCount: number; remainingCount: number }> {
  const queue = getPendingAssessments();
  if (queue.length === 0) return { syncedCount: 0, remainingCount: 0 };

  let synced = 0;
  for (const item of queue) {
    try {
      let isSuccess = false;

      // 1. Coba sync via API endpoint /api/submit-test
      try {
        const response = await fetch(`${pb.baseUrl}/api/submit-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pb.authStore.token ? { Authorization: pb.authStore.token } : {}),
          },
          body: JSON.stringify({
            application_id: item.applicationId,
            job_id: item.jobId,
            penalty: item.penalty || false,
            answers: item.answers || [],
            psychometric_details: item.psychometricDetails,
            candidate_name: item.candidateName,
            candidate_email: item.candidateEmail,
          }),
        });
        if (response.ok) {
          isSuccess = true;
        }
      } catch (e) {
        // Fallback jika API belum hidup, coba update langsung ke job_applications
      }

      // 2. Direct PocketBase update jika applicationId valid
      if (!isSuccess && item.applicationId) {
        try {
          await pb.collection('job_applications').update(item.applicationId, {
            test_score: item.testScore,
            status: item.testScore >= 70 ? 'interview' : 'testing',
            ...(item.psychometricDetails ? { psychometric_details: item.psychometricDetails } : {}),
          });
          isSuccess = true;
        } catch (err) {
          console.warn('[OfflineQueue] Direct PB update retry failed:', err);
        }
      }

      if (isSuccess) {
        removePendingAssessment(item.id);
        synced++;
      } else {
        // Tingkatkan hitungan percobaan
        item.attempts += 1;
        if (typeof window !== 'undefined') {
          const updated = getPendingAssessments().map((q) => (q.id === item.id ? item : q));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('[OfflineQueue] Error syncing item:', item.id, err);
    }
  }

  const remaining = getPendingAssessments().length;
  return { syncedCount: synced, remainingCount: remaining };
}

// Global auto listener jika di browser
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineQueue] Connection restored! Flushing pending test submissions...');
    flushOfflineAssessments();
  });
}

/**
 * React Hook untuk memantau status antrean offline di UI
 */
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshCount = () => {
    setPendingCount(getPendingAssessments().length);
  };

  useEffect(() => {
    refreshCount();
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      flushOfflineAssessments().finally(() => {
        setIsSyncing(false);
        refreshCount();
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const manualFlush = async () => {
    setIsSyncing(true);
    const result = await flushOfflineAssessments();
    setIsSyncing(false);
    refreshCount();
    return result;
  };

  return { isOnline, pendingCount, isSyncing, manualFlush };
}
