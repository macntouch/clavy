"use strict"

var React = require('react'),
    ProgressBar = require('./progress-bar.jsx');

var TaskProgress = React.createClass({
    render: function () {
        return (<div className="task-progress">
            <div className="task-title">{ this.props.item.title }</div>
            <ProgressBar value={ this.props.item.complete } />
        </div>);
    }
});

module.exports = TaskProgress;