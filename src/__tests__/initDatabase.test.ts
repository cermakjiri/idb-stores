import { z } from "zod";

import { initDatabase } from "../initDatabase";

(async () => {
	const getMyStore = initDatabase({
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

	const nightMode: boolean | undefined = await getMyStore("settings").get("nightMode");
	const username: string | undefined = await getMyStore("auth").get("username");
})();
