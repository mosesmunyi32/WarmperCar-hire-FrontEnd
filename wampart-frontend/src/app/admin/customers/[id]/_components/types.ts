import { format } from "date-fns";

export const GL =
  "block text-xs font-semibold text-muted-foreground tracking-wide uppercase mb-1";
export const GI = "h-9 text-sm";

export interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  dateOfBirth: string;
  gender: string;
  county: string;
  city: string;
  idNumber: string;
  driversLicenceNumber: string;
}

export const EDIT_FORM_INIT: EditForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  alternativePhoneNumber: "",
  dateOfBirth: "",
  gender: "",
  county: "",
  city: "",
  idNumber: "",
  driversLicenceNumber: "",
};

export function fmt(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}
