import Web3 from 'web3';

export const handleLogin = (username, password, setRole, setLoggedIn) => {
  const roles = {
    transportista: '1234',
    puntoventa: '5678',
    fabricante: 'fab1234'
  };

  if (password === roles[username]) {
    setRole(username);
    setLoggedIn(true);
    return 'success';
  } else {
    setRole('');
    return 'error';
  }
};


export const handleLogout = (setLoggedIn, setRole) => {
  setLoggedIn(false);
  setRole('');
};

export const handleConnectWallet = async () => {
  if (window.ethereum) {
    try {
      // Solicitar permiso para acceder a la cuenta del usuario
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Crear una instancia de Web3 usando la cuenta del usuario
      const web3 = new Web3(window.ethereum);
      console.log('Connected with address:', accounts[0]);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  } else {
    console.error('Metamask not found');
  }
};

export const handleDashboardAction = (role) => {
  // Realiza acciones específicas según el rol
  switch (role) {
    case 'transportista':
      console.log('Acciones para el rol de transportista');
      break;
    case 'punto de venta':
      console.log('Acciones para el rol de punto de venta');
      break;
    case 'fabricante':
      console.log('Acciones para el rol de fabricante');
      break;
    default:
      console.log('Acciones para otros roles');
      break;
  }
};
