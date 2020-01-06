describe('Wallet History view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('wallet/history',true, 600);
 
        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
             failureThreshold: '0.05',
             failureThresholdType: 'percent',
            customSnapshotIdentifier: 'wallet_history.test.jsx',
   
        });
    }, 10000);
 });
 