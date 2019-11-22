console.log("account  passwoord test")
describe('Onboarding account password view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/accountPassword', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'accountPassword.test.jsx',
        });
    }, 10000);
});
