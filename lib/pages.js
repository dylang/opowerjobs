/*!
 * OPOWER Jobs
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
            id: 'jobs',
            label: 'Jobs',
            children: [
                {
                    id: 'teams',
                    label: 'By Team',
                    url: 'teams'
                },
                {
                    id: 'all',
                    label: 'All Openings',
                    url: 'all'
                },
                {
                    id: 'engineering',
                    label: 'Engineering Spotlight',
                    url: 'engineering'
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'benefits',
                    file: 'jobs/benefits'
                }
            ]
            
        },
        {
            id: 'about',
            label: 'Working Here',
            children: [
       
                {
                    id: 'ourstory',
                    label: 'Our Story',
                    url: 'our-story',
                    file: 'our-story'
                },
                {
                    id: 'workinghere',
                    label: 'Life at OPOWER',
                    url: 'working-here',
                    file: 'working-here'
                },
                {
                    id: 'films',
                    label: 'OPOWER on film',
                    url: 'films',
                    file: 'films'
                }
            ]
        }
    ];
