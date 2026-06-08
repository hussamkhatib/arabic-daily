import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AppProvider } from './context/AppContext';
import CalendarPage from './pages/CalendarPage';
import DayPage from './pages/DayPage';
import EditorPage from './pages/EditorPage';
import ReviewPage from './pages/ReviewPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="/editor/:sessionId/:imageId" element={<EditorPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
