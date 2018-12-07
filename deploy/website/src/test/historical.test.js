const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

const loginPage = require('./pages/login.js')(driver);

describe('Historical page selenium tests', () => {
    before(function(done) {
        this.timeout(10000);
        driver.navigate().to('http://localhost:8000/');
        loginPage.enterUsername('tmalarkey');
        loginPage.enterPassword('password123');
        loginPage.login()
            .then(() => done())
    });

    it('Navigate to historical', function(done) {
        driver.navigate().to('http://localhost:8000/historical');
        driver.wait(until.elementLocated(By.className('historical-page-title')), 10000).then(()=>{
            driver.findElement(By.className('historical-page-title'))
        })
        .then(() => done())
    });

    it('No data', function(done) {
        driver.wait(until.elementLocated(By.className('col-12 no-data-alert')), 10000).then(()=>{
            driver.findElement(By.className('col-12 no-data-alert'))
        })
        .then(() => done())
    });

    it('Click Filter', function(done) {
        this.timeout(10000);
        driver.findElement(By.id('filter')).click();
        driver.wait(until.elementLocated(By.css('.modal-open')), 10000).then(()=>{
            driver.findElement(By.css('.modal-open'))
        })
        .then(() => done())
    });

    it('Click Submit', function(done) {
        this.timeout(10000);
        driver.findElement(By.className('btn btn-primary')).click();
        driver.wait(until.elementLocated(By.className('historical-page-title')), 10000).then(()=>{
            driver.findElement(By.className('historical-page-title'))
        })
            .then(() => done())
    });

    it('Click Cancel', function(done) {
        this.timeout(10000);
        driver.findElement(By.id('filter')).click();
        driver.wait(until.elementLocated(By.css('.modal-open')), 10000).then(()=>{
            driver.findElement(By.css('.modal-open'))
        });
        driver.findElement(By.className('btn btn-secondary')).click();
        driver.wait(until.elementLocated(By.className('historical-page-title')), 10000).then(()=>{
            driver.findElement(By.className('historical-page-title'))
        })
            .then(() => done())
    });

    after(function(done) {
        driver.quit().then(() => done())
    });
});