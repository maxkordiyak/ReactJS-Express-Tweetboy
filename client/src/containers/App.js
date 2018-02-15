import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Card from '@react-mdc/card'
import Toolbar from '@react-mdc/toolbar';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Protected from './Protected';
import UnauthorizedPage from  '../components/UnauthorizedPage';
import '@material/layout-grid/dist/mdc.layout-grid.css'

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import '../index.css'

class App extends Component {
  componentDidMount() {
    this.loadState()
  }

  constructor(props) {
    super(props);
    this.state = { total: 20, display: 7, number: 1, searchValue: '', completed: 0, max: 0, hideProgress: true, shouldHide: true, shouldHideAutoFollow: true, isAuthenticated: false, user: null, token: '', followers: [], searchResults: [], profilebanner: [], selectedRows: []};
    this.onAuthSuccess = this.onAuthSuccess.bind(this)
    this.handleSearchInputChange = this.handleSearchInputChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onAuthFail = this.onAuthFail.bind(this)
    this.autoUnfollow = this.autoUnfollow.bind(this)
    this.autoFollow = this.autoFollow.bind(this)
  }

  loadState() {
    const loadedState = localStorage.getItem('state');
    if (loadedState === null) {
      return undefined
    }
    const parsedState = JSON.parse(loadedState)
    this.setState({
      isAuthenticated: true,
      user: parsedState.user,
      followers: parsedState.followers,
      token: parsedState.token,
      profilebanner: parsedState.profilebanner
    })
  }

  fetchFollowers() {
    const URL = "http://dev.tweetboy.com/api/v1/fetchfollowers";
    return fetch(URL, { headers: {
      'Authorization': this.state.token,
      'x-auth-token': this.state.token
    }
    })
      .then(response=>  Promise.all([response.json()]));
  }

  fetchProfileBanner() {
    const URL = "http://dev.tweetboy.com/api/v1/fetchprofilebanner";
    return fetch(URL, { headers: {
      'Authorization': this.state.token,
      'x-auth-token': this.state.token
    }
    })
    .then(response=>  Promise.all([response.json()]));
  }

  onAuthSuccess = (response) => {
    const token = response.headers.get('x-auth-token');
    localStorage.setItem('token', token);
    response.json().then(user => {
      if (token) {
        this.setState({isAuthenticated: true, user: user, token: token});
        this.fetchFollowers().then(response => {
          this.setState({
            followers: response
          })
          const loadedState = localStorage.setItem('state', JSON.stringify(this.state));
        })
        this.fetchProfileBanner().then(response => {
          this.setState({
            profilebanner: response
          })
          const loadedState = localStorage.setItem('state', JSON.stringify(this.state));
        })
      }
    });
  };

  onAuthFail = (error) => {
    alert(error);
  };

  logout = () => {
    this.setState({ isAuthenticated: false, token: '', user: null, selectedRows: [], followers: [], profilebanner: [], selectedRows: [], searchResults: [], completed:0, max: 0, hideProgress: true })
    localStorage.removeItem('token');
    localStorage.removeItem('state');

  };

  onRowSelect(id, isSelected) {
    if (isSelected) {
      this.setState({
        selectedRows : [...this.state.selectedRows, id],
        shouldHide: false
      })
    } else {
      this.setState({
        selectedRows: this.state.selectedRows.filter(it => it !== id)
      })
    }
  }

  onSelectAll(isSelected) {
    if (isSelected) {
      this.setState({
        selectedRows : this.state.followers["0"].map(follower => follower),
        shouldHide: !this.state.shouldHide
      })
    } else {
      this.setState({
        selectedRows : [],
        shouldHide: true
      })
    }
  }

  autoUnfollow() {
    this.setState({hideProgress: false, max: this.state.selectedRows.length})
    this.state.selectedRows.map(
      item => fetch("http://dev.tweetboy.com/api/v1/unfollow", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.state.token,
          'x-auth-token': this.state.token
        },
        body: JSON.stringify({'id': item.follower_id})
      }).then((response) => {
        this.setState({
          completed: this.state.completed + 1
        })
        if (this.state.completed === this.state.max) {
          this.fetchFollowers().then(response => {
            setTimeout(() => {
              this.setState({
                hideProgress: true,
                followers:response
              })
            }, 1000)
          })
        }
      console.log('you unfollowerd', item.follower_id)
    })
    )
  }

  onRowSelectSearch(id, isSelected) {
    if (isSelected) {
      this.setState({
        selectedRows : [...this.state.selectedRows, id],
        shouldHideAutoFollow: false
      })
    } else {
      this.setState({
        selectedRows: this.state.selectedRows.filter(it => it !== id)
      })
    }
  }

  onSelectAllSearch(isSelected) {
    if (isSelected && this.state.searchResults.length > 0) {
      this.setState({
        selectedRows : this.state.searchResults["0"].map(follower => follower),
        shouldHideAutoFollow: !this.state.shouldHideAutoFollow
      })
    } else {
      this.setState({
        selectedRows : [],
        shouldHideAutoFollow: true
      })
    }
  }

  handleSearchInputChange(event) {
    this.setState({
      searchValue: event.target.value
    })
  }

  handleSearch() {
     console.log('test', this.state.searchValue, this.state.number)
     var url = new URL("http://dev.tweetboy.com/api/v1/search"), params = {param: this.state.searchValue, page:this.state.number}
     Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
     fetch(url, {
       method: "get",
       headers: {
         'Authorization': this.state.token,
         'x-auth-token': this.state.token
       }
     })
     .then((response) => {
       Promise.all([response.json()]).then(response => {
         this.setState({
           searchResults: response
         })
         console.log(this.state)
       })
     });
  }

  autoFollow() {
    this.setState({hideProgress: false, max: this.state.selectedRows.length})
    this.state.selectedRows.map(
      item => fetch("http://dev.tweetboy.com/api/v1/follow", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.state.token,
          'x-auth-token': this.state.token
        },
        body: JSON.stringify({'id': item.user_id})
      }).then((response) => {
          this.setState({
            completed: this.state.completed + 1
          })
          if (this.state.completed === this.state.max) {
            this.fetchFollowers().then(response => {
              setTimeout(() => {
                this.setState({
                  hideProgress: true,
                  followers:response
                })
              }, 1000)
            })
          }
        console.log('you unfollowerd', item.follower_id)
      })
    )
  }

  render() {
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      onSelect: this.onRowSelect.bind(this),
      onSelectAll: this.onSelectAll.bind(this)
    };
    const selectRowPropSearch = {
      mode: 'checkbox',
      clickToSelect: true,
      onSelect: this.onRowSelectSearch.bind(this),
      onSelectAll: this.onSelectAllSearch.bind(this)
    };

    let content = !!this.state.isAuthenticated ?
      (
        <div>
          <Protected selectRowProp={selectRowProp} selectRowPropSearch={selectRowPropSearch} state={this.state} logout={this.logout} handleSearch={this.handleSearch} handleSearchInputChange={this.handleSearchInputChange} autoUnfollow={this.autoUnfollow.bind(this)} autoFollow={this.autoFollow.bind(this)}  />
        </div>
      ) :
      (
        <UnauthorizedPage onAuthFail={(error) => this.onAuthFail(error)} onAuthSuccess={(response) => this.onAuthSuccess(response)} />
      );

    return (
      <MuiThemeProvider>
        <div className="App">
          {content}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
