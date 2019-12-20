import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import unionBy from 'lodash/unionBy';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { initialState as defaultSettings } from 'reducers/settings';

import Button from 'ui/components/button';
import Toggle from 'ui/components/toggle';
import Number from 'ui/components/input/number';
import Select from 'ui/components/input/select';
import Scrollbar from 'ui/components/scrollbar';
import { isValidUrl, isValidHttpsUrl } from '../../../../../shared/libs/utils';
import endsWith from 'lodash/endsWith';
import some from 'lodash/some';
import NodeCustom from './NodeCustom';

import { DEFAULT_NODE, MINIMUM_QUORUM_SIZE, MAXIMUM_QUORUM_SIZE } from '../../../../../shared/config';

import css from './settings.scss';
import {
    setFullNode,
    removeCustomNode,
    updateQuorumConfig,
    updateNodeAutoSwitchSetting,
    changeAutoNodeListSetting,
} from 'actions/settings';
import { generateAlert } from 'actions/alerts';

/**
 * Change IRI API node component
 */
class NodeSettings extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        settings: PropTypes.shape({
            nodeAutoSwitch: PropTypes.bool.isRequired,
            autoNodeList: PropTypes.bool.isRequired,
            node: PropTypes.object.isRequired,
            quorum: PropTypes.object.isRequired,
        }),
        /** @ignore */
        changeAutoNodeListSetting: PropTypes.func.isRequired,
        /** @ignore */
        updateNodeAutoSwitchSetting: PropTypes.func.isRequired,
        /** @ignore */
        updateQuorumConfig: PropTypes.func.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        loading: this.props.isChangingNode || this.props.isCheckingCustomNode,
        autoNodeSelection:
            defaultSettings.autoNodeList === this.props.settings.autoNodeList &&
            defaultSettings.nodeAutoSwitch === this.props.settings.nodeAutoSwitch &&
            defaultSettings.quorum.enabled === this.props.settings.quorum.enabled &&
            defaultSettings.quorum.size === this.props.settings.quorum.size &&
            defaultSettings.node.url === this.props.settings.node.url,
        autoNodeList: this.props.settings.autoNodeList,
        nodeAutoSwitch: this.props.settings.nodeAutoSwitch,
        primaryNode: this.props.settings.node,
        quorumEnabled: this.props.settings.quorum.enabled,
        quorumSize: this.props.settings.quorum.size,
        showCustomNodes: false,
    };

    updateQuorumEnabled = () => {
        const { quorumEnabled, autoNodeList, quorumSize } = this.state;
        const { nodes, customNodes, generateAlert, t } = this.props;
        if (
            !quorumEnabled &&
            ((autoNodeList && nodes.length < MINIMUM_QUORUM_SIZE) ||
                (!autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE))
        ) {
            generateAlert(
                'error',
                t('nodeSettings:nodeEnoughNodesTitle'),
                autoNodeList
                    ? t('nodeSettings:nodeEnoughNodesExplanation')
                    : `${t('nodeSettings:nodeEnoughNodesExplanation')} ${t(
                          'nodeSettings:nodeEnoughNodesExplanationCustomNodes',
                      )}`,
            );
        } else {
            if (!quorumEnabled && !autoNodeList && quorumSize > customNodes.length) {
                this.setQuorumSize(customNodes.length);
            }
            this.setQuorumEnabled(!quorumEnabled);
        }
    };

    updateAutoNodeList = () => {
        const { autoNodeList, quorumSize } = this.state;
        const { customNodes, generateAlert, t } = this.props;
        if (autoNodeList && customNodes.length < 1) {
            generateAlert('error', t('nodeSettings:noCustomNodes'), t('nodeSettings:mustAddCustomNodes'));
        } else {
            if (autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE) {
                this.setQuorumEnabled(false);
            } else if (autoNodeList && customNodes.length < quorumSize) {
                this.setQuorumSize(customNodes.length);
            }
            this.setAutoNodeList(!autoNodeList);
        }
    };

    updateAutoNodeSelection = () => {
        const { autoNodeSelection } = this.state;
        if (!autoNodeSelection) {
            this.setAutoNodeList(defaultSettings.autoNodeList);
            this.setNodeAutoSwitch(defaultSettings.nodeAutoSwitch);
            this.setPrimaryNode(defaultSettings.node);
            this.setQuorumEnabled(defaultSettings.quorum.enabled);
            this.setQuorumSize(defaultSettings.quorum.size);
        }
        this.setAutoNodeSelection(!autoNodeSelection);
    };

    changeNode = (nodeSelected, customNode) => {
        const { nodes, node, setFullNode, generateAlert, t } = this.props;

        if (!nodeSelected.url) {
            generateAlert('error', t('addCustomNode:nodeFieldEmpty'), t('addCustomNode:nodeFieldEmptyExplanation'));
            return;
        }

        // Remove spaces and trailing slash
        nodeSelected.url = nodeSelected.url.replace(/ /g, '').replace(/\/$/, '');

        // Check if URL is valid
        if (!isValidUrl(nodeSelected.url)) {
            generateAlert('error', t('addCustomNode:customNodeCouldNotBeAdded'), t('addCustomNode:invalidURL'));
            return;
        }

        // Only allow HTTPS nodes
        if (!isValidHttpsUrl(nodeSelected.url)) {
            generateAlert('error', t('nodeMustUseHTTPS'), t('nodeMustUseHTTPSExplanation'));
            return;
        }

        const hasDefaultHttpsPort = endsWith(nodeSelected.url, ':443');

        if (hasDefaultHttpsPort) {
            nodeSelected.url = nodeSelected.url.slice(0, -4);
        }

        // Check whether the node was already added to the list
        if (
            customNode &&
            some(nodes, ({ url }) => (endsWith(url, ':443') ? url.slice(0, -4) : url).match(nodeSelected.url))
        ) {
            generateAlert('error', t('nodeDuplicated'), t('nodeDuplicatedExplanation'));
            return;
        }

        if (nodeSelected.url === node.url) {
            return;
        }

        setFullNode(nodeSelected, customNode);
    };

    removeCustomNode = (nodeUrl) => {
        const { autoNodeList, quorumEnabled, quorumSize } = this.state;
        const { t, generateAlert, customNodes } = this.props;
        if (!autoNodeList && quorumEnabled && quorumSize === customNodes.length) {
            return generateAlert(
                'error',
                t('addCustomNode:couldNotRemove'),
                t('addCustomNode:couldNotRemoveExplanation'),
                10000,
            );
        }
        this.props.removeCustomNode(nodeUrl);
    };

    saveSettings = () => {
        const { autoNodeList, nodeAutoSwitch, quorumEnabled, quorumSize, primaryNode } = this.state;
        const {
            settings,
            generateAlert,
            changeAutoNodeListSetting,
            updateNodeAutoSwitchSetting,
            updateQuorumConfig,
            setFullNode,
            t,
        } = this.props;
        if (autoNodeList !== settings.autoNodeList) {
            changeAutoNodeListSetting(autoNodeList);
        }
        if (nodeAutoSwitch !== settings.nodeAutoSwitch) {
            updateNodeAutoSwitchSetting(nodeAutoSwitch);
        }
        if (quorumEnabled !== settings.quorumEnabled || quorumSize !== settings.quorumSize) {
            updateQuorumConfig({ enabled: quorumEnabled, size: quorumSize });
        }
        if (primaryNode.url !== settings.node.url || primaryNode.password !== settings.node.password) {
            return setFullNode(primaryNode);
        }
        generateAlert(
            'success',
            t('nodeSettings:nodeSettingsUpdatedTitle'),
            t('nodeSettings:nodeSettingsUpdatedExplanation'),
        );
    };

    setAutoNodeSelection(status) {
        this.setState({
            autoNodeSelection: status,
        });
    }
    setNodeAutoSwitch(e) {
        this.setState({
            nodeAutoSwitch: e,
        });
    }

    setAutoNodeList(nodelist) {
        this.setState({
            autoNodeList: nodelist,
        });
    }

    setQuorumEnabled(status) {
        this.setState({
            quorumEnabled: status,
        });
    }

    setQuorumSize(size) {
        this.setState({
            quorumSize: size,
        });
    }

    setshowCustomNodes(e) {
        this.setState({
            showCustomNodes: e,
        });
    }

    setPrimaryNode(e) {
        if (typeof e == 'object') {
            this.setState({
                primaryNode: e,
            });
        } else {
            this.setState({
                primaryNode: { url: e, pow: true, token: '', password: '' },
            });
        }
    }

    render() {
        const { customNodes, nodes, settings, t } = this.props;
        const { loading } = this.state;
        const {
            showCustomNodes,
            autoNodeList,
            autoNodeSelection,
            nodeAutoSwitch,
            quorumEnabled,
            quorumSize,
            primaryNode,
        } = this.state;
        if (showCustomNodes) {
            return (
                <NodeCustom
                    loading={loading}
                    customNodes={customNodes}
                    setNode={this.changeNode}
                    removeCustomNode={this.removeCustomNode}
                    onClose={this.setshowCustomNodes.bind(this, false)}
                />
            );
        }

        const availableNodes = unionBy(customNodes, autoNodeList && nodes, nodeAutoSwitch && [DEFAULT_NODE], 'url');

        return (
            <div className={classNames(css.foo_bxx12)}>
                <div className={classNames(css.nodebox)}>
                    <form>
                        <article>
                            <Scrollbar>
                                <Toggle
                                    inline={t('nodeSettings:automaticNodeManagement')}
                                    checked={autoNodeSelection}
                                    onChange={this.updateAutoNodeSelection}
                                />

                                <Button
                                    onClick={this.setshowCustomNodes.bind(this, true)}
                                    className="small"
                                    type="button"
                                >
                                    {t('nodeSettings:addCustomNodes')}
                                </Button>

                                <Toggle
                                    disabled={autoNodeSelection}
                                    inline={t('nodeSettings:autoNodeList')}
                                    checked={autoNodeList}
                                    onChange={this.updateAutoNodeList.bind(this)}
                                />

                                <Toggle
                                    disabled={autoNodeSelection}
                                    inline={t('nodeSettings:nodeAutoswitching')}
                                    checked={nodeAutoSwitch}
                                    onChange={this.setNodeAutoSwitch.bind(this)}
                                />
                                {!nodeAutoSwitch && (
                                    <Select
                                        label={t('nodeSettings:primaryNode')}
                                        disabled={autoNodeSelection}
                                        value={primaryNode.url}
                                        onChange={this.setPrimaryNode.bind(this)}
                                        options={availableNodes.map(({ url }) => {
                                            return { value: url, label: url };
                                        })}
                                    />
                                )}

                                <Toggle
                                    disabled={autoNodeSelection}
                                    inline={t('nodeSettings:enableQuorum')}
                                    checked={quorumEnabled}
                                    onChange={this.updateQuorumEnabled.bind(this)}
                                />
                                <Number
                                    disabled={autoNodeSelection || !quorumEnabled}
                                    inline
                                    min={MINIMUM_QUORUM_SIZE}
                                    max={Math.min(availableNodes.length, MAXIMUM_QUORUM_SIZE)}
                                    value={quorumSize}
                                    label={t('nodeSettings:quorumSize')}
                                    onChange={this.setQuorumSize.bind(this)}
                                />
                            </Scrollbar>
                        </article>

                        <Button
                            loading={loading}
                            disabled={
                                autoNodeList === settings.autoNodeList &&
                                nodeAutoSwitch === settings.nodeAutoSwitch &&
                                quorumEnabled === settings.quorumEnabled &&
                                quorumSize === settings.quorumSize &&
                                primaryNode.url === settings.node.url &&
                                primaryNode.token === settings.node.token &&
                                primaryNode.password === settings.node.password
                            }
                            type="submit"
                            style={{ margin: '2% 0 0 50%' }}
                            onClick={this.saveSettings}
                        >
                            {t('global:save')}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    nodes: state.settings.nodes,
    customNodes: state.settings.customNodes,
    nodeAutoSwitch: state.settings.nodeAutoSwitch,
    autoNodeSelection: false,
    isChangingNode: state.ui.isChangingNode,
    isCheckingCustomNode: state.ui.isCheckingCustomNode,
    autoNodeList: state.settings.autoNodeList,
    quorumSize: state.settings.quorum.size,
    quorumEnabled: state.settings.quorum.enabled,
    settings: state.settings,
});
const mapDispatchToProps = {
    setFullNode,
    removeCustomNode,
    generateAlert,
    updateNodeAutoSwitchSetting,
    updateQuorumConfig,
    changeAutoNodeListSetting,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(NodeSettings));
