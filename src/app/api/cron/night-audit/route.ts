import { NextResponse } from 'next/server';
import { runNightAuditActionForCron } from '@/app/dashboard/admin/night-audit/actions';

export const runtime = 'edge'; 

export async function POST(request: Request) {
  // 1. Security: Check for the secret key from the request header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log(`[CRON] Starting automated Night Audit job.`);
    // We will now use a dedicated cron action
    const result = await runNightAuditActionForCron();

    if (result.error) {
      console.error(`[CRON] Night Audit failed: ${result.error}`);
      return NextResponse.json({ success: false, message: result.error }, { status: 500 });
    }
    
    console.log(`[CRON] Night Audit successful: ${result.success}`);
    return NextResponse.json({ success: true, message: result.success });

  } catch (error) {
    console.error('[CRON] A critical error occurred:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}