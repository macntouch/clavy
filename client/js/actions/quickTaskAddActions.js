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