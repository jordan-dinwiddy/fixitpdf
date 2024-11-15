import { prismaClient } from "fixitpdf-shared";

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
  reason?: string
): Promise<void> => {
  await prismaClient.$transaction(async (tx) => {
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
      },
    });
  });
}