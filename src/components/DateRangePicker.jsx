import { Calendar } from '@/components/ui/calendar'

export default function DateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  return (
    <div className="flex gap-2">
      <Calendar
        mode="single"
        selected={startDate}
        onSelect={setStartDate}
        className="rounded border"
      />
      <Calendar
        mode="single"
        selected={endDate}
        onSelect={setEndDate}
        className="rounded border"
      />
    </div>
  )
}
