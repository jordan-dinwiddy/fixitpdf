import { BaseResponse } from '@/types/responses';
import { NextResponse } from 'next/server';
import { defaultQueue } from '../../../../lib/queues';

interface CreateEventData {
  message: string;
}

type CreateEventResponse = BaseResponse<CreateEventData>;

/**
 * A test API to create a test event.
 * 
 * @returns 
 */
export async function POST(): Promise<NextResponse<CreateEventResponse>> {
  try {
    await defaultQueue.add('testEventJob', {
      message: `Test event created at ${new Date().toISOString()}!`,
    });

    return NextResponse.json(
      { success: true, data: { message: 'Event created successfully!'} },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}

