import { Entity } from "./entity";
import { DateRange } from "../value-objects/date-range";
import { Money } from "../value-objects/money";

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
}
