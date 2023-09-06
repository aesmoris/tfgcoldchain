import React, { useState } from 'react';
import { connectToFinCadena } from '../../Hooks/utils.js'; // Importa la función connectToGestionCadena desde el archivo utils.js
import Swal from 'sweetalert2';

function DevolverDineroPuntoVenta({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToFinCadena(); // Utiliza la función connectToFinCadena para conectar con FinCadena y obtener web3 y contract
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

      const indemnizacion = await contract.methods.indemnizacion(parseInt(acuerdoId)).call();
      console.log(indemnizacion);

      await contract.methods
        .devolverDineroPuntoVenta(parseInt(acuerdoId))
        .send({ from: account, value: indemnizacion });

      setLoading(false);
      setAcuerdoId('');
    } catch (error) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Consulte la consola para más información",
        });
        console.error('Error calling contract function:', error);
      }
    };

    return (
        <div>
          <h3>Conecta tu wallet e ingresa el ID del acuerdo a indemnizar</h3>
          <button onClick={handleConnectToWeb3}>Connect to Web3</button>
            <div>
              <br></br>
              <label>
                ID del acuerdo a indemnizar:
                <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
              </label>
              <br />
              <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
                Indemnizar al punto de venta
              </button>
            </div>
        </div>
      );

}

export default DevolverDineroPuntoVenta;