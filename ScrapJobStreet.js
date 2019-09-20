let webdriver = require("selenium-webdriver"),
    by = webdriver.By;
let chromeCapabilities = webdriver.Capabilities.chrome();
let fs = require('file-system');
let fileName = 'D:\\CQTechnologies\\Scrapping\\data.txt';

let chromeOptions = {
    'args': ['--disable-notifications']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
let driver = new webdriver.Builder().forBrowser('chrome').withCapabilities(chromeCapabilities).build();


driver.get('https://myjobstreet.jobstreet.com.sg/home/login.php?site=sg&language_code=3');
driver.findElement(by.id('login_id')).sendKeys('YourEmail@gmail.com'); //Enter Your Email
driver.findElement(by.id('password')).sendKeys('YourPassword'); //Enter Your Password
driver.findElement(by.id('btn_login')).click().then(() => {
    let goToSearch = driver.findElement(by.id('header_job_link'));
    goToSearch.click().then(() => {
        let search = driver.findElement(by.id('search_box_keyword'));
        search.sendKeys('Casual Labour'); //Enter your Search
        driver.findElement(by.id('header_searchbox_btn')).click().then(async () => {
            let count = 1;
            let switchToJobDetailPage;
            let getJobDetailPageLink;
            let pagination;
            let getJobTitle;
            let getEmail;
            let switchToPagination;
            let serialNo = 1;
            let jobTitle;
            let email;
            let fileContent;

            try {
                await driver.findElement(by.id('empty-job'));
                console.log("Sorry, your search did not match any jobs");
            } catch (e) {
                try {
                    await driver.findElement(by.id('page_next'));
                    getAllDataWithPagination()
                } catch (e) {
                    try {
                        getDataWhichDoNotHavePagination();
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

            async function getDataWhichDoNotHavePagination() {
                while (count) {
                    try{
                        getJobDetailPageLink = await driver.findElement(by.id('position_title_' + count));
                        await getJobDetailPageLink.getAttribute('href').then((value) => {
                            switchToJobDetailPage = value;
                        });
                        await driver.get(switchToJobDetailPage).then(async () => {
                            getJobTitle = await driver.findElement(by.id('position_title'));
                            await getJobTitle.getText().then((value) => {
                                jobTitle = value;
                            }).catch(error => console.log(error));
                            getEmail = await driver.findElement(by.id('job_description'));
                            await getEmail.getText().then((value) => {
                                email = value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                                if (email === undefined || email === null) {
                                    email = "No email available";
                                } else {
                                    email.toString();
                                }
                            });
                            fileContent = serialNo + ". Job Title " + jobTitle + " Email: " + email + "\n";
                            fs.appendFile(fileName, fileContent, (err) => {
                                if (err) throw err;
                            });
                            serialNo++;
                        });
                        count++;
                        await driver.executeScript("window.history.go(-1)");
                    }catch (e) {
                        fs.appendFile(fileName, "Search Completed \n", (err) => {
                            if (err) throw err;
                        });
                        break;
                    }
                }
            }

            async function getAllDataWithPagination() {
                while (count) {
                    try {
                        pagination = driver.findElement(by.id('page_' + count));
                        for (let i = 1; i <= 20; i++) {
                            getJobDetailPageLink = driver.findElement(by.id('position_title_' + i));
                            await getJobDetailPageLink.getAttribute('href').then((value) => {
                                switchToJobDetailPage = value;
                            });
                            await driver.get(switchToJobDetailPage).then(async () => {
                                getJobTitle = await driver.findElement(by.id('position_title'));
                                await getJobTitle.getText().then((value) => {
                                    jobTitle = value;
                                }).catch(error => console.log(error));
                                getEmail = await driver.findElement(by.id('job_description'));
                                await getEmail.getText().then((value) => {
                                    email = value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                                    if (email === undefined || email === null) {
                                        email = "No email available";
                                    } else {
                                        email.toString();
                                    }
                                });
                                fileContent = serialNo + ". Job Title " + jobTitle + " Email: " + email + "\n";
                                fs.appendFile(fileName, fileContent, (err) => {
                                    if (err) throw err;
                                });
                                serialNo++;
                            });
                            await driver.executeScript("window.history.go(-1)");
                        }
                        count++;
                        pagination = await driver.findElement(by.id('page_' + count));
                        await pagination.getAttribute('href').then((value) => {
                            switchToPagination = value;
                        });
                        await driver.get(switchToPagination);
                    }catch (e) {
                        fs.appendFile(fileName, "Search Completed \n", (err) => {
                            if (err) throw err;
                        });
                        break;
                    }
                }
            }
            // await driver.quit();
        });
    });

});

