// services/service-item.ts
export interface ServiceItem {
  id: number;
  serviceKey: string;
  label: string;
  isActive: boolean;
  maxNumber: number;
  currentNumber: number;
}
