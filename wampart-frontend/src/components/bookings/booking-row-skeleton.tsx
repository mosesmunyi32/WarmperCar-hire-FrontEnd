export function BookingRowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 bg-light-gray rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-light-gray rounded" />
        <div className="h-3 w-24 bg-light-gray rounded" />
        <div className="h-3 w-36 bg-light-gray rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-5 w-20 bg-light-gray rounded-full" />
        <div className="h-4 w-24 bg-light-gray rounded" />
      </div>
    </div>
  );
}
