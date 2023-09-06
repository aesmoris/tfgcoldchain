import React, { useState, useEffect } from 'react';
import { SERVER_URL, connectToGestionCadena, connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function Actualizar2({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [intervalRef, setIntervalRef] = useState(null); // Utilizar intervalRef para guardar el intervalo

  useEffect(() => {
    handleConnectToWeb3();
    return cleanup; // Cleanup cuando el componente se desmonte
  }, []);

  useEffect(() => {
    if (web3 && contract && acuerdoId !== '') {
      if (isListening) {
        startListeningToTemperatureUpdates();
      } else {
        stopListeningToTemperatureUpdates();
      }
    }
  }, [web3, contract, acuerdoId, isListening]);

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToGestionCadena();
    if (web3Data) {
      setWeb3(web3Data.web3);
      setContract(web3Data.contract);
      setAccount(web3Data.account);
    }
  };

  const startListeningToTemperatureUpdates = () => {
    // Detener el intervalo actual si existe
    if (intervalRef) {
      clearInterval(intervalRef);
    }

    // Start listening to temperature updates every 30 seconds
    const interval = setInterval(() => {
      fetchTemperature();
    }, 30000); // 30 seconds interval

    setIsListening(true);
    setIntervalRef(interval); // Almacenar el intervalo completo en el estado
  };

  const stopListeningToTemperatureUpdates = () => {
    // Detener el intervalo si está activo
    if (intervalRef) {
      clearInterval(intervalRef);
    }
    setIsListening(false);
  };

  const fetchTemperature = async () => {
    try {
        const response = await fetch(SERVER_URL);
        const data = await response.json();
        const web3DataCreacion = await connectToWeb3();
        console.log(web3DataCreacion);
        const acuerdo = await web3DataCreacion.contract.methods.getAcuerdo(acuerdoId).call({ from: account });
        console.log(data.temperature);
        console.log(acuerdo.temperaturaMaxima);
        console.log(acuerdo.temperaturaMinima);
        console.log("despues de temperaturas");
      if (data && data.temperature && (data.temperature > acuerdo.temperaturaMaxima || data.temperature < acuerdo.temperaturaMinima)) {  
        actualizarYChequearTemperatura(data.temperature);
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: `AcuerdoFabVenta ${acuerdoId} actualizado con temperatura ${data.temperature}, se han descartado los productos 
            por exceder los valores estipulados (Minima: ${acuerdo.temperaturaMinima} Maxima: ${acuerdo.temperaturaMaxima})`,
        });
        //Dejamos de seguir trackeando las temperaturas
        setIsListening(false);
      } else {
        console.log("temperatura dentro de la permitida");
      }
      
    } catch (error) {
      console.error('Error fetching temperature:', error);
    }
  };

  const actualizarYChequearTemperatura = async (temp) => {
    try {
      setLoading(true);
      await contract.methods.actualizarYChequearTemperaturaTodos(parseInt(acuerdoId), parseInt(temp)).send({ from: account });
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

  const cleanup = () => {
    // Detener el intervalo si está activo cuando el componente se desmonte
    if (intervalRef) {
      clearInterval(intervalRef);
    }
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa los datos</h3>
      <h5>*Recuerda que los productos que ya han sido descartados no actualizarán su temperatura</h5>
      <button
        onClick={isListening ? stopListeningToTemperatureUpdates : startListeningToTemperatureUpdates}
        disabled={!web3 || !contract || !acuerdoId || loading}
      >
        {isListening ? 'Detener actualización de temperatura' : 'Iniciar actualización de temperatura'}
      </button>
      <br />
      <label>
        Acuerdo ID:
        <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} style={{ width: '90%' }} />
      </label>
      <br />

      {loading && <p>Actualizando temperatura...</p>}
    </div>
  );
}

export default Actualizar2;
