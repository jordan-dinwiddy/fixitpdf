import { PurchaseOption } from "./types";

export const DEV_PURCHASE_OPTIONS: PurchaseOption[] = [
  { id: '1', priceId: 'price_1QMNctRqb2FjfvrJPVvvz5oD', credits: 5, price: 5, tagline: "Perfect to try things out (test)" },
  { id: '2', priceId: 'price_1QMNdhRqb2FjfvrJwvlxVOhu', credits: 15, price: 10, tagline: "Save 33%" },
  { id: '3', priceId: 'price_1QMNeVRqb2FjfvrJVETcL24d', credits: 35, price: 20, tagline: "Save 43%" },
  { id: '4', priceId: 'price_1QMNf6Rqb2FjfvrJrJaOXGOy', credits: 100, price: 50, tagline: "Best value! Save 50%" },
];

export const PROD_PURCHASE_OPTIONS: PurchaseOption[] = [
  { id: '1', priceId: 'price_1QMNctRqb2FjfvrJPVvvz5oD', credits: 5, price: 5, tagline: "Perfect to try things out" },
  { id: '2', priceId: 'price_1QMNdhRqb2FjfvrJwvlxVOhu', credits: 15, price: 10, tagline: "Save 33%" },
  { id: '3', priceId: 'price_1QMNeVRqb2FjfvrJVETcL24d', credits: 35, price: 20, tagline: "Save 43%" },
  { id: '4', priceId: 'price_1QMNf6Rqb2FjfvrJrJaOXGOy', credits: 100, price: 50, tagline: "Best value! Save 50%" },
];