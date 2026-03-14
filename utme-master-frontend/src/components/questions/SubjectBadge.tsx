import Badge from '../ui/Badge'

interface SubjectBadgeProps {
  subject: string
  size?: 'sm' | 'md' | 'lg'
}

const subjectColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  'Mathematics': 'primary',
  'English Language': 'success',
  'Physics': 'info',
  'Chemistry': 'warning',
  'Biology': 'success',
  'Economics': 'secondary',
  'Government': 'error',
  'Commerce': 'warning',
  'Literature in English': 'primary',
  'CRK/IRK': 'info',
  'Geography': 'success',
  'History': 'secondary',
  'Agricultural Science': 'success',
  'Computer Studies': 'primary',
  'Fine Arts': 'secondary',
  'Music': 'warning',
  'Technical Drawing': 'info',
  'Food and Nutrition': 'success',
  'Health Education': 'error',
  'Civic Education': 'warning'
}

export default function SubjectBadge({ subject, size = 'md' }: SubjectBadgeProps) {
  const variant = subjectColors[subject] || 'primary'
  
  return (
    <Badge variant={variant} size={size}>
      {subject}
    </Badge>
  )
}