import Web3 from 'web3';
import CreacionCadenaContract from '../Json/CreacionCadena.json';
import GestionCadenaContract from '../Json/GestionCadena.json';
import FinCadenaContract from '../Json/FinCadena.json';

// Aqui es donde se cambia la URL del server
export const SERVER_URL = 'http://192.168.1.140/data';

export const connectToWeb3 = async () => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const contractABI = CreacionCadenaContract.abi;
      const contractAddress = CreacionCadenaContract.networks[5777].address;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log('Connected to Web3 and contract');
      console.log(contractAddress);
      return { web3, contract, account: accounts[0] };
    } catch (error) {
      console.error('Error connecting to Web3:', error);
      return null;
    }
  } else {
    console.error('Metamask not found');
    return null;
  }
};

export const connectToGestionCadena = async () => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const contractABI = GestionCadenaContract.abi;
      const contractAddress = GestionCadenaContract.networks[5777].address;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log('Connected to GestionCadena and contract');
      return { web3, contract, account: accounts[0] };
    } catch (error) {
      console.error('Error connecting to GestionCadena:', error);
      return null;
    }
  } else {
    console.error('Metamask not found');
    return null;
  }
};

export const connectToFinCadena = async () => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const contractABI = FinCadenaContract.abi;
      const contractAddress = FinCadenaContract.networks[5777].address;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log('Connected to FinCadena and contract');
      return { web3, contract, account: accounts[0] };
    } catch (error) {
      console.error('Error connecting to FinCadena:', error);
      return null;
    }
  } else {
    console.error('Metamask not found');
    return null;
  }
};


export const getEstadoProductoText = (estado) => {
  switch (estado) {
    case 0:
      return 'Fabricado';
    case 1:
      return 'Recibido por Transportista';
    case 2:
      return 'Recibido por Punto de Venta';
    case 3:
      return 'Descartado';
    default:
      return 'Desconocido';
  }
};
