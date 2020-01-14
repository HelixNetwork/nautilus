describe('Onboarding account password view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('/onboarding/account-password', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'accountPassword.test.jsx',
        });
    }, 10000);
});
