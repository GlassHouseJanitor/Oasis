// Define the theme structure
export interface Theme {
  variant: 'professional' | 'tint' | 'vibrant';
  primary: string;
  appearance: 'light' | 'dark' | 'system';
  radius: number;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    border: string;
    muted: string;
    mutedForeground: string;
  };
}

// Default theme configuration
export const defaultTheme: Theme = {
  variant: 'professional',
  primary: '#333232',
  appearance: 'light',
  radius: 0.5,
  fonts: {
    heading: 'Monoton',
    body: 'Averia Sans Libre'
  },
  colors: {
    secondary: '#a3b68a',
    accent: '#264653',
    success: '#a3b68a',
    warning: '#E9C46A',
    error: '#E76F51',
    info: '#a3b68a',
    background: '#FFFFFF',
    foreground: '#333232',
    card: '#FFFFFF',
    cardForeground: '#333232',
    border: '#E2E8F0',
    muted: '#F1F5F9',
    mutedForeground: '#64748B'
  }
};

// Load theme from localStorage or return default theme
export function loadTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      return {
        ...defaultTheme,
        ...parsedTheme,
        colors: {
          ...defaultTheme.colors,
          ...(parsedTheme.colors || {})
        },
        fonts: {
          ...defaultTheme.fonts,
          ...(parsedTheme.fonts || {})
        }
      };
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
  
  return defaultTheme;
}

// Save theme to localStorage
export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem('app-theme', JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

// Apply the theme to the DOM
export function applyTheme(theme: Theme): void {
  // Apply CSS variables to the document root
  const root = document.documentElement;
  
  // Apply brand colors
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  
  // Apply semantic colors
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--error', theme.colors.error);
  root.style.setProperty('--info', theme.colors.info);
  
  // Apply UI colors
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card', theme.colors.card);
  root.style.setProperty('--card-foreground', theme.colors.cardForeground);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--muted-foreground', theme.colors.mutedForeground);
  
  // Apply border radius
  root.style.setProperty('--radius', `${theme.radius * 0.5}rem`);
  
  // Update theme.json via an API call (simulated)
  // In a real implementation, you would send this to your backend
  console.log('Theme would be saved server-side:', {
    variant: theme.variant,
    primary: theme.primary,
    appearance: theme.appearance,
    radius: theme.radius
  });
  
  // Apply font styles by injecting a style tag
  let styleTag = document.getElementById('theme-fonts');
  
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'theme-fonts';
    document.head.appendChild(styleTag);
  }
  
  styleTag.innerHTML = `
    h1, h2, h3, h4, h5, h6 { font-family: ${theme.fonts.heading}, sans-serif !important; }
    body, p, div, span, button, input, select, textarea { font-family: ${theme.fonts.body}, sans-serif !important; }
  `;
  
  // Apply dark/light mode
  if (theme.appearance === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme.appearance === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (theme.appearance === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Initialize theme when application loads
export function initializeTheme(): void {
  const theme = loadTheme();
  applyTheme(theme);
  
  // Set up listener for system theme changes if using system preference
  if (theme.appearance === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }
}

// Export font options for select dropdown
export const fontOptions = [
  'Monoton',
  'Averia Sans Libre',
  'Montserrat',
  'Arial',
  'Verdana',
  'Helvetica',
  'Times New Roman',
  'Georgia', 
  'Courier New',
  'Impact',
  'Open Sans',
  'Roboto',
  'Lato',
  'Source Sans Pro'
];