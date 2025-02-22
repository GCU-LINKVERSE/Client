declare module 'imagesloaded' {
  type EventType = 'always' | 'done' | 'fail' | 'progress'

  interface ImageLoadedElement extends HTMLImageElement {
    img?: HTMLImageElement
    isLoaded: boolean
  }

  interface ImagesLoadedCallback {
    (instance: ImagesLoaded, image?: ImageLoadedElement): void
  }

  export interface ImagesLoaded {
    on(event: EventType, listener: ImagesLoadedCallback): void
    images: ImageLoadedElement[]
  }

  export default function imagesLoaded(
    elem: Element | NodeList | string,
    callback?: ImagesLoadedCallback,
  ): ImagesLoaded
}
