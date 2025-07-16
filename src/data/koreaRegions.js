// 대한민국 전국 시·군·구 완전 데이터베이스
// 총 244개 지자체 (17개 광역시도 + 227개 시군구)

/**
 * 광역시도 목록
 */
export const PROVINCES = [
  { code: 'seoul', name: '서울특별시', shortName: '서울' },
  { code: 'busan', name: '부산광역시', shortName: '부산' },
  { code: 'daegu', name: '대구광역시', shortName: '대구' },
  { code: 'incheon', name: '인천광역시', shortName: '인천' },
  { code: 'gwangju', name: '광주광역시', shortName: '광주' },
  { code: 'daejeon', name: '대전광역시', shortName: '대전' },
  { code: 'ulsan', name: '울산광역시', shortName: '울산' },
  { code: 'sejong', name: '세종특별자치시', shortName: '세종' },
  { code: 'gyeonggi', name: '경기도', shortName: '경기' },
  { code: 'gangwon', name: '강원특별자치도', shortName: '강원' },
  { code: 'chungbuk', name: '충청북도', shortName: '충북' },
  { code: 'chungnam', name: '충청남도', shortName: '충남' },
  { code: 'jeonbuk', name: '전라북도', shortName: '전북' },
  { code: 'jeonnam', name: '전라남도', shortName: '전남' },
  { code: 'gyeongbuk', name: '경상북도', shortName: '경북' },
  { code: 'gyeongnam', name: '경상남도', shortName: '경남' },
  { code: 'jeju', name: '제주특별자치도', shortName: '제주' },
]

/**
 * 전국 시·군·구 완전 목록 (244개)
 */
export const ALL_REGIONS = {
  // 서울특별시 (25개 구)
  seoul: [
    { code: 'seoul_jung', name: '중구', province: 'seoul' },
    { code: 'seoul_yongsan', name: '용산구', province: 'seoul' },
    { code: 'seoul_seongdong', name: '성동구', province: 'seoul' },
    { code: 'seoul_gwangjin', name: '광진구', province: 'seoul' },
    { code: 'seoul_dongdaemun', name: '동대문구', province: 'seoul' },
    { code: 'seoul_jungnang', name: '중랑구', province: 'seoul' },
    { code: 'seoul_seongbuk', name: '성북구', province: 'seoul' },
    { code: 'seoul_gangbuk', name: '강북구', province: 'seoul' },
    { code: 'seoul_dobong', name: '도봉구', province: 'seoul' },
    { code: 'seoul_nowon', name: '노원구', province: 'seoul' },
    { code: 'seoul_eunpyeong', name: '은평구', province: 'seoul' },
    { code: 'seoul_seodaemun', name: '서대문구', province: 'seoul' },
    { code: 'seoul_mapo', name: '마포구', province: 'seoul' },
    { code: 'seoul_yangcheon', name: '양천구', province: 'seoul' },
    { code: 'seoul_gangseo', name: '강서구', province: 'seoul' },
    { code: 'seoul_guro', name: '구로구', province: 'seoul' },
    { code: 'seoul_geumcheon', name: '금천구', province: 'seoul' },
    { code: 'seoul_yeongdeungpo', name: '영등포구', province: 'seoul' },
    { code: 'seoul_dongjak', name: '동작구', province: 'seoul' },
    { code: 'seoul_gwanak', name: '관악구', province: 'seoul' },
    { code: 'seoul_seocho', name: '서초구', province: 'seoul' },
    { code: 'seoul_gangnam', name: '강남구', province: 'seoul' },
    { code: 'seoul_songpa', name: '송파구', province: 'seoul' },
    { code: 'seoul_gangdong', name: '강동구', province: 'seoul' },
    { code: 'seoul_jongno', name: '종로구', province: 'seoul' },
  ],

  // 부산광역시 (16개 구·군)
  busan: [
    { code: 'busan_jung', name: '중구', province: 'busan' },
    { code: 'busan_seo', name: '서구', province: 'busan' },
    { code: 'busan_dong', name: '동구', province: 'busan' },
    { code: 'busan_yeongdo', name: '영도구', province: 'busan' },
    { code: 'busan_busanjin', name: '부산진구', province: 'busan' },
    { code: 'busan_dongnae', name: '동래구', province: 'busan' },
    { code: 'busan_nam', name: '남구', province: 'busan' },
    { code: 'busan_buk', name: '북구', province: 'busan' },
    { code: 'busan_haeundae', name: '해운대구', province: 'busan' },
    { code: 'busan_saha', name: '사하구', province: 'busan' },
    { code: 'busan_geumjeong', name: '금정구', province: 'busan' },
    { code: 'busan_gangseo', name: '강서구', province: 'busan' },
    { code: 'busan_yeonje', name: '연제구', province: 'busan' },
    { code: 'busan_suyeong', name: '수영구', province: 'busan' },
    { code: 'busan_sasang', name: '사상구', province: 'busan' },
    { code: 'busan_gijang', name: '기장군', province: 'busan' },
  ],

  // 경기도 (31개 시·군)
  gyeonggi: [
    { code: 'gyeonggi_suwon', name: '수원시', province: 'gyeonggi' },
    { code: 'gyeonggi_yongin', name: '용인시', province: 'gyeonggi' },
    { code: 'gyeonggi_goyang', name: '고양시', province: 'gyeonggi' },
    { code: 'gyeonggi_seongnam', name: '성남시', province: 'gyeonggi' },
    { code: 'gyeonggi_bucheon', name: '부천시', province: 'gyeonggi' },
    { code: 'gyeonggi_ansan', name: '안산시', province: 'gyeonggi' },
    { code: 'gyeonggi_anyang', name: '안양시', province: 'gyeonggi' },
    { code: 'gyeonggi_namyangju', name: '남양주시', province: 'gyeonggi' },
    { code: 'gyeonggi_hwaseong', name: '화성시', province: 'gyeonggi' },
    { code: 'gyeonggi_pyeongtaek', name: '평택시', province: 'gyeonggi' },
    { code: 'gyeonggi_uijeongbu', name: '의정부시', province: 'gyeonggi' },
    { code: 'gyeonggi_siheung', name: '시흥시', province: 'gyeonggi' },
    { code: 'gyeonggi_paju', name: '파주시', province: 'gyeonggi' },
    { code: 'gyeonggi_gimpo', name: '김포시', province: 'gyeonggi' },
    { code: 'gyeonggi_gwangmyeong', name: '광명시', province: 'gyeonggi' },
    { code: 'gyeonggi_gwangju', name: '광주시', province: 'gyeonggi' },
    { code: 'gyeonggi_gunpo', name: '군포시', province: 'gyeonggi' },
    { code: 'gyeonggi_osan', name: '오산시', province: 'gyeonggi' },
    { code: 'gyeonggi_icheon', name: '이천시', province: 'gyeonggi' },
    { code: 'gyeonggi_yangju', name: '양주시', province: 'gyeonggi' },
    { code: 'gyeonggi_anseong', name: '안성시', province: 'gyeonggi' },
    { code: 'gyeonggi_guri', name: '구리시', province: 'gyeonggi' },
    { code: 'gyeonggi_pocheon', name: '포천시', province: 'gyeonggi' },
    { code: 'gyeonggi_yangpyeong', name: '양평군', province: 'gyeonggi' },
    { code: 'gyeonggi_yeoju', name: '여주시', province: 'gyeonggi' },
    { code: 'gyeonggi_dongducheon', name: '동두천시', province: 'gyeonggi' },
    { code: 'gyeonggi_gwacheon', name: '과천시', province: 'gyeonggi' },
    { code: 'gyeonggi_gapyeong', name: '가평군', province: 'gyeonggi' },
    { code: 'gyeonggi_yeoncheon', name: '연천군', province: 'gyeonggi' },
    { code: 'gyeonggi_hanam', name: '하남시', province: 'gyeonggi' },
    { code: 'gyeonggi_uiwang', name: '의왕시', province: 'gyeonggi' },
  ],

  // 강원특별자치도 (18개 시·군)
  gangwon: [
    { code: 'gangwon_chuncheon', name: '춘천시', province: 'gangwon' },
    { code: 'gangwon_wonju', name: '원주시', province: 'gangwon' },
    { code: 'gangwon_gangneung', name: '강릉시', province: 'gangwon' },
    { code: 'gangwon_donghae', name: '동해시', province: 'gangwon' },
    { code: 'gangwon_taebaek', name: '태백시', province: 'gangwon' },
    { code: 'gangwon_sokcho', name: '속초시', province: 'gangwon' },
    { code: 'gangwon_samcheok', name: '삼척시', province: 'gangwon' },
    { code: 'gangwon_hongcheon', name: '홍천군', province: 'gangwon' },
    { code: 'gangwon_hoengseong', name: '횡성군', province: 'gangwon' },
    { code: 'gangwon_yeongwol', name: '영월군', province: 'gangwon' },
    { code: 'gangwon_pyeongchang', name: '평창군', province: 'gangwon' },
    { code: 'gangwon_jeongseon', name: '정선군', province: 'gangwon' },
    { code: 'gangwon_cheorwon', name: '철원군', province: 'gangwon' },
    { code: 'gangwon_hwacheon', name: '화천군', province: 'gangwon' },
    { code: 'gangwon_yanggu', name: '양구군', province: 'gangwon' },
    { code: 'gangwon_inje', name: '인제군', province: 'gangwon' },
    { code: 'gangwon_goseong', name: '고성군', province: 'gangwon' },
    { code: 'gangwon_yangyang', name: '양양군', province: 'gangwon' },
  ],

  // 충청북도 (11개 시·군)
  chungbuk: [
    { code: 'chungbuk_cheongju', name: '청주시', province: 'chungbuk' },
    { code: 'chungbuk_chungju', name: '충주시', province: 'chungbuk' },
    { code: 'chungbuk_jecheon', name: '제천시', province: 'chungbuk' },
    { code: 'chungbuk_boeun', name: '보은군', province: 'chungbuk' },
    { code: 'chungbuk_okcheon', name: '옥천군', province: 'chungbuk' },
    { code: 'chungbuk_yeongdong', name: '영동군', province: 'chungbuk' },
    { code: 'chungbuk_jincheon', name: '진천군', province: 'chungbuk' },
    { code: 'chungbuk_goesan', name: '괴산군', province: 'chungbuk' },
    { code: 'chungbuk_eumseong', name: '음성군', province: 'chungbuk' },
    { code: 'chungbuk_danyang', name: '단양군', province: 'chungbuk' },
    { code: 'chungbuk_jeungpyeong', name: '증평군', province: 'chungbuk' },
  ],

  // 충청남도 (15개 시·군)
  chungnam: [
    { code: 'chungnam_cheonan', name: '천안시', province: 'chungnam' },
    { code: 'chungnam_gongju', name: '공주시', province: 'chungnam' },
    { code: 'chungnam_boryeong', name: '보령시', province: 'chungnam' },
    { code: 'chungnam_asan', name: '아산시', province: 'chungnam' },
    { code: 'chungnam_seosan', name: '서산시', province: 'chungnam' },
    { code: 'chungnam_nonsan', name: '논산시', province: 'chungnam' },
    { code: 'chungnam_gyeryong', name: '계룡시', province: 'chungnam' },
    { code: 'chungnam_dangjin', name: '당진시', province: 'chungnam' },
    { code: 'chungnam_geumsan', name: '금산군', province: 'chungnam' },
    { code: 'chungnam_buyeo', name: '부여군', province: 'chungnam' },
    { code: 'chungnam_seocheon', name: '서천군', province: 'chungnam' },
    { code: 'chungnam_cheongyang', name: '청양군', province: 'chungnam' },
    { code: 'chungnam_hongseong', name: '홍성군', province: 'chungnam' },
    { code: 'chungnam_yesan', name: '예산군', province: 'chungnam' },
    { code: 'chungnam_taean', name: '태안군', province: 'chungnam' },
  ],

  // 전라북도 (14개 시·군)
  jeonbuk: [
    { code: 'jeonbuk_jeonju', name: '전주시', province: 'jeonbuk' },
    { code: 'jeonbuk_gunsan', name: '군산시', province: 'jeonbuk' },
    { code: 'jeonbuk_iksan', name: '익산시', province: 'jeonbuk' },
    { code: 'jeonbuk_jeongeup', name: '정읍시', province: 'jeonbuk' },
    { code: 'jeonbuk_namwon', name: '남원시', province: 'jeonbuk' },
    { code: 'jeonbuk_gimje', name: '김제시', province: 'jeonbuk' },
    { code: 'jeonbuk_wanju', name: '완주군', province: 'jeonbuk' },
    { code: 'jeonbuk_jingan', name: '진안군', province: 'jeonbuk' },
    { code: 'jeonbuk_muju', name: '무주군', province: 'jeonbuk' },
    { code: 'jeonbuk_jangsu', name: '장수군', province: 'jeonbuk' },
    { code: 'jeonbuk_imsil', name: '임실군', province: 'jeonbuk' },
    { code: 'jeonbuk_sunchang', name: '순창군', province: 'jeonbuk' },
    { code: 'jeonbuk_gochang', name: '고창군', province: 'jeonbuk' },
    { code: 'jeonbuk_buan', name: '부안군', province: 'jeonbuk' },
  ],

  // 전라남도 (22개 시·군)
  jeonnam: [
    { code: 'jeonnam_mokpo', name: '목포시', province: 'jeonnam' },
    { code: 'jeonnam_yeosu', name: '여수시', province: 'jeonnam' },
    { code: 'jeonnam_suncheon', name: '순천시', province: 'jeonnam' },
    { code: 'jeonnam_naju', name: '나주시', province: 'jeonnam' },
    { code: 'jeonnam_gwangyang', name: '광양시', province: 'jeonnam' },
    { code: 'jeonnam_damyang', name: '담양군', province: 'jeonnam' },
    { code: 'jeonnam_gokseong', name: '곡성군', province: 'jeonnam' },
    { code: 'jeonnam_gurye', name: '구례군', province: 'jeonnam' },
    { code: 'jeonnam_goheung', name: '고흥군', province: 'jeonnam' },
    { code: 'jeonnam_boseong', name: '보성군', province: 'jeonnam' },
    { code: 'jeonnam_hwasun', name: '화순군', province: 'jeonnam' },
    { code: 'jeonnam_jangheung', name: '장흥군', province: 'jeonnam' },
    { code: 'jeonnam_gangjin', name: '강진군', province: 'jeonnam' },
    { code: 'jeonnam_haenam', name: '해남군', province: 'jeonnam' },
    { code: 'jeonnam_yeongam', name: '영암군', province: 'jeonnam' },
    { code: 'jeonnam_muan', name: '무안군', province: 'jeonnam' },
    { code: 'jeonnam_hampyeong', name: '함평군', province: 'jeonnam' },
    { code: 'jeonnam_yeonggwang', name: '영광군', province: 'jeonnam' },
    { code: 'jeonnam_jangseong', name: '장성군', province: 'jeonnam' },
    { code: 'jeonnam_wando', name: '완도군', province: 'jeonnam' },
    { code: 'jeonnam_jindo', name: '진도군', province: 'jeonnam' },
    { code: 'jeonnam_sinan', name: '신안군', province: 'jeonnam' },
  ],

  // 경상북도 (23개 시·군)
  gyeongbuk: [
    { code: 'gyeongbuk_pohang', name: '포항시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gyeongju', name: '경주시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gimcheon', name: '김천시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_andong', name: '안동시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gumi', name: '구미시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_yeongju', name: '영주시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_yeongcheon', name: '영천시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_sangju', name: '상주시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_mungyeong', name: '문경시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gyeongsan', name: '경산시', province: 'gyeongbuk' },
    { code: 'gyeongbuk_gunwi', name: '군위군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_uiseong', name: '의성군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_cheongsong', name: '청송군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_yeongyang', name: '영양군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_yeongdeok', name: '영덕군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_cheongdo', name: '청도군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_goryeong', name: '고령군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_seongju', name: '성주군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_chilgok', name: '칠곡군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_yecheon', name: '예천군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_bonghwa', name: '봉화군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_uljin', name: '울진군', province: 'gyeongbuk' },
    { code: 'gyeongbuk_ulleung', name: '울릉군', province: 'gyeongbuk' },
  ],

  // 경상남도 (18개 시·군)
  gyeongnam: [
    { code: 'gyeongnam_changwon', name: '창원시', province: 'gyeongnam' },
    { code: 'gyeongnam_jinju', name: '진주시', province: 'gyeongnam' },
    { code: 'gyeongnam_tongyeong', name: '통영시', province: 'gyeongnam' },
    { code: 'gyeongnam_sacheon', name: '사천시', province: 'gyeongnam' },
    { code: 'gyeongnam_gimhae', name: '김해시', province: 'gyeongnam' },
    { code: 'gyeongnam_miryang', name: '밀양시', province: 'gyeongnam' },
    { code: 'gyeongnam_geoje', name: '거제시', province: 'gyeongnam' },
    { code: 'gyeongnam_yangsan', name: '양산시', province: 'gyeongnam' },
    { code: 'gyeongnam_uiryeong', name: '의령군', province: 'gyeongnam' },
    { code: 'gyeongnam_haman', name: '함안군', province: 'gyeongnam' },
    { code: 'gyeongnam_changnyeong', name: '창녕군', province: 'gyeongnam' },
    { code: 'gyeongnam_goseong', name: '고성군', province: 'gyeongnam' },
    { code: 'gyeongnam_namhae', name: '남해군', province: 'gyeongnam' },
    { code: 'gyeongnam_hadong', name: '하동군', province: 'gyeongnam' },
    { code: 'gyeongnam_sancheong', name: '산청군', province: 'gyeongnam' },
    { code: 'gyeongnam_hamyang', name: '함양군', province: 'gyeongnam' },
    { code: 'gyeongnam_geochang', name: '거창군', province: 'gyeongnam' },
    { code: 'gyeongnam_hapcheon', name: '합천군', province: 'gyeongnam' },
  ],

  // 제주특별자치도 (2개 시)
  jeju: [
    { code: 'jeju_jeju', name: '제주시', province: 'jeju' },
    { code: 'jeju_seogwipo', name: '서귀포시', province: 'jeju' },
  ],

  // 대구광역시 (8개 구·군)
  daegu: [
    { code: 'daegu_jung', name: '중구', province: 'daegu' },
    { code: 'daegu_dong', name: '동구', province: 'daegu' },
    { code: 'daegu_seo', name: '서구', province: 'daegu' },
    { code: 'daegu_nam', name: '남구', province: 'daegu' },
    { code: 'daegu_buk', name: '북구', province: 'daegu' },
    { code: 'daegu_suseong', name: '수성구', province: 'daegu' },
    { code: 'daegu_dalseo', name: '달서구', province: 'daegu' },
    { code: 'daegu_dalseong', name: '달성군', province: 'daegu' },
  ],

  // 인천광역시 (10개 구·군)
  incheon: [
    { code: 'incheon_jung', name: '중구', province: 'incheon' },
    { code: 'incheon_dong', name: '동구', province: 'incheon' },
    { code: 'incheon_michuhol', name: '미추홀구', province: 'incheon' },
    { code: 'incheon_yeonsu', name: '연수구', province: 'incheon' },
    { code: 'incheon_namdong', name: '남동구', province: 'incheon' },
    { code: 'incheon_bupyeong', name: '부평구', province: 'incheon' },
    { code: 'incheon_gyeyang', name: '계양구', province: 'incheon' },
    { code: 'incheon_seo', name: '서구', province: 'incheon' },
    { code: 'incheon_ganghwa', name: '강화군', province: 'incheon' },
    { code: 'incheon_ongjin', name: '옹진군', province: 'incheon' },
  ],

  // 광주광역시 (5개 구)
  gwangju: [
    { code: 'gwangju_dong', name: '동구', province: 'gwangju' },
    { code: 'gwangju_seo', name: '서구', province: 'gwangju' },
    { code: 'gwangju_nam', name: '남구', province: 'gwangju' },
    { code: 'gwangju_buk', name: '북구', province: 'gwangju' },
    { code: 'gwangju_gwangsan', name: '광산구', province: 'gwangju' },
  ],

  // 대전광역시 (5개 구)
  daejeon: [
    { code: 'daejeon_dong', name: '동구', province: 'daejeon' },
    { code: 'daejeon_jung', name: '중구', province: 'daejeon' },
    { code: 'daejeon_seo', name: '서구', province: 'daejeon' },
    { code: 'daejeon_yuseong', name: '유성구', province: 'daejeon' },
    { code: 'daejeon_daedeok', name: '대덕구', province: 'daejeon' },
  ],

  // 울산광역시 (5개 구·군)
  ulsan: [
    { code: 'ulsan_jung', name: '중구', province: 'ulsan' },
    { code: 'ulsan_nam', name: '남구', province: 'ulsan' },
    { code: 'ulsan_dong', name: '동구', province: 'ulsan' },
    { code: 'ulsan_buk', name: '북구', province: 'ulsan' },
    { code: 'ulsan_ulju', name: '울주군', province: 'ulsan' },
  ],

  // 세종특별자치시 (1개시 - 하위구역 없음)
  sejong: [{ code: 'sejong_sejong', name: '세종시', province: 'sejong' }],
}

/**
 * 모든 지역을 플랫 배열로 변환
 * @returns {Array} 전국 모든 시·군·구 배열 (244개)
 */
export const getAllRegionsFlat = () => {
  const allRegions = []

  // 광역시도 추가
  PROVINCES.forEach((province) => {
    allRegions.push({
      code: province.code,
      name: province.name,
      shortName: province.shortName,
      type: 'province',
      level: 1,
    })
  })

  // 시·군·구 추가
  Object.values(ALL_REGIONS).forEach((regions) => {
    regions.forEach((region) => {
      allRegions.push({
        ...region,
        type: 'city',
        level: 2,
        fullName: `${PROVINCES.find((p) => p.code === region.province)?.shortName} ${region.name}`,
      })
    })
  })

  return allRegions
}

/**
 * 지역 코드로 지역명 찾기
 * @param {string} regionCode - 지역 코드
 * @returns {string} 지역명
 */
export const getRegionNameByCode = (regionCode) => {
  // 광역시도 검색
  const province = PROVINCES.find((p) => p.code === regionCode)
  if (province) {
    return province.shortName
  }

  // 시·군·구 검색
  for (const regions of Object.values(ALL_REGIONS)) {
    const region = regions.find((r) => r.code === regionCode)
    if (region) {
      return region.name
    }
  }

  return regionCode // 못 찾으면 원본 반환
}

/**
 * 지역명으로 지역 코드 찾기
 * @param {string} regionName - 지역명
 * @returns {string} 지역 코드
 */
export const getRegionCodeByName = (regionName) => {
  // 광역시도 검색
  const province = PROVINCES.find(
    (p) => p.name === regionName || p.shortName === regionName,
  )
  if (province) {
    return province.code
  }

  // 시·군·구 검색
  for (const regions of Object.values(ALL_REGIONS)) {
    const region = regions.find((r) => r.name === regionName)
    if (region) {
      return region.code
    }
  }

  return regionName // 못 찾으면 원본 반환
}

/**
 * 지역별 관광 특색 정보
 */
export const REGION_TOURISM_INFO = {
  // 주요 관광지 특색
  seoul: {
    themes: ['문화', '쇼핑', '역사'],
    keywords: ['궁궐', '한강', '명동', '강남'],
  },
  busan: {
    themes: ['바다', '온천', '문화'],
    keywords: ['해운대', '광안리', '감천문화마을'],
  },
  jeju: {
    themes: ['자연', '휴양', '체험'],
    keywords: ['한라산', '성산일출봉', '협재해수욕장'],
  },
  gyeongju: {
    themes: ['역사', '문화', '유적'],
    keywords: ['불국사', '석굴암', '첨성대'],
  },
  jeonju: {
    themes: ['전통', '음식', '문화'],
    keywords: ['한옥마을', '비빔밥', '전통문화'],
  },
  gangneung: {
    themes: ['바다', '커피', '자연'],
    keywords: ['경포대', '안목해변', '커피거리'],
  },
  yeosu: {
    themes: ['바다', '야경', '섬'],
    keywords: ['밤바다', '엑스포', '오동도'],
  },
  sokcho: {
    themes: ['바다', '산', '자연'],
    keywords: ['설악산', '속초해수욕장', '청초호'],
  },
  tongyeong: {
    themes: ['바다', '섬', '문화'],
    keywords: ['한산도', '미륵산', '동피랑마을'],
  },
}

export default {
  PROVINCES,
  ALL_REGIONS,
  getAllRegionsFlat,
  getRegionNameByCode,
  getRegionCodeByName,
  REGION_TOURISM_INFO,
}
