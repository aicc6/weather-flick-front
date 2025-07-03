export default function PlanCard({ plan }) {
  return (
    <div className="rounded border p-4 shadow">
      <div className="font-bold">{plan.title}</div>
      <div>{plan.description}</div>
    </div>
  )
}
