import { prismaClient } from "fixitpdf-shared-server";
import { v4 as uuidv4 } from 'uuid';

/**
 * Adjust the credit balance of a user and record the transaction.
 * 
 * @param userId - The ID of the user whose balance should be adjusted.
 * @param amount - The amount to adjust the balance by (positive or negative).
 * @param reason - A description of the transaction.
 * @throws Error if the balance would go below zero.
 */
export const adjustUserCreditBalance = async (
  userId: string,
  amount: number,
  reason?: string,
  idempotencyKey: string = uuidv4(), 
): Promise<void> => {
  await prismaClient.$transaction(async (tx) => {
    const existingTransaction = await tx.accountBalanceTransaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      console.log(`Skipping duplicate transaction with idempotency key ${idempotencyKey}`);
      return;
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.creditBalance + amount;
    if (newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });

    await tx.accountBalanceTransaction.create({
      data: {
        userId,
        amount,
        reason,
        idempotencyKey,
      },
    });
  });
}
