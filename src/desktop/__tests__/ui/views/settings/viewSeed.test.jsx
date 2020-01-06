describe('Settings viewseed view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/viewseed', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'viewSeed.test.jsx',
        });
    }, 10000);
});