import domain from '../../../../../src/domain';
import { BLOCKCHAINS, SUB_STEPS } from '../../../../../src';
import mocknetMapAssertion from './assertions/mocknetMapAssertion';
import mainnetMapAssertion from './assertions/mainnetMapAssertion';
import Versions from '../../../../../src/constants/certificateVersions';
import { IVerificationMapItem } from '../../../../../src/domain/certificates/useCases/getVerificationMap';
import { VerificationSteps } from '../../../../../src/constants/verificationSteps';

describe('domain certificates get verification map use case test suite', function () {
  describe('given it is called with the mocknet chain', function () {
    it('should return a mocknet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.mocknet);
      expect(result).toEqual(mocknetMapAssertion);
    });
  });

  describe('given it is called with the bitcoin chain', function () {
    it('should return a mainnet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin);
      expect(result).toEqual(mainnetMapAssertion);
    });

    describe('and the blockcerts version is v3', function () {
      it('should return a mainnet verification map without the getIssuerProfile step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, Versions.V3_0_beta);
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));
        const getIssuerProfileIndex = expectedOutput[0].subSteps.findIndex(subStep => subStep.code === SUB_STEPS.getIssuerProfile);
        expectedOutput[0].subSteps.splice(getIssuerProfileIndex, 1);
        expect(result).toEqual(expectedOutput);
      });
    });

    describe('and the blockcerts issuer shared their DID', function () {
      it('should add the checkIssuerIdentity step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, Versions.V3_0_beta, true);
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));
        // remove because v3
        const getIssuerProfileIndex = expectedOutput[0].subSteps.findIndex(subStep => subStep.code === SUB_STEPS.getIssuerProfile);
        expectedOutput[0].subSteps.splice(getIssuerProfileIndex, 1);

        // add because did
        expectedOutput[2].subSteps.splice(0, 0, {
          code: 'checkIssuerIdentity',
          label: 'Check Issuer Identity',
          labelPending: 'Checking Issuer Identity',
          parentStep: VerificationSteps.statusCheck
        });
        expect(result).toEqual(expectedOutput);
      });
    });
  });

  describe('given it is called without a chain and a version', function () {
    it('should return an empty array', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap();
      expect(result).toEqual([]);
    });
  });
});
