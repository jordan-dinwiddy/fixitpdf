
import { prismaClient } from 'fixitpdf-shared-server';
import { resend } from '../lib/resend';

/**
 * Process the email job.
 * @param data 
 */
export async function sendWelcomeEmailJob(data: any): Promise<void> {
  const { userId } = data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const startTime = Date.now();

  try {
    console.log(`Sending welcomeEmail to user ${userId}...`);

    // Load user from prisma
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found: ' + userId);
    }

    // Extract firstName form the user.name string
    const firstName = user.name?.split(' ')[0] || '';
    const email = user.email || '';

    // Load user to extract email, name
    // Render correct email template
    // Subject? 

    const { data, error } = await resend.emails.send({
      from: 'FixItPDF <support@fixitpdf.com>',
      to: [email],
      subject: 'Welcome to FixItPDF!',
      html: `<strong>Thanks for signing up, ${firstName}!</strong>`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });


    console.log(`Finished sending email. Completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('Error processing send email job', error);

    // rethrow for now
    throw error;
  }
}
