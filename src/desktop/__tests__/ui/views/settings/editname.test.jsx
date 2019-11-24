describe('Settings editname view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/editname', true);
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'editname.test.jsx',
        });
    }, 10000);
});