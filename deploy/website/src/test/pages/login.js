const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');

module.exports = function(driver) {
    const elements = {
        usernameInput: By.css('#username'),
        passwordInput: By.css('#password'),
        loginButton: By.css('.login-btn'),
        registerButton: By.css('.register-btn'),
        forgotPassLink: By.css('.forgot-link'),
    };
    return {
        url:  'http://localhost:8000/user/login',
        elements: elements,
        waitUntilVisible: function() {
            return driver.wait(until.elementLocated(elements.usernameInput));
        },
        navigate: function() {
            driver.navigate().to(this.url);
            return this.waitUntilVisible();
        },
        enterUsername: function(value) {
            return driver.findElement(elements.usernameInput).sendKeys(value);
        },
        enterPassword: function(value){
            return driver.findElement(elements.passwordInput).sendKeys(value);
        },
        getUsername: function() {
            return driver.findElement(elements.usernameInput).getAttribute('value')
        },
        getPassword: function() {
            return driver.findElement(elements.passwordInput).getAttribute('value')
        },
        login: function() {
            return driver.findElement(elements.loginButton).click();
        },
        register: function(){
            return driver.findElement(elements.registerButton).click();
        },
        forgotPass: function(){
            return driver.findElement(elements.forgotPassLink).click();
        },
    };
};