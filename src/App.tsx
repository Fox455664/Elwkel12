import React, { useEffect } from 'react'; import { BrowserRouter, Routes, Route } from 'react-router-dom'; import { useTranslation } from 'react-i18next';

// pages (عدّل المسارات حسب مشروعك) import Home from './pages/Home'; import Login from './pages/Login'; import Dashboard from './pages/Dashboard';

const App: React.FC = () => { const { i18n } = useTranslation();

useEffect(() => { const dir = i18n.language === 'ar' || i18n.language === 'ur' ? 'rtl' : 'ltr';

document.documentElement.dir = dir;
document.documentElement.lang = i18n.language;

if (i18n.language === 'ur') {
  document.body.style.fontFamily = "'Noto Nastaliq Urdu', serif";
} else if (i18n.language === 'ar') {
  document.body.style.fontFamily = "'Cairo', sans-serif";
} else {
  document.body.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
}

}, [i18n.language]);

return ( <BrowserRouter> <Routes> <Route path="/" element={<Home />} /> <Route path="/login" element={<Login />} /> <Route path="/dashboard" element={<Dashboard />} /> </Routes> </BrowserRouter> ); };

export default App;
