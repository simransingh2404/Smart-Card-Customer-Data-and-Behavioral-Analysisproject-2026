export interface User {
  email: string;
  role: string;
  token: string;
  verified: boolean;
}

export interface RFQ {
  id: number;
  title: string;
  description: string;
  uniformType: string;
  quantity: number;
  sizes: string;
  budget: number;
  deadline: string;
  deliveryAddress: string;
  status: string;
  schoolName: string;
  schoolCity: string;
  createdAt: string;
}

export interface Quotation {
  id: number;
  rfqId: number;
  rfqTitle: string;
  schoolName: string;
  vendorId: number;
  companyName: string;
  totalPrice: number;
  deliveryDays: number;
  sampleAvailable: string;
  additionalNotes: string;
  termsAndConditions: string;
  status: string;
  createdAt: string;
}