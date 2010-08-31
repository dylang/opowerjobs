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
            /*,
            children: [
                // {
                //     id: 'sample',
                //     label: 'Sample Name',
                //     url: 'sample/url',
                //     file: 'file/location'
                // },
            ] */
        },
        {
            id: 'jobs',
            label: 'Jobs',
            url: 'departments',
            children: [
                {
                    id: 'teams',
                    label: 'Our Teams',
                    url: 'departments',
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'jobs/benefits',
                    file: 'benefits'
                }
            ]
            
        },
        {
            id: 'about',
            label: 'About OPOWER',
            url: 'out-story',
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
