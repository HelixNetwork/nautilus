describe('Settings currency view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/currency', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'currency.test.jsx',
        });
    }, 10000);
});