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
  type CreateMissingAnimalReportRequest,
  type ReportFeatureInput,
  type ReportPhotoDraft,
} from '@/types/report'
import './MissingAnimalSearchFormPage.css'

const SPECIES_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
] as const

const SIZE_OPTIONS = [
  { value: 'SMALL', label: '소형' },
  { value: 'MEDIUM', label: '중형' },
  { value: 'LARGE', label: '대형' },
] as const

const MAX_MISSING_ANIMAL_PHOTOS = 3
const [COLOR_FEATURE_GROUP, ...DETAIL_FEATURE_GROUPS] = REPORT_FEATURE_GROUPS

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

interface MissingAnimalSearchFormSubmission {
  report: CreateMissingAnimalReportRequest
  features: ReportFeatureInput[]
  photos: ReportPhotoDraft[]
}

interface MissingAnimalSearchFormPageProps {
  onSubmit?: (submission: MissingAnimalSearchFormSubmission) => void
}

interface MissingAnimalPhotoPreviewProps {
  file: File
  index: number
  onRemove: () => void
}

function MissingAnimalPhotoPreview({ file, index, onRemove }: MissingAnimalPhotoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <li>
      {previewUrl && <img alt={`선택한 실종 동물 사진 ${index + 1}`} src={previewUrl} />}
      <span className="missing-animal-form__photo-index">사진 {index + 1}</span>
      <button
        aria-label={`사진 ${index + 1} 제거`}
        className="missing-animal-form__photo-remove"
        onClick={onRemove}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  )
}

export function MissingAnimalSearchFormPage({ onSubmit }: MissingAnimalSearchFormPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [photos, setPhotos] = useState<File[]>([])
  const form = useReportForm({
    initialEventDate: getTodayDateInputValue(),
    initialSize: 'MEDIUM',
  })
  const canSubmit = photos.length > 0 && form.isComplete

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
        reportType: 'LOST',
      },
      features: form.features,
      photos: photos.map((file, index) => ({ file, sortOrder: index + 1 })),
    })
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotos = Array.from(event.target.files ?? [])

    if (selectedPhotos.length === 0) return

    setPhotos((current) => [...current, ...selectedPhotos].slice(0, MAX_MISSING_ANIMAL_PHOTOS))
    event.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  return (
    <>
      <main className="missing-animal-form-page">
        {step === 2 && (
          <button className="missing-animal-form__back" onClick={() => setStep(1)} type="button">
            <span aria-hidden="true">←</span> 이전 단계
          </button>
        )}

        <header className="missing-animal-form__step-header">
          <div className="missing-animal-form__step-progress">
            <span>STEP {step} / 2</span>
            <span aria-hidden="true" className="missing-animal-form__step-track">
              <span style={{ width: step === 1 ? '50%' : '100%' }} />
            </span>
          </div>
          <h1>
            {step === 1 ? '잃어버린 아이의 정보를 알려주세요' : '잃어버린 아이의 특징을 골라주세요'}
          </h1>
          <p>
            {step === 1
              ? '사진과 마지막으로 본 장소를 등록하면 비슷한 목격 제보를 찾아드려요.'
              : '모두 건너뛰어도 검색할 수 있어요. 고른 특징은 비슷한 목격 제보를 좁혀보는 조건으로 쓰여요.'}
          </p>
        </header>

        <form className="missing-animal-form" id="missing-animal-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="missing-animal-form__columns">
              <div className="missing-animal-form__column">
                <section
                  aria-labelledby="missing-photos-heading"
                  className="missing-animal-form__section"
                >
                  <div className="missing-animal-form__photo-heading">
                    <div>
                      <h2 id="missing-photos-heading">사진</h2>
                      <p className="missing-animal-form__help" id="missing-photos-help">
                        사진은 최대 3장까지 추가 가능해요.
                      </p>
                    </div>
                    <label
                      className="missing-animal-form__camera-button"
                      title={
                        photos.length >= MAX_MISSING_ANIMAL_PHOTOS
                          ? '사진을 3장까지 선택했습니다'
                          : '사진 추가'
                      }
                    >
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        aria-describedby="missing-photos-help"
                        aria-label="실종 동물 사진 선택"
                        disabled={photos.length >= MAX_MISSING_ANIMAL_PHOTOS}
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
                    <ul
                      aria-label="선택한 실종 동물 사진"
                      className="missing-animal-form__photo-list"
                    >
                      {photos.map((photo, index) => (
                        <MissingAnimalPhotoPreview
                          file={photo}
                          index={index}
                          key={`${photo.name}-${photo.size}-${photo.lastModified}-${index}`}
                          onRemove={() => removePhoto(index)}
                        />
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-label="동물 기본 정보" className="missing-animal-form__section">
                  <fieldset className="missing-animal-form__field-group">
                    <legend>동물 종류</legend>
                    <SegmentedControl<Species>
                      ariaLabel="동물 종류"
                      onValueChange={form.setSpecies}
                      options={SPECIES_OPTIONS}
                      value={form.species}
                    />
                  </fieldset>

                  <fieldset className="missing-animal-form__field-group">
                    <legend>크기</legend>
                    <p className="missing-animal-form__help">
                      소형 5kg 이하 · 중형 5–15kg · 대형 15kg 이상 정도로 봐주세요.
                    </p>
                    <SegmentedControl<AnimalSize>
                      ariaLabel="동물 크기"
                      onValueChange={form.setSize}
                      options={SIZE_OPTIONS}
                      value={form.size}
                    />
                  </fieldset>

                  <fieldset className="missing-animal-form__field-group">
                    <legend>털색</legend>
                    <p className="missing-animal-form__help">최대 3개까지 입력 가능해요.</p>
                    <div className="missing-animal-form__chips">
                      {COLOR_FEATURE_GROUP.options.map((option) => {
                        const selected = form.isFeatureSelected(
                          COLOR_FEATURE_GROUP.category,
                          option.keyword,
                        )

                        return (
                          <SelectableChip
                            className="missing-animal-form__color-chip"
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
                              className="missing-animal-form__color-swatch"
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

              <div className="missing-animal-form__column">
                <ReportLocationPicker
                  className="missing-animal-form__section"
                  description="지도를 움직여 핀을 맞추면 마지막으로 본 위치가 저장돼요."
                  heading="실종 장소"
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
                  aria-labelledby="missing-event-heading"
                  className="missing-animal-form__section"
                >
                  <div>
                    <h2 id="missing-event-heading">실종 날짜 · 시간</h2>
                    <p className="missing-animal-form__help">시간을 모르면 비워두세요.</p>
                  </div>
                  <div className="missing-animal-form__event-fields">
                    <TextInput
                      containerClassName="missing-animal-form__event-input"
                      label="잃어버린 날짜"
                      name="eventDate"
                      onChange={(event) => form.setEventDate(event.target.value)}
                      required
                      type="date"
                      value={form.eventDate}
                    />
                    <TimeBandSelect
                      className="missing-animal-form__event-time"
                      label="잃어버린 시간대"
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
              className="missing-animal-form__section missing-animal-form__features-section"
            >
              <div className="missing-animal-form__feature-groups">
                {DETAIL_FEATURE_GROUPS.map((group) => (
                  <fieldset className="missing-animal-form__feature-group" key={group.category}>
                    <legend>{group.label}</legend>
                    <span className="missing-animal-form__selection-hint">
                      {group.selection === 'single' ? '하나만' : '여러 개 선택 가능'}
                    </span>
                    <div className="missing-animal-form__chips">
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

      <div className="missing-animal-form__actions">
        <div className="missing-animal-form__actions-inner">
          <Button disabled={!canSubmit} form="missing-animal-form" size="large" type="submit">
            {step === 1 ? '다음 · 특징 고르기' : '비슷한 동물 찾아보기'}
          </Button>
        </div>
      </div>
    </>
  )
}

export type { MissingAnimalSearchFormPageProps, MissingAnimalSearchFormSubmission }
