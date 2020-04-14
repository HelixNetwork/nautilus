import React from 'react';

import renderer from 'react-test-renderer';

it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/language">language</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/theme">Theme</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/accountsetting">Advanced settings</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/editname">Edit Name</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/node">Node</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/viewseed">ViewSeed</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/address">View Address</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/password">Change password</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/remove">Remove Account</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', () => {
    const tree = renderer
        .create(<li page="settings/snapshot">Snapshot</li>)
        .toJSON();
    expect(tree).toMatchSnapshot();
});