const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

const registerPage = require('./pages/register.js')(driver);

describe('New account requirements selenium tests', () => {
    before(function(done) {
        this.timeout(10000);
        registerPage.navigate().then(() => done());
    });

    it('Blank Username', function(done) {
        registerPage.enterEmail('testingemail@gmail.com')
        registerPage.enterPassword('testing123')
        registerPage.enterConfirmPass('testing123');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Username cannot be blank') done();
            });
        })
    });

    it('Invalid Username', function(done) {
        registerPage.enterUsername('testUser!@#$%');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Username can only contain letters and numbers') done();
            })
        })
    });

    it('Duplicate Username', function(done) {
        registerPage.clearUsername();
        registerPage.enterUsername('testsuper');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Username already exists') done();
            })
        })
    });

    it('Blank Email', function(done) {
        driver.navigate().refresh();
        registerPage.enterUsername('validUser');
        registerPage.enterPassword('testing123');
        registerPage.enterConfirmPass('testing123');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Email cannot be blank') done();
            })
        })
    });

    it('Invalid Email', function(done) {
        registerPage.clearEmail();
        registerPage.enterEmail('invalidEmail');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Not a valid email') {
                    done();
                }
            })
        })
    });

    it('Duplicate Email', function(done) {
        registerPage.clearEmail();
        registerPage.enterEmail('weatherstationtest@gmail.com')
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Email already exists') done();
            })
        })
    });

    it('Short Password', function(done) {
        registerPage.clearEmail();
        registerPage.enterEmail('testingemail@gmail.com')
        registerPage.clearPassword();
        registerPage.clearConfirmPass();
        registerPage.enterPassword('short1');
        registerPage.enterConfirmPass('short1');
        registerPage.register();


        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Password must be 8 characters or longer') done();
            })
        })
    });

    it('Password doesn’t meet string requirements', function(done) {
        registerPage.clearPassword();
        registerPage.clearConfirmPass();
        registerPage.enterPassword('NoNumbers');
        registerPage.enterConfirmPass('NoNumbers');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Password must have at least 1 letter and 1 number') done();
            })
        })
    });

    it('Passwords do not match', function(done) {
        registerPage.clearPassword();
        registerPage.clearConfirmPass();
        registerPage.enterPassword('password1');
        registerPage.enterConfirmPass('password2');
        registerPage.register();

        driver.wait(until.elementLocated(By.className('error-alert')), 10000).then(() => {
            driver.findElement(By.className('error-alert')).getAttribute('innerHTML')
            .then((text) => {
                if(text === 'Passwords do not match') done();
            })
        })
    });
    after(function(done) {
        driver.quit().then(() => done())
    });
});