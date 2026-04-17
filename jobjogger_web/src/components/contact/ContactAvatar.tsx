interface ContactAvatarProps {
  name: string
}

export function ContactAvatar({ name }: ContactAvatarProps) {
  return (
    <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
