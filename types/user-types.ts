// types/user.ts
export interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
  orders?: {
    id: string;
    status: string;
    orderDate: Date;
    subtotal: number;
    discountAmount: number | null;
    shippingCost: number | null;
    totalAmount: number;
    billingState: string | null;
    billingCity: string | null;
    billingBuilding: string | null;
    billingFloor: string | null;
    billingStreet: string | null;
    paymentProvider: string | null;
    items: any; // JsonValue from Prisma
  }[];
}

export type ActionState = {
  success: string | null;
  error: string | null;
  data: UserData | null;
};
