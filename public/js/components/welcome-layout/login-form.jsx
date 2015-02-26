var React = require('react');

var LoginForm = React.createClass({
    render: function () {
        return (
            /*
            * Тут как то надо в одном блоке input и label
            *
            * #input-container
            *   #label
            *   #input
            *
            * еще так с label много че будет походу можно в компонент вынести типо:
            * <SmthWithLabel label="login"><input/></SmthWithLabel>
            * */

             <form className="form-margin" action="">
                <div className="input-label">
                    <label for="email">логин</label>
                </div>
                <div className="input-container">
                    <input type="email" id="email" autofocus/>
                </div>
                <div className="input-label">
                    <label for="password">пароль</label>
                </div>
                <div className="input-container">
                    <input type="password" id="password"/>
                </div>
            </form>
        );
    }
});

module.exports = LoginForm;