"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { authService } from "@/services/authServices"
import { cn } from "@/lib/utils"
import { RegisterFormData } from "@/types"

const STEPS = ["Personal Info", "Details", "Documents"]

const INITIAL: RegisterFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  alternativePhoneNumber: "",
  dateOfBirth: "",
  gender: "",
  county: "",
  city: "",
  idNumber: "",
  driversLicenceNumber: "",
}

export function RegisterForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RegisterFormData>(INITIAL)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const set = (field: keyof RegisterFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  const handleNext = () => {
    if (step === 0) {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.")
        return
      }
    }
    setError(null)
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        alternativePhoneNumber: form.alternativePhoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        county: form.county,
        city: form.city,
        idNumber: form.idNumber,
        driversLicenceNumber: form.driversLicenceNumber || undefined,
      })
      router.push("/login?registered=true")
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form (3/4) */}
      <div className="flex-1 flex items-start justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-2 text-navy mb-8">
            <Car className="h-7 w-7 text-gold" />
            <span className="font-bold text-xl">WAMPART</span>
          </div>

          <h1 className="text-2xl font-bold text-navy mb-1">Create Account</h1>
          <p className="text-muted-foreground text-sm mb-6">Join Wampart today — it&apos;s free</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    i < step ? "bg-success text-white" : i === step ? "bg-royal text-white" : "bg-light-gray text-muted-foreground"
                  )}
                >
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("text-xs hidden sm:block", i === step ? "text-navy font-medium" : "text-muted-foreground")}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-1", i < step ? "bg-success" : "bg-light-gray")} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Step 1 — Personal Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">First Name</label>
                  <Input placeholder="John" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="h-11" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Last Name</label>
                  <Input placeholder="Doe" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="h-11" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Email Address</label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-11" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className={cn("h-11 pr-10", passwordMismatch && "border-danger focus-visible:ring-danger")}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-danger text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Phone Number</label>
                <Input type="tel" placeholder="0712 345 678" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} className="h-11" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Alternative Phone{" "}
                  <i className="text-muted-foreground font-normal not-italic text-xs">— someone to call in case of emergency</i>
                </label>
                <Input type="tel" placeholder="0712 345 678" value={form.alternativePhoneNumber} onChange={(e) => set("alternativePhoneNumber", e.target.value)} className="h-11" />
              </div>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Date of Birth</label>
                <DatePicker
                  value={form.dateOfBirth}
                  onChange={(v) => set("dateOfBirth", v)}
                  placeholder="Select your date of birth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">County</label>
                <Input placeholder="e.g. Nairobi" value={form.county} onChange={(e) => set("county", e.target.value)} className="h-11" />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">City / Town</label>
                <Input placeholder="e.g. Westlands" value={form.city} onChange={(e) => set("city", e.target.value)} className="h-11" />
              </div>
            </div>
          )}

          {/* Step 3 — Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">National ID Number</label>
                <Input placeholder="Enter your ID number" value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Driver&apos;s Licence Number{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input placeholder="Enter licence number" value={form.driversLicenceNumber} onChange={(e) => set("driversLicenceNumber", e.target.value)} className="h-11" />
              </div>
              <div className="bg-off-white rounded-lg p-3 text-xs text-muted-foreground border border-light-gray">
                Your documents are kept secure and used only for identity verification purposes.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => { setError(null); setStep(step - 1) }}
                className="flex-1 h-11 border-navy text-navy gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={step === 0 && passwordMismatch}
                className="flex-1 h-11 bg-navy hover:bg-royal gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 h-11 bg-navy hover:bg-royal gap-2"
              >
                {isLoading ? "Creating Account..." : <>Create Account <ArrowRight className="h-4 w-4" /></>}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already registered?{" "}
            <Link href="/login" className="text-azure hover:underline font-medium">
              Sign In →
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative (1/4) */}
      <div className="hidden lg:flex lg:w-1/4 bg-navy flex-col justify-between p-8">
        <div className="flex items-center gap-2 text-white">
          <Car className="h-7 w-7 text-gold" />
          <div>
            <p className="font-bold text-base leading-none">WAMPART</p>
            <p className="text-white/40 text-xs tracking-widest">CAR HIRE</p>
          </div>
        </div>

        <div>
          <div className="w-10 h-0.5 bg-gold mb-5" />
          <h2 className="text-xl font-bold text-white mb-2 leading-snug">
            Join thousands of<br />happy drivers.
          </h2>
          <p className="text-white/50 text-xs mb-6">
            Create your account and start booking today.
          </p>
          <div className="space-y-2.5">
            {["Free to Register", "Instant Confirmation", "Manage Bookings Online"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-white/70 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-32 w-32 bg-royal/20 rounded-full flex items-center justify-center border border-royal/30">
            <Car className="h-16 w-16 text-gold/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
