describe('Wallet Chart view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('wallet/chart',true, 600);
 
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
             failureThreshold: '0.05',
             failureThresholdType: 'percent',
            customSnapshotIdentifier: 'chart.test.jsx',
   
        });
    }, 10000);
 });
 