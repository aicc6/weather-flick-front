export default function PlanRecommendation({ planResults, isLoading }) {
  if (isLoading)
    return <div className="py-8 text-center">추천 플랜을 불러오는 중...</div>
  if (!planResults || planResults.length === 0) return null
  return (
    <div className="grid gap-4">
      {planResults.map((plan, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row dark:bg-zinc-900"
        >
          <img
            src={plan.image}
            alt={plan.title}
            className="h-24 w-24 rounded-md object-cover"
          />
          <div>
            <div className="text-lg font-bold">{plan.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {plan.description}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
