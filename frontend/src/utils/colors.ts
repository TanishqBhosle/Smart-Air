export interface CategoryStyle {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export const AQI_CATEGORIES: CategoryStyle[] = [
  {
    label: 'Good',
    min: 0,
    max: 50,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    textColor: '#34D399',
    description: 'Minimal health impact. Air quality is considered satisfactory.',
  },
  {
    label: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#34D399',
    bgColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    textColor: '#6EE7B7',
    description: 'Minor breathing discomfort to sensitive individuals.',
  },
  {
    label: 'Moderate',
    min: 101,
    max: 200,
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    textColor: '#FCD34D',
    description: 'Breathing discomfort to people with lung disease, asthma, and heart conditions.',
  },
  {
    label: 'Poor',
    min: 201,
    max: 300,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    textColor: '#FB923C',
    description: 'Breathing discomfort to most people on prolonged exposure.',
  },
  {
    label: 'Very Poor',
    min: 301,
    max: 400,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    textColor: '#F87171',
    description: 'Respiratory illness on prolonged exposure; pronounced effect on sensitive groups.',
  },
  {
    label: 'Severe',
    min: 401,
    max: 2500,
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.45)',
    textColor: '#FCA5A5',
    description: 'Affects healthy people and seriously impacts those with existing medical conditions.',
  },
];

export function getCategoryStyle(aqi: number | null | undefined): CategoryStyle {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      label: 'Unknown',
      min: 0,
      max: 0,
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.12)',
      borderColor: 'rgba(107, 114, 128, 0.25)',
      textColor: '#9CA3AF',
      description: 'Data unavailable',
    };
  }

  for (const cat of AQI_CATEGORIES) {
    if (aqi >= cat.min && aqi <= cat.max) {
      return cat;
    }
  }

  if (aqi < 0) {
    return {
      label: 'Negative AQI',
      min: aqi,
      max: aqi,
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.15)',
      borderColor: 'rgba(107, 114, 128, 0.3)',
      textColor: '#9CA3AF',
      description: 'Anomalous negative reading',
    };
  }

  return {
    label: 'Hazardous (500+)',
    min: 501,
    max: aqi,
    color: '#991B1B',
    bgColor: 'rgba(153, 27, 27, 0.2)',
    borderColor: 'rgba(153, 27, 27, 0.5)',
    textColor: '#FECACA',
    description: 'Emergency health warning. Entire population likely affected.',
  };
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

