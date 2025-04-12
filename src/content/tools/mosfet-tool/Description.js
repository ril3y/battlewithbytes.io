import React from 'react';
import MathJax from 'react-mathjax2';
import './css/description.css';

function Description({ description, conducting, voltageAcrossLoad, powerDissipated, currentThroughLoad, vgs, id, vd }) {
  return (
    <MathJax.Context input="tex">
      <div className="description-container">
        <div id="output" className={conducting === null ? '' : conducting ? 'green' : 'red'}>
          {conducting !== null && (conducting ? 'The MOSFET is conducting.' : 'The MOSFET is not conducting.')}
        </div>
        <div className="description-content">
          <div className="description-table">
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Symbol</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Voltage Across Load</td>
                    <td>V<sub>load</sub></td>
                    <td>{voltageAcrossLoad !== '' ? voltageAcrossLoad : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Power Dissipated</td>
                    <td>P</td>
                    <td>{powerDissipated !== '' ? powerDissipated : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Current Through Load</td>
                    <td>I<sub>load</sub></td>
                    <td>{currentThroughLoad !== '' ? currentThroughLoad : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Gate-Source Voltage</td>
                    <td>V<sub>gs</sub></td>
                    <td>{vgs !== '' ? vgs : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Drain Current</td>
                    <td>I<sub>d</sub></td>
                    <td>{id !== '' ? id : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Drain Voltage</td>
                    <td>V<sub>d</sub></td>
                    <td>{vd !== '' ? vd : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="description-text">
            <MathJax.Text text={description !== '' ? description : 'No calculations yet. Enter values and check conduction.'} />
          </div>
        </div>
      </div>
    </MathJax.Context>
  );
}

export default Description;
