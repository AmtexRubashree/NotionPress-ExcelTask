import { useState } from 'react'
import './App.css'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExcelReader from './Pages/BooksData/ExcelReader';

const theme = createTheme({
  typography: {
    fontFamily: "'Baloo2'",
  },
});

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<ExcelReader />} />
    </Routes>
  );
};

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
