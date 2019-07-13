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
    getChecksum,
    isLastTritZero,
} from '../../../libs/hlx/utils';
import { latestAddressWithoutChecksum, latestAddressChecksum } from '../../__samples__/addresses';
import { hexToBits , bitsToChars } from '../../../libs/hlx/converter';

describe('libs: helix/utils', () => {
    describe('#isLastBitZero', () => {
        describe('when the last bit is 0', () => {
            it('should return true', () => {
                expect(isLastBitZero('b'.repeat(64))).to.equal(true);
            });
        });
        describe('when the last bit is not 0', () => {
            it('should return false', () => {
                expect(isLastBitZero('a'.repeat(64))).to.equal(false);
            });
        });
    });

    describe('#convertFromBytes', () => {
        describe('when bytes passed as an argument contains all zeroes', () => {
            // TODO
            it('should return a string "Empty"', () => {
                const messageFragment = '0'.repeat(1024);
                expect(convertFromBytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from bytes returns null', () => {
            // TODO Recheck
            // it('should return a string "Empty"', () => {
            //     // fromTrytes would return null if the message length is odd
            //     // https://github.com/iotaledger/iota.lib.js/blob/master/lib/utils/asciiToTrytes.js#L74
            //     const messageFragment = `abdefa${'0'.repeat(1018)}`;
            //     expect(convertFromBytes(messageFragment)).to.equal('Empty');
            // });
        });

        // describe('when conversion from bytes returns a string with non-ascii characters', () => {
        //     it('should return a string "Empty"', () => {
        //         // iota.utils.fromTrytes returns non-ascii characters for these fragments
        //         const messageFragment =
        //             'KGCSMUIHVSUAXNCVTARBBIWM9RRPVGYUPDXBZWIPIRCNV9ZTWPBGHPXVLYOFWGPQUJTXAEJIYJSBLPBUZCO9JVHDFIXXCWTEENJDO9HNWMNZCYMJUAMRIGWBKRJZKDWKKMTQCLCCHRTM9SXESGKPANDYNHGRSHE9GCZJZAFICSZOGFGDYHMJCHGR9W9FJHJG9TXXFKLLFBKSJEPZLPJQFHWWLYUCHT9EHRVRRESKOKHVJLXPBUZIJGCAXLNAXNBNAHGXPUNCOGRTZLVVSUGIBTKEFNXLIKQXKFWXWMCBAIM9NOBACGZLLILDNKWNDEJHGO9CCQVSNRWSRGPF9REHOOWNUMTCEUDHYGWDTPOPALFVJVNDBNDUHWDTUPKOZBU9CNSJNHPUNHSKPBIFRXQXYSDWEFYCORKUBDKEMKJONKSAFIWUSYGZOTKGZSUCYCOGQVJOHDHICRSMTNUQDKUUREHREBLAWPSFCMJCZCHOIUQQNQTAFBOCGWWUKTZKAAMSUTOZFKUIMRREYQEPGIYGNKAGMYPHEUZCWHBBUAKDFVCPWJCTBAFXLRWDJIZNPEDAPUYRHAEMDMDSU9UGCRPSNBMROSRKLTXNTADEGPKZNHRRFVFAFXBWCIDCCUAQSJFCRIKWEXRXNCNZRLEWA9PVVVOVCRPIJMVHS9GEFJRYRTPSWHYPBILTZGSUQRWFHSPNZOTSFVEPDULNXLTMAOHYEIHJAVMAHXANEGTITMQWGKPFJWODUFVEJSZYYCLMCJOGI9OJFGEWJCOCIQNPSZIBHQ9GMVQF9GVRSRKYUXKHZXGODLSENITEJHMAHD9XNWJZTWBOSNBCIBVXYKDFYPVIZTXPONSYCCHUFUONLTWHU9NBDOQA9QKMAOTICXCLIZAMUHZDQZNCDSQZLIWOOUVMPMF9KTOMOFAYHEIPMGTQYVG9ZGIXLXOBJNJYVSNZXDBQYH9CGOFYZEUYTWTBMSOILROMCAFQYSMLAKJENQLLTEHLVQLRITQVMGLYUWEGZJFLLOPWRJW9JIOHDCKQJILTPBOMZHTECEOMSVHUFJKSIXKAUXMZXIQZWOESGPA9NF99REQNJJPJYAORQKOOZMTEIFJXWYKK9AGMQEGBQHQVGIBLZWDVHOSXGWRTRHAGMF9DRAEWKBRRMYPD9SXQMQHZKXZMPEVHNBMRLD9SNQQMDEPEQTDHFDYLYMTTGYDFALYYCMKELVDQVRDAXXRVA9DWQMBPPMTZPBFWFUOUG9CAKAM9ICJHEZPXLNHRDNBIHHDDXWN9RIHT9STKDNYWPFHWXZFWZHZZMWXYOBZNOBXSJTKY9HWCTQOFSAVFCLOTUDJLZBOWJCVNEXXXMXGK9EPFDNCD9NOFFRPEWENMUZPKSCCHCDXSOSLO9KDKEKZMKQBEIEFHFE9XWF9OSSPTHOTI9SJNAFW99CEDPIYRFFFYWMNPTIKLNBPVU9EXNGLBPEFHGROLQASLYOKUEUKJVTHMGUJUUFUWMYJVGDAFSJEAYIBORELDBVVEPHFEMZCMDTVOHQ9PYISUYWEWOV9XZQPWXJQR9UCZHGV9YWVLQIYIXBISWWAWEZRLLPPZALXURMSEDOUATVTWTCKPVLCHTPW9ZZYSWDLHKZNLIFVQFLLRLQZFHKISVWDAMO9ZCVEHBAKIXQGCKUDMHZYCVSKEMPSCIEMZANPUGCOP9BAO9HPSPYSHXZOH9EHOALCFQDOAG9ECNAMRPILS9GESRFKARDWZWCNCLGXGBABDE9VRAI9ONFVDNMGHEPWWJCHUOVUADFONRUIHSYABPLLTAMRSTKGDEKGIUEFLBOTFJM9AHLDJT9TCJEVVDUPXPOAFSRRKGRJUIJMNLU9WFUTEUEJHKKL9WAEDRPHUBR9GGGFHDXGADBVTJYSUBGBIYZTFUMQERZJNLGKZTIWTGFFSSPHZTUOSRQBD9ETCCXQKQXPICJLQTVTHEWAWEAWACDONAFNOHXBOOP9VNPSHFDAMCALBZZNYYF9WIYIBGREYSLDPSKCQXRHECILTCVKFSPKZMGGJZABUDNBBZLVQHNKFLLFXTSUNWOVWQUPMEWORDIRDDCARYIBRLTOFHYHBG9CQOYMYCBZWZK9RVPSJLWZIHPLDNC9DHKNYGNQROMGLVFMXBJXRCGXBEEEFPKTCUYCXK9MVDTRFZZWYL9PSRE9';
        //         expect(convertFromBytes(messageFragment)).to.equal('Empty');
        //     });
        // });

        // describe('when conversion from trytes does not return null', () => {
        //     it('should return a string converted from trytes', () => {
        //         const messageFragment = `CCACSBXBSBCCHC${'9'.repeat(2173)}`;
        //         expect(convertFromBytes(messageFragment)).to.equal('TRINITY');
        //     });
        // });
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
        describe('when seed is in bytes', () => {
            describe('when length is provided', () => {
                it('should return checksum in bytes with provided length', () => {
                    const checksum = getChecksum(latestAddressWithoutChecksum, 8);

                    expect(checksum).to.equal(latestAddressChecksum);
                });
            });

            // describe('when length is not provided', () => {
            //     it('should return checksum in bytes with default length', () => {
            //         const checksum = getChecksum(latestAddressWithoutChecksum);

            //         expect(checksum).to.equal(latestAddressChecksum.slice(-3));
            //     });
            // });
        });

        describe('when seed is in bits', () => {
            // describe('when length is provided', () => {
            //     it('should return checksum in bits with provided length', () => {
            //         const checksum = getChecksum(hexToBits(latestAddressWithoutChecksum), 64);

            //         expect(bitsToChars(checksum)).to.eql(latestAddressChecksum);
            //     });
            // });

            // describe('when length is not provided', () => {
            //     it('should return checksum in trits with default length', () => {
            //         const checksum = getChecksum(hexToBits(latestAddressWithoutChecksum));

            //         expect(bitsToChars(checksum)).to.equal(latestAddressChecksum.slice(-3));
            //     });
            // });
        });
    });
});
