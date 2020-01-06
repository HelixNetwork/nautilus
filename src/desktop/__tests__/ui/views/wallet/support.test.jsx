describe('Wallet Support view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('wallet/support',true, 600);
 
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
             failureThreshold: '0.05',
             failureThresholdType: 'percent',
            customSnapshotIdentifier: 'support.test.jsx',
   
        });
    }, 10000);
 });
 