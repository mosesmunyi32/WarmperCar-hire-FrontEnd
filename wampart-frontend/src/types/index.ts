export interface LoginRequest {
  email?: string;
  idNumber?: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  city: string;
  gender: string;
  alternativePhoneNumber: string;
  county: string;
  idNumber: string;
  driversLicenceNumber?: string;
}

export interface passwordChangeReqest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  phoneNumber?: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isActive?: boolean;
}

export interface UserResponse extends User {
  role?: string;
  phoneNumber: string | null;
  alternativePhoneNumber?: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  county: string | null;
  city?: string | null;
  idNumber: string | null;
  profilePhoto?: string | null;
  idFrontPhoto?: string | null;
  idBackPhoto?: string | null;
  driversLicenceNumber?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProfileUpdateRequest {
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  county?: string;
  city?: string;
  idNumber?: string;
  driversLicenceNumber?: string;
}

export interface AdminUpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  county?: string;
  city?: string;
  idNumber?: string;
  driversLicenceNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  yearOfManufacture: number;
  color: string;
  typeOfFuel: string;
  transmission: string;
  numberOfPassengers: number;
  numberPlate: string;
  description: string;
  images: string[];
  pricePerDay: number;
  isAvailable: boolean;
  isInUse?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCar extends Car {
  isAvaialble: boolean;
  currentMileage: number;
  serviceMileageInterval: number;
  isInsuranceActive: boolean;
  insuranceExpiryDate: string;
}

export interface CarRequest {
  brand: string;
  model: string;
  yearOfManufacture: number;
  color: string;
  typeOfFuel: string;
  transmission: string;
  numberOfPassengers: number;
  numberPlate: string;
  description: string;
  pricePerDay: number;
  currentMileage: number;
  serviceMileageInterval: number;
  insuranceExpiryDate: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  bookingReference: string;
  carId: string;
  carBrand?: string;
  carModel?: string;
  carNumberPlate?: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  travelDestination: string;
  numberOfDays: number;
  pricePerDay: number;
  discount: number;
  bookingCost: number | null;
  bookingStatus:
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED";
  customerNote?: string;
  adminNote?: string;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking extends Booking {
  userId: string;
  extendedDays?: number;
  extendedDaysCost?: number;
  approvedBy?: string;
  approvedByName?: string;
  mileageStart?: number;
  mileageEnd?: number;
}

export interface BookingRequest {
  carId: string;
  startDate: string;
  endDate: string;
  travelDestination: string;
  customerNote?: string;
}

export interface AdminBookingRequest {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  travelDestination: string;
  customerNote?: string;
}

export interface AdminDirectBookingRequest {
  idNumber: string;
  numberPlate: string;
  startDate: string;
  endDate: string;
  travelDestination: string;
  adminNote?: string;
}

export interface AdminCreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  county?: string;
  city?: string;
  idNumber: string;
  driversLicenceNumber?: string;
  alternativePhoneNumber?: string;
  idImages: string[];
}

export interface AdminCreateCustomerResponse {
  token: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

export interface BookingHistoryResponse {
  id: string;
  bookingReference: string;
  startDate: string;
  endDate: string;
  bookingStatus: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  numberOfDays: number;
  bookingCost: number | null;
  carBrand?: string | null;
  carModel?: string | null;
  carYear?: number | null;
  numberPlate?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhoneNumber?: string | null;
  inspectionComment?: string | null;
  carWasDamaged?: boolean | null;
  receiptUrl?: string | null;
  createdAt: string;
}

export type ExtensionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface BookingExtensionResponse {
  id: string;
  extensionReference: string;
  bookingId: string;
  userId: string;
  requestedDays: number;
  extensionCost: number | null;
  extensionStatus: ExtensionStatus;
  requestedAt: string;
  adminNote: string | null;
  customerNote: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingExtensionRequest {
  bookingId: string;
  requestedDays: number;
  customerNote?: string;
}

export interface ApproveBookingExtensionRequest {
  extensionId: string;
  extensionStatus: ExtensionStatus;
  adminNote?: string;
}

export type UserListResponse = UserResponse[];
export type CarListResponse = Car[];
export type BookingListResponse = Booking[];

export type InspectionType = "PRE_INSPECTION" | "POST_INSPECTION";
export type InspectionStatus = "PENDING" | "COMPLETED";
export type CustomerResponseStatus = "PENDING" | "CONFIRMED" | "REJECTED";
export type CarCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface AdminInspectionResponse {
  id: string;
  inspectionReference: string;
  bookingId: string;
  carNumberPlate: string;
  carModel: string;
  carBrand: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber: string;
  userIdNumber: string;
  inspectionType: InspectionType;
  inspectionStatus: InspectionStatus;
  condition: CarCondition;
  isDamaged: boolean;
  damagedPhotos: string[];
  inspectionComment: string | null;
  customerResponse: CustomerResponseStatus;
  customerComment: string | null;
  isDamageChargeRequired: boolean | null;
  damageChargeAmount: number | null;
  dateOfInspection: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInspectionResponse {
  id: string;
  inspectionReference: string;
  bookingId: string;
  carNumberPlate: string;
  carModel: string;
  carBrand: string;
  inspectionType: InspectionType;
  inspectionStatus: InspectionStatus;
  condition: CarCondition;
  isDamaged: boolean;
  damagedPhotos: string[];
  inspectionComment: string | null;
  customerResponse: CustomerResponseStatus;
  customerComment: string | null;
  isDamageChargeRequired: boolean | null;
  damageChargeAmount: number | null;
  dateOfInspection: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionRequest {
  bookingId: string;
  condition: CarCondition;
  isDamaged: boolean;
  inspectionComment?: string;
  damagedPhotos?: string[];
  isDamageChargeRequired?: boolean;
  damageChargeAmount?: number;
}

export interface UpdateInspectionRequest {
  condition: CarCondition;
  isDamaged: boolean;
  inspectionComment?: string;
  damagedPhotos?: string[];
  isDamageChargeRequired?: boolean;
  damageChargeAmount?: number;
}

export interface InspectionRespondRequest {
  customerResponse: "CONFIRMED" | "REJECTED";
  customerComment?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  dateOfBirth: string;
  gender: string;
  county: string;
  city: string;
  idNumber: string;
  driversLicenceNumber: string;
}
