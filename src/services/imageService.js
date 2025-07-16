// 한국 여행지 고화질 이미지 서비스
import { getUnmappedRegionImages, checkTmapApiStatus } from './tmapService.js'

/**
 * 지역별 실제 한국 여행지 이미지 가져오기
 * @param {string} region - 지역명 (한국어)
 * @returns {Promise<string>} 이미지 URL
 */
export const getRegionFirstImage = async (region) => {
  try {
    // 1순위: 정적 이미지 데이터
    let imageUrl = KOREA_TRAVEL_IMAGES[region]

    if (imageUrl) {
      if (import.meta.env.DEV) {
        console.log(`${region} 정적 이미지:`, imageUrl)
      }
      return imageUrl
    }

    // 2순위: Tmap API 활용
    if (await checkTmapApiStatus()) {
      const tmapImages = await getUnmappedRegionImages([region])
      imageUrl = tmapImages[region]

      if (imageUrl) {
        if (import.meta.env.DEV) {
          console.log(`${region} Tmap 이미지:`, imageUrl)
        }
        return imageUrl
      }
    }

    // 3순위: fallback 이미지
    imageUrl = FALLBACK_IMAGES[region] || getDefaultImage(region)
    if (import.meta.env.DEV) {
      console.log(`${region} fallback 이미지:`, imageUrl)
    }
    return imageUrl
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`${region} 이미지 로드 실패:`, error)
    }
    return FALLBACK_IMAGES[region] || getDefaultImage(region)
  }
}

/**
 * 여러 지역의 이미지를 한 번에 가져오기 (Tmap 통합)
 * @param {Array<string>} regions - 지역명 배열
 * @returns {Promise<Object>} 지역별 이미지 URL 객체
 */
export const getMultipleRegionImages = async (regions) => {
  const imageMap = {}
  const unmappedRegions = []

  if (import.meta.env.DEV) {
    console.log('요청된 지역들:', regions)
  }

  // 1단계: 정적 이미지로 매핑 가능한 지역들 처리
  regions.forEach((region) => {
    if (region && typeof region === 'string') {
      const staticImageUrl = KOREA_TRAVEL_IMAGES[region]

      if (staticImageUrl) {
        imageMap[region] = staticImageUrl
        if (import.meta.env.DEV) {
          console.log(`${region} -> 정적 이미지`)
        }
      } else {
        unmappedRegions.push(region)
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('잘못된 지역명:', region)
      }
    }
  })

  // 2단계: 매핑되지 않은 지역들을 Tmap API로 처리
  if (unmappedRegions.length > 0) {
    try {
      if (import.meta.env.DEV) {
        console.log('Tmap API로 처리할 지역들:', unmappedRegions)
      }

      const tmapImages = await getUnmappedRegionImages(unmappedRegions)

      // Tmap 결과를 imageMap에 병합
      Object.entries(tmapImages).forEach(([region, imageUrl]) => {
        if (imageUrl) {
          imageMap[region] = imageUrl
          if (import.meta.env.DEV) {
            console.log(`${region} -> Tmap 이미지`)
          }
        } else {
          // Tmap도 실패한 경우 fallback 사용
          imageMap[region] = FALLBACK_IMAGES[region] || getDefaultImage(region)
          if (import.meta.env.DEV) {
            console.log(`${region} -> fallback 이미지`)
          }
        }
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Tmap 이미지 로딩 실패:', error)
      }

      // Tmap 실패 시 모든 unmapped 지역에 fallback 적용
      unmappedRegions.forEach((region) => {
        imageMap[region] = FALLBACK_IMAGES[region] || getDefaultImage(region)
      })
    }
  }

  if (import.meta.env.DEV) {
    console.log('이미지 매핑 완료:', Object.keys(imageMap).length, '개')
  }

  return imageMap
}

/**
 * 기본 이미지 생성 함수
 * @param {string} region - 지역명
 * @returns {string} 기본 이미지 URL
 */
const getDefaultImage = (region) => {
  // Unsplash의 한국 관련 기본 이미지
  const defaultImages = [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 서울
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 제주
    'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 부산
  ]

  // 지역명을 기반으로 인덱스 생성
  const index = region.length % defaultImages.length
  return defaultImages[index]
}

// 확실히 작동하는 고화질 한국 여행지 이미지들 - 전체 지역 추가
const KOREA_TRAVEL_IMAGES = {
  제주: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 제주 해변
  제주도:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 제주 해변
  서울: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 서울 스카이라인
  부산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 부산 광안리
  인천: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 인천 바다
  대구: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 대구 전통
  대전: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 대전 도시
  광주: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 광주
  울산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 울산 공업
  세종: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 세종 신도시
  경기: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 경기도
  강원: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 강원도 자연
  충북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 충북
  충남: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 충남
  전북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 전북 전통
  전남: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 전남 바다
  경북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 경북 역사
  경남: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 경남
  경주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 경주 역사
  강릉: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 강릉 바다
  전주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 전주 한옥
  여수: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=80&ixlib=rb-4.0.3', // 여수 야경
}

// 백업 이미지들 (고화질 대체 이미지) - 전체 지역 추가
const FALLBACK_IMAGES = {
  제주: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=60',
  제주도:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=60',
  서울: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=60',
  부산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=60',
  인천: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60',
  대구: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  대전: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=60',
  광주: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=60',
  울산: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=60',
  세종: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=60',
  경기: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format&q=60',
  강원: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60',
  충북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  충남: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=60',
  전북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  전남: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60',
  경북: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  경남: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&h=600&fit=crop&auto=format&q=60',
  경주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  강릉: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=60',
  전주: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop&auto=format&q=60',
  여수: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&auto=format&q=60',
}

export { FALLBACK_IMAGES }
