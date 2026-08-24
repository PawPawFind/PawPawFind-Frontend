import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SelectableChip } from '@/components/ui/selectable-chip'
import { TextInput } from '@/components/ui/text-input'
import { TimeBandSelect } from '@/components/ui/time-band-select'
import { ReportLocationPicker } from '@/features/report-location'
import { useReportForm } from '@/hooks/useReportForm'
import type { AnimalSize, Species } from '@/types/domain'
import {
  REPORT_FEATURE_GROUPS,
  REPORT_TIME_BAND_OPTIONS,
  type CreateSightingReportRequest,
  type ReportFeatureInput,
  type ReportPhotoDraft,
} from '@/types/report'
import './SightingReportFormPage.css'

const SPECIES_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
] as const

const SIZE_OPTIONS = [
  { value: 'SMALL', label: '소형' },
  { value: 'MEDIUM', label: '중형' },
  { value: 'LARGE', label: '대형' },
] as const

const MAX_SIGHTING_PHOTOS = 3
const [COLOR_FEATURE_GROUP, ...DETAIL_FEATURE_GROUPS] = REPORT_FEATURE_GROUPS

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

interface SightingReportFormSubmission {
  report: CreateSightingReportRequest
  features: ReportFeatureInput[]
  photos: ReportPhotoDraft[]
}

interface SightingReportFormPageProps {
  onSubmit?: (submission: SightingReportFormSubmission) => void
  errorMessage?: string
  isSubmitting?: boolean
}

interface SightingPhotoPreviewProps {
  file: File
  index: number
  onRemove: () => void
}

function SightingPhotoPreview({ file, index, onRemove }: SightingPhotoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <li>
      {previewUrl && <img alt={`선택한 목격 사진 ${index + 1}`} src={previewUrl} />}
      <span className="sighting-report-form__photo-index">사진 {index + 1}</span>
      <button
        aria-label={`사진 ${index + 1} 제거`}
        className="sighting-report-form__photo-remove"
        onClick={onRemove}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  )
}

export function SightingReportFormPage({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: SightingReportFormPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const form = useReportForm({
    initialEventDate: getTodayDateInputValue(),
    initialSize: 'MEDIUM',
  })
  const canSubmit = title.trim() !== '' && photos.length > 0 && form.isComplete

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) return

    if (step === 1) {
      setStep(2)
      return
    }

    onSubmit?.({
      report: {
        ...form.getRequestFields(),
        reportType: 'FOUND',
        title: title.trim(),
      },
      features: form.features,
      photos: photos.map((file, index) => ({ file, sortOrder: index + 1 })),
    })
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotos = Array.from(event.target.files ?? [])

    if (selectedPhotos.length === 0) return

    setPhotos((current) => [...current, ...selectedPhotos].slice(0, MAX_SIGHTING_PHOTOS))
    event.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  return (
    <>
      <main className="sighting-report-form-page">
        {step === 2 && (
          <button className="sighting-report-form__back" onClick={() => setStep(1)} type="button">
            <span aria-hidden="true">←</span> 이전 단계
          </button>
        )}

        <header className="sighting-report-form__step-header">
          <div className="sighting-report-form__step-progress">
            <span>STEP {step} / 2</span>
            <span aria-hidden="true" className="sighting-report-form__step-track">
              <span style={{ width: step === 1 ? '50%' : '100%' }} />
            </span>
          </div>
          <h1>{step === 1 ? '목격한 동물의 사진을 올려주세요' : '기억나는 특징을 골라주세요'}</h1>
          <p>
            {step === 1
              ? ''
              : '모두 건너뛰어도 등록돼요. 고른 특징은 보호자가 찾을 때 검색 조건으로 쓰여요.'}
          </p>
        </header>

        <form
          aria-busy={isSubmitting}
          className="sighting-report-form"
          id="sighting-report-form"
          onSubmit={handleSubmit}
        >
          {step === 1 && (
            <div className="sighting-report-form__columns">
              <div className="sighting-report-form__column">
                <TextInput
                  className="sighting-report-form__title-input"
                  containerClassName="sighting-report-form__title-field"
                  label="제목"
                  name="title"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 연남동 골목에서 갈색 중형견 봤어요"
                  required
                  value={title}
                />

                <section
                  aria-labelledby="sighting-photos-heading"
                  className="sighting-report-form__section"
                >
                  <div className="sighting-report-form__photo-heading">
                    <div>
                      <h2 id="sighting-photos-heading">사진</h2>
                      <p className="sighting-report-form__help" id="sighting-photos-help">
                        사진은 최대 3장까지 추가 가능해요.
                      </p>
                    </div>
                    <label
                      className="sighting-report-form__camera-button"
                      title={
                        photos.length >= MAX_SIGHTING_PHOTOS
                          ? '사진을 3장까지 선택했습니다'
                          : '사진 추가'
                      }
                    >
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        aria-describedby="sighting-photos-help"
                        aria-label="목격 사진 선택"
                        disabled={photos.length >= MAX_SIGHTING_PHOTOS}
                        multiple
                        onChange={handlePhotoChange}
                        type="file"
                      />
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M8.5 6.5 10 4.5h4l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.5Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                        <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </label>
                  </div>
                  {photos.length > 0 && (
                    <ul aria-label="선택한 목격 사진" className="sighting-report-form__photo-list">
                      {photos.map((photo, index) => (
                        <SightingPhotoPreview
                          file={photo}
                          index={index}
                          key={`${photo.name}-${photo.size}-${photo.lastModified}-${index}`}
                          onRemove={() => removePhoto(index)}
                        />
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-label="동물 기본 정보" className="sighting-report-form__section">
                  <fieldset className="sighting-report-form__field-group">
                    <legend>동물 종류</legend>
                    <SegmentedControl<Species>
                      ariaLabel="동물 종류"
                      onValueChange={form.setSpecies}
                      options={SPECIES_OPTIONS}
                      value={form.species}
                    />
                  </fieldset>

                  <fieldset className="sighting-report-form__field-group">
                    <legend>크기</legend>
                    <p className="sighting-report-form__help">
                      소형 5kg 이하 · 중형 5–15kg · 대형 15kg 이상 정도로 봐주세요.
                    </p>
                    <SegmentedControl<AnimalSize>
                      ariaLabel="동물 크기"
                      onValueChange={form.setSize}
                      options={SIZE_OPTIONS}
                      value={form.size}
                    />
                  </fieldset>

                  <fieldset className="sighting-report-form__field-group">
                    <legend>색상</legend>
                    <p className="sighting-report-form__help">최대 3개까지 입력 가능해요.</p>
                    <div className="sighting-report-form__chips">
                      {COLOR_FEATURE_GROUP.options.map((option) => {
                        const selected = form.isFeatureSelected(
                          COLOR_FEATURE_GROUP.category,
                          option.keyword,
                        )

                        return (
                          <SelectableChip
                            className="sighting-report-form__color-chip"
                            key={option.keyword}
                            onClick={() =>
                              form.toggleFeature({
                                category: COLOR_FEATURE_GROUP.category,
                                keyword: option.keyword,
                                maxSelections: COLOR_FEATURE_GROUP.maxSelections,
                                selection: COLOR_FEATURE_GROUP.selection,
                              })
                            }
                            selected={selected}
                          >
                            <span
                              aria-hidden="true"
                              className="sighting-report-form__color-swatch"
                              style={{ backgroundColor: option.swatch }}
                            />
                            {option.label}
                          </SelectableChip>
                        )
                      })}
                    </div>
                  </fieldset>
                </section>
              </div>

              <div className="sighting-report-form__column">
                <ReportLocationPicker
                  className="sighting-report-form__section"
                  description="지도를 움직여 핀을 맞추면 그 지점이 저장돼요."
                  heading="발견 장소"
                  onValueChange={(location) => {
                    form.setHappenPlace(location.happenPlace)
                    form.setLatitude(location.latitude)
                    form.setLongitude(location.longitude)
                  }}
                  value={{
                    happenPlace: form.happenPlace,
                    latitude: form.latitude,
                    longitude: form.longitude,
                  }}
                />

                <section
                  aria-labelledby="sighting-event-heading"
                  className="sighting-report-form__section"
                >
                  <div>
                    <h2 id="sighting-event-heading">발견 날짜 · 시간</h2>
                    <p className="sighting-report-form__help">시간을 모르면 비워두세요.</p>
                  </div>
                  <div className="sighting-report-form__event-fields">
                    <TextInput
                      containerClassName="sighting-report-form__event-input"
                      label="발견 날짜"
                      name="eventDate"
                      onChange={(event) => form.setEventDate(event.target.value)}
                      required
                      type="date"
                      value={form.eventDate}
                    />
                    <TimeBandSelect
                      className="sighting-report-form__event-time"
                      label="발견 시간대"
                      onValueChange={form.setEventHour}
                      options={REPORT_TIME_BAND_OPTIONS}
                      value={form.eventHour}
                    />
                  </div>
                </section>
              </div>
            </div>
          )}

          {step === 2 && (
            <section
              aria-label="동물 특징"
              className="sighting-report-form__section sighting-report-form__features-section"
            >
              <div className="sighting-report-form__feature-groups">
                {DETAIL_FEATURE_GROUPS.map((group) => (
                  <fieldset className="sighting-report-form__feature-group" key={group.category}>
                    <legend>{group.label}</legend>
                    <span className="sighting-report-form__selection-hint">
                      {group.selection === 'single' ? '하나만' : '여러 개 선택 가능'}
                    </span>
                    <div className="sighting-report-form__chips">
                      {group.options.map((option) => {
                        const selected = form.isFeatureSelected(group.category, option.keyword)

                        return (
                          <SelectableChip
                            key={option.keyword}
                            onClick={() =>
                              form.toggleFeature({
                                category: group.category,
                                keyword: option.keyword,
                                maxSelections: group.maxSelections,
                                selection: group.selection,
                              })
                            }
                            selected={selected}
                          >
                            {option.label}
                          </SelectableChip>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </section>
          )}
        </form>
      </main>

      <div className="sighting-report-form__actions">
        <div className="sighting-report-form__actions-inner">
          {errorMessage && <p role="alert">{errorMessage}</p>}
          <Button
            disabled={!canSubmit || isSubmitting}
            form="sighting-report-form"
            size="large"
            type="submit"
          >
            {step === 1 ? '다음 · 특징 고르기' : isSubmitting ? '제보 등록 중...' : '제보 등록하기'}
          </Button>
        </div>
      </div>
    </>
  )
}

export type { SightingReportFormPageProps, SightingReportFormSubmission }
