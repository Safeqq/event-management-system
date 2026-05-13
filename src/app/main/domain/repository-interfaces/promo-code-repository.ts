import type { PromoCodeState } from "../aggregates/promo-code";

export interface PromoCodeRepository {
  findById(id: string): Promise<PromoCodeState | null>;
  findByCode(code: string): Promise<PromoCodeState | null>;
  findAllActive(): Promise<PromoCodeState[]>;
  save(promoCode: PromoCodeState): Promise<void>;
  update(promoCode: PromoCodeState): Promise<void>;
}
