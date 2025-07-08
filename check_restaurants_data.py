#!/usr/bin/env python3
"""
PostgreSQL restaurants 테이블 데이터 확인 스크립트
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 데이터베이스 연결 정보
DATABASE_URL = "postgresql://aicc6@localhost/weather_flick"

def check_restaurants_data():
    """restaurants 테이블의 데이터를 확인합니다."""
    try:
        # 데이터베이스 엔진 생성
        engine = create_engine(DATABASE_URL)

        # 세션 생성
        Session = sessionmaker(bind=engine)
        session = Session()

        print("🔍 PostgreSQL restaurants 테이블 데이터 확인 중...")
        print(f"📊 데이터베이스: {DATABASE_URL}")
        print("-" * 50)

        # 1. 전체 레코드 수 확인
        count_result = session.execute(text("SELECT COUNT(*) FROM restaurants"))
        total_count = count_result.scalar()
        print(f"📈 전체 레스토랑 수: {total_count:,}개")

        if total_count == 0:
            print("❌ restaurants 테이블에 데이터가 없습니다.")
            return

        # 2. 샘플 데이터 조회 (처음 5개)
        print("\n🍽️  샘플 레스토랑 데이터 (처음 5개):")
        print("-" * 50)

        sample_query = text("""
            SELECT
                content_id,
                region_code,
                restaurant_name,
                category_code,
                address,
                tel,
                latitude,
                longitude,
                created_at
            FROM restaurants
            LIMIT 5
        """)

        sample_results = session.execute(sample_query)

        for i, row in enumerate(sample_results, 1):
            print(f"\n{i}. 레스토랑 정보:")
            print(f"   ID: {row.content_id}")
            print(f"   이름: {row.restaurant_name}")
            print(f"   지역코드: {row.region_code}")
            print(f"   카테고리: {row.category_code}")
            print(f"   주소: {row.address}")
            print(f"   전화: {row.tel}")
            print(f"   좌표: {row.latitude}, {row.longitude}")
            print(f"   생성일: {row.created_at}")

        # 3. 지역별 통계
        print("\n📊 지역별 레스토랑 통계:")
        print("-" * 50)

        region_stats_query = text("""
            SELECT
                region_code,
                COUNT(*) as count
            FROM restaurants
            GROUP BY region_code
            ORDER BY count DESC
            LIMIT 10
        """)

        region_results = session.execute(region_stats_query)

        for row in region_results:
            print(f"   {row.region_code}: {row.count:,}개")

        # 4. 카테고리별 통계
        print("\n🍕 카테고리별 레스토랑 통계:")
        print("-" * 50)

        category_stats_query = text("""
            SELECT
                category_code,
                COUNT(*) as count
            FROM restaurants
            GROUP BY category_code
            ORDER BY count DESC
            LIMIT 10
        """)

        category_results = session.execute(category_stats_query)

        for row in category_results:
            print(f"   {row.category_code}: {row.count:,}개")

        # 5. 최근 추가된 데이터
        print("\n🕒 최근 추가된 레스토랑 (최근 3개):")
        print("-" * 50)

        recent_query = text("""
            SELECT
                content_id,
                restaurant_name,
                region_code,
                created_at
            FROM restaurants
            ORDER BY created_at DESC
            LIMIT 3
        """)

        recent_results = session.execute(recent_query)

        for i, row in enumerate(recent_results, 1):
            print(f"   {i}. {row.restaurant_name} ({row.region_code}) - {row.created_at}")

        session.close()
        engine.dispose()

        print("\n✅ 데이터 확인 완료!")
        print(f"💡 API 엔드포인트: http://localhost:8000/api/local/restaurants/all")

    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        print("🔧 데이터베이스 연결을 확인해주세요.")
        sys.exit(1)

if __name__ == "__main__":
    check_restaurants_data()
