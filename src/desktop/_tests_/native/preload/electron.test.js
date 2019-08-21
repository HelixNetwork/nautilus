'use strict';

import Electron from '../../../native/preload/Electron';

import txHex from '../../__mocks__/samples/txHex';
import { seedTxsMock, passwordMock, addressMocks } from '../../__mocks__/samples/keychain';

describe('Electron preload class', () => {
    test('Proof of Work', async () => {
        const pow = Electron.getPowFn();
        const nonce = await pow(txHex.value[0], 14);
        expect(nonce.length).toEqual(16);
    });

    test('Single address generation', async () => {
        const address = await Electron.genFn(seedTxsMock, 0, 2, 1);
        expect(address).toEqual(addressMocks[1]);
    });

    test('Multiple address generation', async () => {
        const address = await Electron.genFn(seedTxsMock, 0, 2, 2);
        expect(address).toEqual([addressMocks[1], addressMocks[2]]);
    });

    test('Calculate seed checksum', () => {
        const checksum = Electron.getChecksum(Array(64).fill(1));
        expect(checksum).toEqual('JUY');
    });

    test('Argon2 key derivation', async () => {
        const hash = await Electron.argon2(Array(70, 111, 111), Array(16).fill(0));
        expect(new Uint8Array(hash)).toEqual(passwordMock);
    });
});
