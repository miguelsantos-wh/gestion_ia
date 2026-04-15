import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { EvaluationProvider } from './context/EvaluationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EvaluationProvider>
      <App />
    </EvaluationProvider>
  </StrictMode>
);
