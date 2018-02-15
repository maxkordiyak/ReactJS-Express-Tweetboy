import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Permanent} from '@react-mdc/drawer';
import LinearProgress from 'material-ui/LinearProgress';

export default class Sidebar extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <Permanent>
        {
        Array.isArray(this.props.profilebanner) &&
        Array.isArray(this.props.profilebanner[0]) &&
        this.props.profilebanner[0].length &&
        this.props.profilebanner["0"].map((profilebanner) => {
        return(
        <Permanent.ToolbarSpacer className="Toolbar-spacer" style={ { backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${ profilebanner.myinfo_banner })` } }>
        <ul className="mdc-list mdc-list--two-line mdc-list--dense mdc-list--avatar-list Toolbar-userinfo">
          <li className="mdc-list-item">
            <img className="mdc-list-item__start-detail" style={{marginRight: 16 + 'px'}} src={profilebanner.myinfo_image_url} width="56" height="56" />
            <span className="mdc-list-item__text">
              {profilebanner.myinfo_screen_name}
              <span className="mdc-list-item__text__secondary">{profilebanner.myinfo_real_name}</span>
            </span>
          </li>
        </ul>
        </Permanent.ToolbarSpacer>
        )
        })
        }
        <Permanent.Content>
        <div className="mdc-list-group">
        <ul className="mdc-list mdc-list--two-line mdc-list--avatar-list two-line-avatar-text-icon-demo">
        <li onClick={this.props.logout} className="mdc-list-item">
         <span className="mdc-list-item__start-detail">
          <i className="material-icons mdc-list-item__start-detail" aria-hidden="true">exit_to_app</i>
         </span>
         <span className="mdc-list-item__text">
           Log out
           <span className="mdc-list-item__text__secondary Toolbar-email">{this.props.user.email}</span>
         </span>
        </li>
        </ul>
        <hr className="mdc-list-divider" />
          <li className={this.props.hideProgress ? 'hidden' : 'mdc-list-item'}>
              <LinearProgress mode="determinate" value={this.props.completed} max={this.props.max} />
          </li>
        </div>
        </Permanent.Content>
        </Permanent>
    )
  }
}
