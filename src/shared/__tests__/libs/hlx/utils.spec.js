import map from 'lodash/map';
import sinon from 'sinon';
import { expect } from 'chai';
import * as extendedApis from '../../../libs/hlx/extendedApi';
import {
    convertFromBytes,
    getRandomNodes,
    withRetriesOnDifferentNodes,
    throwIfNodeNotHealthy,
    isLastBitZero,
    getChecksum
} from '../../../libs/hlx/utils';
import { latestAddressWithoutChecksum, latestAddressChecksum } from '../../__samples__/addresses';
import { hexToBits , bitsToChars } from '../../../libs/hlx/converter';

describe('libs: helix/utils', () => {
    describe('#isLastBitZero', () => {
        describe('when the last txBit is 0', () => {
            it('should return true', () => {
                expect(isLastBitZero('b'.repeat(64))).to.equal(true);
            });
        });
        describe('when the last txBit is not 0', () => {
            it('should return false', () => {
                expect(isLastBitZero('a'.repeat(64))).to.equal(false);
            });
        });
    });

    describe('#convertFromBytes', () => {
        describe('when txBytes passed as an argument contains all zeroes', () => {
            it('should return a string "Empty"', () => {
                const messageFragment = '0'.repeat(1024);
                expect(convertFromBytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from txBytes returns null', () => {
            // TODO Recheck 
              it('should return a string "Empty"', () => {
                // It would return null if the message length is odd
                const messageFragment = `abdef${'0'.repeat(1018)}`;
                expect(convertFromBytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from txBytes returns a string with non-ascii characters', () => {
            it('should return a string "Empty"', () => {
                //returns non-ascii characters for these fragments
                const messageFragment =
                    '8f7f';
                expect(convertFromBytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from txBytes does not return null', () => {
            it('should return a string converted from txBytes', () => {
                const messageFragment = `48656c697820476d6268${'0'.repeat(1004)}`;
                expect(convertFromBytes(messageFragment)).to.equal('Helix Gmbh');
            });
        });
    });

    describe('#withRetriesOnDifferentNodes', () => {
        it('should return a function', () => {
            const returnValue = withRetriesOnDifferentNodes(['provider']);
            expect(typeof returnValue).to.equal('function');
        });

        it('should throw an error "No nodes to retry on if no nodes are provided"', () => {
            const result = withRetriesOnDifferentNodes([]);

            return result(() => Promise.resolve())('foo').catch((err) => {
                expect(err.message).to.equal('No node to retry.');
            });
        });

        it('should throw if no promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).rejects();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should not throw if any promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).resolves();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').then(() => {
                expect(stub.calledTwice).to.equal(true);
            });
        });

        it('should trigger callback on each failure if callback is passed as an array of functions', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(nodes, map(nodes, () => stub));

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should trigger callback once if callback is passed as a function', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(nodes, stub);

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledOnce).to.equal(true);
            });
        });
    });

    describe('#getRandomNodes', () => {
        let nodes;
        let size;
        before(() => {
            nodes = Array(6)
                .fill()
                .map((_, index) => index);
            size = 3;
        });

        it('should not choose blacklisted nodes', () => {
            const blacklisted = [3, 5];
            const result = getRandomNodes(nodes, size, blacklisted);

            expect(result).to.not.include([3, 5]);
        });
    });

    describe('#throwIfNodeNotHealthy', () => {
        describe('when node is synced', () => {
            it('should return true', () => {
                const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(true);

                return throwIfNodeNotHealthy('foo').then((isSynced) => {
                    expect(isSynced).to.equal(true);
                    stub.restore();
                });
            });
        });

        describe('when node is not synced', () => {
            it('should return throw an error with message "Node not synced"', () => {
                const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(false);

                return throwIfNodeNotHealthy('foo')
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => {
                        expect(error.message).to.equal('Node not synced by timestamp');
                        stub.restore();
                    });
            });
        });
    });

    describe('#getSeedChecksum', () => {
        describe('when seed is in txBytes', () => {
            describe('when length is provided', () => {
                it('should return checksum in txBytes with provided length',async () => {
                    const checksum = await getChecksum(latestAddressWithoutChecksum, 8);
                    expect(checksum).to.equal(latestAddressChecksum);
                });
            });

            describe('when length is not provided', () => {
                it('should return checksum in txBytes with default length', async () => {
                    const checksum = await getChecksum(latestAddressWithoutChecksum);
                    expect(checksum).to.equal(latestAddressChecksum.slice(-8));
                });
            });
        });

        describe('when seed is in txBits', () => {
            describe('when length is provided', () => {
                it('should return checksum in txBits with provided length',async () => {
                    const checksum = await getChecksum(hexToBits(latestAddressWithoutChecksum), 64);  
                    expect(bitsToChars(checksum)).to.eql(latestAddressChecksum);
                });
            });

            describe('when length is not provided', () => {
                it('should return checksum in txBits with default length',async () => {
                    const checksum = await getChecksum(hexToBits(latestAddressWithoutChecksum));

                    expect(bitsToChars(checksum)).to.equal(latestAddressChecksum.slice(-8));
                });
            });
        });
    });
});
