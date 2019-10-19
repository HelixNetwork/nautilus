import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateTheme } from 'actions/settings';
import { getThemeFromState } from 'selectors/global';

/**
 * Theming style provider component
 */
class Theme extends PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        updateTheme: PropTypes.func.isRequired,
    };

    state = {
        themeIndex: 0,
        originalTheme: 'Default',
        routeIndex: 0,
    };

    componentDidMount() {
        this.updateTheme(this.props.theme);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.updateTheme(nextProps.theme);
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    updateTheme(theme) {
        Object.keys(theme).forEach((colorsName) => {
            const colorSet = theme[colorsName];

            Object.keys(colorSet).forEach((colorName) => {
                if (colorName === 'color') {
                    document.documentElement.style.setProperty(`--${colorsName}`, colorSet.color);
                } else {
                    document.documentElement.style.setProperty(`--${colorsName}-${colorName}`, colorSet[colorName]);
                }
            });
        });
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Theme);
