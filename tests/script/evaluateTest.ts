enum Pathnames {
    Success = '/success',
    Failure = '/failure',
}

export async function evaluateTest(test: () => Promise<void>) {
    if (Object.values(Pathnames).includes(window.location.pathname as Pathnames)) {
        return;
    }

    const url = new URL(window.location.href);

    try {
        await test();

        console.log('🟢 Smoke test passed!');

        url.pathname = Pathnames.Success;
    } catch (error) {
        console.error('🔴 Smoke test failed:', error);

        url.pathname = Pathnames.Failure;
        url.searchParams.set('error', (error as Error).toString());
    }

    window.location.assign(url);
}
