describe('Settings removeaccount view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/remove', true);
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'removeaccount.test.jsx',
        });
    }, 10000);
});