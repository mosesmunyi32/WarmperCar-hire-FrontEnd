"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { customerServices } from "@/services/customerServices"
import { bookingService } from "@/services/bookingServices"
import { carService } from "@/services/carServices"
import { AdminCar, AdminCreateCustomerResponse, UserResponse } from "@/types"
import { toast } from "sonner"
import { BookingMode, BookingForm, CustomerForm, CUSTOMER_INIT, BOOKING_INIT, normalizeDate } from "./_components/types"
import { ModeToggle } from "./_components/mode-toggle"
import { StepIndicator } from "./_components/step-indicator"
import { NewCustomerForm } from "./_components/new-customer-form"
import { BookingStep } from "./_components/booking-step"
import { ExistingBookingStep } from "./_components/existing-booking-step"

export default function CreateBookingForCustomerPage() {
  const router = useRouter()

  const [mode, setMode] = useState<BookingMode>("new")
  const [step, setStep] = useState(0)

  const [customerForm, setCustomerForm] = useState<CustomerForm>(CUSTOMER_INIT)
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)
  const [createdCustomer, setCreatedCustomer] = useState<AdminCreateCustomerResponse | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)

  const [customers, setCustomers] = useState<UserResponse[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<UserResponse | null>(null)

  const [cars, setCars] = useState<AdminCar[]>([])
  const [selectedCar, setSelectedCar] = useState<AdminCar | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>(BOOKING_INIT)
  const [creatingBooking, setCreatingBooking] = useState(false)

  useEffect(() => {
    carService.getAllCarsForAdmin().then(setCars).catch(() => {})
    customerServices.getAllCustomers().then(setCustomers).catch(() => {})
  }, [])

  const setC = (k: keyof CustomerForm, v: string) => setCustomerForm((p) => ({ ...p, [k]: v }))
  const setB = (k: keyof BookingForm, v: string) => setBookingForm((p) => ({ ...p, [k]: v }))

  const switchMode = (m: BookingMode) => {
    setMode(m)
    setStep(0)
    setCustomerForm(CUSTOMER_INIT)
    setBookingForm(BOOKING_INIT)
    setIdFront(null)
    setIdBack(null)
    setCreatedCustomer(null)
    setSelectedCar(null)
    setSelectedCustomer(null)
  }

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  const handleCreateAccount = async () => {
    if (
      !customerForm.firstName || !customerForm.lastName || !customerForm.email ||
      !customerForm.phoneNumber || !customerForm.password || !customerForm.dateOfBirth ||
      !customerForm.gender || !customerForm.idNumber
    ) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!idFront || !idBack) {
      toast.error("Both ID front and back photos are required.")
      return
    }
    setCreatingAccount(true)
    try {
      const [base64Front, base64Back] = await Promise.all([toBase64(idFront), toBase64(idBack)])
      const result = await customerServices.createCustomerAccount({
        firstName: customerForm.firstName,
        lastName: customerForm.lastName,
        email: customerForm.email,
        phoneNumber: customerForm.phoneNumber,
        password: customerForm.password,
        dateOfBirth: customerForm.dateOfBirth,
        gender: customerForm.gender,
        county: customerForm.county || undefined,
        city: customerForm.city || undefined,
        idNumber: customerForm.idNumber,
        driversLicenceNumber: customerForm.driversLicenceNumber || undefined,
        alternativePhoneNumber: customerForm.alternativePhoneNumber || undefined,
        idImages: [base64Front, base64Back],
      })
      setCreatedCustomer(result)
      setStep(1)
      toast.success(`Account created for ${result.firstName} ${result.lastName}.`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? "Failed to create customer account.")
    } finally {
      setCreatingAccount(false)
    }
  }

  const handleNewCustomerBooking = async () => {
    if (!selectedCar) { toast.error("Please select a car."); return }
    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.travelDestination) {
      toast.error("Please fill in all required booking fields."); return
    }
    if (!createdCustomer) return
    setCreatingBooking(true)
    try {
      const booking = await bookingService.createDirectBookingForCustomer({
        idNumber: customerForm.idNumber,
        numberPlate: selectedCar.numberPlate,
        startDate: normalizeDate(bookingForm.startDate),
        endDate: normalizeDate(bookingForm.endDate),
        travelDestination: bookingForm.travelDestination,
        adminNote: bookingForm.customerNote || undefined,
      })
      toast.success("Booking created. Please record the start mileage on the booking page.")
      router.push(`/admin/bookings/${booking.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? "Failed to create booking.")
    } finally {
      setCreatingBooking(false)
    }
  }

  const handleCustomerSelect = async (customer: UserResponse | null) => {
    if (!customer) { setSelectedCustomer(null); return }
    try {
      const full = await customerServices.getCustomer(customer.id)
      setSelectedCustomer(full)
    } catch {
      setSelectedCustomer(customer)
    }
  }

  const handleExistingCustomerBooking = async () => {
    if (!selectedCustomer) { toast.error("Please select a customer."); return }
    if (!selectedCar) { toast.error("Please select a car."); return }
    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.travelDestination) {
      toast.error("Please fill in all required booking fields."); return
    }
    setCreatingBooking(true)
    try {
      const booking = await bookingService.createDirectBookingForCustomer({
        idNumber: selectedCustomer.idNumber!,
        numberPlate: selectedCar.numberPlate,
        startDate: normalizeDate(bookingForm.startDate),
        endDate: normalizeDate(bookingForm.endDate),
        travelDestination: bookingForm.travelDestination,
        adminNote: bookingForm.customerNote || undefined,
      })
      toast.success("Booking created. Please record the start mileage on the booking page.")
      router.push(`/admin/bookings/${booking.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? "Failed to create booking.")
    } finally {
      setCreatingBooking(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/bookings"
        className="flex items-center gap-2 text-muted-foreground hover:text-navy text-sm mb-6 w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Book for Customer</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a booking on behalf of a customer.</p>
      </div>

      <ModeToggle mode={mode} onSwitch={switchMode} />

      {mode === "new" && (
        <>
          <StepIndicator step={step} />
          {step === 0 && (
            <NewCustomerForm
              form={customerForm}
              onChange={setC}
              idFront={idFront}
              idBack={idBack}
              onIdFrontChange={setIdFront}
              onIdBackChange={setIdBack}
              onSubmit={handleCreateAccount}
              submitting={creatingAccount}
            />
          )}
          {step === 1 && (
            <BookingStep
              createdCustomer={createdCustomer}
              cars={cars}
              selectedCar={selectedCar}
              onCarChange={setSelectedCar}
              bookingForm={bookingForm}
              onBookingChange={setB}
              onBack={() => setStep(0)}
              onSubmit={handleNewCustomerBooking}
              submitting={creatingBooking}
            />
          )}
        </>
      )}

      {mode === "existing" && (
        <ExistingBookingStep
          customers={customers}
          selectedCustomer={selectedCustomer}
          onCustomerChange={handleCustomerSelect}
          cars={cars}
          selectedCar={selectedCar}
          onCarChange={setSelectedCar}
          bookingForm={bookingForm}
          onBookingChange={setB}
          onSubmit={handleExistingCustomerBooking}
          submitting={creatingBooking}
        />
      )}
    </div>
  )
}
