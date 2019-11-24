describe('Settings viewaddress view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/address', true);
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'viewaddress.test.jsx',
        });
    }, 10000);
});