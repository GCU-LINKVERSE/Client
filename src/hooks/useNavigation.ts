import { useRouter } from 'next/navigation'

export const useNavigation = (
  setBottomSheetState: (state: 'collapsed' | 'middle' | 'expanded') => void,
) => {
  const router = useRouter()

  const handleBackClick = () => {
    router.push('/place')
  }

  const handleCloseClick = () => {
    setBottomSheetState('collapsed')
  }

  return { handleBackClick, handleCloseClick }
}
