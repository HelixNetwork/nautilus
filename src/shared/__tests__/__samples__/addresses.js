const latestAddressObject = {
    address: '37dabe14aade00fffbf6e1333581ee7ec7753e01729305c581d539068e6e0492',
    balance: 0,
    index: 9,
    checksum: '59dd051f',
    spent: { local: false, remote: false },
};

const addressData = [
    {
        address: 'ed7ddda54ba1666c2b760d8d397b88eaa76efb361e4707cd70073234248439f9',
        balance: 0,
        index: 0,
        checksum: 'c9a9f613',
        spent: { local: true, remote: true },
    },
    {
        address: '6214373e99f3e335e630441a96341fbb8fbff9b416a793e1069c5bd28a76eb53',
        balance: 0,
        index: 1,
        checksum: '4abfc600',
        spent: { local: true, remote: true },
    },
    {
        address: 'e4fcd0a8c5971994263664e30f20b34878024d578ae8872bc746dd9230fc232f',
        balance: 0,
        index: 2,
        checksum: '324c0dec',
        spent: { local: true, remote: false },
    },
    {
        address: 'fcb610407fba6820c44cbc800205013cd92707412c990ffc6669f5477346cffb',
        balance: 0,
        index: 3,
        checksum: '6760ec05',
        spent: { local: true, remote: false },
    },
    {
        address: 'c4985fa20c67354b8a094287b11f6ec4fd2f63fd0a74509fe9bf21982db6b5f8',
        balance: 0,
        index: 4,
        checksum: '750b0406',
        spent: { local: false, remote: false },
    },
    {
        address: 'eb3a11e3d9530cd3100027bde28f2f850b211bdc9ae98c1da09488a8889d891a',
        balance: 100,
        index: 5,
        checksum: 'f947212c',
        spent: { local: false, remote: true },
    },
    {
        address: '31c92f5d62df01670c7fb72fd5577972a45267994acc3f35032a43f36da07830',
        balance: 0,
        index: 6,
        checksum: '7f2083f2',
        spent: { local: false, remote: true },
    },
    {
        address: '71cace39b6854a77b7355742565afe9789c1646348266a98c86e6165f08cfa1d',
        balance: 150,
        index: 7,
        checksum: '8b325017',
        spent: { local: false, remote: false },
    },
    {
        address: 'dbd93a6a2f3741546459e59a2e6d725f0d72dfb7b37c7e8a4374536c766321f7',
        balance: 10,
        index: 8,
        checksum: '9eb4f4ea',
        spent: { local: false, remote: false },
    },
    latestAddressObject,
];

const latestAddressWithoutChecksum =
    '37dabe14aade00fffbf6e1333581ee7ec7753e01729305c581d539068e6e0492';
const latestAddressChecksum = '59dd051f';
const latestAddressWithChecksum = `${latestAddressWithoutChecksum}${latestAddressChecksum}`;
const latestAddressIndex = 9;
const latestAddressBalance = 0;

const balance = 260;

export default addressData.map((addressObject) => addressObject.address);

export {
    addressData,
    latestAddressWithoutChecksum,
    latestAddressChecksum,
    latestAddressWithChecksum,
    latestAddressIndex,
    latestAddressBalance,
    latestAddressObject,
    balance,
};
