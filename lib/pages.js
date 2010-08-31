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
            url: 'departments',
            children: [
                {
                    id: 'departments',
                    label: 'Our Teams',
                    url: 'jobs/teams',
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'jobs/benefits',
                    file: 'jobs/benefits'
                }
            ]
            
        },
        {
            id: 'about',
            label: 'About OPOWER',
            url: 'our-story',
            children: [
       
                {
                    id: 'ourstory',
                    label: 'Our Story',
                    url: 'our-story',
                    file: 'our-story'
                },
                {
                    id: 'workinghere',
                    label: 'Working Here',
                    url: 'working-here',
                    file: 'working-here'
                },
                {
                    id: 'lifeindc',
                    label: 'Life in DC',
                    url: 'working-here/dc',
                    file: 'working-here/dc'
                },
            ]
        }
    ];
