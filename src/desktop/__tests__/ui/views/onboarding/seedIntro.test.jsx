console.log("Seed Intro test proceeds");
describe('Onboarding seed intro view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seedIntro', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'seedIntro.test.jsx',
        });
    }, 10000);
});