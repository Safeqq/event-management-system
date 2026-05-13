import { Entity } from "../entities/entity";
import { Money } from "../value-objects/money";
import { DateRange } from "../value-objects/date-range";

export type DiscountType = "percentage" | "fixed";

export class PromoCode extends Entity {
  constructor(
    public readonly id: string,
    public code: string,
    public discountType: DiscountType,
    public discountValue: number,
    public maxUsage: number,
    public usedCount: number,
    public minPurchase: Money,
    public validPeriod: DateRange,
    public isActive: boolean,
  ) {
    super(id);
  }

  validate(purchaseAmount: Money): { valid: boolean; discountAmount: number; finalAmount: number } {
    if (!this.isActive) return { valid: false, discountAmount: 0, finalAmount: purchaseAmount.amount };
    if (!this.validPeriod.isActive()) return { valid: false, discountAmount: 0, finalAmount: purchaseAmount.amount };
    if (this.usedCount >= this.maxUsage) return { valid: false, discountAmount: 0, finalAmount: purchaseAmount.amount };
    if (purchaseAmount.amount < this.minPurchase.amount) return { valid: false, discountAmount: 0, finalAmount: purchaseAmount.amount };
    let discount = this.discountType === "percentage"
      ? purchaseAmount.amount * (this.discountValue / 100)
      : this.discountValue;
    discount = Math.min(discount, purchaseAmount.amount);
    return { valid: true, discountAmount: discount, finalAmount: purchaseAmount.amount - discount };
  }

  use(): void {
    this.usedCount++;
  }

  deactivate(): void {
    this.isActive = false;
  }
}
