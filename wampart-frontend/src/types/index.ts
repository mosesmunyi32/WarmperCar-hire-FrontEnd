export interface LoginRequest {
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking extends Booking {
  userId: string;
  extendedDays?: number;
  extendedDaysCost?: number;
  approvedBy?: string;
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

export type UserListResponse = UserResponse[];
export type CarListResponse = Car[];
export type BookingListResponse = Booking[];

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
