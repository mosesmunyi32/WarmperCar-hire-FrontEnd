import {
  CalendarDays,
  Check,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { UserResponse } from "@/types";
import { EditForm, GL, GI, fmt } from "./types";

export function InfoCard({
  customer,
  isEditing,
  editForm,
  onChange,
  savingInfo,
  onSave,
  onCancel,
}: {
  customer: UserResponse;
  isEditing: boolean;
  editForm: EditForm;
  onChange: (k: keyof EditForm, v: string) => void;
  savingInfo: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const infoRows: [React.ElementType, string, string | null | undefined][] = [
    [Mail, "Email", customer.email],
    [Phone, "Phone", customer.phoneNumber],
    [Phone, "Alt. Phone", customer.alternativePhoneNumber],
    [CalendarDays, "Date of Birth", customer.dateOfBirth ? fmt(customer.dateOfBirth) : null],
    [User, "Gender", customer.gender],
    [MapPin, "County", customer.county],
    [MapPin, "City", customer.city],
    [IdCard, "ID Number", customer.idNumber],
    [IdCard, "Driver's Licence", customer.driversLicenceNumber],
    [CalendarDays, "Joined", customer.createdAt ? fmt(customer.createdAt) : null],
  ];

  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-royal" /> Personal Information
        </h2>
        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={savingInfo}
              className="h-7 text-xs border-light-gray text-muted-foreground gap-1"
            >
              <X className="h-3 w-3" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={savingInfo}
              className="h-7 text-xs bg-navy hover:bg-royal gap-1"
            >
              <Check className="h-3 w-3" />
              {savingInfo ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={GL}>First Name</label>
            <Input value={editForm.firstName} onChange={(e) => onChange("firstName", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>Last Name</label>
            <Input value={editForm.lastName} onChange={(e) => onChange("lastName", e.target.value)} className={GI} />
          </div>
          <div className="sm:col-span-2">
            <label className={GL}>Email Address</label>
            <Input type="email" value={editForm.email} onChange={(e) => onChange("email", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>Phone Number</label>
            <Input value={editForm.phoneNumber} onChange={(e) => onChange("phoneNumber", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>Alt. Phone</label>
            <Input value={editForm.alternativePhoneNumber} onChange={(e) => onChange("alternativePhoneNumber", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>Date of Birth</label>
            <DatePicker value={editForm.dateOfBirth} onChange={(v) => onChange("dateOfBirth", v)} placeholder="Select date" />
          </div>
          <div>
            <label className={GL}>Gender</label>
            <select
              value={editForm.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className={GL}>County</label>
            <Input value={editForm.county} onChange={(e) => onChange("county", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>City / Town</label>
            <Input value={editForm.city} onChange={(e) => onChange("city", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>National ID Number</label>
            <Input value={editForm.idNumber} onChange={(e) => onChange("idNumber", e.target.value)} className={GI} />
          </div>
          <div>
            <label className={GL}>Driver&apos;s Licence</label>
            <Input value={editForm.driversLicenceNumber} onChange={(e) => onChange("driversLicenceNumber", e.target.value)} className={GI} />
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {infoRows.map(([Icon, label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-7 w-7 bg-off-white rounded-lg flex items-center justify-center border border-light-gray shrink-0">
                <Icon className="h-3.5 w-3.5 text-royal" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-navy">{value ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
