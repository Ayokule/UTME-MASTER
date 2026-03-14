import Badge from '../ui/Badge'

interface DifficultyBadgeProps {
  difficulty: string | 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD'
  size?: 'sm' | 'md' | 'lg'
}

const difficultyConfig = {
  Easy: { variant: 'success' as const, icon: '🟢' },
  Medium: { variant: 'warning' as const, icon: '🟡' },
  Hard: { variant: 'error' as const, icon: '🔴' },
  EASY: { variant: 'success' as const, icon: '🟢' },
  MEDIUM: { variant: 'warning' as const, icon: '🟡' },
  HARD: { variant: 'error' as const, icon: '🔴' }
}

export default function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  // Handle undefined or invalid difficulty values
  if (!difficulty) {
    return (
      <Badge variant="primary" size={size}>
        <span className="flex items-center gap-1">
          <span className="text-xs">⚪</span>
          Unknown
        </span>
      </Badge>
    )
  }

  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig]
  
  // Fallback for unknown difficulty values
  if (!config) {
    return (
      <Badge variant="primary" size={size}>
        <span className="flex items-center gap-1">
          <span className="text-xs">⚪</span>
          {difficulty}
        </span>
      </Badge>
    )
  }
  
  return (
    <Badge variant={config.variant} size={size}>
      <span className="flex items-center gap-1">
        <span className="text-xs">{config.icon}</span>
        {difficulty}
      </span>
    </Badge>
  )
}