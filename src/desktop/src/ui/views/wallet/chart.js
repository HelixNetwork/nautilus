import React from 'react';
import { connect } from 'react-redux';
import css from './wallet.scss';
import classNames from 'classnames';
import Top from '../../components/topbar';
import PropTypes from 'prop-types';
import reload from 'ui/images/refresh.svg';
import { withI18n } from 'react-i18next';
class Chart extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {
        const { t } = this.props;
        return (
            <div>
                <section className={css.home}>

                    <Top
                        disp={'block'}
                        history={this.props.history}
                    />
                    <div className={classNames(css.pg1_foo3)}>
                        <div className="container">
                            <div className="row">

                                <div className="col-lg-12">
                                    <div className={classNames(css.foo_bxx1)}>
                                       <h5>Overview HLX chart</h5>
                                        <div className={classNames(css.sseed_box2, css.sec_bxc)}>
                                          

                                        </div>
                                    
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <ul>
                        <li className={classNames(css.footer)}><a href="#">0</a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li className="db_none"><a href="#">5</a></li>
                    </ul>
                </section>
            </div>
        )
    }
}
const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(Chart));