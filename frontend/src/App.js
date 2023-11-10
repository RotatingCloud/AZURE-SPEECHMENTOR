import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Word from './pages/Word';
import './styles/Base.css';

import Navbar from './components/Navbar/Navbar';
import Sentence from './pages/Sentence';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/word" element={<Word />} />
        <Route path="/sentence" element={<Sentence/>}></Route>
        <Route path="/" element={<Navigate to="/word" />} />
      </Routes>
    </Router>
  );
}

export default App;

