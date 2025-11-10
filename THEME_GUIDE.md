# Theme System Guide

## Overview

The Agent Protocols System includes a comprehensive light/dark theme toggle that transforms the entire interface. The dark theme is inspired by futuristic network visualizations with a cyber aesthetic featuring electric blues, cyans, and orange accents.

## Features

### Light Mode (Default)
- Clean, professional interface
- Standard slate color palette
- High contrast for daylight viewing
- Traditional design suitable for all environments
- Colors: whites, grays, blues, greens

### Dark Mode (Cyber Theme)
- Deep navy backgrounds (#0a0e1a, #0f172a)
- Electric blue accents (#00d4ff)
- Cyan highlights (#00ffff)
- Orange/amber accents (#ff9500)
- Reduced eye strain in low-light conditions
- Futuristic, network-inspired aesthetic
- Smooth transitions between states

## Color Palette

### Dark Mode Colors

**Backgrounds:**
- `dark-bg`: #0a0e1a (Main background)
- `dark-surface`: #0f172a (Cards, panels)
- `dark-hover`: #1e293b (Hover states)

**Borders:**
- `dark-border`: #1e293b (Subtle borders)

**Text:**
- `dark-text`: #e2e8f0 (Primary text)
- `dark-muted`: #94a3b8 (Secondary text)

**Accents:**
- `cyber-blue`: #00d4ff (Primary actions)
- `cyber-cyan`: #00ffff (Highlights)
- `cyber-orange`: #ff9500 (Warnings, special)
- `cyber-blue-glow`: #0099cc (Hover effects)

## Implementation

### How It Works

1. **Context Provider** (`ThemeContext.tsx`)
   - React Context for global theme state
   - Persists preference to localStorage
   - Manages dark class on document root

2. **Tailwind Configuration**
   - `darkMode: 'class'` enabled
   - Custom color palette defined
   - Dark variants for all components

3. **Component Styling**
   - All components support both themes
   - Uses Tailwind's `dark:` prefix
   - Smooth color transitions with `transition-colors`

### Usage in Components

```tsx
// Basic example
<div className="bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text">
  Content
</div>

// With transitions
<button className="bg-slate-900 dark:bg-cyber-blue hover:bg-slate-800 dark:hover:bg-cyber-blue-glow transition-colors">
  Click me
</button>
```

## Toggle Location

The theme toggle is located in the **Settings panel**:
1. Click "Settings" in the sidebar
2. See "Appearance" section at the top
3. Click the toggle switch
4. Theme applies immediately across all views

## Toggle UI

- **Visual Indicator**: Moon icon (dark mode) or Sun icon (light mode)
- **Switch Design**: Modern toggle with smooth animation
- **Feedback**: Instant visual change throughout interface
- **State Persistence**: Preference saved to localStorage
- **Default**: Light mode for new users

## Technical Details

### LocalStorage Key
```javascript
localStorage.getItem('theme') // 'light' or 'dark'
```

### CSS Classes
```javascript
// Dark mode active
document.documentElement.classList.contains('dark') // true

// Light mode active
document.documentElement.classList.contains('dark') // false
```

### Context Hook
```typescript
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Supported Components

All major components support dark mode:

✅ **Layout:**
- Dashboard background
- Header
- Sidebar navigation
- Main content area

✅ **Protocol Panels:**
- HCP (Human Context Protocol)
- BCP (Business Context Protocol)
- MCP (Machine Context Protocol)
- DCP (Data Context Protocol)
- TCP (Test Context Protocol)

✅ **Settings:**
- Theme toggle
- API configuration forms
- Input fields
- Buttons
- Status indicators

✅ **UI Elements:**
- Cards and panels
- Borders
- Buttons and links
- Form inputs
- Loading states
- Success/error messages
- Protocol cards
- Validation feedback

## Design Philosophy

### Light Mode
- **Professional**: Clean, corporate aesthetic
- **Familiar**: Traditional light interface users expect
- **Accessible**: High contrast, easy to read
- **Universal**: Works in any lighting condition

### Dark Mode
- **Futuristic**: Cyber-inspired network aesthetic
- **Focused**: Reduces visual clutter
- **Comfortable**: Easy on eyes in dim lighting
- **Modern**: Trendy, tech-forward appearance
- **Distinctive**: Unique visual identity

### Color Meaning
- **Blue/Cyan**: Technology, trust, primary actions
- **Orange**: Energy, highlights, important items
- **Navy**: Depth, sophistication, professionalism
- **Green**: Success, positive states
- **Red**: Alerts, critical items
- **Purple**: Creative, ML/AI elements

## Best Practices

### For Developers

1. **Always use both variants:**
   ```tsx
   className="bg-white dark:bg-dark-surface"
   ```

2. **Add transitions:**
   ```tsx
   className="... transition-colors"
   ```

3. **Test both modes:**
   - Check readability
   - Verify contrast ratios
   - Ensure all states are visible

4. **Use semantic colors:**
   - Don't hardcode hex values
   - Use Tailwind's custom colors
   - Maintain consistency

5. **Consider context:**
   - Success: green
   - Error: red
   - Warning: orange
   - Info: blue/cyan

### For Users

1. **Choose based on environment:**
   - Bright room → Light mode
   - Dim room → Dark mode
   - Personal preference → Either!

2. **Reduce eye strain:**
   - Dark mode for extended sessions
   - Light mode for quick tasks

3. **Match system preference:**
   - Many users prefer consistency
   - Consider matching OS theme

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ All modern browsers with CSS custom properties support

## Accessibility

- ✅ WCAG AA contrast ratios maintained
- ✅ Focus indicators visible in both modes
- ✅ Color not sole means of conveying information
- ✅ Keyboard navigation works identically
- ✅ Screen reader compatible

## Future Enhancements

Potential future additions:
1. **Auto mode**: Detect system preference
2. **Scheduled switching**: Auto-switch at sunset/sunrise
3. **Multiple themes**: Additional color schemes
4. **High contrast mode**: Extra accessibility option
5. **Color customization**: User-defined accent colors
6. **Theme presets**: Pre-made themes (Matrix, Neon, etc.)

## Troubleshooting

### Theme not applying
1. Check localStorage: `localStorage.getItem('theme')`
2. Verify dark class: `document.documentElement.classList`
3. Clear cache and reload
4. Check browser console for errors

### Colors look wrong
1. Ensure Tailwind config is loaded
2. Verify custom colors defined
3. Check for CSS conflicts
4. Rebuild project (`npm run build`)

### Toggle not working
1. Verify ThemeProvider wraps app
2. Check useTheme hook is imported
3. Ensure React Context is available
4. Check browser console for errors

## Examples

### Dark Mode Screenshots
- Dashboard with cyber blue accents
- Protocol panels with navy backgrounds
- Settings with neon toggle
- Sidebar with hover effects

### Light Mode Screenshots
- Clean white backgrounds
- Professional appearance
- Traditional navigation
- Standard form elements

---

The theme system provides a polished, professional appearance in light mode and a distinctive, futuristic aesthetic in dark mode, enhancing user experience and reducing eye strain during extended use.
