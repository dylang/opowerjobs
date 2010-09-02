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
                    label: 'All Teams',
                    url: 'teams'
                },
                {
                    id: 'engineering',
                    label: 'Engineering Careers',
                    url: 'engineering'
                },        
                {
                    id: 'all',
                    label: 'All Openings',
                    url: 'all'
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
                    id: 'lifeindc',
                    label: 'Life in the District',
                    url: 'working-here/dc',
                    file: 'working-here/dc'
                },
                {
                    id: 'videos',
                    label: 'Videos',
                    url: 'videos',
                    file: 'videos'
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'benefits',
                    file: 'jobs/benefits'
                }
            ]
        }
    ];
