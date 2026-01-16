import { KoaContainerApp } from '../src/app';

test('KoaContainerApp', () => {
    expect(
        (function () {
            let app = new KoaContainerApp();
            console.log(app);
        })()
    );
});
