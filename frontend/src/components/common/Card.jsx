import { motion } from 'framer-motion'

export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6',
  onClick = null,
  ...props 
}) => {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      whileHover={hover && !onClick ? { y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        glass-card 
        ${padding} 
        ${hover ? 'hover:shadow-2xl transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer w-full text-left' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-white ${className}`}>{children}</h3>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>{children}</div>
)
