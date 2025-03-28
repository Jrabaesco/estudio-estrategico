import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
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

const App = () => {
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
    <Router>
      <div>
        {isAuthenticated && <Navbar logout={logout} />}
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" render={(props) => <Login {...props} authenticate={authenticate} />} />
          {isAuthenticated ? (
            <>
              <Route exact path="/dashboard" render={(props) => <Dashboard {...props} user={user} />} />
              <Route exact path="/ballot" render={(props) => <Ballot {...props} user={user} />} />
              <Route exact path="/topic/:id" render={(props) => <TopicDetail {...props} user={user} />} />
              <Route exact path="/exam-generator" render={(props) => <ExamGenerator {...props} user={user} />} />
              <Route exact path="/exam-by-topic/:topicId/:questionCount" render={(props) => <ExamByTopic {...props} user={user} />} />
              <Route exact path="/general-exam" render={(props) => <GeneralExam {...props} user={user} />} />
              <Route exact path="/examen-general" render={(props) => <ExamenGeneral {...props} user={user} />} />
              <Route exact path="/correct-errors" render={(props) => <CorrectErrors {...props} user={user} />} />
              <Route exact path="/results" component={Results} />
            </>
          ) : (
            <Redirect to="/login" />
          )}
        </Switch>
      </div>
    </Router>
  );
};

export default App;
