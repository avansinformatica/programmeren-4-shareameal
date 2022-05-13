function doSomething(callback) {
  setTimeout(() => {
    let result = 5;
    callback(result);
  }, 3000);
}

doSomething((myvalue) => {
  logger.debug("myvalue = " + myvalue);
});

logger.debug("Nu zijn we hier");
