import React from 'react';

import { login } from 'api';


export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', 
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {    
    this.setState({[event.target.name]: event.target.value});  
  }

  handleSubmit(event) {
    event.preventDefault();
    login(this.state.username, this.state.password)
      .then(({ status }) => {
        if (status === 200) this.props.onSuccess();
        else this.props.onFail();
      });
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit }>        
        <label>Name: 
          <input 
            type="text" 
            name="username" 
            value={ this.state.username } 
            onChange={ this.handleChange } 
          />
        </label>
        <label>Password: 
          <input 
            type="password" 
            name="password" 
            value={ this.state.password } 
            onChange={ this.handleChange } 
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}