export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        ${sizes[size]}
        border-primary-gold/30
        border-t-primary-gold
        rounded-full
        animate-spin
      `} />
    </div>
  )
}
