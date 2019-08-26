'use strict';

import SeedStoreCore from 'src/libs/seed/seedStoreCore';
import txHex from '../../__mocks__/samples/txHex';

global.Electron = {
    getPowFn: () => async () => '0000000000008e1c',
};

describe('SeedStore core class', () => {
    test('performPow', async () => {
        const seedStore = new SeedStoreCore();
        const pow = await seedStore.performPow(
            txHex.value,
            '9474289ae28f0ea6e3b8bedf8fc52f14d2fa9528a4eb29d7879d8709fd2f6d37',
            '00ead80731fcfcf5fe173d1abd7b749baa841fbaa1029e5a533aca3ad56400ab',
            14,
        );

        expect(pow).toEqual('0000000000008e1c');
    });

    test('getDigest', async () => {
        const seedStore = new SeedStoreCore();
        const digest = await seedStore.getDigest(txHex.value[0]);
        expect(digest).toEqual('ASLHJ9EOPDSFODNLVHIHKUXPIOHUVIYNADKSWZZTWCTTQEHYNHNWBZKBTVQRCVHZT9FSMRCISOTF99999');
    });
});
