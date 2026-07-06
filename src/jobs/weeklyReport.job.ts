import { reportService } from '@/services/report.service';
export const runWeeklyReportJob = (): Promise<void> => reportService.runForAllUsers();