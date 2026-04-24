import './Button.css'

import { forwardRef } from 'react'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', ...props },
  ref,
) {
  const classes = [
    'btn',
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ')

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  )
})

export default Button