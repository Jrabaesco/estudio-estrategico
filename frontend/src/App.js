import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Ballot from './components/Ballot';
import TopicDetail from './components/TopicDetail';
import ExamGenerator from './components/ExamGenerator';
import ExamByTopic from './components/ExamByTopic';
import GeneralExam from './components/GeneralExam';
import ExamenGeneral from './components/ExamenGeneral';
import CorrectErrors from './components/CorrectErrors';
import Navbar from './components/Navbar';
import Results from './components/Results';

// Crear contexto de autenticación
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const authenticate = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <Navbar logout={logout} />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }/>
        
        <Route path="/ballot" element={
          <ProtectedRoute>
            <Ballot />
          </ProtectedRoute>
        }/>
        
        <Route path="/topic/:id" element={
          <ProtectedRoute>
            <TopicDetail />
          </ProtectedRoute>
        }/>
        
        <Route path="/exam-generator" element={
          <ProtectedRoute>
            <ExamGenerator />
          </ProtectedRoute>
        }/>
        
        <Route path="/exam-by-topic/:topicId/:questionCount" element={
          <ProtectedRoute>
            <ExamByTopic />
          </ProtectedRoute>
        }/>
        
        <Route path="/general-exam" element={
          <ProtectedRoute>
            <GeneralExam />
          </ProtectedRoute>
        }/>
        
        <Route path="/examen-general" element={
          <ProtectedRoute>
            <ExamenGeneral />
          </ProtectedRoute>
        }/>
        
        <Route path="/correct-errors" element={
          <ProtectedRoute>
            <CorrectErrors />
          </ProtectedRoute>
        }/>
        
        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        }/>
        
        {/* Redirección por defecto */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }/>
        
        {/* Manejo de rutas no encontradas */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;