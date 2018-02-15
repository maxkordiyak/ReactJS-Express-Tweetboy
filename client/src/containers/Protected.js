import React, { Component } from 'react';

import Sidebar from '../components/Sidebar'
import Header from '../components/layout/Header';
import FollowingTable from '../components/FollowingTable'
import SearchTable from '../components/SearchTable'
import UnauthorizedPage from '../components/UnauthorizedPage'

import LayoutGrid from '@react-mdc/layout-grid'

class Protected extends Component {
  constructor(props) {
    super(props);
    this.imageFormatter = this.imageFormatter.bind(this);
  }

  imageFormatter(cell, row) {
    return "<img src='"+cell+"'/>" ;
  };

  render() {
    const {selectRowProp,selectRowPropSearch} = this.props;

    return(
        <div className="App-content-wrapper">
          <Sidebar hideProgress={this.props.state.hideProgress} user={this.props.state.user} logout={this.props.logout} profilebanner={this.props.state.profilebanner} completed={this.props.state.completed} max={this.props.state.max} />
            <div className="App-content">
              <Header />
              <div className="App-main">
              <LayoutGrid style={{padding: 0}} gutter={2}>
                <LayoutGrid.Cell span={6}
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start"
                }}>
                <FollowingTable shouldHide={this.props.state.shouldHide} autoUnfollow={this.props.autoUnfollow} selectRowProp={selectRowProp} onRowSelect={(row, isSelected) => this.onRowSelect(row, isSelected)} followers={this.props.state.followers} imageFormatter={this.imageFormatter} />
                </LayoutGrid.Cell>
                <LayoutGrid.Cell span={6}
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start"
                }}>
                  <SearchTable searchValue={this.props.state.searchValue} autoFollow={this.props.autoFollow} shouldHideAutoFollow={this.props.state.shouldHideAutoFollow} handleSearch={this.props.handleSearch} handleSearchInputChange={this.props.handleSearchInputChange} searchResults={this.props.state.searchResults} selectRowPropSearch={selectRowPropSearch} imageFormatter={this.imageFormatter}/>
                </LayoutGrid.Cell>
              </LayoutGrid>
              </div>
            </div>
        </div>
    )
  }
}
export default Protected
