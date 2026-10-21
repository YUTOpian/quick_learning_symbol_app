import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Sokushu from './pages/sokushu/Sokushu'

// Symbol のロゴの配色に合わせた夜のテーマ（ロゴの盾のパープルを軸に、ティール・ブルー・オレンジをアクセントにする）。
const theme = createTheme({
  spacing: 10,
  palette: {
    mode: 'dark',
    primary: { main: '#8c30e4', light: '#c9a0ff', dark: '#6c00dc', contrastText: '#ffffff' },
    secondary: { main: '#1cb4ac' },
    success: { main: '#1cb4ac' },
    warning: { main: '#f4a800' },
    info: { main: '#78b4e0' },
    error: { main: '#ff8a96' },
    background: { default: '#14002f', paper: '#22004d' },
    text: { primary: '#f6f0ff', secondary: '#c9b8ea' },
    divider: 'rgba(181,131,242,0.32)',
    action: { hover: 'rgba(181,131,242,0.14)' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", Meiryo, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { a: { color: '#78b4e0' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    // 塗りのボタン・チップは、ロゴの盾の濃いほうのパープルにして白文字を読みやすくする。
    MuiButton: { styleOverrides: { root: ({ ownerState }) => (ownerState.variant === 'contained' && ownerState.color === 'primary' ? { backgroundColor: '#6c00dc', color: '#fff', '&:hover': { backgroundColor: '#8c30e4' } } : ownerState.variant === 'text' && ownerState.color === 'primary' ? { color: '#c9a0ff' } : {}) } },
    MuiChip: { styleOverrides: { root: ({ ownerState }) => (ownerState.variant === 'filled' && ownerState.color === 'primary' ? { backgroundColor: '#6c00dc', color: '#fff' } : ownerState.variant === 'outlined' && ownerState.color === 'primary' ? { color: '#c9a0ff', borderColor: 'rgba(181,131,242,0.6)' } : {}) } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(181,131,242,0.32)' },
        head: { backgroundColor: '#6c00dc', color: '#fff', fontWeight: 700 },
      },
    },
    // お知らせ枠は、ロゴのアクセント3色（ティール・ブルー・オレンジ）と赤を、暗いパープルの地に合わせた淡い面にする。
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => {
          const t = {
            info: ['rgba(120,180,224,0.14)', '#d3e9f9', '#78b4e0'],
            success: ['rgba(28,180,172,0.16)', '#c8f6f2', '#1cb4ac'],
            warning: ['rgba(244,168,0,0.14)', '#ffe4a6', '#f4a800'],
            error: ['rgba(255,138,150,0.14)', '#ffd3d8', '#ff8a96'],
          }[ownerState.severity ?? 'success'];
          return { borderLeft: `5px solid ${t[2]}`, alignItems: 'center', backgroundColor: t[0], color: t[1], '& .MuiAlert-icon': { color: t[2] } };
        },
      },
    },
    MuiAccordion: { styleOverrides: { root: { backgroundColor: 'rgba(255,255,255,0.03)', '&:before': { display: 'none' } } } },
    MuiAccordionSummary: { styleOverrides: { root: { backgroundColor: 'rgba(108,0,220,0.24)' } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 700 } } },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Sokushu />
    </ThemeProvider>
  </StrictMode>,
)
