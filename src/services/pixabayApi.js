// Pixabay API 서비스
const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || '47458629-86ae2cc2b9a0d70b38372a2ad'
const PIXABAY_BASE_URL = 'https://pixabay.com/api/'

// 지역별 검색 키워드 매핑
const regionSearchTerms = {
  seoul: ['Seoul Korea', 'Gyeongbokgung Palace', 'Myeongdong Seoul'],
  busan: ['Busan Korea', 'Haeundae Beach', 'Busan skyline'],
  jeju: ['Jeju Island', 'Hallasan mountain', 'Jeju beach'],
  gangneung: ['Gangneung Korea', 'East Sea Korea', 'Sokcho beach'],
  gyeongju: ['Gyeongju Korea', 'Bulguksa temple', 'Gyeongju historical'],
  jeonju: ['Jeonju Korea', 'Jeonju Hanok Village', 'Korean traditional house'],
  yeosu: ['Yeosu Korea', 'Yeosu night view', 'Korean coastal city'],
  incheon: ['Incheon Korea', 'Incheon airport', 'Korean port city'],
  taean: ['Taean Korea', 'Korean west coast', 'Korean sunset beach'],
  pohang: ['Pohang Korea', 'Andong Korea', 'Korean traditional culture'],
  gapyeong: ['Gapyeong Korea', 'Korean countryside', 'Korean mountains'],
  tongyeong: ['Tongyeong Korea', 'Korean islands', 'Korean southern coast'],
  daegu: ['Daegu Korea', 'Korean traditional market', 'Korean city'],
  gwangju: ['Gwangju Korea', 'Korean cultural city', 'Korean art'],
  daejeon: ['Daejeon Korea', 'Korean science city', 'Korean technology'],
  ulsan: ['Ulsan Korea', 'Korean industrial city', 'Korean east coast'],
  chuncheon: ['Chuncheon Korea', 'Korean lake', 'Korean chicken galbi'],
  mokpo: ['Mokpo Korea', 'Korean southwestern coast', 'Korean port'],
  sokcho: ['Sokcho Korea', 'Seoraksan mountain', 'Korean national park'],
  andong: ['Andong Korea', 'Korean traditional village', 'Hahoe village']
}

// Pixabay에서 이미지 검색
export const searchImages = async (query, count = 3) => {
  try {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'places,travel,nature',
      min_width: 400,
      min_height: 300,
      safesearch: 'true',
      per_page: count,
      order: 'popular'
    })

    const response = await fetch(`${PIXABAY_BASE_URL}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Pixabay API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.hits && data.hits.length > 0) {
      return data.hits.map(hit => ({
        id: hit.id,
        url: hit.webformatURL,
        thumbnailUrl: hit.previewURL,
        tags: hit.tags,
        user: hit.user,
        views: hit.views,
        downloads: hit.downloads,
        webUrl: hit.pageURL
      }))
    }
    
    return []
  } catch (error) {
    console.error('Pixabay API 호출 오류:', error)
    return []
  }
}

// 지역별 대표 이미지 가져오기
export const getRegionImages = async (regionId, count = 3) => {
  const searchTerms = regionSearchTerms[regionId]
  
  if (!searchTerms || searchTerms.length === 0) {
    console.warn(`지역 ${regionId}에 대한 검색어가 정의되지 않았습니다.`)
    return []
  }

  try {
    // 첫 번째 검색어로 시도
    let images = await searchImages(searchTerms[0], count)
    
    // 이미지가 부족한 경우 다른 검색어로 추가 검색
    if (images.length < count && searchTerms.length > 1) {
      for (let i = 1; i < searchTerms.length && images.length < count; i++) {
        const additionalImages = await searchImages(searchTerms[i], count - images.length)
        images = [...images, ...additionalImages]
      }
    }
    
    // 중복 제거
    const uniqueImages = images.filter((image, index, self) => 
      index === self.findIndex(img => img.id === image.id)
    )
    
    return uniqueImages.slice(0, count)
  } catch (error) {
    console.error(`지역 ${regionId} 이미지 검색 오류:`, error)
    return []
  }
}

// 여러 지역의 이미지를 동시에 가져오기
export const getMultipleRegionImages = async (regionIds, imagesPerRegion = 3) => {
  try {
    const promises = regionIds.map(regionId => 
      getRegionImages(regionId, imagesPerRegion)
        .then(images => ({ regionId, images }))
        .catch(error => {
          console.error(`지역 ${regionId} 이미지 로드 실패:`, error)
          return { regionId, images: [] }
        })
    )

    const results = await Promise.all(promises)
    
    // 결과를 객체로 변환
    const imageMap = {}
    results.forEach(({ regionId, images }) => {
      imageMap[regionId] = images
    })
    
    return imageMap
  } catch (error) {
    console.error('다중 지역 이미지 검색 오류:', error)
    return {}
  }
}

// 폴백 이미지 URL 생성
export const getFallbackImages = (regionId, count = 3) => {
  const fallbackUrls = [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618047-b14fb846c877?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1578470506794-5b6e90e8d3bc?w=400&h=300&fit=crop'
  ]
  
  return Array.from({ length: count }, (_, index) => ({
    id: `fallback-${regionId}-${index}`,
    url: fallbackUrls[index % fallbackUrls.length],
    thumbnailUrl: fallbackUrls[index % fallbackUrls.length],
    tags: `${regionId} fallback`,
    user: 'Unsplash',
    views: 0,
    downloads: 0,
    webUrl: '#'
  }))
}