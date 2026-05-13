import type { Entity } from "./entity";
import type { Money } from "../value-objects/money";
import type { DateRange } from "../value-objects/date-range";

export type DiscountType = "percentage" | "fixed";

export interface PromoCodeState extends Entity {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsage: number;
  usedCount: number;
  minPurchase: Money;
  validPeriod: DateRange;
  isActive: boolean;
}

export const createPromoCode = (
  id: string,
  code: string,
  discountType: DiscountType,
  discountValue: number,
  maxUsage: number,
  usedCount: number,
  minPurchase: Money,
  validPeriod: DateRange,
  isActive: boolean,
): PromoCodeState => ({
  id,
  code,
  discountType,
  discountValue,
  maxUsage,
  usedCount,
  minPurchase,
  validPeriod,
  isActive,
});

export interface ValidationResult {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
}

export const validatePromoCode = (
  promo: PromoCodeState,
  purchaseAmount: Money,
): ValidationResult => {
  if (!promo.isActive)
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: purchaseAmount.amount,
    };
  const now = new Date();
  if (!(now >= promo.validPeriod.start && now <= promo.validPeriod.end)) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: purchaseAmount.amount,
    };
  }
  if (promo.usedCount >= promo.maxUsage)
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: purchaseAmount.amount,
    };
  if (purchaseAmount.amount < promo.minPurchase.amount)
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: purchaseAmount.amount,
    };
  let discount =
    promo.discountType === "percentage"
      ? purchaseAmount.amount * (promo.discountValue / 100)
      : promo.discountValue;
  discount = Math.min(discount, purchaseAmount.amount);
  return {
    valid: true,
    discountAmount: discount,
    finalAmount: purchaseAmount.amount - discount,
  };
};

export const usePromoCode = (promo: PromoCodeState): void => {
  promo.usedCount++;
};

export const deactivatePromoCode = (promo: PromoCodeState): void => {
  promo.isActive = false;
};
