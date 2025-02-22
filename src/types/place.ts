export interface Place {
  id: number
  category: number
  name: string
  filter1?: boolean
  filter2?: boolean
  filter3?: boolean
  filter4?: boolean
  word: string
  time: string
  address: string
  phoneNumber: string
  likes: number
  pictures: string[]
  englishName?: string | null
}
