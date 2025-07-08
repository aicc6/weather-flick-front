import { useGetAllRestaurantsQuery } from '@/store/api'

const RestaurantTest = () => {
  const { data, error, isLoading, isFetching } = useGetAllRestaurantsQuery({
    page: 1,
    page_size: 10,
  })

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="mb-4 text-xl font-bold">레스토랑 API 테스트</h2>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="mb-4 text-xl font-bold">레스토랑 API 테스트</h2>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">오류 발생</h3>
          <p className="mt-1 text-red-600">
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">레스토랑 API 테스트</h2>

      {/* 로딩 상태 표시 */}
      {isFetching && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-2">
          <p className="text-sm text-blue-600">
            백그라운드에서 데이터를 업데이트 중...
          </p>
        </div>
      )}

      {/* 페이지네이션 정보 */}
      {data?.pagination && (
        <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <h3 className="mb-2 font-medium">페이지네이션 정보</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>현재 페이지: {data.pagination.page}</div>
            <div>페이지 크기: {data.pagination.page_size}</div>
            <div>전체 개수: {data.pagination.total_count}</div>
            <div>전체 페이지: {data.pagination.total_pages}</div>
            <div>다음 페이지: {data.pagination.has_next ? '있음' : '없음'}</div>
            <div>이전 페이지: {data.pagination.has_prev ? '있음' : '없음'}</div>
          </div>
        </div>
      )}

      {/* 필터 정보 */}
      {data?.filters && (
        <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <h3 className="mb-2 font-medium">적용된 필터</h3>
          <div className="text-sm">
            <div>지역 코드: {data.filters.region_code || '없음'}</div>
            <div>카테고리 코드: {data.filters.category_code || '없음'}</div>
          </div>
        </div>
      )}

      {/* 레스토랑 목록 */}
      <div className="space-y-4">
        <h3 className="font-medium">
          레스토랑 목록 ({data?.restaurants?.length || 0}개)
        </h3>

        {data?.restaurants && data.restaurants.length > 0 ? (
          <div className="grid gap-4">
            {data.restaurants.map((restaurant, index) => (
              <div
                key={restaurant.content_id || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-lg font-medium">
                    {restaurant.restaurant_name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ID: {restaurant.content_id}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium">주소:</span>{' '}
                    {restaurant.address || '정보 없음'}
                  </div>
                  <div>
                    <span className="font-medium">전화:</span>{' '}
                    {restaurant.tel || '정보 없음'}
                  </div>
                  <div>
                    <span className="font-medium">카테고리:</span>{' '}
                    {restaurant.category_code || '정보 없음'}
                  </div>
                  <div>
                    <span className="font-medium">지역 코드:</span>{' '}
                    {restaurant.region_code || '정보 없음'}
                  </div>
                  {restaurant.latitude && restaurant.longitude && (
                    <div className="md:col-span-2">
                      <span className="font-medium">좌표:</span>{' '}
                      {restaurant.latitude}, {restaurant.longitude}
                    </div>
                  )}
                </div>

                {restaurant.overview && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">설명:</span>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {restaurant.overview}
                    </p>
                  </div>
                )}

                {restaurant.first_image && (
                  <div className="mt-2">
                    <img
                      src={restaurant.first_image}
                      alt={restaurant.restaurant_name}
                      className="h-24 w-32 rounded-md object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>현재 데이터베이스에 레스토랑 정보가 없습니다.</p>
            <p className="mt-1 text-sm">API는 정상적으로 작동하고 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantTest
