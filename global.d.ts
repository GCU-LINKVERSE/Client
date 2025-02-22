// global.d.ts
interface KakaoShareOptions {
  objectType: string
  content: {
    title: string
    description: string
    imageUrl: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }
  social?: {
    likeCount?: number
    commentCount?: number
    sharedCount?: number
  }
  buttons?: {
    title: string
    link: {
      mobileWebUrl: string
      webUrl: string
    }
  }[]
}

interface KakaoStatic {
  init: (key: string) => void
  isInitialized: () => boolean
  Share: {
    sendDefault: (options: KakaoShareOptions) => void
  }
  // 필요한 다른 메서드나 속성이 있다면 추가
}

interface Window {
  Kakao: KakaoStatic
}
