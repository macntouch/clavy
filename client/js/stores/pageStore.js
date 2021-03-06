"use strict"

var React = require('react'),
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