# ARC Unobtrusive Validation

## Updates
Fixing a few issues with the FormSubmitters. Ideally things will work like this.
```html
<script>
    // The validation does not have to go in the DOMContentLoaded. Any async event or method will work..
    // The Validation Library Checks internally for state of the DOM.
	document.addEventListener('DOMContentLoaded', async (event) => {
        // Event for when a new Form is added to the FormManager:
        document.addEventListener("formAdded", function (e) {
            console.log("New form added:", e.detail);
        });
        const options = { autoInit:true,useDefaultFormSubmitter:false,debug:false }; 
		
        // Get the UnobtrusiveValidation class from the window object
        const UnobtrusiveValidation = window.arcvalidation;
		
        // Nothing works without an instance of the UnobtrusiveValidation class.
        // You will get no form validation!!
        const createAccountSubmitHandler = (formElement, isValid) => {
            if (isValid) {
                // Custom logic for a valid form
                console.log("Form is valid. Custom submission logic here.");
            } else {
                // Custom logic for handling validation errors
                console.log("Form is not valid. Handle errors here.");
            }
        };

        const signInSubmitHandler = (formElement, isValid) => {
            if (isValid) {
                // Custom logic for a valid form
                console.log("Form is valid. Custom submission logic here.");
            } else {
                // Custom logic for handling validation errors
                console.log("Form is not valid. Handle errors here.");
            }
        };
        
        // Create an instance, This will load all forms with data-val=true attributes.
        const validationInstance = await UnobtrusiveValidation.getInstance(options);
        
        // Add the custom submitHandlers. For forms that are not in the DOM yet we track the submitHandlers and apply then when the form decides to show up :)
        await validationInstance.setSubmitHandler("create-account", createAccountSubmitHandler);
        await validationInstance.setSubmitHandler("sign-in", signInSubmitHandler);
    })
</script>
```


ARC Unobtrusive Validation is a TypeScript-based library that integrates with ASP.NET MVC and Razor Pages to provide a streamlined client-side validation experience. It replaces the need for jQuery and jQuery unobtrusive validation scripts, allowing developers to perform validation against Data Annotations directly on the client side without extra dependencies.

## Motivation

Developed to replace the bulky jQuery and jQuery unobtrusive validation, ARC Unobtrusive Validation offers a modern, lightweight alternative for handling Data Annotations-based validation on the client side.

## Features

- **No jQuery Dependency**: Reduces the overall size of your application and removes the need for jQuery.
- **ASP.NET MVC and Razor Pages Compatibility**: Seamlessly works with server-side Data Annotations.
- **TypeScript-Based**: Leverages TypeScript for type safety and modern JavaScript features.
- **Browser Compatibility**: Transpiled with Webpack to ensure support across all modern browsers.
- **Ease of Integration**: Simple to incorporate into your ASP.NET projects with minimal setup.
- **Open Source**: Available for community contributions and custom enhancements.

## Getting Started

To integrate ARC Unobtrusive Validation into your project, simply include the transpiled JavaScript file in your application bundle. The library is designed to work out of the box with minimal configuration, making it an ideal choice for both new and existing ASP.NET applications.

## Why ARC Unobtrusive Validation?

ARC Unobtrusive Validation aims to provide developers with a modern validation tool that aligns with the latest web development standards. By moving away from jQuery, it ensures that your client-side validation is both efficient and up-to-date with current best practices.

## Contributing

Contributions are welcome! Feel free to submit issues, pull requests, or suggestions to help improve the library.

---
Demo Site and Documentation is coming.
For detailed documentation and setup instructions, please visit the [official documentation](#).

Happy validating!

