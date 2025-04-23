import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store/index.ts'
import { CheckCircleOutline, Error, Info, Warning } from '@mui/icons-material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right" 
        richColors 
        duration={3000} 
        icons={{
          success: <CheckCircleOutline />,
          info: <Info />,
          warning: <Warning />,
          error: <Error />,
        }}
      />
    </Provider>
  </StrictMode>,
)
