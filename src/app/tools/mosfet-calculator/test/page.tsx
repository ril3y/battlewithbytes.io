'use client';

import React, { useEffect, useState } from 'react';
import { calculateNChannelConduction, calculatePChannelConduction } from '../../../../components/tools/MosfetCalculator/mosfetUtils';

export default function MosfetCalculatorTest() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Run test cases
    const results = [];

    // Test case 1: N-Channel MOSFET with very low Rds_on (0.022Ω)
    // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
    const test1 = calculateNChannelConduction(2, 5, 0, 25, 225, 0.022);
    const expectedId1 = 25 / (225 + 0.022);
    const expectedVd1 = expectedId1 * 0.022;
    const expectedVoltageAcrossLoad1 = expectedId1 * 225;
    const expectedPower1 = expectedId1 * expectedId1 * 0.022;
    
    results.push({
      name: "N-Channel MOSFET with very low Rds_on (0.022Ω)",
      params: {
        vth: 2,
        vg: 5,
        vs: 0,
        vcc: 25,
        rload: 225,
        rds_on: 0.022
      },
      result: test1,
      expected: {
        id: expectedId1.toFixed(4),
        vd: expectedVd1.toFixed(4),
        voltageAcrossLoad: expectedVoltageAcrossLoad1.toFixed(4),
        power: expectedPower1.toFixed(6),
        powerInMw: (expectedPower1 * 1000).toFixed(2)
      }
    });

    // Test case 2: P-Channel MOSFET with very low Rds_on (0.022Ω)
    // Vth = -2V, Vg = 0V, Vs = 25V, Vcc = 25V, Rload = 225Ω, Rds_on = 0.022Ω
    const test2 = calculatePChannelConduction(-2, 0, 25, 25, 225, 0.022);
    const expectedId2 = 25 / (225 + 0.022);
    const expectedVd2 = 25 - (expectedId2 * 0.022);
    const expectedVoltageAcrossLoad2 = expectedId2 * 225;
    const expectedPower2 = expectedId2 * expectedId2 * 0.022;
    
    results.push({
      name: "P-Channel MOSFET with very low Rds_on (0.022Ω)",
      params: {
        vth: -2,
        vg: 0,
        vs: 25,
        vcc: 25,
        rload: 225,
        rds_on: 0.022
      },
      result: test2,
      expected: {
        id: expectedId2.toFixed(4),
        vd: expectedVd2.toFixed(4),
        voltageAcrossLoad: expectedVoltageAcrossLoad2.toFixed(4),
        power: expectedPower2.toFixed(6),
        powerInMw: (expectedPower2 * 1000).toFixed(2)
      }
    });

    // Test case 3: N-Channel MOSFET with high Rds_on (10Ω)
    // Vth = 2V, Vg = 5V, Vs = 0V, Vcc = 12V, Rload = 100Ω, Rds_on = 10Ω
    const test3 = calculateNChannelConduction(2, 5, 0, 12, 100, 10);
    const expectedId3 = 12 / (100 + 10);
    const expectedVd3 = expectedId3 * 10;
    const expectedVoltageAcrossLoad3 = expectedId3 * 100;
    const expectedPower3 = expectedId3 * expectedId3 * 10;
    
    results.push({
      name: "N-Channel MOSFET with high Rds_on (10Ω)",
      params: {
        vth: 2,
        vg: 5,
        vs: 0,
        vcc: 12,
        rload: 100,
        rds_on: 10
      },
      result: test3,
      expected: {
        id: expectedId3.toFixed(4),
        vd: expectedVd3.toFixed(4),
        voltageAcrossLoad: expectedVoltageAcrossLoad3.toFixed(4),
        power: expectedPower3.toFixed(6),
        powerInMw: (expectedPower3 * 1000).toFixed(2)
      }
    });

    setTestResults(results);
  }, []);

  return (
    <div className="container mx-auto p-6 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-green-400">MOSFET Calculator Test Page</h1>
      
      {testResults.map((test, index) => (
        <div key={index} className="mb-8 p-4 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-green-400">{test.name}</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Parameters:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>Vth: {test.params.vth}V</div>
              <div>Vg: {test.params.vg}V</div>
              <div>Vs: {test.params.vs}V</div>
              <div>Vcc: {test.params.vcc}V</div>
              <div>Rload: {test.params.rload}Ω</div>
              <div>Rds_on: {test.params.rds_on}Ω</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Calculator Results:</h3>
              <div className="bg-gray-900 p-3 rounded">
                <div>Conducting: {test.result.conducting ? 'Yes' : 'No'}</div>
                <div>Vgs: {test.result.vgs}V</div>
                <div>Id: {test.result.id}A</div>
                <div>Vd: {test.result.vd}V</div>
                <div>Voltage Across Load: {test.result.voltageAcrossLoad}V</div>
                <div>Current Through Load: {test.result.currentThroughLoad}A</div>
                <div>Power Dissipated: {test.result.powerDissipated} {test.result.powerUnit}</div>
                <div>Raw Power: {test.result.rawPowerDissipated.toFixed(6)}W</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Expected Values:</h3>
              <div className="bg-gray-900 p-3 rounded">
                <div>Id: {test.expected.id}A</div>
                <div>Vd: {test.expected.vd}V</div>
                <div>Voltage Across Load: {test.expected.voltageAcrossLoad}V</div>
                <div>Power: {test.expected.power}W</div>
                <div>Power (mW): {test.expected.powerInMw}mW</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Comparison:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-2 rounded ${Math.abs(parseFloat(test.result.id) - parseFloat(test.expected.id)) < 0.0001 ? 'bg-green-900' : 'bg-red-900'}`}>
                Id: {Math.abs(parseFloat(test.result.id) - parseFloat(test.expected.id)) < 0.0001 ? 'MATCH' : 'MISMATCH'}
              </div>
              <div className={`p-2 rounded ${Math.abs(parseFloat(test.result.vd) - parseFloat(test.expected.vd)) < 0.0001 ? 'bg-green-900' : 'bg-red-900'}`}>
                Vd: {Math.abs(parseFloat(test.result.vd) - parseFloat(test.expected.vd)) < 0.0001 ? 'MATCH' : 'MISMATCH'}
              </div>
              <div className={`p-2 rounded ${Math.abs(parseFloat(test.result.voltageAcrossLoad) - parseFloat(test.expected.voltageAcrossLoad)) < 0.0001 ? 'bg-green-900' : 'bg-red-900'}`}>
                Voltage Across Load: {Math.abs(parseFloat(test.result.voltageAcrossLoad) - parseFloat(test.expected.voltageAcrossLoad)) < 0.0001 ? 'MATCH' : 'MISMATCH'}
              </div>
              <div className={`p-2 rounded ${Math.abs(test.result.rawPowerDissipated - parseFloat(test.expected.power)) < 0.000001 ? 'bg-green-900' : 'bg-red-900'}`}>
                Power: {Math.abs(test.result.rawPowerDissipated - parseFloat(test.expected.power)) < 0.000001 ? 'MATCH' : 'MISMATCH'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
