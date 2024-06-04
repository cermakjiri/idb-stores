import { z } from 'zod';

import { initIDB } from '../initIDB';

const getStore = initIDB({
    database: {
        name: 'test',
        version: 1,
    },
    storeSchemas: {
        notification: z.object({
            id: z.string(),
            message: z.literal('Hello'),
            read: z.boolean(),
        }),
    },
});

const notification = getStore('notification');

notification.get('message');
notification.clear();
notification.remove('read');
notification.set('id', '1');
notification.setMany({
    id: '1',
    message: 'Hello',
});
