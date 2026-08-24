import type { MouseEvent } from 'react'
import { Link, useOutletContext } from 'react-router'
import matchCandidate85Image from '@/assets/home/ai-match-85.png'
import matchCandidate92Image from '@/assets/home/ai-match-92.png'
import matchOriginalImage from '@/assets/home/ai-match-original.png'
import './HomePage.css'

interface HomeOutletContext {
  handleFindClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function HomePage() {
  const { handleFindClick } = useOutletContext<HomeOutletContext>()

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <h1>
            잃어버린 반려동물을 <em>AI 외형예측</em>과 <em>주변 제보</em>를 통해 다시 찾아보세요
          </h1>
          <p>전국 보호소 데이터와 AI 매칭을 통해 가장 유사한 후보를 빠르게 확인합니다.</p>
          <div className="home-hero__actions">
            <Link
              className="home-pill-button home-pill-button--primary"
              onClick={handleFindClick}
              to="/find/new"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.4" />
                <path d="m16 16 4 4" />
              </svg>
              사진으로 찾기
            </Link>
            <Link className="home-pill-button home-pill-button--secondary" to="/sightings/new">
              동물을 발견했어요
            </Link>
          </div>
        </div>
        <svg aria-hidden="true" className="home-hero__down" viewBox="0 0 24 24">
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </section>

      <section className="home-matching">
        <div className="home-matching__copy">
          <h2>전국 보호소 데이터와 AI 매칭</h2>
          <p>사진 한 장으로 전국의 보호소 데이터를 분석하여 유사한 후보군을 정리해 드립니다.</p>
          <ol>
            <li>
              <span>1</span>
              <div>
                <strong>사진 업로드</strong>
                <p>정면 사진을 올려주세요.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>AI 특징 분석</strong>
                <p>품종과 패턴을 분석합니다.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>후보 확인</strong>
                <p>유사도 점수 순으로 보여드립니다.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="home-match-preview">
          <div className="home-match-preview__original">
            <img alt="AI 매칭에 사용한 흰색 강아지 원본" src={matchOriginalImage} />
            <span>원본</span>
          </div>
          <div>
            <img alt="원본과 유사도 92%인 흰색 강아지 후보" src={matchCandidate85Image} />
            <span>92%</span>
          </div>
          <div>
            <img alt="원본과 유사도 85%인 흰색 강아지 후보" src={matchCandidate92Image} />
            <span>85%</span>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 14.5h3.4l3 2.4h4.2M4 14.5V20h13.6l2.4-3.6M12.2 10.6 9.8 8.3a2.1 2.1 0 0 1 3-3l.4.4.4-.4a2.1 2.1 0 0 1 3 3l-2.4 2.3a1.4 1.4 0 0 1-2 0Z" />
        </svg>
        <h2>
          가장 빠른 만남,
          <br />
          지금 시작하세요
        </h2>
        <p>가진 사진이 단 한 장이라도 좋습니다.</p>
        <Link
          className="home-pill-button home-pill-button--primary"
          onClick={handleFindClick}
          to="/find/new"
        >
          사진 업로드하기 <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  )
}
