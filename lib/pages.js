/*!
 * Opower Jobs
 * Copyright(c) 2010 Dylan Greene <dylang@gmail.com>
 * MIT Licensed
 */

module.exports.tree = [

        {
            id: 'welcome',
            label: 'Welcome',
            url: '',
            file: 'index'
        },
        {
            /* for metro ad tracking */
            noMenu: true,
            id: 'welcome',
            url: 'hiring',
            file: 'index'
        },
        {
            /* for sweetlife tracking */
            noMenu: true,
            id: 'welcome',
            url: 'sweetlife',
            file: 'index'
        },
        {
            /* for mashable tracking */
            noMenu: true,
            id: 'welcome',
            url: 'mustache',
            file: 'static-pages/mustache'
        },
        {
            /* for mashable tracking */
            noMenu: true,
            id: 'welcome',
            url: 'moustache',
            file: 'static-pages/mustache'
        },
        {
            noMenu: true,
            id: 'locations',
            label: 'Locations',
            url:  'locations',
            file: 'static-pages/locations'
        },
        {
            id: 'teams',
            label: 'All Openings',
            url: 'teams'
        },
        {
            id: 'sales-business-development',
            label: 'Sales Hiring Spotlight',
            url: 'sales-business-development'
        },
        {
            id: 'interviewing',
            label: 'Interviewing',
            url: 'interviewing',
            file: 'static-pages/interviewing'
        },

        {
            id: 'ourstory',
            label: 'Our Story',
            url: 'our-story',
            file: 'static-pages/our-story'
        },
        {
            id: 'workinghere',
            label: 'Life at Opower',
            url: 'working-here',
            file: 'static-pages/working-here'
        }

    ];
