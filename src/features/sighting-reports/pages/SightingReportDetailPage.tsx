import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ImageViewer } from '@/components/ui/image-viewer'
import { ReportLocationMap } from '@/features/report-location'
import { useSightingReportQuery } from '../hooks/useSightingReportsQuery'
import './SightingReportDetailPage.css'

interface SightingReportDetailPageProps {
  reportType?: 'FOUND' | 'LOST'
}

export function SightingReportDetailPage({ reportType = 'FOUND' }: SightingReportDetailPageProps) {
  const navigate = useNavigate()
  const { sightingId, reportId } = useParams<{ sightingId: string; reportId: string }>()
  const resolvedReportId = reportType === 'LOST' ? reportId : sightingId
  const { data: report, isError, isPending, refetch } = useSightingReportQuery(resolvedReportId)
  const isLostReport = reportType === 'LOST'
  const reportLabel = isLostReport ? '등록된 실종 동물' : '목격 제보'
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (isPending)
    return (
      <main className="report-detail-page">
        <p className="report-detail-page__feedback" role="status">
          {reportLabel} 정보를 불러오는 중입니다.
        </p>
      </main>
    )
  if (isError || !report)
    return (
      <main className="report-detail-page">
        <div className="report-detail-page__feedback" role="alert">
          <h1>{reportLabel} 정보를 찾을 수 없습니다.</h1>
          <button onClick={() => void refetch()} type="button">
            다시 시도
          </button>
        </div>
      </main>
    )

  const details: [string, string][] = [
    ['동물 종류', report.speciesLabel],
    ['크기', report.sizeLabel],
    [isLostReport ? '실종 장소' : '발견 장소', report.areaText],
    [isLostReport ? '실종 시간' : '발견 시간', `${report.dateText} ${report.timeBandText}`],
    ...report.features.map(
      ({ category, keywords }) => [category, keywords.join(', ')] as [string, string],
    ),
  ]
  const selectedPhoto = report.photos[selectedPhotoIndex]
  const galleryItemCount = report.photos.length || 3
  const showPreviousPhoto = () =>
    setSelectedPhotoIndex((current) => (current - 1 + galleryItemCount) % galleryItemCount)
  const showNextPhoto = () => setSelectedPhotoIndex((current) => (current + 1) % galleryItemCount)

  return (
    <main className="report-detail-page">
      <button className="report-detail-page__back" onClick={() => navigate(-1)} type="button">
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
        </svg>
        뒤로 가기
      </button>
      <div className="report-detail-page__layout">
        <section aria-label="제보 사진" className="report-detail-page__gallery">
          <div className="report-detail-page__carousel">
            <div className="report-detail-page__main-photo">
              {selectedPhoto ? (
                <ImageViewer
                  alt={selectedPhoto.alt}
                  src={selectedPhoto.url}
                  triggerLabel={`${selectedPhoto.alt} 전체 화면으로 보기`}
                />
              ) : (
                <span>제보 사진 {selectedPhotoIndex + 1}</span>
              )}
            </div>
            <button
              aria-label="이전 사진"
              className="report-detail-page__carousel-button report-detail-page__carousel-button--previous"
              disabled={galleryItemCount <= 1}
              onClick={showPreviousPhoto}
              type="button"
            >
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
              </svg>
            </button>
            <button
              aria-label="다음 사진"
              className="report-detail-page__carousel-button report-detail-page__carousel-button--next"
              disabled={galleryItemCount <= 1}
              onClick={showNextPhoto}
              type="button"
            >
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
              </svg>
            </button>
            <span className="report-detail-page__carousel-counter">
              {selectedPhotoIndex + 1} / {galleryItemCount}
            </span>
          </div>
          <div className="report-detail-page__thumbnails">
            {[0, 1, 2].map((index) => {
              const photo = report.photos[index]
              const isSelected = selectedPhotoIndex === index

              return photo ? (
                <button
                  aria-label={`제보 사진 ${index + 1} 크게 보기`}
                  aria-pressed={isSelected}
                  className="report-detail-page__thumbnail"
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(index)}
                  type="button"
                >
                  <img alt="" src={photo.url} />
                </button>
              ) : (
                <div
                  aria-hidden="true"
                  className={`report-detail-page__thumbnail${isSelected ? ' report-detail-page__thumbnail--selected' : ''}`}
                  key={`empty-photo-${index}`}
                />
              )
            })}
          </div>
        </section>
        <section className="report-detail-page__content">
          <header>
            {!isLostReport && <h1>{report.title}</h1>}
            <span className="report-detail-page__badge">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="M12 20.5s6.4-5.6 6.4-10.1a6.4 6.4 0 0 0-12.8 0c0 4.5 6.4 10.1 6.4 10.1Z" />
                <circle cx="12" cy="10.2" r="2.3" />
              </svg>
              {reportLabel}
            </span>
          </header>
          <dl className="report-detail-page__facts">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section aria-labelledby="location-title" className="report-detail-page__location">
            <h2 id="location-title">{isLostReport ? '실종 위치' : '발견 위치'}</h2>
            <ReportLocationMap
              areaText={report.areaText}
              interactive={false}
              latitude={report.location.lat}
              longitude={report.location.lng}
              radiusM={report.location.radiusM}
            />
          </section>
          <p className="report-detail-page__privacy">제보자 정보는 공개되지 않아요.</p>
        </section>
      </div>
    </main>
  )
}
