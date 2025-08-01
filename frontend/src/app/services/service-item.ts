// services/service-item.ts
export interface ServiceItem {
  id: number;
  key: string;
  label: string;
  isActive: boolean;
  maxNumber: number;
  currentNumber: number;
}
