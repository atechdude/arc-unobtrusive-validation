# First Production Build
# arc-unobtrusive-validation-auto.js uses the default Form Subitter. While arc-unobtrusive-validation.js allows you to listen to the following. document.addEventListener('form-valid', function (event) {
    // This function will run when a form is valid.
    // User can handle AJAX submission or whatever they want here.
    const form = event.detail;
    console.log(form.name);
    if(form.name === "sign-in") {
        postFormAsync(form.action, new FormData(form.formElement), ".ajax-container");
    }
});

document.addEventListener('form-invalid', function (event) {
    // This function will run when a form is invalid.
    // User can handle error display or other logic here.
    const form = event.detail;
    console.log(form.formElement);
    // Error handling logic goes here.
});
# This is workign with no errors currently.
