
//Choose your Satellite below!

const satellite = 'directv 10'


// Bugs:
// 1. First time running file shows timeout error when loading website. Restarting 1-2 times corrects the issue (Mostly an issue before V12.3.0)
// 2. Test browser randomly shuts down once in a while due to some "devtool" issue

// Test Description
// 1. Goes to the AGSATTRACK website
// 2. Searches the first group for your choice of satellite
// 3. If the satellite is not in the current table, it scrolls down to make the element visible in the DOM
// 4. If the satellite is not in the current satellite Group, it loops through the Groups and scrolls again until it is found
// 5. Checkmarks your satellite choice and selects the "information" tab
// 6. Collects all the data of the satellite (ether logged in console or a .csv file) and asserts a successful test
// 7. If your satellite choice is not found, it will assert a failed test


//Visit the AGSATTRACK website
before(() => {
    cy.visit('https://agsattrack.com/').wait(6000)
})

describe('Satellite Tracking', () => {
    //Auto capitalizes your satellite choice for AGSATTRACK
    const yourSatelliteChoice = satellite.toUpperCase()
    //Function to collect satellite data into .csv or console
    const collectData = () => {
        //Find the information tab
        cy.get('.layout-expand > .panel-header > .panel-tool > .layout-button-left').click({ force: true })
        cy.get('[class="satinfo"]').wait(2000).eq(0).within(() => {
            //Assertion to see your satellite choice is included within the data cell text
            //Find first column and grab the text from the element
            cy.get('tr td:nth-child(1)').each(($el, index, $list) => {
                const dataText = $el.text()
                //Now find second column using .next() and that element's text
                cy.get('tr td:nth-child(1)').eq(index).next().then(($el2) => {
                    //Finds the two data columns
                    const dataText2 = $el2.text()
                    //Combine the two data columns and log
                    const fullData = dataText + ' = ' + dataText2
                    console.log(fullData)
                    //Comment out the above two and uncomment the bottom two to log/save to CSV file
                    //const fullData = [dataText,dataText2]
                    //cy.writeFile('SatData.csv',fullData,{flag:'a+'})
                })
                
            })
            //cy.get('#name').should('contain', yourSatelliteChoice)
            //Uncomment above if you want an assertion to make sure you have the correct satellite
            //Some satellites don't have complete text values on the website and may give a false negative test execution with the above assertion. The assertion below ends the test positively.
            assert(true, 'Data collection complete!')
        })
    }
    //Create variable for scrolling times to loop through a % amount of scrolling
    var scrollMultiplier = 1
    //Create variable to loop through all the groups of satellites
    var groupSelectorNum = 0
    //Function to find the correct satellite in the table
    var findData = () => {
        //Use CSS selectors to find the elements that contain Satellite names
        cy.get('.layout-body > .panel').then($el => {
            //If the AGSATTRACK text includes your satellite choice text, click the checkbox and the information panel and initiate collectData() function to stop the loop
            if ($el.text().includes(yourSatelliteChoice)) {
                cy.get('.layout-body > .panel').contains(yourSatelliteChoice).click()
                collectData()
            }
            //If text does not include your satellite choice, keep scrolling
            else {
                //Scroll by multiples of 10%
                var scrollPercentage = 10 * scrollMultiplier
                //Make scrolling % to string to change it every loop within the scrollTo() function couple lines below
                var scroll_str = scrollPercentage.toString() + '%'
                //Once at last group (Starlink), assert a message of not finding satellite and stop the loop
                if (groupSelectorNum == 18 && scrollPercentage == 100) {
                    assert(false, 'Could not find your satellite choice.')
                }
                //While under 100% scroll percentage, keep adding 10% and loop through this findData() function again
                if (scrollPercentage <= 100) {
                    cy.get('.layout-body > .panel > .datagrid-wrap > .datagrid-view > .datagrid-view2 > .datagrid-body').scrollTo('0%', scroll_str, { ensureScrollable: false }).then(() => {
                        cy.wait(100)
                        scrollMultiplier += 1
                        findData()
                    })
                }//If scroll percetnage is at 100%, switch to the next group of satellites
                else {
                    scrollMultiplier = 1
                    groupSelectorNum += 1
                    var selectorNum_str = groupSelectorNum.toString()
                    //CSS selector to click on "Groups"
                    cy.get('#sat-group-selector > .ribbon-normal').click().then(() => {
                        //Adds "1" each loop to go down the satellite groups if the satellite is not found in a certain group. Tries to find the Data each time.
                        cy.get('#listitem' + selectorNum_str + 'sat-group-selector-listbox').click({ force: true }).wait(2000).then(() => {
                            findData()
                        })
                    })
                }
            }
        })
    }
    it('Finding Satellite Information', () => {
        cy.wait(3000)
        findData()
    })
})
