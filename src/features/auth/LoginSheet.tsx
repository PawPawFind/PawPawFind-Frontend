import { useEffect, useRef } from 'react'
import './LoginSheet.css'

interface LoginSheetProps {
  onDismiss: () => void
  onKakaoLogin: () => void
}

export function LoginSheet({ onDismiss, onKakaoLogin }: LoginSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const kakaoButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    kakaoButtonRef.current?.focus()

    return () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close()
    }
  }, [])

  return (
    <dialog
      aria-describedby="login-sheet-description"
      aria-labelledby="login-sheet-title"
      aria-modal="true"
      className="login-sheet"
      onCancel={(event) => {
        event.preventDefault()
        onDismiss()
      }}
      ref={dialogRef}
    >
      <button
        aria-label="로그인 창 닫기"
        className="login-sheet__close"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
      <h2 id="login-sheet-title">실종 동물 찾기는 로그인이 필요해요</h2>
      <p id="login-sheet-description">목격 제보는 로그인 없이 계속 할 수 있어요.</p>
      <button
        className="login-sheet__kakao"
        onClick={onKakaoLogin}
        ref={kakaoButtonRef}
        type="button"
      >
        카카오로 계속하기
      </button>
      <button className="login-sheet__later" onClick={onDismiss} type="button">
        나중에 하기
      </button>
    </dialog>
  )
}

export type { LoginSheetProps }
