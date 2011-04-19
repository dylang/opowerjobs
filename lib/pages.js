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
            id: 'jobs',
            label: 'Jobs',
            children: [
                {
                    id: 'teams',
                    label: 'Teams',
                    url: 'teams'
                },
                {
                    id: 'locations',
                    label: 'All Openings',
                    file: 'static-pages/locations',
                    url: 'locations'
                },
                {
                    id: 'engineering',
                    label: 'Engineering Spotlight',
                    url: 'engineering'
                },
                {
                    id: 'interviewing',
                    label: 'Interviewing',
                    url: 'interviewing',
                    file: 'static-pages/interviewing'
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
                    file: 'static-pages/our-story'
                },
                {
                    id: 'workinghere',
                    label: 'Life at OPOWER',
                    url: 'working-here',
                    file: 'static-pages/working-here'
                },
                {
                    id: 'engineeringculture',
                    label: 'Engineering Culture',
                    url: 'engineering-culture',
                    file: 'static-pages/engineering-culture'
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'benefits',
                    file: 'static-pages/benefits'
                },                    
                {
                    id: 'films',
                    label: 'OPOWER on Film',
                    url: 'films',
                    file: 'static-pages/films',
                    video: 'life',
                    children: [
                        {
                            id: 'films',
                            label: 'Inside the Printing Process',
                            url: 'films/printing-process',
                            file: 'static-pages/films',
                            video: 'printing'
                        },
                        {
                            id: 'films',
                            label: 'President Obama visits OPOWER',
                            url: 'films/obama',
                            file: 'static-pages/films',
                            video: 'obama'
                        },
                        {
                             id: 'films',
                             label: 'Chief Hula Officer',
                             url: 'films/hula',
                             file: 'static-pages/films',
                             video: 'hula'
                        }
                    ]
                }
            ]
        }
    ];
