import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import Scrollbar from 'ui/components/scrollbar';
import Modal from 'ui/components/modal/Modal';
import Text from 'ui/components/input/text';

import css from './settings.scss';

/**
 * Custom node management component
 */
class NodeCustom extends React.PureComponent {
    static propTypes = {
        customNodes: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setNode: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        url: '',
        token: '',
        password: '',
        authVisible: false,
    };

    addNode = (e) => {
        const { url } = this.state;

        if (e) {
            e.preventDefault();
        }
        this.props.setNode({ url, token: '', password: '' }, true);
    };

    setUrl(e) {
        this.setState({
            url: e,
        });
    }

    render() {
        const { customNodes, loading, onClose, removeCustomNode, t } = this.props;
        // const [url, setUrl] = useState('');
        // const [token, setToken] = useState('');
        // const [password, setPassword] = useState('');
        // const [authVisible, setAuthVisible] = useState(false);

        return (
            <Modal variant="fullscreen" isOpen onClose={onClose}>
                <section className={css.nodeCustom}>
                    <form onSubmit={this.addNode.bind(this)}>
                        <Text
                            value={this.state.url}
                            disabled={loading}
                            label={t('addCustomNode:customNode')}
                            onChange={this.setUrl.bind(this)}
                        />
                        {/*
                    // Temporary disable authorisation entry #https://github.com/iotaledger/trinity-wallet/pull/1654
                    authVisible ? (
                        <Fragment>
                            <Text value={token} label={t('addCustomNode:username')} onChange={setToken} />
                            <Text value={password} label={t('addCustomNode:password')} onChange={setPassword} />
                        </Fragment>
                    ) : (
                        <a className={css.authLink} onClick={() => setAuthVisible(true)}>
                            <Icon icon="plusAlt" size={10} /> {t('addCustomNode:addAuthKey')}
                        </a>
                    )*/}

                        {customNodes.length ? (
                            <ul>
                                <Scrollbar>
                                    {customNodes.map(({ url }) => (
                                        <li key={url}>
                                            <strong>{url}</strong>
                                            <a href=" " onClick={() => removeCustomNode(url)}>
                                                <Icon icon="cross" size={16} />
                                            </a>
                                        </li>
                                    ))}
                                </Scrollbar>
                            </ul>
                        ) : (
                            <p>{t('nodeSettings:noCustomNodes')}</p>
                        )}

                        <Button
                            className="navleft"
                            onClick={onClose}
                            style={{ marginTop: '9vw', fontSize: '12px', minWidth: '140px' }}
                            variant="dark"
                        >
                            {t('back')}
                        </Button>
                        <Button
                            className="navright"
                            loading={loading}
                            onClick={this.addNode.bind(this)}
                            style={{ marginTop: '9vw', fontSize: '12px', minWidth: '90px' }}
                            variant="primary"
                        >
                            {t('addCustomNode')}
                        </Button>
                    </form>
                </section>
            </Modal>
        );
    }
}

export default connect(
    null,
    null,
)(withI18n()(NodeCustom));
