import { onBeforeUnmount, onMounted } from "vue"

const HEADER_SELECTOR = ".app-header"

function syncHeaderOffset(): void {
  const header = document.querySelector(HEADER_SELECTOR)
  if (!header) return

  const height = header.getBoundingClientRect().height
  document.documentElement.style.setProperty(
    "--app-header-offset",
    `${height}px`,
  )
}

export function useAppHeaderOffset(): void {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    syncHeaderOffset()

    const header = document.querySelector(HEADER_SELECTOR)
    if (header) {
      observer = new ResizeObserver(syncHeaderOffset)
      observer.observe(header)
    }

    window.addEventListener("resize", syncHeaderOffset)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener("resize", syncHeaderOffset)
  })
}
