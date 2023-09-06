import React, { useState } from 'react';
import { connectToGestionCadena } from '../../Hooks/utils.js'; // Importa la función connectToGestionCadena desde el archivo utils.js
import Swal from 'sweetalert2';

function ActualizarTemperaturaTodos({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');
  const [ultimaTemp, setUltimaTemp] = useState('');

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
      contract.events.TemperaturaActualizadaYChequeada()
        .on('data', (event) => {
          const idAcuerdo = event.returnValues.acuerdoId;
          const temp = event.returnValues.ultimaTemperatura;
          const estadoCorrecto = event.returnValues.temperaturaCorrecta;

          if (estadoCorrecto){
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: `AcuerdoFabVenta ${idAcuerdo} actualizado con temperatura ${temp} correctamente`,
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: `AcuerdoFabVenta ${idAcuerdo} actualizado con temperatura ${temp}, se han descartado los productos 
              por exceder los valores estipulados`,
            });
          }
          
        });

      await contract.methods.actualizarYChequearTemperaturaTodos(parseInt(acuerdoId), parseInt(ultimaTemp)).send({ from: account });
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
      <h5>*Recuerda que los productos que ya han sido descartados no actualizarán su temperatura</h5>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      <br />
      <label>
        Acuerdo ID:
        <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} style={{ width: '90%' }} />
      </label>
      <br />
      <label>
        Última temperatura:
        <input type="text" value={ultimaTemp} onChange={(e) => setUltimaTemp(e.target.value)} style={{ width: '90%' }} />
      </label>

      <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
        Actualizar temperatura
      </button>
    </div>
  );
}

export default ActualizarTemperaturaTodos;