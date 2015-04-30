"use strict"

var React = require('react'),
    lz = require('localization').get(),
    api = require('../libs/api'),
    route = require('page'),
    authorizer = require('libs/authorizer'),
    WelcomeBlock = require('components/welcome/welcome-block.jsx');

var Login = React.createClass({
    getInitialState: function () {
        return {
            isSubmitting: false,
            validationMessage: ''
        }
    },

    init: function (welcome) {
        this.props.onInit(welcome);
    },

    enableForm: function (enable) {
        this.setState({
            isSubmitting: !enable
        });
    },

    showValidationError: function (message) {
        this.setState({
            validationMessage: message
        })
    },

    handleSubmit: function (e) {
        e.preventDefault();

        this.enableForm(false);

        var email = this.refs.email.getDOMNode().value.trim();
        var password = this.refs.password.getDOMNode().value.trim();
        var data = {
            email: email,
            password: password
        };

        var that = this;
        api.auth.login(data, function (result) {
            if (result.success) {
                authorizer.init(function () {
                    route('/');
                });
            }
            else {
                that.showValidationError(result);
                that.enableForm(true);
            }
        });
    },

    render: function () {
        return (<WelcomeBlock onInit={ this.init } title={ lz.LOGIN }>

            { this.state.validationMessage ?
                <div className="error-message"><span>{this.state.validationMessage}</span></div>
                : null }

            <form className="public-form" onSubmit={this.handleSubmit}>
                <section>
                    <label className="public-label">{ lz.LOGIN }</label>
                    <input ref="email" name="email" type="text" className="public-input"/>

                    <label className="public-label margin-top">{ lz.PASSWORD }</label>
                    <input ref="password" name="password" type="password" className="public-input"/>
                </section>
                <section className="text-center">
                    <input type="submit" className="base-button" disabled={this.state.isSubmitting} value={ lz.ENTER }/>
                </section>
            </form>

        </WelcomeBlock>);
    }
});

module.exports = Login;