/**
 * Universal Script Loader
 * Works in both Browser and Node.js environments.
 * @param {string} urlOrPath - URL (browser) or file path (Node.js) to load.
 * @returns {Promise<any>} Resolves when loaded, rejects on error.
 */
async function loadScriptUniversal(urlOrPath) {
    if (typeof urlOrPath !== "string" || !urlOrPath.trim()) {
        throw new Error("Invalid script URL or path");
    }

    // Detect environment
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (isBrowser) {
        // Browser: dynamically inject <script>
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = urlOrPath;
            script.async = true;

            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${urlOrPath}`));

            document.head.appendChild(script);
        });
    } else {
        // Node.js: dynamically import or require
        try {
            if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
                // Load remote script in Node.js
                const https = require("https");
                const vm = require("vm");

                return new Promise((resolve, reject) => {
                    https.get(urlOrPath, (res) => {
                        if (res.statusCode !== 200) {
                            return reject(new Error(`HTTP ${res.statusCode} for ${urlOrPath}`));
                        }
                        let data = "";
                        res.on("data", chunk => data += chunk);
                        res.on("end", () => {
                            try {
                                vm.runInThisContext(data, { filename: urlOrPath });
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        });
                    }).on("error", reject);
                });
            } else {
                // Local file
                return import(urlOrPath).catch(err => {
                    // Fallback for CommonJS
                    try {
                        require(urlOrPath);
                        return;
                    } catch (requireErr) {
                        throw requireErr;
                    }
                });
            }
        } catch (err) {
            throw new Error(`Failed to load script in Node.js: ${err.message}`);
        }
    }
}

// -------------------
// Example Usage
// -------------------
(async () => {
    try {
        if (typeof window !== "undefined") {
            // Browser example
            await loadScriptUniversal("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js");
            console.log("Lodash loaded in browser:", _.VERSION);
        } else {
            // Node.js example
            await loadScriptUniversal("https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js");
            console.log("Axios loaded in Node.js:", typeof axios);
        }
    } catch (err) {
        console.error(err);
    }
})();
