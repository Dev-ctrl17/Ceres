/**
 * App.jsx
 * -------
 * React Router setup. The `/register` route (with optional `?ref=CODE`)
 * renders the consultant registration page.
 */

import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RegisterPage />} />
    </Routes>
  );
}