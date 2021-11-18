"use strict";

module.exports = {
    name: "imageNative",
    // Relative paths to pages and components
    dashboard: [
        {
            // TODO: Not in production
            upload: ["development"],
            zip: "imageNative.zip",
            template: {
                format: "single_page_fullscreen",
                is_custom_creative: false,
                is_global: true,
                name: "Image Native",
                publisherWhitelist: [],
                status: "active"
            }
        }
    ],
    slack: [
        {
            name: "Image Native",
            zip: "imageNative.zip"
        }
    ],
    aws: [
        {
            upload: ["development"],
            name: "Image Native",
            zip: "imageNative.zip"
        }
    ]
};
