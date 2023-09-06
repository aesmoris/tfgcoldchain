import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';

function SaberAcuerdosTransFab({ role }) {
  const [loading, setLoading] = useState(false);
  const [acuerdos, setAcuerdos] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [obtainedAcuerdos, setObtainedAcuerdos] = useState(false); // Variable de estado para controlar si se obtuvieron los acuerdos

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
      const acuerdosIds = await contract.methods.saberAcuerdosTransFab().call({ from: account });
      setAcuerdos(acuerdosIds);
      setLoading(false);

      // Se obtuvieron los acuerdos
      setObtainedAcuerdos(true);
    } catch (error) {
      setLoading(false);
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Presiona el botón para obtener los IDs de los acuerdos en los que estás involucrado</h3>
      <button onClick={handleConnectToWeb3}>Conectar a Web3</button>
      <br />
      <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
        Obtener Acuerdos
      </button>
      <div>
        {loading && <p>Cargando...</p>}
        {!loading && obtainedAcuerdos && acuerdos.length > 0 && (
          <div>
            <h3>AcuerdosTransFab en los que estás involucrado:</h3>
            <ul>
              {acuerdos.map((acuerdoId) => (
                <li key={acuerdoId}>ID {parseInt(acuerdoId)}</li>
              ))}
            </ul>
          </div>
        )}
        {!loading && obtainedAcuerdos && acuerdos.length === 0 && (
          <p>No tienes ningún acuerdoTransFab asignado</p>
        )}
      </div>
    </div>
  );
}

export default SaberAcuerdosTransFab;
