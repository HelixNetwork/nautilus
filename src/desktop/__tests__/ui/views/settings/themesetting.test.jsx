describe('Settings themesetting view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/theme', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'themesetting.test.jsx',
        });
    }, 10000);
});