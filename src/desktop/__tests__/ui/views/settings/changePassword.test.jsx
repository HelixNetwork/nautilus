describe('Settings change password view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/advanced', true,600);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'changepassword.test.jsx',
        });
    }, 10000);
});