describe('Onboarding login view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seedWallet', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'seedWallet.test.jsx',
        });
    }, 10000);
});