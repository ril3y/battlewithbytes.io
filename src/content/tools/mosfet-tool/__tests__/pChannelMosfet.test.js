import fs from 'fs';
import path from 'path';
import { checkConduction } from '../mosfetUtils'; // Adjust the import as necessary
import { calculatePChannelMOSFET } from '../mosfetCalculations'; // Adjust the import as necessary

// Load the MOSFET data JSON file
const mosfetDataPath = path.join(__dirname, '../mosfetData.json');
const mosfetDataFromFile = JSON.parse(fs.readFileSync(mosfetDataPath, 'utf8'));

describe('checkConduction - P-Channel MOSFETs', () => {
    const mockUpdateDescription = jest.fn();

    // Helper function to reset mock function calls
    const resetMock = (mockFn) => {
        mockFn.mockReset();
    };

    // Test P-Channel MOSFETs
    for (const mosfetName in mosfetDataFromFile.mosfets['p-channel']) {
        const mosfetDetails = mosfetDataFromFile.mosfets['p-channel'][mosfetName];

        const inputValuesPChannel = {
            loadResistance: 240, // Example load resistance
            gate_voltage: mosfetDetails.vth - 1, // Ensure Vgs < Vth to make the MOSFET conduct
            vs: 12
        };

        test(`P-Channel MOSFET test ${mosfetName}`, () => {
            console.log(`Running test for ${mosfetName}`);
            resetMock(mockUpdateDescription);

            // Call checkConduction
            checkConduction('p-channel', inputValuesPChannel, mosfetDetails, mockUpdateDescription);

            // Call mosfetCalculations
            const expectedOutputs = calculatePChannelMOSFET(inputValuesPChannel, mosfetDetails);

            // Retrieve the actual mock calls
            const actualCalls = mockUpdateDescription.mock.calls[0];

            // Compare the values
            expect(actualCalls[0]).toContain('Conducting');
            expect(actualCalls[1]).toBe(expectedOutputs.isConducting);
            console.log(expectedOutputs);
            console.log(actualCalls);
            expect(parseFloat(actualCalls[2])).toBeCloseTo(expectedOutputs.voltageAcrossLoad);

            expect(parseFloat(actualCalls[3])).toBeCloseTo(parseFloat(expectedOutputs.powerDissipated), 6);

            //expect(parseFloat(actualCalls[4])).toBeCloseTo(expectedOutputs.currentThroughLoad);

            expect(parseFloat(actualCalls[5])).toBeCloseTo(parseFloat(expectedOutputs.vgs), 6);

            expect(parseFloat(actualCalls[6])).toBeCloseTo(parseFloat(expectedOutputs.id), 6);

            expect(parseFloat(actualCalls[7])).toBeCloseTo(parseFloat(expectedOutputs.vd), 6);
        });
    }
});