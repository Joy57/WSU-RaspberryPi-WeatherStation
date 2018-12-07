const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

const loginPage = require('./pages/login.js')(driver);
const registerPage = require('./pages/register.js')(driver);
const resetPage = require('./pages/resetPassword.js')(driver);


describe('Login page selenium tests', () => {
    before(function(done) {
        this.timeout(10000);
        loginPage.navigate().then(() => done());
    });

    it('Invalid Username/Password', function(done) {
        loginPage.enterUsername('wronglogin');
        loginPage.enterPassword('wrongpass123');
        loginPage.login();
        driver.wait(until.elementLocated(By.className('alert-danger login-error')), 10000).then(() => {
            driver.findElement(By.className('alert-danger login-error'))
        })
        .then(() => done());
    });

    it('Register Button', function(done) {
        loginPage.register().then(()=>done());
        driver.wait(until.elementLocated(By.className('register-container')), 10000).then(()=>{
            driver.findElement(By.className('register-container'))
        })
        registerPage.return().then(() => done());
    });

    it('Forgot Password', function(done) {
        loginPage.forgotPass();
        driver.wait(until.elementLocated(By.css('reset-password-page')), 10000).then(()=>{
            driver.findElement(By.css('reset-password-page'))
        })
        resetPage.return().then(() => done());
    });

    it('Login', function(done) {
        loginPage.enterUsername('testsuper');
        loginPage.enterPassword('testing123')
        loginPage.login();

        driver.wait(until.elementLocated(By.className('station-list')), 10000).then(()=>{
            driver.findElement(By.className('station-list'))
        })
        .then(() => done())
    });

    after(function(done) {
        driver.quit().then(() => done())
    });
});