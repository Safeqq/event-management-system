import { PromoCode } from "../../../domain/entities/promo-code";

export interface PromoCodeRepository {
  findById(id: string): Promise<PromoCode | null>;
  findByCode(code: string): Promise<PromoCode | null>;
  findAllActive(): Promise<PromoCode[]>;
  save(promoCode: PromoCode): Promise<void>;
  update(promoCode: PromoCode): Promise<void>;
}
