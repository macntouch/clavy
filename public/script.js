(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    TaskManager = React.createFactory(require('taskManager.jsx')),
    Popup = React.createFactory(require('./popup/popup.jsx'));

React.render(new TaskManager(), document.getElementById('application'));
React.render(new Popup(), document.getElementById('modal'));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./popup/popup.jsx":54,"taskManager.jsx":65}],2:[function(require,module,exports){
"use strict"

var appDispatcher = require('appDispatcher'),
    ACTION_TYPES = require('constants/actionTypes');

var appActions = {
    changePage: function (page) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.CHANGE_PAGE,
            page: page
        });
    }
};

module.exports = appActions;
},{"appDispatcher":5,"constants/actionTypes":28}],3:[function(require,module,exports){
"use strict"

var appDispatcher = require('appDispatcher'),
    lzSn = require('localization').get('sentences'),
    api = require('api'),
    quickTaskAddStore = require('stores/quickTaskAddStore'),
    popup = require('../popup/main'),
    ACTION_TYPES = require('constants/actionTypes');

var quickTaskAddActions = {
    startAddTask: function () {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.START_ADD_TASK
        });
    },

    stopAddTask: function () {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.STOP_ADD_TASK
        });
    },

    setAdditionTaskTitle: function (title) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.SET_ADDITION_TASK_TITLE,
            title: title
        });
    },

    setAdditionTaskForToday: function () {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.SET_ADDITION_TASK_DATE,
            today: true,
            date: new Date()
        });
    },

    setAdditionTaskForDate: function (date) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.SET_ADDITION_TASK_DATE,
            today: false,
            date: date || null
        });
    },

    setAdditionTaskPriority: function (priority) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.SET_ADDITION_TASK_PRIORITY,
            priority: priority
        });
    },

    saveAdditionTask: function () {
        var savingTask = quickTaskAddStore.getTask();

        if (savingTask.today) {
            quickTaskAddActions.saveTask(savingTask);
            return;
        }

        popup.confirm({
            title: lzSn.ASK_SET_DATE,
            detail: lzSn.ASK_SET_DATE_DETAIL,
            yes: lzSn.SET_DATE_CONFIRM,
            defaultValue: false
        }).then(function (setDate) {
            if (!setDate) return;
            return popup.calendar();
        }).then(function (res) {
            res = res || {};
            savingTask.date = res.date || null;
            savingTask.timeWasSet = res.timeWasSet || false;
            quickTaskAddActions.saveTask(savingTask);
        });
    },

    saveTask: function (task) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.SAVING_ADDITION_TASK,
            task: task
        });
        
        api.tasks.save(task, function (savedTask) {
            appDispatcher.handleViewAction({
                type: ACTION_TYPES.SAVED_TASK,
                task: savedTask
            });
        });
    },

    changeAdditionBlock: function (block) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.CHANGE_QUICK_ADD_BLOCK,
            block: block
        });
    }
};

module.exports = quickTaskAddActions;
},{"../popup/main":53,"api":33,"appDispatcher":5,"constants/actionTypes":28,"localization":39,"stores/quickTaskAddStore":63}],4:[function(require,module,exports){
"use strict"

var _updateTask,
    appDispatcher = require('appDispatcher'),
    lzSn = require('localization').get('sentences'),
    popup = require('../popup/main'),
    api = require('api'),
    ACTION_TYPES = require('constants/actionTypes');

_updateTask = function (task) {
    appDispatcher.handleViewAction({
        type: ACTION_TYPES.TASK_UPDATED,
        task: task
    });
};

var taskActions = {
    receiveTasks: function () {
        api.tasks.get(function (tasks) {
            taskActions.putPack(tasks);
        });
    },
    putPack: function (tasks) {
        appDispatcher.handleViewAction({
            type: ACTION_TYPES.PUT_TASKS_PACK,
            tasks: tasks
        });
    },
    markAsDone: function (id) {
        api.tasks.update(id, { done: true }, function (task) {
            _updateTask(task); 
        });
    },
    makeActive: function (id) {
        api.tasks.update(id, { done: false }, function (task) {
           _updateTask(task); 
        });
    },
    postponeTask: function (id) {
        popup.confirm({
            title: lzSn.ASK_SET_DATE,
            detail: lzSn.ASK_SET_DATE_DETAIL,
            yes: lzSn.SET_DATE_CONFIRM,
            defaultValue: false
        }).then(function (setDate) {
            if (!setDate) return;
            return popup.calendar();
        }).then(function (res) {
            res = res || {};
            api.tasks.update(id, { 
                date: res.date || null,
                timeWasSet: res.timeWasSet || false,
            }, function (task) {
                _updateTask(task);
            });          
        });
    },
    forToday: function (id) {
        api.tasks.update(id, { date: new Date(), today: true }, function (task) {
            _updateTask(task);
        });
    }
};

module.exports = taskActions;
},{"../popup/main":53,"api":33,"appDispatcher":5,"constants/actionTypes":28,"localization":39}],5:[function(require,module,exports){
(function (global){
"use strict"

var Dispatcher = (typeof window !== "undefined" ? window.libs.Dispatcher : typeof global !== "undefined" ? global.libs.Dispatcher : null),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    PAYLOAD_SOURCES = require('constants/payloadSources');

var appDispatcher = assign(new Dispatcher(), {
    handleViewAction: function (action) {
        var payload = {
            source: PAYLOAD_SOURCES.VIEW_ACTION,
            action: action
        };

        this.dispatch(payload);
    },
    
    handleServerAction: function (action) {
        var payload = {
            source: PAYLOAD_SOURCES.SERVER_ACTION,
            action: action
        };

        this.dispatch(payload);
    }
});

module.exports = appDispatcher;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"constants/payloadSources":31}],6:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    mixins = require('mixins/main');

var SwitchButton = React.createClass({displayName: "SwitchButton",
    mixins: mixins('dynamicStyle'),

    _selectButton: function (key) {
        this.setState({
            select: key
        });
    },

    _handleClick: function (key) {
        var allow = this.props.onChange(key);

        if (allow) {
            this._selectButton(key);
        }
    },

    getInitialState: function () {
        return {
            display: 'none',
            select: ''
        }
    },

    componentDidMount: function () {
        if (typeof this.props.defaultButton !== 'undefined') {
            this._selectButton(this.props.defaultButton);
        }

        if (typeof this.props.init !== 'undefined' ) {
            this.props.init({
                select: this._selectButton
            });
        }
    },

    componentWillUpdate: function (nextProps, nextState) {
        if (typeof nextProps.value !== 'undefined') {
            nextState.select = nextProps.value;
        }
    },

    render: function () {
        var that = this,
            buttons = [];

        Object.keys(this.props.buttons).forEach(function (key) {
            var title = that.props.buttons[key],
                className = that.cs({
                    'active': that.state.select === key
                });

            buttons.push(React.createElement("button", {key: key, onClick:  that._handleClick.bind(that, key), className: className }, title ));
        });

        return (React.createElement("div", {className: "switch-button"}, 
            buttons 
        ));
    }
});

module.exports = SwitchButton;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"mixins/main":46}],7:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    SideBlock = require('./../side-bar/side-block.jsx');

var DeskLayout = React.createClass({displayName: "DeskLayout",
    render: function () {
        return (React.createElement("div", {className: "desk"}, 
            React.createElement("div", {className: "left-block"}, 
                React.createElement(SideBlock, null)
            ), 
            React.createElement("div", {className: "content-block"}, 
                 this.props.children
            )
        ));
    }
});

module.exports = DeskLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../side-bar/side-block.jsx":16}],8:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    HeaderMenu = require('components/welcome/header-menu');

var WelcomeLayout = React.createClass({displayName: "WelcomeLayout",
    render: function () {
        return (React.createElement("div", {className: "overflow-hidden"}, 
            React.createElement(HeaderMenu, null), 
            React.createElement("div", null, 
              this.props.children
            )
        ))
    }
});

module.exports = WelcomeLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"components/welcome/header-menu":25}],9:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    quickTaskAddActions = require('actions/quickTaskAddActions'),
    SvgIco = require('../svg-ico.jsx');

var TaskAddButton = React.createClass({displayName: "TaskAddButton",
    handleClick: function () {
        quickTaskAddActions.saveAdditionTask();
    },

    render: function () {
        return (React.createElement("button", {onClick: this.handleClick, button: true, className: "tall-button material-button"}, 
            React.createElement("span", null,  lz.ADD), 
            React.createElement("i", {className: "margin-left ico"}, React.createElement(SvgIco, {name: "plus"}))
        ));
    }
});

module.exports = TaskAddButton;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../svg-ico.jsx":18,"actions/quickTaskAddActions":3,"localization":39}],10:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    mixins = require('mixins/main'),
    QUICK_ADD_BLOCKS = require('constants/quickTaskAddBlocks'),
    quickTaskAddStore = require('stores/quickTaskAddStore'),
    quickTaskAddActions = require('actions/quickTaskAddActions'),
    SvgIco = require('../svg-ico.jsx');

var TaskPriority = React.createClass({displayName: "TaskPriority",
    mixins: mixins('dynamicStyle', 'bindToStore'),
    bindingStores: [quickTaskAddStore],

    getInitialState: function () {
        return {
            active: quickTaskAddStore.activeBlock() == QUICK_ADD_BLOCKS.PRIORITY,
            priority: quickTaskAddStore.priority()
        }
    },

    handleStarClick: function (priority) {
        quickTaskAddActions.setAdditionTaskPriority(priority);
    },

    handleClick: function () {
        quickTaskAddActions.changeAdditionBlock(QUICK_ADD_BLOCKS.PRIORITY);
    },

    createStar: function (priority, index) {
        return (React.createElement("i", {key: index, onClick:  this.handleStarClick.bind(this, priority), className:  this.cs({ 'ico margin-right': true, 'active': priority <= this.state.priority }) }, 
            React.createElement(SvgIco, {name: "star"})
        ));
    },

    render: function () {
        var priorities = [1,2,3,4,5];

        return (React.createElement("div", {onClick:  this.handleClick, className:  this.cs({ 'task-priority': true, 'active': this.state.active }) }, 
            React.createElement("strong", null,  lz.PRIORITY), 
            React.createElement("section", null, 
                 priorities.map(this.createStar) 
            )
        ));
    }
});

module.exports = TaskPriority;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../svg-ico.jsx":18,"actions/quickTaskAddActions":3,"constants/quickTaskAddBlocks":32,"localization":39,"mixins/main":46,"stores/quickTaskAddStore":63}],11:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    mixins = require('mixins/main'),
    quickTaskAddStore = require('stores/quickTaskAddStore'),
    TaskTextBox = require('./task-text-box.jsx'),
    TaskSelectDate = require('./task-select-date.jsx'),
    TaskPriority = require('./task-priority.jsx'),
    TaskAddButton = require('./task-add-button.jsx');

var TaskQuickAdd = React.createClass({displayName: "TaskQuickAdd",
    mixins: mixins('dynamicStyle', 'bindToStore'),
    bindingStores: [quickTaskAddStore],

    getInitialState: function () {
        return {
            displayExtra: quickTaskAddStore.startedAdd()
        }
    },
    
    render: function () {
        return (React.createElement("div", {className: "material-block"}, 
            React.createElement("div", {className: "task-base-add"}, 
                React.createElement(TaskTextBox, null), 
                React.createElement(TaskSelectDate, null)
            ), 
            React.createElement("div", {className:  this.cs({ 'task-extra-add': true, 'hidden': !this.state.displayExtra }) }, 
                React.createElement(TaskPriority, null), 
                React.createElement(TaskAddButton, null)
            )
        ));
    }
});

module.exports = TaskQuickAdd;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./task-add-button.jsx":9,"./task-priority.jsx":10,"./task-select-date.jsx":12,"./task-text-box.jsx":13,"mixins/main":46,"stores/quickTaskAddStore":63}],12:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    SwitchButton = require('components/common/switch-button'),
    lz = require('localization').get(),
    quickAddStore = require('stores/quickTaskAddStore'),
    quickAddActions = require('actions/quickTaskAddActions'),
    QUICK_ADD_BLOCKS = require('constants/quickTaskAddBlocks'),
    mixins = require('mixins/main');

var SelectDate = React.createClass({displayName: "SelectDate",
    mixins: mixins('dynamicStyle', 'bindToStore'),
    bindingStores: [quickAddStore],

    _handleClick: function () {
        quickAddActions.changeAdditionBlock(QUICK_ADD_BLOCKS.SELECT_DATE);
    },

    _handleSwitchChange: function (key) {
        switch (key) {
            case 'today':
                quickAddActions.setAdditionTaskForToday();
                break;
            case 'then':
                quickAddActions.setAdditionTaskForDate();
                break;
        }

        return true;
    },

    getInitialState: function () {
        return {
            display: quickAddStore.startedAdd(),
            taskForToday:quickAddStore.forToday(),
            active: quickAddStore.activeBlock() === QUICK_ADD_BLOCKS.SELECT_DATE
        }
    },

    render: function () {
        var buttons = {
            today: lz.TODAY,
            then: lz.THEN
        },
        className = this.cs({
            'task-select-date': true,
            'active': this.state.active,
            'hidden': !this.state.display
        });

        return (React.createElement("div", {onClick:  this._handleClick, className: className }, 
            React.createElement(SwitchButton, {
                onChange:  this._handleSwitchChange, 
                buttons: buttons, 
                value:  this.state.taskForToday ? 'today' : 'then'})
        ));
    }
});

module.exports = SelectDate;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/quickTaskAddActions":3,"components/common/switch-button":6,"constants/quickTaskAddBlocks":32,"localization":39,"mixins/main":46,"stores/quickTaskAddStore":63}],13:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    linkedList = (typeof window !== "undefined" ? window.libs.LinkedList : typeof global !== "undefined" ? global.libs.LinkedList : null),
    quickAddActions = require('actions/quickTaskAddActions'),
    quickAddStore = require('stores/quickTaskAddStore'),
    QUICK_ADD_BLOCKS =  require('constants/quickTaskAddBlocks'),
    mixins = require('mixins/main'),
    keySwitch = require('key-switch'),
    lz = require('localization').get();

var TaskTextBox = React.createClass({displayName: "TaskTextBox",
    mixins: mixins('bindToStore', 'dynamicStyle'),
    bindingStores: [quickAddStore],

    getInitialState: function () {
        return {
            active: quickAddStore.activeBlock() == QUICK_ADD_BLOCKS.TEXT_BOX,
            taskTitle: quickAddStore.title(),
            activeBlock: quickAddStore.activeBlock(),
            allowKeyCommand: quickAddStore.startedAdd()
        }
    },

    componentWillMount: function () {
        this.blocks = new linkedList(QUICK_ADD_BLOCKS.TEXT_BOX, QUICK_ADD_BLOCKS.SELECT_DATE, QUICK_ADD_BLOCKS.PRIORITY);
    },

    handleClick: function () {
        quickAddActions.changeAdditionBlock(QUICK_ADD_BLOCKS.TEXT_BOX);
        this.blocks.reset();
    },

    handleChange: function () {
        var title = this.refs.textBox.getDOMNode().value;

        if (title === '' && quickAddStore.startedAdd())
            quickAddActions.stopAddTask();

        if (title !== '' && !quickAddStore.startedAdd())
            quickAddActions.startAddTask();

        quickAddActions.setAdditionTaskTitle(title);
    },

    handleKeyDown: function (syntheticEvent) {
        if (!this.state.allowKeyCommand) {
            return;
        }

        var that = this;

        keySwitch(syntheticEvent.keyCode, {
            'enter': function () {
                quickAddActions.saveAdditionTask();
            },

            'esc': function () {
                quickAddActions.stopAddTask();
            },

            'tab': function () {
                syntheticEvent.preventDefault();
                quickAddActions.changeAdditionBlock(that.blocks.next(true));
            },

            'upArrow': function () {
                syntheticEvent.preventDefault();
                quickAddActions.changeAdditionBlock(that.blocks.prev());
            },

            'downArrow': function () {
                syntheticEvent.preventDefault();
                quickAddActions.changeAdditionBlock(that.blocks.next());
            },

            'leftArrow': function () {
                switch (that.state.activeBlock) {
                    case QUICK_ADD_BLOCKS.SELECT_DATE:
                        syntheticEvent.preventDefault();
                        quickAddActions.setAdditionTaskForToday();
                        break;
                    case QUICK_ADD_BLOCKS.PRIORITY:
                        syntheticEvent.preventDefault();
                        var newPriority = quickAddStore.priority() - 1;
                        quickAddActions.setAdditionTaskPriority(newPriority);
                        break;
                }
            },

            'rightArrow': function () {
                switch (that.state.activeBlock) {
                    case QUICK_ADD_BLOCKS.SELECT_DATE:
                        syntheticEvent.preventDefault();
                        quickAddActions.setAdditionTaskForDate();
                        break;
                    case QUICK_ADD_BLOCKS.PRIORITY:
                        syntheticEvent.preventDefault();
                        var newPriority = quickAddStore.priority() + 1;
                        quickAddActions.setAdditionTaskPriority(newPriority);
                        break;
                }
            }
        });
    },

    render: function () {
        return (React.createElement("div", {className:  this.cs({ 'task-text-box': true, 'active': this.state.active }) }, 
            React.createElement("input", {ref: "textBox", 
                onChange:  this.handleChange, 
                onKeyDown:  this.handleKeyDown, 
                onClick:  this.handleClick, 
                value:  this.state.taskTitle, 
                type: "text", placeholder:  lz.ADD_TASK})
        ));
    }
});

module.exports = TaskTextBox;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/quickTaskAddActions":3,"constants/quickTaskAddBlocks":32,"key-switch":37,"localization":39,"mixins/main":46,"stores/quickTaskAddStore":63}],14:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null);

var Clock = React.createClass({displayName: "Clock",
    render: function () {
        return (React.createElement("div", {className: "clock"}, 
            React.createElement("strong", null, "13:56"), 
            React.createElement("small", null, "sunday, 9 february")
        ));
    }
});

module.exports = Clock;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    pageStore = require('stores/pageStore'),
    mixins = require('mixins/main'),
    PAGES = require('constants/pages');

var Navigation = React.createClass({displayName: "Navigation",
    mixins: mixins('dynamicStyle', 'bindToStore'),
    bindingStores: [pageStore],

    getInitialState: function () {
        return {
            activePageName: pageStore.currentPageName()
        };
    },

    createLink: function (link, index) {
        var className = this.cs({
            'active': link.pageName == this.state.activePageName
        });

        return React.createElement("li", {key: index, className: className}, React.createElement("a", {href:  link.href},  link.title, React.createElement("i", {className: "underline"})))
    },

    render: function () {
        var links = [

            { title: lz.DESK, pageName: PAGES.DESK, href: '/' },
            { title: lz.PROFILE, pageName: PAGES.PROFILE, href: '/profile' },
            {title: lz.EXIT, pageName: PAGES.NONE, href: '/api/auth/logout'}

        ];

        return (React.createElement("ul", {className: "navigation"}, 
             links.map(this.createLink) 
        ))
    }
});

module.exports = Navigation;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"constants/pages":30,"localization":39,"mixins/main":46,"stores/pageStore":62}],16:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    Navigation = require('./navigation.jsx'),
    Clock = require('./clock.jsx'),
    ToolBar = require('../tool-bar/tool-bar.jsx'),
    UpcomingTasks = require('./upcoming-tasks.jsx');

var SideBlock = React.createClass({displayName: "SideBlock",
    render: function () {

        return (React.createElement("div", {className: "side-block"}, 

            React.createElement("div", {className: "section"}, 
                React.createElement(Clock, null), 
                React.createElement("div", {className: "part"}, 
                    React.createElement(ToolBar, null)
                ), 
                React.createElement("div", {className: "part"}, 
                    React.createElement(UpcomingTasks, null)
                )
            ), 

            React.createElement("div", {className: "section"}, 
                React.createElement(Navigation, null)
            )
        ));
    }
});

module.exports = SideBlock;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../tool-bar/tool-bar.jsx":24,"./clock.jsx":14,"./navigation.jsx":15,"./upcoming-tasks.jsx":17}],17:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    dater = require('libs/dater'),
    tasksStore = require('stores/tasksStore'),
    mixins = require('mixins/main'),
    lz = require('localization').get();

var UpcomingTask = React.createClass({displayName: "UpcomingTask",
    mixins: mixins('bindToStore'),
    bindingStores: [tasksStore],

    getInitialState: function () {
        var begin = new Date(),
            end = new Date();
        end.setHours(end.getHours() + 2);

        return {
            tasks: tasksStore.get({ timeWasSet: true, done: false }).filter(function (task) {
                return task.date <= end && task.date >= begin;
            }).sort(function (a, b) {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return 0;
            })
        };
    },

    renderUpcomingTask: function (task, index) {
        return (
            React.createElement("section", {key: index }, 
                React.createElement("strong", null,  dater.format('HH:mm', task.date) ), 
                React.createElement("small", null,  task.title)
            )
        );
    },

    render: function () {
        return (React.createElement("div", {className: "upcoming-tasks"}, 
            React.createElement("h4", null,  this.state.tasks.length == 0 ? lz.NO_UPCOMING_TASK : lz.UPCOMING_TASKS), 
             this.state.tasks.map(this.renderUpcomingTask) 
        ));
    }
});

module.exports = UpcomingTask;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"libs/dater":35,"localization":39,"mixins/main":46,"stores/tasksStore":64}],18:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null);

var icons = {
    'bell': (
        React.createElement("svg", {viewBox: "0 0 32.409 32.409"}, 
            React.createElement("g", null, 
                React.createElement("path", {d: "M27.568,20.168V13.63c-0.021-5.043-3.48-9.862-8.654-11.088c0,0-0.17-2.542-2.711-2.542c-2.58,0-2.709,2.47-2.709,2.47" + ' ' +
		"C8.322,3.69,4.906,8.587,4.876,13.63v6.33c0,3.094-2.033,3.626-4.443,6.146h31.543C29.566,23.586,27.568,23.263,27.568,20.168z" + ' ' +
		 "M16.203,32.409c2.771,0,5.088-2.212,5.713-5.043H10.492C11.117,30.197,13.435,32.409,16.203,32.409z"})
            )
        )
    ),

    'friends': (
        React.createElement("svg", {viewBox: "0 0 561 561"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("path", {d: "M382.5,255c43.35,0,76.5-33.15,76.5-76.5S425.85,102,382.5,102S306,135.15,306,178.5S339.15,255,382.5,255z M178.5,255" + ' ' +
			"c43.35,0,76.5-33.15,76.5-76.5S221.85,102,178.5,102S102,135.15,102,178.5S135.15,255,178.5,255z M178.5,306" + ' ' +
			"C119.85,306,0,336.6,0,395.25V459h357v-63.75C357,336.6,237.15,306,178.5,306z M382.5,306c-7.65,0-15.3,0-25.5,2.55" + ' ' +
			"c30.6,20.4,51,51,51,86.7V459h153v-63.75C561,336.6,441.15,306,382.5,306z"})
                )
            )
        )
    ),

    'incoming': (
        React.createElement("svg", {viewBox: "0 0 32 32"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("polygon", {points: "22,12 18,12 18,6 14,6 14,12 10,12 16,18   "}), 
                    React.createElement("polygon", {points: "28,16 28,22 4,22 4,16 0,16 0,26 32,26 32,16   "})
                )
            )
        )
    ),

    'partial-star': function (props) {
        var total = 37.287,
            value = props.value || 100,
            height = value * (total / 100),
            y = total - height;

        return (React.createElement("svg", {viewBox: "0 0 37.286 37.287"}, 
            React.createElement("mask", {id: "partial-star-mask"}, 
                React.createElement("g", null, 
                    React.createElement("path", {d: "M36.683,16.339l-7.567,7.377l1.786,10.417c0.128,0.75-0.182,1.509-0.797,1.957c-0.348,0.253-0.762,0.382-1.176,0.382" + ' ' +
            "c-0.318,0-0.638-0.076-0.931-0.23l-9.355-4.918l-9.355,4.918c-0.674,0.355-1.49,0.295-2.107-0.15" + ' ' +
            "c-0.615-0.448-0.924-1.206-0.795-1.957l1.787-10.417L0.604,16.34c-0.547-0.531-0.741-1.326-0.508-2.05" + ' ' +
            "c0.236-0.724,0.861-1.251,1.615-1.361l10.459-1.521l4.68-9.478c0.335-0.684,1.031-1.116,1.792-1.116" + ' ' +
            "c0.763,0,1.456,0.432,1.793,1.115l4.68,9.478l10.461,1.521c0.752,0.109,1.379,0.637,1.611,1.361" + ' ' +
            "C37.425,15.013,37.226,15.808,36.683,16.339z"})
                )
            ), 
            React.createElement("rect", {className: "partial-star-bg-svg", height:  total - height, width: "37.286"}), 
            React.createElement("rect", {className: "partial-star-svg", y: y, height: height, width: "37.286"})
        ));
    },

    'star': (
        React.createElement("svg", {viewBox: "0 0 37.286 37.287"}, 
            React.createElement("g", null, 
                React.createElement("path", {d: "M36.683,16.339l-7.567,7.377l1.786,10.417c0.128,0.75-0.182,1.509-0.797,1.957c-0.348,0.253-0.762,0.382-1.176,0.382" + ' ' +
        "c-0.318,0-0.638-0.076-0.931-0.23l-9.355-4.918l-9.355,4.918c-0.674,0.355-1.49,0.295-2.107-0.15" + ' ' +
        "c-0.615-0.448-0.924-1.206-0.795-1.957l1.787-10.417L0.604,16.34c-0.547-0.531-0.741-1.326-0.508-2.05" + ' ' +
        "c0.236-0.724,0.861-1.251,1.615-1.361l10.459-1.521l4.68-9.478c0.335-0.684,1.031-1.116,1.792-1.116" + ' ' +
        "c0.763,0,1.456,0.432,1.793,1.115l4.68,9.478l10.461,1.521c0.752,0.109,1.379,0.637,1.611,1.361" + ' ' +
        "C37.425,15.013,37.226,15.808,36.683,16.339z"})
            )
        )
    ),

    'plus': (
        React.createElement("svg", {viewBox: "0 0 32 32"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("polygon", {points: "32,12 20,12 20,0 12,0 12,12 0,12 0,20 12,20 12,32 20,32 20,20 32,20   "})
                )
            )
        )
    ),

    'left-arrow': (
        React.createElement("svg", {viewBox: "0 0 199.404 199.404"}, 
            React.createElement("g", null, 
                React.createElement("polygon", {points: "135.412,0 35.709,99.702 135.412,199.404 163.695,171.119 92.277,99.702 163.695,28.285  "})
            )
        )
    ),

    'right-arrow': (
        React.createElement("svg", {viewBox: "0 0 306 306"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("polygon", {points: "94.35,0 58.65,35.7 175.95,153 58.65,270.3 94.35,306 247.35,153   "})
                )
            )
        )
    ),

    'check': (
        React.createElement("svg", {viewBox: "0 0 78.369 78.369"}, 
            React.createElement("g", null, 
                React.createElement("path", {d: "M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704" + ' ' +
    "c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704" + ' ' +
    "C78.477,17.894,78.477,18.586,78.049,19.015z"})
            )
        )
    ),
    'postpone' : (
        React.createElement("svg", {viewBox: "0 0 47.001 47.001"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("g", null, 
                        React.createElement("path", {d: "M46.907,20.12c-0.163-0.347-0.511-0.569-0.896-0.569h-2.927C41.223,9.452,32.355,1.775,21.726,1.775" + ' ' +
    				"C9.747,1.775,0,11.522,0,23.501C0,35.48,9.746,45.226,21.726,45.226c7.731,0,14.941-4.161,18.816-10.857" + ' ' +
    				"c0.546-0.945,0.224-2.152-0.722-2.699c-0.944-0.547-2.152-0.225-2.697,0.72c-3.172,5.481-9.072,8.887-15.397,8.887" + ' ' +
    				"c-9.801,0-17.776-7.974-17.776-17.774c0-9.802,7.975-17.776,17.776-17.776c8.442,0,15.515,5.921,17.317,13.825h-2.904" + ' ' +
    				"c-0.385,0-0.732,0.222-0.896,0.569c-0.163,0.347-0.11,0.756,0.136,1.051l4.938,5.925c0.188,0.225,0.465,0.355,0.759,0.355" + ' ' +
    				"c0.293,0,0.571-0.131,0.758-0.355l4.938-5.925C47.018,20.876,47.07,20.467,46.907,20.12z"}), 
                        React.createElement("path", {d: "M21.726,6.713c-1.091,0-1.975,0.884-1.975,1.975v11.984c-0.893,0.626-1.481,1.658-1.481,2.83" + ' ' +
    				"c0,1.906,1.551,3.457,3.457,3.457c0.522,0,1.014-0.125,1.458-0.334l6.87,3.965c0.312,0.181,0.65,0.266,0.986,0.266" + ' ' +
    				"c0.682,0,1.346-0.354,1.712-0.988c0.545-0.943,0.222-2.152-0.724-2.697l-6.877-3.971c-0.092-1.044-0.635-1.956-1.449-2.526V8.688" + ' ' +
    				"C23.701,7.598,22.816,6.713,21.726,6.713z M21.726,24.982c-0.817,0-1.481-0.665-1.481-1.48c0-0.816,0.665-1.481,1.481-1.481" + ' ' +
    				"s1.481,0.665,1.481,1.481C23.207,24.317,22.542,24.982,21.726,24.982z"})
                    )
                )
            )
        )
    ),

    'up-arrow': (
        React.createElement("svg", {viewBox: "0 0 201.894 201.894"}, 
            React.createElement("g", null, 
                React.createElement("g", null, 
                    React.createElement("polygon", {points: "33.768,66.019 39.108,71.266 97.171,14.204 97.171,201.894 104.719,201.894" + ' ' +
    			"104.719,14.194 162.786,71.266 168.125,66.019 100.947,0   "})
                )
            )
        )
    )
};

var SvgIco = React.createClass({displayName: "SvgIco",
    render: function () {
        var ico = icons[this.props.name];

        if (typeof ico === 'function') {
            return ico(this.props);
        } else if (typeof ico === 'undefined') {
            return React.createElement("svg", null);
        } else {
            return ico;
        }
    }
});

module.exports = SvgIco;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    tasksStore = require('stores/tasksStore'),
    taskActions = require('actions/taskActions'),
    mixins = require('mixins/main'),
    SvgIco = require('components/svg-ico.jsx'),
    dater = require('libs/dater');

var ThenTasks = React.createClass({displayName: "ThenTasks",
    mixins: mixins('bindToStore'),
    bindingStores: [tasksStore],

    getInitialState: function () {
        return {
            tasks: tasksStore.tasksForThen()
        }
    },

    _handlePostponeClick: function (taskId) {
        taskActions.postponeTask(taskId);
    },

    _handleArrowClick: function (taskId) {
        taskActions.forToday(taskId);
    },

    renderTask: function (task, index) {
        var dateFormat = task.timeWasSet ? 'Do MMMM HH:mm' : 'Do MMMM';

        return React.createElement("li", {key: index }, 
            React.createElement("i", {className: "ico partial-star margin-right"}, 
                React.createElement(SvgIco, {name: "partial-star", value:  task.precedence('%') })
            ), 
            React.createElement("i", {onClick:  this._handleArrowClick.bind(this, task._id), className: "ico pointer hovered margin-left margin-right-wide"}, 
                React.createElement(SvgIco, {name: "up-arrow"})
            ), 
            React.createElement("i", {onClick:  this._handlePostponeClick.bind(this, task._id), className: "ico postpone pointer hovered"}, 
                React.createElement(SvgIco, {name: "postpone"})
            ), 
            React.createElement("main", {className: "inline-text"}, 
                React.createElement("strong", null, task.title[0]), 
                React.createElement("span", null,  task.title.substring(1, task.title.length) ), 
                React.createElement("small", null, " | ", dater.format(dateFormat, task.date))
            )
        );
    },

    render: function () {
        var tasksExist = this.state.tasks.length > 0;

        return (React.createElement("div", {className: "material-block"}, 
            React.createElement("section", null, 
                React.createElement("ul", {className: "tasks"}, 
                    React.createElement("b", null,  lz.THEN), 
                     this.state.tasks.map(this.renderTask) 
                )
            )
        ));
    }
});

module.exports = ThenTasks;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/taskActions":4,"components/svg-ico.jsx":18,"libs/dater":35,"localization":39,"mixins/main":46,"stores/tasksStore":64}],20:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    dater = require('libs/dater'),
    tasksStore = require('stores/tasksStore'),
    taskActions = require('actions/taskActions'),
    mixins = require('mixins/main'),
    SvgIco = require('components/svg-ico.jsx');

var TodayTasks = React.createClass({displayName: "TodayTasks",
    mixins: mixins('bindToStore', 'dynamicStyle'),
    bindingStores: [tasksStore],
    
    getInitialState: function () {
        return {
            tasks: tasksStore.tasksForToday()
        }
    },

    _handleCheckClick: function (taskId) {
        var task = tasksStore.get(taskId);

        if (task.done) {
            taskActions.makeActive(taskId);
        } else {
            taskActions.markAsDone(taskId);
        }          
    },

    _handlePostponeClick: function (taskId) {
        taskActions.postponeTask(taskId);
    },

    renderTask: function (task, index) {
        var extra = task.timeWasSet ? React.createElement("small", null, " | ", dater.format('HH:mm', task.date)) : '';

        return React.createElement("li", {key: index, className:  this.cs({ 'done': task.done }) }, 
            React.createElement("i", {className: "ico partial-star margin-right"}, 
                React.createElement(SvgIco, {name: "partial-star", value:  task.precedence('%') })
            ), 
            React.createElement("i", {onClick:  this._handleCheckClick.bind(this, task._id), 
                className: "ico check pointer margin-left margin-right-wide"}, 
                React.createElement("div", {className: "uncheck-box"}), 
                React.createElement("div", {className: "check-circle"}), 
                React.createElement(SvgIco, {name: "check"})
            ), 
            React.createElement("i", {onClick:  this._handlePostponeClick.bind(this, task._id), className: "ico postpone pointer hovered"}, 
                React.createElement(SvgIco, {name: "postpone"})
            ), 
            React.createElement("main", {className: "inline-text"}, 
                React.createElement("strong", null, task.title[0]), 
                React.createElement("span", null,  task.title.substring(1, task.title.length) ), 
                extra 
            )
        );
    },

    render: function () {
        return (React.createElement("div", {className: "material-block"}, 
            React.createElement("section", null, 
                React.createElement("ul", {className: "tasks"}, 
                    React.createElement("b", null,  lz.TODAY), 
                     this.state.tasks.map(this.renderTask) 
                )
            )
        ));
    }
});

module.exports = TodayTasks;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/taskActions":4,"components/svg-ico.jsx":18,"libs/dater":35,"localization":39,"mixins/main":46,"stores/tasksStore":64}],21:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    SvgIco = require('../svg-ico.jsx');

var IncomingFriends = React.createClass({displayName: "IncomingFriends",
    render: function () {
        return (React.createElement("div", {className: "tool"}, 
            React.createElement(SvgIco, {name: "friends"})
        ));
    }
});

module.exports = IncomingFriends;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../svg-ico.jsx":18}],22:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    SvgIco = require('../svg-ico.jsx');

var IncomingTasks = React.createClass({displayName: "IncomingTasks",
    render: function () {
        return (React.createElement("div", {className: "tool"}, 
            React.createElement(SvgIco, {name: "incoming"})
        ));
    }
});

module.exports = IncomingTasks;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../svg-ico.jsx":18}],23:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    SvgIco = require('../svg-ico.jsx');

var Notifications = React.createClass({displayName: "Notifications",
    render: function () {
        return (React.createElement("div", {className: "tool"}, 
            React.createElement(SvgIco, {name: "bell"})
        ));
    }
});

module.exports = Notifications;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../svg-ico.jsx":18}],24:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    Notifications = require('./notifications.jsx'),
    IncomingFriends = require('./incoming-friends.jsx'),
    IncomingTasks = require('./incoming-tasks.jsx');

var ToolBar = React.createClass({displayName: "ToolBar",
    render: function () {
        return (React.createElement("div", {className: "tool-bar"}, 
            React.createElement(Notifications, null), 
            React.createElement(IncomingFriends, null), 
            React.createElement(IncomingTasks, null)
        ));
    }
});

module.exports = ToolBar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./incoming-friends.jsx":21,"./incoming-tasks.jsx":22,"./notifications.jsx":23}],25:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    mixins = require('mixins/main'),
    pageStore = require('stores/pageStore'),
    lz = require('localization').get(),
    PAGES = require('constants/pages');

var HeaderLinks = React.createClass({displayName: "HeaderLinks",
    mixins: mixins('dynamicStyle', 'bindToStore'),
    bindingStores: [pageStore],

    _handleMouseEnter: function (pageName) {
        this._hover(pageName);
    },

    _handleMouseLeave: function () {
        this._hover();
    },

    _hover: function (pageName) {
        var hover = typeof pageName !== 'undefined';

        this.setState({
            hover: hover,
            hoverPage: hover ? pageName : null
        });
    },

    _createLink: function (link, index) {
        var className = this.cs({
            'active': link.page === this.state.activePage
        });

        return (React.createElement("li", {key: index, ref:  link.page, className: className }, 
            React.createElement("a", {onMouseEnter:  this._handleMouseEnter.bind(this, link.page), onMouseLeave:  this._handleMouseLeave, href:  link.href},  link.title)
        ))
    },

    _moveUnderLine: function (pageName) {
        var parentNode,
            underLineNode = this.refs.underline.getDOMNode(),
            linkNode = this.refs[pageName];

        if (typeof linkNode === 'undefined') {
            return;
        }

        linkNode = linkNode.getDOMNode();
        parentNode = linkNode.parentNode;

        assign(underLineNode.style, {
            left: linkNode.offsetLeft - parentNode.offsetLeft + 'px',
            width: linkNode.offsetWidth + 'px'
        });
    },

    getInitialState: function () {
        return {
            activePage: pageStore.currentPageName(),
            hover: false,
            hoverPage: null
        };
    },

    componentWillMount: function () {
        var _links = [
                { href: '/welcome', title: lz.ABOUT_PROJECT, page: PAGES.WELCOME },
                { href: '/signup', title: lz.SIGN_UP, page: PAGES.SIGN_UP },
                { href: '/login', title: lz.LOGIN, page: PAGES.LOGIN }
            ];

        assign(this, {
            _links: _links
        });
    },

    componentDidUpdate: function () {
        var page = this.state.hover ? this.state.hoverPage : this.state.activePage;
        this._moveUnderLine(page);
    },

    componentDidMount: function () {
        this._moveUnderLine(this.state.activePage);
    },

    render: function () {

        return (
            React.createElement("ul", {className: "header-menu"}, 
                 this._links.map(this._createLink), 
                React.createElement("div", {ref: "underline", className: "underline"})
            )
        );
    }
});

module.exports = HeaderLinks;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"constants/pages":30,"localization":39,"mixins/main":46,"stores/pageStore":62}],26:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null);

var Logo = React.createClass({displayName: "Logo",
    render: function () {
        return (
            React.createElement("div", {className: "project-logo"}, 
                React.createElement("strong", null, "clavy"), 
                React.createElement("small", null, "the cleverest task manager")
            )
        );
    }
});

module.exports = Logo;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    mixins = require('mixins/main'),
    ProjectLogo = require('components/welcome/project-logo.jsx');

var Login = React.createClass({displayName: "Login",
    mixins: mixins('dynamicStyle', 'initialized'),
    fadeOutDuration: 300,

    getInitialState: function () {
        return {
            display: 'fadeIn'
        };
    },

    init: function () {
        return {
            fadeOut: this._fadeOut
        };
    },

    render: function () {
        return (React.createElement("div", {className:  this.animateCs('base:content-section; fadeIn:reduce duration-300ms; fadeOut:slide-right-out duration-700ms') }, 
            React.createElement("div", {className: "material-block mini"}, 
                React.createElement(ProjectLogo, null), 
                React.createElement("div", {className: "welcome-title"},  this.props.title), 
                 this.props.children
            )
        ));
    }
});

module.exports = Login;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"components/welcome/project-logo.jsx":26,"mixins/main":46}],28:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var actionTypes = keys({
    CHANGE_PAGE: null,
    START_ADD_TASK: null,
    STOP_ADD_TASK: null,
    SET_ADDITION_TASK_PRIORITY: null,
    SET_ADDITION_TASK_DATE: null,
    SET_ADDITION_TASK_TITLE: null,
    CHANGE_QUICK_ADD_BLOCK: null,
    SAVING_ADDITION_TASK: null,
    SAVED_TASK: null,
    PUT_TASKS_PACK: null,
    TASK_UPDATED: null
});

module.exports = actionTypes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],29:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var languages = keys({
    RU: null,
    EN: null
});

module.exports = languages;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],30:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var pages = keys({
    LOGIN: null,
    SIGN_UP: null,
    WELCOME: null,
    DESK: null,
    TASKS: null,
    PROFILE: null,
    NONE: null
});

module.exports = pages;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var payloadSources = keys({
    VIEW_ACTION: null,
    SERVER_ACTION: null
});

module.exports = payloadSources;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var quickTaskAddBlocks = keys({
    TEXT_BOX: null,
    SELECT_DATE: null,
    PRIORITY: null,
    NONE: null
});

module.exports = quickTaskAddBlocks;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
(function (global){
"use strict"

var dater = require('libs/dater'),
    invariant = require('invariant'),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null);

var sendRequest = function (url, callback) {
    var ajax = (typeof window !== "undefined" ? window.libs.componentAjax : typeof global !== "undefined" ? global.libs.componentAjax : null);

    ajax.get('/api/' + url, function (res) {
        var result = JSON.parse(res);
        callback(result);
    });
};

var sendPostRequest = function (url, data, callback) {
    var ajax = (typeof window !== "undefined" ? window.libs.componentAjax : typeof global !== "undefined" ? global.libs.componentAjax : null);
    
    ajax.post('/api/' + url, data, function (res) {
        var result = JSON.parse(res);
        callback(result);
    });
};

var trimCallback = function (callback) {
    return callback || function () {
        
    };
};

var getAllTasks = function () {
   var tasks = JSON.parse(localStorage.getItem('tasks')) || [];

   tasks.forEach(function (task) {
        task.date = dater.parse(task.date);
    });

   return tasks;
};

var setAllTasks = function (tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks))
};

var generataId = function (prevTask) {
    if (typeof prevTask === 'undefined') {
        return 1;
    }

    return prevTask._id + 1;
};

var api = {
    auth: {
        login: function (data, callback) {
            sendPostRequest('auth/login', data, function (result) {
                callback(result);
            })
        },

        signup: function (data, callback) {
            sendPostRequest('auth/signup', data, function (result) {
                callback(result);
            })
        }
    },

    account: {
         isAuthorized: function (callback) {
            sendRequest('account/isAuthorized', function (result) {
                callback(result);
            });
        }
    },
    
    tasks: {
        save: function (task, callback) {
            var tasks = getAllTasks();
            task._id = generataId(tasks[tasks.length - 1]);
            tasks.push(task);
            
            setTimeout(function () {
                setAllTasks(tasks);
                trimCallback(callback)(task);
            }, 0);
        },

        get: function (callback) {
            var tasks =getAllTasks();            

            setTimeout(function () {
                trimCallback(callback)(tasks);
            }, 0);
        },

        update: function (id, task, callback) {
            if (typeof id === 'object') {
                callback = task;
                task = id;
                id = task._id;
            }

            var tasks = getAllTasks(),
                existing = tasks.filter(function (t) {
                    return t._id === id; 
                })[0];
                
            invariant(existing, 'task with _id `%s` was not found', id);
            assign(existing, task);

            setTimeout(function () {
                setAllTasks(tasks);
                trimCallback(callback)(existing);
            }, 0);
        }           
    }
};

module.exports = api;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"invariant":36,"libs/dater":35}],34:[function(require,module,exports){
"use strict"

var api = require('./api'),
    isUserAuthorized = false;

var authorizer = {
    init: function (callback) {
        return api.account.isAuthorized(function (res) {
            isUserAuthorized = res.result;
            callback(res.result);
        });
    },

    isAuthorized: function () {
        return isUserAuthorized;
    }
};

module.exports = authorizer;
},{"./api":33}],35:[function(require,module,exports){
(function (global){
"use strict"

var moment = (typeof window !== "undefined" ? window.libs.moment : typeof global !== "undefined" ? global.libs.moment : null),
    lz = require('localization').get();
    (typeof window !== "undefined" ? window.libs.momentRange : typeof global !== "undefined" ? global.libs.momentRange : null);

var dater = {
    monthDays: function (month, year) {
        var daysCount,
            days = [];

        if (month instanceof Date) {
            year = month.getFullYear();
            month = month.getMonth();
        }

        daysCount = moment({ year: year, month: month }).daysInMonth();
        moment
            .range(moment({ year: year, month: month, day: 1 }), moment({ year: year, month: month, day: daysCount }))
            .by('days', function (day) {
                days.push(day.toDate());
            });

        return days;
    },

    equalDays: function (date1, date2) {
        if ( date1 == null || date2 == null ) {
            return false;
        }

        return date1.getFullYear() == date2.getFullYear() &&
                date1.getMonth() == date2.getMonth() &&
                date1.getDate() == date2.getDate();
    },

    nextDay: function (date) {
        var maxDays = moment(date).daysInMonth(),
            day = date.getDate() + 1,
            nextMonth = day > maxDays,
            month = nextMonth ? date.getMonth() + 1 : date.getMonth(),
            nextYear = month > 11,
            year = nextYear ? date.getFullYear() + 1 : date.getFullYear();

        day = nextMonth ? 1 : day;
        month = nextYear ? 0 : month;

        return moment({ year: year, month: month, day: day }).toDate();
    },

    prevDay: function (date) {
        var day = date.getDate() - 1,
            prevMonth = day < 1,
            month = prevMonth ? date.getMonth() - 1 : date.getMonth(),
            prevYear = month < 0,
            year = prevYear ? date.getFullYear() - 1 : date.getFullYear();

        day = prevMonth ? moment({ year: year, month: month }).daysInMonth() : day;
        month = prevYear ? 11 : month;

        return moment({ year: year, month: month, day: day }).toDate();
    },

    weekDays: function () {
        return moment.weekdays();
    },

    format: function (formatString, date, text) {
        if(!moment(date).isValid()){
            return text || lz.NO_DATE;
        }

        return moment(date).format(formatString);
    },

    parse: function (date) {
        return moment(date).toDate();
    }
};

module.exports = dater;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"localization":39}],36:[function(require,module,exports){
"use strict";

var invariant = function() {
    var args = Array.prototype.slice.apply(arguments),
        condition = args.shift(),
        format = args.shift();

    if (!condition) {
        var error;
        if (format === undefined) {
            error = new Error('some invariant');
        } else {
            var argIndex = 0;
            error = new Error(
                'Invariant Violation: ' +
                format.replace(/%s/g, function() { return args[argIndex++]; })
            );
        }

        error.framesToPop = 1;
        throw error;
    }
};

module.exports = invariant;
},{}],37:[function(require,module,exports){
(function (global){
var assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    invariant = require('invariant');

var keysCodes = {
    27: 'esc',
    37: 'leftArrow',
    39: 'rightArrow',
    38: 'upArrow',
    40: 'downArrow',
    9: 'tab',
    13: 'enter'
};

var getKey = function (keyCode) {
    var key = keysCodes[keyCode];

    if (keyCode >= 48 && keyCode <= 57) {
        key = keyCode - 48;
    }

    if (keyCode >= 96 && keyCode <= 105) {
        key = keyCode - 96;
    }

    return key + ''; 
};

var keySwitch = function (keyCode, actions) {
    if (typeof actions === 'undefined') {
        return getKey(keyCode);
    };

    var callbacks = [],
        keyName = keysCodes[keyCode],
        action = actions[keyName];

    if (typeof action !== 'undefined') {
        callbacks.push(action);
    }

    if (typeof action === 'undefined' && typeof actions.other !== 'undefined') {
        callbacks.push(actions.other);
    }

    if (typeof actions.digits !== 'undefined' && 
        ( (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
        ) {
        callbacks.push(actions.digits);
    }

    callbacks.forEach(function (callback) {
        callback(); 
    });
};

module.exports = keySwitch;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"invariant":36}],38:[function(require,module,exports){
(function (global){
var assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null);

var utils = {
	liteEqual: function (a, b) {
		var check = true;
			aFields = Object.keys(a),
			bFields = Object.keys(b),
			smallest = aFields.length > bFields.length ? bFields : aFields;

		smallest.forEach(function (field) {
			if (a[field] === b[field]) return;
			check = false;
		});

		return check;
	},

	clone: function (a) {
		if (a instanceof Array) {
			var b = [];
			a.forEach(function (i) {
				b.push(typeof i === 'object' ? utils.clone(i) : i);
			});
			return b;
		}
		return assign({}, a);
	}
};

module.exports = utils;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
"use strict"
var languages = require('constants/languages'),
    invariant = require('invariant'),
    defaultLanguage = languages.EN,
    currentLz = null,
    lz = {};

lz[languages.EN] = {
    words: require('./words/en'),
    sentences: require('./sentences/en')
};

lz[languages.RU] = {
    words: require('./words/ru'),
    sentences: require('./sentences/en')
};

currentLz = lz[defaultLanguage];

var localization = {
    get: function (type) {
        if (type === 'sentences') {
            return currentLz.sentences;
        }

        return currentLz.words;
    },

    change: function (language) {
        invariant(lz[language], 'unknown localization `%s`', language);

        currentLz = lz[language];
    }
};

module.exports = localization;
},{"./sentences/en":40,"./words/en":41,"./words/ru":42,"constants/languages":29,"invariant":36}],40:[function(require,module,exports){
"use strict";

var localization = {
    ASK_SET_DATE: 'set the date for the task?',
    ASK_SET_DATE_DETAIL: 'choose "no" if you want to leave the task later',
    SET_DATE_CONFIRM: 'set the date',
    VALIDATION_WRONG_EMAIL: 'The given email is incorrect.',
    VALIDATION_EMPTY_PASSWORD: 'Password cannot be empty.',
    VALIDATION_WRONG_CONFIRM_PASSWORD: 'Password does not match the confirm password'
};

module.exports = localization;
},{}],41:[function(require,module,exports){
"use strict"

var localization = {
    DESK: 'desk',
    LOGIN: 'login',
    ABOUT_PROJECT: 'about project',
    ENTER: 'enter',
    PASSWORD: 'password',
    CONFIRM_PASSWORD: 'confirm password',
    REGISTER: 'register',
    WELCOME: 'welcome',
    SIGN_UP: 'sign up',
    ALL_TASKS: 'all tasks',
    PROFILE: 'profile',
    UPCOMING_TASKS: 'upcoming tasks',
    NO_UPCOMING_TASK: 'the are no upcoming tasks',
    TODAY: 'today',
    ADD_TASK: 'add task',
    THEN: 'then',
    PRIORITY: 'priority',
    EXIT: 'exit',
    ADD: 'add',
    NO: 'no',
    YES: 'yes',
    OK: 'ok',
    CONFIRM: 'confirm',
    NO_DATE: 'no date'
};

module.exports = localization;
},{}],42:[function(require,module,exports){
"use strict"

var localization = {
    DESK: 'доска',
    ALL_TASKS: 'все задачи',
    PROFILE: 'профиль',
    UPCOMING_TASKS: 'ближайшие задачи',
    TODAY: 'сегодня',
    ADD_TASK: 'добавить задачу',
    THEN: 'потом',
    PRIORITY: 'важность'
};

module.exports = localization;
},{}],43:[function(require,module,exports){
(function (global){
"use strict"

var invariant = require('invariant'),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null);

var bindToStore = {
    _listener: function (store) {
        invariant(this.getInitialState, '`getInitialState` must be define when component binds to store');
        var that = this;

        var listener = function () {
            if (that.isMounted()) {
                that.setState(that.getInitialState());
            } else {
                store.removeChangeListener(listener);
            }
        };

        return listener;
    },
    
    componentWillUnmount: function () {
        var i;

        for (i = 0; i < this._bindingStores.length; i++) {
            this._bindingStores[i].removeChangeListener(this._listeners[i]);
        }
    },

    componentWillMount: function () {
        var that = this,
            _listeners = [],
            _bindingStores = that.bindingStores || [];

        _bindingStores.forEach(function (store) {
            var listener = that._listener(store);
            store.addChangeListener(listener);
            _listeners.push(listener)
        });

        assign(this, {
            _listeners: _listeners,
            _bindingStores: _bindingStores
        });
    }
};

module.exports = bindToStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"invariant":36}],44:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    Promise = (typeof window !== "undefined" ? window.libs.es6Promise : typeof global !== "undefined" ? global.libs.es6Promise : null).Promise;

var dynamicStyle = {
    componentWillUpdate: function (props) {
        if (props.display === 'fadeOut' && typeof this.componentWillFadeOut !== 'undefined') {
            this.componentWillFadeOut();
        }
    },

    componentWillMount: function () {
        var that = this;

        if (typeof this.fadeOutDuration === 'number') {
            that._fadeOut = function () {
                that.setState({
                    display: 'fadeOut'
                });

                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, that.fadeOutDuration);
                });
            }
        }
    },

    animateCs: function (conf) {
        var classSections = conf.split(';'),
            sectionClass = {},
            animateClass = {};

        classSections.forEach(function (classSection) {
            var split = classSection.split(':'),
                classSectionName = split[0].replace(' ', '');
            sectionClass[classSectionName] = split[1];
        });

        if (typeof sectionClass.base !== 'undefined') {
            animateClass[sectionClass.base] = true;
        }

        if (typeof sectionClass.fadeIn !== 'undefined') {
            animateClass[sectionClass.fadeIn] = this.state.display === 'fadeIn';
        }

        if (typeof sectionClass.fadeOut !== 'undefined') {
            animateClass[sectionClass.fadeOut] = this.state.display === 'fadeOut';
        }

        return this.cs(animateClass);
    },

    cs: function (classConfig) {
        return React.addons.classSet(classConfig);
    },

    st: function (stylesConf) {
        var style= {};

        Object.getOwnPropertyNames(stylesConf).forEach(function (styleName) {
            var styleConf = stylesConf[styleName];

            if (styleConf.when) {
                style[styleName] = styleConf.value;
            }
        });

        return style;
    }
};

module.exports = dynamicStyle;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],45:[function(require,module,exports){
"use strict"

var initialized = {
    componentDidMount: function () {
        if (typeof this.init !== 'undefined' && typeof this.props.onInit !== 'undefined') {
            this.props.onInit(this.init());
        }
    }
};

module.exports = initialized;

},{}],46:[function(require,module,exports){
"use strict"

var invariant = require('invariant');

var mixins = {
    dynamicStyle: require('./dynamicStyle'),
    bindToStore: require('./bindToStore'),
    initialized: require('./initialized')
};

var main = function () {
    var keys = Array.prototype.slice.apply(arguments);

    return keys.map(function (key) {
        invariant(mixins[key], 'unknown mixin: `%s`', key);
        return mixins[key];
    });
};

module.exports = main;
},{"./bindToStore":43,"./dynamicStyle":44,"./initialized":45,"invariant":36}],47:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lz = require('localization').get(),
    WelcomeBlock = require('components/welcome/welcome-block.jsx');

var Login = React.createClass({displayName: "Login",
    init: function (welcome) {
        this.props.onInit(welcome);
    },

    render: function () {
        return (React.createElement(WelcomeBlock, {onInit:  this.init, title:  lz.ABOUT_PROJECT}, 
            React.createElement("div", {className: "content-section"}, 
                React.createElement("img", {src: "/img/ava.jpg", width: "100%"})
            )
        ));
    }
});

module.exports = Login;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"components/welcome/welcome-block.jsx":27,"localization":39}],48:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    TaskQuickAdd = require('components/quick-add/task-quick-add'),
    TodayTasks = require('components/tasks-list/today-tasks'),
    ThenTasks = require('components/tasks-list/then-tasks'),
    taskActions = require('actions/taskActions');

var Main = React.createClass({displayName: "Main",
    componentWillMount: function() {
        taskActions.receiveTasks();
    },
    
    render: function () {
        return (React.createElement("div", null, 
            React.createElement("div", {className: "content-section padding-top-high"}, 
                React.createElement(TaskQuickAdd, null)
            ), 
            React.createElement("div", {className: "content-section padding-top-none padding-bottom-none"}, 
                React.createElement(TodayTasks, null)
            ), 
            React.createElement("div", {className: "content-section padding-top-mini"}, 
                React.createElement(ThenTasks, null)
            )
        ));
    }
});

module.exports = Main;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/taskActions":4,"components/quick-add/task-quick-add":11,"components/tasks-list/then-tasks":19,"components/tasks-list/today-tasks":20}],49:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lzSn = require('localization').get('sentences'),
    lz = require('localization').get(),
    api = require('../libs/api'),
    route = (typeof window !== "undefined" ? window.libs.page : typeof global !== "undefined" ? global.libs.page : null),
    validator = require('../../../common/libs/validator'),
    authorizer = require('libs/authorizer'),
    WelcomeBlock = require('components/welcome/welcome-block.jsx');

var Login = React.createClass({displayName: "Login",
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

    validateForm: function (email, password) {
        if (!validator.checkEmail(email)) {
            this.showValidationError(lzSn.VALIDATION_WRONG_EMAIL);
            return false;
        }

        if (password === '') {
            this.showValidationError(lzSn.VALIDATION_EMPTY_PASSWORD);
            return false;
        }

        return true;
    },

    handleSubmit: function (e) {
        e.preventDefault();

        this.enableForm(false);

        var that = this,
            email = this.refs.email.getDOMNode().value.trim(),
            password = this.refs.password.getDOMNode().value.trim(),
            data = {
                email: email,
                password: password
            };

        if (!this.validateForm(email, password)) {
            this.enableForm(true);
            return;
        }

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
        return (React.createElement(WelcomeBlock, {onInit:  this.init, title:  lz.LOGIN}, 

             this.state.validationMessage ?
                React.createElement("div", {className: "error-message"}, React.createElement("span", null, this.state.validationMessage))
                : null, 
            React.createElement("form", {className: "public-form", onSubmit: this.handleSubmit}, 
                React.createElement("section", null, 
                    React.createElement("label", {className: "public-label"},  lz.LOGIN), 
                    React.createElement("input", {ref: "email", name: "email", type: "text", className: "public-input"}), 

                    React.createElement("label", {className: "public-label margin-top"},  lz.PASSWORD), 
                    React.createElement("input", {ref: "password", name: "password", type: "password", className: "public-input"})
                ), 
                React.createElement("section", {className: "text-center"}, 
                    React.createElement("input", {type: "submit", className: "base-button", disabled: this.state.isSubmitting, value:  lz.ENTER})
                )
            )

        ));
    }
});

module.exports = Login;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../common/libs/validator":66,"../libs/api":33,"components/welcome/welcome-block.jsx":27,"libs/authorizer":34,"localization":39}],50:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null);

var Profile = React.createClass({displayName: "Profile",
    render: function () {
        return (React.createElement("div", null

        ))
    }
});

module.exports = Profile;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],51:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    lzSn = require('localization').get('sentences'),
    lz = require('localization').get(),
    api = require('../libs/api'),
    route = (typeof window !== "undefined" ? window.libs.page : typeof global !== "undefined" ? global.libs.page : null),
    validator = require('../../../common/libs/validator'),
    authorizer = require('libs/authorizer'),
    WelcomeBlock = require('components/welcome/welcome-block.jsx');

var SignUp = React.createClass({displayName: "SignUp",
    init: function (welcome) {
        this.props.onInit(welcome);
    },

    getInitialState: function () {
        return {
            isSubmitting: false,
            validationMessage: ''
        }
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

    validateForm: function (email, password, confirmPassword) {
        if (!validator.checkEmail(email)) {
            this.showValidationError(lzSn.VALIDATION_WRONG_EMAIL);
            return false;
        }

        if (!validator.checkPasswords(password, confirmPassword)) {
            this.showValidationError(lzSn.VALIDATION_WRONG_CONFIRM_PASSWORD);
            return false;
        }

        if (password === '') {
            this.showValidationError(lzSn.VALIDATION_EMPTY_PASSWORD);
            return false;
        }

        return true;
    },

    handleSubmit: function (e) {
        e.preventDefault();

        this.enableForm(false);

        var that = this,
            email = this.refs.email.getDOMNode().value.trim(),
            password = this.refs.password.getDOMNode().value.trim().trim(),
            confirmPassword = this.refs.confirmPassword.getDOMNode().value.trim().trim(),
            data = {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            };

        if (!this.validateForm(email, password, confirmPassword)) {
            this.enableForm(true);
            return;
        }

        api.auth.signup(data, function (result) {
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
        return (React.createElement(WelcomeBlock, {onInit:  this.init, title:  lz.SIGN_UP}, 
             this.state.validationMessage ?
                React.createElement("div", {className: "error-message"}, React.createElement("span", null, this.state.validationMessage))
                : null, 

            React.createElement("form", {className: "public-form", onSubmit: this.handleSubmit}, 
                React.createElement("section", null, 
                    React.createElement("label", {className: "public-label"},  lz.LOGIN), 
                    React.createElement("input", {ref: "email", name: "email", type: "text", className: "public-input"}), 

                    React.createElement("label", {className: "public-label margin-top"},  lz.PASSWORD), 
                    React.createElement("input", {ref: "password", name: "password", type: "password", className: "public-input"}), 

                    React.createElement("label", {className: "public-label margin-top"},  lz.CONFIRM_PASSWORD), 
                    React.createElement("input", {ref: "confirmPassword", name: "confirmPassword", type: "password", className: "public-input"})
                ), 
                React.createElement("section", {className: "text-center"}, 
                    React.createElement("input", {type: "submit", className: "base-button", disabled: this.state.isSubmitting, 
                           value:  lz.REGISTER})
                )
            )
        ));
    }
});

module.exports = SignUp;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../common/libs/validator":66,"../libs/api":33,"components/welcome/welcome-block.jsx":27,"libs/authorizer":34,"localization":39}],52:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null);

var Tasks = React.createClass({displayName: "Tasks",
    render: function () {
        return (React.createElement("div", null
        ))
    }
});

module.exports = Tasks;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],53:[function(require,module,exports){
(function (global){
"use strict"

var Promise = (typeof window !== "undefined" ? window.libs.es6Promise : typeof global !== "undefined" ? global.libs.es6Promise : null).Promise,
    modalStore = require('./store'),
    POPUP_TYPES = require('./popupTypes');

var actions = {
    confirm: function (popup) {
        var resolve, promise = new Promise(function (res) {
            resolve = res;
        });

        modalStore.push({
            type: POPUP_TYPES.CONFIRM,
            promise: promise,
            resolve: resolve,
            popup: popup
        });

        return promise;
    },

    calendar: function (popup) {
        var resolve, promise = new Promise(function (res) {
            resolve = res;
        });

        modalStore.push({
            type: POPUP_TYPES.CALENDAR,
            promise: promise,
            resolve: resolve,
            popup: popup
        });

        return promise;
    }
};

module.exports = actions;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./popupTypes":56,"./store":57}],54:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    mixins = require('mixins/main'),
    popupFactory = require('./popupFactory'),
    modalStore = require('./store');

var Modal = React.createClass({displayName: "Modal",
    mixins: mixins('bindToStore', 'dynamicStyle'),
    bindingStores: [modalStore],

    getInitialState: function () {
        return {
            display: modalStore.count() > 0,
            modal: modalStore.get()
        }
    },

    render: function () {
        var popup = this.state.display ? popupFactory.create(this.state.modal.type, this.state.modal.resolve, this.state.modal.popup) : '';

        return (React.createElement("div", {className:  this.cs({ 'modal-overlay': true, 'hidden': !this.state.display }) }, 
            popup 
        ));
    }
});

module.exports = Modal;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./popupFactory":55,"./store":57,"mixins/main":46}],55:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    POPUP_TYPES = require('./popupTypes'),
    invariant = require('invariant');

var popups = {};
popups[POPUP_TYPES.CONFIRM] = require('./types/confirm.jsx');
popups[POPUP_TYPES.CALENDAR] = require('./types/calendar.jsx');

var popupFactory = {
    create: function (type, resolve, props) {
        var Popup = popups[type];
        invariant(Popup, 'unknown popup `%s`', type);

        return React.createElement(Popup, {popup: props, resolve: resolve });
    }
};

module.exports = popupFactory;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./popupTypes":56,"./types/calendar.jsx":58,"./types/confirm.jsx":59,"invariant":36}],56:[function(require,module,exports){
(function (global){
"use strict"

var keys = (typeof window !== "undefined" ? window.libs.keys : typeof global !== "undefined" ? global.libs.keys : null);

var popupTypes = keys({
    CONFIRM: null,
    CALENDAR: null
});

module.exports = popupTypes;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],57:[function(require,module,exports){
(function (global){
"use strict"

var assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    EventEmitter = (typeof window !== "undefined" ? window.libs.events : typeof global !== "undefined" ? global.libs.events : null).EventEmitter,
    CHANGE_EVENT = 'CHANGE',

    nextId = 1,
    modals = [];

var modalStore = assign({
    get: function () {
        return modals[modals.length - 1];
    },

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    count: function () {
        return modals.length;
    },

    push: function (modal) {
        var id = nextId;
        modals.push({
            id: id,
            type: modal.type,
            popup: modal.popup,
            resolve: modal.resolve
        });

        nextId++;

        modal.promise.then(function () {
            modals.forEach(function (modal, index) {
                if (modal.id !== id) return;
                modals.splice(index,1);
            });

            modalStore.emitChange();
        });

        modalStore.emitChange();
    }
}, EventEmitter.prototype);

module.exports = modalStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],58:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    utils = require('libs/utils'),
    SvgIco = require('components/svg-ico.jsx'),
    lz = require('localization').get(),
    mixins = require('mixins/main'),
    keySwitch = require('key-switch'),
    dater = require('libs/dater');

var Calendar = React.createClass({displayName: "Calendar",
    mixins: mixins('dynamicStyle'),
    
    _changeMonth: function (forward) {
        var selectDay = forward ?
            dater.nextDay(this._days[this._days.length-1]) :
            dater.prevDay(this._days[0]);

        this._changeDate(selectDay);
    },

    _changeDate: function (date) {
        if (date == null) {
            return;
        }

        this.setState({
            selectDate: date
        });
    },

    _handleClick: function () {
        this._fadeOut(function () {
            var date = this.state.selectDate;
            if (this._timeWasSet) {
                date.setHours(+this.state.time[0]);
                date.setMinutes(+this.state.time[1]);
            }
            this.props.resolve({
                date: date,
                timeWasSet: this._timeWasSet
            });
        }.bind(this));
    },

    _handleTimeChange: function (i, syntheticEvent) {
        var time = utils.clone(this.state.time),
            regEx = new RegExp(/^[0-9]*$/),
            node = syntheticEvent.target,
            value = node.value;

        if (!regEx.test(value) || value.length > 2) {
            return;
        }

        this._timeWasSet = !(time[0] === '');
        time[i] = value;
        this.setState({ time: time });
    },

    _trimWeek: function (week) {
        var i,
            weekLength = week.length,
            action = week[0].getDay() === 0 ? 'push' : 'unshift';

        if (week.length === 7) {
            return week;
        }

        for (i = 0; i < 7 - weekLength; i++) {
            week[action](null);
        }

        return week;
    },

    _createWeekDay: function (weekDay, index) {
        return React.createElement("th", {key: index},  weekDay[0] );
    },

    _createDay: function (day, index) {
        var dayNumber = day === null ? '' : day.getDate(),
            className = this.cs({
                'active': day !== null ? dater.equalDays(this.state.selectDate, day) : false,
                'disable': day === null
            });

        return React.createElement("td", {onClick:  this._changeDate.bind(this, day), key: index, className: className }, React.createElement("span", null, dayNumber ));
    },

    _fadeOut: function (cb) {
        this.setState({
            display: 'fadeOut'
        });
        setTimeout(cb, 200);
    },

    _trimTime: function (number) {
        var res = number + "";
        return res.length === 2 ? res : "0" + res;  
    },

    getInitialState: function () {
        return {
            selectDate: new Date(),
            time: ['', ''],
            display: 'fadeIn'
        }
    },

    componentWillUpdate: function (nextProps, nextState) {
        this._days = dater.monthDays(nextState.selectDate);
    },

    componentWillMount: function () {
        this._timeWasSet = false;
        this._days = dater.monthDays(this.state.selectDate);
    },

    renderDays: function () {
        var selectDate = this.state.selectDate,
            that = this,
            weekDays = dater.weekDays(),
            weeks = [[]];

        this._days.forEach(function (day, index) {
            weeks[weeks.length-1].push(day);

            if (day.getDay() === 6 && index < that._days.length - 1) {
                weeks.push([]);
            }
        });

        weeks = weeks.map(function (week, index) {
            week = that._trimWeek(week);

            return (React.createElement("tr", {key: index}, 
                 week.map(that._createDay) 
            ))
        });

        return (React.createElement("div", {className: "calendar-days"}, 
            React.createElement("h1", null, 
                React.createElement("i", {className: "ico left", onClick:  this._changeMonth.bind(this, false) }, React.createElement(SvgIco, {name: "left-arrow"})), 
                React.createElement("span", null,  dater.format('MMMM YYYY', selectDate) ), 
                React.createElement("i", {className: "ico right", onClick:  this._changeMonth.bind(this, true) }, React.createElement(SvgIco, {name: "right-arrow"}))
            ), 
            React.createElement("section", null, 
                React.createElement("table", null, React.createElement("tbody", null, 
                    React.createElement("tr", null, " ", weekDays.map(this._createWeekDay), " "), 
                    weeks 
                ))
            )
        ))
    },

    render: function () {
        var selectDate = this.state.selectDate;

        return (React.createElement("div", {className:  this.animateCs('base:popup calendar; fadeIn:reduce duration-200ms; fadeOut:reduce-out duration-200ms') }, 
            React.createElement("h1", {key: "header"},  dater.format('dddd', selectDate) ), 
            React.createElement("div", {key: "banner", className: "selected-date"}, 
                React.createElement("p", {className: "month"},  dater.format('MMM', selectDate) ), 
                React.createElement("p", {className: "day"},  dater.format('D', selectDate) ), 
                React.createElement("p", {className: "year"},  dater.format('YYYY', selectDate) ), 
                React.createElement("p", {className: "time margin-top"}, 
                    React.createElement("input", {value:  this.state.time[0], onChange:  this._handleTimeChange.bind(this, 0), 
                    type: "text", ref: "hour", className: "modal-input"}), 
                    ":", 
                    React.createElement("input", {value:  this.state.time[1], onChange:  this._handleTimeChange.bind(this, 1), 
                    type: "text", ref: "minute", className: "modal-input"})
                )
            ), 
             this.renderDays(), 
            React.createElement("section", {className: "text-right"}, 
                React.createElement("button", {onClick:  this._handleClick, className: "modal-button"},  lz.OK)
            )
        ));
    }
});

module.exports = Calendar;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"components/svg-ico.jsx":18,"key-switch":37,"libs/dater":35,"libs/utils":38,"localization":39,"mixins/main":46}],59:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    lz = require('localization').get(),
    mixins = require('mixins/main');

var Confirm = React.createClass({displayName: "Confirm",
    mixins: mixins('dynamicStyle'),

    getInitialState: function () {
        return {
            display: 'fadeIn'
        }
    },

    fadeOut: function (cb) {
        this.state.display = 'fadeOut';
        this.setState(this.state);
        setTimeout(cb, 200);
    },

    handleClick: function (ans) {
        this.fadeOut(function () {
            this.props.resolve(ans);
        }.bind(this));
    },

    render: function () {
        var popup = this.popup = assign({
            title: lz.CONFIRM + '?',
            detail: null,
            no: lz.NO,
            yes: lz.YES,
            defaultValue: true
        }, this.props.popup);

        var detail = popup.detail == null ? '' :  React.createElement("small", null,  popup.detail);

        return (React.createElement("div", {className:  this.animateCs('base:popup popup-middle; fadeIn:reduce duration-200ms; fadeOut:reduce-out duration-200ms') }, 
            React.createElement("header", null, 
                React.createElement("strong", null,  popup.title), 
                detail 
            ), 
            React.createElement("section", {className: "text-right"}, 
                React.createElement("button", {className: "modal-button", onClick:  this.handleClick.bind(this, false), autoFocus:  !popup.defaultValue},  popup.no), 
                React.createElement("button", {className: "modal-button", onClick:  this.handleClick.bind(this, true), autoFocus:  popup.defaultValue},  popup.yes)
            )
        ));
    }
});

module.exports = Confirm;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"localization":39,"mixins/main":46}],60:[function(require,module,exports){
(function (global){
"use strict"

var route = (typeof window !== "undefined" ? window.libs.page : typeof global !== "undefined" ? global.libs.page : null),
    authorizer = require('libs/authorizer'),
    appActions = require('actions/appActions'),
    PAGES = require('constants/pages');

var onlyForAuthorized = function (ctx, next) {
    if (authorizer.isAuthorized()) {
        next();
    } else {
        route('/login');
    }
};

var onlyForNotAuthorized = function (ctx, next) {
    if (!authorizer.isAuthorized()) {
        next();
    }
    else {
        route('/')
    }
};

var routeMap = function () {

    route('/', onlyForAuthorized, function () {
        appActions.changePage(PAGES.DESK);
    });

    route('/login', onlyForNotAuthorized, function () {
        appActions.changePage(PAGES.LOGIN);
    });

    route('/signup', onlyForNotAuthorized, function () {
        appActions.changePage(PAGES.SIGN_UP);
    });

    route('/welcome', onlyForNotAuthorized, function () {
        appActions.changePage(PAGES.WELCOME);
    });


    route('/tasks', onlyForAuthorized, function () {
        appActions.changePage(PAGES.TASKS);
    });

    route('/profile', onlyForAuthorized, function () {
        appActions.changePage(PAGES.PROFILE);
    });

    authorizer.init(function () {
        route.start();
    });
};

module.exports = routeMap;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"actions/appActions":2,"constants/pages":30,"libs/authorizer":34}],61:[function(require,module,exports){
(function (global){
"use strict"

var EventEmitter = (typeof window !== "undefined" ? window.libs.events : typeof global !== "undefined" ? global.libs.events : null).EventEmitter,
    invariant = require('invariant'),
    assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    appDispatcher = require('appDispatcher'),
    CHANGE_EVENT = 'CHANGE';

var BaseStore = function (store) {
    invariant(store.setupActions, 'you must setup actions to store');
    
    var actions = {};

    var mapAction = function (actionName, callback) {
        actions[actionName] = callback;
    };
    var invokeAction = function (actionName, payload) {
        invariant(actions[actionName], 'undefined store action `%s`', actionName);
        actions[actionName](payload);
    };

    if ('PRODUCTION' === 'TEST') {
        store = assign(store, store.__test__);
        store.invokeAction = invokeAction;
    }

    store.setupActions(mapAction, invokeAction);
    delete store.setupActions;
    delete store.__test__;

    var childrenStore = assign({

        emitChange: function () {
            this.emit(CHANGE_EVENT);
        },

        addChangeListener: function (callback) {
            this.on(CHANGE_EVENT, callback);
        },
        
        removeChangeListener: function (callback) {
            this.removeListener(CHANGE_EVENT, callback);
        },
        
        dispatcherToken: appDispatcher.register(function (payload) {
            var action = actions[payload.action.type];

            if (typeof action == 'undefined') return;

            action(payload);
            childrenStore.emitChange();
        })

    }, EventEmitter.prototype, store);

    return childrenStore;
};

module.exports = BaseStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"appDispatcher":5,"invariant":36}],62:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    BaseStore = require('./baseStore'),
    lz = require('localization').get(),

    ACTION_TYPES = require('constants/actionTypes'),
    PAGES = require('constants/pages'),


    pages = null,
    currentPage = null;

var fillPages = function () {
    var DeskLayout = require('components/layouts/desk-layout.jsx'),
        WelcomeLayout = require('components/layouts/welcome-layout.jsx');

    pages = {};

    pages[PAGES.WELCOME] = {
        layout: WelcomeLayout,
        animate: true,
        page: require('pages/about.jsx'),
        name: PAGES.WELCOME,
        title: lz.ABOUT_PROJECT
    };

    pages[PAGES.SIGN_UP] = {
        layout: WelcomeLayout,
        animate: true,
        page: require('pages/signup.jsx'),
        name: PAGES.SIGN_UP,
        title: lz.SIGN_UP
    };

    pages[PAGES.LOGIN] = {
        layout: WelcomeLayout,
        animate: true,
        page: require('pages/login.jsx'),
        name: PAGES.LOGIN,
        title: lz.LOGIN
    };

    pages[PAGES.DESK] = {
        layout: DeskLayout,
        page: require('pages/desk.jsx'),
        name: PAGES.DESK,
        title: lz.DESK
    };

    pages[PAGES.TASKS] = {
        layout: DeskLayout,
        page: require('pages/tasks.jsx'),
        name: PAGES.TASKS,
        title: lz.ALL_TASKS
    };

    pages[PAGES.PROFILE] = {
        layout: DeskLayout,
        page: require('pages/profile.jsx'),
        name: PAGES.PROFILE,
        title: lz.PROFILE
    };
};

var pageStore = BaseStore({
    currentPage: function () {
        if (currentPage == null) return null;

        return currentPage.page;
    },

    currentPageName: function () {
        if (currentPage == null) return null;

        return currentPage.name;
    },

    currentPageLayout: function () {
        if (currentPage == null) return null;
        return currentPage.layout;
    },

    currentPageTitle: function () {
        if (currentPage == null) return null;

        return currentPage.title;
    },

    currentPageAnimate: function () {
        return currentPage !== null && currentPage.animate === true;
    },

    setupActions: function (mapAction) {
        mapAction(ACTION_TYPES.CHANGE_PAGE, function (payload) {
            if (pages == null) fillPages();
            currentPage = pages[payload.action.page] || null;
        });
    }
});

module.exports = pageStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./baseStore":61,"components/layouts/desk-layout.jsx":7,"components/layouts/welcome-layout.jsx":8,"constants/actionTypes":28,"constants/pages":30,"localization":39,"pages/about.jsx":47,"pages/desk.jsx":48,"pages/login.jsx":49,"pages/profile.jsx":50,"pages/signup.jsx":51,"pages/tasks.jsx":52}],63:[function(require,module,exports){
(function (global){
"use strict"

var assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    baseStore = require('./baseStore'),
    ACTIONS = require('constants/actionTypes'),
    QUICK_ADD_BLOCKS = require('constants/quickTaskAddBlocks'),

    startAdd = false,
    activeBlock = QUICK_ADD_BLOCKS.TEXT_BOX;

var defaultTask = {
    title: '',
    today: true,
    timeWasSet: false,
    date: new Date(),
    priority: 2,
};

var task = assign({}, defaultTask);

var quickTaskAddStore = baseStore({
    startedAdd: function () {
        return startAdd;
    },

    getTask: function () {
        return assign({}, task);
    },

    activeBlock: function () {
        return activeBlock;
    },

    priority: function () {
        return task.priority;
    },

    title: function () {
        return task.title;
    },

    forToday: function () {
        return task.today;
    },

    setupActions: function (mapAction, invokeAction) {
        mapAction(ACTIONS.START_ADD_TASK, function (payload) {
            startAdd = true;
        });

        mapAction(ACTIONS.STOP_ADD_TASK, function (payload) {
            startAdd = false;
            activeBlock = QUICK_ADD_BLOCKS.TEXT_BOX;
            assign(task, defaultTask);
        });

        mapAction(ACTIONS.SET_ADDITION_TASK_DATE, function (payload) {
            assign(task, {
                today: payload.action.today,
                date: payload.action.date
            });
        });

        mapAction(ACTIONS.SET_ADDITION_TASK_TITLE, function (payload) {
            assign(task, {
                title: payload.action.title
            });
        });

        mapAction(ACTIONS.CHANGE_QUICK_ADD_BLOCK, function (payload) {
            if (!startAdd) {
                return;
            }

            activeBlock = payload.action.block;
        });

        mapAction(ACTIONS.SET_ADDITION_TASK_PRIORITY, function (payload) {
            var priority = payload.action.priority;
            priority = priority > 5 ? 5 : priority;
            priority = priority < 0 ? 0 : priority;

            assign(task, {
                priority: priority
            });
        });

        mapAction(ACTIONS.SAVING_ADDITION_TASK, function (payload) {
            invokeAction(ACTIONS.STOP_ADD_TASK);
        });
    }
});

module.exports = quickTaskAddStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./baseStore":61,"constants/actionTypes":28,"constants/quickTaskAddBlocks":32}],64:[function(require,module,exports){
(function (global){
"use strict"

var assign = (typeof window !== "undefined" ? window.libs.objectAssign : typeof global !== "undefined" ? global.libs.objectAssign : null),
    utils = require('libs/utils'),
    dater = require('libs/dater'),
    baseStore = require('./baseStore'),
    ACTIONS = require('constants/actionTypes'),
    _tasks = [];

var taskMethods = {
    precedence: function (unit) {
        if (unit === '%') {
            return this.priority * 100 / 5;
        } else {
            throw new Error("unknown unit of precedence: `" + unit + "`");
        }
    }
};

var _trimTask = function (task) {
    assign(task, taskMethods, {
        today: dater.equalDays(new Date(), task.date),
        done: typeof task.done === 'undefined' ? false : task.done
    });
};

var _get = function (filterModel) {
    if (typeof filterModel === 'undefined') {
        return _tasks;
    }

    if (typeof filterModel !== 'object') {
        filterModel = { _id: filterModel };
    }

    return _tasks.filter(function (t) {
        return utils.liteEqual(t, filterModel); 
    });
};

var tasksStore = baseStore({
    __test__: {
        set: function (tasks) {
            _tasks = tasks;
        },
    },

    tasksForToday: function () {
        return tasksStore.get({ today: true });
    },

    tasksForThen: function () {
        return tasksStore.get({ today: false });
    },

    get: function (filterModel) {
        var result,
            single = false;

        if (typeof filterModel !== 'undefined' && typeof filterModel !== 'object') {
            single = true;
        }

        result = _get(filterModel);
        return single ? utils.clone(result[0]) : utils.clone(result);
    },

    count: function () {
        return _tasks.length;  
    },

    setupActions: function (mapAction, invokeAction) {
        mapAction(ACTIONS.SAVED_TASK, function (payload) {
            var savedTask = payload.action.task;
            _trimTask(savedTask);
            _tasks.push(savedTask)
        });

        mapAction(ACTIONS.PUT_TASKS_PACK, function (payload) {
            _tasks = payload.action.tasks;
            _tasks.forEach(_trimTask);
        });

        mapAction(ACTIONS.TASK_UPDATED, function (payload) {
            var task = payload.action.task,
                existing = _get(task._id)[0];

            assign(existing, task);
            _trimTask(existing);
        });
    }
});

module.exports = tasksStore;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./baseStore":61,"constants/actionTypes":28,"libs/dater":35,"libs/utils":38}],65:[function(require,module,exports){
(function (global){
"use strict"

var React = (typeof window !== "undefined" ? window.libs.React : typeof global !== "undefined" ? global.libs.React : null),
    route = require('route'),
    mixins = require('mixins/main'),
    pageStore = require('stores/pageStore');

var TaskManager = React.createClass({displayName: "TaskManager",
    mixins: mixins('bindToStore'),
    bindingStores: [pageStore],

    _initPage: function (page) {
        this._page = page;
    },

    getInitialState: function () {
        return {
            page: pageStore.currentPage(),
            pageTitle: pageStore.currentPageTitle(),
            animate: pageStore.currentPageAnimate(),
            layout: pageStore.currentPageLayout()
        }
    },

    componentWillMount: function () {
        this._fadeOut = true;
        this._page = null;
        route();
    },
    
    componentDidUpdate: function () {
        document.getElementsByTagName('title')[0].innerText = this.state.pageTitle;
        this._fadeOut = false;
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        var that = this;

        if (this.state.page === null || !this.state.animate) {
            return true;
        }

        if (this._fadeOut) {
            return true;
        }

        this._page.fadeOut().then(function () {
            that._fadeOut = true;
            that.setState(nextState);
        });

        return false;
    },

    render: function () {
        var CurrentPage = this.state.page,
            Layout = this.state.layout;

        if (CurrentPage == null) return React.createElement("div", null);

        return React.createElement(Layout, null, React.createElement(CurrentPage, {onInit:  this._initPage}));
    }
});

module.exports = TaskManager;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"mixins/main":46,"route":60,"stores/pageStore":62}],66:[function(require,module,exports){
"use strict";

var validator = {
    checkEmail: function (email) {
        if (email === '') {
            return false;
        }

        var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
        return re.test(email);
    },

    checkPasswords: function (password, confirmPassword) {
        if (password !== confirmPassword) {
            return false;
        }

        return true;
    }
};

module.exports = validator;

},{}]},{},[1]);
