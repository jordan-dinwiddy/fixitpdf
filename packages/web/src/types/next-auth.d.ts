// This import is required to perform type augmentation
import "next-auth";

// Extend the Session type to include userId
// Needs to be recognized as Type Declaration file by TypeScript otherwise
// you'll see issue with other imports
declare module "next-auth" {
  interface Session {
    userId: string;
  }
}