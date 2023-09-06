import React, { useState } from 'react';
import './LoginForm.css'

const LoginForm = ({ handleLogin }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginResult = handleLogin(user, password);
    if (loginResult === 'error') {
      setError('Usuario o contraseña incorrecto');
    } else {
      setError('');
    }
  };

  return (
    <div className='login-container'>
      <h2>Inicio de sesión</h2>
      {error && <p className='error-message'>{error}</p>}
      <form className='loginform' onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='button' type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
