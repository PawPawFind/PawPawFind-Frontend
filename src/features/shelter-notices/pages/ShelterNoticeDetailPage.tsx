import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ImageViewer } from '@/components/ui/image-viewer'
import { useShelterNoticeDetailQuery } from '../hooks/useShelterNoticeDetailQuery'
import './ShelterNoticeDetailPage.css'

export function ShelterNoticeDetailPage() {
  const navigate = useNavigate()
  const { noticeId = '' } = useParams<{ noticeId: string }>()
  const noticeQuery = useShelterNoticeDetailQuery(noticeId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (noticeQuery.isPending) {
    return (
      <main className="shelter-notice-detail-page">
        <p className="shelter-notice-detail-page__status" role="status">
          보호소 공고를 불러오는 중입니다.
        </p>
      </main>
    )
  }

  if (noticeQuery.isError) {
    return (
      <main className="shelter-notice-detail-page">
        <div className="shelter-notice-detail-page__missing" role="alert">
          <h1>보호소 공고를 불러오지 못했습니다.</h1>
          <button onClick={() => noticeQuery.refetch()} type="button">
            다시 시도
          </button>
        </div>
      </main>
    )
  }

  const notice = noticeQuery.data
  if (!notice) {
    return (
      <main className="shelter-notice-detail-page">
        <div className="shelter-notice-detail-page__missing" role="alert">
          <h1>보호소 공고를 찾을 수 없습니다.</h1>
          <button onClick={() => navigate(-1)} type="button">
            뒤로 가기
          </button>
        </div>
      </main>
    )
  }

  const selectedPhoto = notice.photos[selectedPhotoIndex]

  return (
    <main className="shelter-notice-detail-page">
      <button
        className="shelter-notice-detail-page__back"
        onClick={() => navigate(-1)}
        type="button"
      >
        <span aria-hidden="true">‹</span> 뒤로 가기
      </button>
      <div className="shelter-notice-detail-page__layout">
        <section aria-label="보호 동물 사진" className="shelter-notice-detail-page__gallery">
          <div className="shelter-notice-detail-page__main-photo">
            {selectedPhoto ? (
              <ImageViewer
                alt={`${notice.title} 사진 ${selectedPhotoIndex + 1}`}
                src={selectedPhoto}
                triggerLabel={`보호 동물 사진 ${selectedPhotoIndex + 1} 전체 화면으로 보기`}
              />
            ) : (
              <span aria-hidden="true">🐾</span>
            )}
          </div>
          {notice.photos.length > 1 && (
            <div className="shelter-notice-detail-page__thumbnails">
              {notice.photos.map((photo, index) => (
                <button
                  aria-label={`보호 동물 사진 ${index + 1} 크게 보기`}
                  aria-pressed={selectedPhotoIndex === index}
                  key={photo}
                  onClick={() => setSelectedPhotoIndex(index)}
                  type="button"
                >
                  <img alt="" src={photo} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="shelter-notice-detail-page__content">
          <header>
            <h1>{notice.title}</h1>
            <span className="shelter-notice-detail-page__badge">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
                <path d="M9.5 20v-6h5v6" />
              </svg>
              보호소 보호 중
            </span>
          </header>
          <dl>
            {notice.details.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section
            aria-labelledby="shelter-location-title"
            className="shelter-notice-detail-page__location"
          >
            <h2 id="shelter-location-title">보호소 정보</h2>
            <dl>
              <div>
                <dt>보호소</dt>
                <dd>{notice.shelterName}</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{notice.shelterAddress}</dd>
              </div>
              <div>
                <dt>전화번호</dt>
                <dd>{notice.shelterPhone}</dd>
              </div>
            </dl>
          </section>
          <p className="shelter-notice-detail-page__source">
            공고 정보는 국가동물보호정보시스템 데이터를 따릅니다.
          </p>
        </section>
      </div>
    </main>
  )
}
