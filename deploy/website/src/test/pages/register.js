const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');

module.exports = function(driver) {
    const elements = {
        usernameInput: By.css('#username'),
        emailInput: By.css('#email'),
        passwordInput: By.css('#password'),
        confirmPassInput: By.css('#confirmPass'),
        registerButton: By.css('.submit-btn'),
        returnButton: By.css('.return-btn'),
    };
    return {
        url:  'http://localhost:8000/user/create',
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
        enterEmail: function(value){
            return driver.findElement(elements.emailInput).sendKeys(value);
        },
        enterPassword: function(value){
            return driver.findElement(elements.passwordInput).sendKeys(value);
        },
        enterConfirmPass: function(value){
            return driver.findElement(elements.confirmPassInput).sendKeys(value);
        },
        getUsername: function() {
            return driver.findElement(elements.usernameInput).getAttribute('value');
        },
        getEmail: function() {
            return driver.findElement(elements.emailInput).getAttribute('value');
        },
        getPassword: function() {
            return driver.findElement(elements.passwordInput).getAttribute('value');
        },
        getConfirmPass: function() {
            return driver.findElement(elements.confirmPassInput).getAttribute('value');
        },
        clearUsername: function(){
            return driver.findElement(elements.usernameInput).clear();
        },
        flushEmail: function(){
            return driver.findElement(elements.emailInput).sendKeys("value", '');
        },
        clearEmail: function(){
            return driver.findElement(elements.emailInput).clear();
        },
        clearPassword: function(){
            return driver.findElement(elements.passwordInput).clear();
        },
        clearConfirmPass: function(){
            return driver.findElement(elements.confirmPassInput).clear();
        },
        register: function(){
            return driver.findElement(elements.registerButton).click();
        },
        return: function(){
            return driver.findElement(elements.returnButton).click();
        },
    };
};