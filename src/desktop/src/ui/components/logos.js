import React from "react";
import css from "ui/components/logos.scss";
import fa from "./fontawesome.css";
import classNames from "classnames";
import log from "ui/images/log_icon.png";
import logo from "ui/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faPowerOff, faTh } from "@fortawesome/free-solid-svg-icons";
class Logos extends React.PureComponent {
  render() {
    return (
      <div className={classNames(css.top_sec1)}>
        <div className={classNames(css.lg_logos)}>
          <img src={logo} alt="" />
        </div>
      </div>
    );
  }
}
export default Logos;
