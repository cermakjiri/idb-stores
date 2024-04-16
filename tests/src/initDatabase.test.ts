import { z } from "zod";

import { initIDB } from "../../src/initIDB";

export async function smokeTest() {
    console.log("Running smoke test...");

    const getMyStore = initIDB({
        database: {
            name: "my-database",
            version: 1,
        },

        storeSchemas: {
            auth: z.object({
                username: z.string().optional(),
            }),

            settings: z.object({
                nightMode: z.boolean().optional(),
            }),
        },
    });

    // Test settings store
    const settings = getMyStore("settings");

    console.assert(settings.name === "settings");

    console.assert((await settings.get("nightMode")) === undefined);

    await settings.set("nightMode", true);

    console.assert((await settings.get("nightMode")) === true);

    // Test auth store
    const auth = getMyStore("auth");

    console.assert((await auth.get("username")) === undefined);

    await auth.set("username", "alice");

    console.assert((await auth.get("username")) === "alice");

    // Should clear only auth store
    await auth.clear();
    console.assert((await auth.get("username")) === undefined);
    console.assert((await settings.get("nightMode")) === true);

    // Should remove nightMode from settings store
    await settings.remove("nightMode");
    console.assert((await settings.get("nightMode")) === undefined);
}
