// Note that native HTML element names start with a lowercase letter, 
// while custom React class names begin with an uppercase letter.

var Person = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="person">
        <h2 className="personName">
          {this.props.firstName}
          {' '}
          {this.props.lastName}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var PersonBox = React.createClass({
  loadPeopleFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handlePersonSubmit: function(person) {
    var people = this.state.data;
    // Optimistically set an id on the new person. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    person.personID = Date.now();
    var newPeople = people.concat([person]);
    this.setState({data: newPeople});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: person,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: people});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadPeopleFromServer();
    setInterval(this.loadPeopleFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="personBox">
        <h1>People</h1>
        <PersonList data={this.state.data} />
        <PersonForm onPersonSubmit={this.handlePersonSubmit} />
      </div>
    );
  }
});

var PersonList = React.createClass({
  render: function() {
    var personNodes = this.props.data.map(function(person) {
      return (
        <Person firstName={person.firstName} lastName={person.lastName} key={person.personID}>
          {person.startDate}
        </Person>
      );
    });
    return (
      <div className="personList">
        {personNodes}
      </div>
    );
  }
});

var PersonForm = React.createClass({
  getInitialState: function() {
    return {firstName: '', lastName: '', startDate: ''};
  },
  handleFirstNameChange: function(e) {
    this.setState({firstName: e.target.value});
  },
  handleLastNameChange: function(e) {
    this.setState({lastName: e.target.value});
  },
  handleStartDateChange: function(e) {
    this.setState({startDate: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var firstName = this.state.firstName.trim();
    var lastName = this.state.lastName.trim();
    var startDate = this.state.startDate.trim();
    if (!startDate || !firstName || !lastName) {
      return;
    }
    this.props.onPersonSubmit({firstName: firstName, lastName: lastName, startDate: startDate});
    this.setState({firstName: '', lastName: '', startDate: ''});
  },
  render: function() {
    return (
      <form className="personForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="First name"
          value={this.state.firstName}
          onChange={this.handleFirstNameChange}
        />
        <input
          type="text"
          placeholder="Last name"
          value={this.state.lastName}
          onChange={this.handleLastNameChange}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={this.state.startDate}
          onChange={this.handleStartDateChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
  <PersonBox url="/people" pollInterval={2000} />,
  document.getElementById('content')
);
