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
                    id: 'interviewing',
                    label: 'Interviewing',
                    url: 'interviewing',
                    file: 'content/interviewing'
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
                    file: 'content/our-story'
                },
                {
                    id: 'workinghere',
                    label: 'Life at OPOWER',
                    url: 'working-here',
                    file: 'content/working-here'
                },
                {
                    id: 'benefits',
                    label: 'Benefits & Perks',
                    url: 'benefits',
                    file: 'content/benefits'
                },                    
                {
                    id: 'films',
                    label: 'OPOWER on Film',
                    url: 'films',
                    file: 'content/films',
                    video: 'life',
                    children: [
                        {
                            id: 'films',
                            label: 'Inside the Printing Process',
                            url: 'films/printing-process',
                            file: 'content/films',
                            video: 'printing'
                        },
                        {
                            id: 'films',
                            label: 'President Obama visits OPOWER',
                            url: 'films/obama',
                            file: 'content/films',
                            video: 'obama'
                        },
                        {
                             id: 'films',
                             label: 'Chief Hula Officer',
                             url: 'films/hula',
                             file: 'content/films',
                             video: 'hula'
                        }
                    ]
                }
            ]
        }
    ];
