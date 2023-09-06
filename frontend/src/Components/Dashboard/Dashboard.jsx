import React, { useState } from 'react';
import './css/Dashboard.css';
import CrearAcuerdoFabVenta from './CrearAcuerdoFabVenta';
import GetAcuerdo from './GetAcuerdo';
import FirmarAcuerdoFabVenta from './FirmarAcuerdoFabVenta';
import CrearAcuerdoTransFab from './CrearAcuerdoTransFab';
import GetAcuerdoTransFab from './GetAcuerdoTransFab';
import GetProductosDelAcuerdo from './GetProductosDelAcuerdo';
import SaberAcuerdosFabVenta from './SaberAcuerdosFabVenta';
import SaberAcuerdosTransFab from './SaberAcuerdosTransFab';
import FirmarAcuerdoTransFab from './FirmarAcuerdoTransFab';
import GetProductoDeUnAcuerdo from './GetProductoDeUnAcuerdo';
import CambiarEstadoTodosProductos from './CambiarEstadoTodosProductos';
import ActualizarTemperaturaTodos from './ActualizarTemperaturaTodos';
import DevolverDineroPuntoVenta from './DevolverDineroPuntoVenta';
import ChequearAcuerdoFinalizado from './ChequearAcuerdoFinalizado';
import DevolverDineroFabricante from './DevolverDineroFabricante';
import Actualizar2 from './Actualizar2';


const Dashboard = ({ role, handleDashboardAction }) => {
  const [clickedButton, setClickedButton] = useState(null);
  const [contentPosition, setContentPosition] = useState({ top: 0, left: 0 });

  const isFabricante = role === 'fabricante';
  const isPuntoVenta = role === 'puntoventa';
  const isTransportista = role === 'transportista';

  const handleToggleVisibility = (component, event) => {
    if (clickedButton === component) {
      setClickedButton(null);
    } else {
      setClickedButton(component);
      const rect = event.target.getBoundingClientRect();
      setContentPosition({ top: rect.bottom, left: rect.left });
    }
  };

  return (
    <div>
      <h2>Dashboard {role}</h2>
      <br></br>
      
      <div className='centered'>
        <h4>Gestión de Acuerdos</h4>
      </div>

      <div className="dashboard-container">
        {isFabricante && (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('fabricante', event)}
            >
              Crear acuerdoFabVenta
            </button>
            {clickedButton === 'fabricante' && (
              <div
                className="content-reducido"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <CrearAcuerdoFabVenta role={role} handleDashboardAction={handleDashboardAction} />
              </div>
            )}
          </div>
        )}

        {isFabricante || isPuntoVenta ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('getAcuerdo', event)}
            >
              Ver acuerdoFabVenta
            </button>
            {clickedButton === 'getAcuerdo' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <GetAcuerdo role={role} />
              </div>
            )}
          </div>
        ) : null }

        {isFabricante || isPuntoVenta ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('saberAcuerdosFabVenta', event)}
            >
              Ver acuerdosFabVenta asignados
            </button>
            {clickedButton === 'saberAcuerdosFabVenta' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <SaberAcuerdosFabVenta role={role} />
              </div>
            )}
          </div>
        ) : null }

        {isFabricante || isPuntoVenta ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('firmarAcuerdo', event)}
            >
              Firmar acuerdoFabVenta
            </button>
            {clickedButton === 'firmarAcuerdo' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <FirmarAcuerdoFabVenta role={role} />
              </div>
            )}
          </div>
        ) : null}

        {isFabricante && (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('crearAcuerdoTransFab', event)}
            >
              Crear acuerdo con transportista
            </button>
            {clickedButton === 'crearAcuerdoTransFab' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <CrearAcuerdoTransFab role={role} />
              </div>
            )}
          </div>
        )}

        {isFabricante || isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('getAcuerdoTransFab', event)}
            >
              Ver acuerdoTransFab
            </button>
            {clickedButton === 'getAcuerdoTransFab' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <GetAcuerdoTransFab role={role} />
              </div>
            )}
          </div>
        ) : null}
        
        {isFabricante || isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('saberAcuerdosTransFab', event)}
            >
              Ver acuerdosTransFab asignados
            </button>
            {clickedButton === 'saberAcuerdosTransFab' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <SaberAcuerdosTransFab role={role} />
              </div>
            )}
          </div>
        ) : null }

        {isFabricante || isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('firmarAcuerdoTransFab', event)}
            >
              Firmar acuerdoTransFab
            </button>
            {clickedButton === 'firmarAcuerdoTransFab' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <FirmarAcuerdoTransFab role={role} />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className='centered'>
        <h4>Gestión de Productos</h4>
      </div>

      <div className="dashboard-container">
        <div>
          <button
            className="toggle-button"
            onClick={(event) => handleToggleVisibility('getProductosDelAcuerdo', event)}
          >
            Ver productos del acuerdo
          </button>
          {clickedButton === 'getProductosDelAcuerdo' && (
            <div
              className="content"
              //style={{ top: contentPosition.top, left: contentPosition.left }}
            >
              <GetProductosDelAcuerdo role={role} />
            </div>
          )}
        </div>

        <div>
          <button
            className="toggle-button"
            onClick={(event) => handleToggleVisibility('getProductoDeUnAcuerdo', event)}
          >
            Ver producto de un acuerdo
          </button>
          {clickedButton === 'getProductoDeUnAcuerdo' && (
            <div
              className="content"
              //style={{ top: contentPosition.top, left: contentPosition.left }}
            >
              <GetProductoDeUnAcuerdo role={role} />
            </div>
          )}
        </div>
        
        {isPuntoVenta || isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('cambiarEstadoTodosProductos', event)}
            >
              Confirmar recepción de los productos
            </button>
            {clickedButton === 'cambiarEstadoTodosProductos' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <CambiarEstadoTodosProductos role={role} />
              </div>
            )}
          </div>
        ) : null }

        {isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('actualizarTemperaturaTodos', event)}
            >
              Actualizar temperatura de los productos
            </button>
            {clickedButton === 'actualizarTemperaturaTodos' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <ActualizarTemperaturaTodos role={role} />
              </div>
            )}
          </div>
        ) : null }
        
        {isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('actualizar2', event)}
            >
              Iniciar seguimiento de la cadena de frio
            </button>
            {clickedButton === 'actualizar2' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <Actualizar2 role={role} />
              </div>
            )}
          </div>
        ) : null }
      </div>

      <div className='centered'>
        <h4>Gestión de finalización de acuerdos</h4>
      </div>
      <div className="dashboard-container">
        <div>
          <button
            className="toggle-button"
            onClick={(event) => handleToggleVisibility('chequearAcuerdoFinalizado', event)}
          >
            Chequear finalización de acuerdoFabVenta
          </button>
          {clickedButton === 'chequearAcuerdoFinalizado' && (
            <div
              className="content"
              //style={{ top: contentPosition.top, left: contentPosition.left }}
            >
              <ChequearAcuerdoFinalizado role={role} />
            </div>
          )}
        </div>
        {isFabricante ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('devolverDineroPuntoVenta', event)}
            >
              Indemnizar punto de venta
            </button>
            {clickedButton === 'devolverDineroPuntoVenta' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <DevolverDineroPuntoVenta role={role} />
              </div>
            )}
          </div>
        ) : null }

        {isTransportista ? (
          <div>
            <button
              className="toggle-button"
              onClick={(event) => handleToggleVisibility('devolverDineroFabricante', event)}
            >
              Indemnizar fabricante
            </button>
            {clickedButton === 'devolverDineroFabricante' && (
              <div
                className="content"
                //style={{ top: contentPosition.top, left: contentPosition.left }}
              >
                <DevolverDineroFabricante role={role} />
              </div>
            )}
          </div>
        ) : null }
      </div>
    </div>
  );
};

export default Dashboard;
