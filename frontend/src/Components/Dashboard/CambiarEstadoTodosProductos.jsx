import React, { useState } from 'react';
import { connectToGestionCadena } from '../../Hooks/utils.js'; // Importa la función connectToGestionCadena desde el archivo utils.js
import Swal from 'sweetalert2';

function CambiarEstadoTodosProductos({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');
  //const [nuevoEstado, setNuevoEstado] = useState('');

  const isTransportista = role === 'transportista';
  const isPuntoVenta = role === 'puntoventa';
  

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToGestionCadena(); // Utiliza la función connectToGestionCadena para conectar con GestionCadena y obtener web3 y contract
    if (web3Data) {
      setWeb3(web3Data.web3);
      setContract(web3Data.contract);
      setAccount(web3Data.account);
    }
  };

  const handleButtonClick = async () => {
    try {
      if (!web3 || !contract) {
        console.error('Web3 or contract not initialized');
        return;
      }
      setLoading(true);

      if (isTransportista) {
        // Si el usuario es transportista, actualiza el estado al 1 (Recibido por transportista)
        await contract.methods.cambiarEstadoTodosLosProductos(parseInt(acuerdoId), 1).send({ from: account });
      } else if (isPuntoVenta) {
        // Si el usuario es punto de venta, actualiza el estado al 2 (Recibido por punto de venta)
        await contract.methods.cambiarEstadoTodosLosProductos(parseInt(acuerdoId), 2).send({ from: account });
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Estado de todos los productos actualizado correctamente',
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Revise la consola para más información',
      });
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa los datos</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      <br />
      <label>
        Acuerdo ID:
        <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} style={{ width: '90%' }} />
      </label>
      <br />
      
      <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
        Actualizar estado de todos los productos
      </button>
    </div>
  );
}

export default CambiarEstadoTodosProductos;
