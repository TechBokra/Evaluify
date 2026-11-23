import type { ExamResult } from '../../types.ts';
import type { ItemScoreStatus } from './scoring.ts';

export type DisplayStatus = 'final' | 'needs-review' | 'unverified-demo';
export type DisplayItemStatus = ItemScoreStatus | 'unverified-demo';

/** Legacy seeded results have no evaluation audit and must never appear verified. */
export function getDisplayStatus(result: Readonly<ExamResult>): DisplayStatus {
  return result.gradingStatus ?? 'unverified-demo';
}

export function getVerifiedPercentage(result: Readonly<ExamResult>): number | null {
  if (getDisplayStatus(result) !== 'final' || result.totalPoints <= 0) return null;
  return Math.round((result.score / result.totalPoints) * 100);
}

export function getDisplayItemStatus(result: Readonly<ExamResult>, questionId: string): DisplayItemStatus {
  return result.itemScores?.find(item => item.questionId === questionId)?.status ?? 'unverified-demo';
}

export function getDisplayScore(result: Readonly<ExamResult>, lang: 'en' | 'ar' = 'en'): string {
  const state = getDisplayStatus(result);
  if (state === 'needs-review') {
    return lang === 'ar'
      ? 'قيد مراجعة المدرس — المصحح آليًا ' + result.score + '/' + result.totalPoints
      : 'Awaiting teacher review — auto-scored ' + result.score + '/' + result.totalPoints;
  }
  if (state === 'unverified-demo') {
    return lang === 'ar' ? 'نتيجة تجريبية غير موثقة' : 'Unverified demo result';
  }
  return result.score + '/' + result.totalPoints;
}

export function getDisplayPercentage(result: Readonly<ExamResult>, lang: 'en' | 'ar' = 'en'): string {
  const percentage = getVerifiedPercentage(result);
  if (percentage !== null) return percentage + '%';
  return getDisplayStatus(result) === 'needs-review'
    ? (lang === 'ar' ? 'بانتظار المراجعة' : 'Pending review')
    : (lang === 'ar' ? 'تجريبي' : 'Demo');
}
