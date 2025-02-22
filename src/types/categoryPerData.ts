// Filter 인터페이스
interface Filter {
  filter1: string
  filter2: string
  filter3: string
  filter4?: string
}

export interface CategoryPerData {
  category: string // category를 string으로 수정
  filters: Filter
}
