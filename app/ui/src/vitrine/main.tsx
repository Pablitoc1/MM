// Page à part, seulement en développement : `just dev-web` puis /vitrine.html.
// Elle n'est pas dans l'application livrée.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '../styles/tokens.css';
import { Vitrine } from './Vitrine';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Vitrine />
  </StrictMode>,
);
