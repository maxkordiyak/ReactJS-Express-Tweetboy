import React, { Component } from 'react';
import Card from '@react-mdc/card'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import Button from '@react-mdc/button';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

export default class FollowingTable extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { selectRowProp } = this.props

    return(
      <Card>
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <ToolbarTitle style={{paddingLeft: 24}} text="Following list" />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <Button className={this.props.shouldHide ? 'hidden' : ''} raised onClick={() => this.props.autoUnfollow()}>Autounfollow</Button>
        </ToolbarGroup>
      </Toolbar>

        <div className="App-followingTableView">
          <BootstrapTable data={ this.props.followers["0"] } selectRow={ selectRowProp }
            tableHeaderClass='custom-select-header-class' tableBodyClass='custom-select-body-class'>
            <TableHeaderColumn headerAlign='center' dataField='follower_id' hidden={true} isKey>id</TableHeaderColumn>
            <TableHeaderColumn headerAlign='center' dataAlign='center' width={'100'} dataField='follower_image_url' dataFormat={this.props.imageFormatter}>Image</TableHeaderColumn>
            <TableHeaderColumn dataField='name' filter={ { type: 'TextFilter', delay: 500 } }>Name</TableHeaderColumn>
            <TableHeaderColumn dataField='followers_count'
            filter={ {
              type: 'NumberFilter',
              delay: 500,
              numberComparators: [ '=', '>', '<=' ]
            } }
            >Followers count</TableHeaderColumn>
            <TableHeaderColumn dataField='friends_count'>Following count</TableHeaderColumn>
            </BootstrapTable>
          </div>
      </Card>
    )
  }
}
