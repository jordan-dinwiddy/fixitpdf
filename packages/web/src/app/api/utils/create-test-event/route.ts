import { BaseResponse } from '@/types/responses';
import { NextResponse } from 'next/server';
import { defaultQueue } from '../../../../lib/queues';
import { prismaClient, Prisma } from 'fixitpdf-shared';

interface CreateEventData {
  message: string;
  eventId: string;
}

type CreateEventResponse = BaseResponse<CreateEventData>;

type TestEvent = Prisma.TestEventGetPayload<true>;

/**
 * Create a new test event record.
 * 
 * @param name 
 * @returns 
 */
const createTestEvent = async (name: string): Promise<TestEvent> => {
  const newEvent = await prismaClient.testEvent.create({
    data: {
      name,
    }
  });

  return newEvent;
};


/**
 * A test API to create a test event.
 * 
 * @returns 
 */
export async function POST(): Promise<NextResponse<CreateEventResponse>> {
  try {
    const newEvent = await createTestEvent(`Test Event ${new Date().toISOString()}`);

    await defaultQueue.add('testEventJob', {
      testeEventId: newEvent.id,
    });

    return NextResponse.json(
      { success: true, data: { message: 'Event created successfully!', eventId: newEvent.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}

