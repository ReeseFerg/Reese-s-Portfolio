import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

import './styles/tokens.css';
import './styles/base.css';
import './styles/terminal.css';
import './styles/views.css';
import './styles/case.css';
import './styles/dev.css';
// Last, so its overrides still win exactly as they did in the single-file build.
import './styles/responsive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
