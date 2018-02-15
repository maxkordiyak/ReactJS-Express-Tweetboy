import React, { Component } from 'react';
import Card from '@react-mdc/card'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import FlatButton from 'material-ui/FlatButton';
import Button from '@react-mdc/button';
import TextField from 'material-ui/TextField';
import {orange500, blue500} from 'material-ui/styles/colors';
import Pagination from 'material-ui-pagination';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

export default class SearchTable extends Component {
  constructor(props) {
    super(props)
}

  render() {
    const { selectRowPropSearch } = this.props
    const styles = {
      errorStyle: {
        color: orange500,
      },
      underlineStyle: {
        borderColor: '#062F4F',
      },
      floatingLabelStyle: {
        color: orange500,
      },
      floatingLabelFocusStyle: {
        color: blue500,
      },
    };
    return(
      <Card>
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <TextField style={{paddingLeft: 14}} onChange={this.props.handleSearchInputChange}
              underlineFocusStyle={styles.underlineStyle}
              underlineStyle={styles.underlineStyle}
              hintText="Browse twitter accounts"
            />
            <FlatButton label="Search" style={{marginLeft: 14, color:'#00695C'}} onClick={this.props.handleSearch} />
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <Button raised className={this.props.shouldHideAutoFollow ? 'hidden' : ''} onClick={() => this.props.autoFollow()}>Autofollow</Button>
          </ToolbarGroup>
        </Toolbar>

        <div className="App-followingTableView">
          <BootstrapTable data={ this.props.searchResults["0"] } selectRow={ selectRowPropSearch }
            tableHeaderClass='custom-select-header-class' tableBodyClass='custom-select-body-class'>
            <TableHeaderColumn headerAlign='center' dataField='user_id' hidden={true} isKey>id</TableHeaderColumn>
            <TableHeaderColumn headerAlign='center' dataAlign='center'  width={'100'} dataField='user_image.url' dataFormat={this.props.imageFormatter}>Image</TableHeaderColumn>
            <TableHeaderColumn headerAlign='center' dataField='user_name' filter={ { type: 'TextFilter', delay: 500 } }>Name</TableHeaderColumn>
            <TableHeaderColumn headerAlign='center' dataField='user_followers_count'
            filter={ {
              type: 'NumberFilter',
              delay: 500,
              numberComparators: [ '=', '>', '<=' ]
            } }
            >Followers count</TableHeaderColumn>
            </BootstrapTable>
          </div>
      </Card>
    )
  }
}
