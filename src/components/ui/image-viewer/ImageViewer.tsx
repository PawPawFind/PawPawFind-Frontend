import { useEffect, useRef, useState } from 'react'
import './ImageViewer.css'

interface ImageViewerProps {
  src: string
  alt: string
  triggerLabel: string
}

export function ImageViewer({ src, alt, triggerLabel }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [isOpen])

  const closeViewer = () => {
    const dialog = dialogRef.current
    if (dialog?.open && typeof dialog.close === 'function') dialog.close()
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        aria-label={triggerLabel}
        className="ds-image-viewer__trigger"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <img alt={alt} src={src} />
      </button>
      {isOpen && (
        <dialog
          aria-label={alt}
          aria-modal="true"
          className="ds-image-viewer__dialog"
          onCancel={(event) => {
            event.preventDefault()
            closeViewer()
          }}
          ref={dialogRef}
        >
          <button
            aria-label="확대 사진 닫기"
            className="ds-image-viewer__close"
            onClick={closeViewer}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
          <img alt={alt} src={src} />
        </dialog>
      )}
    </>
  )
}

export type { ImageViewerProps }
