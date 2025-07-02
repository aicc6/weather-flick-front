import { mockDestinations } from '@/data'

export default function RecommendPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">추천 여행지</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {mockDestinations.map((dest) => (
          <div
            key={dest.id}
            className="flex flex-col items-center rounded-lg bg-white p-4 shadow"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="mb-3 h-40 w-full rounded-md object-cover"
            />
            <h2 className="mb-1 text-xl font-semibold">{dest.name}</h2>
            <p className="text-center text-sm text-gray-600">
              {dest.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
