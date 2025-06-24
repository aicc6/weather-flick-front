import { Star } from '@/components/icons'
import { reviews } from '@/data'

/**
 * URL: /reviews
 */
export function ReviewsPage() {
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
