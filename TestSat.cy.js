
//Choose your Satellite below!

const satellite = 'directv 10'


// Bugs:
// 1. First time running file shows timeout error when loading website. Restarting test 1-2 times corrects the issue
// 2. Gives warning of 2 or more selections even when only 1 selected

// Test Description
// 1. Goes to the AGSATTRACK website
// 2. Searches the first group for your choice of satellite
// 3. If the satellite is not in the first group, it loops through all the groups until satellite is found
// 4. Checkmarks your satellite choice and selects the "information" tab
// 5. Collects all the data of the satellite (ether logged in console or a .csv file)


//Visit the AGSATTRACK website
before(()=>{
    cy.visit('https://agsattrack.com/').wait(6000)
})

describe('Satellite Tracking', () => {
    //Auto capitalizes your satellite choice for AGSATTRACK
    const yourSatelliteChoice = satellite.toUpperCase()
    //Function to count how many words in a string
    const countWords = (str)=> {
        const arr = str.split(' ');
        return arr.filter(word => word !== '').length;
    }
    //Function to collect satellite data into .csv or console
    const collectData = ()=> {
        //Find the information tab
        cy.get('[class="satinfo"]').wait(2000).eq(0).within(()=> {
            //Assertion to see your satellite choice is included within the data cell text
            cy.get('#name').should('contain',yourSatelliteChoice)
            //Find first column and grab the text from the element
            cy.get('tr td:nth-child(1)').each(($el,index,$list)=>{
                const dataText=$el.text()
                //Now find second column using .next() and that element's text
                cy.get('tr td:nth-child(1)').eq(index).next().then(($el2)=>{
                    //Finds the two data columns
                    const dataText2=$el2.text()
                    //Combine the two data columns and log
                    const fullData= dataText + ' = ' + dataText2
                    console.log(fullData)
                    //Slash out the above two and remove slashes from bottom two to log/save to CSV file
                    //const fullData = [dataText,dataText2]
                    //cy.writeFile('SatData.csv',fullData,{flag:'a+'})
                })
            })
        })
    }
    //Function to find the correct satellite in the table
    const findData = ()=> {
        cy.wait(500)
        //Use CSS selectors to find the elements that contain Satellite names
        cy.get('[class="datagrid-btable"]').find('tr').each(($el,index,$list)=>{
            //Converts the satellite names into string to be readable
            const textSat=$el.find('[class="datagrid-cell datagrid-cell-c3-name"]').text().toString()
            //If the AGSATTRACK text includes your satellite choice text, click the checkbox and the information panel
            if(textSat.includes(yourSatelliteChoice)){
                $el.find('.datagrid-cell-check').click()
                cy.get('.layout-expand > .panel-header > .panel-tool > .layout-button-left').click({force:true})
                //If there is more than 1 satellite choice, give the below logs
                if(countWords(textSat)>1){
                    cy.log('***WARNING: You may need more detailed text specified in "Your Satellite Choice"***')
                    cy.log('An incorrect Satellite selection (number or name) may have been performed due to two or more possible options. Re-run test with more detailed text if incorrect satellite.')
                }
                //Collect Data and pause test. End or continue
                collectData()
                cy.log('***END TEST***').pause()
            }
        })
    }
    //Scrolling function. v is for vertical and h is for horizontal scrolling. 
    //V starts at 0 pixels and can go up by a factor of 1000. h is always 0
    let v = 0
    //v will always restart at 0 for each "it" block. scrolling function also tries to find Data after each scroll
    //Scrolling required since HTML/CSS elements may be hidden from selector table until scrolled near to
    const scrolling = (h,v)=> {
        cy.get('.layout-body > .panel > .datagrid-wrap > .datagrid-view > .datagrid-view2 > .datagrid-body').scrollTo(h,v).wait(50).then(()=>{
            findData()
        })
    }
    //Function to repeat the scrolling function a number of times
    const scrollTimes = (times)=> {
        Array.from({length:times}, () => scrolling(0,v+=1000))
    }
    //Function to find the HTML/CSS selector of any group of satellites
    const groupFind = (group)=> {
        cy.get('[class="jqx-listitem-state-normal jqx-item jqx-rc-all"]').contains(group).click({force:true})
    }
    it('Checking Amateur Radio Group', ()=>{
        cy.wait(3000)
        scrollTimes(3)
    })
    it('Checking CubeSats Group', ()=>{
        v = 0
        //The group tab will be open from here on out
        cy.get('#sat-group-selector > .ribbon-normal').click().then(()=>{
            groupFind('CubeSats')
            scrollTimes(3)
        })
    })
    it('Checking GPS Group', ()=>{
        groupFind('GPS')
        findData()
    })
    it('Checking Weather Group', ()=>{
        groupFind('Weather')
        findData()
    })
    it('Checking Earth Group', ()=>{
        v = 0
        groupFind('Earth')
        scrollTimes(4)
    })
    it('Checking Military Group', ()=>{
        groupFind('Military')
        findData()
    })
    it('Checking Brightest Satellites Group', ()=>{
        v = 0
        groupFind('Brightest')
        scrollTimes(5)
    })
    it('Checking Search & Rescue Group', ()=>{
        groupFind('Search')
        findData()
    }) 
    it('Scrolling Tab', ()=>{
        //The satellite group tab requires to be scrolled to show the HTML/CSS elements for the remaining satellite groups
        cy.get('#jqxScrollBtnDownverticalScrollBarsat-group-selector-listbox > .jqx-reset').trigger('mousedown')
        cy.wait(1500)
        cy.get('#jqxScrollBtnDownverticalScrollBarsat-group-selector-listbox > .jqx-reset').trigger('mouseleave')
    })
    it('Checking Geostationary Group', ()=>{
        v = 0
        groupFind('Geostationary')
        cy.wait(1000)
        scrollTimes(13)
    }) 
    it('Checking Geodetic Group', ()=>{
        groupFind('Geodetic')
        findData()
    })
    it('Checking Last 30 Days Group', ()=>{
        v = 0
        groupFind('Last')
        scrollTimes(5)
    })
    it('Checking Experimental Group', ()=>{
        groupFind('Experimental')
        findData()
    })
    it('Checking Space Stations Group', ()=>{
        groupFind('Space')
        findData()
    })
    it('Checking Science Group', ()=>{
        v = 0
        groupFind('Science')
        scrollTimes(3)
    })
    it('Checking Starlink Group', ()=>{
        //Starlink is just a big boy!
        v = 0
        groupFind('Starlink')
        cy.wait(8000)
        scrollTimes(80)
    })  
})
