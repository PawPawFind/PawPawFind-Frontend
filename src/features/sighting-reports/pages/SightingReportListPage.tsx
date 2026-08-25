import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { REPORT_FEATURE_GROUPS } from '@/types/report'
import { ActiveSightingReportFilters } from '../components/ActiveSightingReportFilters'
import { SightingReportFilterPanel } from '../components/SightingReportFilterPanel'
import { SightingReportListItem } from '../components/SightingReportListItem'
import { SightingReportPagination } from '../components/SightingReportPagination'
import { useSightingReportsQuery } from '../hooks/useSightingReportsQuery'
import './SightingReportListPage.css'

const filterGroups = [
  {
    key: 'species',
    label: '동물 종류',
    selectionType: 'single',
    options: [
      { value: 'dog', label: '강아지' },
      { value: 'cat', label: '고양이' },
    ],
  },
  {
    key: 'size',
    label: '크기',
    selectionType: 'single',
    options: [
      { value: 'small', label: '소형' },
      { value: 'medium', label: '중형' },
      { value: 'large', label: '대형' },
    ],
  },
  ...REPORT_FEATURE_GROUPS.map((group) => ({
    key: group.category,
    label: group.category === '털색' ? '색상' : group.label,
    selectionType: group.selection,
    options: group.options.map((option) => ({
      value: `${group.category}:${option.keyword}`,
      label: option.label,
    })),
  })),
] as const

export function SightingReportListPage() {
  const navigate = useNavigate()
  const pageSize = 10
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const { data, isError, isPending, refetch } = useSightingReportsQuery(currentPage, pageSize)
  const labels = useMemo(
    () =>
      new Map<string, string>(
        filterGroups.flatMap((group) =>
          group.options.map((option) => [option.value, option.label] as const),
        ),
      ),
    [],
  )
  const reports = data?.items ?? []
  const activeFilters = selectedFilters.map((value) => ({
    value,
    label: labels.get(value) ?? value,
  }))
  const toggleFilter = (value: string) => {
    const group = filterGroups.find((candidate) =>
      candidate.options.some((option) => option.value === value),
    )
    setSelectedFilters((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value)
      if (group?.selectionType === 'single') {
        const groupValues = new Set(group.options.map((option) => option.value))
        return [...current.filter((item) => !groupValues.has(item)), value]
      }
      return [...current, value]
    })
  }

  return (
    <main className="report-list-page">
      <header className="report-list-page__intro">
        <h1>목격 제보</h1>
        <p>최근 들어온 제보를 시간순으로 보여드려요.</p>
      </header>
      <section aria-labelledby="report-list-title">
        <h2 className="report-list-page__sr-only" id="report-list-title">
          목격 제보 목록
        </h2>
        <button
          aria-expanded={isFilterOpen}
          className={`report-list-page__filter-trigger${isFilterOpen || selectedFilters.length > 0 ? ' report-list-page__filter-trigger--active' : ''}`}
          onClick={() => setIsFilterOpen((open) => !open)}
          type="button"
        >
          필터{selectedFilters.length > 0 ? ` ${selectedFilters.length}` : ''}
        </button>
        {isFilterOpen && (
          <SightingReportFilterPanel
            groups={filterGroups}
            onToggle={toggleFilter}
            selectedValues={selectedFilters}
          />
        )}
        <div className="report-list-page__active-filters">
          <ActiveSightingReportFilters filters={activeFilters} onRemove={toggleFilter} />
          {activeFilters.length > 0 && (
            <button onClick={() => setSelectedFilters([])} type="button">
              모두 지우기
            </button>
          )}
        </div>
        {isPending && (
          <p className="report-list-page__feedback" role="status">
            목격 제보를 불러오는 중입니다.
          </p>
        )}
        {isError && (
          <div role="alert" className="report-list-page__feedback">
            <p>목격 제보를 불러오지 못했습니다.</p>
            <button onClick={() => void refetch()} type="button">
              다시 시도
            </button>
          </div>
        )}
        {!isPending && !isError && reports.length === 0 && (
          <p className="report-list-page__feedback">등록된 목격 제보가 없습니다.</p>
        )}
        {!isPending && !isError && reports.length > 0 && (
          <>
            <p className="report-list-page__count">
              전체 {data?.page.totalCount ?? reports.length}건 · {currentPage * pageSize + 1}–
              {currentPage * pageSize + reports.length}
            </p>
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report.id}>
                  <SightingReportListItem onSelect={(id) => navigate(id)} report={report} />
                </li>
              ))}
            </ul>
            <SightingReportPagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={data?.page.totalPages ?? 0}
            />
            <p className="report-list-page__source">
              국가동물보호정보시스템 공공데이터 · 이용자 목격 제보 기준
            </p>
          </>
        )}
      </section>
      <Link
        aria-label="목격 제보 작성하기"
        className="report-list-page__write-button"
        to="/sightings/new"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="m14.7 5.3 4 4M4 20l3.8-.8L19 8a2.8 2.8 0 0 0-4-4L3.8 15.2 3 19a.8.8 0 0 0 1 1Z" />
        </svg>
        <span>글쓰기</span>
      </Link>
    </main>
  )
}
