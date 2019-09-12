import React from "react";
import css from "./settings.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withI18n, Trans } from "react-i18next";
import { Switch, Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Top from "../../components/topbar";
import Icon from "ui/components/icon";
import Sidebar from "../../components/sidebar";
import Text from "ui/components/input/text";
import Button from "ui/components/button";
// import NodeCustom from './NodeCustom';
import Select from "ui/components/input/select";

/**
 * Node settings component
 */

class SettingsNode extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    t: PropTypes.func.isRequired,
    
  };
  render() {
    const { location, history, t } = this.props;
    // const { customnode } = this.state;
    const [showCustomNodes, setshowCustomNodes] = useState(false);
    const currentKey = location.pathname.split("/")[2] || "/";
  //   if (showCustomNodes) {
  //     return <NodeCustom onClose={() => setshowCustomNodes(false)} />;
  // }

  const availableNodes = unionBy(customNodes, autoNodeList && nodes, nodeAutoSwitch && [DEFAULT_NODE], 'url');
    return (
      <div className={classNames(css.foo_bxx12)}>
        <div className={classNames(css.set_bxac)}>
          <h5 style={{ marginLeft: "14vw", marginTop: "4vw" }}>
            {t("advancedSettings:selectNode")}
          </h5>
          <h5 style={{ marginLeft: "14vw", marginTop: "11vw" }}>
            {t("advancedSettings:addCustomNode")}
          </h5>
          <Text
              // value={customnode}
              label={t("advancedSettings:addCustomNode")}
              onChange={value => this.setState({ customnode: value })}
            />
          <br />
          <br />
          <Button
            style={{ marginLeft: "14vw", marginTop: "4vw" }}
            onClick={() => this.stepForward("done")}
          >
            {t("global:save")}
          </Button>
          <div className={classNames(css.spe_bx)}></div>
        </div>
      </div>
    );
  }
}
const mapDispatchToProps = {};
export default connect(
  null,
  mapDispatchToProps
)(withI18n()(SettingsNode));
