console.log("Account name test proceeds");
describe('Onboarding account name view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/accountName', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'accountName.test.jsx',
        });
    }, 10000);
});
