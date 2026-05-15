export const GL = "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1.5";
export const GI = "h-10 text-sm";

export type BookingMode = "new" | "existing";

export interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  county: string;
  city: string;
  idNumber: string;
  driversLicenceNumber: string;
  alternativePhoneNumber: string;
}

export interface BookingForm {
  startDate: string;
  endDate: string;
  travelDestination: string;
  customerNote: string;
}

export const CUSTOMER_INIT: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  dateOfBirth: "",
  gender: "",
  county: "",
  city: "",
  idNumber: "",
  driversLicenceNumber: "",
  alternativePhoneNumber: "",
};

export const BOOKING_INIT: BookingForm = {
  startDate: "",
  endDate: "",
  travelDestination: "",
  customerNote: "",
};

export function normalizeDate(val: string): string {
  return val.length === 16 ? `${val}:00` : val;
}
