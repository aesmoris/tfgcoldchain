import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function GetAcuerdoTransFab({ role }) {
  // State variables
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const [acuerdoTransFabId, setAcuerdoTransFabId] = useState('');
  const [acuerdoTransFabData, setAcuerdoTransFabData] = useState(null);

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToWeb3();
    if (web3Data) {
      setWeb3(web3Data.web3);
      setContract(web3Data.contract);
      setAccount(web3Data.account);
    }
  };

  // Funcion para manejar el clic del boton que obteniene los detalles del acuerdo
  const handleButtonClick = async () => {
    try {
      if (!web3 || !contract) {
        console.error('Web3 or contract not initialized');
        return;
      }

      setLoading(true);
      const acuerdoTransFab = await contract.methods.getAcuerdoTransFab(acuerdoTransFabId).call({ from: account });

      // Chequeo si es el fabricante o transportista
      const isAuthorized =
        account.toLowerCase() === acuerdoTransFab.fabricante.toLowerCase() || account.toLowerCase() === acuerdoTransFab.transportista.toLowerCase();

      if (isAuthorized) {
        console.log('AcuerdoTransFab:', acuerdoTransFab);
        setAcuerdoTransFabData(acuerdoTransFab);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Usted no posee permisos para ver ese acuerdo",
        });
        console.error('Unauthorized: Only the fabricante or transportista can view the agreement details.');
      }

      setLoading(false);
      // Limpiar los campos después de enviar el acuerdoTransFab
      setAcuerdoTransFabId('');
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para más información. Probablemente ha ingresado un ID de acuerdo inexistente",
      });
      console.error('Error calling contract function:', error);
    }
  };

  // Componente para mostrar los detalles
  const AcuerdoTransFabDetails = ({ acuerdoTransFabData }) => {
    return (
      <div>
        <h3>Detalles del acuerdoTransFab:</h3>
        <p>ID: {parseInt(acuerdoTransFabData.acuerdoTransFabId)}</p>
        <p>Monto (Wei): {parseInt(acuerdoTransFabData.monto)}</p>
        <p>Fabricante: {acuerdoTransFabData.fabricante}</p>
        <p>Transportista: {acuerdoTransFabData.transportista}</p>
        <p>IDs de los acuerdosFabVenta asociados:</p>
        <ul>
          {acuerdoTransFabData.acuerdoFabVentaId.map((acuerdoId) => (
            <li key={acuerdoId}>{parseInt(acuerdoId)}</li>
          ))}
        </ul>
        <p>Firmado por fabricante: {acuerdoTransFabData.firmadoFabricante.toString()}</p>
        <p>Firmado por transportista: {acuerdoTransFabData.firmadoTransportista.toString()}</p>
      </div>
    );
  };

  const [showContent, setShowContent] = useState(false);

  const handleToggleContent = () => {
    setShowContent(!showContent);
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa el ID del acuerdoTransFab</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {(
        <div>
          <label>
            ID del acuerdoTransFab:
            <input type="text" value={acuerdoTransFabId} onChange={(e) => setAcuerdoTransFabId(e.target.value)} />
          </label>
          <br />

          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            Ver acuerdoTransFab
          </button>

          {/* Display */}
          {acuerdoTransFabData && (
            <div>
              {/* Visibilidad */}
              <button onClick={handleToggleContent}>
                {showContent ? 'Ocultar Detalles' : 'Mostrar Detalles'}
              </button>

              {/* Display acuerdoTransFab */}
              {showContent && <AcuerdoTransFabDetails acuerdoTransFabData={acuerdoTransFabData} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GetAcuerdoTransFab;
