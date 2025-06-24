import { Star } from '@/components/icons'

/**
 * URL: /reviews
 */
export function ReviewsPage() {
  // Mock data for travel reviews
  const reviews = [
    {
      id: 1,
      title: '제주도 환상의 자전거 여행',
      author: '김여행',
      date: '2024-05-10',
      rating: 5,
      content:
        '날씨가 정말 좋았고, 해안도로를 따라 자전거를 타는 경험은 잊을 수 없습니다. 꼭 한번 가보세요!',
      imageUrl:
        '/images/photo-1590698933909-2c9c1b3b7a1e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      title: '비오는 날의 경주, 운치 있었어요',
      author: '박감성',
      date: '2024-04-22',
      rating: 4,
      content:
        '비가 와서 걱정했지만, 오히려 차분하고 고즈넉한 분위기 속에서 경주를 즐길 수 있었습니다. 불국사와 석굴암은 비오는 날씨에도 정말 멋졌습니다.',
      imageUrl:
        '/images/photo-1583513702443-055a3a0d5f53?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      title: '가족과 함께한 강릉 바다여행',
      author: '이사랑',
      date: '2024-05-01',
      rating: 5,
      content:
        '아이들이 바다를 보고 정말 좋아했어요. 날씨 예보를 보고 맑은 날에 맞춰 갔는데, 정말 탁월한 선택이었습니다. 중앙시장에서 먹은 닭강정도 최고!',
      imageUrl:
        '/images/photo-1608232189605-9e1e82865b14?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 4,
      title: '서울 도심 속 고궁 투어',
      author: '최역사',
      date: '2024-03-15',
      rating: 4,
      content:
        '미세먼지 없는 맑은 날, 경복궁과 창덕궁을 거닐었습니다. 도심 속에서 느끼는 여유와 역사의 숨결이 인상 깊었습니다.',
      imageUrl:
        '/images/photo-1545641203-74a7b9a91b94?q=80&w=1000&auto=format&fit=crop',
    },
  ]

  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />,
      )
    }
    return stars
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">여행 리뷰</h1>
          <p className="mt-4 text-lg text-gray-600">
            Weather Flick 사용자들의 생생한 여행 경험을 확인해보세요.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md md:flex-row"
            >
              <div className="md:w-1/3">
                <img
                  className="h-full w-full object-cover"
                  src={review.imageUrl}
                  alt={review.title}
                />
              </div>
              <div className="flex flex-col justify-between p-6 md:w-2/3">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {review.title}
                    </h2>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-base text-gray-600">
                    {review.content}
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                    {review.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {review.author}
                    </p>
                    <time
                      dateTime={review.date}
                      className="text-sm text-gray-500"
                    >
                      {review.date}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
