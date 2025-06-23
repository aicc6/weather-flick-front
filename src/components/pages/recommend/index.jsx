const mockDestinations = [
  {
    id: 1,
    name: '제주도',
    description: '아름다운 해변과 자연 경관',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: '부산',
    description: '활기찬 해운대와 맛집',
    image:
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: '강릉',
    description: '커피와 바다, 힐링 여행지',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: '경주',
    description: '역사와 문화의 도시',
    image:
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    name: '여수',
    description: '야경과 해산물의 천국',
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
]

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
