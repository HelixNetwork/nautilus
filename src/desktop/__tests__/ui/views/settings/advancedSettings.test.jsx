describe('Settings advanced view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/accountsetting', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'advancedsettings.test.jsx',
        });
    }, 10000);
});