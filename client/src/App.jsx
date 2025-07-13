import React, { useState } from 'react';
import './App.css';
import Button from './components/Button';
import LoginForm from './components/LoginForm';
import PostCard from './components/PostCard';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (formData) => {
    console.log('Login attempt:', formData);
    // In a real app, this would make an API call
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  const mockPost = {
    _id: '1',
    title: 'Welcome to MERN Testing App',
    content: 'This is a comprehensive testing and debugging application built with the MERN stack. It includes unit tests, integration tests, and end-to-end tests to ensure high code quality and reliability.',
    excerpt: 'This is a comprehensive testing and debugging application built with the MERN stack.',
    author: {
      username: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    category: {
      name: 'Technology'
    },
    publishedAt: new Date().toISOString(),
    readTime: 3,
    views: 150,
    likeCount: 25,
    commentCount: 8,
    tags: ['mern', 'testing', 'react', 'nodejs'],
    status: 'published'
  };

  const renderHome = () => (
    <div className="home">
      <h1>Welcome to MERN Testing Application</h1>
      <p>This is a comprehensive testing and debugging assignment for MERN stack applications.</p>
      
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>✅ Unit Testing with Jest and React Testing Library</li>
          <li>✅ Integration Testing with Supertest</li>
          <li>✅ End-to-End Testing with Cypress</li>
          <li>✅ Comprehensive Error Handling</li>
          <li>✅ Debugging Tools and Monitoring</li>
        </ul>
      </div>

      <div className="actions">
        {!isLoggedIn ? (
          <Button onClick={() => setCurrentView('login')} variant="primary">
            Login
          </Button>
        ) : (
          <Button onClick={() => setCurrentView('dashboard')} variant="primary">
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="login-page">
      <Button onClick={() => setCurrentView('home')} variant="secondary" size="sm">
        ← Back to Home
      </Button>
      <LoginForm onLogin={handleLogin} />
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <Button onClick={handleLogout} variant="danger" size="sm">
          Logout
        </Button>
      </div>
      
      <div className="content">
        <h2>Sample Post</h2>
        <PostCard 
          post={mockPost}
          onLike={(id) => console.log('Liked post:', id)}
          onView={(id) => console.log('View post:', id)}
          onEdit={(id) => console.log('Edit post:', id)}
          onDelete={(id) => console.log('Delete post:', id)}
          isAuthor={true}
        />
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentView === 'home' && renderHome()}
      {currentView === 'login' && renderLogin()}
      {currentView === 'dashboard' && renderDashboard()}
    </div>
  );
}

export default App; 