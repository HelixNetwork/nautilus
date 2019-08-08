const latestAddressObject = {
  address: "37dabe14aade00fffbf6e1333581ee7ec7753e01729305c581d539068e6e0492",
  balance: 0,
  index: 9,
  checksum: "59dd051f",
  spent: { local: false, remote: false }
};

const addressData = [
  {
    address: "164838c044a83bbe80ce4bd24547442ae6d496caa5496c4746ae71470c13b4ed",
    balance: 0,
    index: 0,
    checksum: "5bc16142",
    spent: { local: true, remote: true }
  },
  {
    address: "5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194",
    balance: 0,
    index: 1,
    checksum: "324c0dec",
    spent: { local: true, remote: false }
  },
  {
    address: "c212548bd3c4b596bf24b16c36aaa69a5ecaf5a8240232380b0a26539b6b8619",
    balance: 0,
    index: 2,
    checksum: "ff9f209e",
    spent: { local: true, remote: true }
  },
  {
    address: "fcb610407fba6820c44cbc800205013cd92707412c990ffc6669f5477346cffb",
    balance: 0,
    index: 3,
    checksum: "6760ec05",
    spent: { local: true, remote: false }
  },
  {
    address: "c4985fa20c67354b8a094287b11f6ec4fd2f63fd0a74509fe9bf21982db6b5f8",
    balance: 0,
    index: 4,
    checksum: "750b0406",
    spent: { local: false, remote: false }
  },
  {
    address: "eb3a11e3d9530cd3100027bde28f2f850b211bdc9ae98c1da09488a8889d891a",
    balance: 100,
    index: 5,
    checksum: "f947212c",
    spent: { local: false, remote: true }
  },
  {
    address: "ee1c15a76b2b1ce72acd7e559afafb7418ffac15246d7c2c9d1bfe0ea4b6a924",
    balance: 0,
    index: 6,
    checksum: "032e847c",
    spent: { local: false, remote: true }
  },
  {
    address: "71cace39b6854a77b7355742565afe9789c1646348266a98c86e6165f08cfa1d",
    balance: 150,
    index: 7,
    checksum: "8b325017",
    spent: { local: false, remote: false }
  },
  {
    address: "dbd93a6a2f3741546459e59a2e6d725f0d72dfb7b37c7e8a4374536c766321f7",
    balance: 10,
    index: 8,
    checksum: "9eb4f4ea",
    spent: { local: false, remote: false }
  },
  latestAddressObject
];

const latestAddressWithoutChecksum =
  "37dabe14aade00fffbf6e1333581ee7ec7753e01729305c581d539068e6e0492";
const latestAddressChecksum = "59dd051f";
const latestAddressWithChecksum = `${latestAddressWithoutChecksum}${latestAddressChecksum}`;
const latestAddressIndex = 9;
const latestAddressBalance = 0;

const balance = 260;

export default addressData.map(addressObject => addressObject.address);

export {
  addressData,
  latestAddressWithoutChecksum,
  latestAddressChecksum,
  latestAddressWithChecksum,
  latestAddressIndex,
  latestAddressBalance,
  latestAddressObject,
  balance
};
