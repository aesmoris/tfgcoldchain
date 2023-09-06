import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function CrearAcuerdoTransFab({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const isFabricante = role === 'fabricante';

  // Estados para el acuerdo con el transportista
  const [acuerdoFabVentaIds, setAcuerdoFabVentaIds] = useState([]);
  const [transportistaAddress, setTransportistaAddress] = useState('');
  const [montoTransportista, setMontoTransportista] = useState('');

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToWeb3();
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
      await contract.methods
        .crearAcuerdoTransportista(acuerdoFabVentaIds, transportistaAddress, montoTransportista)
        .send({ from: account });
        
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "AcuerdoTransFab creado correctamente",
        });
      setLoading(false);

      // Limpiar los campos después de enviar el acuerdo
      setAcuerdoFabVentaIds([]);
      setTransportistaAddress('');
      setMontoTransportista('');
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para mas información",
      });
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa los datos</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {isFabricante && (
        <div>
          <label>
            ID(s) de los acuerdosFabVenta (separados por coma):
            <input type="text" value={acuerdoFabVentaIds} onChange={(e) => setAcuerdoFabVentaIds(e.target.value.split(','))} style={{ width: '70%' }}/>
          </label>
          <br />
          <label>
            Direccion ETH del transportista:
            <input type="text" value={transportistaAddress} onChange={(e) => setTransportistaAddress(e.target.value)} style={{ width: '70%' }}/>
          </label>
          <br />
          <label>
            Monto (Wei) del acuerdo con el transportista:
            <input type="number" value={montoTransportista} onChange={(e) => setMontoTransportista(e.target.value)} style={{ width: '70%' }}/>
          </label>
          <br />
          <br />
          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            Crear acuerdo con transportista
          </button>
        </div>
      )}
    </div>
  );
}

export default CrearAcuerdoTransFab;
