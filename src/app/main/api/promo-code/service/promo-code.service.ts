import { PromoCode } from "../../../domain/entities/promo-code";

export interface ValidateResult {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
}

export interface PromoCodeService {
  validate(code: string, purchaseAmount: number): Promise<ValidateResult>;
  deactivate(id: string): Promise<void>;
}
