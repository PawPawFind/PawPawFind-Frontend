import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SelectableChip } from '@/components/ui/selectable-chip'
import { TextInput } from '@/components/ui/text-input'
import { TimeBandSelect } from '@/components/ui/time-band-select'
import { ReportLocationPicker } from '@/features/report-location'
import { useReportForm } from '@/hooks/useReportForm'
import type { AnimalSize, Species } from '@/types/domain'
import {
  REPORT_FEATURE_GROUPS,
  REPORT_TIME_BAND_OPTIONS,
  type ReportFeatureCategory,
} from '@/types/report'
import { mockReportImageAnalyzer } from '../../analysis/mockReportImageAnalyzer'
import type { BreedCandidate, ReportImageAnalyzer } from '../../analysis/reportImageAnalysis.types'
import type { MissingAnimalReportFormSubmission, SightingReportFormSubmission } from '../../types'
import { createSightingTitle } from '../../utils/createSightingTitle'
import { FeatureReviewRow } from './FeatureReviewRow'
import './PhotoFirstReportForm.css'

const MAX_PHOTOS = 3
const REQUIRED_TIME_BAND_OPTIONS = REPORT_TIME_BAND_OPTIONS.filter((option) => option.value !== '')
const SPECIES_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
] as const
const SIZE_OPTIONS = [
  { value: 'SMALL', label: '소형' },
  { value: 'MEDIUM', label: '중형' },
  { value: 'LARGE', label: '대형' },
] as const
const speciesLabels: Record<Species, string> = { DOG: '강아지', CAT: '고양이' }
const sizeLabels: Record<AnimalSize, string> = { SMALL: '소형', MEDIUM: '중형', LARGE: '대형' }

type AnalysisMode = 'ai' | 'manual'
type ReviewFieldKey =
  | 'species'
  | 'colors'
  | 'patterns'
  | 'coatLength'
  | 'ears'
  | 'tail'
  | 'faceEyes'
  | 'accessories'
  | 'breed'
  | 'size'
  | 'bodyCondition'
  | 'behavior'

interface FeatureRowDefinition {
  key: ReviewFieldKey
  category: Exclude<ReportFeatureCategory, '품종'>
}

const AI_FEATURE_ROWS: readonly FeatureRowDefinition[] = [
  { key: 'colors', category: '털색' },
  { key: 'patterns', category: '무늬' },
  { key: 'coatLength', category: '털길이' },
  { key: 'ears', category: '귀' },
  { key: 'tail', category: '꼬리' },
  { key: 'faceEyes', category: '눈/얼굴' },
  { key: 'accessories', category: '착용 중' },
]

const OPTIONAL_FEATURE_ROWS: readonly FeatureRowDefinition[] = [
  { key: 'bodyCondition', category: '몸 상태' },
  { key: 'behavior', category: '행동' },
]

type AiSnapshot = Partial<Record<ReviewFieldKey, string[]>>

interface BasePhotoFirstReportFormProps {
  analyzeImage?: ReportImageAnalyzer
  errorMessage?: string
  isSubmitting?: boolean
}

interface SightingPhotoFirstReportFormProps extends BasePhotoFirstReportFormProps {
  mode: 'sighting'
  onSubmit?: (submission: SightingReportFormSubmission) => void
}

interface MissingPhotoFirstReportFormProps extends BasePhotoFirstReportFormProps {
  mode: 'missing'
  onSubmit?: (submission: MissingAnimalReportFormSubmission) => void
}

type PhotoFirstReportFormProps =
  SightingPhotoFirstReportFormProps | MissingPhotoFirstReportFormProps

interface PhotoPreviewProps {
  file: File
  index: number
  onRemove?: () => void
}

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getFeatureGroup(category: FeatureRowDefinition['category']) {
  const group = REPORT_FEATURE_GROUPS.find((candidate) => candidate.category === category)
  if (!group) throw new Error(`${category} 특징 그룹을 찾을 수 없습니다.`)
  return group
}

function normalizeValues(values: readonly string[]) {
  return [...values].sort((left, right) => left.localeCompare(right, 'ko'))
}

function areSameValues(left: readonly string[], right: readonly string[]) {
  return JSON.stringify(normalizeValues(left)) === JSON.stringify(normalizeValues(right))
}

function PhotoPreview({ file, index, onRemove }: PhotoPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <li>
      {previewUrl && <img alt={`선택한 동물 사진 ${index + 1}`} src={previewUrl} />}
      <span>사진 {index + 1}</span>
      {onRemove && (
        <button aria-label={`사진 ${index + 1} 제거`} onClick={onRemove} type="button">
          ×
        </button>
      )}
    </li>
  )
}

export function PhotoFirstReportForm(props: PhotoFirstReportFormProps) {
  const { analyzeImage = mockReportImageAnalyzer, errorMessage, isSubmitting = false, mode } = props
  const [step, setStep] = useState<1 | 2>(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode | null>(null)
  const [aiSnapshot, setAiSnapshot] = useState<AiSnapshot>({})
  const [breedCandidates, setBreedCandidates] = useState<BreedCandidate[]>([])
  const [breedValue, setBreedValue] = useState('')
  const [isManualBreed, setIsManualBreed] = useState(false)
  const [openField, setOpenField] = useState<ReviewFieldKey | null>(null)
  const [title, setTitle] = useState('')
  const [isTitleDirty, setIsTitleDirty] = useState(false)
  const analysisControllerRef = useRef<AbortController | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const form = useReportForm({ initialEventDate: getTodayDateInputValue() })

  const getFeatureValues = (category: ReportFeatureCategory) =>
    form.features
      .filter((feature) => feature.category === category)
      .map((feature) => feature.keyword)

  const colors = getFeatureValues('털색')
  const colorsKey = colors.join('\u0000')
  const selectedTimeLabel =
    REPORT_TIME_BAND_OPTIONS.find((option) => option.value === form.eventHour)?.label ?? ''
  const canContinue = photos.length > 0 && form.isComplete
  const canSubmit =
    form.species !== null && (mode === 'missing' || title.trim() !== '') && !isSubmitting

  const currentFieldValues = (key: ReviewFieldKey): string[] => {
    switch (key) {
      case 'species':
        return form.species ? [form.species] : []
      case 'size':
        return form.size ? [form.size] : []
      case 'breed':
        return breedValue ? [breedValue] : []
      default: {
        const definition = [...AI_FEATURE_ROWS, ...OPTIONAL_FEATURE_ROWS].find(
          (row) => row.key === key,
        )
        return definition ? getFeatureValues(definition.category) : []
      }
    }
  }

  const getStatus = (key: ReviewFieldKey) => {
    if (analysisMode !== 'ai' || key === 'size' || key === 'bodyCondition' || key === 'behavior') {
      return undefined
    }

    const initialValues = aiSnapshot[key] ?? []
    const currentValues = currentFieldValues(key)
    if (areSameValues(initialValues, currentValues))
      return initialValues.length > 0 ? 'AI' : undefined
    return '수정함'
  }

  useEffect(() => {
    return () => analysisControllerRef.current?.abort()
  }, [])

  useEffect(() => {
    if (step !== 2) return

    window.scrollTo({ behavior: 'auto', left: 0, top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    if (mode !== 'sighting' || isTitleDirty || !form.species) return

    setTitle(
      createSightingTitle({
        colors: colorsKey ? colorsKey.split('\u0000') : [],
        happenPlace: form.happenPlace,
        size: form.size,
        species: form.species,
      }),
    )
  }, [colorsKey, form.happenPlace, form.size, form.species, isTitleDirty, mode])

  const resetAnalysis = () => {
    analysisControllerRef.current?.abort()
    analysisControllerRef.current = null
    setIsAnalyzing(false)
    setAnalysisMode(null)
    setAiSnapshot({})
    setBreedCandidates([])
    setBreedValue('')
    setIsManualBreed(false)
    setOpenField(null)
    setTitle('')
    setIsTitleDirty(false)
    form.setSpecies(null)
    form.setSize(null)
    form.setFeatures([])
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotos = Array.from(event.target.files ?? [])
    if (selectedPhotos.length === 0) return

    resetAnalysis()
    setPhotos((current) => [...current, ...selectedPhotos].slice(0, MAX_PHOTOS))
    event.target.value = ''
  }

  const removePhoto = (index: number) => {
    resetAnalysis()
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  const moveToReview = async () => {
    const analysisPhoto = photos[0]
    if (!analysisPhoto || !canContinue || isAnalyzing) return

    const controller = new AbortController()
    analysisControllerRef.current?.abort()
    analysisControllerRef.current = controller
    setIsAnalyzing(true)

    try {
      const result = await analyzeImage(analysisPhoto, { signal: controller.signal })
      if (controller.signal.aborted) return

      form.setSpecies(result.species)
      form.setFeatures(result.features)
      setBreedCandidates(result.breedCandidates)
      setAnalysisMode('ai')

      const snapshot: AiSnapshot = {
        species: result.species ? [result.species] : [],
      }
      AI_FEATURE_ROWS.forEach(({ category, key }) => {
        snapshot[key] = result.features
          .filter((feature) => feature.category === category)
          .map((feature) => feature.keyword)
      })
      setAiSnapshot(snapshot)
      setOpenField(result.species ? null : 'species')
      setStep(2)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return

      form.setSpecies(null)
      form.setFeatures([])
      setBreedCandidates([])
      setAiSnapshot({})
      setAnalysisMode('manual')
      setOpenField('species')
      setStep(2)
    } finally {
      if (analysisControllerRef.current === controller) {
        analysisControllerRef.current = null
        setIsAnalyzing(false)
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step === 1) {
      void moveToReview()
      return
    }

    if (!canSubmit) return

    const features = form.features.filter((feature) => feature.category !== '품종')
    if (breedValue.trim()) features.push({ category: '품종', keyword: breedValue.trim() })
    const photosForSubmission = photos.map((file, index) => ({ file, sortOrder: index + 1 }))

    if (props.mode === 'sighting') {
      props.onSubmit?.({
        report: {
          ...form.getRequestFields(),
          reportType: 'FOUND',
          title: title.trim(),
        },
        features,
        photos: photosForSubmission,
      })
      return
    }

    props.onSubmit?.({
      report: { ...form.getRequestFields(), reportType: 'LOST' },
      features,
      photos: photosForSubmission,
    })
  }

  const getFeatureSummary = (category: FeatureRowDefinition['category']) => {
    const values = getFeatureValues(category)
    return values.length > 0 ? values.join(' · ') : '확인하지 못했어요'
  }

  const renderFeatureRow = ({ category, key }: FeatureRowDefinition, showStatus: boolean) => {
    const group = getFeatureGroup(category)
    const selectedValues = getFeatureValues(category)

    return (
      <FeatureReviewRow
        expanded={openField === key}
        key={key}
        label={group.label}
        onToggle={() => setOpenField((current) => (current === key ? null : key))}
        status={showStatus ? getStatus(key) : undefined}
        value={getFeatureSummary(category)}
      >
        <fieldset>
          <legend className="photo-first-form__sr-only">{group.label}</legend>
          <div className="photo-first-form__chips">
            {group.options.map((option) => (
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
                selected={selectedValues.includes(option.keyword)}
              >
                {option.label}
              </SelectableChip>
            ))}
          </div>
        </fieldset>
      </FeatureReviewRow>
    )
  }

  const formKindLabel = mode === 'sighting' ? '목격 제보' : '실종 동물 찾기'
  const eventLabel = mode === 'sighting' ? '발견' : '실종'
  const stepOneTitle =
    mode === 'sighting' ? '발견한 동물을 알려주세요' : '잃어버린 아이의 정보를 알려주세요'

  return (
    <>
      <main className="photo-first-form-page">
        <header className="photo-first-form__header">
          <div className="photo-first-form__navigation-row">
            {step === 2 && (
              <button
                aria-label="이전 단계로"
                className="photo-first-form__back"
                onClick={() => setStep(1)}
                type="button"
              >
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <span className="photo-first-form__step">{step} / 2</span>
          </div>
          <h1 ref={headingRef} tabIndex={step === 2 ? -1 : undefined}>
            {step === 1 ? stepOneTitle : '사진을 보고 특징을 채웠어요'}
          </h1>
          <p>
            {step === 1
              ? `사진, 장소, 날짜와 시간대만 알려주세요. 나머지는 AI가 채워드려요.`
              : '틀린 것만 고치면 돼요. 고칠 게 없으면 바로 등록해도 돼요.'}
          </p>
        </header>

        <form
          aria-busy={isAnalyzing || isSubmitting}
          className="photo-first-form"
          id="photo-first-report-form"
          onSubmit={handleSubmit}
        >
          {step === 1 ? (
            <div className="photo-first-form__step-one">
              <section aria-labelledby="report-photo-heading" className="photo-first-form__section">
                <div className="photo-first-form__section-heading">
                  <div>
                    <h2 id="report-photo-heading">
                      사진<em>필수</em>
                    </h2>
                    <p id="report-photos-help">사진은 최대 3장까지 추가할 수 있어요.</p>
                  </div>
                  <label
                    className="photo-first-form__camera-button"
                    title={
                      photos.length >= MAX_PHOTOS ? '사진을 3장까지 선택했습니다' : '사진 추가'
                    }
                  >
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      aria-describedby="report-photos-help"
                      aria-label={`${formKindLabel} 사진 선택`}
                      disabled={photos.length >= MAX_PHOTOS || isAnalyzing}
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
                  <ul aria-label="선택한 동물 사진" className="photo-first-form__photo-list">
                    {photos.map((photo, index) => (
                      <PhotoPreview
                        file={photo}
                        index={index}
                        key={`${photo.name}-${photo.lastModified}-${index}`}
                        onRemove={isAnalyzing ? undefined : () => removePhoto(index)}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <ReportLocationPicker
                className="photo-first-form__section"
                description="지도를 움직이거나 장소명을 입력해 주세요."
                heading={`${eventLabel} 장소`}
                onValueChange={(location) => {
                  form.setHappenPlace(location.happenPlace)
                  form.setLatitude(location.latitude)
                  form.setLongitude(location.longitude)
                }}
                required
                value={{
                  happenPlace: form.happenPlace,
                  latitude: form.latitude,
                  longitude: form.longitude,
                }}
              />

              <section
                aria-label={`${eventLabel} 날짜와 시간대`}
                className="photo-first-form__section"
              >
                <div className="photo-first-form__event-fields">
                  <TextInput
                    label={`${eventLabel} 날짜`}
                    name="eventDate"
                    onChange={(event) => form.setEventDate(event.target.value)}
                    required
                    type="date"
                    value={form.eventDate}
                  />
                  <TimeBandSelect
                    label={`${eventLabel} 시간대`}
                    onValueChange={form.setEventHour}
                    options={REQUIRED_TIME_BAND_OPTIONS}
                    placeholder="시간대를 선택해 주세요"
                    required
                    value={form.eventHour}
                  />
                </div>
              </section>
            </div>
          ) : (
            <div className="photo-first-form__step-two">
              {analysisMode === 'manual' && (
                <p className="photo-first-form__analysis-error" role="alert">
                  사진을 분석하지 못했어요. 동물 종류만 골라주시면 등록할 수 있어요.
                </p>
              )}
              {analysisMode === 'ai' && !form.species && (
                <p className="photo-first-form__analysis-error" role="alert">
                  동물 종류를 확인하지 못했어요. 강아지 또는 고양이를 골라주세요.
                </p>
              )}

              <section aria-label="등록 정보 요약" className="photo-first-form__summary">
                <ul className="photo-first-form__summary-photos">
                  {photos.slice(0, 1).map((photo) => (
                    <PhotoPreview file={photo} index={0} key={`${photo.name}-summary`} />
                  ))}
                </ul>
                <div>
                  <strong>
                    {form.happenPlace} · {form.eventDate} · {selectedTimeLabel}
                  </strong>
                  <span>사진 {photos.length}장</span>
                </div>
                <button onClick={() => setStep(1)} type="button">
                  수정
                </button>
              </section>

              {mode === 'sighting' && (
                <TextInput
                  description="자동으로 작성했어요 · 고칠 수 있어요"
                  label="제보 제목"
                  name="title"
                  onChange={(event) => {
                    setIsTitleDirty(true)
                    setTitle(event.target.value)
                  }}
                  required
                  value={title}
                />
              )}

              <section
                aria-labelledby="ai-features-heading"
                className="photo-first-form__review-section"
              >
                <div className="photo-first-form__review-heading">
                  <h2 id="ai-features-heading">
                    {analysisMode === 'manual' ? '동물 특징' : '사진에서 찾은 특징'}
                  </h2>
                  {analysisMode === 'ai' && (
                    <Badge className="photo-first-form__status-badge">AI</Badge>
                  )}
                </div>

                <div className="photo-first-form__review-list">
                  <FeatureReviewRow
                    expanded={openField === 'species'}
                    label="동물 종류"
                    onToggle={() =>
                      setOpenField((current) => (current === 'species' ? null : 'species'))
                    }
                    required
                    status={getStatus('species')}
                    value={form.species ? speciesLabels[form.species] : '확인하지 못했어요'}
                  >
                    <fieldset>
                      <legend className="photo-first-form__sr-only">동물 종류</legend>
                      <div className="photo-first-form__chips">
                        {SPECIES_OPTIONS.map((option) => (
                          <SelectableChip
                            key={option.value}
                            onClick={() => form.setSpecies(option.value)}
                            selected={form.species === option.value}
                          >
                            {option.label}
                          </SelectableChip>
                        ))}
                      </div>
                    </fieldset>
                  </FeatureReviewRow>

                  {AI_FEATURE_ROWS.map((row) => renderFeatureRow(row, true))}

                  <FeatureReviewRow
                    expanded={openField === 'breed'}
                    label="품종"
                    onToggle={() =>
                      setOpenField((current) => (current === 'breed' ? null : 'breed'))
                    }
                    status={getStatus('breed')}
                    value={
                      breedValue ||
                      (breedCandidates.length > 0
                        ? `후보 ${breedCandidates.length}개 · 선택 안 함`
                        : '확인하지 못했어요')
                    }
                  >
                    <fieldset>
                      <legend className="photo-first-form__sr-only">품종</legend>
                      <div className="photo-first-form__chips">
                        {breedCandidates.map((candidate) => (
                          <SelectableChip
                            key={candidate.id}
                            onClick={() => {
                              setBreedValue(candidate.labelKo)
                              setIsManualBreed(false)
                            }}
                            selected={breedValue === candidate.labelKo && !isManualBreed}
                          >
                            {candidate.labelKo}
                          </SelectableChip>
                        ))}
                        <SelectableChip
                          onClick={() => {
                            setBreedValue('')
                            setIsManualBreed(true)
                          }}
                          selected={isManualBreed}
                        >
                          직접 입력
                        </SelectableChip>
                        <SelectableChip
                          onClick={() => {
                            setBreedValue('')
                            setIsManualBreed(false)
                          }}
                          selected={!breedValue && !isManualBreed}
                        >
                          잘 모르겠어요
                        </SelectableChip>
                      </div>
                      {isManualBreed && (
                        <TextInput
                          label="품종 직접 입력"
                          name="breed"
                          onChange={(event) => setBreedValue(event.target.value)}
                          value={breedValue}
                        />
                      )}
                    </fieldset>
                  </FeatureReviewRow>
                </div>
              </section>

              <section
                aria-labelledby="optional-features-heading"
                className="photo-first-form__review-section"
              >
                <div className="photo-first-form__review-heading">
                  <h2 id="optional-features-heading">더 알고 있다면</h2>
                  <span>선택</span>
                </div>
                <div className="photo-first-form__review-list">
                  <FeatureReviewRow
                    expanded={openField === 'size'}
                    label="크기"
                    onToggle={() => setOpenField((current) => (current === 'size' ? null : 'size'))}
                    value={form.size ? sizeLabels[form.size] : '선택 안 함'}
                  >
                    <fieldset>
                      <legend className="photo-first-form__sr-only">크기</legend>
                      <div className="photo-first-form__chips">
                        {SIZE_OPTIONS.map((option) => (
                          <SelectableChip
                            key={option.value}
                            onClick={() =>
                              form.setSize((current) =>
                                current === option.value ? null : option.value,
                              )
                            }
                            selected={form.size === option.value}
                          >
                            {option.label}
                          </SelectableChip>
                        ))}
                      </div>
                    </fieldset>
                  </FeatureReviewRow>
                  {OPTIONAL_FEATURE_ROWS.map((row) => renderFeatureRow(row, false))}
                </div>
              </section>
            </div>
          )}
        </form>
      </main>

      <div className="photo-first-form__actions">
        <div>
          <p>
            {step === 1
              ? '다음 단계에서 AI가 채운 특징을 확인해요'
              : '고칠 게 없으면 바로 등록해도 돼요'}
          </p>
          {errorMessage && <p role="alert">{errorMessage}</p>}
          <Button
            disabled={step === 1 ? !canContinue : !canSubmit}
            form="photo-first-report-form"
            key={step}
            loading={step === 1 ? isAnalyzing : isSubmitting}
            loadingLabel={step === 1 ? '이미지 AI 분석 중' : '등록 중'}
            size="large"
            type="submit"
          >
            {step === 1 ? '다음' : mode === 'sighting' ? '목격 제보 등록하기' : '비슷한 동물 찾기'}
          </Button>
        </div>
      </div>
    </>
  )
}

export type { PhotoFirstReportFormProps }
